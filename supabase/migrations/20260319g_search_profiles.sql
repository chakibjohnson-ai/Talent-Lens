-- ============================================================
-- Profile Scout: search_profiles tabel
-- Uitvoeren in: Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.search_profiles (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  raw_query       text        NOT NULL,
  structured_data jsonb       NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Index op user_id + created_at voor snelle lookups per gebruiker
CREATE INDEX IF NOT EXISTS idx_search_profiles_user_created
  ON public.search_profiles (user_id, created_at DESC);

-- GIN index op structured_data voor jsonb queries (optioneel, voor toekomstige filtering)
CREATE INDEX IF NOT EXISTS idx_search_profiles_data_gin
  ON public.search_profiles USING gin (structured_data);

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE public.search_profiles ENABLE ROW LEVEL SECURITY;

-- Gebruiker mag alleen eigen rijen zien
CREATE POLICY "search_profiles: eigen rijen lezen"
  ON public.search_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Gebruiker mag alleen eigen rijen invoegen
CREATE POLICY "search_profiles: eigen rijen invoegen"
  ON public.search_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Gebruiker mag eigen rijen verwijderen
CREATE POLICY "search_profiles: eigen rijen verwijderen"
  ON public.search_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Admin heeft volledige toegang (zelfde patroon als analyses tabel)
CREATE POLICY "search_profiles: admin volledige toegang"
  ON public.search_profiles FOR ALL
  USING (auth.jwt() ->> 'user_role' = 'admin');
