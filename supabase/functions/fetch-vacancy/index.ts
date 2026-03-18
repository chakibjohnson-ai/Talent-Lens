import { serve }        from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "company-assets";

// ── HTML → platte tekst ──────────────────────────────────────────────────────
function htmlToText(html: string): string {
  return html
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?(p|div|h[1-6]|li|br|tr|section|article|header|footer|main|nav|aside)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&#\d+;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 12000);
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function resolveUrl(href: string, base: string): string {
  try { return new URL(href, base).toString(); } catch { return href; }
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "unknown";
}

function extFromContentType(ct: string): string {
  if (ct.includes("image/png"))                                     return ".png";
  if (ct.includes("image/jpeg") || ct.includes("image/jpg"))       return ".jpg";
  if (ct.includes("image/webp"))                                    return ".webp";
  if (ct.includes("image/gif"))                                     return ".gif";
  if (ct.includes("image/svg"))                                     return ".svg";
  if (ct.includes("image/x-icon") || ct.includes("vnd.microsoft")) return ".ico";
  return ".png";
}

// ── Metadata extractie uit HTML ──────────────────────────────────────────────
interface Metadata {
  name:     string | null;
  logo_url: string | null;
}

function extractMetadata(html: string, pageUrl: string): Metadata {
  // Bedrijfsnaam: og:site_name → og:title (deel na |/-) → <title> (deel na |/-)
  let name: string | null = null;

  const ogSiteName = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i);
  if (ogSiteName?.[1]) name = ogSiteName[1].trim();

  if (!name) {
    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
    if (ogTitle?.[1]) {
      const parts = ogTitle[1].split(/[|\-–—]/);
      name = (parts.length > 1 ? parts[parts.length - 1] : parts[0]).trim();
    }
  }

  if (!name) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch?.[1]) {
      const parts = titleMatch[1].split(/[|\-–—]/);
      name = (parts.length > 1 ? parts[parts.length - 1] : parts[0]).trim();
    }
  }

  // Logo: og:image → apple-touch-icon → icon/shortcut icon → /favicon.ico
  let logo_url: string | null = null;

  const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (ogImage?.[1]) logo_url = resolveUrl(ogImage[1].trim(), pageUrl);

  if (!logo_url) {
    const appleIcon = html.match(/<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i)
      || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']apple-touch-icon["']/i);
    if (appleIcon?.[1]) logo_url = resolveUrl(appleIcon[1].trim(), pageUrl);
  }

  if (!logo_url) {
    const faviconMatch = html.match(/<link[^>]+rel=["'](?:shortcut icon|icon)["'][^>]+href=["']([^"']+)["']/i)
      || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut icon|icon)["']/i);
    if (faviconMatch?.[1]) logo_url = resolveUrl(faviconMatch[1].trim(), pageUrl);
  }

  if (!logo_url) {
    try {
      const u = new URL(pageUrl);
      logo_url = `${u.protocol}//${u.host}/favicon.ico`;
    } catch { /* ignore */ }
  }

  return { name, logo_url };
}

// ── Logo uploaden naar Supabase Storage ──────────────────────────────────────
// Pad: logos/{company-slug}/logo{.ext}  (upsert=true → altijd zelfde pad per bedrijf)
async function uploadLogo(
  supabase: ReturnType<typeof createClient>,
  logoUrl:  string,
  companyName: string,
): Promise<string | null> {
  try {
    const imgRes = await fetch(logoUrl, {
      headers: { "User-Agent": "TalentLens/1.0" },
      redirect: "follow",
    });
    if (!imgRes.ok) return null;

    const ct = imgRes.headers.get("content-type") || "image/png";
    if (!ct.startsWith("image/")) return null;

    const bytes = await imgRes.arrayBuffer();
    if (bytes.byteLength > 2 * 1024 * 1024) return null; // max 2 MB

    const slug = toSlug(companyName);
    const ext  = extFromContentType(ct);
    const path = `logos/${slug}/logo${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: ct, upsert: true });

    if (error) {
      console.warn("[TL] logo upload fout:", error.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return publicUrl;
  } catch (e) {
    console.warn("[TL] logo upload exception:", e);
    return null;
  }
}

// ── Main handler ─────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "URL verplicht" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: "Ongeldige URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return new Response(
        JSON.stringify({ error: "Alleen HTTP(S) URLs toegestaan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control":   "no-cache",
      },
      redirect: "follow",
    });

    if (res.status === 403 || res.status === 401 || res.status === 429) {
      return new Response(
        JSON.stringify({ blocked: true, status: res.status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Pagina niet beschikbaar (HTTP ${res.status})` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      return new Response(
        JSON.stringify({ error: "URL verwijst niet naar een HTML-pagina" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const html = await res.text();
    const text = htmlToText(html);

    if (!text || text.length < 50) {
      return new Response(
        JSON.stringify({ error: "Pagina bevat te weinig tekst om te verwerken" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Extraheer metadata
    const metadata = extractMetadata(html, res.url || url);

    // Upload logo naar Supabase Storage en vervang externe URL door interne URL
    if (metadata.logo_url) {
      const supabaseUrl  = Deno.env.get("SUPABASE_URL")              ?? "";
      const serviceKey   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
      if (supabaseUrl && serviceKey) {
        const supabase  = createClient(supabaseUrl, serviceKey);
        const storedUrl = await uploadLogo(supabase, metadata.logo_url, metadata.name || "unknown");
        if (storedUrl) metadata.logo_url = storedUrl;
        // Als upload mislukt, blijft de originele externe URL staan (frontend-fallback pakt dat op)
      }
    }

    return new Response(
      JSON.stringify({ text, metadata }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
