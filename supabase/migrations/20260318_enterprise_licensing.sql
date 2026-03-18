-- ═══════════════════════════════════════════════════════════════════════════
-- TalentLens — Enterprise Licensing Migration
-- Uitvoeren in Supabase SQL Editor (Project: cebpwkavlxipkrqixbab)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. ORGANIZATIONS tabel ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.organizations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  domain     text NOT NULL UNIQUE,          -- bijv. "morgangreen.nl"
  max_seats  integer NOT NULL DEFAULT 10,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.organizations IS
  'Enterprise organisaties met domein-locking voor TalentLens licenties.';

-- ── 2. LICENSE_KEYS tabel ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.license_keys (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code          text NOT NULL UNIQUE,       -- bijv. "TL-ENT-2024-ABCD"
  org_id        uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  is_redeemed   boolean NOT NULL DEFAULT false,
  redeemed_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  redeemed_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.license_keys IS
  'Eenmalig te gebruiken activatiecodes gekoppeld aan een organisatie.';

-- ── 3. USER_PROFILES uitbreiden ─────────────────────────────────────────────
-- Voeg kolommen toe als ze nog niet bestaan (idempotent via DO-blok)
DO $$
BEGIN
  -- subscription_status: 'free' | 'active' | 'past_due' | 'canceled'
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'user_profiles'
      AND column_name  = 'subscription_status'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD COLUMN subscription_status text NOT NULL DEFAULT 'free';
  END IF;

  -- stripe_customer_id: Stripe cid bijv. "cus_Xxxxxxxxxxx"
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'user_profiles'
      AND column_name  = 'stripe_customer_id'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD COLUMN stripe_customer_id text;
  END IF;

  -- is_tester: testers hebben altijd volledige toegang
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'user_profiles'
      AND column_name  = 'is_tester'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD COLUMN is_tester boolean NOT NULL DEFAULT false;
  END IF;

  -- org_id: koppeling aan een organisatie na licentie-activatie
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'user_profiles'
      AND column_name  = 'org_id'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD COLUMN org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ── 4. HAS_ACTIVE_SUBSCRIPTION functie ─────────────────────────────────────
-- Geeft TRUE als de gebruiker toegang heeft tot AI-functies via:
--   a) is_tester = true
--   b) subscription_status = 'active' (individueel Stripe abonnement)
--   c) E-mail domein matcht een actieve organisatie (Enterprise domein-locking)
CREATE OR REPLACE FUNCTION public.has_active_subscription(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_profile      public.user_profiles%ROWTYPE;
  v_email        text;
  v_domain       text;
  v_org_active   boolean;
BEGIN
  -- Haal profiel op
  SELECT * INTO v_profile
  FROM public.user_profiles
  WHERE user_id = p_user_id
  LIMIT 1;

  -- Niet gevonden = geen toegang
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- (a) Tester-flag
  IF v_profile.is_tester THEN
    RETURN true;
  END IF;

  -- (b) Actief individueel Stripe abonnement
  IF v_profile.subscription_status = 'active' THEN
    RETURN true;
  END IF;

  -- (c) Enterprise domein-locking
  -- Haal e-mail op uit auth.users
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = p_user_id
  LIMIT 1;

  IF v_email IS NULL THEN
    RETURN false;
  END IF;

  v_domain := split_part(v_email, '@', 2);

  SELECT is_active INTO v_org_active
  FROM public.organizations
  WHERE domain = v_domain
  LIMIT 1;

  IF FOUND AND v_org_active THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

COMMENT ON FUNCTION public.has_active_subscription IS
  'Geeft TRUE als de gebruiker een actieve TalentLens licentie heeft (tester / Stripe / Enterprise domein).';

-- ── 5. RLS INSCHAKELEN ──────────────────────────────────────────────────────
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_keys  ENABLE ROW LEVEL SECURITY;

-- ── 6. RLS POLICIES — organizations ────────────────────────────────────────

-- Iedereen mag de eigen org lezen (na koppeling)
CREATE POLICY "org_select_own" ON public.organizations
  FOR SELECT
  USING (
    id = (
      SELECT org_id FROM public.user_profiles
      WHERE user_id = auth.uid()
      LIMIT 1
    )
  );

-- Alleen service-role mag aanmaken / updaten / verwijderen
-- (beheerd via Supabase Dashboard of backend API — geen directe client-toegang)

-- ── 7. RLS POLICIES — license_keys ─────────────────────────────────────────

-- Gebruiker mag alleen zijn eigen (ingeloste) key zien
CREATE POLICY "lickey_select_own" ON public.license_keys
  FOR SELECT
  USING (redeemed_by = auth.uid() OR is_redeemed = false);

-- Gebruiker mag een ongebruikte key inlossen (UPDATE via redeemCode functie)
CREATE POLICY "lickey_update_redeem" ON public.license_keys
  FOR UPDATE
  USING (is_redeemed = false)
  WITH CHECK (redeemed_by = auth.uid());

-- ── 8. RLS POLICY — user_profiles (eigen rij bijwerken) ────────────────────
-- Zorg dat de org_id-update door de gebruiker zelf mag (na licentie-activatie)
-- Voeg toe als de policy nog niet bestaat
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'user_profiles'
      AND policyname = 'profiles_update_own'
  ) THEN
    CREATE POLICY "profiles_update_own" ON public.user_profiles
      FOR UPDATE
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- ── 9. DEMO DATA (optioneel — comment uit voor productie) ───────────────────
-- INSERT INTO public.organizations (name, domain, max_seats)
-- VALUES ('Morgan Green', 'morgangreen.nl', 25)
-- ON CONFLICT (domain) DO NOTHING;

-- INSERT INTO public.license_keys (code, org_id)
-- SELECT 'TL-ENT-2024-DEMO', id FROM public.organizations WHERE domain = 'morgangreen.nl';
