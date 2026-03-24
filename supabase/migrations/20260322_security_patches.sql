-- TalentLens - Security Patches
-- Migration: 20260322_security_patches.sql
--
-- 1. lickey_select_own inperken (licence key lekkage)
-- 2. get_random_fact() met SET search_path (SECURITY DEFINER hardening)
-- 3. search_profiles UPDATE policy toevoegen


-- 1. lickey_select_own - policy inperken
-- Oud: elke gebruiker zag alle nog niet-ingeloste keys (is_redeemed = false).
-- Nieuw: alleen eigen ingeloste key, of een niet-ingeloste key van de eigen org.

DROP POLICY IF EXISTS "lickey_select_own" ON public.license_keys;

CREATE POLICY "lickey_select_own"
  ON public.license_keys FOR SELECT
  USING (
    redeemed_by = auth.uid()
    OR (
      is_redeemed = false
      AND org_id IN (
        SELECT org_id
        FROM   public.user_profiles
        WHERE  user_id = auth.uid()
          AND  org_id  IS NOT NULL
        LIMIT  1
      )
    )
  );


-- 2. get_random_fact() - SECURITY DEFINER hardening
-- search_path vastpinnen zodat een kwaadwillige gebruiker geen eigen
-- daily_facts tabel kan injecteren via search_path-manipulatie.

CREATE OR REPLACE FUNCTION public.get_random_fact()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT content
  FROM   public.daily_facts
  ORDER  BY RANDOM()
  LIMIT  1;
$$;


-- 3. search_profiles - UPDATE policy toevoegen
-- Was vergeten in 20260319g: gebruikers konden opgeslagen zoekopdrachten
-- niet bijwerken.

DROP POLICY IF EXISTS "search_profiles: eigen rijen bewerken" ON public.search_profiles;

CREATE POLICY "search_profiles: eigen rijen bewerken"
  ON public.search_profiles FOR UPDATE
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
