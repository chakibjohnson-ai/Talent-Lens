/**
 * claudeClient.js — gecentraliseerde Anthropic API client
 *
 * Biedt:
 *  - callClaude(body, apiKey, options?) — fetch wrapper met foutafhandeling
 *  - In-memory sliding window rate limiter (max 15 calls per 60 seconden)
 *    Beschermt tegen accidentele hammering; Anthropic-limieten liggen veel hoger.
 */

const WINDOW_MS  = 60_000; // 1 minuut
const MAX_CALLS  = 15;     // max calls per venster per sessie

const _timestamps = [];

/**
 * Gooit een Error als de rate limit bereikt is.
 * @returns {void}
 */
function checkRateLimit() {
  const now = Date.now();
  while (_timestamps.length > 0 && _timestamps[0] < now - WINDOW_MS) {
    _timestamps.shift();
  }
  if (_timestamps.length >= MAX_CALLS) {
    const waitSec = Math.ceil((_timestamps[0] + WINDOW_MS - now) / 1000);
    throw new Error(`Te veel verzoeken. Wacht ${waitSec} seconden en probeer opnieuw.`);
  }
  _timestamps.push(now);
}

/**
 * Vertaalt HTTP-statuscode + body naar een bruikbare foutmelding.
 * @param {number} status
 * @param {object} data
 * @returns {string}
 */
function apiErrorMessage(status, data) {
  const msg = data?.error?.message || '';
  if (status === 401) return '🔑 Ongeldige API key. Controleer VITE_ANTHROPIC_API_KEY.';
  if (status === 429) return '⏳ Anthropic API limiet bereikt. Wacht even en probeer opnieuw.';
  if (status === 529) return '🔧 Anthropic API overbelast. Probeer over een minuut opnieuw.';
  if (status >= 500)  return `🔧 Anthropic server fout (${status}). Probeer opnieuw.`;
  return msg || `API fout ${status}`;
}

/**
 * Roept de Anthropic Messages API aan.
 *
 * @param {object} body         - Request body (model, max_tokens, system, messages, …)
 * @param {string} apiKey       - Anthropic API key
 * @param {object} [options]
 * @param {boolean} [options.cache=false] - Voeg prompt-caching beta-header toe
 * @returns {Promise<object>}   - Geparseerde response JSON
 * @throws {Error}              - Bij rate limit, HTTP-fout of netwerkfout
 */
export async function callClaude(body, apiKey, { cache = false } = {}) {
  checkRateLimit();

  const headers = {
    'Content-Type':                              'application/json',
    'x-api-key':                                 apiKey,
    'anthropic-dangerous-direct-browser-access': 'true',
    'anthropic-version':                         '2023-06-01',
    ...(cache ? { 'anthropic-beta': 'prompt-caching-2024-07-31' } : {}),
  };

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    throw new Error(apiErrorMessage(resp.status, data));
  }

  return data;
}
