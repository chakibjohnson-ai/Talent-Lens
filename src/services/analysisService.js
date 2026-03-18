import { z } from 'zod';
import { supabase } from '../lib/supabaseClient';

// lockAnalysis re-export vanuit schemas (single import point voor components)
export { lockAnalysis } from '../schemas/analysis';

// ── Zod sub-schema's ─────────────────────────────────────────────────────────
const SkillItem = z.union([
  z.string(),
  z.object({
    item:             z.string(),
    related_vertical: z.string().nullable().optional(),
    reasoning:        z.string().nullable().optional(),
  }),
]);

const VerticalItem = z.union([
  z.string(),
  z.object({
    item:      z.string(),
    reasoning: z.string().nullable().optional(),
  }),
]);

// ── Hoofd-schema ─────────────────────────────────────────────────────────────
export const AnalysisSchema = z.object({
  type:       z.enum(['linkedin', 'indeed', 'cv', 'vacature']),
  session_id: z.string().optional(),
  source_url: z.string().url().optional().nullable(),
  location:   z.string().optional().nullable(),
  data: z.object({
    name:                    z.string().nullable().optional(),
    current_role:            z.string().nullable().optional(),
    location:                z.string().nullable().optional(),
    total_years_experience:  z.number().nullable().optional(),
    general_comments:        z.string().nullable().optional(),
    matched_skills:          z.array(SkillItem).optional().default([]),
    suggested_skills:        z.array(SkillItem).optional().default([]),
    matched_verticals:       z.array(VerticalItem).optional().default([]),
    suggested_verticals:     z.array(VerticalItem).optional().default([]),
    matched_roles:           z.array(z.any()).optional().default([]),
    suggested_roles:         z.array(z.any()).optional().default([]),
    matched_industries:      z.array(z.any()).optional().default([]),
    suggested_industries:    z.array(z.any()).optional().default([]),
    contact: z.object({
      email:        z.string().nullable().optional(),
      phone:        z.string().nullable().optional(),
      linkedin_url: z.string().nullable().optional(),
    }).optional(),
  }),
});

// ── Helper: valideer payload en sla op in analyses tabel ─────────────────────
/**
 * Valideert `payload` via AnalysisSchema en voert bij succes een INSERT uit.
 * @param {{ type: string, data: object, session_id?: string }} payload
 * @returns {{ ok: boolean, error?: object }}
 */
export async function validateAndSaveAnalysis(payload) {
  const parsed = AnalysisSchema.safeParse(payload);
  if (!parsed.success) {
    console.warn('[TL] validateAndSaveAnalysis: validatie mislukt', parsed.error.issues);
    return { ok: false, error: parsed.error };
  }

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id || null;

  const { error } = await supabase
    .from('analyses')
    .insert({
      user_id:    userId,
      type:       parsed.data.type,
      data:       parsed.data.data,
      session_id: parsed.data.session_id || null,
      source_url: parsed.data.source_url || null,
      location:   parsed.data.location   || null,
    });

  if (error) {
    console.warn('[TL] analyses insert fout:', error.message);
    return { ok: false, error };
  }
  return { ok: true };
}

// ── Haal alle analyses op (max 50, meest recent eerst) ───────────────────────
/**
 * Zet DB-rijen om naar het zelfde shape als lokale history-items.
 * @returns {Array<object>}
 */
export async function fetchAllAnalyses() {
  const { data, error } = await supabase
    .from('analyses')
    .select('id, created_at, type, data, is_locked')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.warn('[TL] fetchAllAnalyses fout:', error.message);
    return [];
  }

  return (data || []).map(row => ({
    key:       row.id,
    ...row.data,
    savedAt:   new Date(row.created_at).getTime(),
    source:    row.type,
    is_locked: row.is_locked ?? false,
  }));
}

// ── Haal de meest recente analyse op ────────────────────────────────────────
export async function fetchRecentAnalysis() {
  const { data, error } = await supabase
    .from('analyses')
    .select('id, created_at, type, data, is_locked')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return {
    key:       data.id,
    ...data.data,
    savedAt:   new Date(data.created_at).getTime(),
    source:    data.type,
    is_locked: data.is_locked ?? false,
  };
}
