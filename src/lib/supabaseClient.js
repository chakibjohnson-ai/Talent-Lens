import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// SDK client — gebruik dit in hooks en services die de JS-SDK API willen (from/select/insert/etc.)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Raw headers — gebruik dit in services die directe fetch() calls maken (auth, REST v1)
export const SB_HEADERS = {
  'Content-Type':  'application/json',
  'apikey':        SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
};

// Sessiesleutel in localStorage (compatibel met Supabase JS SDK formaat)
export const SB_SESSION_KEY = `sb-${SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token`;
