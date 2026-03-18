import { supabase } from '../lib/supabaseClient';

// ── Locatie-mapping: regio → gerelateerde steden/termen ──────────────────────
const LOCATION_MAP = {
  'brabant':        ['Noord-Brabant', 'Tilburg', 'Eindhoven', 'Breda', "'s-Hertogenbosch", 'Helmond'],
  'noord-brabant':  ['Noord-Brabant', 'Tilburg', 'Eindhoven', 'Breda', "'s-Hertogenbosch"],
  'randstad':       ['Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht', 'Haarlem', 'Leiden'],
  'amsterdam':      ['Amsterdam', 'Amstelveen', 'Haarlem', 'Noord-Holland'],
  'rotterdam':      ['Rotterdam', 'Dordrecht', 'Schiedam', 'Zuid-Holland'],
  'utrecht':        ['Utrecht', 'Amersfoort', 'Nieuwegein', 'Woerden'],
  'gelderland':     ['Nijmegen', 'Arnhem', 'Apeldoorn', 'Ede', 'Gelderland'],
  'overijssel':     ['Zwolle', 'Enschede', 'Deventer', 'Almelo', 'Overijssel'],
  'limburg':        ['Maastricht', 'Venlo', 'Sittard', 'Heerlen', 'Roermond'],
  'friesland':      ['Leeuwarden', 'Sneek', 'Drachten', 'Friesland'],
  'groningen':      ['Groningen', 'Assen', 'Emmen', 'Drenthe'],
  'zeeland':        ['Middelburg', 'Vlissingen', 'Goes', 'Zeeland'],
  'flevoland':      ['Almere', 'Lelystad', 'Flevoland'],
  'den haag':       ['Den Haag', "'s-Gravenhage", 'Delft', 'Zoetermeer', 'Zuid-Holland'],
  'leiden':         ['Leiden', 'Leiderdorp', 'Alphen aan den Rijn', 'Zuid-Holland'],
  'haarlem':        ['Haarlem', 'Haarlemmermeer', 'Noord-Holland'],
  'noord-holland':  ['Amsterdam', 'Haarlem', 'Alkmaar', 'Zaandam', 'Noord-Holland'],
  'zuid-holland':   ['Rotterdam', 'Den Haag', 'Leiden', 'Dordrecht', 'Zuid-Holland'],
};

/**
 * Breid een locatieterm uit naar gerelateerde steden/regio's
 * @param {string} location
 * @returns {string[]}
 */
export function expandLocation(location) {
  if (!location) return [];
  const key = location.toLowerCase().trim();
  // Exacte match
  if (LOCATION_MAP[key]) return LOCATION_MAP[key];
  // Partial match
  for (const [mapKey, values] of Object.entries(LOCATION_MAP)) {
    if (key.includes(mapKey) || mapKey.includes(key)) return values;
  }
  return [location];
}

// ── AI Search Parser ──────────────────────────────────────────────────────────
/**
 * Parseer een natuurlijke-taal zoekopdracht naar gestructureerde data via Claude
 * @param {string} query     - bijv. "2 jaar ervaring longzorg Brabant Engels"
 * @param {string} apiKey    - Anthropic API key
 * @returns {Promise<{min_experience: number|null, sector: string|null, regions: string[], tags: string[], languages: string[]}>}
 */
export async function parseSearchQuery(query, apiKey) {
  if (!query?.trim()) throw new Error('Zoekopdracht is leeg');

  const system = `Je bent een recruitment search parser. Extraheer gestructureerde entiteiten uit een Nederlandse zoekopdracht voor kandidaten. Retourneer UITSLUITEND geldige JSON op 1 regel zonder uitleg of backticks.

Schema: {"min_experience": number|null, "sector": string|null, "regions": string[], "tags": string[], "languages": string[]}

Regels:
- min_experience: minimale jaren ervaring als getal (bijv. 2), null als niet vermeld
- sector: de werkgebied/specialisme (bijv. "longzorg", "QA", "Medical Devices"), null als niet vermeld
- regions: geografische locaties letterlijk uit de query (bijv. ["Brabant"])
- tags: overige relevante zoektermen (functies, skills, certificaten, etc.)
- languages: gevraagde talen (bijv. ["Engels", "Duits"]), leeg als niet vermeld`;

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system,
      messages: [{ role: 'user', content: `Parseer: "${query}"` }],
    }),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data?.error?.message || `API fout (${resp.status})`);

  let raw = data.content?.[0]?.text?.trim() || '{}';
  // Strip eventuele markdown code blocks (```json ... ```)
  raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  // Extraheer het eerste JSON object als er extra tekst omheen staat
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) raw = jsonMatch[0];
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('AI kon de zoekopdracht niet verwerken. Probeer het opnieuw.');
  }

  // Breid regio's uit met gerelateerde steden
  const rawRegions = parsed.regions || [];
  const expandedTags = rawRegions.flatMap(r => expandLocation(r));

  return {
    min_experience: parsed.min_experience ?? null,
    sector:         parsed.sector ?? null,
    regions:        rawRegions,
    tags:           [...new Set([...(parsed.tags || []), ...expandedTags])],
    languages:      parsed.languages || [],
  };
}

// ── Supabase: zoekprofiel opslaan ─────────────────────────────────────────────
/**
 * @param {string} userId
 * @param {string} rawQuery
 * @param {object} structuredData
 * @returns {Promise<object>} - opgeslagen rij
 */
export async function saveSearchProfile(userId, rawQuery, structuredData) {
  const { data, error } = await supabase
    .from('search_profiles')
    .insert({ user_id: userId, raw_query: rawQuery, structured_data: structuredData })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ── Supabase: recente zoekprofielen ophalen ───────────────────────────────────
/**
 * @param {string} userId
 * @param {number} limit
 * @returns {Promise<object[]>}
 */
export async function fetchSearchProfiles(userId, limit = 20) {
  const { data, error } = await supabase
    .from('search_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data || [];
}
