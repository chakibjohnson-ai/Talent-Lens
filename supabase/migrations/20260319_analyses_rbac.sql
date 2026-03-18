-- Migration: analyses tabel + RBAC + admin rol voor c.johnson@morgangreen.nl
-- Date: 2026-03-19

-- ── 1. Tabel ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.analyses (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL    DEFAULT now(),
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  type        text        NOT NULL    CHECK (type IN ('linkedin', 'indeed', 'cv', 'vacature')),
  data        jsonb       NOT NULL    DEFAULT '{}',
  session_id  text
);

-- Index voor snelle user-queries op recente analyses
CREATE INDEX IF NOT EXISTS analyses_user_id_created_idx
  ON public.analyses (user_id, created_at DESC);

-- ── 2. Row Level Security ────────────────────────────────────────────────────
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Admin: volledige toegang op basis van JWT custom claim (app_metadata.user_role)
CREATE POLICY "Admin full access" ON public.analyses
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'user_role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'user_role') = 'admin');

-- Reguliere gebruikers: alleen eigen rijen
CREATE POLICY "Users own analyses" ON public.analyses
  FOR ALL TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 3. Admin metadata: c.johnson@morgangreen.nl ─────────────────────────────
-- Voegt { "user_role": "admin" } toe aan app_metadata.
-- Dit maakt de JWT custom claim beschikbaar via auth.jwt() ->> 'user_role'.
-- Vereist een nieuwe login (token refresh) om effect te hebben in de client.
UPDATE auth.users
SET raw_app_meta_data =
  COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"user_role": "admin"}'::jsonb
WHERE email = 'c.johnson@morgangreen.nl';
