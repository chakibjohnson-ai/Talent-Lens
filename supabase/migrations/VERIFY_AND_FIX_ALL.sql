-- ═══════════════════════════════════════════════════════════════════════════
-- TalentLens — VERIFY & FIX ALL
-- Volledig idempotent: veilig om meerdere keren uit te voeren.
-- Voer uit in: Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 0. EXTENSIES ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. TABELLEN
-- ═══════════════════════════════════════════════════════════════════════════

-- ── organizations ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.organizations (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  domain     text        NOT NULL UNIQUE,
  max_seats  integer     NOT NULL DEFAULT 10,
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── license_keys ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.license_keys (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code         text        NOT NULL UNIQUE,
  org_id       uuid        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  is_redeemed  boolean     NOT NULL DEFAULT false,
  redeemed_by  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  redeemed_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ── user_profiles: extra kolommen ────────────────────────────────────────────
-- user_profiles gebruikt 'email' als primaire sleutel.
-- We voegen user_id (UUID FK naar auth.users) toe als die nog niet bestaat,
-- zodat RLS policies auth.uid() kunnen gebruiken.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='user_id') THEN
    ALTER TABLE public.user_profiles ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    -- Koppel bestaande rijen aan auth.users via email
    UPDATE public.user_profiles up
    SET user_id = au.id
    FROM auth.users au
    WHERE au.email = up.email;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='subscription_status') THEN
    ALTER TABLE public.user_profiles ADD COLUMN subscription_status text NOT NULL DEFAULT 'free';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='stripe_customer_id') THEN
    ALTER TABLE public.user_profiles ADD COLUMN stripe_customer_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='is_tester') THEN
    ALTER TABLE public.user_profiles ADD COLUMN is_tester boolean NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='org_id') THEN
    ALTER TABLE public.user_profiles ADD COLUMN org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ── saved_booleans ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_booleans (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  label_id       text,
  title          text,
  boolean_string text
);
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='saved_booleans' AND column_name='user_id') THEN
    ALTER TABLE public.saved_booleans ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='saved_booleans' AND column_name='team_id') THEN
    ALTER TABLE public.saved_booleans ADD COLUMN team_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='saved_booleans' AND column_name='organization_id') THEN
    ALTER TABLE public.saved_booleans ADD COLUMN organization_id text;
  END IF;
END $$;

-- ── frontsheets ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.frontsheets (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  title           text,
  content         text,
  candidate_name  text,
  user_id         uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  team_id         text,
  organization_id text
);

-- ── candidates ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.candidates (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  name        text,
  job_title   text,
  location    text,
  source      text,
  ai_analysis jsonb
);
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='candidates' AND column_name='raw_text') THEN
    ALTER TABLE public.candidates ADD COLUMN raw_text text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='candidates' AND column_name='user_id') THEN
    ALTER TABLE public.candidates ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='candidates' AND column_name='team_id') THEN
    ALTER TABLE public.candidates ADD COLUMN team_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='candidates' AND column_name='organization_id') THEN
    ALTER TABLE public.candidates ADD COLUMN organization_id text;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_candidates_org_created ON public.candidates (organization_id, created_at DESC);

-- ── daily_facts ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_facts (
  id         serial      PRIMARY KEY,
  content    text        NOT NULL,
  category   text        NOT NULL DEFAULT 'algemeen',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── analyses ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.analyses (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  type        text        NOT NULL CHECK (type IN ('linkedin','indeed','cv','vacature')),
  data        jsonb       NOT NULL DEFAULT '{}',
  session_id  text
);
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analyses' AND column_name='is_locked') THEN
    ALTER TABLE public.analyses ADD COLUMN is_locked boolean NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analyses' AND column_name='source_url') THEN
    ALTER TABLE public.analyses ADD COLUMN source_url text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analyses' AND column_name='location') THEN
    ALTER TABLE public.analyses ADD COLUMN location text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analyses' AND column_name='company_metadata') THEN
    ALTER TABLE public.analyses ADD COLUMN company_metadata jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analyses' AND column_name='location_structured') THEN
    ALTER TABLE public.analyses ADD COLUMN location_structured jsonb;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_analyses_user_created      ON public.analyses (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_data_gin          ON public.analyses USING gin (data);
CREATE INDEX IF NOT EXISTS analyses_location_region_idx   ON public.analyses ((location_structured->>'region'));

-- ── user_settings ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id              uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  writing_style_sample text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- ── search_profiles ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.search_profiles (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  raw_query       text        NOT NULL,
  structured_data jsonb       NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_search_profiles_user_created ON public.search_profiles (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_profiles_data_gin     ON public.search_profiles USING gin (structured_data);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. RLS INSCHAKELEN
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.organizations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_keys     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_booleans   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frontsheets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_facts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_profiles  ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. RLS POLICIES (DROP IF EXISTS → CREATE, volledig idempotent)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── organizations ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "org_select_own" ON public.organizations;
CREATE POLICY "org_select_own" ON public.organizations FOR SELECT
  USING (id = (SELECT org_id FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1)::uuid);

-- ── license_keys ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "lickey_select_own"   ON public.license_keys;
DROP POLICY IF EXISTS "lickey_update_redeem" ON public.license_keys;
CREATE POLICY "lickey_select_own" ON public.license_keys FOR SELECT
  USING (redeemed_by = auth.uid() OR is_redeemed = false);
CREATE POLICY "lickey_update_redeem" ON public.license_keys FOR UPDATE
  USING (is_redeemed = false) WITH CHECK (redeemed_by = auth.uid());

-- ── user_profiles ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_update_own" ON public.user_profiles;
CREATE POLICY "profiles_update_own" ON public.user_profiles FOR UPDATE
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ── saved_booleans ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "sb_own_select" ON public.saved_booleans;
DROP POLICY IF EXISTS "sb_own_insert" ON public.saved_booleans;
DROP POLICY IF EXISTS "sb_own_update" ON public.saved_booleans;
DROP POLICY IF EXISTS "sb_own_delete" ON public.saved_booleans;
DROP POLICY IF EXISTS "sb_admin_all"  ON public.saved_booleans;
CREATE POLICY "sb_own_select" ON public.saved_booleans FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "sb_own_insert" ON public.saved_booleans FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "sb_own_update" ON public.saved_booleans FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "sb_own_delete" ON public.saved_booleans FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "sb_admin_all"  ON public.saved_booleans FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.user_id = auth.uid() AND up.is_org_admin = true AND up.organization_id::text = saved_booleans.organization_id::text));

-- ── frontsheets ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "fs_own_select" ON public.frontsheets;
DROP POLICY IF EXISTS "fs_own_insert" ON public.frontsheets;
DROP POLICY IF EXISTS "fs_own_update" ON public.frontsheets;
DROP POLICY IF EXISTS "fs_own_delete" ON public.frontsheets;
DROP POLICY IF EXISTS "fs_admin_all"  ON public.frontsheets;
CREATE POLICY "fs_own_select" ON public.frontsheets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "fs_own_insert" ON public.frontsheets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "fs_own_update" ON public.frontsheets FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "fs_own_delete" ON public.frontsheets FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "fs_admin_all"  ON public.frontsheets FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.user_id = auth.uid() AND up.is_org_admin = true AND up.organization_id::text = frontsheets.organization_id::text));

-- ── candidates ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "cand_org_select" ON public.candidates;
DROP POLICY IF EXISTS "cand_own_insert" ON public.candidates;
DROP POLICY IF EXISTS "cand_own_update" ON public.candidates;
DROP POLICY IF EXISTS "cand_own_delete" ON public.candidates;
DROP POLICY IF EXISTS "cand_admin_all"  ON public.candidates;
CREATE POLICY "cand_org_select" ON public.candidates FOR SELECT
  USING (organization_id::text = (SELECT organization_id::text FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY "cand_own_insert" ON public.candidates FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "cand_own_update" ON public.candidates FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "cand_own_delete" ON public.candidates FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "cand_admin_all"  ON public.candidates FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.user_id = auth.uid() AND up.is_org_admin = true AND up.organization_id::text = candidates.organization_id::text));

-- ── daily_facts ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "facts_public_read" ON public.daily_facts;
CREATE POLICY "facts_public_read" ON public.daily_facts FOR SELECT USING (true);

-- ── analyses ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin full access"    ON public.analyses;
DROP POLICY IF EXISTS "Users own analyses"   ON public.analyses;
DROP POLICY IF EXISTS "Users select own"     ON public.analyses;
DROP POLICY IF EXISTS "Users insert own"     ON public.analyses;
DROP POLICY IF EXISTS "Users update unlocked" ON public.analyses;
DROP POLICY IF EXISTS "Users delete unlocked" ON public.analyses;
CREATE POLICY "Admin full access" ON public.analyses FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'user_role') = 'admin') WITH CHECK ((auth.jwt() ->> 'user_role') = 'admin');
CREATE POLICY "Users select own"      ON public.analyses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own"      ON public.analyses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update unlocked" ON public.analyses FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND is_locked = false) WITH CHECK (auth.uid() = user_id AND is_locked = false);
CREATE POLICY "Users delete unlocked" ON public.analyses FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND is_locked = false);

-- ── user_settings ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "us_select_own" ON public.user_settings;
DROP POLICY IF EXISTS "us_insert_own" ON public.user_settings;
DROP POLICY IF EXISTS "us_update_own" ON public.user_settings;
DROP POLICY IF EXISTS "us_delete_own" ON public.user_settings;
CREATE POLICY "us_select_own" ON public.user_settings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "us_insert_own" ON public.user_settings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "us_update_own" ON public.user_settings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "us_delete_own" ON public.user_settings FOR DELETE USING (user_id = auth.uid());

-- ── search_profiles ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "search_profiles: eigen rijen lezen"      ON public.search_profiles;
DROP POLICY IF EXISTS "search_profiles: eigen rijen invoegen"   ON public.search_profiles;
DROP POLICY IF EXISTS "search_profiles: eigen rijen verwijderen" ON public.search_profiles;
DROP POLICY IF EXISTS "search_profiles: admin volledige toegang" ON public.search_profiles;
CREATE POLICY "search_profiles: eigen rijen lezen"      ON public.search_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "search_profiles: eigen rijen invoegen"   ON public.search_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "search_profiles: eigen rijen verwijderen" ON public.search_profiles FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "search_profiles: admin volledige toegang" ON public.search_profiles FOR ALL
  USING (auth.jwt() ->> 'user_role' = 'admin');

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. FUNCTIES
-- ═══════════════════════════════════════════════════════════════════════════

-- ── has_active_subscription ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.has_active_subscription(p_user_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE
  v_profile    public.user_profiles%ROWTYPE;
  v_email      text;
  v_domain     text;
  v_org_active boolean;
BEGIN
  -- Caller moet zichzelf zijn (of admin via service_role)
  IF auth.uid() IS NOT NULL AND auth.uid() != p_user_id THEN
    RETURN false;
  END IF;
  SELECT * INTO v_profile FROM public.user_profiles WHERE user_id = p_user_id LIMIT 1;
  IF NOT FOUND THEN RETURN false; END IF;
  IF v_profile.is_tester THEN RETURN true; END IF;
  IF v_profile.subscription_status = 'active' THEN RETURN true; END IF;
  SELECT email INTO v_email FROM auth.users WHERE id = p_user_id LIMIT 1;
  IF v_email IS NULL THEN RETURN false; END IF;
  v_domain := split_part(v_email, '@', 2);
  SELECT is_active INTO v_org_active FROM public.organizations WHERE domain = v_domain LIMIT 1;
  IF FOUND AND v_org_active THEN RETURN true; END IF;
  RETURN false;
END;
$$;

-- ── get_random_fact ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_random_fact()
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT content FROM public.daily_facts ORDER BY RANDOM() LIMIT 1;
$$;

-- ── get_org_candidates (met autorisatiecheck) ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_org_candidates(p_org_id text, p_limit int DEFAULT 30)
RETURNS TABLE (id uuid, name text, job_title text, location text, source text, ai_analysis jsonb, raw_text text, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  -- Verificeer dat de aanroeper lid is van de gevraagde organisatie
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
      AND up.organization_id::text = p_org_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized: je bent geen lid van deze organisatie';
  END IF;

  RETURN QUERY
  SELECT c.id, c.name, c.job_title, c.location, c.source, c.ai_analysis, c.raw_text, c.created_at
  FROM public.candidates c
  WHERE c.organization_id = p_org_id
  ORDER BY c.created_at DESC
  LIMIT p_limit;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. ADMIN ROL INSTELLEN
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"user_role":"admin"}'::jsonb
WHERE email = 'c.johnson@morgangreen.nl';

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. SEED DATA: daily_facts (alleen als tabel leeg is)
-- ═══════════════════════════════════════════════════════════════════════════
DO $$ BEGIN
  IF (SELECT COUNT(*) FROM public.daily_facts) = 0 THEN
    INSERT INTO public.daily_facts (content, category) VALUES
    ('Gemiddeld bekijkt een recruiter een cv slechts 7 seconden voordat hij een eerste oordeel vormt.', 'recruitment'),
    ('Meer dan 87% van de recruiters gebruikt LinkedIn als primair zoekplatform.', 'recruitment'),
    ('Bedrijven met sterke employer brand ontvangen 50% meer sollicitaties en betalen 50% minder per hire.', 'recruitment'),
    ('Nederlanders switchen gemiddeld elke 3,5 jaar van baan — korter dan het Europese gemiddelde van 4,1 jaar.', 'recruitment'),
    ('82% van hiring managers vindt soft skills net zo belangrijk als hard skills bij het selectieproces.', 'recruitment'),
    ('Remote werken steeg na 2020 met 300% — en 58% van medewerkers prefereert dit boven fulltime kantoor.', 'recruitment'),
    ('Referral-kandidaten worden 4x sneller aangenomen en blijven 45% langer dan andere kanalen.', 'recruitment'),
    ('Slechts 30% van de workforce is actief op zoek naar een baan — de andere 70% is passief bereikbaar.', 'recruitment'),
    ('Boolean search werd in de jaren 50 uitgevonden door wiskundige George Boole — lang voor het internet.', 'recruitment'),
    ('Life sciences is een van de snelst groeiende sectoren in Nederland met 10% banengroei per jaar.', 'recruitment'),
    ('Een octopus heeft drie harten, blauw bloed en negen hersenen — één centraal en één per arm.', 'natuur'),
    ('Haaien zijn ouder dan bomen — haaien bestaan al 450 miljoen jaar, bomen slechts 360 miljoen jaar.', 'natuur'),
    ('Otters houden elkaars hand vast terwijl ze slapen, zodat ze niet van elkaar afdrijven.', 'natuur'),
    ('Flamingos zijn van nature wit — de roze kleur komt van carotenoïden in garnalen en algen.', 'natuur'),
    ('Er zijn meer bomen op aarde dan sterren in de Melkweg — zo n 3 biljoen versus 200 miljard sterren.', 'natuur'),
    ('Dolfijnen slapen met één hersenhelft tegelijk — zo kunnen ze blijven zwemmen en ademen.', 'natuur'),
    ('Eekhoorns vergeten 74% van de noten die ze begraven — wat bijdraagt aan het planten van nieuwe bomen.', 'natuur'),
    ('Koalas hebben vingerafdrukken die forensisch sporen kunnen verwarren met menselijke.', 'natuur'),
    ('Giraffen hebben dezelfde hoeveelheid nekwervels als mensen: zeven — alleen zijn ze veel groter.', 'natuur'),
    ('Honing bederft nooit — in Egyptische piramides gevonden honing van 3000 jaar oud was nog eetbaar.', 'natuur'),
    ('Er zijn meer mogelijke schaakpartijen dan atomen in het waarneembare heelal.', 'algemeen'),
    ('Nintendo werd opgericht in 1889 als fabrikant van speelkaarten, lang voor de eerste computer.', 'algemeen'),
    ('De Eiffeltoren is in de zomer 15 cm groter door thermische uitzetting van het staal.', 'algemeen'),
    ('Het menselijk brein heeft een opslagcapaciteit van circa 2,5 petabyte.', 'algemeen'),
    ('De kortste oorlog in de geschiedenis duurde 38 minuten — tussen Engeland en Zanzibar in 1896.', 'algemeen');
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. STORAGE BUCKETS
-- ═══════════════════════════════════════════════════════════════════════════

-- company-assets bucket (publiek, voor logo's)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('company-assets', 'company-assets', true, 2097152,
  ARRAY['image/png','image/jpeg','image/webp','image/gif','image/svg+xml','image/x-icon','image/vnd.microsoft.icon'])
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='company-assets: authenticated read') THEN
    CREATE POLICY "company-assets: authenticated read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'company-assets');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='company-assets: service role insert') THEN
    CREATE POLICY "company-assets: service role insert" ON storage.objects FOR INSERT TO service_role WITH CHECK (bucket_id = 'company-assets');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='company-assets: service role update') THEN
    CREATE POLICY "company-assets: service role update" ON storage.objects FOR UPDATE TO service_role USING (bucket_id = 'company-assets');
  END IF;
END $$;

-- cv_uploads RLS policies (bucket zelf aanmaken via Dashboard → Storage → New bucket "cv_uploads" private)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='cv_uploads_insert_own') THEN
    CREATE POLICY "cv_uploads_insert_own" ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'cv_uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='cv_uploads_select_own') THEN
    CREATE POLICY "cv_uploads_select_own" ON storage.objects FOR SELECT
      USING (bucket_id = 'cv_uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='cv_uploads_delete_own') THEN
    CREATE POLICY "cv_uploads_delete_own" ON storage.objects FOR DELETE
      USING (bucket_id = 'cv_uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- KLAAR ✅
-- Na uitvoeren: log opnieuw in om het admin JWT-claim te activeren.
-- ═══════════════════════════════════════════════════════════════════════════
