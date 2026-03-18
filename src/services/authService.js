import { SUPABASE_URL, SUPABASE_ANON_KEY, SB_HEADERS, SB_SESSION_KEY } from '../lib/supabaseClient';

export { SB_SESSION_KEY };

/**
 * Log in via Supabase Auth (REST, geen SDK).
 *
 * @param {string} email
 * @param {string} password
 * @returns {{ access_token, refresh_token, user: { email, ... } }}
 * @throws {Error} Bij foute credentials of netwerk-fout
 */
export async function sbSignIn(email, password) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method:  'POST',
    headers: SB_HEADERS,
    body:    JSON.stringify({ email, password }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error_description || d.msg || 'Inloggen mislukt.');
  return d; // { access_token, refresh_token, user: { email, ... } }
}

/**
 * Haal het gebruikersprofiel op uit `user_profiles`.
 * E-mail wordt uitgelezen uit de JWT payload (geen extra parameter nodig).
 *
 * @param {string} accessToken  - Geldig Supabase access token
 * @returns {object|null}       - Profiel-object of null als niet gevonden
 */
export async function sbGetProfile(accessToken) {
  const email = JSON.parse(atob(accessToken.split('.')[1])).email;
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/user_profiles` +
    `?email=eq.${encodeURIComponent(email)}` +
    `&select=email,naam,locatie,telefoon,uurloon,is_org_admin,is_team_admin,team_id,organization_id,` +
    `subscription_status,stripe_customer_id,is_tester,org_id` +
    `&limit=1`,
    { headers: { ...SB_HEADERS, Authorization: `Bearer ${accessToken}` } }
  );
  const d = await r.json();
  return Array.isArray(d) ? d[0] || null : null;
}

/**
 * Sla gewijzigde profielvelden op via PATCH.
 *
 * @param {string} accessToken  - Geldig Supabase access token
 * @param {string} email        - Email van de te updaten gebruiker
 * @param {object} fields       - Velden om te updaten, bijv. { naam, locatie, uurloon }
 */
export async function sbSaveProfile(accessToken, email, fields) {
  await fetch(
    `${SUPABASE_URL}/rest/v1/user_profiles?email=eq.${encodeURIComponent(email)}`,
    {
      method:  'PATCH',
      headers: { ...SB_HEADERS, Authorization: `Bearer ${accessToken}`, Prefer: 'return=minimal' },
      body:    JSON.stringify(fields),
    }
  );
}
