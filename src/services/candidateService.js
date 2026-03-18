import { SUPABASE_URL, SUPABASE_ANON_KEY, supabase } from '../lib/supabaseClient';

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    token:  session?.access_token || SUPABASE_ANON_KEY,
    userId: session?.user?.id     || null,
  };
}

/**
 * Sla een geanalyseerde kandidaat op in de `candidates` tabel.
 * Voegt automatisch tenant-ids toe via de actieve Supabase sessie.
 *
 * @param {object} kandidaat  - Het volledige AI-analyse object (name, current_role, location, …)
 * @param {string} source     - Bron van het profiel ("LinkedIn", "CV", "URL", …)
 * @param {object} [user]     - Optioneel user-object met profile.team_id / profile.organization_id
 * @throws {Error}            - Bij een Supabase-fout of een netwerk-fout
 */
export async function saveToSupabase(kandidaat, source, user = null) {
  const { token, userId } = await getToken();

  // raw_text: samengestelde zoektekst voor toekomstige pgvector-search
  const rawSkills = (kandidaat.matched_skills || [])
    .slice(0, 15)
    .map(s => (typeof s === 'object' ? s.item : s))
    .filter(Boolean)
    .join(', ');
  const rawText = [
    kandidaat.name,
    kandidaat.current_role,
    kandidaat.location,
    rawSkills,
  ].filter(Boolean).join(' | ') || null;

  const resp = await fetch(`${SUPABASE_URL}/rest/v1/candidates`, {
    method: 'POST',
    headers: {
      'apikey':        SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json',
      'Prefer':        'return=minimal',
    },
    body: JSON.stringify({
      name:            kandidaat.name         || null,
      job_title:       kandidaat.current_role || null,
      location:        kandidaat.location     || null,
      source,
      ai_analysis:     kandidaat,
      raw_text:        rawText,
      user_id:         user?.id                     || userId,
      team_id:         user?.profile?.team_id        || null,
      organization_id: user?.profile?.organization_id || null,
    }),
  });

  if (!resp.ok) {
    const msg = await resp.text().catch(() => '');
    throw new Error(`Supabase fout (${resp.status}): ${msg}`);
  }
}
