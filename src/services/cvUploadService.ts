/**
 * cvUploadService.ts
 *
 * Verantwoordelijk voor de volledige asynchrone CV-upload pipeline:
 *  1. Bestandsvalidatie (type + grootte)
 *  2. Upload naar Supabase Storage bucket 'resumes'
 *  3. Aanmaken van een cv_analysis_jobs record
 *  4. Realtime subscription voor statuswijzigingen
 */

import { supabase } from '../lib/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type JobStatus = 'pending' | 'processing' | 'completed' | 'error';

/** Gestructureerd CV-analyse resultaat zoals de backend dit teruggeeft. */
export interface CvAnalysisResult {
  korte_samenvatting: string | null;
  werkervaring_jaren: number | null;
  opleidingen: string[];
  talen: string[];
  hard_skills: string[];
  soft_skills: string[];
}

/** Volledige rij uit de cv_analysis_jobs tabel. */
export interface CvAnalysisJob {
  id: string;
  user_id: string;
  file_path: string;
  file_name: string;
  status: JobStatus;
  result_data: CvAnalysisResult | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Constanten ───────────────────────────────────────────────────────────────

const BUCKET = 'resumes';

const ALLOWED_MIME_TYPES = new Set<string>([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// ─── Upload + Job aanmaken ────────────────────────────────────────────────────

/**
 * Valideert het bestand, uploadt het naar Supabase Storage en maakt
 * een cv_analysis_jobs record aan met status 'pending'.
 *
 * @throws {Error} bij ongeldig type, te groot bestand, upload- of DB-fout
 */
export async function uploadAndCreateJob(
  file: File,
  userId: string,
): Promise<CvAnalysisJob> {
  // ── Validatie ──────────────────────────────────────────────────────────────
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(
      `Ongeldig bestandstype: "${file.type}". Gebruik PDF of DOCX.`,
    );
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `"${file.name}" is ${(file.size / 1_048_576).toFixed(1)}MB — maximaal 5MB toegestaan.`,
    );
  }

  // ── Pad: resumes/{userId}/{timestamp}_{sanitizedFilename} ─────────────────
  const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${userId}/${Date.now()}_${sanitized}`;

  // ── Upload naar Storage ────────────────────────────────────────────────────
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadErr) {
    throw new Error(`Upload mislukt voor "${file.name}": ${uploadErr.message}`);
  }

  // ── Job record aanmaken ────────────────────────────────────────────────────
  const { data: job, error: jobErr } = await supabase
    .from('cv_analysis_jobs')
    .insert({
      user_id: userId,
      file_path: filePath,
      file_name: file.name,
      status: 'pending',
    })
    .select()
    .single();

  if (jobErr || !job) {
    // Ruim het geüploade bestand op zodat de bucket niet vervuild raakt
    await supabase.storage.from(BUCKET).remove([filePath]).catch(() => null);
    throw new Error(
      `Kon analyse-job niet aanmaken: ${jobErr?.message ?? 'onbekende fout'}`,
    );
  }

  return job as CvAnalysisJob;
}

// ─── Realtime Subscription ────────────────────────────────────────────────────

/**
 * Abonneert op UPDATE-events van cv_analysis_jobs voor de gegeven jobIds.
 * Roept `onUpdate` aan zodra een job wijzigt (status, result_data, error_message).
 *
 * @returns RealtimeChannel — bewaar dit om later mee uit te schrijven via unsubscribeFromJobs()
 */
export function subscribeToJobs(
  userId: string,
  jobIds: string[],
  onUpdate: (job: CvAnalysisJob) => void,
): RealtimeChannel {
  const jobIdSet = new Set(jobIds);

  const channel = supabase
    .channel(`cv_jobs_${userId}_${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'cv_analysis_jobs',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const updated = payload.new as CvAnalysisJob;
        if (jobIdSet.has(updated.id)) {
          onUpdate(updated);
        }
      },
    )
    .subscribe();

  return channel;
}

/**
 * Verwijdert een Realtime-abonnement en maakt de websocket-resources vrij.
 */
export function unsubscribeFromJobs(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}
