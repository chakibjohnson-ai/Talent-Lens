import { supabase } from '../lib/supabaseClient';
import { callClaude } from '../lib/claudeClient';

// ── Kanaal- en stijlconfiguratie ─────────────────────────────────────────────
export const CHANNELS = ['LinkedIn Connect', 'InMail', 'E-mail', 'Follow-up'];

export const FILTER_TYPES = ['Corporate', 'Start-up Bold', 'Warm', 'Direct'];

const STYLE_PRESETS = {
  'Corporate': 'Professioneel, formeel en zakelijk. Gebruik volledige zinnen, geen jargon, respectvolle aanhef.',
  'Start-up Bold': 'Energiek, kort en direct. Gebruik actieve taal, puntige zinnen, af en toe een emoji.',
  'Warm': 'Persoonlijk en empathisch. Schrijf zoals je met een bekende praat, oprechte interesse tonen.',
  'Direct': 'To the point, geen opsmuk. Noem direct de reden van contact en wat je vraagt.',
};

const CHANNEL_GUIDANCE = {
  'LinkedIn Connect': 'Connectieverzoek (max 300 tekens). Geen lange introductie, alleen reden tot connecten.',
  'InMail': 'LinkedIn InMail (max 1900 tekens). Intro + reden + concrete vraag of CTA.',
  'E-mail': 'E-mail (vrije lengte). Onderwerpregel + aanhef + body + afsluiting.',
  'Follow-up': 'Follow-up bericht na eerder contact (kort). Verwijs terug, voeg iets toe, vraag om reactie.',
};

// ── Kantoorpostcode opslaan ───────────────────────────────────────────────────
export async function saveOfficeZip(userId, zip) {
  const { error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, office_zip_code: zip.trim() },
            { onConflict: 'user_id' });
  if (error) throw new Error(error.message);
}

// ── Kantoorpostcode ophalen ───────────────────────────────────────────────────
export async function fetchOfficeZip(userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('office_zip_code')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.office_zip_code || '';
}

// ── Schrijfstijl opslaan ──────────────────────────────────────────────────────
export async function saveWritingStyle(userId, sample) {
  const { error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, writing_style_sample: sample },
            { onConflict: 'user_id' });
  if (error) throw new Error(error.message);
}

// ── Schrijfstijl ophalen ──────────────────────────────────────────────────────
export async function fetchWritingStyle(userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('writing_style_sample')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.writing_style_sample || '';
}

// ── Outreach bericht genereren ────────────────────────────────────────────────
/**
 * @param {object} params
 * @param {object} params.vacancy_data       - vacature_samenvatting uit AnalyseView
 * @param {string} params.channel            - bijv. 'LinkedIn Connect'
 * @param {'filter'|'user_sample'} params.style_source
 * @param {string} params.filter_type        - bijv. 'Corporate'
 * @param {string} params.writing_style_sample - eigen tekstvoorbeeld van gebruiker
 * @param {string} params.apiKey             - Anthropic API key
 * @returns {Promise<string>}                - gegenereerd bericht
 */
export async function generateOutreach({
  vacancy_data,
  channel,
  style_source,
  filter_type,
  writing_style_sample,
  apiKey,
}) {
  const channelGuide = CHANNEL_GUIDANCE[channel] || '';
  const functie      = vacancy_data?.functie || 'de functie';
  const bedrijf      = vacancy_data?.company?.name || 'het bedrijf';
  const sector       = vacancy_data?.sector || '';
  const skills       = (vacancy_data?.vereiste_skills || []).slice(0, 5).join(', ');
  const locatie      = vacancy_data?.locatie || '';

  let stijlInstructie;
  if (style_source === 'user_sample' && writing_style_sample?.trim()) {
    stijlInstructie = `Gebruik onderstaand tekstfragment UITSLUITEND als voorbeeld van de schrijfstijl (tone-of-voice, woordkeuze, ritme). Kopieer de inhoud NIET — schrijf een volledig nieuw bericht.\n\n<stijlvoorbeeld>\n${writing_style_sample.slice(0, 800)}\n</stijlvoorbeeld>`;
  } else {
    const preset = STYLE_PRESETS[filter_type] || STYLE_PRESETS['Direct'];
    stijlInstructie = `Schrijfstijl: ${preset}`;
  }

  const system = `Je bent een expert recruitmentcopywriter. Je schrijft outreach berichten voor recruiters.
${stijlInstructie}

Kanaalgids: ${channelGuide}

Regels:
- Schrijf in het Nederlands
- Nooit generiek of robotachtig klinken
- Personaliseer op basis van de vacaturedata
- Geef ALLEEN het bericht terug, geen uitleg of labels`;

  const user = `Schrijf een ${channel} bericht voor deze vacature:
- Functie: ${functie}
- Bedrijf: ${bedrijf}
${sector ? `- Sector: ${sector}` : ''}
${locatie ? `- Locatie: ${locatie}` : ''}
${skills ? `- Vereiste skills: ${skills}` : ''}`;

  const data = await callClaude(
    { model: 'claude-haiku-4-5-20251001', max_tokens: 600, system, messages: [{ role: 'user', content: user }] },
    apiKey,
  );
  return data.content?.[0]?.text?.trim() || '';
}

// ── Marktdata ophalen via Jina AI search + LLM samenvatting ─────────────────
/**
 * @param {string} jobTitle   - bijv. "QA Manager"
 * @param {string} region     - bijv. "Amsterdam"
 * @param {string} apiKey     - Anthropic API key
 * @param {object} ownVacancy - onze eigen vacature_samenvatting (optioneel, voor vergelijking)
 * @returns {Promise<string>} - AI-samenvatting van de markt
 */
export async function fetchMarketData(jobTitle, region, apiKey, ownVacancy = null) {
  const query = `${jobTitle} vacature ${region} salaris arbeidsvoorwaarden`;

  // Stap 1: Haal zoekresultaten op via Jina AI (gratis, geen API key nodig)
  let snippets = '';
  try {
    const searchResp = await fetch(
      `https://s.jina.ai/${encodeURIComponent(query)}`,
      {
        headers: {
          'Accept': 'application/json',
          'X-Return-Format': 'text',
        },
      }
    );
    if (searchResp.ok) {
      const text = await searchResp.text();
      // Neem max 1500 tekens — voldoende voor salaris/skills/arbeidsvoorwaarden
      snippets = text.slice(0, 1500);
    }
  } catch (_) {
    throw new Error('Zoekservice niet bereikbaar. Controleer je internetverbinding.');
  }

  if (!snippets.trim()) throw new Error('Geen zoekresultaten gevonden voor deze functie en regio.');

  // Stap 2: Stuur snippets naar Claude voor samenvatting
  const ownContext = ownVacancy?.kernvereisten
    ? `\n\nOnze eigen vacature: ${ownVacancy.functie || jobTitle} bij ${ownVacancy.company?.name || 'ons bedrijf'} — ${ownVacancy.kernvereisten}`
    : '';

  const system = `Je bent een recruitment marktanalist. Analyseer de zoekresultaten en geef een beknopte Nederlandse samenvatting van het marktaanbod voor deze functie.

Focus op:
1. Salarisrange (indien zichtbaar)
2. Meest gevraagde skills/vereisten
3. Werkgeverstype (corporate, scale-up, etc.)
4. Opvallende arbeidsvoorwaarden
${ownContext ? '5. Vergelijk kort met onze eigen vacature' : ''}

Schrijf max 4 korte alinea\'s. Gebruik bullet points waar nuttig. Vermeld als data beperkt is.`;

  const data = await callClaude(
    {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system,
      messages: [{
        role: 'user',
        content: `Zoekresultaten voor "${jobTitle} vacature ${region}":\n\n${snippets}${ownContext}`,
      }],
    },
    apiKey,
  );
  return data.content?.[0]?.text?.trim() || '';
}
