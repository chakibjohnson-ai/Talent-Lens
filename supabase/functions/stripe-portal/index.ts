// supabase/functions/stripe-portal/index.ts
// Deno Edge Function — genereert een Stripe Billing Portal sessie-URL
//
// Deploy: supabase functions deploy stripe-portal
//
// Secrets vereist (supabase secrets set):
//   STRIPE_SECRET_KEY  — sk_live_... of sk_test_...
//   STRIPE_PORTAL_CONFIGURATION_ID  — (optioneel) bpc_... voor custom portal config

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── 1. Authenticeer de aanroeper via Supabase JWT ──────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Niet geauthenticeerd.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase    = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return new Response(
        JSON.stringify({ error: 'Ongeldige sessie.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── 2. Haal stripe_customer_id op uit user_profiles ───────────────────
    const { data: profile, error: profileErr } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id, subscription_status')
      .eq('email', user.email)
      .single();

    if (profileErr || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profiel niet gevonden.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile.stripe_customer_id) {
      return new Response(
        JSON.stringify({ error: 'Geen Stripe abonnement gevonden. Neem contact op met support.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── 3. Return URL uit request body ─────────────────────────────────────
    const body       = await req.json().catch(() => ({}));
    const returnUrl  = body.return_url || supabaseUrl;

    // ── 4. Maak Stripe Billing Portal sessie aan ───────────────────────────
    const stripeKey    = Deno.env.get('STRIPE_SECRET_KEY');
    const portalConfig = Deno.env.get('STRIPE_PORTAL_CONFIGURATION_ID');

    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe niet geconfigureerd. Stel STRIPE_SECRET_KEY in.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripeBody: Record<string, string> = {
      customer:   profile.stripe_customer_id,
      return_url: returnUrl,
    };
    if (portalConfig) {
      stripeBody.configuration = portalConfig;
    }

    const stripeResp = await fetch(
      'https://api.stripe.com/v1/billing_portal/sessions',
      {
        method:  'POST',
        headers: {
          'Authorization':  `Bearer ${stripeKey}`,
          'Content-Type':   'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(stripeBody).toString(),
      }
    );

    const stripeData = await stripeResp.json();

    if (!stripeResp.ok) {
      console.error('[stripe-portal] Stripe fout:', stripeData);
      return new Response(
        JSON.stringify({ error: stripeData.error?.message || 'Stripe fout.' }),
        { status: stripeResp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── 5. Retourneer de portal URL ────────────────────────────────────────
    return new Response(
      JSON.stringify({ url: stripeData.url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[stripe-portal] Onverwachte fout:', err);
    return new Response(
      JSON.stringify({ error: 'Interne serverfout.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
