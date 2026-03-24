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
import type { CvAnalysisJobRow, CvAnalysisJobInsert } from '../types/database.types';

// ─── Re-exports voor backward-compat ─────────────────────────────────────────
export type { JobStatus, CvAnalysisResult, ExtractedSkills } from '../types/database.types';

/** Volledige rij uit de cv_analysis_jobs tabel (alias voor leesbaarheid in componenten). */
export type CvAnalysisJob = CvAnalysisJobRow;

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
 * Pad-schema (workspace-mode): resumes/{workspaceId}/{timestamp}_{filename}
 * Pad-schema (legacy):         resumes/{userId}/{timestamp}_{filename}
 *
 * @param file        Het te uploaden bestand (PDF of DOCX, max 5MB)
 * @param userId      auth.uid() van de ingelogde gebruiker
 * @param workspaceId UUID van de workspace; indien opgegeven wordt de workspace-structuur gebruikt
 * @throws {Error}    Bij ongeldig type, te groot bestand, upload- of DB-fout
 */
export async function uploadAndCreateJob(
  file: File,
  userId: string,
  workspaceId?: string,
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

  // ── Pad: resumes/{workspaceId|userId}/{timestamp}_{sanitizedFilename} ──────
  const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  if (sanitized.includes('..') || sanitized.includes('/') || sanitized.includes('\\')) {
    throw new Error(`Ongeldige bestandsnaam: "${file.name}".`);
  }
  const folder    = workspaceId ?? userId;
  const filePath  = `${folder}/${Date.now()}_${sanitized}`;

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
  const insertPayload: CvAnalysisJobInsert = {
    user_id:      userId,
    workspace_id: workspaceId ?? null,
    file_path:    filePath,
    file_name:    file.name,
    status:       'pending',
  };

  const { data: job, error: jobErr } = await supabase
    .from('cv_analysis_jobs')
    .insert(insertPayload)
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
 * Filtert op workspace_id indien opgegeven, anders op user_id (legacy).
 * Roept `onUpdate` aan zodra een job wijzigt (status, result_data, etc.).
 *
 * @param userId      auth.uid() — altijd vereist voor channel-naam
 * @param jobIds      Array van job-UUIDs waarop gefilterd wordt
 * @param onUpdate    Callback met de bijgewerkte CvAnalysisJob
 * @param workspaceId Optioneel: filter op workspace_id in plaats van user_id
 * @returns RealtimeChannel — bewaar dit om later mee uit te schrijven via unsubscribeFromJobs()
 */
export function subscribeToJobs(
  userId: string,
  jobIds: string[],
  onUpdate: (job: CvAnalysisJob) => void,
  workspaceId?: string,
): RealtimeChannel {
  const jobIdSet = new Set(jobIds);
  const filter   = workspaceId
    ? `workspace_id=eq.${workspaceId}`
    : `user_id=eq.${userId}`;

  const channel = supabase
    .channel(`cv_jobs_${workspaceId ?? userId}_${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'cv_analysis_jobs',
        filter,
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
