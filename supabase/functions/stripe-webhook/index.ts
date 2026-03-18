// supabase/functions/stripe-webhook/index.ts
// Verwerkt Stripe events en synchroniseert subscription_status in user_profiles.
//
// Deploy:  supabase functions deploy stripe-webhook
// Secrets: supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
//
// Stripe-configuratie:
//   Dashboard → Webhooks → Endpoint URL:
//   https://<project-ref>.supabase.co/functions/v1/stripe-webhook
//   Events: customer.subscription.created/updated/deleted, invoice.payment_failed

import { createClient } from 'jsr:@supabase/supabase-js@2';

// ── Stripe signature verificatie (geen SDK nodig) ─────────────────────────────
async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string
): Promise<boolean> {
  const parts    = sigHeader.split(',').reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split('=');
    acc[k] = v;
    return acc;
  }, {});

  const timestamp = parts['t'];
  const signature = parts['v1'];
  if (!timestamp || !signature) return false;

  // Replay-aanval voorkomen: max 5 minuten oud
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (age > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac      = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const expected = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('');

  return expected === signature;
}

// ── Status-mapping Stripe → TalentLens ───────────────────────────────────────
function mapStripeStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':   return 'active';
    case 'past_due':   return 'past_due';
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired': return 'canceled';
    default:           return 'free';
  }
}

// ════════════════════════════════════════════════════════════════════════════
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!webhookSecret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET niet geconfigureerd');
    return new Response('Webhook secret ontbreekt', { status: 500 });
  }

  // ── 1. Lees raw body + verifieer handtekening ──────────────────────────────
  const payload   = await req.text();
  const sigHeader = req.headers.get('stripe-signature') || '';

  const valid = await verifyStripeSignature(payload, sigHeader, webhookSecret);
  if (!valid) {
    console.warn('[stripe-webhook] Ongeldige handtekening');
    return new Response('Ongeldige handtekening', { status: 400 });
  }

  // ── 2. Parse event ─────────────────────────────────────────────────────────
  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(payload);
  } catch {
    return new Response('Ongeldige JSON', { status: 400 });
  }

  console.log(`[stripe-webhook] Event: ${event.type}`);

  // ── 3. Initialiseer Supabase service-role client ──────────────────────────
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!   // service role — mag user_profiles updaten
  );

  const obj = event.data.object as Record<string, unknown>;

  // ── 4. Verwerk events ─────────────────────────────────────────────────────
  switch (event.type) {

    // Abonnement aangemaakt of bijgewerkt
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const customerId        = obj['customer']          as string;
      const stripeStatus      = obj['status']            as string;
      const subscriptionStatus = mapStripeStatus(stripeStatus);

      const { error } = await supabase
        .from('user_profiles')
        .update({ subscription_status: subscriptionStatus })
        .eq('stripe_customer_id', customerId);

      if (error) {
        console.error(`[stripe-webhook] Update mislukt voor customer ${customerId}:`, error);
        return new Response('DB update mislukt', { status: 500 });
      }
      console.log(`[stripe-webhook] ${customerId} → ${subscriptionStatus}`);
      break;
    }

    // Abonnement verwijderd
    case 'customer.subscription.deleted': {
      const customerId = obj['customer'] as string;

      const { error } = await supabase
        .from('user_profiles')
        .update({ subscription_status: 'canceled' })
        .eq('stripe_customer_id', customerId);

      if (error) {
        console.error(`[stripe-webhook] Delete update mislukt voor ${customerId}:`, error);
        return new Response('DB update mislukt', { status: 500 });
      }
      console.log(`[stripe-webhook] ${customerId} → canceled`);
      break;
    }

    // Betaling mislukt
    case 'invoice.payment_failed': {
      const customerId = obj['customer'] as string;

      const { error } = await supabase
        .from('user_profiles')
        .update({ subscription_status: 'past_due' })
        .eq('stripe_customer_id', customerId);

      if (error) {
        console.error(`[stripe-webhook] payment_failed update mislukt voor ${customerId}:`, error);
        return new Response('DB update mislukt', { status: 500 });
      }
      console.log(`[stripe-webhook] ${customerId} → past_due`);
      break;
    }

    // Checkout succesvol — sla stripe_customer_id op aan de hand van client_reference_id (= user email)
    case 'checkout.session.completed': {
      const customerId    = obj['customer']            as string;
      const customerEmail = obj['customer_email']      as string | undefined;
      const clientRef     = obj['client_reference_id'] as string | undefined; // stel in als user.email bij checkout

      const email = customerEmail || clientRef;
      if (!email) {
        console.warn('[stripe-webhook] checkout.session.completed: geen e-mail gevonden');
        break;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId, subscription_status: 'active' })
        .eq('email', email);

      if (error) {
        console.error(`[stripe-webhook] checkout update mislukt voor ${email}:`, error);
        return new Response('DB update mislukt', { status: 500 });
      }
      console.log(`[stripe-webhook] checkout: ${email} → ${customerId} (active)`);
      break;
    }

    default:
      console.log(`[stripe-webhook] Event genegeerd: ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
