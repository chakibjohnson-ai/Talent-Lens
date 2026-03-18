-- Migration: maak 'company-assets' storage bucket aan voor bedrijfslogo's
-- Idempotent: ON CONFLICT DO NOTHING

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-assets',
  'company-assets',
  true,                         -- publieke bucket: logo's zijn zichtbaar zonder auth-header
  2097152,                      -- max 2 MB per bestand
  ARRAY['image/png','image/jpeg','image/webp','image/gif','image/svg+xml','image/x-icon','image/vnd.microsoft.icon']
)
ON CONFLICT (id) DO NOTHING;

-- Geauthenticeerde gebruikers mogen logo's inzien (ook gedekt door public=true, maar expliciet is beter)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'company-assets: authenticated read'
  ) THEN
    CREATE POLICY "company-assets: authenticated read"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (bucket_id = 'company-assets');
  END IF;
END $$;

-- Edge function (service role) mag uploaden
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'company-assets: service role insert'
  ) THEN
    CREATE POLICY "company-assets: service role insert"
      ON storage.objects FOR INSERT
      TO service_role
      WITH CHECK (bucket_id = 'company-assets');
  END IF;
END $$;

-- Edge function mag ook overschrijven (upsert = UPDATE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'company-assets: service role update'
  ) THEN
    CREATE POLICY "company-assets: service role update"
      ON storage.objects FOR UPDATE
      TO service_role
      USING (bucket_id = 'company-assets');
  END IF;
END $$;
