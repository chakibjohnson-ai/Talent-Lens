-- Migration: analyses locking + indexen + RLS update
-- Date: 2026-03-19b

-- ── 1. is_locked kolom ───────────────────────────────────────────────────────
ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS is_locked boolean NOT NULL DEFAULT false;

-- ── 2. Indexen ───────────────────────────────────────────────────────────────
-- Compound index voor user + datum queries (vervangt analyses_user_id_created_idx)
CREATE INDEX IF NOT EXISTS idx_analyses_user_created
  ON public.analyses (user_id, created_at DESC);

-- GIN-index op JSONB data kolom voor full-text en containment queries
CREATE INDEX IF NOT EXISTS idx_analyses_data_gin
  ON public.analyses USING gin (data);

-- ── 3. RLS: vervang catch-all policy door operation-specifieke policies ───────
-- Verwijder de oude catch-all policy
DROP POLICY IF EXISTS "Users own analyses" ON public.analyses;

-- SELECT: eigen rijen
CREATE POLICY "Users select own" ON public.analyses
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: eigen rijen
CREATE POLICY "Users insert own" ON public.analyses
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: alleen eigen rijen die NIET vergrendeld zijn
CREATE POLICY "Users update unlocked" ON public.analyses
  FOR UPDATE TO authenticated
  USING  (auth.uid() = user_id AND is_locked = false)
  WITH CHECK (auth.uid() = user_id AND is_locked = false);

-- DELETE: alleen eigen rijen die NIET vergrendeld zijn
CREATE POLICY "Users delete unlocked" ON public.analyses
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND is_locked = false);

-- Admin policy blijft ongewijzigd (volledige toegang via JWT claim).
-- Conventie: admins worden aangemoedigd locked records niet te wijzigen.
-- De huidige "Admin full access" policy uit de vorige migratie blijft staan.
