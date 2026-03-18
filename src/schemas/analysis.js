/**
 * src/schemas/analysis.js
 * Zod-schema's voor analyse-types + lockAnalysis helper.
 * Aangemaakt als .js (project gebruikt geen TypeScript config).
 */
import { z } from 'zod';
import { supabase } from '../lib/supabaseClient';

// ── Vacature-analyse schema ──────────────────────────────────────────────────
export const VacancyAnalysisSchema = z.object({
  /** Gestructureerde locatie-informatie */
  location: z.object({
    city:   z.string().nullable(),
    region: z.string().nullable(),
    type:   z.enum(['city', 'region', 'remote', 'unknown']),
  }),

  /** Bedrijfsinformatie */
  company: z.object({
    name:     z.string(),
    logo_url: z.string().url().nullable(),
  }),
});

// ── Boolean/Frontsheet schema ────────────────────────────────────────────────
export const BooleanFrontsheetSchema = z.object({
  /** De volledige Boolean zoekstring, bijv. "(Java OR Python) AND Senior" */
  queryString: z.string().min(1, 'queryString is verplicht'),

  /** Filtercriteria die op de zoekopdracht zijn toegepast */
  filters: z.object({
    verticals:      z.array(z.string()).optional().default([]),
    roles:          z.array(z.string()).optional().default([]),
    locations:      z.array(z.string()).optional().default([]),
    experience_min: z.number().nullable().optional(),
    experience_max: z.number().nullable().optional(),
    keywords:       z.array(z.string()).optional().default([]),
  }),

  /** Versienummer van het schema of de query, bijv. "1.0" of "2.3" */
  version: z.string().min(1, 'version is verplicht'),

  /** Optionele metadata */
  title:       z.string().optional(),
  description: z.string().optional(),
  created_by:  z.string().optional(),
});

// ── lockAnalysis: vergrendel een analyse na succesvolle opslag ───────────────
/**
 * Zet is_locked = true voor een analyse-record.
 * Werkt alleen als de gebruiker eigenaar is én het record nog niet vergrendeld is
 * (afgedwongen door de RLS "Users update unlocked" policy).
 *
 * @param {string} id  - UUID van het analyses-record
 * @returns {{ ok: boolean, error?: object }}
 */
export async function lockAnalysis(id) {
  const { error } = await supabase
    .from('analyses')
    .update({ is_locked: true })
    .eq('id', id);

  if (error) {
    console.warn('[TL] lockAnalysis fout:', error.message);
    return { ok: false, error };
  }
  return { ok: true };
}
