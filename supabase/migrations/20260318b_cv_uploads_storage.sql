-- ═══════════════════════════════════════════════════════════════════════════
-- TalentLens — CV Uploads Storage Bucket + RLS
-- Uitvoeren in Supabase SQL Editor NADAT je de bucket aangemaakt hebt via:
--   Supabase Dashboard → Storage → New bucket → "cv_uploads" (private)
-- ═══════════════════════════════════════════════════════════════════════════

-- Supabase Storage buckets worden aangemaakt via de Dashboard of de Management API,
-- niet via SQL. Voer daarna onderstaande RLS policies uit.

-- ── 1. RLS inschakelen op storage.objects (standaard al aan) ────────────────
-- Supabase doet dit automatisch. Geen actie nodig.

-- ── 2. Upload policy — alleen ingelogde eigenaar mag uploaden ───────────────
-- Pad-conventie: cv_uploads/{user_id}/{bestandsnaam}
CREATE POLICY "cv_uploads_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cv_uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── 3. Read policy — alleen de eigenaar mag zijn eigen bestanden lezen ──────
CREATE POLICY "cv_uploads_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'cv_uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── 4. Delete policy — eigenaar mag eigen bestanden verwijderen ─────────────
CREATE POLICY "cv_uploads_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'cv_uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── Instructies voor bucket aanmaken via Management API ─────────────────────
-- curl -X POST 'https://api.supabase.com/v1/projects/cebpwkavlxipkrqixbab/storage/buckets' \
--   -H 'Authorization: Bearer <service_role_key>' \
--   -H 'Content-Type: application/json' \
--   -d '{"id":"cv_uploads","name":"cv_uploads","public":false}'
