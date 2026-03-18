-- =============================================================================
-- 001_multi_tenant_setup.sql
-- Multi-tenant schema voor TalentLens: RLS, data-isolatie, PgVector-ready.
--
-- Deploy:  supabase db push
-- of:      plak in Supabase SQL editor en klik Run
-- =============================================================================

-- ── 0. Extensies ─────────────────────────────────────────────────────────────
-- vector is al geïnstalleerd op Supabase maar nog niet gebruikt.
-- Activeer alvast zodat 'ALTER TABLE candidates ADD COLUMN embedding vector(1536)'
-- in de toekomst meteen werkt zonder extra migratie.
CREATE EXTENSION IF NOT EXISTS vector;

-- ── 1. saved_booleans ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_booleans (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL    DEFAULT now(),
  label_id        text,                    -- legacy team-label (backward-compat)
  title           text,
  boolean_string  text
);

-- Voeg multi-tenant kolommen toe als ze nog niet bestaan
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='saved_booleans' AND column_name='user_id') THEN
    ALTER TABLE public.saved_booleans ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='saved_booleans' AND column_name='team_id') THEN
    ALTER TABLE public.saved_booleans ADD COLUMN team_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='saved_booleans' AND column_name='organization_id') THEN
    ALTER TABLE public.saved_booleans ADD COLUMN organization_id text;
  END IF;
END $$;

-- ── 2. frontsheets ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.frontsheets (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL    DEFAULT now(),
  title           text,
  content         text,
  candidate_name  text,
  user_id         uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  team_id         text,
  organization_id text
);

-- ── 3. candidates ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.candidates (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL    DEFAULT now(),
  name            text,
  job_title       text,
  location        text,
  source          text,
  ai_analysis     jsonb
);

-- Multi-tenant + PgVector-ready kolommen
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='candidates' AND column_name='raw_text') THEN
    ALTER TABLE public.candidates ADD COLUMN raw_text text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='candidates' AND column_name='user_id') THEN
    ALTER TABLE public.candidates ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='candidates' AND column_name='team_id') THEN
    ALTER TABLE public.candidates ADD COLUMN team_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='candidates' AND column_name='organization_id') THEN
    ALTER TABLE public.candidates ADD COLUMN organization_id text;
  END IF;
  -- PgVector-ready: embedding wordt hier BEWUST nog NIET toegevoegd.
  -- Voer in een toekomstige migratie uit:
  --   ALTER TABLE public.candidates ADD COLUMN embedding vector(1536);
  -- De extensie is al geactiveerd hierboven, dus dit werkt direct.
END $$;

-- Index voor efficiënte org-queries
CREATE INDEX IF NOT EXISTS idx_candidates_org_created
  ON public.candidates (organization_id, created_at DESC);

-- ── 4. daily_facts ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_facts (
  id          serial      PRIMARY KEY,
  content     text        NOT NULL,
  category    text        NOT NULL DEFAULT 'algemeen',  -- 'recruitment' | 'natuur' | 'algemeen'
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── 5. RLS inschakelen ───────────────────────────────────────────────────────
ALTER TABLE public.saved_booleans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frontsheets    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_facts    ENABLE ROW LEVEL SECURITY;

-- ── 6. RLS Policies: saved_booleans ─────────────────────────────────────────
DROP POLICY IF EXISTS "sb_own_select" ON public.saved_booleans;
DROP POLICY IF EXISTS "sb_own_insert" ON public.saved_booleans;
DROP POLICY IF EXISTS "sb_own_update" ON public.saved_booleans;
DROP POLICY IF EXISTS "sb_own_delete" ON public.saved_booleans;
DROP POLICY IF EXISTS "sb_admin_all"  ON public.saved_booleans;

-- Eigen rijen lezen
CREATE POLICY "sb_own_select" ON public.saved_booleans
  FOR SELECT USING (user_id = auth.uid());

-- Eigen rijen aanmaken
CREATE POLICY "sb_own_insert" ON public.saved_booleans
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Eigen rijen bewerken
CREATE POLICY "sb_own_update" ON public.saved_booleans
  FOR UPDATE USING (user_id = auth.uid());

-- Eigen rijen verwijderen
CREATE POLICY "sb_own_delete" ON public.saved_booleans
  FOR DELETE USING (user_id = auth.uid());

-- Org-admin ziet en beheert alles binnen zijn organisatie
CREATE POLICY "sb_admin_all" ON public.saved_booleans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid()
        AND up.is_org_admin = true
        AND up.organization_id = saved_booleans.organization_id
    )
  );

-- ── 7. RLS Policies: frontsheets ─────────────────────────────────────────────
DROP POLICY IF EXISTS "fs_own_select" ON public.frontsheets;
DROP POLICY IF EXISTS "fs_own_insert" ON public.frontsheets;
DROP POLICY IF EXISTS "fs_own_update" ON public.frontsheets;
DROP POLICY IF EXISTS "fs_own_delete" ON public.frontsheets;
DROP POLICY IF EXISTS "fs_admin_all"  ON public.frontsheets;

CREATE POLICY "fs_own_select" ON public.frontsheets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "fs_own_insert" ON public.frontsheets
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "fs_own_update" ON public.frontsheets
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "fs_own_delete" ON public.frontsheets
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "fs_admin_all" ON public.frontsheets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid()
        AND up.is_org_admin = true
        AND up.organization_id = frontsheets.organization_id
    )
  );

-- ── 8. RLS Policies: candidates ──────────────────────────────────────────────
DROP POLICY IF EXISTS "cand_org_select" ON public.candidates;
DROP POLICY IF EXISTS "cand_own_insert" ON public.candidates;
DROP POLICY IF EXISTS "cand_own_update" ON public.candidates;
DROP POLICY IF EXISTS "cand_own_delete" ON public.candidates;
DROP POLICY IF EXISTS "cand_admin_all"  ON public.candidates;

-- Alle leden van de organisatie zien de kandidaten van hun org
CREATE POLICY "cand_org_select" ON public.candidates
  FOR SELECT USING (
    organization_id = (
      SELECT organization_id FROM public.user_profiles
      WHERE user_id = auth.uid()
      LIMIT 1
    )
  );

-- Iedereen mag toevoegen (eigen user_id wordt afgedwongen via WITH CHECK)
CREATE POLICY "cand_own_insert" ON public.candidates
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Eigen kandidaten bewerken
CREATE POLICY "cand_own_update" ON public.candidates
  FOR UPDATE USING (user_id = auth.uid());

-- Eigen kandidaten verwijderen
CREATE POLICY "cand_own_delete" ON public.candidates
  FOR DELETE USING (user_id = auth.uid());

-- Admin ziet en beheert alles binnen de org
CREATE POLICY "cand_admin_all" ON public.candidates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid()
        AND up.is_org_admin = true
        AND up.organization_id = candidates.organization_id
    )
  );

-- ── 9. RLS Policies: daily_facts — publiek leesbaar ──────────────────────────
DROP POLICY IF EXISTS "facts_public_read" ON public.daily_facts;
CREATE POLICY "facts_public_read" ON public.daily_facts
  FOR SELECT USING (true);

-- ── 10. SEED DATA: daily_facts ────────────────────────────────────────────────
-- Verwijder eerder geseed om idempotent te zijn
TRUNCATE public.daily_facts RESTART IDENTITY;

INSERT INTO public.daily_facts (content, category) VALUES

-- ── RECRUITMENT (25) ─────────────────────────────────────────────────────────
('Gemiddeld bekijkt een recruiter een cv slechts 7 seconden voordat hij een eerste oordeel vormt.', 'recruitment'),
('Meer dan 87% van de recruiters gebruikt LinkedIn als primair zoekplatform.', 'recruitment'),
('Bedrijven met sterke employer brand ontvangen 50% meer sollicitaties en betalen 50% minder per hire.', 'recruitment'),
('Nederlanders switchen gemiddeld elke 3,5 jaar van baan — korter dan het Europese gemiddelde van 4,1 jaar.', 'recruitment'),
('82% van hiring managers vindt soft skills net zo belangrijk als hard skills bij het selectieproces.', 'recruitment'),
('Remote werken steeg na 2020 met 300% — en 58% van medewerkers prefereert dit boven fulltime kantoor.', 'recruitment'),
('Kandidaten die in de ochtend worden geïnterviewd scoren gemiddeld 20% beter dan namiddag-slots.', 'recruitment'),
('De ''halo-bias'' zorgt ervoor dat een recruiter na één positieve eigenschap onbewust alles positiever beoordeelt.', 'recruitment'),
('Mensen beslissen in de eerste 90 seconden of ze iemand vertrouwen — 55% op basis van lichaamstaal.', 'recruitment'),
('Studies tonen dat cv''s met een professionele foto 40% vaker worden bekeken dan cv''s zonder foto.', 'recruitment'),
('Het eerste CV ooit werd geschreven door Leonardo da Vinci in 1482 — voor een functie als militair ingenieur.', 'recruitment'),
('Life sciences is een van de snelst groeiende sectoren in Nederland met 10% banengroei per jaar.', 'recruitment'),
('Kandidaten die tijdens interviews knikken worden gemiddeld 3x sympathieker beoordeeld door interviewers.', 'recruitment'),
('De kleur blauw in een kantoor wekt vertrouwen — kandidaten die blauw dragen worden als betrouwbaarder ervaren.', 'recruitment'),
('In 2025 verdringt AI 85 miljoen banen — maar creëert er ook 97 miljoen nieuwe, aldus het WEF.', 'recruitment'),
('Een ''bad hire'' kost een bedrijf gemiddeld 30% van het jaarsalaris van die medewerker.', 'recruitment'),
('Gemiddeld duurt een vacature in Nederland 40 dagen om in te vullen — in IT zelfs 60+ dagen.', 'recruitment'),
('Meer dan 70% van kandidaten deelt hun slechte sollicitatie-ervaring online — employer brand is cruciaal.', 'recruitment'),
('Diversiteitsgericht recruitment levert bedrijven 35% hogere financiële prestaties op volgens McKinsey.', 'recruitment'),
('ChatGPT bereikte 100 miljoen gebruikers in slechts 2 maanden — de snelste app-adoptie ooit.', 'recruitment'),
('Een recruiter besteedt gemiddeld 23% van zijn werkdag aan administratieve taken die geautomatiseerd kunnen worden.', 'recruitment'),
('Referral-kandidaten worden 4x sneller aangenomen en blijven 45% langer dan andere kanalen.', 'recruitment'),
('Generatie Z (geboren na 1997) maakt inmiddels 30% van de wereldwijde beroepsbevolking uit.', 'recruitment'),
('Slechts 30% van de workforce is actief op zoek naar een baan — de andere 70% is ''passief'' bereikbaar.', 'recruitment'),
('Boolean search werd in de jaren 50 uitgevonden door wiskundige George Boole — lang voor het internet.', 'recruitment'),

-- ── NATUUR & DIEREN (25) ──────────────────────────────────────────────────────
('Het hart van een garnaal zit in zijn hoofd — dit is geen grap, het is anatomisch correct.', 'natuur'),
('Een octopus heeft drie harten, blauw bloed en negen hersenen — één centraal en één per arm.', 'natuur'),
('Haaien zijn ouder dan bomen — haaien bestaan al 450 miljoen jaar, bomen slechts 360 miljoen jaar.', 'natuur'),
('Bananen delen 50% van hun DNA met mensen — en 85% van hun DNA met muizen.', 'natuur'),
('Honing bederft nooit — in Egyptische piramides gevonden honing van 3000 jaar oud was nog eetbaar.', 'natuur'),
('Er zijn meer bomen op aarde dan sterren in de Melkweg — zo''n 3 biljoen bomen versus 200 miljard sterren.', 'natuur'),
('Een slak kan 3 jaar in slaap vallen als de omstandigheden te droog of koud zijn.', 'natuur'),
('Flamingo''s zijn van nature wit — de roze kleur komt van de carotenoïden in de garnalen en algen die ze eten.', 'natuur'),
('De menselijke neus kan meer dan 1 biljoen verschillende geuren onderscheiden.', 'natuur'),
('Otters houden elkaars ''hand'' vast terwijl ze slapen, zodat ze niet van elkaar afdrijven.', 'natuur'),
('Een groep kraaien heet officieel een ''murder'' (moord). Een groep uilen heet een ''parliament'' (parlement).', 'natuur'),
('Cleopatra leefde dichter bij de uitvinding van de iPhone dan bij de bouw van de Grote Piramide.', 'natuur'),
('De T-rex leefde dichter bij onze tijd dan bij die van de Stegosaurus — 66 versus 83 miljoen jaar geleden.', 'natuur'),
('Mammoetwol was nog op aarde toen de Grote Piramide van Giza al 1000 jaar oud was.', 'natuur'),
('Water kan tegelijkertijd koken en bevriezen — dit heet het tripelpunt (bij 0,01°C en 611,7 Pa).', 'natuur'),
('Astronauten groeien in de ruimte gemiddeld 5 cm door het ontbreken van compressie op de wervelkolom.', 'natuur'),
('De blauwvintonijn kan snelheden bereiken van 80 km/u — sneller dan de meeste snelwegauto''s.', 'natuur'),
('Koala''s hebben vingerafdrukken die zo sterk lijken op menselijke dat ze forensisch sporen verwarren.', 'natuur'),
('Een bij moet 1,5 miljoen bloemen bezoeken om één potje honing van 500 gram te maken.', 'natuur'),
('Dolfijnen slapen met één hersenhelft tegelijk — zo kunnen ze blijven zwemmen en ademen.', 'natuur'),
('De Mantis Garnaal kan met zijn poot harder slaan dan een pistoolschot — genoeg om aquariumglas te breken.', 'natuur'),
('Eekhoorns vergeten zo''n 74% van de noten die ze begraven — wat bijdraagt aan het planten van nieuwe bomen.', 'natuur'),
('Wombats zijn de enige dieren ter wereld die blokvormige uitwerpselen produceren.', 'natuur'),
('De parasitaire wesp Glyptapanteles legt haar eitjes in rupsen, die vervolgens haar larven bewaken.', 'natuur'),
('Giraffen hebben dezelfde hoeveelheid nekwervels als mensen: zeven — alleen zijn ze véél groter.', 'natuur'),

-- ── ALGEMEEN / FUN FACTS (25) ──────────────────────────────────────────────
('Er zijn meer mogelijke schaakpartijen dan atomen in het waarneembare heelal.', 'algemeen'),
('Een dag op Venus duurt langer dan een jaar op Venus — de planeet draait trager om haar as dan om de zon.', 'algemeen'),
('Een dag duurt op Mercurius langer dan een jaar — de planeet draait trager om zijn as dan om de zon.', 'algemeen'),
('De Universiteit van Oxford bestaat al langer dan de Azteken — Oxford begon in 1096, Azteken in 1427.', 'algemeen'),
('Nintendo werd opgericht in 1889 — als fabrikant van speelkaarten, lang vóór de eerste computer.', 'algemeen'),
('Fax-technologie bestaat al langer dan de telefoon — de fax werd uitgevonden in 1843, de telefoon pas in 1876.', 'algemeen'),
('De gemiddelde persoon besteedt 90.000 uur van zijn leven aan werk — bijna een derde van zijn leven.', 'algemeen'),
('Het woord ''clue'' (aanwijzing) is afgeleid van ''clew'' (kluwen garen) — verwijzend naar de draad van Ariadne.', 'algemeen'),
('Frankrijk is het meest bezochte land ter wereld met meer dan 90 miljoen toeristen per jaar.', 'algemeen'),
('Meer mensen hebben een mobiele telefoon dan toegang tot een toilet — wereldwijd in 2024.', 'algemeen'),
('Oxford Dictionaries voegt elke drie maanden gemiddeld 1.000 nieuwe woorden toe aan de Engelse taal.', 'algemeen'),
('De letter Q is de enige letter in het alfabet die in geen enkele naam van een Amerikaans staat voorkomt.', 'algemeen'),
('Het menselijk brein heeft een opslagcapaciteit van ongeveer 2,5 petabyte — gelijk aan 3 miljoen uur HD-video.', 'algemeen'),
('IKEA gebruikt 1% van al het commercieel gekapte hout ter wereld voor haar meubels.', 'algemeen'),
('Hawaii beweegt elk jaar 7,5 cm dichter naar Japan toe door platentektoniek.', 'algemeen'),
('De Eiffeltoren is in de zomer 15 cm groter dan in de winter, door thermische uitzetting van het staal.', 'algemeen'),
('Er leven meer microben in één theelepel grond dan er mensen op aarde zijn.', 'algemeen'),
('In een gemiddeld leven loopt een mens meer dan 100.000 km — genoeg om de aarde 2,5 keer te omronden.', 'algemeen'),
('De kortste oorlog in de geschiedenis duurde 38 tot 45 minuten — tussen Engeland en Zanzibar in 1896.', 'algemeen'),
('Lijm werd voor het eerst gebruikt door Neanderthalers, zo''n 200.000 jaar geleden, op basis van berkenteerpek.', 'algemeen'),
('Een fotoneenheid (lichtdeeltje) doet er 40.000 jaar over om van de kern naar het oppervlak van de zon te reizen.', 'algemeen'),
('Het duurt gemiddeld 66 dagen om een nieuwe gewoonte te vormen — niet 21 dagen zoals vaak wordt beweerd.', 'algemeen'),
('Als je alle DNA uit één menselijk lichaam zou uitrekken, komt dat op 200 miljard kilometer — 1.300x de afstand tot de zon.', 'algemeen'),
('De Lego Group is de grootste bandenfabrikant ter wereld op aantallen — ze maken 318 miljoen banden per jaar.', 'algemeen'),
('Venetiaans glas was zo gewaardeerd dat smeden die de geheimen deelden met het buitenland ter dood werden gebracht.', 'algemeen');

-- ── 11. RPCs ─────────────────────────────────────────────────────────────────

-- RPC 1: get_random_fact() — retourneert één willekeurige fact_text
CREATE OR REPLACE FUNCTION public.get_random_fact()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT content
  FROM   public.daily_facts
  ORDER  BY RANDOM()
  LIMIT  1;
$$;

-- RPC 2: get_org_candidates() — haalt recente kandidaten op voor een org
-- Beperkt tot p_limit (standaard 30) om LLM-kosten laag te houden.
CREATE OR REPLACE FUNCTION public.get_org_candidates(
  p_org_id text,
  p_limit  int DEFAULT 30
)
RETURNS TABLE (
  id              uuid,
  name            text,
  job_title       text,
  location        text,
  source          text,
  ai_analysis     jsonb,
  raw_text        text,
  created_at      timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER   -- negeert RLS, verificatie gebeurt via p_org_id
AS $$
  SELECT
    c.id,
    c.name,
    c.job_title,
    c.location,
    c.source,
    c.ai_analysis,
    c.raw_text,
    c.created_at
  FROM   public.candidates c
  WHERE  c.organization_id = p_org_id
  ORDER  BY c.created_at DESC
  LIMIT  p_limit;
$$;

-- ── Klaar ─────────────────────────────────────────────────────────────────────
-- Volgende stap voor PgVector (niet nu):
--   ALTER TABLE public.candidates ADD COLUMN embedding vector(1536);
--   CREATE INDEX ON public.candidates USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
