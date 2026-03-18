-- supabase/migrations/20260318c_app_assets_storage.sql
-- app-assets bucket: publieke leestoegang, schrijftoegang alleen voor org-/team-admins.
--
-- NB: De bucket zelf bestaat al en is publiek. Dit script voegt alleen RLS-policies toe.
-- Deploy: supabase db push  (of plak in Supabase SQL editor)

-- ── Verwijder eventueel conflicterende policies ──────────────────────────────
DROP POLICY IF EXISTS "app_assets_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "app_assets_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "app_assets_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "app_assets_admin_delete" ON storage.objects;

-- ── SELECT: iedereen mag lezen (bucket is publiek) ───────────────────────────
CREATE POLICY "app_assets_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'app-assets');

-- ── INSERT: alleen org_admin of team_admin ───────────────────────────────────
CREATE POLICY "app_assets_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'app-assets'
    AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid()
        AND (up.is_org_admin = true OR up.is_team_admin = true)
    )
  );

-- ── UPDATE: alleen org_admin of team_admin ───────────────────────────────────
CREATE POLICY "app_assets_admin_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'app-assets'
    AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid()
        AND (up.is_org_admin = true OR up.is_team_admin = true)
    )
  );

-- ── DELETE: alleen org_admin of team_admin ───────────────────────────────────
CREATE POLICY "app_assets_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'app-assets'
    AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid()
        AND (up.is_org_admin = true OR up.is_team_admin = true)
    )
  );
