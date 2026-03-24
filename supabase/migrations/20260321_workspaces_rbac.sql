-- ═══════════════════════════════════════════════════════════════════════════════
-- TalentLens — Workspaces, RBAC & Blind Hiring uitbreiding
-- Migration: 20260321_workspaces_rbac.sql
--
-- Uitvoervolgorde:
--   1. ENUM type workspace_role
--   2. Tabel workspaces
--   3. Koppeltabel workspace_members
--   4. Helper-functies voor RLS (is_workspace_member / is_workspace_admin)
--   5. RLS policies workspaces & workspace_members
--   6. cv_analysis_jobs uitbreiden (workspace_id + LLM-kolommen)
--   7. RLS op cv_analysis_jobs vervangen door workspace-bewuste policies
--   8. Storage bucket 'resumes' policies herschrijven naar workspace_id pad
-- ═══════════════════════════════════════════════════════════════════════════════


-- ── 1. Role-enum ──────────────────────────────────────────────────────────────
-- Gebruik DO-block zodat de migratie idempotent is (ON CONFLICT werkt niet voor types).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workspace_role') THEN
    CREATE TYPE public.workspace_role AS ENUM ('member', 'admin', 'platform_admin');
  END IF;
END;
$$;


-- ── 2. Tabel: workspaces ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workspaces (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;


-- ── 3. Koppeltabel: workspace_members ─────────────────────────────────────────
--   PK is (workspace_id, user_id) → één rol per gebruiker per workspace.
CREATE TABLE IF NOT EXISTS public.workspace_members (
  workspace_id UUID                  NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id      UUID                  NOT NULL REFERENCES auth.users(id)        ON DELETE CASCADE,
  role         public.workspace_role NOT NULL DEFAULT 'member',
  joined_at    TIMESTAMPTZ           NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

-- Index: snel opzoeken welke workspaces een gebruiker heeft
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id
  ON public.workspace_members (user_id);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;


-- ── 4. Helper-functies voor RLS ───────────────────────────────────────────────
--   SECURITY DEFINER + search_path vastpinnen = veilig tegen privilege-escalation.
--   STABLE = Postgres mag het resultaat cachen binnen één query.

CREATE OR REPLACE FUNCTION public.is_workspace_member(p_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.workspace_id = p_workspace_id
      AND wm.user_id      = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_admin(p_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.workspace_id = p_workspace_id
      AND wm.user_id      = auth.uid()
      AND wm.role         IN ('admin', 'platform_admin')
  );
$$;


-- ── 5a. RLS policies: workspaces ─────────────────────────────────────────────

-- Leden zien hun eigen workspaces
CREATE POLICY "workspaces_select_member"
  ON public.workspaces FOR SELECT
  USING (public.is_workspace_member(id));

-- Alleen admins mogen workspace-naam etc. aanpassen
CREATE POLICY "workspaces_update_admin"
  ON public.workspaces FOR UPDATE
  USING (public.is_workspace_admin(id));

-- Aanmaken van een workspace: elke ingelogde gebruiker (owner wordt daarna via trigger lid)
CREATE POLICY "workspaces_insert_authenticated"
  ON public.workspaces FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');


-- ── 5b. RLS policies: workspace_members ─────────────────────────────────────

-- Leden mogen zien wie er nog meer in de workspace zit
CREATE POLICY "workspace_members_select_member"
  ON public.workspace_members FOR SELECT
  USING (public.is_workspace_member(workspace_id));

-- Alleen admins mogen leden toevoegen
CREATE POLICY "workspace_members_insert_admin"
  ON public.workspace_members FOR INSERT
  WITH CHECK (public.is_workspace_admin(workspace_id));

-- Alleen admins mogen leden verwijderen (zichzelf verwijderen = ook geblokkeerd via admin-check)
CREATE POLICY "workspace_members_delete_admin"
  ON public.workspace_members FOR DELETE
  USING (public.is_workspace_admin(workspace_id));

-- Alleen admins mogen rollen aanpassen
CREATE POLICY "workspace_members_update_admin"
  ON public.workspace_members FOR UPDATE
  USING (public.is_workspace_admin(workspace_id));


-- ── 5c. Trigger: workspace-aanmaker wordt automatisch admin ──────────────────
CREATE OR REPLACE FUNCTION public.add_workspace_creator_as_admin()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, auth.uid(), 'admin')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_workspace_creator_admin ON public.workspaces;
CREATE TRIGGER trg_workspace_creator_admin
  AFTER INSERT ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.add_workspace_creator_as_admin();


-- ── 6. cv_analysis_jobs uitbreiden ────────────────────────────────────────────
--   workspace_id: nullable FK (backward-compatible — bestaande rijen met alleen user_id blijven geldig).
--   anonymized_text: CV-tekst na PII-verwijdering (voor Blind Hiring).
--   match_score: 0-100 match-percentage t.o.v. een vacature.
--   extracted_skills: gestructureerde skills na LLM-extractie (object of array).

ALTER TABLE public.cv_analysis_jobs
  ADD COLUMN IF NOT EXISTS workspace_id     UUID    REFERENCES public.workspaces(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS anonymized_text  TEXT,
  ADD COLUMN IF NOT EXISTS match_score      INTEGER CHECK (match_score IS NULL OR (match_score BETWEEN 0 AND 100)),
  ADD COLUMN IF NOT EXISTS extracted_skills JSONB;

-- Samengestelde index voor workspace-queries (partial: alleen rijen mét workspace_id)
CREATE INDEX IF NOT EXISTS idx_cv_jobs_workspace_status
  ON public.cv_analysis_jobs (workspace_id, status, created_at DESC)
  WHERE workspace_id IS NOT NULL;


-- ── 7. RLS op cv_analysis_jobs vervangen ─────────────────────────────────────
--   Oud: enkelvoudige user_id-check.
--   Nieuw: workspace-lid check MET fallback voor legacy-rijen (workspace_id IS NULL).

DROP POLICY IF EXISTS "cv_jobs_insert_own"   ON public.cv_analysis_jobs;
DROP POLICY IF EXISTS "cv_jobs_select_own"   ON public.cv_analysis_jobs;

-- INSERT: workspace-lid mag een job aanmaken in zijn workspace, of eigenaar voor legacy
CREATE POLICY "cv_jobs_insert_workspace"
  ON public.cv_analysis_jobs FOR INSERT
  WITH CHECK (
    (workspace_id IS NOT NULL AND public.is_workspace_member(workspace_id))
    OR
    (workspace_id IS NULL AND auth.uid() = user_id)
  );

-- SELECT: workspace-lid mag alle jobs in zijn workspace zien (voor team-overzichten)
CREATE POLICY "cv_jobs_select_workspace"
  ON public.cv_analysis_jobs FOR SELECT
  USING (
    (workspace_id IS NOT NULL AND public.is_workspace_member(workspace_id))
    OR
    (workspace_id IS NULL AND auth.uid() = user_id)
  );

-- UPDATE/DELETE: uitsluitend de backend (service_role) — geen client-policy nodig.


-- ── 8. Storage bucket 'resumes' — policies herschrijven ──────────────────────
--   Nieuw pad-schema: resumes/{workspace_id}/{timestamp}_{filename}
--   (storage.foldername(name))[1] geeft het eerste pad-segment terug.
--   We casten dit naar UUID en laten is_workspace_member/is_workspace_admin controleren.
--
--   OPMERKING: Bestaande bestanden onder resumes/{user_id}/... zijn niet meer
--   bereikbaar via de nieuwe policies. Migreer bestaande bestanden handmatig
--   of voeg een tijdelijke overlappings-policy toe als backward-compat vereist is.

DROP POLICY IF EXISTS "resumes_insert_own"  ON storage.objects;
DROP POLICY IF EXISTS "resumes_select_own"  ON storage.objects;
DROP POLICY IF EXISTS "resumes_delete_own"  ON storage.objects;

-- Upload: alleen workspace-leden mogen in hun workspace-folder uploaden
CREATE POLICY "resumes_insert_workspace_member"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
    AND public.is_workspace_member(
          (storage.foldername(name))[1]::UUID
        )
  );

-- Lezen: alle workspace-leden mogen bestanden in hun workspace ophalen
CREATE POLICY "resumes_select_workspace_member"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes'
    AND public.is_workspace_member(
          (storage.foldername(name))[1]::UUID
        )
  );

-- Verwijderen: alleen workspace-admins mogen bestanden verwijderen
CREATE POLICY "resumes_delete_workspace_admin"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resumes'
    AND public.is_workspace_admin(
          (storage.foldername(name))[1]::UUID
        )
  );
