-- ═══════════════════════════════════════════════════════════════════════════════
-- TalentLens — Asynchrone CV-analyse pipeline
-- Migration: 20260320_cv_analysis_jobs.sql
--
-- Uitvoervolgorde:
--   1. Storage bucket 'resumes' + strikte RLS
--   2. Tabel cv_analysis_jobs + RLS
--   3. Realtime publicatie activeren
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1a. Storage bucket aanmaken ────────────────────────────────────────────────
--   public = false  →  geen publieke URLs
--   allowed_mime_types beperkt tot PDF + DOCX
--   file_size_limit = 5MB (5 * 1024 * 1024 bytes)
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'resumes',
  'resumes',
  false,
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  5242880
)
ON CONFLICT (id) DO NOTHING;

-- ── 1b. RLS policies voor 'resumes' bucket ────────────────────────────────────
--   Pad-conventie: resumes/{user_id}/{timestamp}_{filename}
--   (storage.foldername(name))[1] geeft het eerste pad-segment terug

-- Upload: alleen ingelogde eigenaar mag in zijn eigen folder uploaden
CREATE POLICY "resumes_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Lezen: eigenaar mag zijn eigen bestanden ophalen
CREATE POLICY "resumes_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Verwijderen: eigenaar mag zijn eigen bestanden verwijderen
CREATE POLICY "resumes_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── 2a. Tabel cv_analysis_jobs ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cv_analysis_jobs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path     TEXT        NOT NULL,                        -- resumes/{userId}/...
  file_name     TEXT        NOT NULL,                        -- originele bestandsnaam
  status        TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  result_data   JSONB,                                       -- JSON van het CV-analyse resultaat
  error_message TEXT,                                        -- foutmelding als status = 'error'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index: snelle ophaling per user + status + datum
CREATE INDEX IF NOT EXISTS idx_cv_jobs_user_status
  ON public.cv_analysis_jobs (user_id, status, created_at DESC);

-- ── 2b. Auto-update updated_at ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_cv_jobs_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cv_jobs_updated_at ON public.cv_analysis_jobs;
CREATE TRIGGER trg_cv_jobs_updated_at
  BEFORE UPDATE ON public.cv_analysis_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_cv_jobs_updated_at();

-- ── 2c. RLS voor cv_analysis_jobs ────────────────────────────────────────────
ALTER TABLE public.cv_analysis_jobs ENABLE ROW LEVEL SECURITY;

-- INSERT: client mag alleen een job aanmaken met zijn eigen user_id
CREATE POLICY "cv_jobs_insert_own"
  ON public.cv_analysis_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- SELECT: client leest alleen zijn eigen jobs
CREATE POLICY "cv_jobs_select_own"
  ON public.cv_analysis_jobs FOR SELECT
  USING (auth.uid() = user_id);

-- UPDATE/DELETE: GEEN client-policy → alleen de backend (service_role) mag updaten
-- Dit voorkomt dat een client zijn eigen jobstatus kan manipuleren.

-- ── 3. Realtime activeren ─────────────────────────────────────────────────────
-- Zorgt ervoor dat de Supabase JS client UPDATE-events ontvangt via websocket.
ALTER PUBLICATION supabase_realtime ADD TABLE public.cv_analysis_jobs;
