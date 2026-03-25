-- ============================================================
-- Migration: 20260324_candidates_enrichment_rls.sql
--
-- Doel:
--   1. Voeg enrichment-kolommen toe aan de candidates tabel
--      (Mapbox reistijd, Brandfetch logo, Adzuna salaris)
--   2. Schakel RLS in op candidates
--   3. Definieer strikte RLS-policies (SELECT/INSERT/UPDATE/DELETE)
--      op basis van recruiter_id = auth.uid()
--
-- Idempotent: alle ADD COLUMN en CREATE POLICY gebruiken IF NOT EXISTS.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Enrichment-kolommen (idempotent)
-- ------------------------------------------------------------

-- travel_time: JSONB { duration_minutes, distance_km, mode }
ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS travel_time JSONB DEFAULT NULL;

-- company_logo_url: publieke CDN-URL (Brandfetch / Clearbit)
ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS company_logo_url TEXT DEFAULT NULL;

-- salary_indication: JSONB { min_gross_annual, max_gross_annual, currency, source }
ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS salary_indication JSONB DEFAULT NULL;

-- recruiter_id: eigenaar van de kandidaat (koppeling aan auth.users)
-- Alleen toevoegen als de kolom nog niet bestaat.
-- Als jouw tabel al een 'user_id' of ander ownership-veld gebruikt, pas dit aan.
ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS recruiter_id UUID DEFAULT NULL
  REFERENCES auth.users(id) ON DELETE SET NULL;

-- updated_at: automatisch bijgewerkt bij elke UPDATE
ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NULL;

-- Trigger om updated_at automatisch bij te werken
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_candidates_updated_at ON public.candidates;
CREATE TRIGGER trg_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- 2. Row Level Security inschakelen
-- ------------------------------------------------------------

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 3. RLS Policies
--
-- Principe: een recruiter ziet en beheert ALLEEN zijn eigen kandidaten.
-- De backend (service role) bypast RLS volledig — geen policy nodig.
-- ------------------------------------------------------------

-- Verwijder eventueel verouderde policies zodat we idempotent zijn
DROP POLICY IF EXISTS "View own candidates"   ON public.candidates;
DROP POLICY IF EXISTS "Insert own candidates" ON public.candidates;
DROP POLICY IF EXISTS "Update own candidates" ON public.candidates;
DROP POLICY IF EXISTS "Delete own candidates" ON public.candidates;

-- SELECT: kandidaat is zichtbaar als recruiter_id overeenkomt met de ingelogde gebruiker
CREATE POLICY "View own candidates"
  ON public.candidates
  FOR SELECT
  USING (auth.uid() = recruiter_id);

-- INSERT: recruiter mag alleen kandidaten aanmaken op zijn eigen naam
CREATE POLICY "Insert own candidates"
  ON public.candidates
  FOR INSERT
  WITH CHECK (auth.uid() = recruiter_id);

-- UPDATE: recruiter mag alleen zijn eigen kandidaten bewerken
CREATE POLICY "Update own candidates"
  ON public.candidates
  FOR UPDATE
  USING (auth.uid() = recruiter_id)
  WITH CHECK (auth.uid() = recruiter_id);

-- DELETE: recruiter mag alleen zijn eigen kandidaten verwijderen
CREATE POLICY "Delete own candidates"
  ON public.candidates
  FOR DELETE
  USING (auth.uid() = recruiter_id);

-- ------------------------------------------------------------
-- 4. Index voor snellere RLS-queries
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_candidates_recruiter_id
  ON public.candidates (recruiter_id);

-- ------------------------------------------------------------
-- Verificatie (uitvoeren na migratie om te controleren)
-- ------------------------------------------------------------
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'candidates'
-- ORDER BY ordinal_position;
--
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'candidates';
