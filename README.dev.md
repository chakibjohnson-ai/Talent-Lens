# TalentLens — Developer Reference

> Intern document. Niet committen zonder te reviewen op gevoelige data.
> Laatste update: 2026-03-23

---

## 1. Current Project State

### Architectuur

```
talentlens/
├── src/                        # React + Vite frontend (port 5173)
│   ├── App.jsx                 # Shell: session-restore, routing, gem-modals
│   ├── components/             # AnalyseView, BooleanView, FrontsheetView,
│   │                           #   ProfileScoutView, OutreachView, InstellingenView, …
│   ├── services/               # analysisService, authService, booleanService,
│   │                           #   candidateService, cvUploadService, frontsheetService,
│   │                           #   ghostwriterService, profileScoutService
│   ├── hooks/useAppData.js     # Skills/verticals/roles/industries ophalen
│   ├── lib/supabaseClient.js   # SDK-client + raw constants (SB_HEADERS etc.)
│   ├── constants/appConstants.js
│   └── types/database.types.ts # Handmatig bijgehouden Supabase types
│
├── backend/                    # Node.js + Express webhook server
│   └── src/server.ts           # POST /webhook/cv-job → Claude Haiku → Realtime
│
├── supabase/
│   ├── functions/              # Edge functions (stripe-portal, fetch-vacancy)
│   └── migrations/             # Zie §2
│
└── TL_V2_4_NT.jsx              # ⚠️ Legacy monolith — NIET verwijderen (source of truth)
```

### Tech stack

| Laag | Technologie |
|------|-------------|
| Frontend | React 18, Vite, inline styles (geen Tailwind, behalve Dashboard.jsx) |
| Auth | Supabase Auth — session via localStorage (`SB_SESSION_KEY`) |
| Database | Supabase (PostgreSQL) — project `cebpwkavlxipkrqixbab.supabase.co` |
| Storage | Supabase Storage — buckets: `resumes` (privé), `company-assets` (publiek), `app-assets` |
| AI | Anthropic API — Haiku (analyse, boolean, frontsheet, ghostwriter) + Sonnet 4.6 (vacature-matching) |
| Backend | Express + TypeScript op Railway — CV-pipeline via Supabase Database Webhook |
| Betalingen | Stripe via Edge Function `stripe-portal` |

### Deployment

| Onderdeel | Platform | Entry point |
|-----------|----------|-------------|
| Frontend | Vercel | `vite build` → `dist/` |
| Backend | Railway | `backend/railway.toml` → `dist/server.js` |
| Edge Functions | Supabase | `supabase/functions/` |

---

## 2. Database Health

### RLS-status per tabel

| Tabel | RLS aan | SELECT | INSERT | UPDATE | DELETE | Opmerking |
|-------|---------|--------|--------|--------|--------|-----------|
| `analyses` | ✅ | ✅ eigen | ✅ eigen | ✅ eigen (unlocked) | ✅ eigen (unlocked) | Admin via JWT `user_role` claim |
| `candidates` | ✅ | ✅ org-breed | ✅ eigen | ✅ eigen | ✅ eigen | Org-admin all |
| `cv_analysis_jobs` | ✅ | ✅ workspace/user | ✅ workspace/user | ❌ alleen service_role | ❌ alleen service_role | Intentioneel: backend update via service role |
| `daily_facts` | ✅ | ✅ publiek | ❌ | ❌ | ❌ | Seed-only tabel |
| `frontsheets` | ✅ | ✅ eigen | ✅ eigen | ✅ eigen | ✅ eigen | Org-admin all |
| `license_keys` | ✅ | ✅ eigen+eigen org | ❌ | ✅ redeem | ❌ | Geen DELETE = audit trail |
| `organizations` | ✅ | ✅ eigen org | ❌ client | ❌ client | ❌ client | Alleen service_role mag aanmaken |
| `saved_booleans` | ✅ | ✅ eigen | ✅ eigen | ✅ eigen | ✅ eigen | Org-admin all |
| `search_profiles` | ✅ | ✅ eigen | ✅ eigen | ✅ eigen | ✅ eigen | Admin via JWT claim |
| `user_profiles` | ⚠️ | ❌ **GEEN SELECT** | ❌ | ✅ eigen | ❌ | App werkt via raw fetch (authService), SDK-select faalt |
| `user_settings` | ✅ | ✅ eigen | ✅ eigen | ✅ eigen | ✅ eigen | |
| `workspace_members` | ✅ | ✅ lid | ✅ admin | ✅ admin | ✅ admin | |
| `workspaces` | ✅ | ✅ lid | ✅ authenticated | ✅ admin | ❌ | Trigger: aanmaker → admin |

### Migraties — uitvoerstatus

> Voer uit in Supabase Dashboard → SQL Editor in **deze volgorde**.

| Bestand | Status | Opmerking |
|---------|--------|-----------|
| `001_multi_tenant_setup.sql` | ❓ onbekend | Bevat seed daily_facts + SECURITY DEFINER zonder search_path (gefixed in 20260322) |
| `20260318_enterprise_licensing.sql` | ❓ onbekend | Organizations, license_keys, has_active_subscription |
| `20260318b_cv_uploads_storage.sql` | ⚠️ dead code | Bucket `cv_uploads` is vervangen door `resumes` — policies zijn obsoleet |
| `20260318c_app_assets_storage.sql` | ❓ onbekend | app-assets bucket policies |
| `20260318084922_seed_daily_facts.sql` | ❓ onbekend | Seed data daily_facts |
| `20260319_analyses_rbac.sql` | ❓ onbekend | analyses tabel + RLS |
| `20260319b_analyses_locking.sql` | ❓ onbekend | is_locked kolom |
| `20260319c_analyses_source_url.sql` | ❓ onbekend | source_url + location kolommen |
| `20260319d_analyses_enrichment.sql` | ❓ onbekend | company_metadata + location_structured |
| `20260319e_company_assets_bucket.sql` | ❓ onbekend | company-assets bucket |
| `20260319f_user_settings.sql` | ⏳ nog uitvoeren | user_settings tabel |
| `20260319g_search_profiles.sql` | ⏳ nog uitvoeren | search_profiles tabel |
| `20260320_cv_analysis_jobs.sql` | ⏳ nog uitvoeren | cv_analysis_jobs + resumes bucket |
| `20260321_workspaces_rbac.sql` | ⏳ nog uitvoeren | workspaces, workspace_members, cv_analysis_jobs uitbreiding |
| `20260322_security_patches.sql` | ⏳ nog uitvoeren | **Security patches — hoge prioriteit** |
| `VERIFY_AND_FIX_ALL.sql` | 🛠️ noodscript | Volledig idempotent herstelscript — niet als standaard migratie uitvoeren |

---

## 3. Active Tasks

### TODO's in code

| Bestand | Regel | Beschrijving |
|---------|-------|--------------|
| `src/TL_V2_4_NT.jsx` | 2861 | `/* TODO: v.text && setVacText(v.text) */` — gem-click koppeling aan vacature-tab uitgeschakeld |

### Bekende openstaande zaken (uit audit)

| # | Onderdeel | Beschrijving |
|---|-----------|--------------|
| 1 | `authService.js` vs types | Queries `naam, locatie, telefoon, uurloon, is_org_admin, is_team_admin, team_id, organization_id` — deze velden staan niet in `database.types.ts` (types hebben `full_name`). Runtime werkt via raw fetch, TS-safety is gebroken. |
| 2 | `AnalyseView.jsx` | `matchVacature()` en `matchVacatureWithText()` zijn vrijwel identiek — code duplication. Systeemprompt staat op twee plekken; vergeten te synchroniseren bij aanpassing = latente bug. |
| 3 | `cv_uploads` bucket | Policies in `20260318b` zijn obsoleet. Bucket vervangen door `resumes`. Verwijder of archiveer. |
| 4 | `user_profiles` SELECT policy | Geen SELECT RLS policy aanwezig. App werkt nu via raw fetch maar elke `supabase.from('user_profiles').select(...)` call retourneert leeg. |
| 5 | Monolith model | `TL_V2_4_NT.jsx` gebruikt nog `claude-3-5-sonnet-20241022` (verouderd). Modular app gebruikt correct `claude-haiku-4-5-20251001` + `claude-sonnet-4-6`. |

---

## 4. Blockers

### Ontbrekende environment variabelen

#### Frontend (`.env` / Vercel)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ANTHROPIC_API_KEY=
VITE_BACKEND_URL=          # URL van de Railway backend
```

#### Backend (`backend/.env` / Railway)
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY= # ⚠️ Service role — nooit in frontend
ANTHROPIC_API_KEY=
WEBHOOK_SECRET=            # Moet overeenkomen met Supabase Webhook header
PORT=3001
```

#### Supabase Edge Functions (via Dashboard → Settings → Secrets)
```
STRIPE_SECRET_KEY=
STRIPE_PORTAL_CONFIGURATION_ID=
```

### Ontbrekende Supabase configuratie

| Item | Wat te doen |
|------|-------------|
| Database Webhook | Dashboard → Database → Webhooks → New: tabel `cv_analysis_jobs`, event `INSERT`, URL `https://<railway-url>/webhook/cv-job`, header `x-webhook-secret` |
| Realtime | `cv_analysis_jobs` moet in `supabase_realtime` publication staan (staat in migratie 20260320) |
| `resumes` bucket | Aanmaken via Dashboard → Storage als die nog niet bestaat (migratie 20260320 doet dit via SQL) |
| JWT custom claim | `user_role: "admin"` moet in `app_metadata` van admin-gebruiker staan — staat in VERIFY_AND_FIX_ALL maar vereist opnieuw inloggen na uitvoeren |

### Type-mismatches (nog openstaand)

| Tabel | Probleem |
|-------|---------|
| `user_profiles` | Types gebaseerd op nieuwe schema (`full_name`, `id`), `authService.js` gebruikt legacy kolommen (`naam`, `user_id`, etc.). Echte DB-structuur onbekend — verifieer met `SELECT column_name FROM information_schema.columns WHERE table_name = 'user_profiles'`. |

---

## 5. Quick Reference

### Lokale dev starten

```bash
# Frontend
npm install && npm run dev          # → http://localhost:5173

# Backend (apart terminal)
cd backend && npm install && npm run dev  # → http://localhost:3001
```

### Handige Supabase queries (Dashboard → SQL Editor)

```sql
-- Welke tabellen hebben RLS aan?
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' ORDER BY tablename;

-- Alle actieve RLS policies
SELECT tablename, policyname, cmd, qual
FROM pg_policies WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- user_profiles kolommen verifiëren
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles' ORDER BY ordinal_position;
```
