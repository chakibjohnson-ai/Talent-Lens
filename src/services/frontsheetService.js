import { SUPABASE_URL, SUPABASE_ANON_KEY, supabase } from '../lib/supabaseClient';

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    token:  session?.access_token || SUPABASE_ANON_KEY,
    userId: session?.user?.id     || null,
  };
}

/**
 * Sla een frontsheet op in de `frontsheets` tabel.
 *
 * @param {string} content  - HTML/Markdown inhoud van de frontsheet
 * @param {string} title    - Titel (bijv. kandidaatnaam)
 * @param {object} [user]   - Optioneel user-object voor tenant-ids
 * @returns {object}        - De nieuw aangemaakte rij
 * @throws {Error} Bij een Supabase-fout
 */
export async function saveFrontsheet(content, title, user = null) {
  const { token, userId } = await getToken();

  const resp = await fetch(`${SUPABASE_URL}/rest/v1/frontsheets`, {
    method:  'POST',
    headers: {
      apikey:          SUPABASE_ANON_KEY,
      Authorization:   `Bearer ${token}`,
      'Content-Type':  'application/json',
      Prefer:          'return=representation',
    },
    body: JSON.stringify({
      title:           title   || null,
      content,
      user_id:         user?.id                     || userId,
      team_id:         user?.profile?.team_id        || null,
      organization_id: user?.profile?.organization_id || null,
    }),
  });

  if (!resp.ok) {
    const msg = await resp.text().catch(() => '');
    throw new Error(`Supabase insert fout (${resp.status}): ${msg}`);
  }
  return resp.json();
}

/**
 * Haal alle frontsheets op voor de ingelogde gebruiker (RLS filtert automatisch).
 *
 * @returns {Array<{ id, created_at, title, content }>}
 * @throws {Error} Bij een Supabase-fout
 */
export async function fetchFrontsheets() {
  const { token } = await getToken();

  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/frontsheets` +
    `?select=id,created_at,title,content` +
    `&order=created_at.desc`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } }
  );

  if (!resp.ok) throw new Error(`Supabase fetch fout (${resp.status})`);
  return resp.json();
}

/**
 * Verwijder een frontsheet op basis van id.
 *
 * @param {string|number} id  - Primaire sleutel van de te verwijderen rij
 * @throws {Error} Bij een Supabase-fout
 */
export async function deleteFrontsheet(id) {
  const { token } = await getToken();

  const resp = await fetch(`${SUPABASE_URL}/rest/v1/frontsheets?id=eq.${id}`, {
    method:  'DELETE',
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });

  if (!resp.ok) throw new Error(`Supabase delete fout (${resp.status})`);
}
