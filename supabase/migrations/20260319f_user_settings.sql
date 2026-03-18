-- Migration: user_settings tabel voor Ghostwriter Engine
-- Sla writing_style_sample per gebruiker op (tone-of-voice few-shot)

CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  writing_style_sample text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "us_select_own" ON public.user_settings;
DROP POLICY IF EXISTS "us_insert_own" ON public.user_settings;
DROP POLICY IF EXISTS "us_update_own" ON public.user_settings;
DROP POLICY IF EXISTS "us_delete_own" ON public.user_settings;

CREATE POLICY "us_select_own" ON public.user_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "us_insert_own" ON public.user_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "us_update_own" ON public.user_settings
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "us_delete_own" ON public.user_settings
  FOR DELETE USING (user_id = auth.uid());
