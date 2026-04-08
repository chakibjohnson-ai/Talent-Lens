/**
 * claudeClient.js — gecentraliseerde Claude-aanroepen via Supabase Edge Function
 *
 * API key leeft uitsluitend server-side (Supabase Secret ANTHROPIC_API_KEY).
 * Frontend stuurt verzoeken via supabase.functions.invoke('claude-proxy').
 *
 * Biedt:
 *  - callEdge(body, options?) — roept claude-proxy Edge Function aan
 *  - callClaude(body, _apiKey, options?) — legacy-wrapper, apiKey wordt genegeerd
 *  - In-memory sliding window rate limiter (max 15 calls per 60 seconden)
 */

import { supabase } from './supabaseClient.js';

const WINDOW_MS = 60_000;
const MAX_CALLS = 15;
const _timestamps = [];

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
 * Roept de claude-proxy Edge Function aan.
 *
 * @param {object} body         - Request body (model, max_tokens, system, messages, …)
 * @param {object} [options]
 * @param {boolean} [options.cache=false] - Voeg prompt-caching beta-header toe
 * @returns {Promise<object>}   - Geparseerde response JSON
 * @throws {Error}              - Bij rate limit, HTTP-fout of netwerkfout
 */
export async function callEdge(body, { cache = false } = {}) {
  checkRateLimit();

  const payload = cache ? { ...body, _cache: true } : body;

  const { data, error } = await supabase.functions.invoke('claude-proxy', {
    body: payload,
  });

  if (error) {
    const msg = error?.message || 'Edge Function fout';
    if (msg.includes('403') || msg.toLowerCase().includes('licentie')) {
      throw new Error('🔒 Geen actieve licentie. Activeer een licentiecode via Instellingen.');
    }
    if (msg.includes('401')) {
      throw new Error('🔑 Sessie verlopen. Log opnieuw in.');
    }
    if (msg.includes('429')) {
      throw new Error('⏳ API limiet bereikt. Wacht even en probeer opnieuw.');
    }
    throw new Error(msg);
  }

  return data;
}

/**
 * Legacy-wrapper — apiKey parameter wordt genegeerd.
 * Gebruik callEdge() voor nieuwe code.
 */
export async function callClaude(body, _apiKey, options = {}) {
  return callEdge(body, options);
}
