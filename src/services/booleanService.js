import { SUPABASE_URL, SUPABASE_ANON_KEY, supabase } from '../lib/supabaseClient';

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    token:  session?.access_token || SUPABASE_ANON_KEY,
    userId: session?.user?.id     || null,
  };
}

/**
 * Haal opgeslagen Boolean strings op uit `saved_booleans`.
 * SUPER-gebruiker (labelId === "SUPER") ziet álle rijen — anderen zien alleen hun eigen label.
 *
 * @param {string} labelId  - Team-label van de ingelogde gebruiker, of "SUPER"
 * @returns {Array<{ id, created_at, label_id, title, boolean_string }>}
 * @throws {Error} Bij een Supabase-fout
 */
export async function fetchSavedBooleans(labelId) {
  const { token } = await getToken();
  const filter = labelId === 'SUPER'
    ? ''
    : `&label_id=eq.${encodeURIComponent(labelId)}`;

  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/saved_booleans` +
    `?select=id,created_at,label_id,title,boolean_string` +
    `&order=created_at.desc` +
    filter,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } }
  );

  if (!resp.ok) throw new Error(`Supabase fetch fout (${resp.status})`);
  return resp.json();
}

/**
 * Sla een nieuwe Boolean string op in `saved_booleans`.
 *
 * @param {string} title          - Naam/titel van de Boolean
 * @param {string} booleanString  - De Boolean string zelf
 * @param {string} labelId        - Team-label van de opslaner
 * @param {object} [user]         - Optioneel user-object voor tenant-ids
 * @returns {object}              - De nieuw aangemaakte rij (representation)
 * @throws {Error} Bij een Supabase-fout
 */
export async function insertSavedBoolean(title, booleanString, labelId, user = null) {
  const { token, userId } = await getToken();

  const resp = await fetch(`${SUPABASE_URL}/rest/v1/saved_booleans`, {
    method:  'POST',
    headers: {
      apikey:          SUPABASE_ANON_KEY,
      Authorization:   `Bearer ${token}`,
      'Content-Type':  'application/json',
      Prefer:          'return=representation',
    },
    body: JSON.stringify({
      title,
      boolean_string:  booleanString,
      label_id:        labelId,
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
 * Verwijder een opgeslagen Boolean string op basis van id.
 *
 * @param {string|number} id  - Primaire sleutel van de te verwijderen rij
 * @throws {Error} Bij een Supabase-fout
 */
export async function deleteSavedBoolean(id) {
  const { token } = await getToken();

  const resp = await fetch(`${SUPABASE_URL}/rest/v1/saved_booleans?id=eq.${id}`, {
    method:  'DELETE',
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });

  if (!resp.ok) throw new Error(`Supabase delete fout (${resp.status})`);
}
