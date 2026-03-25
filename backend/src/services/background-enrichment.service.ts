/**
 * background-enrichment.service.ts
 *
 * Modulaire enrichment-functies voor kandidaat-data.
 * Elke functie is geïsoleerd: een fout in één functie stopt de rest niet.
 *
 * Echte API-integraties:
 *   - getTravelTime  → Mapbox Directions API (https://docs.mapbox.com/api/navigation/directions/)
 *   - getCompanyLogo → Brandfetch REST API  (https://docs.brandfetch.com/)
 *   - getSalaryIndication → Adzuna Jobs API (https://developer.adzuna.com/)
 */

// ─── Result-interfaces ────────────────────────────────────────────────────────

export interface TravelTimeResult {
  /** Reistijd in minuten (auto) */
  duration_minutes: number | null;
  /** Afstand in kilometers */
  distance_km: number | null;
  mode: 'driving';
}

export interface CompanyLogoResult {
  /** Publieke CDN-URL van het logo */
  logo_url: string | null;
  /** Herleid domein dat gebruikt werd voor de lookup */
  domain: string | null;
}

export interface SalaryIndicationResult {
  /** Bruto jaarsalaris minimum (EUR) */
  min_gross_annual: number | null;
  /** Bruto jaarsalaris maximum (EUR) */
  max_gross_annual: number | null;
  currency: string;
  /** Naam van de databron */
  source: string;
}

// ─── Omgevingsvariabelen ──────────────────────────────────────────────────────

const MAPBOX_ACCESS_TOKEN  = process.env.MAPBOX_ACCESS_TOKEN ?? '';
const BRANDFETCH_API_KEY   = process.env.BRANDFETCH_API_KEY  ?? '';
const ADZUNA_APP_ID        = process.env.ADZUNA_APP_ID       ?? '';
const ADZUNA_APP_KEY       = process.env.ADZUNA_APP_KEY      ?? '';

// ─── Hulpfuncties ─────────────────────────────────────────────────────────────

/**
 * Zet een bedrijfsnaam om naar een waarschijnlijk domein.
 * Bijv. "Acme Corp" → "acmecorp.com"
 * Placeholder: in productie kun je een bedrijf-lookup API gebruiken.
 */
function guessDomain(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .concat('.com');
}

// ─── Service-functies ─────────────────────────────────────────────────────────

/**
 * Berekent de reistijd van kandidaat-postcode naar kantoor via Mapbox Directions API.
 *
 * Echte implementatie:
 *   GET https://api.mapbox.com/geocoding/v5/mapbox.places/{zip}.json?access_token=...
 *   → coördinaten ophalen, dan:
 *   GET https://api.mapbox.com/directions/v5/mapbox/driving/{lon1},{lat1};{lon2},{lat2}
 *       ?access_token=...&overview=false
 *   → routes[0].duration (seconden) + distance (meter)
 */
export async function getTravelTime(
  candidateZip: string,
  officeZip: string,
): Promise<TravelTimeResult> {
  if (!MAPBOX_ACCESS_TOKEN) {
    console.warn('[enrichment] MAPBOX_ACCESS_TOKEN niet geconfigureerd — reistijd overgeslagen.');
    return { duration_minutes: null, distance_km: null, mode: 'driving' };
  }

  try {
    // TODO: Stap 1 — Geocode candidateZip → { lng, lat }
    // const candidateCoords = await geocodeZip(candidateZip, MAPBOX_ACCESS_TOKEN);
    // const officeCoords    = await geocodeZip(officeZip,    MAPBOX_ACCESS_TOKEN);

    // TODO: Stap 2 — Directions API aanroepen
    // const url = `https://api.mapbox.com/directions/v5/mapbox/driving/`
    //   + `${candidateCoords.lng},${candidateCoords.lat};`
    //   + `${officeCoords.lng},${officeCoords.lat}`
    //   + `?access_token=${MAPBOX_ACCESS_TOKEN}&overview=false`;
    // const resp = await fetch(url);
    // const data = await resp.json();
    // const route = data.routes[0];
    // return {
    //   duration_minutes: Math.round(route.duration / 60),
    //   distance_km:      Math.round(route.distance / 1000),
    //   mode: 'driving',
    // };

    // ── PLACEHOLDER ──────────────────────────────────────────────────────────
    console.log(`[enrichment] getTravelTime: ${candidateZip} → ${officeZip} (placeholder)`);
    return {
      duration_minutes: 30,
      distance_km:      25,
      mode: 'driving',
    };
  } catch (err) {
    console.error('[enrichment] getTravelTime mislukt:', err instanceof Error ? err.message : err);
    return { duration_minutes: null, distance_km: null, mode: 'driving' };
  }
}

/**
 * Haalt het bedrijfslogo op via de Brandfetch REST API.
 *
 * Echte implementatie:
 *   GET https://api.brandfetch.io/v2/brands/{domain}
 *   Headers: Authorization: Bearer <BRANDFETCH_API_KEY>
 *   → Response: brand.logos[0].formats[0].src
 */
export async function getCompanyLogo(companyName: string): Promise<CompanyLogoResult> {
  if (!BRANDFETCH_API_KEY) {
    console.warn('[enrichment] BRANDFETCH_API_KEY niet geconfigureerd — logo overgeslagen.');
    return { logo_url: null, domain: null };
  }

  const domain = guessDomain(companyName);

  try {
    // TODO: Echte Brandfetch API call
    // const resp = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
    //   headers: { Authorization: `Bearer ${BRANDFETCH_API_KEY}` },
    // });
    // if (!resp.ok) throw new Error(`Brandfetch HTTP ${resp.status}`);
    // const data = await resp.json();
    // const logoUrl = data?.logos?.[0]?.formats?.[0]?.src ?? null;
    // return { logo_url: logoUrl, domain };

    // ── PLACEHOLDER ──────────────────────────────────────────────────────────
    console.log(`[enrichment] getCompanyLogo: "${companyName}" → domain "${domain}" (placeholder)`);
    return {
      logo_url: `https://logo.clearbit.com/${domain}`,  // Clearbit als gratis fallback
      domain,
    };
  } catch (err) {
    console.error('[enrichment] getCompanyLogo mislukt:', err instanceof Error ? err.message : err);
    return { logo_url: null, domain };
  }
}

/**
 * Haalt een salarisrange op via de Adzuna Jobs API.
 *
 * Echte implementatie:
 *   GET https://api.adzuna.com/v1/api/jobs/nl/search/1
 *       ?app_id=<id>&app_key=<key>&what=<jobTitle>&content-type=application/json
 *   → mean_salary uit de response aggregates
 */
export async function getSalaryIndication(jobTitle: string): Promise<SalaryIndicationResult> {
  const EMPTY: SalaryIndicationResult = {
    min_gross_annual: null,
    max_gross_annual: null,
    currency: 'EUR',
    source: 'adzuna',
  };

  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    console.warn('[enrichment] ADZUNA_APP_ID/KEY niet geconfigureerd — salaris overgeslagen.');
    return EMPTY;
  }

  try {
    // TODO: Echte Adzuna API call
    // const encoded = encodeURIComponent(jobTitle);
    // const url = `https://api.adzuna.com/v1/api/jobs/nl/search/1`
    //   + `?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}`
    //   + `&what=${encoded}&content-type=application/json`;
    // const resp = await fetch(url);
    // if (!resp.ok) throw new Error(`Adzuna HTTP ${resp.status}`);
    // const data = await resp.json();
    // const meanSalary = data?.mean_salary ?? null;
    // return {
    //   min_gross_annual: meanSalary ? Math.round(meanSalary * 0.85) : null,
    //   max_gross_annual: meanSalary ? Math.round(meanSalary * 1.15) : null,
    //   currency: 'EUR',
    //   source: 'adzuna',
    // };

    // ── PLACEHOLDER ──────────────────────────────────────────────────────────
    console.log(`[enrichment] getSalaryIndication: "${jobTitle}" (placeholder)`);
    return {
      min_gross_annual: 42_000,
      max_gross_annual: 58_000,
      currency: 'EUR',
      source: 'adzuna-placeholder',
    };
  } catch (err) {
    console.error('[enrichment] getSalaryIndication mislukt:', err instanceof Error ? err.message : err);
    return EMPTY;
  }
}
