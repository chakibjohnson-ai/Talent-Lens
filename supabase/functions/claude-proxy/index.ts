/**
 * claude-proxy — Supabase Edge Function
 *
 * Proxy voor Anthropic Messages API. De ANTHROPIC_API_KEY blijft server-side.
 * Vereist een geldig Supabase JWT (anon of authenticated).
 * Controleert abonnementsstatus via has_active_subscription().
 */
import { serve }        from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, corsResponse } from "../_shared/cors.ts";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Geen autorisatie-header." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl        = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey    = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anthropicKey       = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY niet geconfigureerd." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verifieer JWT met de anon client
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Ongeldige sessie." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Controleer abonnementsstatus
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: hasAccess, error: accessError } = await adminClient.rpc(
      "has_active_subscription", { p_user_id: user.id }
    );
    if (accessError || !hasAccess) {
      return new Response(
        JSON.stringify({ error: "Geen actieve licentie. Activeer een licentiecode via Instellingen." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Payload doorsturen naar Anthropic ────────────────────────────────────
    const body = await req.json();

    // Bouw Anthropic headers
    const anthropicHeaders: Record<string, string> = {
      "Content-Type":    "application/json",
      "x-api-key":       anthropicKey,
      "anthropic-version": "2023-06-01",
    };
    if (body._cache) {
      anthropicHeaders["anthropic-beta"] = "prompt-caching-2024-07-31";
    }

    // Verwijder interne velden voor Anthropic
    const { _cache, ...anthropicBody } = body;

    const anthropicResp = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: anthropicHeaders,
      body: JSON.stringify(anthropicBody),
    });

    const data = await anthropicResp.json().catch(() => ({}));

    if (!anthropicResp.ok) {
      return new Response(JSON.stringify(data), {
        status: anthropicResp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Onbekende fout" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
