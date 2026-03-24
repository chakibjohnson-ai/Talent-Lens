-- TalentLens - user_profiles SELECT policy
-- Migration: 20260323_user_profiles_select_policy.sql
--
-- Probleem: user_profiles had RLS aan maar geen SELECT policy.
-- Elke supabase.from('user_profiles').select(...) via de SDK
-- retourneerde een lege array voor normale gebruikers.
-- authService.js werkte tijdelijk via raw fetch, maar SDK-calls faalden stil.
--
-- Fix: gebruiker mag alleen zijn eigen rij lezen (user_id = auth.uid()).

DROP POLICY IF EXISTS "profiles_select_own" ON public.user_profiles;

CREATE POLICY "profiles_select_own"
  ON public.user_profiles FOR SELECT
  USING (user_id = auth.uid());
