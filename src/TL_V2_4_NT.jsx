import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// 📦 INLINE: lib/supabaseClient.js
// ─────────────────────────────────────────────────────────────────────────────
const SUPABASE_URL      = "https://oaegviwfjvqiizbrelbe.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hZWd2aXdmanZxaWl6YnJlbGJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjQ3NzMsImV4cCI6MjA4ODY0MDc3M30.3cTzXIQVvpGrRv9LNn-2ohium3r7fAj6ZgVGPvAzsZ4";

// ─────────────────────────────────────────────────────────────────────────────
// 📦 INLINE: hooks/useAppData.js  (gebruikt fetch i.p.v. supabase-js SDK,
//    zodat de previewer geen externe npm-pakketten nodig heeft)
// ─────────────────────────────────────────────────────────────────────────────
function useAppData() {
  const [crmSkills,  setCrmSkills]  = React.useState([]);
  const [verticals,  setVerticals]  = React.useState([]);
  const [roles,      setRoles]      = React.useState([]);
  const [industries, setIndustries] = React.useState([]);
  const [loading,    setLoading]    = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      const headers = {
        "apikey":        SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      };
      try {
        setLoading(true);
        const [s, v, r, i] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/skills?select=name`,     { headers }).then(x => x.json()),
          fetch(`${SUPABASE_URL}/rest/v1/verticals?select=name`,  { headers }).then(x => x.json()),
          fetch(`${SUPABASE_URL}/rest/v1/roles?select=name`,      { headers }).then(x => x.json()),
          fetch(`${SUPABASE_URL}/rest/v1/industries?select=name`, { headers }).then(x => x.json()),
        ]);
        if (Array.isArray(s)) setCrmSkills(s.map(x => x.name));
        if (Array.isArray(v)) setVerticals(v.map(x => x.name));
        if (Array.isArray(r)) setRoles(r.map(x => x.name));
        if (Array.isArray(i)) setIndustries(i.map(x => x.name));
      } catch (err) {
        console.error("Fout bij ophalen data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return { crmSkills, verticals, roles, industries, loading };
}
  const TL_LOGO = "https://cebpwkavlxipkrqixbab.supabase.co/storage/v1/object/public/app-assets/TL_logo_trans.png";
  // ─────────────────────────────────────────────────────────────────────────────
  // 🎭 DEMO MODUS — zet op 'false' vlak vóór je échte presentatie / productie
  // ─────────────────────────────────────────────────────────────────────────────
  const DEMO_MODUS = false;
  // VERTICAL_COLORS — verplaatst naar extern config-bestand (stap 1 opschoning)
  
  const ROLE_VERTICAL = {"QA Manager": "Quality", "QA Officer": "Quality", "QA Director": "Quality", "QC Manager": "Quality", "QC Officer": "Quality", "QC Director": "Quality", "RA Manager": "Quality", "RA Director": "Quality", "RA Specialist": "Quality", "Environment, Health & Safety (EHS)": "Quality", "Quality, Environment, health & Safety (QESH)": "Quality", "Validation/CSV": "Quality", "Auditor": "Quality", "QA Projectmanager": "Quality", "Qualified Person (QP)": "Quality", "Responsible Person (RP)": "Quality", "QA Engineer": "Quality", "QA Specialist": "Quality", "Health, Safety & Environment (HSE)": "Quality", "Pharmacist": "Quality", "Lead Auditor": "Quality", "Quality Release Officer": "Quality", "RA Officer": "Quality", "Maintenance Manager": "Maintenance", "Maintenance Coordinator": "Maintenance", "Maintenance Engineer": "Maintenance", "Reliability Engineer": "Maintenance", "Werkvoorbereider": "Maintenance", "Technisch Manager": "Maintenance", "Monteur": "Maintenance", "Teamleider Maintenance": "Maintenance", "Field Service Engineer": "Maintenance", "Capex Project Manager": "Engineering", "Proces Engineer": "Engineering", "Automation Engineer": "Engineering", "Mechanical Engineer": "Engineering", "Procestechnoloog": "Engineering", "Project Engineer": "Engineering", "E&I Engineer": "Engineering", "Commissioning Engineer": "Engineering", "Engineering Manager": "Engineering", "Constructie Manager": "Engineering", "EPC Manager": "Engineering", "Technology Manager": "Engineering", "Lead Engineer": "Engineering", "Service Engineer": "Engineering", "Service Manager": "Engineering", "Technical Drawer": "Engineering", "Sales Engineer": "Engineering", "Sales": "Sales & Marketing", "Marketing": "Sales & Marketing", "Key Account": "Sales & Marketing", "Manager (PTR)": "Sales & Marketing", "Director (PTR)": "Sales & Marketing", "Product Specialist": "Sales & Marketing", "Development": "Sales & Marketing", "Business Development Manager": "Sales & Marketing", "Teamleider": "Operations", "Productie Manager": "Operations", "Operations Director": "Operations"};
  
  const REGIO_NOORD = ["Noord-Holland","Groningen","Friesland","Flevoland","Utrecht","Drenthe"];
  
  const REGIO_ZUID  = ["Zuid-Holland","Overijssel","Noord-Brabant","Limburg","Gelderland"];
  
  const NOORD_CITIES = ["amsterdam","haarlem","alkmaar","zaandam","hilversum","almere","lelystad","amersfoort","utrecht","groningen","leeuwarden","assen","emmen"];
  
  const ZUID_CITIES  = ["rotterdam","den haag","leiden","delft","dordrecht","zwolle","enschede","eindhoven","tilburg","breda","maastricht","nijmegen","arnhem","apeldoorn","venlo"];
  
  const DAILY_FACTS = [
    "Gemiddeld bekijkt een recruiter een cv slechts 7 seconden voordat hij een eerste oordeel vormt.",
    "Meer dan 87% van de recruiters gebruikt LinkedIn als primair zoekplatform.",
    "Het eerste CV ooit werd geschreven door Leonardo da Vinci in 1482.",
    "ChatGPT bereikte 100 miljoen gebruikers in slechts 2 maanden — snelste app-adoptie ooit.",
    "In 2025 verdringt AI 85 miljoen banen — maar creëert er ook 97 miljoen nieuwe.",
    "Bedrijven met sterke employer brand ontvangen 50% meer sollicitaties.",
    "Nederlanders switchen gemiddeld elke 3,5 jaar van baan.",
    "82% van hiring managers vindt soft skills net zo belangrijk als hard skills.",
    "Remote werken steeg na 2020 met 300% — 58% prefereert het boven kantoor.",
    "Life sciences is een van de snelst groeiende sectoren in Nederland met 10% banengroei.",
    "De gemiddelde persoon besteedt 90.000 uur van zijn leven aan werk.",
    "Er zijn meer mogelijke schaakpartijen dan atomen in het waarneembare heelal.",
    "Cleopatra leefde dichter bij de uitvinding van de iPhone dan bij de bouw van de Grote Piramide.",
    "De T-rex leefde dichter bij onze tijd dan bij die van de Stegosaurus.",
    "Honing bederft nooit — in Egyptische piramides gevonden honing van 3000 jaar oud was nog eetbaar.",
    "Een dag op Venus duurt langer dan een jaar op Venus.",
    "Er zijn meer bomen op aarde dan sterren in de Melkweg.",
    "De menselijke neus kan meer dan 1 biljoen verschillende geuren onderscheiden.",
    "Water kan tegelijkertijd koken en bevriezen — dit heet het tripelpunt.",
    "Astronauten groeien in de ruimte gemiddeld 5 cm door het ontbreken van zwaartekracht.",
    // ── Nieuw: Recruitment psychologie ──
    "Kandidaten die in de ochtend worden geïnterviewd scoren gemiddeld 20% beter dan namiddag — de hersenen zijn dan scherper.",
    "De kleur blauw in een kantoor wekt vertrouwen — kandidaten die blauw dragen worden onbewust als betrouwbaarder ervaren.",
    "De 'halo-bias' zorgt ervoor dat een recruiter na één positieve eigenschap onbewust alles positiever beoordeelt.",
    "Mensen beslissen in de eerste 90 seconden of ze iemand vertrouwen — 55% op basis van lichaamstaal alleen.",
    "Kandidaten die tijdens interviews knikken worden gemiddeld 3x zo sympathiek beoordeeld als degenen die roerloos zitten.",
    "Studies tonen dat cv's met een professionele foto 40% vaker worden bekeken dan cv's zonder foto.",
    // ── Nieuw: Gekke geschiedenis ──
    "De Universiteit van Oxford bestaat al langer dan de Azteken — Oxford begon in 1096, de Azteken in 1427.",
    "Mammoetwol was nog op aarde toen de Grote Piramide van Giza al 1000 jaar oud was.",
    "Nintendo werd opgericht in 1889 — als fabrikant van speelkaarten, lang vóór de eerste computer.",
    "Fax-technologie bestaat al langer dan de telefoon — de fax werd uitgevonden in 1843, de telefoon pas in 1876.",
    // ── Nieuw: Natuur / Bizar ──
    "Haaien zijn ouder dan bomen — haaien bestaan al 450 miljoen jaar, bomen slechts 360 miljoen jaar.",
    "Bananen delen 50% van hun DNA met mensen — en 85% met muizen.",
    "Een octopus heeft drie harten, blauw bloed en negen hersenen — één centraal en één per arm.",
    "Een dag duurt op Mercurius langer dan een jaar — de planeet draait trager om zijn as dan om de zon.",
  ];
  const DOMAIN_THEMES = {
    "morgangreen.nl": {
      // Lighter warm green — matches the bright lime-green banner
      bg:         "linear-gradient(170deg,#0B1F0E 0%,#0F2714 40%,#0A1A0C 100%)",
      accent:     "#4DC87A",
      accentDark: "#217A40",
      accentMid:  "#2FA854",
      accentGlow: "rgba(77,200,122,0.3)",
      accentFaint:"rgba(77,200,122,0.07)",
      accentBorder:"rgba(77,200,122,0.2)",
      badge:      "rgba(77,200,122,0.08)",
      badgeBorder:"rgba(77,200,122,0.2)",
      badgeText:  "rgba(77,200,122,0.9)",
      dot:        "#4DC87A",
      btnGrad:    "linear-gradient(135deg,#217A40,#2FA854)",
      progressGrad:"linear-gradient(90deg,#217A40,#2FA854,#6EE89A)",
      tabActive:  "#4DC87A",
      histHover:  "rgba(77,200,122,0.06)",
      histActive: "rgba(77,200,122,0.09)",
      histBorder: "rgba(77,200,122,0.28)",
      scrollThumb:"rgba(77,200,122,0.2)",
      label:      "Morgan Green",
    },
    "morganlab.nl": {
      // Clean slate-blue — matches the light muted lab banner
      bg:         "linear-gradient(170deg,#060E14 0%,#091520 40%,#050C12 100%)",
      accent:     "#00C2DE",
      accentDark: "#006A7A",
      accentMid:  "#008FA5",
      accentGlow: "rgba(0,194,222,0.28)",
      accentFaint:"rgba(0,194,222,0.06)",
      accentBorder:"rgba(0,194,222,0.18)",
      badge:      "rgba(0,194,222,0.07)",
      badgeBorder:"rgba(0,194,222,0.18)",
      badgeText:  "rgba(0,194,222,0.9)",
      dot:        "#00C2DE",
      btnGrad:    "linear-gradient(135deg,#006A7A,#008FA5)",
      progressGrad:"linear-gradient(90deg,#006A7A,#00A8C2,#67E8F9)",
      tabActive:  "#00C2DE",
      histHover:  "rgba(0,194,222,0.05)",
      histActive: "rgba(0,194,222,0.08)",
      histBorder: "rgba(0,194,222,0.28)",
      scrollThumb:"rgba(0,194,222,0.2)",
      label:      "Morgan Lab",
    },
    "morganblack.nl": {
      // Obsidian black — sleek, minimal, premium
      bg:         "linear-gradient(170deg,#080808 0%,#111111 50%,#0A0A0A 100%)",
      accent:     "#C8C8C8",
      accentDark: "#555555",
      accentMid:  "#888888",
      accentGlow: "rgba(200,200,200,0.15)",
      accentFaint:"rgba(255,255,255,0.04)",
      accentBorder:"rgba(255,255,255,0.1)",
      badge:      "rgba(255,255,255,0.04)",
      badgeBorder:"rgba(255,255,255,0.1)",
      badgeText:  "rgba(255,255,255,0.5)",
      dot:        "#888888",
      btnGrad:    "linear-gradient(135deg,#333333,#555555)",
      progressGrad:"linear-gradient(90deg,#333333,#777777,#CCCCCC)",
      tabActive:  "#C8C8C8",
      histHover:  "rgba(255,255,255,0.03)",
      histActive: "rgba(255,255,255,0.05)",
      histBorder: "rgba(255,255,255,0.15)",
      scrollThumb:"rgba(255,255,255,0.12)",
      label:      "Morgan Black",
    },
    "morganrecruitment.nl": {
      // Deep navy — matches the astronaut/space MRG banner
      bg:         "linear-gradient(170deg,#060C18 0%,#0A1428 40%,#060B16 100%)",
      accent:     "#5B9BF0",
      accentDark: "#1E4A9E",
      accentMid:  "#2E64D4",
      accentGlow: "rgba(91,155,240,0.3)",
      accentFaint:"rgba(91,155,240,0.07)",
      accentBorder:"rgba(91,155,240,0.2)",
      badge:      "rgba(91,155,240,0.08)",
      badgeBorder:"rgba(91,155,240,0.2)",
      badgeText:  "rgba(91,155,240,0.9)",
      dot:        "#5B9BF0",
      btnGrad:    "linear-gradient(135deg,#1E4A9E,#2E64D4)",
      progressGrad:"linear-gradient(90deg,#1E4A9E,#2E64D4,#7BB3F8)",
      tabActive:  "#5B9BF0",
      histHover:  "rgba(91,155,240,0.06)",
      histActive: "rgba(91,155,240,0.09)",
      histBorder: "rgba(91,155,240,0.28)",
      scrollThumb:"rgba(91,155,240,0.2)",
      label:      "Morgan Recruitment",
    },
  };
  const DEFAULT_THEME = DOMAIN_THEMES["morgangreen.nl"];
  
  const BANNER_BLACK = "[https://cebpwkavlxipkrqixbab.supabase.co/storage/v1/object/public/app-assets/LinkedIn%20Banner%20Morgan%20Black.png](https://cebpwkavlxipkrqixbab.supabase.co/storage/v1/object/public/app-assets/LinkedIn%20Banner%20Morgan%20Black.png)";
  const BANNER_GREEN = "[https://cebpwkavlxipkrqixbab.supabase.co/storage/v1/object/public/app-assets/LinkedIn%20Banner%20Morgan%20Green.png](https://cebpwkavlxipkrqixbab.supabase.co/storage/v1/object/public/app-assets/LinkedIn%20Banner%20Morgan%20Green.png)";
  const BANNER_LAB = "[https://cebpwkavlxipkrqixbab.supabase.co/storage/v1/object/public/app-assets/LinkedIn%20Banner%20Morgan%20Lab.png](https://cebpwkavlxipkrqixbab.supabase.co/storage/v1/object/public/app-assets/LinkedIn%20Banner%20Morgan%20Lab.png)";
  const BANNER_MRG = "[https://cebpwkavlxipkrqixbab.supabase.co/storage/v1/object/public/app-assets/Linkedin%20Banner%20MRG.png](https://cebpwkavlxipkrqixbab.supabase.co/storage/v1/object/public/app-assets/Linkedin%20Banner%20MRG.png)";
// ------------------------------
  const DOMAIN_BANNER = {
    "morgangreen.nl": BANNER_GREEN,
    "morganlab.nl": BANNER_LAB,
    "morganblack.nl": BANNER_BLACK,
    "morganrecruitment.nl": BANNER_MRG,
  };
  // ── Anthropic API key (intern gebruik) ───────────────────────────────────────
  const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || "";

  // ── Supabase Auth helpers (geen SDK — directe REST calls) ─────────────────────
  const SB_HEADERS = {
    "Content-Type":  "application/json",
    "apikey":        SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  };

  async function sbSignIn(email, password) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: SB_HEADERS,
      body: JSON.stringify({ email, password }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error_description || d.msg || "Inloggen mislukt.");
    return d; // { access_token, refresh_token, user: { email, ... } }
  }

  async function sbGetProfile(accessToken) {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles?email=eq.${encodeURIComponent(
        JSON.parse(atob(accessToken.split(".")[1])).email
      )}&select=naam,locatie,telefoon,uurloon,is_org_admin,is_team_admin,team_id,organization_id&limit=1`,
      { headers: { ...SB_HEADERS, Authorization: `Bearer ${accessToken}` } }
    );
    const d = await r.json();
    return Array.isArray(d) ? d[0] || null : null;
  }

  async function sbSaveProfile(accessToken, email, fields) {
    await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles?email=eq.${encodeURIComponent(email)}`,
      {
        method:  "PATCH",
        headers: { ...SB_HEADERS, Authorization: `Bearer ${accessToken}`, "Prefer": "return=minimal" },
        body:    JSON.stringify(fields),
      }
    );
  }

  // Sessiesleutel in localStorage (compatibel met Supabase JS SDK formaat)
  const SB_SESSION_KEY = `sb-${SUPABASE_URL.split("//")[1].split(".")[0]}-auth-token`;
  
  // ── Supabase config ──────────────────────────────────────────────────────────
  // Supabase credentials zijn verplaatst naar lib/supabaseClient.js

  /* ── Boolean Library — Supabase helpers ── */
  async function fetchSavedBooleans(labelId) {
    // SUPER (admin@morganrecruitment.nl) ziet alles; anders filter op eigen label
    const filter = labelId === "SUPER"
      ? ""
      : `&label_id=eq.${encodeURIComponent(labelId)}`;
    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/saved_booleans?select=id,created_at,label_id,title,boolean_string&order=created_at.desc${filter}`,
      {
        headers: {
          "apikey":        SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!resp.ok) throw new Error(`Supabase fetch fout (${resp.status})`);
    return resp.json();
  }
  
  async function insertSavedBoolean(title, booleanString, labelId) {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/saved_booleans`, {
      method: "POST",
      headers: {
        "apikey":        SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type":  "application/json",
        "Prefer":        "return=representation",
      },
      body: JSON.stringify({ title, boolean_string: booleanString, label_id: labelId }),
    });
    if (!resp.ok) {
      const msg = await resp.text().catch(() => "");
      throw new Error(`Supabase insert fout (${resp.status}): ${msg}`);
    }
    return resp.json();
  }
  
  async function deleteSavedBoolean(id) {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/saved_booleans?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        "apikey":        SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!resp.ok) throw new Error(`Supabase delete fout (${resp.status})`);
  }
  
  async function saveToSupabase(kandidaat, source) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Supabase is nog niet geconfigureerd. Vul SUPABASE_URL en SUPABASE_ANON_KEY in bovenaan het bestand.");
    }
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/candidates`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        name:       kandidaat.name        || null,
        job_title:  kandidaat.current_role || null,
        location:   kandidaat.location    || null,
        source:     source,
        ai_analysis: kandidaat,
      }),
    });
    if (!resp.ok) {
      const msg = await resp.text().catch(()=>"");
      throw new Error(`Supabase fout (${resp.status}): ${msg}`);
    }
  }
  
  // ── Shared API system prompt (injected at call time with bron + lists) ────────
  function buildSystemPrompt(bron, skills, verticals, roles, industries) {
    return `Je bent een precisie-CRM-analist voor recruitment in Medical Devices, Pharma, Healthcare en Life Sciences. Analyseer het kandidaatsprofiel (bron: ${bron}).
  
  ⛔ HALLUCINATION VERBOD — ABSOLUTE REGEL:
  Gebruik UITSLUITEND termen die letterlijk voorkomen in de onderstaande lijsten. Niet in de lijst = niet gebruiken. Nul uitzonderingen.
  
  ⚡ TOKEN-EFFICIËNTIE — ABSOLUTE VERPLICHTING:
  - reasoning-velden: MAXIMAAL 5 woorden. Steekwoorden, geen zinnen. Voorbeeld: "expliciet vermeld in CV" of "functies impliceren prospecting".
  - general_comments: maximaal 2 korte zinnen.
  - Genereer GEEN velden die niet in het JSON-schema staan.
  
  SKILLS (gebruik ALLEEN deze exacte termen):
  ${skills}
  
  VERTICALS (gebruik ALLEEN deze exacte termen):
  ${verticals}
  
  ROLES (gebruik ALLEEN deze exacte termen):
  ${roles}
  
  INDUSTRIES (gebruik ALLEEN deze exacte termen):
  ${industries}
  
  Retourneer ALLEEN geldig JSON op 1 regel, zonder backticks, zonder uitleg:
  {"name":null,"current_role":null,"location":null,"total_years_experience":null,"matched_skills":[{"item":null,"related_vertical":null,"reasoning":null}],"suggested_skills":[{"item":null,"related_vertical":null,"reasoning":null}],"matched_verticals":[{"item":null,"reasoning":null}],"suggested_verticals":[{"item":null,"reasoning":null}],"matched_roles":[{"item":null,"related_vertical":null,"reasoning":null}],"suggested_roles":[{"item":null,"related_vertical":null,"reasoning":null}],"matched_industries":[{"item":null,"reasoning":null}],"suggested_industries":[{"item":null,"reasoning":null}],"general_comments":null,"contact":{"email":null,"phone":null,"linkedin_url":null}}
  
  Definities:
  - matched_*: EXPLICIET in profiel vermeld. reasoning = max 5 woorden bewijs.
  - suggested_*: WAARSCHIJNLIJK van toepassing, niet expliciet. reasoning = max 5 woorden redenering.
  - related_vertical: EXACT één term uit VERTICALS-lijst, of null.
  - total_years_experience: getal (referentiejaar = 2026).
  - general_comments: max 2 zinnen, Nederlands.
  - contact: ALLEEN uit tekst, anders null.
  
  🇳🇱 TAALREGEL: Alle tekst ALTIJD in het Nederlands.`;
  }
  
  
  /* ═══ HELPERS ═══════════════════════════════════════════════════════ */
  const DEFAULT_V = {bg:"rgba(148,163,184,0.1)",border:"rgba(148,163,184,0.25)",color:"rgba(255,255,255,0.38)",dot:"rgba(255,255,255,0.28)"};
  function vColor(v) { return VERTICAL_COLORS[v] || DEFAULT_V; }
  function detectRegio(loc) {
    if (!loc) return null;
    const l = loc.toLowerCase();
    if (REGIO_NOORD.some(r => l.includes(r.toLowerCase()))) return "Noord";
    if (REGIO_ZUID.some(r => l.includes(r.toLowerCase()))) return "Zuid";
    if (NOORD_CITIES.some(c => l.includes(c))) return "Noord";
    if (ZUID_CITIES.some(c => l.includes(c))) return "Zuid";
    return null;
  }
  
  /* ═══ ERROR BOUNDARY ══════════════════════════════════════════════ */
  class ErrorBoundary extends React.Component {
    constructor(p) { super(p); this.state = { err: null }; }
    static getDerivedStateFromError(e) { return { err: e }; }
    render() {
      if (this.state.err) return (
        <div style={{minHeight:"100vh",background:"#07100A",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:16,padding:36,maxWidth:400,textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:12}}>⚠️</div>
            <h2 style={{fontSize:18,color:"rgba(255,255,255,0.88)",margin:"0 0 8px"}}>Er is iets misgegaan</h2>
            <p style={{fontSize:14,color:"rgba(255,255,255,0.4)",margin:"0 0 20px",lineHeight:1.6}}>{this.state.err?.message||"Onbekende fout"}</p>
            <button onClick={()=>window.location.reload()} style={{background:"linear-gradient(135deg,#1A6B3C,#24A35A)",color:"white",border:"none",borderRadius:10,padding:"10px 24px",fontSize:14,cursor:"pointer"}}>Herladen</button>
          </div>
        </div>
      );
      return this.props.children;
    }
  }
  
  /* ═══ LOGIN ═══════════════════════════════════════════════════════ */
  /* ─────────────────────────────────────────────────────────────────
     LOGIN STYLES  — static <style> at module level so it is injected
     exactly once and never re-evaluated on re-render.
     ───────────────────────────────────────────────────────────────── */
  const LOGIN_STYLE = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
  
    /* ── background blob animations (transform + opacity ONLY — no filter) ── */
    @keyframes blob1 {
      0%,100% { transform: translate(0,0)           scale(1);    opacity:.9; }
      40%      { transform: translate(55px,-45px)    scale(1.12); opacity:1;  }
      70%      { transform: translate(-25px,40px)    scale(.92);  opacity:.85;}
    }
    @keyframes blob2 {
      0%,100% { transform: translate(0,0)           scale(1);    opacity:.8; }
      35%      { transform: translate(-65px,30px)    scale(1.08); opacity:.95;}
      70%      { transform: translate(38px,-55px)    scale(1.14); opacity:.75;}
    }
    @keyframes blob3 {
      0%,100% { transform: translate(0,0)           scale(1);    opacity:.7; }
      50%      { transform: translate(45px,35px)     scale(1.1);  opacity:.9; }
    }
    @keyframes blob4 {
      0%,100% { transform: translate(0,0)           scale(1);    opacity:.6; }
      45%      { transform: translate(-35px,-28px)   scale(.88);  opacity:.8; }
      80%      { transform: translate(28px,42px)     scale(1.1);  opacity:.65;}
    }
  
    /* ── tiny particle dots ── */
    @keyframes particleDrift {
      0%   { opacity:0;   transform:translateY(0px); }
      25%  { opacity:.55; }
      75%  { opacity:.25; }
      100% { opacity:0;   transform:translateY(-100px); }
    }
  
    /* ── panel entrance ── */
    @keyframes panelIn {
      from { opacity:0; transform:translateY(20px) scale(.97); }
      to   { opacity:1; transform:translateY(0)    scale(1);   }
    }
  
    /* ── logo gentle float ── */
    @keyframes logoFloat {
      0%,100% { transform:translateY(0px);  }
      50%      { transform:translateY(-5px); }
    }
  
    /* ── spinner ── */
    @keyframes spin { to { transform:rotate(360deg); } }
  
    /* ── button glow pulse on hover ── */
    @keyframes glowPulseGreen {
      0%,100% { box-shadow:0 4px 20px rgba(52,160,95,.35); }
      50%      { box-shadow:0 6px 32px rgba(52,160,95,.60); }
    }
  
    /* ── floating label ── */
    .fl-wrap { position:relative; }
    .fl-input {
      width:100%;
      background:rgba(255,255,255,0.045);
      border:1px solid rgba(255,255,255,0.1);
      border-radius:14px;
      color:rgba(255,255,255,0.88);
      padding:20px 16px 8px;
      font-size:15px;
      outline:none;
      transition:border-color .25s, box-shadow .25s;
      font-family:'Inter',sans-serif;
    }
    .fl-input::placeholder { color:transparent; }
    .fl-input:focus {
      border-color:rgba(52,160,95,.6);
      box-shadow:0 0 0 3px rgba(52,160,95,.14);
    }
    .fl-label {
      position:absolute;
      left:16px; top:50%;
      transform:translateY(-50%);
      font-size:14px;
      color:rgba(255,255,255,0.3);
      pointer-events:none;
      transition:all .25s cubic-bezier(.4,0,.2,1);
      font-family:'Inter',sans-serif;
    }
    .fl-input:focus ~ .fl-label,
    .fl-input:not(:placeholder-shown) ~ .fl-label {
      top:9px; transform:translateY(0);
      font-size:10px; letter-spacing:.7px;
      text-transform:uppercase;
      color:rgba(52,160,95,.9);
      font-weight:700;
    }
  
    /* ── login button ── */
    .login-btn { transition:all .22s ease; }
    .login-btn:hover:not(:disabled) {
      animation:glowPulseGreen 1.8s ease-in-out infinite;
      transform:translateY(-1px);
    }
    .login-btn:active:not(:disabled) { transform:scale(.98); }
  `;
  
  /* ── FloatField — declared at MODULE level so React never remounts it ── */
  function FloatField({ id, label, value, onChange, type, onEnter }) {
    return (
      <div className="fl-wrap">
        <input
          id={id}
          type={type || "text"}
          value={value}
          onChange={onChange}
          onKeyDown={e => e.key === "Enter" && onEnter && onEnter()}
          placeholder=" "
          className="fl-input"
          autoComplete={type === "password" ? "current-password" : "email"}
        />
        <label htmlFor={id} className="fl-label">{label}</label>
      </div>
    );
  }
  
  function LoginScreen({ onLogin, onNoAccess }) {
    const [email,   setEmail]   = React.useState("");
    const [pass,    setPass]    = React.useState("");
    const [err,     setErr]     = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [fadeOut, setFadeOut] = React.useState(false);
  
    const domain = email.split("@")[1]?.toLowerCase() || "";
    const T      = DOMAIN_THEMES[domain] || DEFAULT_THEME;
    const accent = T.accent || "#34A05F";
  
    async function attempt() {
      if (!email || !pass) return;
      setLoading(true);
      setErr("");
      try {
        const session = await sbSignIn(email.trim(), pass);
        const d       = email.split("@")[1]?.toLowerCase() || "";
        const profile = await sbGetProfile(session.access_token);
        localStorage.setItem(SB_SESSION_KEY, JSON.stringify(session));
        setFadeOut(true);
        setTimeout(() => onLogin({
          email:       email.trim(),
          domain:      d,
          isAdmin:     profile?.is_org_admin || profile?.is_team_admin || false,
          apiKey:      ANTHROPIC_API_KEY,
          accessToken: session.access_token,
          profile,
        }), 600);
      } catch (e) {
        setLoading(false);
        setErr(e.message || "Inloggen mislukt.");
      }
    }
  
    /* Background blobs — static gradient shapes, animated via transform+opacity ONLY.
       No filter:blur → zero GPU layer promotion outside the card itself.            */
    const BLOBS = [
      { top:"-12%", left:"-10%", w:580, h:580, bg:"radial-gradient(ellipse at 40% 40%,rgba(22,163,74,.22) 0%,rgba(16,185,129,.1) 45%,transparent 72%)", anim:"blob1 30s ease-in-out infinite" },
      { bottom:"-8%",right:"-12%",w:640, h:640, bg:"radial-gradient(ellipse at 60% 60%,rgba(20,184,166,.16) 0%,rgba(6,182,212,.07) 45%,transparent 72%)", anim:"blob2 36s ease-in-out infinite" },
      { top:"18%",  right:"3%",   w:360, h:360, bg:"radial-gradient(ellipse at 50% 50%,rgba(251,191,36,.09) 0%,transparent 68%)",                         anim:"blob3 24s ease-in-out infinite" },
      { top:"38%",  left:"28%",   w:500, h:500, bg:"radial-gradient(ellipse at 50% 50%,rgba(15,23,42,.55)  0%,rgba(30,41,59,.3) 55%,transparent 75%)",    anim:"blob4 40s ease-in-out infinite" },
    ];
  
    const PARTICLES = [
      {x:"11%",y:"21%",s:3,d:"3.2s",del:"0s"},   {x:"79%",y:"14%",s:2,d:"4.6s",del:"1.1s"},
      {x:"87%",y:"61%",s:4,d:"5.1s",del:"0.5s"},  {x:"24%",y:"76%",s:2,d:"3.9s",del:"2.0s"},
      {x:"54%",y:"87%",s:3,d:"4.3s",del:"0.9s"},  {x:"41%",y:"9%", s:2,d:"6.1s",del:"1.7s"},
      {x:"7%", y:"54%",s:3,d:"4.0s",del:"3.1s"},  {x:"66%",y:"36%",s:2,d:"5.4s",del:"0.3s"},
    ];
  
    /* Dynamic per-tenant CSS — updates accent colour for focus ring, floating
       label, and login-button hover without remounting any input component.   */
    const tenantCSS = `
      .fl-input:focus {
        border-color:${accent}99;
        box-shadow:0 0 0 3px ${accent}22;
      }
      .fl-input:focus ~ .fl-label,
      .fl-input:not(:placeholder-shown) ~ .fl-label {
        color:${accent};
      }
      @keyframes glowPulseTenant {
        0%,100% { box-shadow:0 4px 20px ${accent}55; }
        50%      { box-shadow:0 6px 32px ${accent}88; }
      }
      .login-btn:hover:not(:disabled) {
        animation:glowPulseTenant 1.8s ease-in-out infinite;
        transform:translateY(-1px);
      }
    `;
  
    return (
      <div style={{minHeight:"100vh",background:"#080d09",display:"flex",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden",opacity:fadeOut?0:1,transform:fadeOut?"scale(1.05)":"scale(1)",transition:"opacity 0.6s cubic-bezier(0.4,0,0.2,1),transform 0.6s cubic-bezier(0.4,0,0.2,1)",pointerEvents:fadeOut?"none":"auto"}}>
  
        {/* Static base styles */}
        <style>{LOGIN_STYLE}</style>
        {/* Dynamic tenant accent overrides — injected on every domain change */}
        <style>{tenantCSS}</style>
  
        {/* ── Background ── */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"}}>
          {BLOBS.map((b,i)=>(
            <div key={i} style={{
              position:"absolute",
              top:b.top, bottom:b.bottom, left:b.left, right:b.right,
              width:b.w, height:b.h,
              borderRadius:"50%",
              background:b.bg,
              /* NO filter:blur — shape uses wide radial-gradient falloff instead */
              animation:b.anim,
              willChange:"transform, opacity",
            }}/>
          ))}
          {PARTICLES.map((p,i)=>(
            <div key={i} style={{position:"absolute",left:p.x,top:p.y,width:p.s,height:p.s,borderRadius:"50%",background:"rgba(52,211,153,.5)",animation:`particleDrift ${p.d} ease-in-out ${p.del} infinite`}}/>
          ))}
          <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.013) 1px,transparent 1px)",backgroundSize:"48px 48px"}}/>
        </div>
  
        {/* ── Panel ── */}
        <div style={{position:"relative",zIndex:10,width:"100%",maxWidth:400,animation:"panelIn .5s cubic-bezier(.22,1,.36,1) both"}}>
  
          {/* Card */}
          <div style={{background:"rgba(12,20,14,.6)",backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",border:`1px solid ${DOMAIN_THEMES[domain]?accent+"40":"rgba(255,255,255,.08)"}`,borderRadius:26,padding:"38px 34px 32px",boxShadow:`0 32px 72px rgba(0,0,0,.55),0 0 0 1px ${accent}10 inset,0 0 ${DOMAIN_THEMES[domain]?"48px":"0px"} ${accent}18`,transition:"box-shadow .4s ease,border-color .4s ease"}}>
  
            {/* Domain banner — animates in by maxHeight so no remount */}
            <div style={{overflow:"hidden",maxHeight:DOMAIN_BANNER[domain]?70:0,marginBottom:DOMAIN_BANNER[domain]?18:0,opacity:DOMAIN_BANNER[domain]?1:0,transition:"max-height .4s ease,margin-bottom .4s ease,opacity .4s ease"}}>
              {DOMAIN_BANNER[domain]&&<img src={DOMAIN_BANNER[domain]} alt="" style={{width:"100%",borderRadius:11,height:66,objectFit:"cover",objectPosition:"center",display:"block"}}/>}
            </div>
  
            {/* Logo + title */}
            <div style={{textAlign:"center",marginBottom:28}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:13}}>
                <img src={TL_LOGO} alt="Talent Lens" style={{width:86,height:86,objectFit:"contain"}}/>
              </div>
              <h2 style={{fontSize:26,fontWeight:800,color:"rgba(255,255,255,.93)",margin:"0 0 4px",letterSpacing:-.8}}>
                <span style={{color:accent}}>Talent</span> Lens
              </h2>
              <div style={{height:22,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {domain && DOMAIN_THEMES[domain]
                  ? <span style={{fontSize:10,fontWeight:700,color:accent,background:accent+"15",border:`1px solid ${accent}30`,borderRadius:9999,padding:"3px 12px",letterSpacing:.9,textTransform:"uppercase"}}>{T.label}</span>
                  : <p style={{fontSize:11,color:"rgba(255,255,255,.18)",margin:0,letterSpacing:.3}}>Morgan Recruitment Group</p>
                }
              </div>
            </div>
  
            {/* Inputs — using module-level FloatField, no remount on rerender */}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <FloatField id="tl-email" label="E-mailadres" value={email} onChange={e=>setEmail(e.target.value)} type="email"     onEnter={attempt}/>
              <FloatField id="tl-pass"  label="Wachtwoord"  value={pass}  onChange={e=>setPass(e.target.value)}  type="password"  onEnter={attempt}/>
  
              <div style={{minHeight:18}}>
                {err&&(
                  <div style={{display:"flex",alignItems:"center",gap:7,padding:"8px 12px",background:"rgba(248,113,113,.07)",border:"1px solid rgba(248,113,113,.22)",borderRadius:10}}>
                    <span style={{fontSize:12}}>⚠️</span>
                    <p style={{fontSize:12,color:"rgba(248,113,113,.9)",margin:0,fontWeight:500}}>{err}</p>
                  </div>
                )}
              </div>
  
              <button
                className="login-btn"
                onClick={attempt}
                disabled={loading||!email||!pass}
                style={{
                  background:(loading||!email||!pass)?"rgba(255,255,255,.05)":T.btnGrad,
                  color:(loading||!email||!pass)?"rgba(255,255,255,.25)":"white",
                  border:"none",borderRadius:14,padding:"14px 0",fontSize:15,fontWeight:700,
                  cursor:(loading||!email||!pass)?"not-allowed":"pointer",
                  marginTop:4,display:"flex",alignItems:"center",justifyContent:"center",gap:9,letterSpacing:-.2,
                  boxShadow:(!loading&&email&&pass)?`0 4px 22px ${accent}38`:"none",
                }}>
                {loading
                  ? <><span style={{display:"inline-block",width:15,height:15,border:"2.5px solid rgba(255,255,255,.25)",borderTopColor:"white",borderRadius:"50%",animation:"spin .7s linear infinite"}}/> Bezig…</>
                  : "Inloggen →"}
              </button>
            </div>
  
            <p style={{fontSize:10,color:"rgba(255,255,255,.09)",textAlign:"center",marginTop:22,lineHeight:1.6}}>
              Alleen toegankelijk voor MRG medewerkers
            </p>
          </div>
  
          {/* Badge */}
          <div style={{textAlign:"center",marginTop:14,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
            <div style={{width:4,height:4,borderRadius:"50%",background:accent,boxShadow:`0 0 6px ${accent}`}}/>
            <span style={{fontSize:10,color:"rgba(255,255,255,.15)",letterSpacing:.8,textTransform:"uppercase"}}>Secure · AI-Native Platform</span>
            <div style={{width:4,height:4,borderRadius:"50%",background:accent,boxShadow:`0 0 6px ${accent}`}}/>
          </div>
        </div>
      </div>
    );
  }
  
  /* ═══ PROFILE CARD ════════════════════════════════════════════════ */
  
  
  /* ── GEM TYPE CONFIG ─────────────────────────────────────── */
  const GEM_TYPE_COLOR = {
    "Belscript":  { bg:"rgba(34,211,238,0.1)",  border:"rgba(34,211,238,0.3)",  color:"#22d3ee",  icon:"📞" },
    "Frontsheet": { bg:"rgba(251,191,36,0.1)",  border:"rgba(251,191,36,0.3)",  color:"#fbbf24",  icon:"📄" },
    "Boolean":    { bg:"rgba(167,139,250,0.1)", border:"rgba(167,139,250,0.3)", color:"#a78bfa",  icon:"🔎" },
    "Interview":  { bg:"rgba(52,211,153,0.1)",  border:"rgba(52,211,153,0.3)",  color:"#34d399",  icon:"🎯" },
  };
  
  /* ── SaveGemModal ─────────────────────────────────────────── */
  function SaveGemModal({ gemToSave, onClose, onSave, accent }) {
    const [title, setTitle] = React.useState("");
    const [visibility, setVisibility] = React.useState("private"); // "private" | "shared"
    const [team, setTeam] = React.useState("Morgan Green");
    const [saved, setSaved] = React.useState(false);
    const c = accent || "#34d399";
    const TEAMS = ["Morgan Green","Morgan Black","Morgan Lab"];
  
    if (!gemToSave) return null;
    const tc = GEM_TYPE_COLOR[gemToSave.type] || GEM_TYPE_COLOR["Belscript"];
  
    function handleSave() {
      if (!title.trim()) return;
      onSave({
        id: Date.now(),
        title: title.trim(),
        type: gemToSave.type,
        content: gemToSave.content,
        isShared: visibility === "shared",
        team: visibility === "shared" ? team : "Privé",
        author: "Mijzelf",
        date: "Zojuist",
      });
      setSaved(true);
      setTimeout(onClose, 1400);
    }
  
    return (
      <div style={{position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",padding:"20px 16px"}}>
        <div style={{background:"rgba(8,16,12,0.97)",backdropFilter:"blur(40px)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:22,width:"100%",maxWidth:420,boxShadow:"0 40px 90px rgba(0,0,0,0.8)",animation:"fadeIn 0.2s ease"}}>
          {/* Header */}
          <div style={{padding:"20px 22px 16px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:10,background:"rgba(251,191,36,0.12)",border:"1px solid rgba(251,191,36,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>💎</div>
              <div>
                <p style={{fontSize:15,fontWeight:700,color:"rgba(255,255,255,0.92)",margin:0,letterSpacing:-0.3}}>Opslaan als Gem</p>
                <p style={{fontSize:11,color:"rgba(255,255,255,0.3)",margin:0}}>
                  <span style={{color:tc.color,fontWeight:500}}>{tc.icon} {gemToSave.type}</span>
                </p>
              </div>
            </div>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.35)",borderRadius:9999,padding:"4px 12px",fontSize:12,cursor:"pointer"}}>✕</button>
          </div>
  
          {saved ? (
            <div style={{padding:"36px 22px",textAlign:"center"}}>
              <p style={{fontSize:32,margin:"0 0 10px"}}>💎</p>
              <p style={{fontSize:16,fontWeight:700,color:"rgba(52,211,153,0.95)",margin:"0 0 4px"}}>Gem opgeslagen!</p>
              <p style={{fontSize:12,color:"rgba(255,255,255,0.35)",margin:0}}>Terug te vinden in Mijn Gems.</p>
            </div>
          ) : (
            <div style={{padding:"20px 22px 22px"}}>
              {/* Titel input */}
              <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.35)",letterSpacing:0.7,textTransform:"uppercase",marginBottom:7}}>
                Titel voor je Gem
              </label>
              <input
                value={title}
                onChange={e=>setTitle(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleSave()}
                placeholder="Bijv. Geniale Boolean voor QA Managers..."
                autoFocus
                style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:11,color:"rgba(255,255,255,0.88)",padding:"11px 14px",fontSize:13,outline:"none",fontFamily:"Inter,sans-serif",marginBottom:18,transition:"border-color 0.2s"}}
                onFocus={e=>e.target.style.borderColor=c+"60"}
                onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"}
              />
  
              {/* Zichtbaarheid */}
              <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.35)",letterSpacing:0.7,textTransform:"uppercase",marginBottom:8}}>Zichtbaarheid</label>
              <div style={{display:"flex",gap:8,marginBottom:16}}>
                {[
                  {v:"private",  label:"🔒 Alleen voor mij"},
                  {v:"shared",   label:"🌍 Delen met team"},
                ].map(opt=>(
                  <button key={opt.v} onClick={()=>setVisibility(opt.v)}
                    style={{flex:1,padding:"10px 8px",borderRadius:11,border:`1px solid ${visibility===opt.v?c+"50":"rgba(255,255,255,0.1)"}`,background:visibility===opt.v?c+"12":"rgba(255,255,255,0.04)",color:visibility===opt.v?"rgba(255,255,255,0.88)":"rgba(255,255,255,0.4)",fontSize:12,fontWeight:visibility===opt.v?600:400,cursor:"pointer",transition:"all 0.18s"}}>
                    {opt.label}
                  </button>
                ))}
              </div>
  
              {/* Team keuze */}
              {visibility==="shared"&&(
                <div style={{marginBottom:18}}>
                  <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.35)",letterSpacing:0.7,textTransform:"uppercase",marginBottom:8}}>Label / Team</label>
                  <div style={{display:"flex",gap:6}}>
                    {TEAMS.map(t=>(
                      <button key={t} onClick={()=>setTeam(t)}
                        style={{flex:1,padding:"8px 4px",borderRadius:9,border:`1px solid ${team===t?c+"50":"rgba(255,255,255,0.09)"}`,background:team===t?c+"14":"rgba(255,255,255,0.03)",color:team===t?c:"rgba(255,255,255,0.38)",fontSize:11,fontWeight:team===t?600:400,cursor:"pointer",transition:"all 0.18s",whiteSpace:"nowrap"}}>
                        {t.replace("Morgan ","")}
                      </button>
                    ))}
                  </div>
                </div>
              )}
  
              {/* Opslaan */}
              <button onClick={handleSave} disabled={!title.trim()}
                style={{width:"100%",padding:"12px",borderRadius:12,border:"none",background:title.trim()?`linear-gradient(135deg,${c}cc,${c}88)`:"rgba(255,255,255,0.06)",color:title.trim()?"white":"rgba(255,255,255,0.25)",fontSize:14,fontWeight:700,cursor:title.trim()?"pointer":"not-allowed",transition:"all 0.2s",boxShadow:title.trim()?`0 4px 20px ${c}35`:"none"}}>
                💎 Opslaan als Gem
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  /* ── MyGemsModal ──────────────────────────────────────────── */
  function MyGemsModal({ gems, onClose, accent }) {
    const [expanded, setExpanded] = React.useState(null);
    const [copied, setCopied] = React.useState(null);
    const c = accent || "#34d399";
    const myGems = gems.filter(g => g.author === "Mijzelf");
  
    function copyGem(id, content) {
      navigator.clipboard?.writeText(content);
      setCopied(id);
      setTimeout(()=>setCopied(null), 2000);
    }
  
    return (
      <div style={{position:"fixed",inset:0,zIndex:400,display:"flex",alignItems:"flex-start",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",padding:"24px 16px",overflowY:"auto"}}>
        <div style={{background:"rgba(8,16,12,0.97)",backdropFilter:"blur(40px)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:24,width:"100%",maxWidth:520,boxShadow:"0 40px 90px rgba(0,0,0,0.75)"}}>
          {/* Header */}
          <div style={{padding:"20px 24px 16px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:10,background:"rgba(251,191,36,0.12)",border:"1px solid rgba(251,191,36,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>💎</div>
              <div>
                <p style={{fontSize:16,fontWeight:700,color:"rgba(255,255,255,0.92)",margin:0,letterSpacing:-0.3}}>Mijn Gems</p>
                <p style={{fontSize:11,color:"rgba(255,255,255,0.3)",margin:0}}>{myGems.length} opgeslagen generaties</p>
              </div>
            </div>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.4)",borderRadius:9999,padding:"5px 14px",fontSize:12,cursor:"pointer"}}>✕ Sluiten</button>
          </div>
  
          <div style={{padding:"16px 20px 24px"}}>
            {myGems.length===0 ? (
              <div style={{textAlign:"center",padding:"40px 0"}}>
                <p style={{fontSize:28,margin:"0 0 10px"}}>💎</p>
                <p style={{fontSize:14,color:"rgba(255,255,255,0.4)",margin:0}}>Nog geen gems opgeslagen.</p>
                <p style={{fontSize:12,color:"rgba(255,255,255,0.22)",margin:"6px 0 0"}}>Gebruik '💎 Opslaan als Gem' na een generatie.</p>
              </div>
            ) : myGems.map(g => {
              const tc = GEM_TYPE_COLOR[g.type] || GEM_TYPE_COLOR["Belscript"];
              const isOpen = expanded === g.id;
              return (
                <div key={g.id} style={{marginBottom:10,background:"rgba(255,255,255,0.03)",border:`1px solid ${isOpen?tc.border:"rgba(255,255,255,0.08)"}`,borderRadius:14,overflow:"hidden",transition:"border-color 0.2s"}}>
                  {/* Card header */}
                  <button onClick={()=>setExpanded(isOpen?null:g.id)}
                    style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}}>
                    <span style={{fontSize:18,flexShrink:0}}>{tc.icon}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.85)",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.title}</p>
                      <div style={{display:"flex",gap:6,alignItems:"center",marginTop:3,flexWrap:"wrap"}}>
                        <span style={{fontSize:10,padding:"1px 7px",borderRadius:9999,background:tc.bg,border:`1px solid ${tc.border}`,color:tc.color,fontWeight:500}}>{g.type}</span>
                        <span style={{fontSize:10,color:"rgba(255,255,255,0.25)"}}>{g.isShared?"🌍 "+g.team:"🔒 Privé"}</span>
                        <span style={{fontSize:10,color:"rgba(255,255,255,0.2)"}}>{g.date}</span>
                      </div>
                    </div>
                    <span style={{fontSize:10,color:"rgba(255,255,255,0.25)",flexShrink:0,transition:"transform 0.2s",display:"inline-block",transform:isOpen?"rotate(180deg)":"none"}}>▼</span>
                  </button>
  
                  {/* Expanded content */}
                  {isOpen&&(
                    <div style={{padding:"0 16px 14px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                      <div style={{background:"rgba(0,0,0,0.3)",borderRadius:10,padding:"12px 14px",marginTop:10,position:"relative"}}>
                        <pre style={{fontSize:11,color:"rgba(255,255,255,0.6)",margin:0,whiteSpace:"pre-wrap",lineHeight:1.65,fontFamily:"Inter,sans-serif",paddingRight:70}}>{g.content}</pre>
                        <button onClick={()=>copyGem(g.id, g.content)}
                          style={{position:"absolute",top:10,right:10,background:copied===g.id?"rgba(52,211,153,0.15)":"rgba(255,255,255,0.07)",border:`1px solid ${copied===g.id?"rgba(52,211,153,0.3)":"rgba(255,255,255,0.12)"}`,color:copied===g.id?"rgba(52,211,153,0.9)":"rgba(255,255,255,0.4)",borderRadius:9999,padding:"3px 10px",fontSize:11,cursor:"pointer",transition:"all 0.18s",whiteSpace:"nowrap"}}>
                          {copied===g.id?"✓":"📋"} {copied===g.id?"Gekopieerd":"Kopieer"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  
  
  function SalesToolkit({ result, accent, onSaveGem }) {
    const [actionContent, setActionContent] = React.useState(null);
    const [actionType, setActionType] = React.useState("");
    const [isActionLoading, setIsActionLoading] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const c = accent || "#34A05F";
  
    const topSkill1 = result?.matched_skills?.[0]?.item || result?.matched_skills?.[0] || "Life Sciences";
    const topSkill2 = result?.matched_skills?.[1]?.item || result?.matched_skills?.[1] || "Medical Devices";
    const naam = result?.name || "de kandidaat";
    const rol  = result?.current_role || "Sales Professional";
  
    function handleGenerateAction(type) {
      setActionType(type);
      setActionContent(null);
      setIsActionLoading(true);
      setTimeout(() => {
        if (type === "call") {
          setActionContent([
            { label: "Doel", text: `Pitch ${naam} direct telefonisch bij de hiring manager.` },
            { label: "Opening", text: `"Hi [Naam], ik bel je kort omdat ik net een ${rol} sprak die exact de ${topSkill1} ervaring heeft waar jullie vaak naar zoeken..."` },
            { label: "Hook (USP's)", text: `Benoem direct de <strong>${topSkill1}</strong> en <strong>${topSkill2}</strong>. Koppel dit aan een concreet resultaat: "Vorig kwartaal haalde hij/zij een deal van €X binnen binnen een MDR-traject."` },
            { label: "Bezwaar opvangen", text: `"Ik begrijp dat je druk bent — stuur ik je het profiel alvast op? Dan heb je het voor de vergadering."` },
            { label: "Call to Action", text: `"Wanneer ben je vanmiddag 5 minuten beschikbaar om zijn profiel door te nemen?"` },
          ]);
        } else {
          setActionContent([
            { label: "Vraag 1 — Sales Track Record", text: `"Kun je een voorbeeld geven van een complex sales-traject binnen Medical Devices of ${topSkill1} dat je recent hebt gesloten? Wat was jouw persoonlijke rol?"` },
            { label: "Vraag 2 — Regulatory Awareness", text: `"Hoe ga je om met de strenge regulatory compliance (ISO 13485 / MDR) tijdens je pitch aan een ziekenhuisinkoper?"` },
            { label: "Vraag 3 — Leercurve & Adaptability", text: `"Je hebt sterke ervaring met ${topSkill2}, maar hoe snel kun je je inwerken in een compleet nieuwe productgroep of markt — en hoe pak je dat concreet aan?"` },
            { label: "Bonus — Motivatie", text: `"Wat trekt je specifiek aan bij onze klant ten opzichte van je huidige of vorige werkgever? Wat zoek je op lange termijn?"` },
          ]);
        }
        setIsActionLoading(false);
      }, 950);
    }
  
    function copyText() {
      if (!actionContent) return;
      const txt = actionContent.map(b => `${b.label}:\n${b.text.replace(/<[^>]+>/g,"")}`).join("\n\n");
      navigator.clipboard?.writeText(txt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  
    return (
      <div style={{marginTop:16,background:"linear-gradient(135deg,rgba(255,255,255,0.03) 0%,rgba(255,255,255,0.015) 100%)",border:`1px solid ${c}28`,borderRadius:16,overflow:"hidden",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)"}}>
        {/* Header */}
        <div style={{padding:"12px 16px 10px",borderBottom:`1px solid ${c}18`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:28,height:28,borderRadius:9,background:c+"18",border:`1px solid ${c}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🚀</div>
            <span style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.88)",letterSpacing:-0.2}}>Sales & Actiecentrum</span>
          </div>
          <span style={{fontSize:10,color:"rgba(255,255,255,0.25)",letterSpacing:0.5,textTransform:"uppercase"}}>Quick Actions</span>
        </div>
        {/* Buttons */}
        <div style={{padding:"12px 16px",display:"flex",gap:8,flexWrap:"wrap"}}>
          <button
            onClick={e=>{e.stopPropagation();handleGenerateAction("call");}}
            disabled={isActionLoading&&actionType==="call"}
            style={{display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:9999,border:`1px solid ${c}40`,background:actionType==="call"&&actionContent?c+"18":"rgba(255,255,255,0.05)",color:actionType==="call"&&actionContent?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.65)",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.2s",boxShadow:actionType==="call"&&actionContent?`0 2px 12px ${c}25`:"none"}}
            onMouseEnter={e=>{if(!(isActionLoading&&actionType==="call")){e.currentTarget.style.background=c+"20";e.currentTarget.style.color="rgba(255,255,255,0.92)";}}}
            onMouseLeave={e=>{e.currentTarget.style.background=actionType==="call"&&actionContent?c+"18":"rgba(255,255,255,0.05)";e.currentTarget.style.color=actionType==="call"&&actionContent?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.65)";}}>
            {isActionLoading&&actionType==="call"
              ? <><span style={{display:"inline-block",width:10,height:10,border:"2px solid rgba(255,255,255,0.25)",borderTopColor:"white",borderRadius:"50%",animation:"s 0.7s linear infinite"}}/> Genereren...</>
              : "📞 Genereer Belscript"}
          </button>
          <button
            onClick={e=>{e.stopPropagation();handleGenerateAction("interview");}}
            disabled={isActionLoading&&actionType==="interview"}
            style={{display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:9999,border:"1px solid rgba(167,139,250,0.35)",background:actionType==="interview"&&actionContent?"rgba(167,139,250,0.14)":"rgba(255,255,255,0.05)",color:actionType==="interview"&&actionContent?"rgba(192,132,252,0.95)":"rgba(255,255,255,0.65)",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}
            onMouseEnter={e=>{if(!(isActionLoading&&actionType==="interview")){e.currentTarget.style.background="rgba(167,139,250,0.12)";e.currentTarget.style.color="rgba(192,132,252,0.9)";}}}
            onMouseLeave={e=>{e.currentTarget.style.background=actionType==="interview"&&actionContent?"rgba(167,139,250,0.14)":"rgba(255,255,255,0.05)";e.currentTarget.style.color=actionType==="interview"&&actionContent?"rgba(192,132,252,0.95)":"rgba(255,255,255,0.65)";}}>
            {isActionLoading&&actionType==="interview"
              ? <><span style={{display:"inline-block",width:10,height:10,border:"2px solid rgba(255,255,255,0.25)",borderTopColor:"white",borderRadius:"50%",animation:"s 0.7s linear infinite"}}/> Genereren...</>
              : "🎯 Interview Vragen"}
          </button>
        </div>
        {/* Content output */}
        {actionContent&&(
          <div style={{margin:"0 12px 12px",background:"rgba(0,0,0,0.25)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"14px 16px",position:"relative",backdropFilter:"blur(12px)"}}>
            <div style={{position:"absolute",top:10,right:10,display:"flex",gap:5}}>
              {onSaveGem&&(
                <button onClick={e=>{e.stopPropagation();const txt=actionContent.map(b=>b.label+":\n"+b.text.replace(/<[^>]+>/g,"")).join("\n\n");onSaveGem({content:txt,type:actionType==="call"?"Belscript":"Interview"});}}
                  style={{background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.3)",color:"rgba(251,191,36,0.85)",borderRadius:9999,padding:"3px 10px",fontSize:11,cursor:"pointer",transition:"all 0.18s",whiteSpace:"nowrap"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(251,191,36,0.18)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(251,191,36,0.1)";}}>
                  💎 Gem
                </button>
              )}
              <button
                onClick={e=>{e.stopPropagation();copyText();}}
                style={{background:copied?"rgba(52,211,153,0.15)":"rgba(255,255,255,0.07)",border:`1px solid ${copied?"rgba(52,211,153,0.3)":"rgba(255,255,255,0.12)"}`,color:copied?"rgba(52,211,153,0.9)":"rgba(255,255,255,0.4)",borderRadius:9999,padding:"3px 10px",fontSize:11,cursor:"pointer",transition:"all 0.18s"}}>
                {copied?"✓ Gekopieerd":"📋 Kopieer"}
              </button>
            </div>
            <div style={{paddingRight:80}}>
              {actionContent.map((block, i) => (
                <div key={i} style={{marginBottom: i < actionContent.length-1 ? 12 : 0}}>
                  <p style={{fontSize:10,fontWeight:700,color:actionType==="call"?c:"rgba(192,132,252,0.8)",margin:"0 0 4px",letterSpacing:0.8,textTransform:"uppercase"}}>{block.label}</p>
                  <p style={{fontSize:12,color:"rgba(255,255,255,0.72)",margin:0,lineHeight:1.7,fontWeight:400}}
                    dangerouslySetInnerHTML={{__html:block.text}}/>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  function FeedbackWidget({ context, accent }) {
    const [vote, setVote] = React.useState(null);       // null | "up" | "down"
    const [text, setText] = React.useState("");
    const [sent, setSent] = React.useState(false);
    const c = accent || "#34A05F";
    if (sent) return (
      <div style={{marginTop:14,padding:"10px 14px",background:"rgba(52,211,153,0.07)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:12,display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:14}}>✅</span>
        <span style={{fontSize:12,color:"rgba(52,211,153,0.9)",fontWeight:500}}>Bedankt voor je feedback!</span>
      </div>
    );
    return (
      <div style={{marginTop:14,padding:"11px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,backdropFilter:"blur(8px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:11,color:"rgba(255,255,255,0.28)",fontWeight:500,letterSpacing:0.3}}>Was dit resultaat nuttig?</span>
          <button onClick={()=>{setVote("up");setSent(true);}}
            style={{background:vote==="up"?"rgba(52,211,153,0.15)":"rgba(255,255,255,0.05)",border:`1px solid ${vote==="up"?"rgba(52,211,153,0.4)":"rgba(255,255,255,0.1)"}`,color:vote==="up"?"rgba(52,211,153,0.9)":"rgba(255,255,255,0.45)",borderRadius:9999,padding:"4px 11px",fontSize:13,cursor:"pointer",transition:"all 0.18s"}}>
            👍
          </button>
          <button onClick={()=>setVote(vote==="down"?null:"down")}
            style={{background:vote==="down"?"rgba(248,113,113,0.12)":"rgba(255,255,255,0.05)",border:`1px solid ${vote==="down"?"rgba(248,113,113,0.35)":"rgba(255,255,255,0.1)"}`,color:vote==="down"?"rgba(248,113,113,0.9)":"rgba(255,255,255,0.45)",borderRadius:9999,padding:"4px 11px",fontSize:13,cursor:"pointer",transition:"all 0.18s"}}>
            👎
          </button>
        </div>
        {vote==="down"&&(
          <div style={{marginTop:10,display:"flex",gap:8,alignItems:"center"}}>
            <input
              value={text}
              onChange={e=>setText(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&text.trim()&&setSent(true)}
              placeholder="Wat kan er beter?"
              style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:9,color:"rgba(255,255,255,0.8)",padding:"7px 11px",fontSize:12,outline:"none",fontFamily:"Inter,sans-serif",transition:"border-color 0.2s"}}
            />
            <button
              onClick={()=>text.trim()&&setSent(true)}
              disabled={!text.trim()}
              style={{background:text.trim()?c+"22":"rgba(255,255,255,0.04)",border:`1px solid ${text.trim()?c+"45":"rgba(255,255,255,0.08)"}`,color:text.trim()?"rgba(255,255,255,0.85)":"rgba(255,255,255,0.25)",borderRadius:9,padding:"7px 14px",fontSize:12,fontWeight:500,cursor:text.trim()?"pointer":"not-allowed",transition:"all 0.18s",whiteSpace:"nowrap"}}>
              Verzend
            </button>
          </div>
        )}
      </div>
    );
  }
  
  function ProfileCard({ result: r, theme: T, compact, source, onSaveGem }) {
    const [open, setOpen] = React.useState(!compact);
    const [xaiOpen, setXaiOpen] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    if (!r) return null;
    const accent = T?.accent||"#34A05F";
  
    // ── Backward-compat helpers: supports both old (string) and new ({item,reasoning}) formats ──
    const itemOf    = x => (x && typeof x === "object") ? (x.item || "") : (x || "");
    const reasonOf  = x => (x && typeof x === "object") ? x.reasoning : null;
    const vertOfItem= x => (x && typeof x === "object") ? (x.related_vertical || null) : null;
    const toItems   = arr => (arr||[]).map(x => ({ item: itemOf(x), reasoning: reasonOf(x), related_vertical: vertOfItem(x) })).filter(e=>e.item);
  
    // ── Derive pill styling from related_vertical, with neutral fallback ──
    const SKILL_FALLBACK = { bg:"rgba(56,189,248,0.08)", border:"rgba(56,189,248,0.22)", color:"rgba(56,189,248,0.85)" };
    const ROLE_FALLBACK  = { bg:"rgba(52,211,153,0.07)", border:"rgba(52,211,153,0.2)",  color:"rgba(52,211,153,0.85)" };
    function pillStyle(e, fallback, isSuggested = false) {
      const vc = e.related_vertical ? vColor(e.related_vertical) : null;
      if (vc && vc !== DEFAULT_V) {
        return isSuggested
          ? { bg: vc.bg.replace(/[\d.]+\)$/, "0.05)"), border: vc.border.replace(/[\d.]+\)$/, "0.15)"), color: vc.color.replace(/[\d.]+\)$/, "0.6)") }
          : { bg: vc.bg, border: vc.border, color: vc.color };
      }
      return isSuggested
        ? { bg: fallback.bg.replace(/[\d.]+\)$/, "0.04)"), border: fallback.border.replace(/[\d.]+\)$/, "0.12)"), color: fallback.color.replace(/[\d.]+\)$/, "0.45)") }
        : fallback;
    }
  
    const Pill = ({label, bg, border, color, dot}) => (
      <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:500,margin:"2px",background:bg,border:`1px solid ${border}`,color}}>
        {dot&&<span style={{width:6,height:6,borderRadius:"50%",background:dot,flexShrink:0,display:"inline-block"}}/>}
        {label}
      </span>
    );
  
    async function handleSave() {
      setSaving(true);
      try {
        await saveToSupabase(r, source||"onbekend");
        window.alert(`✅ ${r.name||"Kandidaat"} is opgeslagen in de database.`);
      } catch(e) {
        window.alert(`❌ Opslaan mislukt: ${e.message}`);
      } finally { setSaving(false); }
    }
  
    function handleRecruitCRM() {
      window.alert("🔗 Recruit CRM koppeling — nog niet geconfigureerd.\nVoeg hier je Recruit CRM API-sleutel en endpoint toe.");
    }
  
    // Extract vertical strings (backward compat)
    const verticals = toItems(r.matched_verticals).map(e=>e.item);
  
    // ── XAI section renderer ──
    const XAICategory = ({ title, matched, suggested, fallback }) => {
      const m = toItems(matched);
      const s = toItems(suggested);
      if (m.length === 0 && s.length === 0) return null;
      return (
        <div style={{marginBottom:14}}>
          <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",margin:"0 0 8px",letterSpacing:1,textTransform:"uppercase"}}>{title}</p>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {m.map((e,i)=>{
              const ps = pillStyle(e, fallback || SKILL_FALLBACK);
              return (
                <div key={`m${i}`} style={{display:"flex",gap:10,padding:"9px 12px",background:"rgba(52,211,153,0.04)",border:"1px solid rgba(52,211,153,0.12)",borderRadius:12,alignItems:"flex-start",backdropFilter:"blur(8px)"}}>
                  <span style={{fontSize:12,flexShrink:0,marginTop:1}}>✅</span>
                  <div style={{flex:1,minWidth:0}}>
                    <Pill label={e.item} bg={ps.bg} border={ps.border} color={ps.color}/>
                    {e.related_vertical&&(
                      <span style={{display:"inline-flex",alignItems:"center",gap:3,marginLeft:4,padding:"1px 7px",borderRadius:9999,fontSize:9,fontWeight:500,background:vColor(e.related_vertical).bg,border:`1px solid ${vColor(e.related_vertical).border}`,color:vColor(e.related_vertical).color,verticalAlign:"middle"}}>
                        <span style={{width:4,height:4,borderRadius:"50%",background:vColor(e.related_vertical).dot,display:"inline-block"}}/>
                        {e.related_vertical}
                      </span>
                    )}
                    {e.reasoning&&<p style={{fontSize:11,color:"rgba(255,255,255,0.38)",margin:"5px 0 0",lineHeight:1.55,fontWeight:400,fontStyle:"italic"}}>{e.reasoning}</p>}
                  </div>
                </div>
              );
            })}
            {s.map((e,i)=>{
              const ps = pillStyle(e, fallback || SKILL_FALLBACK, true);
              return (
                <div key={`s${i}`} style={{display:"flex",gap:10,padding:"9px 12px",background:"rgba(251,191,36,0.03)",border:"1px solid rgba(251,191,36,0.12)",borderRadius:12,alignItems:"flex-start",backdropFilter:"blur(8px)"}}>
                  <span style={{fontSize:12,flexShrink:0,marginTop:1}}>⚠️</span>
                  <div style={{flex:1,minWidth:0}}>
                    <Pill label={e.item} bg={ps.bg} border={ps.border} color={ps.color}/>
                    {e.related_vertical&&(
                      <span style={{display:"inline-flex",alignItems:"center",gap:3,marginLeft:4,padding:"1px 7px",borderRadius:9999,fontSize:9,fontWeight:500,background:vColor(e.related_vertical).bg,border:`1px solid ${vColor(e.related_vertical).border}`,color:vColor(e.related_vertical).color,opacity:0.65,verticalAlign:"middle"}}>
                        <span style={{width:4,height:4,borderRadius:"50%",background:vColor(e.related_vertical).dot,display:"inline-block"}}/>
                        {e.related_vertical}
                      </span>
                    )}
                    {e.reasoning&&<p style={{fontSize:11,color:"rgba(255,255,255,0.32)",margin:"5px 0 0",lineHeight:1.55,fontWeight:400,fontStyle:"italic"}}>{e.reasoning}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };
  
    return (
      <div style={{background:"rgba(255,255,255,0.03)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:`1px solid ${accent}20`,borderRadius:18,overflow:"hidden",marginBottom:8}}>
        {/* ── Header (altijd zichtbaar) ── */}
        <div onClick={()=>setOpen(o=>!o)} style={{padding:"14px 16px",cursor:"pointer"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {/* Gekleurde vertical-dots als snelle indicator */}
            {verticals.length>0&&(
              <div style={{display:"flex",gap:3,flexShrink:0}}>
                {verticals.slice(0,4).map(v=>(
                  <span key={v} title={v} style={{width:9,height:9,borderRadius:"50%",background:vColor(v).dot,flexShrink:0,display:"inline-block",border:`1px solid ${vColor(v).border}`,boxShadow:`0 0 5px ${vColor(v).dot}60`}}/>
                ))}
                {verticals.length>4&&<span style={{fontSize:9,color:"rgba(255,255,255,0.25)",alignSelf:"center"}}>+{verticals.length-4}</span>}
              </div>
            )}
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:15,fontWeight:600,color:"rgba(255,255,255,0.88)",margin:"0 0 1px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",letterSpacing:-0.2}}>{r.name||"Onbekend"}</p>
              <p style={{fontSize:12,color:"rgba(255,255,255,0.35)",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:400}}>{[r.current_role,r.location].filter(Boolean).join(" · ")}</p>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
              {r.total_years_experience&&<span style={{fontSize:11,color:"rgba(255,255,255,0.25)",background:"rgba(255,255,255,0.05)",borderRadius:9999,padding:"2px 8px",fontWeight:400}}>{r.total_years_experience}j</span>}
              <span style={{color:"rgba(255,255,255,0.2)",fontSize:10}}>{open?"▲":"▼"}</span>
            </div>
          </div>
          {/* Vertical-pills compact in header */}
          {verticals.length>0&&(
            <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:3}}>
              {verticals.map(v=>(
                <span key={v} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:9999,fontSize:10,fontWeight:500,background:vColor(v).bg,border:`1px solid ${vColor(v).border}`,color:vColor(v).color}}>
                  <span style={{width:4,height:4,borderRadius:"50%",background:vColor(v).dot,display:"inline-block"}}/>
                  {v}
                </span>
              ))}
            </div>
          )}
        </div>
  
        {/* ── Expanded detail ── */}
        {open&&(
          <div style={{padding:"4px 16px 16px",borderTop:"1px solid rgba(255,255,255,0.05)"}}>
            {r.general_comments&&<p style={{fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.7,margin:"12px 0",fontWeight:400}}>{r.general_comments}</p>}
  
            {toItems(r.matched_skills).length>0&&(
              <div style={{marginBottom:12}}>
                <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.22)",margin:"0 0 6px",letterSpacing:1,textTransform:"uppercase"}}>Skills</p>
                {toItems(r.matched_skills).map(e=>{const ps=pillStyle(e,SKILL_FALLBACK);return <Pill key={e.item} label={e.item} bg={ps.bg} border={ps.border} color={ps.color}/>;} )}
                {toItems(r.suggested_skills).map(e=>{const ps=pillStyle(e,SKILL_FALLBACK,true);return <Pill key={e.item} label={"⚠ "+e.item} bg={ps.bg} border={ps.border} color={ps.color}/>;} )}
              </div>
            )}
  
            {verticals.length>0&&(
              <div style={{marginBottom:12}}>
                <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.22)",margin:"0 0 6px",letterSpacing:1,textTransform:"uppercase"}}>Verticals</p>
                {verticals.map(v=><Pill key={v} label={v} bg={vColor(v).bg} border={vColor(v).border} color={vColor(v).color} dot={vColor(v).dot}/>)}
                {toItems(r.suggested_verticals).map(e=><Pill key={e.item} label={"⚠ "+e.item} bg="rgba(148,163,184,0.06)" border="rgba(148,163,184,0.15)" color="rgba(251,191,36,0.7)"/>)}
              </div>
            )}
  
            {toItems(r.matched_roles).length>0&&(
              <div style={{marginBottom:12}}>
                <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.22)",margin:"0 0 6px",letterSpacing:1,textTransform:"uppercase"}}>Rollen</p>
                {toItems(r.matched_roles).map(e=>{const ps=pillStyle(e,ROLE_FALLBACK);return <Pill key={e.item} label={e.item} bg={ps.bg} border={ps.border} color={ps.color}/>;} )}
                {toItems(r.suggested_roles).map(e=>{const ps=pillStyle(e,ROLE_FALLBACK,true);return <Pill key={e.item} label={"⚠ "+e.item} bg={ps.bg} border={ps.border} color={ps.color}/>;} )}
              </div>
            )}
  
            {toItems(r.matched_industries).length>0&&(
              <div style={{marginBottom:12}}>
                <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.22)",margin:"0 0 6px",letterSpacing:1,textTransform:"uppercase"}}>Industrie</p>
                {toItems(r.matched_industries).map(e=><Pill key={e.item} label={e.item} bg="rgba(168,85,247,0.07)" border="rgba(168,85,247,0.2)" color="rgba(192,132,252,0.85)"/>)}
                {toItems(r.suggested_industries).map(e=><Pill key={e.item} label={"⚠ "+e.item} bg="rgba(168,85,247,0.03)" border="rgba(168,85,247,0.1)" color="rgba(251,191,36,0.7)"/>)}
              </div>
            )}
  
            {r.contact&&Object.entries(r.contact).filter(([,v])=>v).length>0&&(
              <div style={{marginTop:12,padding:"10px 13px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,backdropFilter:"blur(8px)"}}>
                {Object.entries(r.contact).filter(([,v])=>v).map(([k,v])=>(
                  <p key={k} style={{fontSize:12,color:"rgba(255,255,255,0.45)",margin:"3px 0",fontWeight:400}}><span style={{color:"rgba(255,255,255,0.22)"}}>{k}: </span>{v}</p>
                ))}
              </div>
            )}
  
            {/* ── 🧠 AI Onderbouwing accordion ── */}
            {(toItems(r.matched_skills).length>0||toItems(r.matched_verticals).length>0||toItems(r.matched_roles).length>0||toItems(r.matched_industries).length>0)&&(
              <div style={{marginTop:14}}>
                {/* Trigger button */}
                <button
                  onClick={e=>{e.stopPropagation();setXaiOpen(o=>!o);}}
                  style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:xaiOpen?"rgba(139,92,246,0.08)":"rgba(255,255,255,0.03)",border:`1px solid ${xaiOpen?"rgba(139,92,246,0.25)":"rgba(255,255,255,0.07)"}`,borderRadius:14,padding:"10px 14px",cursor:"pointer",transition:"all 0.22s",backdropFilter:"blur(12px)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:14}}>🧠</span>
                    <span style={{fontSize:12,fontWeight:600,color:xaiOpen?"rgba(192,132,252,0.9)":"rgba(255,255,255,0.45)",letterSpacing:0.3,transition:"color 0.22s"}}>AI Onderbouwing</span>
                    <span style={{fontSize:10,background:xaiOpen?"rgba(139,92,246,0.15)":"rgba(255,255,255,0.05)",border:`1px solid ${xaiOpen?"rgba(139,92,246,0.3)":"rgba(255,255,255,0.08)"}`,color:xaiOpen?"rgba(192,132,252,0.8)":"rgba(255,255,255,0.25)",borderRadius:9999,padding:"1px 7px",transition:"all 0.22s"}}>
                      Explainable AI
                    </span>
                  </div>
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.2)",transition:"transform 0.22s",display:"inline-block",transform:xaiOpen?"rotate(180deg)":"none"}}>▼</span>
                </button>
  
                {/* Accordion body */}
                {xaiOpen&&(
                  <div style={{marginTop:6,background:"rgba(139,92,246,0.03)",border:"1px solid rgba(139,92,246,0.1)",borderRadius:16,padding:"16px 14px",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)"}}>
                    <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"flex-start",padding:"8px 12px",background:"rgba(139,92,246,0.06)",border:"1px solid rgba(139,92,246,0.15)",borderRadius:10}}>
                      <span style={{fontSize:11}}>ℹ️</span>
                      <p style={{fontSize:11,color:"rgba(255,255,255,0.32)",margin:0,lineHeight:1.6,fontWeight:400}}>
                        <span style={{color:"rgba(192,132,252,0.7)",fontWeight:600}}>✅ Zekere match</span> — expliciet vermeld in profiel. &nbsp;
                        <span style={{color:"rgba(251,191,36,0.7)",fontWeight:600}}>⚠️ Twijfelgeval</span> — waarschijnlijk op basis van context.
                      </p>
                    </div>
  
                    <XAICategory
                      title="Skills"
                      matched={r.matched_skills}
                      suggested={r.suggested_skills}
                      fallback={SKILL_FALLBACK}
                    />
                    <XAICategory
                      title="Verticals"
                      matched={r.matched_verticals}
                      suggested={r.suggested_verticals}
                    />
                    <XAICategory
                      title="Rollen"
                      matched={r.matched_roles}
                      suggested={r.suggested_roles}
                      fallback={ROLE_FALLBACK}
                    />
                    <XAICategory
                      title="Industrie"
                      matched={r.matched_industries}
                      suggested={r.suggested_industries}
                      fallback={{ bg:"rgba(168,85,247,0.08)", border:"rgba(168,85,247,0.22)", color:"rgba(192,132,252,0.9)" }}
                    />
                  </div>
                )}
              </div>
            )}
  
            {/* Sales Toolkit */}
            <SalesToolkit result={r} accent={accent} onSaveGem={onSaveGem}/>
  
            {/* Feedback widget */}
            <FeedbackWidget context="cv-analyse" accent={accent}/>
  
            {/* Actieknoppen */}
            <div style={{marginTop:16,display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}>
              {/* Recruit CRM — placeholder */}
              <button
                onClick={e=>{e.stopPropagation();handleRecruitCRM();}}
                style={{background:"rgba(251,191,36,0.05)",border:"1px solid rgba(251,191,36,0.2)",color:"rgba(251,191,36,0.7)",borderRadius:9999,padding:"7px 16px",fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.2s",display:"flex",alignItems:"center",gap:5,backdropFilter:"blur(8px)"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(251,191,36,0.45)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(251,191,36,0.2)"}>
                🔗 Recruit CRM
              </button>
              {/* Supabase opslaan */}
              <button
                onClick={e=>{e.stopPropagation();handleSave();}}
                disabled={saving}
                style={{background:saving?"rgba(99,102,241,0.15)":"linear-gradient(135deg,rgba(79,70,229,0.8),rgba(124,58,237,0.8))",color:"white",border:"1px solid rgba(99,102,241,0.3)",borderRadius:9999,padding:"7px 16px",fontSize:12,fontWeight:500,cursor:saving?"not-allowed":"pointer",opacity:saving?0.5:1,transition:"all 0.2s",display:"flex",alignItems:"center",gap:5,backdropFilter:"blur(8px)",boxShadow:saving?"none":"0 2px 12px rgba(99,102,241,0.25)"}}>
                {saving?<><span style={{display:"inline-block",width:11,height:11,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"white",borderRadius:"50%",animation:"s 0.7s linear infinite"}}/> Opslaan...</>:"💾 Opslaan in Database"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  /* ═══ APP ═════════════════════════════════════════════════════════ */
  function App() {
    // ── Data uit Supabase via hook ──────────────────────────────────────────────
    const { crmSkills, verticals, roles, industries, loading: dataLoading } = useAppData();

    const [user, setUser] = React.useState(null);
    const [noAccess, setNoAccess] = React.useState(false);
    const T = user ? (DOMAIN_THEMES[user.domain]||DEFAULT_THEME) : DEFAULT_THEME;
    const lastName = (() => {
      if (!user?.email) return null;
      const parts = user.email.split("@")[0].split(".");
      if (parts.length < 2) return null;
      return parts.slice(1).join(" ").replace(/\b\w/g, c=>c.toUpperCase());
    })();
  
    // ── Gebruikersprofiel (Supabase) ──
    const [userProfile, setUserProfile] = React.useState(null);
    const [showOnboarding, setShowOnboarding] = React.useState(false);
    const [obNaam, setObNaam] = React.useState("");
    const [obLocatie, setObLocatie] = React.useState("Utrecht (030)");

    // Session restore op mount — blijft ingelogd na refresh
    React.useEffect(() => {
      try {
        const raw = localStorage.getItem(SB_SESSION_KEY);
        if (!raw) return;
        const session = JSON.parse(raw);
        if (!session?.access_token) return;
        const payload = JSON.parse(atob(session.access_token.split(".")[1]));
        // Token verlopen check
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem(SB_SESSION_KEY);
          return;
        }
        const email = payload.email || session.user?.email;
        const d     = email?.split("@")[1]?.toLowerCase() || "";
        sbGetProfile(session.access_token).then(profile => {
          setUser({ email, domain: d, isAdmin: profile?.is_org_admin || profile?.is_team_admin || false, apiKey: ANTHROPIC_API_KEY, accessToken: session.access_token, profile });
          if (profile) setUserProfile(profile);
        });
      } catch { /* ongeldige sessie — negeer */ }
    }, []);

    // Consultant details helper — altijd up-to-date
    const consultantNaam    = userProfile?.naam    || "";
    const consultantLocatie = userProfile?.locatie || "";
    const consultantPhone   = consultantLocatie.includes("Amsterdam") ? "020 - XXX XXXX" : "030 - XXX XXXX";
    const consultantEmail   = user?.email || "";

    async function saveProfile() {
      const p = { naam: obNaam.trim(), locatie: obLocatie };
      setUserProfile(prev => ({ ...prev, ...p }));
      setShowOnboarding(false);
      if (user?.accessToken) {
        try { await sbSaveProfile(user.accessToken, user.email, p); } catch { /* stil falen */ }
      }
    }
  
    // ── Gems Kennisbank ──
    const [gems, setGems] = React.useState([
      { id:1, title:"Koude Acquisitie Medical Devices", type:"Belscript", content:"Opening: \"Hi [Naam], ik bel je kort omdat ik net een Account Manager sprak die exact de Life Sciences ervaring heeft waar jullie naar zoeken...\"\n\nHook: Benoem direct de Medical Devices en B2B Sales achtergrond.\n\nCTA: \"Wanneer ben je vanmiddag 5 minuten beschikbaar?\"", isShared:true, team:"Morgan Green", author:"Chakib J.", date:"Vandaag" },
      { id:2, title:"Mijn perfecte QA Frontsheet", type:"Frontsheet", content:"[Candidate A] is een resultaatgerichte QA professional met 7 jaar ervaring in Medical Devices. Sterke kennis van ISO 13485, MDR en CAPA-processen. Beschikbaar per direct.", isShared:false, team:"Morgan Green", author:"Mijzelf", date:"Gisteren" },
      { id:3, title:"Boolean Lab Technicians", type:"Boolean", content:"(Laboratory OR Lab OR Laboratorium) AND (Technician OR Analist OR Analyst) AND (\"Life Sciences\" OR Pharma OR \"Medical Devices\") NOT (Manager OR Director)", isShared:true, team:"Morgan Lab", author:"Sanne V.", date:"Vorige week" },
      { id:4, title:"Intake Vragen Senior Sales MD", type:"Interview", content:"Vraag 1: Kun je een voorbeeld geven van een complex sales-traject in Medical Devices dat je recent hebt gesloten?\n\nVraag 2: Hoe ga je om met regulatory compliance (ISO/MDR) tijdens je pitch?\n\nVraag 3: Hoe snel kun je je inwerken op een nieuwe productgroep?", isShared:true, team:"Morgan Black", author:"Mijzelf", date:"2 dagen geleden" },
    ]);
    const [showGemModal, setShowGemModal] = React.useState(false);
    const [gemToSave, setGemToSave] = React.useState(null);
    const [showMyGems, setShowMyGems] = React.useState(false);
  
    const [tab, setTab] = React.useState("analyse");
    const [showAdmin,  setShowAdmin]  = React.useState(false);
    const [adminRole,  setAdminRole]  = React.useState("SUPER");
  
    /* Derive the admin role from the login email */
    function resolveAdminRole(email) {
      const e = (email||"").toLowerCase().trim();
      if (e === "admin@morgangreen.nl")       return "GREEN";
      if (e === "admin@morganblack.nl")       return "BLACK";
      if (e === "admin@morganlab.nl")         return "LAB";
      return "SUPER"; // admin@morganrecruitment.nl + any other admin
    }
    const isAdminAuth = user?.isAdmin === true;
    const TABS = [
      {id:"analyse",  label:"🔍 Analyse"},
      {id:"history",  label:"📋 Geschiedenis"},
      {id:"folder",   label:"📁 Folder"},
      {id:"vacature", label:"💼 Vacatures"},
      {id:"boolean",  label:"🔎 Boolean"},
      {id:"frontsheet",label:"📄 Frontsheet"},
    ];
  
    // ── Frontsheet Generator ──
    const [frontLoading, setFrontLoading] = React.useState(false);
    const [frontResult,  setFrontResult]  = React.useState(null);
    const [frontErr,     setFrontErr]     = React.useState("");
    const [showFrontModal,   setShowFrontModal]   = React.useState(false);
    const [showFrontConfig,  setShowFrontConfig]  = React.useState(false);
    const [frontInputMode,   setFrontInputMode]   = React.useState("history"); // "history" | "cv"
    const [frontSelectedKey, setFrontSelectedKey] = React.useState("");
    const [frontCvText,      setFrontCvText]      = React.useState("");
    const [frontCopied,      setFrontCopied]      = React.useState(false);
    const [frontLang,        setFrontLang]        = React.useState("nl"); // "nl" | "en"
    const [frontType,        setFrontType]        = React.useState("openbaar"); // "openbaar" | "anoniem"
    const [frontCrmId,       setFrontCrmId]       = React.useState("");
  
    // Analyse
    const [src, setSrc] = React.useState("linkedin");
    const [profileText, setProfileText] = React.useState("");
    const [cvFiles, setCvFiles] = React.useState([]);
    const [cvResults, setCvResults] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const [analyseStatus, setAnalyseStatus] = React.useState("");
    const [fact, setFact] = React.useState("");
    const [result, setResult] = React.useState(null);
    const [analyseErr, setAnalyseErr] = React.useState("");
  
    // History
    const [history, setHistory] = React.useState([]);
  
    // Folder — uitgebreide filters
    const [fLoc,      setFLoc]      = React.useState("");
    const [fRadius,   setFRadius]   = React.useState("landelijk");
    const [fVertical, setFVertical] = React.useState("");
    const [fRol,      setFRol]      = React.useState("");
    const [fActive,   setFActive]   = React.useState(false); // triggert visuele 'actief' staat filter-knop
  
    // Vacature — geschiedenis
    const [vacatureHistory, setVacatureHistory] = React.useState([
      { id:1, title:"QA Manager — ISO 13485",          date:"Vandaag",   vertical:"QA/RA",       matches:12 },
      { id:2, title:"Field Service Engineer",           date:"Gisteren",  vertical:"Engineering", matches:7  },
      { id:3, title:"Product Specialist MRI",           date:"Ma 9 jun",  vertical:"Sales",       matches:9  },
      { id:4, title:"Clinical Application Specialist",  date:"Vr 6 jun",  vertical:"Healthcare",  matches:5  },
    ]);
  
    // Vacature
    const [vacText, setVacText] = React.useState("");
    const [vacLoading, setVacLoading] = React.useState(false);
    const [vacResult, setVacResult] = React.useState(null);
    const [vacErr, setVacErr] = React.useState("");
    const [vacExp, setVacExp] = React.useState(null);
  
    // Belscript — per kandidaat index: { loading, script, err, copied }
    const [belScripts, setBelScripts] = React.useState({});
    function setBel(i, patch) { setBelScripts(prev=>({...prev,[i]:{...prev[i],...patch}})); }
  
    // Boolean
    const [boolText, setBoolText] = React.useState("");
    const [boolLoading, setBoolLoading] = React.useState(false);
    const [boolResult, setBoolResult] = React.useState(null);
    const [boolErr, setBoolErr] = React.useState("");
    const [copied, setCopied] = React.useState("");
    const [boolPlatform, setBoolPlatform] = React.useState(null);
  
    // Boolean Library (Supabase)
    const [libItems,    setLibItems]    = React.useState([]);
    const [libLoading,  setLibLoading]  = React.useState(false);
    const [libOpen,     setLibOpen]     = React.useState(false);
    const [libErr,      setLibErr]      = React.useState("");
    const [saveModal,   setSaveModal]   = React.useState(false);
    const [saveTitle,   setSaveTitle]   = React.useState("");
    const [saveLoading, setSaveLoading] = React.useState(false);
    const [saveMsg,     setSaveMsg]     = React.useState("");
    const [libSearch,   setLibSearch]   = React.useState("");
  
    // Derive label_id from logged-in domain
    const boolLabelId = React.useMemo(() => {
      const d = user?.domain || "";
      if (d === "morgangreen.nl")  return "GREEN";
      if (d === "morganblack.nl")  return "BLACK";
      if (d === "morganlab.nl")    return "LAB";
      return "SUPER";
    }, [user]);
  
    async function loadLibrary() {
      setLibLoading(true); setLibErr("");
      try {
        const rows = await fetchSavedBooleans(boolLabelId);
        setLibItems(rows);
      } catch(e) { setLibErr(e.message); }
      finally    { setLibLoading(false); }
    }
  
    async function handleSaveBoolean() {
      const str = boolText.trim();
      if (!str) { setSaveMsg("⚠️ Tekstgebied is leeg."); return; }
      if (!saveTitle.trim()) { setSaveMsg("⚠️ Geef een naam op."); return; }
      setSaveLoading(true); setSaveMsg("");
      try {
        await insertSavedBoolean(saveTitle.trim(), str, boolLabelId);
        setSaveMsg("✅ Opgeslagen!");
        setSaveTitle("");
        loadLibrary();
        setTimeout(() => { setSaveModal(false); setSaveMsg(""); }, 1200);
      } catch(e) { setSaveMsg("❌ " + e.message); }
      finally    { setSaveLoading(false); }
    }
  
    async function handleDeleteBoolean(id, e) {
      e.stopPropagation();
      if (!window.confirm("Verwijder deze Boolean uit de bibliotheek?")) return;
      try {
        await deleteSavedBoolean(id);
        setLibItems(prev => prev.filter(r => r.id !== id));
      } catch(err) { alert(err.message); }
    }
  
    const filteredLib = libItems.filter(r =>
      r.title.toLowerCase().includes(libSearch.toLowerCase()) ||
      r.boolean_string.toLowerCase().includes(libSearch.toLowerCase())
    );
  
    function parseJSON(txt) {
      if (!txt) return null;
  
      // ── Stap 1: strip markdown code fences ──
      let s = txt.replace(/```[\w]*\n?/g, "").replace(/```/g, "").trim();
  
      // ── Stap 2: extract outermost JSON object ──
      const start = s.indexOf("{");
      const end   = s.lastIndexOf("}");
      if (start === -1 || end === -1 || end <= start) return null;
      s = s.slice(start, end + 1);
  
      // ── Stap 3: basisreparaties (veilig, volgorde is belangrijk) ──
      // 3a. dubbele openings-accolade door prefill: "{ {" of "{{"
      s = s.replace(/^\{\s*\{/, "{");
      // 3b. smart/curly quotes → straight quotes
      s = s.replace(/[\u201C\u201D\u201E\u201F]/g, '"').replace(/[\u2018\u2019\u201A\u201B]/g, "'");
      // 3c. trailing commas voor } of ]
      s = s.replace(/,(\s*[}\]])/g, "$1");
  
      // ── Pass 1: direct parse ──
      try { return JSON.parse(s); } catch {}
  
      // ── Pass 2: char-by-char — escape raw control chars + repareer ongeldige backslash-escapes ──
      try {
        const VALID_ESCAPES = new Set(['"','\\','/','b','f','n','r','t','u']);
        let out = ""; let inStr = false; let esc = false;
        for (let i = 0; i < s.length; i++) {
          const c = s[i];
          if (esc) {
            if (inStr && !VALID_ESCAPES.has(c)) {
              out = out.slice(0,-1) + "\\\\"; // vervang de \ die al toegevoegd was door \\
            }
            out += c; esc = false; continue;
          }
          if (c === "\\" && inStr) { esc = true; out += c; continue; }
          if (c === '"') { inStr = !inStr; out += c; continue; }
          if (inStr) {
            if      (c === "\n") { out += "\\n"; continue; }
            else if (c === "\r") { out += "\\r"; continue; }
            else if (c === "\t") { out += "\\t"; continue; }
            else if (c.charCodeAt(0) < 32) { out += " "; continue; }
          }
          out += c;
        }
        // trailing commas nogmaals na char-pass (model kan er meerdere hebben)
        out = out.replace(/,(\s*[}\]])/g, "$1");
        return JSON.parse(out);
      } catch {}
  
      // ── Pass 3: agressief — vervang alle literal whitespace-control chars ──
      try {
        const s3 = s
          .replace(/\r?\n/g, " ")
          .replace(/[\x00-\x1F\x7F]/g, " ")
          .replace(/,(\s*[}\]])/g, "$1");
        return JSON.parse(s3);
      } catch {}
  
      // ── Pass 4: last resort — extract alleen strings/waarden met regex repair ──
      try {
        // Vervang onveilige tekens in string-waarden via regex
        const s4 = s.replace(/"((?:[^"\\]|\\.)*)"/g, (_match, inner) => {
          const fixed = inner
            .replace(/\r?\n/g, "\\n")
            .replace(/\t/g, "\\t")
            .replace(/[\x00-\x1F\x7F]/g, " ");
          return '"' + fixed + '"';
        }).replace(/,(\s*[}\]])/g, "$1");
        return JSON.parse(s4);
      } catch { return null; }
    }
  
    async function analyse() {
      const isCv = src==="cv";
      if (!isCv && !profileText.trim()) { setAnalyseErr("Plak eerst profieltekst."); return; }
      if (isCv && cvFiles.length===0) { setAnalyseErr("Upload eerst een CV."); return; }
      setAnalyseErr(""); setResult(null); setCvResults([]);
  
      // ── DEMO MODUS ────────────────────────────────────────────────────────────
      if (DEMO_MODUS) {
        setLoading(true); setProgress(0);
        let prog = 0;
        const demoTimer = setInterval(()=>{ prog+=(88-prog)*0.045+0.3; setProgress(Math.min(88,Math.round(prog))); }, 300);
        await new Promise(r => setTimeout(r, 2000));
        clearInterval(demoTimer); setProgress(100);
  
        const dummyData = {
          name: "Demo Kandidaat (Token Bespaarder)",
          current_role: "Account Manager Medical Devices",
          location: "Utrecht",
          total_years_experience: 5,
          matched_skills: [
            { item: "Medical Devices", related_vertical: "Sales & Marketing",         reasoning: "Profiel vermeldt expliciet '3 jaar ervaring in Medical Devices sales'." },
            { item: "B2B",             related_vertical: "Sales & Marketing",         reasoning: "Kandidaat omschrijft alle posities als B2B-omgevingen." },
            { item: "Pharma",          related_vertical: "Medical & Clinical Affairs", reasoning: "Werkte bij Medtronic en Philips Healthcare — beide pharma-gerelateerd." },
            { item: "CRM",             related_vertical: "Sales & Marketing",         reasoning: "Noemt Salesforce CRM dagelijks gebruik in huidige functie." },
          ],
          suggested_skills: [
            { item: "Cold Calling",    related_vertical: "Sales & Marketing",  reasoning: "Twijfelgeval: functietitel 'Account Manager' impliceert prospecting, maar niet expliciet benoemd." },
            { item: "Cardiovasculair", related_vertical: "Medical & Clinical Affairs", reasoning: "Twijfelgeval: werkte bij hartklep-divisie; specifieke expertise niet bevestigd." },
          ],
          matched_verticals: [
            { item: "Sales & Marketing",         reasoning: "Alle functies vallen onder commerciële/sales rollen." },
            { item: "Medical & Clinical Affairs", reasoning: "Directe samenwerking met KOL's en ziekenhuizen vermeld." },
          ],
          suggested_verticals: [
            { item: "Market Access", reasoning: "Twijfelgeval: betrokken bij vergoedingstrajecten, maar niet als hoofdrol." },
          ],
          matched_roles: [
            { item: "Sales",       related_vertical: "Sales & Marketing", reasoning: "Huidige rol is expliciet 'Account Manager Sales'." },
            { item: "Key Account", related_vertical: "Sales & Marketing", reasoning: "Beheert een KAM-portefeuille van 12 ziekenhuizen." },
          ],
          suggested_roles: [
            { item: "Business Development Manager", related_vertical: "Sales & Marketing", reasoning: "Twijfelgeval: heeft BD-taken uitgevoerd, maar niet als formele jobtitel." },
          ],
          matched_industries: [
            { item: "Medical Devices",  reasoning: "Heeft uitsluitend gewerkt bij Medical Device fabrikanten." },
          ],
          suggested_industries: [
            { item: "Pharmaceuticals",  reasoning: "Twijfelgeval: raakpunten met pharma via ziekenhuiskanaal, maar geen directe ervaring." },
          ],
          general_comments: "Dit is een demo-profiel dat direct wordt ingeladen om API-tokens te besparen tijdens het testen van de interface. Zet DEMO_MODUS op 'false' bovenaan het bestand voor echte analyses. De onderbouwing hierboven toont het nieuwe Explainable AI-formaat.",
          contact: { email: "demo@morgangreen.nl", phone: "06-12345678", linkedin_url: null }
        };
  
        if (isCv) {
          // CV-modus: simuleer meerdere resultaten als er meerdere files zijn
          const res = (cvFiles.length ? cvFiles : [{name:"demo.pdf"}]).map((f, i) => ({
            key: `demo_cv_${i}`, file: f.name,
            result: {...dummyData, name: `Demo Kandidaat ${i+1} (${f.name?.replace(/\.[^.]+$/,"")||"CV"})`},
            open: i===0
          }));
          res.forEach(r => setHistory(h=>[{key:r.key,...r.result,savedAt:Date.now(),source:"cv"},...h]));
          setCvResults(res);
        } else {
          setResult(dummyData);
          setHistory(h=>[{key:`demo_${Date.now()}`,...dummyData,savedAt:Date.now(),source:src},...h]);
        }
  
        setTimeout(()=>{ setLoading(false); setProgress(0); }, 500);
        return;
      }
      // ─────────────────────────────────────────────────────────────────────────
  
      const pool = [...DAILY_FACTS, ...(lastName ? [`Hé ${lastName}! Gemiddeld heeft een recruiter 7 seconden om een kandidaat te beoordelen.`] : [])];
      let fi = Math.floor(Math.random()*pool.length);
      setFact(pool[fi]);
      const factTimer = setInterval(()=>{ fi=(fi+1)%pool.length; setFact(pool[fi]); }, 10000);
      setLoading(true); setProgress(0); setAnalyseStatus("");
  
      const sys = buildSystemPrompt(isCv?"CV":src==="indeed"?"Indeed":"LinkedIn", crmSkills.join(","), verticals.join(","), roles.join(","), industries.join(","));
  
      // ── Gedeeld fetch-helper met prompt caching ──────────────────────────────
      async function callAnalyseAPI(userContent) {
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": user.apiKey,
            "anthropic-dangerous-direct-browser-access": "true",
            "anthropic-version": "2023-06-01",
            "anthropic-beta": "prompt-caching-2024-07-31"
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 2000,
            system: [
              {
                type: "text",
                text: sys,
                cache_control: { type: "ephemeral" }  // Cache de grote taxonomie-lijsten
              }
            ],
            messages: [
              { role: "user", content: userContent },
              { role: "assistant", content: "{" }
            ]
          })
        });
        return resp;
      }
  
      if (isCv) {
        // CV-modus: echte voortgang per bestand, geen nep-timer
        const res = [];
        for (let i=0; i<cvFiles.length; i++) {
          const f = cvFiles[i];
          setProgress(Math.round((i / cvFiles.length) * 100));
          setAnalyseStatus(`Bezig met CV ${i+1} van ${cvFiles.length} analyseren...`);
          try {
            const userContent = f.base64
              ? [{type:"document",source:{type:"base64",media_type:"application/pdf",data:f.base64}},{type:"text",text:"Analyseer dit CV."}]
              : `CV tekst:\n${f.text||""}`;
            const resp = await callAnalyseAPI(userContent);
            const d = await resp.json();
            const raw = d.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"";
            const txt = raw.trimStart().startsWith("{") ? raw : "{" + raw;
            const parsed = parseJSON(txt) || {name:f.name.replace(/\.[^.]+$/,""),general_comments:"Kon CV niet parsen.",matched_skills:[],suggested_skills:[],matched_verticals:[],suggested_verticals:[],matched_roles:[],suggested_roles:[],matched_industries:[],suggested_industries:[],contact:{}};
            const key = `cv_${Date.now()}_${i}`;
            res.push({key,file:f.name,result:parsed,open:i===0});
            setHistory(h=>[{key,...parsed,savedAt:Date.now(),source:"cv",raw_text:f.text||""},...h]);
          } catch(e) {
            res.push({key:`err_${i}`,file:f.name,result:null,error:e.message,open:false});
          }
          setCvResults([...res]);
        }
        setProgress(100); setAnalyseStatus("Afronden...");
        clearInterval(factTimer);
        setTimeout(()=>{ setLoading(false); setProgress(0); setAnalyseStatus(""); }, 500);
        return;
      }
  
      // LinkedIn / Indeed modus: nep-timer + status tekst
      let prog=0;
      const progTimer = setInterval(()=>{ prog+=(88-prog)*0.045+0.3; setProgress(Math.min(88,Math.round(prog))); },300);
      setAnalyseStatus("Profiel analyseren...");
      const done = ()=>{ clearInterval(factTimer); clearInterval(progTimer); setProgress(100); setAnalyseStatus("Afronden..."); setTimeout(()=>{ setLoading(false); setProgress(0); setAnalyseStatus(""); },500); };
  
      try {
        const resp = await callAnalyseAPI(`${src==="indeed"?"Indeed":"LinkedIn"} profiel:\n${profileText.trim()}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const d = await Promise.race([resp.json(), new Promise((_,rej)=>setTimeout(()=>rej(new Error("Response parsing timeout")),30000))]);
        let raw = d.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"";
        // Als response werd afgekapt door max_tokens, probeer JSON te sluiten
        if (d.stop_reason === "max_tokens") {
          // Sluit openstaande arrays/objecten door nesting te tellen
          let depth = 0; let inStr = false; let esc = false;
          for (const c of ("{" + raw)) {
            if (esc) { esc=false; continue; }
            if (c==="\\" && inStr) { esc=true; continue; }
            if (c==='"') { inStr=!inStr; continue; }
            if (!inStr) { if (c==="{" || c==="[") depth++; else if (c==="}" || c==="]") depth--; }
          }
          // Sluit openstaande nesting
          for (let i=0; i<depth; i++) raw += (i===depth-1 ? "}" : "}");
        }
        const txt = raw.trimStart().startsWith("{") ? raw : "{" + raw;
        const parsed = parseJSON(txt);
        if (!parsed) {
          console.error("[TalentLens] JSON parse mislukt. stop_reason:", d.stop_reason, "Raw (500):", txt.slice(0,500));
          throw new Error("Kon JSON niet verwerken. Probeer opnieuw.");
        }
        setResult(parsed);
        setHistory(h=>[{key:`p_${Date.now()}`,...parsed,savedAt:Date.now(),source:src,raw_text:profileText.trim()},...h]);
      } catch(e) {
        setAnalyseErr(e.message||"Onbekende fout");
      } finally { done(); }
    }
  
    async function matchVacature() {
      if (!vacText.trim()) { setVacErr("Plak een vacaturetekst."); return; }
      if (history.length===0) { setVacErr("Geen kandidaten in geschiedenis."); return; }
      setVacErr(""); setVacLoading(true); setVacResult(null);
      try {
        const candidateList = history.slice(0,12).map((c,i)=>{
          const skills = (c.matched_skills||[]).slice(0,8).map(s=>typeof s==="object"?s.item:s).filter(Boolean).join(", ");
          const exp = c.total_years_experience ? ` - ${c.total_years_experience}jr ervaring` : "";
          const loc = c.location ? ` - ${c.location}` : "";
          return `${i+1}. ${c.name||"?"} | ${c.current_role||"?"}${exp}${loc} | skills: ${skills}`;
        }).join("\n");
        const resp = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":user.apiKey,"anthropic-dangerous-direct-browser-access":"true","anthropic-version":"2023-06-01"},body:JSON.stringify({
          model:"claude-3-5-sonnet-20241022",max_tokens:2400,
          system:"Jij bent een expert recruiter. Match kandidaten op de vacature en analyseer elk grondig. Retourneer ALLEEN geldig JSON op 1 regel zonder uitleg, backticks of markdown. Schema: {\"vacature_samenvatting\":{\"functie\":null,\"locatie\":null,\"kernvereisten\":null,\"vereiste_skills\":[],\"sector\":null},\"kandidaten\":[{\"naam\":null,\"match_score\":0,\"reden\":null,\"sterke_punten\":[],\"aandachtspunten\":[],\"aanbeveling\":null}]}. match_score=0-100. sterke_punten=2-4 concrete pluspunten. aandachtspunten=1-3 ontbrekende zaken. aanbeveling=1 zin actieadvies.",
          messages:[{role:"user",content:`Vacature:\n${vacText}\n\nKandidaten:\n${candidateList}`},{role:"assistant",content:"{"}]
        })});
        if (!resp.ok) throw new Error(`API fout: HTTP ${resp.status}`);
        const d = await resp.json();
        const raw = d.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"";
        // Prefill assistant with "{" so prepend it back
        const txt = raw.trimStart().startsWith("{") ? raw : "{" + raw;
        const p = parseJSON(txt);
        if (!p) throw new Error("Kon het antwoord niet verwerken. Probeer opnieuw.");
        setVacResult(p);
      } catch(e) { setVacErr(e.message||"Fout"); }
      finally { setVacLoading(false); }
    }
  
    async function generateBoolean() {
      if (!boolText.trim()) { setBoolErr("Plak een vacaturetekst."); return; }
      setBoolErr(""); setBoolLoading(true); setBoolResult(null); setBoolPlatform(null);
      try {
        const resp = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":user.apiKey,"anthropic-dangerous-direct-browser-access":"true","anthropic-version":"2023-06-01"},body:JSON.stringify({
          model:"claude-3-5-sonnet-20241022",max_tokens:2500,
          system:`Expert Boolean search architect voor Medical Devices, Pharma, Healthcare, Life Sciences. Retourneer UITSLUITEND geldige JSON op 1 regel zonder backticks of uitleg.\nCRUCIALE JSON REGELS:\n1. Gebruik ALTIJD dubbele aanhalingstekens (") voor alle JSON-keys en om de string-waarden heen (bijv. "job_titles": "...").\n2. BINNENIN de boolean strings (de zoektermen) mag je NOOIT dubbele aanhalingstekens gebruiken. Gebruik voor de zoektermen zelf ALTIJD enkele aanhalingstekens (').\nVoorbeeld van de PERFECTE syntax: "job_titles": "'Clinical Specialist' OR 'Field Service Engineer'"\nSchema dat je moet volgen: {"functie":null,"synoniemen":[],"locatie":null,"skills":[],"senioriteit":null,"boolean_strings":{"linkedin":{"job_titles":null,"keywords":null,"companies":null},"indeed":{"what":null,"where":null},"recruitcrm":{"keywords":null}},"target_bedrijven":[{"naam":null,"reden":null}],"recruiter_tips":[]}\nZorg dat de strings perfect zijn geformatteerd. Bijvoorbeeld voor LinkedIn: zet functietitels in "job_titles" (bijv. 'Clinical Specialist' OR 'Field Service Engineer'), zet verplichte skills in "keywords" (bijv. ('medical devices' OR 'medische apparatuur') AND ('service' OR 'onderhoud')), en target bedrijven in "companies" (bijv. Philips OR Siemens). Voor Indeed: functietitel + skills in "what", locatie in "where". Voor RecruitCRM: alles in "keywords". target_bedrijven: 5-8 bedrijven met korte reden.`,
          messages:[
            {role:"user",content:`Vacature:\n${boolText.trim()}`},
            {role:"assistant",content:"{"}
          ]
        })});
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const d = await resp.json();
        const raw = d.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"";
        const txt = raw.trimStart().startsWith("{") ? raw : "{" + raw;
        const p = parseJSON(txt);
        if (!p) throw new Error("Geen JSON ontvangen. Probeer opnieuw.");
        setBoolResult(p);
      } catch(e) { setBoolErr(e.message||"Fout"); }
      finally { setBoolLoading(false); }
    }
  
    async function generateBelScript(kandidaat, vacatureTekst, idx) {
      setBel(idx, {loading:true, script:null, err:null, copied:false});
      try {
        const prompt = `Kandidaat: ${kandidaat.naam||"?"}
  Match score: ${kandidaat.match_score||0}%
  Sterke punten: ${(kandidaat.sterke_punten||[]).join("; ")}
  Aandachtspunten: ${(kandidaat.aandachtspunten||[]).join("; ")}
  Aanbeveling: ${kandidaat.aanbeveling||""}
  
  Vacature:
  ${vacatureTekst}`;
        const resp = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":user.apiKey,"anthropic-dangerous-direct-browser-access":"true","anthropic-version":"2023-06-01"},body:JSON.stringify({
          model:"claude-3-5-sonnet-20241022",max_tokens:600,
          system:"Je bent een top-biller recruitment consultant. Je staat op het punt deze kandidaat te bellen. Schrijf een kort, bondig en commercieel belscript (maximaal 3 bullet points) dat uitsluitend is gefocust op de keiharde overeenkomsten tussen het profiel van de kandidaat en de eisen van de vacature. Pas je toon en vaktermen automatisch aan op de branche van de vacature (zoals IT, Lab, Engineering of Sales). Het doel is om de kandidaat in de eerste 30 seconden van het telefoongesprek te overtuigen en de sale te maken. Gebruik spreektaal.",
          messages:[{role:"user",content:prompt}]
        })});
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const d = await resp.json();
        const script = d.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"";
        if (!script) throw new Error("Leeg antwoord ontvangen.");
        setBel(idx, {loading:false, script, err:null, copied:false});
      } catch(e) {
        setBel(idx, {loading:false, script:null, err:e.message||"Fout"});
      }
    }
  
    async function generateFrontsheet() {
      // Build context from selected input mode
      let inputContext = "";
      if (frontInputMode === "history") {
        const candidate = history.find(h => (h.key||h.naam) === frontSelectedKey);
        if (!candidate) { setFrontErr("Selecteer een kandidaat uit de lijst."); return; }
        inputContext = `Geanalyseerd CRM-profiel (JSON):\n${JSON.stringify(candidate, null, 2)}`;
      } else {
        if (!frontCvText.trim()) { setFrontErr("Plak eerst de CV-tekst."); return; }
        inputContext = `Ruwe CV-tekst:\n${frontCvText.trim()}`;
      }
  
      setFrontLoading(true); setFrontResult(null); setFrontErr(""); setFrontCopied(false);
      setShowFrontConfig(false);
  
      // ── DEMO MODUS ────────────────────────────────────────────────────────────
      if (DEMO_MODUS) {
        setTimeout(() => {
          let demoName = "Demo Kandidaat";
          if (typeof frontType !== 'undefined' && frontType === "anoniem") {
            demoName = "Kandidaat ID: " + (typeof frontCrmId !== 'undefined' && frontCrmId ? frontCrmId : "XXXX");
          } else if (frontInputMode === "history") {
            const c = history.find(h => (h.key||h.naam) === frontSelectedKey);
            if (c) demoName = c.name || c.naam || "Demo Kandidaat";
          }
          setFrontResult({
            naam: demoName,
            huidige_functie: "Account Manager Medical Devices",
            locatie: "Utrecht (Demo)",
            salaris: "[Zelf in te vullen door consultant]",
            beschikbaarheid: "[Zelf in te vullen door consultant]",
            profiel_bullets: [
              "Strategisch en resultaatgericht in B2B sales.",
              "Ruime ervaring binnen de Life Sciences & Healthcare markt.",
              "Sterk in relatiebeheer op C-level en medisch specialist niveau."
            ],
            omschrijving_paragrafen: [
              "Deze gedreven professional heeft een bewezen track record binnen de medische industrie. Met een sterke focus op klanttevredenheid en omzetgroei, is deze kandidaat in staat om complexe medische oplossingen commercieel te vertalen.",
              "In de afgelopen jaren heeft de kandidaat gewerkt bij diverse toonaangevende organisaties (zoals Bedrijf A en Bedrijf B), waar de verantwoordelijkheid werd gedragen voor grote productportfolio's en key accounts."
            ],
            opleiding: "Bachelor (HBO) Commerciële Economie",
            consultant_notitie: "DEMO MODUS ACTIEF - Er is geen echte AI data gebruikt om API-limieten te voorkomen.",
            foto_waarschuwing: (typeof frontType !== 'undefined' && frontType === "anoniem") ? "⚠️ Let op: Er is mogelijk een profielfoto in het originele document gedetecteerd." : null
          });
          setFrontLoading(false);
          setShowFrontModal(true);
        }, 1500);
        return; // BELANGRIJK: stopt de functie en voorkomt de dure API-call hieronder!
      }
      // ─────────────────────────────────────────────────────────────────────────
  
      const sys = `Je bent een professionele recruitment-assistent bij Morgan Recruitment Group. Genereer een strakke Candidate Frontsheet in het ${frontLang === "nl" ? "Nederlands" : "Engels"} op basis van de aangeleverde kandidaatinformatie.
  
  Het type frontsheet is: ${frontType}.
  
  ⛔ ABSOLUTE RESTRICTIE — SALARIS & BESCHIKBAARHEID:
  Verzin NOOIT zelf een Salaris of Beschikbaarheid. Gebruik in de output ALTIJD de exacte tekst: "[Zelf in te vullen door consultant]" voor deze twee velden.
  
  ${frontType === "anoniem" ? `🕵️ ANONIEM MODUS — VERPLICHTE REGELS:
  - Gebruik als naam ALTIJD exact 'Kandidaat ID: ${frontCrmId || "ONBEKEND"}'. Gebruik NOOIT de echte naam.
  - Anonimiseer ALLE bedrijfsnamen in werkervaring en omschrijvingsparagrafen naar 'Bedrijf A', 'Bedrijf B', etc. (chronologisch).
  - Verwijder ALLE contactgegevens, e-mailadressen en telefoonnummers van de kandidaat volledig uit de output.
  ` : ""}
  📸 FOTO DETECTIE:
  Analyseer de ruwe tekst op aanwijzingen van een profielfoto (zoals de tekst '[image]', 'foto', 'photo', bestandsnamen als '.jpg' of '.png', of vergelijkbare aanwijzingen). Als je vermoedt dat het originele document een foto bevat, zet dan een korte waarschuwing in 'foto_waarschuwing'. Zo niet, gebruik null.
  
  Het Word-sjabloon heeft precies 5 invulvelden. Retourneer ALLEEN geldig JSON op één regel, zonder backticks, zonder uitleg:
  {"naam":null,"huidige_functie":null,"locatie":null,"salaris":"[Zelf in te vullen door consultant]","beschikbaarheid":"[Zelf in te vullen door consultant]","profiel_bullets":[],"omschrijving_paragrafen":[],"opleiding":null,"consultant_notitie":null,"foto_waarschuwing":null}
  
  Definities:
  - profiel_bullets: array van 5-8 korte bulletpunten (elk max 12 woorden) die het profiel van de kandidaat omschrijven. Begin elk punt met een werkwoord of zelfstandig naamwoord. Geen alinea's.
  - omschrijving_paragrafen: array van 2-4 alinea's (elk 2-4 zinnen) die de werkervaring en achtergrond beschrijven. Eerste alinea = professionele samenvatting. Overige = relevante ervaring per werkgever.
  - opleiding: één zin met de hoogst behaalde opleiding en eventuele relevante cursussen.
  - foto_waarschuwing: string met korte waarschuwing als er aanwijzingen zijn van een profielfoto in het document, anders null.
  - Vul ALLEEN in wat je kunt halen uit de tekst. Gebruik null voor ontbrekende gegevens.
  - Schrijf ALLE veldinhoud (bullets, paragrafen, notities) in het ${frontLang === "nl" ? "Nederlands" : "Engels"}.`;
      try {
        const resp = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":user.apiKey,"anthropic-dangerous-direct-browser-access":"true","anthropic-version":"2023-06-01"},
          body:JSON.stringify({model:"claude-3-5-sonnet-20241022",max_tokens:2000,system:sys,
            messages:[{role:"user",content:`Kandidaatinformatie:\n${inputContext}`},{role:"assistant",content:"{"}]
          })});
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const d = await resp.json();
        const raw = "{" + (d.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"");
        const p = parseJSON(raw);
        if (!p) throw new Error("Geen geldige JSON ontvangen.");
        setFrontResult(p);
        setShowFrontModal(true);
      } catch(e) { setFrontErr(e.message||"Onbekende fout"); setShowFrontConfig(true); }
      finally { setFrontLoading(false); }
    }
  
    function generateDocx(fr, rawCvText) {
      // Genereer een .doc via HTML-blob (werkt in alle omgevingen zonder externe dependencies)
      const esc = s => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const bullets = (fr.profiel_bullets||[]).map(b=>`<li>${esc(b)}</li>`).join("");
      const paragrafen = (fr.omschrijving_paragrafen||[]).map(p=>`<p>${esc(p)}</p>`).join("");
      const rawCvSection = rawCvText
        ? `<br clear="all" style="page-break-before:always" />
  <h2>Origineel CV / Profiel</h2>
  <div style="color:#444;font-size:10pt;line-height:1.7;">${esc(rawCvText).replace(/\n/g,"<br/>")}</div>`
        : "";
      const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head><meta charset='utf-8'><title>Frontsheet ${esc(fr.naam)}</title>
  <style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#1a1a1a;margin:2cm;}h1{font-size:16pt;color:#1a3d2b;border-bottom:2px solid #1a6b3c;padding-bottom:6pt;}h2{font-size:11pt;color:#1a6b3c;margin:12pt 0 4pt;text-transform:uppercase;}table{width:100%;border-collapse:collapse;}td{padding:5pt 8pt;border-bottom:1px solid #eee;font-size:10.5pt;vertical-align:top;}td.l{color:#666;width:36%;font-weight:bold;}td.y{color:#b45309;font-style:italic;}ul{margin:4pt 0;padding-left:18pt;}li{margin-bottom:3pt;}p{margin:0 0 8pt;line-height:1.6;}.cb{background:#f0f7f3;border:1px solid #1a6b3c;padding:10pt 14pt;margin-top:16pt;}</style></head>
  <body>
  <h1>Candidate Frontsheet — Morgan Recruitment Group</h1>
  <table>
  <tr><td class="l">Naam</td><td>${esc(fr.naam||"—")}</td></tr>
  <tr><td class="l">Huidige functie</td><td>${esc(fr.huidige_functie||"—")}</td></tr>
  <tr><td class="l">Locatie</td><td>${esc(fr.locatie||"—")}</td></tr>
  <tr><td class="l">Opleiding</td><td>${esc(fr.opleiding||"—")}</td></tr>
  <tr><td class="l">Salaris</td><td class="y">${esc(fr.salaris)}</td></tr>
  <tr><td class="l">Beschikbaarheid</td><td class="y">${esc(fr.beschikbaarheid)}</td></tr>
  </table>
  ${bullets?`<h2>Profiel</h2><ul>${bullets}</ul>`:""}
  ${paragrafen?`<h2>Omschrijving</h2>${paragrafen}`:""}
  <div class="cb">
  <h2>Consultant Details</h2>
  <table>
  <tr><td class="l">Naam</td><td>${esc(consultantNaam||"—")}</td></tr>
  <tr><td class="l">E-mail</td><td>${esc(consultantEmail||"—")}</td></tr>
  <tr><td class="l">Telefoon</td><td>${esc(consultantPhone)}</td></tr>
  <tr><td class="l">Kantoor</td><td>${esc(consultantLocatie||"—")}</td></tr>
  </table>
  </div>
  ${rawCvSection}
  </body></html>`;
      const blob = new Blob(["\ufeff", html], { type: "application/msword" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `Frontsheet_${(fr.naam||"Kandidaat").replace(/\s+/g,"_")}.doc`;
      document.body.appendChild(a); a.click();
      setTimeout(()=>{ document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
    }
  
    const filtered = history.filter(h => {
      if (fLoc && fActive) {
        const loc = h.location?.toLowerCase() || "";
        if (!loc.includes(fLoc.toLowerCase())) return false;
      }
      if (fVertical) {
        const allV = [...(h.matched_verticals||[]), ...(h.suggested_verticals||[])].map(v => (v.item||v).toLowerCase());
        if (!allV.some(v => v.includes(fVertical.toLowerCase()))) return false;
      }
      if (fRol) {
        const allR = [...(h.matched_roles||[]), ...(h.suggested_roles||[])].map(r => (r.item||r).toLowerCase());
        if (!allR.some(r => r.includes(fRol.toLowerCase()))) return false;
      }
      return true;
    });
  
    if (dataLoading) return (
      <div style={{minHeight:"100vh",background:"#07100A",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <p style={{color:"rgba(255,255,255,0.4)",fontSize:14,fontFamily:"Inter,sans-serif"}}>Laden...</p>
      </div>
    );

    if (!user) return (
      <>
        {noAccess&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setNoAccess(false)}>
            <div style={{background:"#0a1a0f",border:"1px solid rgba(239,68,68,0.3)",borderRadius:16,padding:32,maxWidth:380,textAlign:"center"}}>
              <p style={{fontSize:14,color:"rgba(255,255,255,0.7)",margin:0}}>⛔ Dit e-mailadres heeft geen toegang tot CRM Intelligence.</p>
            </div>
          </div>
        )}
        <LoginScreen onLogin={u=>{
          setUser(u);
          setNoAccess(false);
          setShowAdmin(u.isAdmin === true);
          if (u.isAdmin) setAdminRole(resolveAdminRole(u.email));
          // Profiel uit Supabase zetten (meegeleverd vanuit attempt())
          if (u.profile) {
            setUserProfile(u.profile);
            setObNaam(u.profile.naam || "");
            setObLocatie(u.profile.locatie || "Utrecht (030)");
            if (!u.profile.naam && !u.isAdmin) setShowOnboarding(true);
          } else if (!u.isAdmin) {
            setObNaam("");
            setObLocatie("Utrecht (030)");
            setShowOnboarding(true);
          }
        }} onNoAccess={()=>setNoAccess(true)}/>
      </>
    );
  
    const css = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      *{box-sizing:border-box;font-family:'Inter',sans-serif;}
      .btn{
        background:${T.btnGrad};
        color:white;border:none;border-radius:9999px;
        padding:10px 22px;font-size:13px;font-weight:500;
        cursor:pointer;transition:all 0.2s;
        box-shadow:0 2px 12px rgba(0,0,0,0.25),0 1px 3px rgba(0,0,0,0.15);
        letter-spacing:0.01em;
      }
      .btn:disabled{opacity:0.35;cursor:not-allowed;box-shadow:none;}
      .btn:hover:not(:disabled){box-shadow:0 4px 20px ${T.accentGlow},0 2px 8px rgba(0,0,0,0.2);transform:translateY(-1px);}
      .btn:active:not(:disabled){transform:translateY(0);}
      .ghost{
        background:rgba(255,255,255,0.06);
        backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
        border:1px solid rgba(255,255,255,0.1);
        color:rgba(255,255,255,0.6);
        border-radius:9999px;padding:9px 18px;font-size:13px;cursor:pointer;transition:all 0.2s;
      }
      .ghost:hover{background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.85);border-color:rgba(255,255,255,0.18);}
      .card{
        background:rgba(255,255,255,0.04);
        backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
        border:1px solid rgba(255,255,255,0.08);
        border-radius:20px;padding:20px;margin-bottom:12px;
      }
      textarea{
        width:100%;
        background:rgba(255,255,255,0.04);
        backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
        border:1px solid rgba(255,255,255,0.09);
        border-radius:14px;color:rgba(255,255,255,0.85);
        padding:13px 15px;font-size:14px;line-height:1.65;resize:vertical;outline:none;
        transition:border-color 0.2s,box-shadow 0.2s;
      }
      textarea:focus{
        border-color:${T.accent}70;
        box-shadow:0 0 0 3px ${T.accent}15,0 2px 12px rgba(0,0,0,0.1);
      }
      .tab{
        background:none;border:none;cursor:pointer;
        padding:7px 16px;font-size:13px;font-weight:500;
        color:rgba(255,255,255,0.4);border-radius:9999px;
        transition:all 0.18s;white-space:nowrap;
      }
      .tab.on{
        color:rgba(255,255,255,0.92);
        background:rgba(255,255,255,0.1);
        backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
        box-shadow:0 1px 4px rgba(0,0,0,0.2);
      }
      .tab:hover:not(.on){color:rgba(255,255,255,0.65);background:rgba(255,255,255,0.05);}
      .spin{display:inline-block;width:13px;height:13px;border:2px solid rgba(255,255,255,0.25);border-top-color:white;border-radius:50%;animation:s 0.7s linear infinite;margin-right:7px;vertical-align:middle;}
      @keyframes s{to{transform:rotate(360deg);}}
      @keyframes fi{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
      @keyframes fadeInApp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
      .fi{animation:fi 0.28s cubic-bezier(.4,0,.2,1) forwards;}
      input.txt{
        width:100%;
        background:rgba(255,255,255,0.04);
        backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
        border:1px solid rgba(255,255,255,0.09);
        border-radius:12px;color:rgba(255,255,255,0.85);
        padding:10px 14px;font-size:14px;outline:none;
        transition:border-color 0.2s,box-shadow 0.2s;
      }
      input.txt:focus{
        border-color:${T.accent}70;
        box-shadow:0 0 0 3px ${T.accent}15;
      }
      ::placeholder{color:rgba(255,255,255,0.22);}
    `;
  
    return (
      <div style={{minHeight:"100vh",background:T.bg,color:"rgba(255,255,255,0.85)",paddingBottom:80,animation:"fadeInApp 0.6s ease-out forwards"}}>
        <style>{css}</style>
  
        {/* ── Onboarding Modal ── */}
        {showOnboarding&&(
          <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",padding:24}}>
            <div style={{background:"rgba(12,28,18,0.95)",backdropFilter:"blur(32px)",WebkitBackdropFilter:"blur(32px)",border:`1px solid ${T.accent}35`,borderRadius:24,padding:36,width:"100%",maxWidth:420,boxShadow:`0 24px 64px rgba(0,0,0,0.6),0 0 0 1px ${T.accent}15`}}>
              <div style={{textAlign:"center",marginBottom:28}}>
                <div style={{width:54,height:54,borderRadius:18,background:`${T.accent}18`,border:`1px solid ${T.accent}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 14px"}}>👤</div>
                <h2 style={{fontSize:20,fontWeight:700,color:"rgba(255,255,255,0.92)",margin:"0 0 6px",letterSpacing:-0.4}}>Profiel instellen</h2>
                <p style={{fontSize:13,color:"rgba(255,255,255,0.38)",margin:0,fontWeight:400,lineHeight:1.6}}>Eenmalig — voor de Frontsheet Generator</p>
              </div>
  
              <div style={{marginBottom:18}}>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.35)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Volledige naam</label>
                <input
                  className="txt"
                  value={obNaam}
                  onChange={e=>setObNaam(e.target.value)}
                  placeholder="bijv. Chakib Johnson"
                  autoFocus
                  style={{fontSize:14}}
                />
              </div>
  
              <div style={{marginBottom:28}}>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.35)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Kantoorlocatie</label>
                <div style={{display:"flex",gap:10}}>
                  {["Utrecht (030)","Amsterdam (020)"].map(loc=>(
                    <button key={loc} onClick={()=>setObLocatie(loc)} style={{flex:1,padding:"12px 16px",borderRadius:14,border:`1px solid ${obLocatie===loc?T.accent+"70":"rgba(255,255,255,0.1)"}`,background:obLocatie===loc?`${T.accent}14`:"rgba(255,255,255,0.03)",color:obLocatie===loc?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.4)",fontSize:13,fontWeight:obLocatie===loc?600:400,cursor:"pointer",transition:"all 0.18s",backdropFilter:"blur(8px)"}}>
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
  
              <button
                onClick={saveProfile}
                disabled={!obNaam.trim()}
                style={{width:"100%",background:obNaam.trim()?T.btnGrad:"rgba(255,255,255,0.06)",border:"none",borderRadius:14,padding:"13px",fontSize:14,fontWeight:600,color:obNaam.trim()?"white":"rgba(255,255,255,0.25)",cursor:obNaam.trim()?"pointer":"not-allowed",transition:"all 0.2s",boxShadow:obNaam.trim()?`0 4px 20px ${T.accentGlow}`:"none"}}>
                ✓ Opslaan & beginnen
              </button>
            </div>
          </div>
        )}
  
        {/* ── Frontsheet Config Modal ── */}
        {showFrontConfig&&(
          <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.72)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",padding:24}}>
            <div style={{background:"rgba(10,22,14,0.97)",backdropFilter:"blur(32px)",WebkitBackdropFilter:"blur(32px)",border:`1px solid ${T.accent}30`,borderRadius:24,padding:0,width:"100%",maxWidth:480,boxShadow:`0 24px 72px rgba(0,0,0,0.65),0 0 0 1px ${T.accent}12`}}>
  
              {/* Header */}
              <div style={{padding:"22px 24px 18px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:16}}>📄</span>
                  <div>
                    <p style={{fontSize:15,fontWeight:700,color:"rgba(255,255,255,0.92)",margin:0,letterSpacing:-0.3}}>Frontsheet Generator</p>
                    <p style={{fontSize:11,color:"rgba(255,255,255,0.32)",margin:0,fontWeight:400}}>Kies de bron van de kandidaatgegevens</p>
                  </div>
                </div>
                <button onClick={()=>setShowFrontConfig(false)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",color:"rgba(255,255,255,0.35)",borderRadius:9999,padding:"5px 12px",fontSize:12,cursor:"pointer"}}>✕</button>
              </div>
  
              {/* Tab toggle */}
              <div style={{padding:"18px 24px 0"}}>
                <div style={{display:"flex",gap:4,background:"rgba(255,255,255,0.05)",borderRadius:14,padding:4,border:"1px solid rgba(255,255,255,0.07)"}}>
                  {[["history","👤 Geanalyseerd profiel"],["cv","📋 Nieuw CV"]].map(([mode,label])=>(
                    <button key={mode} onClick={()=>setFrontInputMode(mode)} style={{flex:1,padding:"9px 12px",borderRadius:11,border:"none",background:frontInputMode===mode?`${T.accent}18`:"transparent",color:frontInputMode===mode?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.38)",fontSize:12,fontWeight:frontInputMode===mode?600:400,cursor:"pointer",transition:"all 0.18s",boxShadow:frontInputMode===mode?`inset 0 0 0 1px ${T.accent}35`:"none"}}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
  
              {/* Body */}
              <div style={{padding:"16px 24px 24px"}}>
                {frontInputMode==="history" ? (
                  <div>
                    <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.3)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Selecteer kandidaat</label>
                    {history.length===0 ? (
                      <div style={{padding:"16px",background:"rgba(251,191,36,0.04)",border:"1px solid rgba(251,191,36,0.15)",borderRadius:14,textAlign:"center"}}>
                        <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",margin:0,lineHeight:1.6}}>Nog geen kandidaten geanalyseerd.<br/><span style={{fontSize:12,color:"rgba(255,255,255,0.25)"}}>Ga naar het Analyse-tabblad om te beginnen.</span></p>
                      </div>
                    ) : (
                      <select
                        value={frontSelectedKey}
                        onChange={e=>setFrontSelectedKey(e.target.value)}
                        style={{width:"100%",background:"rgba(255,255,255,0.05)",backdropFilter:"blur(12px)",border:`1px solid ${frontSelectedKey?T.accent+"50":"rgba(255,255,255,0.1)"}`,borderRadius:12,color:frontSelectedKey?"rgba(255,255,255,0.88)":"rgba(255,255,255,0.35)",padding:"11px 14px",fontSize:13,outline:"none",cursor:"pointer",transition:"border-color 0.2s",appearance:"none",WebkitAppearance:"none"}}>
                        <option value="" style={{background:"#0a1a0f",color:"rgba(255,255,255,0.4)"}}>— Kies een kandidaat —</option>
                        {history.map(h=>(
                          <option key={h.key||h.naam} value={h.key||h.naam} style={{background:"#0a1a0f",color:"rgba(255,255,255,0.88)"}}>
                            {h.name||h.naam||"Onbekend"}{h.current_role?` · ${h.current_role}`:""}
                          </option>
                        ))}
                      </select>
                    )}
                    {frontSelectedKey&&(()=>{
                      const c = history.find(h=>(h.key||h.naam)===frontSelectedKey);
                      return c ? (
                        <div style={{marginTop:10,padding:"10px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12}}>
                          <p style={{fontSize:12,color:"rgba(255,255,255,0.55)",margin:0,lineHeight:1.6}}>
                            <span style={{color:"rgba(255,255,255,0.28)",fontWeight:500}}>Locatie: </span>{c.location||"—"}&nbsp;&nbsp;
                            <span style={{color:"rgba(255,255,255,0.28)",fontWeight:500}}>Ervaring: </span>{c.total_years_experience||"—"}j
                          </p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                ) : (
                  <div>
                    <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.3)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>CV-tekst</label>
                    <textarea
                      rows={8}
                      value={frontCvText}
                      onChange={e=>setFrontCvText(e.target.value)}
                      placeholder="Plak hier de tekst van het CV..."
                      style={{width:"100%",background:"rgba(255,255,255,0.04)",backdropFilter:"blur(12px)",border:`1px solid ${frontCvText.trim()?T.accent+"50":"rgba(255,255,255,0.09)"}`,borderRadius:14,color:"rgba(255,255,255,0.85)",padding:"13px 15px",fontSize:13,lineHeight:1.65,resize:"vertical",outline:"none",transition:"border-color 0.2s, box-shadow 0.2s"}}
                    />
                  </div>
                )}
  
                {frontErr&&<p style={{color:"rgba(252,165,165,0.85)",fontSize:12,margin:"10px 0 0"}}>⚠️ {frontErr}</p>}
  
                {/* Type Frontsheet */}
                <div style={{marginTop:16}}>
                  <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.3)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>🔒 Type Frontsheet</label>
                  <div style={{display:"flex",gap:4,background:"rgba(255,255,255,0.05)",borderRadius:14,padding:4,border:"1px solid rgba(255,255,255,0.07)"}}>
                    {[["openbaar","🌍 Openbaar"],["anoniem","🕵️ Anoniem"]].map(([type,label])=>(
                      <button key={type} onClick={()=>setFrontType(type)}
                        style={{flex:1,padding:"9px 12px",borderRadius:11,border:"none",
                          background:frontType===type?(type==="anoniem"?"rgba(251,191,36,0.15)":`${T.accent}18`):"transparent",
                          color:frontType===type?(type==="anoniem"?"rgba(251,191,36,0.95)":"rgba(255,255,255,0.9)"):"rgba(255,255,255,0.38)",
                          fontSize:12,fontWeight:frontType===type?600:400,cursor:"pointer",transition:"all 0.18s",
                          boxShadow:frontType===type?`inset 0 0 0 1px ${type==="anoniem"?"rgba(251,191,36,0.45)":T.accent+"35"}`:"none"}}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {frontType==="anoniem"&&(
                    <div style={{marginTop:10,animation:"fi 0.2s ease forwards"}}>
                      <div style={{padding:"10px 14px",background:"rgba(251,191,36,0.04)",border:"1px solid rgba(251,191,36,0.18)",borderRadius:12,marginBottom:10,display:"flex",alignItems:"flex-start",gap:8}}>
                        <span style={{fontSize:13,flexShrink:0}}>🕵️</span>
                        <p style={{fontSize:11,color:"rgba(251,191,36,0.65)",margin:0,lineHeight:1.6,fontWeight:400}}>
                          Bedrijfsnamen worden geanonimiseerd. De kandidaatnaam wordt vervangen door het CRM-ID.
                        </p>
                      </div>
                      <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.3)",letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>CRM Kandidaat ID</label>
                      <input
                        className="txt"
                        value={frontCrmId}
                        onChange={e=>setFrontCrmId(e.target.value)}
                        placeholder="bijv. 81207"
                        style={{fontSize:13,borderColor:frontCrmId?`rgba(251,191,36,0.5)`:"rgba(255,255,255,0.09)"}}
                      />
                    </div>
                  )}
                </div>
  
                {/* Taal Frontsheet */}
                <div style={{marginTop:16}}>
                  <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.3)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>🌐 Taal Frontsheet</label>
                  <div style={{display:"flex",gap:4,background:"rgba(255,255,255,0.05)",borderRadius:14,padding:4,border:"1px solid rgba(255,255,255,0.07)"}}>
                    {[["nl","🇳🇱 Nederlands"],["en","🇬🇧 Engels"]].map(([lang,label])=>(
                      <button key={lang} onClick={()=>setFrontLang(lang)}
                        style={{flex:1,padding:"9px 12px",borderRadius:11,border:"none",background:frontLang===lang?`${T.accent}18`:"transparent",color:frontLang===lang?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.38)",fontSize:12,fontWeight:frontLang===lang?600:400,cursor:"pointer",transition:"all 0.18s",boxShadow:frontLang===lang?`inset 0 0 0 1px ${T.accent}35`:"none"}}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
  
                <button
                  onClick={generateFrontsheet}
                  disabled={frontLoading||(frontInputMode==="history"?(!frontSelectedKey||history.length===0):(frontCvText.trim().length===0))}
                  style={{marginTop:18,width:"100%",background:T.btnGrad,color:"white",border:"none",borderRadius:14,padding:"13px",fontSize:14,fontWeight:600,cursor:"pointer",transition:"all 0.2s",boxShadow:`0 4px 20px ${T.accentGlow}`,opacity:(frontLoading||(frontInputMode==="history"?(!frontSelectedKey||history.length===0):(frontCvText.trim().length===0)))?0.4:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  {frontLoading?<><span style={{display:"inline-block",width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"white",borderRadius:"50%",animation:"s 0.7s linear infinite"}}/>Genereren...</>:"📄 Genereer Frontsheet"}
                </button>
              </div>
            </div>
          </div>
        )}
  
        {/* ── Frontsheet Preview Modal ── */}
        {showFrontModal&&frontResult&&(()=>{
          const fr = frontResult;
          const copyText = [
            "═══════════════════════════════════════",
            "  CANDIDATE FRONTSHEET",
            "  Morgan Recruitment Group",
            "═══════════════════════════════════════",
            "",
            `NAAM              ${fr.naam||"—"}`,
            `HUIDIGE FUNCTIE   ${fr.huidige_functie||"—"}`,
            `LOCATIE           ${fr.locatie||"—"}`,
            `OPLEIDING         ${fr.opleiding||"—"}`,
            `SALARIS           ${fr.salaris}`,
            `BESCHIKBAARHEID   ${fr.beschikbaarheid}`,
            "",
            "── PROFIEL ──────────────────────────────",
            ...(fr.profiel_bullets||[]).map(b=>`  • ${b}`),
            "",
            "── OMSCHRIJVING ─────────────────────────",
            ...(fr.omschrijving_paragrafen||[]).map(p=>`  ${p}`),
            "",
            "═══════════════════════════════════════",
            "  CONSULTANT DETAILS",
            "═══════════════════════════════════════",
            `Naam     ${consultantNaam||"—"}`,
            `E-mail   ${consultantEmail||"—"}`,
            `Telefoon ${consultantPhone}`,
            `Kantoor  ${consultantLocatie||"—"}`,
            "═══════════════════════════════════════",
          ].join("\n");
  
          return (
            <div style={{position:"fixed",inset:0,zIndex:150,display:"flex",alignItems:"flex-start",justifyContent:"center",background:"rgba(0,0,0,0.75)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",padding:"20px 16px",overflowY:"auto"}}>
              <div style={{background:"rgba(10,22,14,0.97)",backdropFilter:"blur(32px)",WebkitBackdropFilter:"blur(32px)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:24,width:"100%",maxWidth:620,boxShadow:"0 32px 80px rgba(0,0,0,0.7)"}}>
                {/* Modal header */}
                <div style={{padding:"20px 24px 18px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:16}}>📄</span>
                    <div>
                      <p style={{fontSize:15,fontWeight:700,color:"rgba(255,255,255,0.92)",margin:0,letterSpacing:-0.3}}>Candidate Frontsheet</p>
                      <p style={{fontSize:11,color:"rgba(255,255,255,0.32)",margin:0,fontWeight:400}}>{fr.naam||"Onbekend"}</p>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <button onClick={()=>{
                      const candidate = frontInputMode==="history" ? history.find(h=>(h.key||h.naam)===frontSelectedKey) : null;
                      const rawCvText = frontInputMode==="cv" ? frontCvText : (candidate?.raw_text||"");
                      generateDocx(fr, rawCvText);
                    }}
                      style={{background:`${T.accent}14`,border:`1px solid ${T.accent}35`,color:T.accent,borderRadius:9999,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.2s",display:"flex",alignItems:"center",gap:5,boxShadow:`0 2px 10px ${T.accentGlow}`}}
                      onMouseEnter={e=>e.currentTarget.style.background=`${T.accent}22`}
                      onMouseLeave={e=>e.currentTarget.style.background=`${T.accent}14`}>
                      ⬇️ Download Frontsheet (.doc)
                    </button>
                    <button onClick={()=>{navigator.clipboard?.writeText(copyText);setFrontCopied(true);setTimeout(()=>setFrontCopied(false),2500);}}
                      style={{background:frontCopied?"rgba(52,211,153,0.1)":"rgba(255,255,255,0.06)",border:`1px solid ${frontCopied?"rgba(52,211,153,0.35)":"rgba(255,255,255,0.1)"}`,color:frontCopied?"rgba(52,211,153,0.9)":"rgba(255,255,255,0.5)",borderRadius:9999,padding:"6px 14px",fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.2s",display:"flex",alignItems:"center",gap:5}}>
                      {frontCopied?"✓ Gekopieerd":"📋 Kopieer tekst"}
                    </button>
                    <button onClick={()=>{setGemToSave({content:copyText,type:"Frontsheet"});setShowGemModal(true);}}
                      style={{background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.28)",color:"rgba(251,191,36,0.85)",borderRadius:9999,padding:"6px 14px",fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.2s",display:"flex",alignItems:"center",gap:5}}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(251,191,36,0.16)"}
                      onMouseLeave={e=>e.currentTarget.style.background="rgba(251,191,36,0.08)"}>
                      💎 Opslaan als Gem
                    </button>
                    <button onClick={()=>setShowFrontModal(false)}
                      style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",color:"rgba(255,255,255,0.4)",borderRadius:9999,padding:"6px 14px",fontSize:12,cursor:"pointer",transition:"all 0.2s"}}>
                      ✕ Sluiten
                    </button>
                  </div>
                </div>
  
                <div style={{padding:"20px 24px"}}>
                  {/* ── Foto waarschuwing banner ── */}
                  {fr.foto_waarschuwing&&(
                    <div style={{display:"flex",gap:12,alignItems:"flex-start",padding:"13px 16px",background:"rgba(251,146,60,0.08)",border:"1px solid rgba(251,146,60,0.35)",borderRadius:14,marginBottom:16,backdropFilter:"blur(12px)"}}>
                      <span style={{fontSize:18,flexShrink:0,lineHeight:1}}>⚠️</span>
                      <div>
                        <p style={{fontSize:13,fontWeight:600,color:"rgba(251,146,60,0.95)",margin:"0 0 3px",letterSpacing:-0.1}}>AI Waarschuwing: Mogelijke profielfoto gedetecteerd</p>
                        <p style={{fontSize:12,color:"rgba(251,146,60,0.7)",margin:0,lineHeight:1.6,fontWeight:400}}>
                          Er staat mogelijk een profielfoto in het originele bestand. <strong style={{fontWeight:600}}>Vergeet deze niet handmatig te verwijderen</strong> als je een anonieme versie verstuurt.
                        </p>
                      </div>
                    </div>
                  )}
  
                  {/* ── Anoniem badge ── */}
                  {frontType==="anoniem"&&(
                    <div style={{display:"flex",gap:10,alignItems:"center",padding:"10px 14px",background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:12,marginBottom:14}}>
                      <span style={{fontSize:14}}>🕵️</span>
                      <p style={{fontSize:12,color:"rgba(251,191,36,0.8)",margin:0,fontWeight:500}}>Anonieme frontsheet — naam en bedrijfsnamen zijn geanonimiseerd</p>
                    </div>
                  )}
  
                  {/* ── Kandidaatinfo tabel ── */}
                  <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,overflow:"hidden",marginBottom:14}}>
                    <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(255,255,255,0.02)"}}>
                      <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",margin:0,letterSpacing:1,textTransform:"uppercase"}}>Kandidaatprofiel</p>
                    </div>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                      <tbody>
                        {[
                          ["Naam",fr.naam],["Huidige functie",fr.huidige_functie],["Locatie",fr.locatie],
                          ["Opleiding",fr.opleiding],
                          ["Salaris",fr.salaris],["Beschikbaarheid",fr.beschikbaarheid],
                        ].filter(([,v])=>v).map(([k,v])=>(
                          <tr key={k} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                            <td style={{padding:"9px 16px",color:"rgba(255,255,255,0.3)",width:"36%",fontWeight:500,fontSize:12,verticalAlign:"top"}}>{k}</td>
                            <td style={{padding:"9px 16px 9px 0",color:(v==="[Zelf in te vullen door consultant]")?"rgba(251,191,36,0.75)":"rgba(255,255,255,0.78)",fontWeight:400,lineHeight:1.5}}>{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
  
                  {/* ── {Profiel} — bullet lijst ── */}
                  {(fr.profiel_bullets||[]).length>0&&(
                    <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"14px 16px",marginBottom:14}}>
                      <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",margin:"0 0 10px",letterSpacing:1,textTransform:"uppercase"}}>
                        Profiel <span style={{fontSize:9,opacity:0.5,fontWeight:400,marginLeft:6}}>→ {"{"}Profiel{"}"}</span>
                      </p>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}>
                        {fr.profiel_bullets.map((b,i)=>(
                          <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                            <span style={{color:T.accent,fontWeight:700,flexShrink:0,lineHeight:"20px",fontSize:13}}>•</span>
                            <p style={{fontSize:13,color:"rgba(255,255,255,0.7)",margin:0,lineHeight:1.6,fontWeight:400}}>{b}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
  
                  {/* ── {Omschrijving} — paragrafen ── */}
                  {(fr.omschrijving_paragrafen||[]).length>0&&(
                    <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"14px 16px",marginBottom:14}}>
                      <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",margin:"0 0 10px",letterSpacing:1,textTransform:"uppercase"}}>
                        Omschrijving <span style={{fontSize:9,opacity:0.5,fontWeight:400,marginLeft:6}}>→ {"{"}Omschrijving{"}"}</span>
                      </p>
                      <div style={{display:"flex",flexDirection:"column",gap:12}}>
                        {fr.omschrijving_paragrafen.map((p,i)=>(
                          <p key={i} style={{fontSize:13,color:"rgba(255,255,255,0.6)",margin:0,lineHeight:1.75,fontWeight:400}}>{p}</p>
                        ))}
                      </div>
                    </div>
                  )}
  
                  {/* ── Motivatie ── */}
                  {fr.motivatie&&(
                    <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"14px 16px",marginBottom:14}}>
                      <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",margin:"0 0 8px",letterSpacing:1,textTransform:"uppercase"}}>Wat zoekt deze kandidaat?</p>
                      <p style={{fontSize:13,color:"rgba(255,255,255,0.6)",margin:0,lineHeight:1.7,fontWeight:400,fontStyle:"italic"}}>"{fr.motivatie}"</p>
                    </div>
                  )}
  
                  {/* ── Consultant Details ── */}
                  <div style={{background:`${T.accent}08`,border:`1px solid ${T.accent}25`,borderRadius:16,padding:"16px",marginTop:6}}>
                    <p style={{fontSize:10,fontWeight:600,color:T.accent,margin:"0 0 12px",letterSpacing:1,textTransform:"uppercase",opacity:0.8}}>📇 Consultant Details</p>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {[
                        ["Naam",     consultantNaam||"—"],
                        ["E-mail",   consultantEmail||"—"],
                        ["Telefoon", consultantPhone],
                        ["Kantoor",  consultantLocatie||"—"],
                      ].map(([k,v])=>(
                        <div key={k} style={{display:"flex",gap:10,alignItems:"baseline"}}>
                          <span style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.28)",width:68,flexShrink:0}}>{k}</span>
                          <span style={{fontSize:13,color:"rgba(255,255,255,0.72)",fontWeight:400}}>{v}</span>
                        </div>
                      ))}
                    </div>
                    {!consultantNaam&&(
                      <p style={{fontSize:11,color:"rgba(251,191,36,0.65)",margin:"10px 0 0",fontWeight:400}}>
                        ⚠️ Geen profiel ingesteld — <button onClick={()=>{setShowFrontModal(false);setShowOnboarding(true);}} style={{background:"none",border:"none",color:"rgba(251,191,36,0.85)",cursor:"pointer",fontSize:11,fontWeight:600,padding:0,textDecoration:"underline"}}>profiel instellen</button>
                      </p>
                    )}
                  </div>
                  {/* Feedback widget */}
                  <div style={{padding:"0 24px 20px"}}>
                    <FeedbackWidget context="frontsheet" accent={T.accent}/>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
        <div style={{position:"relative",width:"100%",overflow:"hidden"}}>
          <img src={DOMAIN_BANNER[user.domain]||BANNER_MRG} alt="Morgan" style={{width:"100%",height:96,objectFit:"cover",objectPosition:"center",display:"block"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.3) 100%)",backdropFilter:"blur(0px)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",gap:8}}>
            {/* Links: Talent Lens + label */}
            <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
              <img src={TL_LOGO} alt="Talent Lens" style={{width:48,height:48,objectFit:"contain",flexShrink:0,filter:"drop-shadow(0 2px 8px rgba(0,0,0,0.4))"}}/>
              <span style={{fontSize:18,fontWeight:700,color:"rgba(255,255,255,0.95)",letterSpacing:-0.5,flexShrink:0}}>
                <span style={{color:T.accent}}>Talent</span> Lens
              </span>
              <span style={{fontSize:10,fontWeight:600,color:T.accent,background:`${T.accent}18`,border:`1px solid ${T.accent}35`,borderRadius:9999,padding:"2px 10px",letterSpacing:0.6,textTransform:"uppercase",flexShrink:0}}>
                {T.label}
              </span>
            </div>
            {/* Rechts: profiel teller + email + admin + uitloggen */}
            <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
              {history.length>0&&<span style={{fontSize:11,color:"rgba(255,255,255,0.55)",background:"rgba(255,255,255,0.08)",backdropFilter:"blur(8px)",borderRadius:9999,padding:"3px 10px",border:"1px solid rgba(255,255,255,0.1)"}}>{history.length} profiel{history.length!==1?"en":""}</span>}
              <button onClick={()=>setShowMyGems(true)}
                style={{background:"rgba(251,191,36,0.08)",backdropFilter:"blur(12px)",border:"1px solid rgba(251,191,36,0.25)",color:"rgba(251,191,36,0.8)",borderRadius:9999,padding:"5px 12px",fontSize:12,fontWeight:500,cursor:"pointer",flexShrink:0,transition:"all 0.2s",display:"flex",alignItems:"center",gap:5}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(251,191,36,0.15)";e.currentTarget.style.color="rgba(251,191,36,0.95)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(251,191,36,0.08)";e.currentTarget.style.color="rgba(251,191,36,0.8)";}}>
                💎 <span style={{display:"none"}} className="gem-label">Mijn Gems</span>
                <span>{gems.filter(g=>g.author==="Mijzelf").length}</span>
              </button>
              <span style={{fontSize:12,fontWeight:400,color:"rgba(255,255,255,0.65)",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.email}</span>
              {isAdminAuth&&(
                <button onClick={()=>setShowAdmin(true)}
                  title="Admin Dashboard"
                  style={{background:showAdmin?`${T.accent}22`:"rgba(255,255,255,0.08)",backdropFilter:"blur(12px)",border:`1px solid ${showAdmin?T.accent+"50":"rgba(255,255,255,0.15)"}`,color:showAdmin?T.accent:"rgba(255,255,255,0.55)",borderRadius:9999,padding:"5px 11px",fontSize:13,cursor:"pointer",flexShrink:0,transition:"all 0.2s"}}>
                  ⚙️
                </button>
              )}
              <button onClick={()=>setUser(null)} style={{background:"rgba(255,255,255,0.08)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.7)",borderRadius:9999,padding:"5px 14px",fontSize:12,cursor:"pointer",flexShrink:0,transition:"all 0.2s"}}>Uitloggen</button>
            </div>
          </div>
        </div>
  
        {/* ── Gem modals ── */}
        {showGemModal&&<SaveGemModal gemToSave={gemToSave} onClose={()=>{setShowGemModal(false);setGemToSave(null);}} onSave={g=>{setGems(p=>[g,...p]);}} accent={T.accent}/>}
        {showMyGems&&<MyGemsModal gems={gems} onClose={()=>setShowMyGems(false)} accent={T.accent}/>}
  
        {/* ── Admin Dashboard ── */}
        {showAdmin && (
          <AdminDashboard T={T} onClose={()=>setShowAdmin(false)} gems={gems} adminRole={adminRole}/>
        )}
  
        {/* ── Normale app inhoud ── */}
        {!showAdmin && (
          <div>
        {/* Segmented tab nav */}
        <div style={{display:"flex",justifyContent:"center",padding:"12px 16px 8px",background:"rgba(0,0,0,0.2)"}}>
          <div style={{display:"flex",gap:2,background:"rgba(255,255,255,0.05)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderRadius:9999,padding:"4px",border:"1px solid rgba(255,255,255,0.07)",overflowX:"auto",maxWidth:"100%"}}>
            {TABS.map(t=><button key={t.id} className={`tab${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>)}
          </div>
        </div>
  
        {/* Demo modus banner */}
        {DEMO_MODUS&&(
          <div style={{background:"rgba(251,191,36,0.06)",borderTop:"1px solid rgba(251,191,36,0.12)",borderBottom:"1px solid rgba(251,191,36,0.12)",padding:"8px 24px",display:"flex",alignItems:"center",justifyContent:"center",gap:8,backdropFilter:"blur(12px)"}}>
            <span style={{fontSize:12}}>🎭</span>
            <span style={{fontSize:12,color:"rgba(251,191,36,0.75)",fontWeight:400}}>Demo modus actief — geen tokens. Zet <code style={{background:"rgba(251,191,36,0.1)",borderRadius:6,padding:"1px 6px",fontSize:11,color:"#fcd34d",fontFamily:"monospace"}}>DEMO_MODUS = false</code> voor echte analyses.</span>
          </div>
        )}
  
        <div style={{maxWidth:820,margin:"0 auto",padding:"20px 16px"}}>
  
          {/* ══ ANALYSE ══ */}
          {tab==="analyse"&&(
            <div>
              {/* ── Vertical legenda ── */}
              <div className="card" style={{marginBottom:12}}>
                <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.3)",margin:"0 0 12px",letterSpacing:1,textTransform:"uppercase"}}>Vertical legenda</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:5}}>
                  {Object.entries(VERTICAL_COLORS).map(([name,c])=>(
                    <div key={name} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 10px",background:c.bg,border:`1px solid ${c.border}`,borderRadius:10,backdropFilter:"blur(8px)"}}>
                      <span style={{width:7,height:7,borderRadius:"50%",background:c.dot,flexShrink:0,display:"inline-block",boxShadow:`0 0 6px ${c.dot}80`}}/>
                      <span style={{fontSize:11,fontWeight:500,color:c.color,lineHeight:1.3}}>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                {/* Source segmented control */}
                <div style={{display:"flex",gap:4,marginBottom:16,background:"rgba(255,255,255,0.04)",borderRadius:9999,padding:"3px",border:"1px solid rgba(255,255,255,0.07)"}}>
                  {[["linkedin","💼 LinkedIn"],["indeed","🔎 Indeed"],["cv","📄 CV"]].map(([k,lbl])=>(
                    <button key={k} onClick={()=>{setSrc(k);setAnalyseErr("");}}
                      style={{flex:1,padding:"7px 6px",borderRadius:9999,border:"none",background:src===k?"rgba(255,255,255,0.1)":"transparent",color:src===k?"rgba(255,255,255,0.9)":src===k?T.accent:"rgba(255,255,255,0.38)",fontSize:13,fontWeight:src===k?500:400,cursor:"pointer",transition:"all 0.18s",boxShadow:src===k?"0 1px 4px rgba(0,0,0,0.2)":"none"}}>
                      {lbl}
                    </button>
                  ))}
                </div>
  
                {src!=="cv"&&(
                  <textarea rows={7} value={profileText} onChange={e=>setProfileText(e.target.value)}
                    onDragOver={e=>e.preventDefault()}
                    onDrop={e=>{
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = ev => setProfileText(ev.target.result||"");
                        reader.readAsText(file);
                      } else {
                        const text = e.dataTransfer.getData("text/plain")||e.dataTransfer.getData("text");
                        if (text) setProfileText(prev=>prev?prev+"\n"+text:text);
                      }
                    }}
                    placeholder={`Plak of sleep hier de volledige ${src==="indeed"?"Indeed":"LinkedIn"}-profieltekst...`}/>
                )}
  
                {src==="cv"&&(
                  <>
                    <div onClick={()=>document.getElementById("cvin").click()}
                      style={{border:`2px dashed ${cvFiles.length?T.accent:"rgba(255,255,255,0.12)"}`,borderRadius:10,padding:20,textAlign:"center",cursor:"pointer",background:cvFiles.length?`${T.accent}0d`:"transparent",transition:"all 0.2s"}}>
                      <input id="cvin" type="file" accept=".pdf,.doc,.docx" multiple style={{display:"none"}} onChange={async e=>{
                        const files=Array.from(e.target.files||[]);
                        const loaded=await Promise.all(files.map(f=>new Promise(res=>{
                          if(f.type==="application/pdf"){const r=new FileReader();r.onload=ev=>res({name:f.name,base64:ev.target.result.split(",")[1],type:f.type,text:null});r.readAsDataURL(f);}
                          else{const r=new FileReader();r.onload=ev=>res({name:f.name,base64:null,type:f.type,text:ev.target.result});r.readAsText(f);}
                        })));
                        setCvFiles(prev=>{const ns=new Set(prev.map(f=>f.name));return[...prev,...loaded.filter(f=>!ns.has(f.name))];});
                        e.target.value="";
                      }}/>
                      {cvFiles.length===0
                        ?<><div style={{fontSize:28,marginBottom:6}}>📄</div><p style={{color:"rgba(255,255,255,0.45)",fontSize:14,margin:0}}>Klik om CV's te uploaden</p><p style={{color:"rgba(255,255,255,0.25)",fontSize:12,margin:"4px 0 0"}}>PDF · meerdere tegelijk · max 5MB</p></>
                        :<><div style={{fontSize:24,marginBottom:4}}>✅</div><p style={{color:T.accent,fontSize:14,margin:0,fontWeight:500}}>{cvFiles.length} CV{cvFiles.length!==1?"'s":""} klaar</p><p style={{color:"rgba(255,255,255,0.3)",fontSize:12,margin:"4px 0 0"}}>Klik om meer toe te voegen</p></>
                      }
                    </div>
                    {cvFiles.length>0&&(
                      <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4}}>
                        {cvFiles.map((f,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 10px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:7}}>
                            <span style={{fontSize:12,color:"rgba(255,255,255,0.6)"}}>📄 {f.name}</span>
                            <button onClick={()=>setCvFiles(p=>p.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:14}}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
  
                {analyseErr&&<div style={{marginTop:12,padding:"10px 14px",background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:12,color:"rgba(252,165,165,0.9)",fontSize:13}}>⚠️ {analyseErr}</div>}
  
                <div style={{marginTop:16,display:"flex",gap:10}}>
                  <button className="btn" onClick={analyse} disabled={loading}>
                    {loading?<><span className="spin"/>Analyseren...</>:"🔍 Analyseer"}
                  </button>
                  {(profileText||result||cvFiles.length>0)&&!loading&&(
                    <button className="ghost" onClick={()=>{setProfileText("");setResult(null);setAnalyseErr("");setCvFiles([]);setCvResults([]);setProgress(0);}}>Wissen</button>
                  )}
                </div>
              </div>
  
              {loading&&(
                <div className="card fi">
                  {analyseStatus&&(
                    <p style={{fontSize:12,fontWeight:500,color:"rgba(255,255,255,0.45)",margin:"0 0 8px",letterSpacing:0.1}}>{analyseStatus}</p>
                  )}
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <div style={{flex:1,height:4,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${progress}%`,background:T.progressGrad,borderRadius:99,transition:"width 0.35s ease"}}/>
                    </div>
                    <span style={{fontSize:11,color:"rgba(255,255,255,0.28)",minWidth:30}}>{progress}%</span>
                  </div>
                  {fact&&<p style={{fontSize:13,color:"rgba(255,255,255,0.3)",margin:0,lineHeight:1.65}}>💡 {fact}</p>}
                </div>
              )}
  
              {result&&!loading&&<div className="fi"><ProfileCard result={result} theme={T} source={src} onSaveGem={(d)=>{setGemToSave(d);setShowGemModal(true);}}/></div>}
  
              {cvResults.length>0&&!loading&&(
                <div className="fi">
                  <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.3)",margin:"0 0 10px",letterSpacing:1,textTransform:"uppercase"}}>Resultaten ({cvResults.length})</p>
                  {cvResults.map((cr,i)=>(
                    <div key={cr.key} style={{background:"rgba(255,255,255,0.04)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:`1px solid ${cr.error?"rgba(239,68,68,0.2)":"rgba(255,255,255,0.08)"}`,borderRadius:16,overflow:"hidden",marginBottom:8}}>
                      <button onClick={()=>setCvResults(p=>p.map((x,j)=>j===i?{...x,open:!x.open}:x))}
                        style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px",background:"transparent",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.75)",fontSize:13}}>
                        <span style={{fontWeight:500}}>{cr.error?"❌":"✅"} {cr.result?.name||cr.file}</span>
                        <span style={{color:T.accent,fontSize:11}}>{cr.open?"▲":"▼"}</span>
                      </button>
                      {cr.open&&(
                        <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",padding:"4px 4px 10px"}}>
                          {cr.error?<p style={{padding:"10px 16px",color:"rgba(252,165,165,0.9)",fontSize:13,margin:0}}>⚠️ {cr.error}</p>:<ProfileCard result={cr.result} theme={T} compact source="cv"/>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
  
          {/* ══ HISTORY ══ */}
          {tab==="history"&&(
            <div>
              {history.length===0&&<div className="card" style={{textAlign:"center",padding:48}}><p style={{fontSize:14,color:"rgba(255,255,255,0.25)",margin:0,fontWeight:400}}>Nog geen profielen geanalyseerd.</p></div>}
              {history.map((h,i)=>(
                <div key={h.key||i} className="card">
                  <ProfileCard result={h} theme={T} compact source={h.source}/>
                  <p style={{fontSize:11,color:"rgba(255,255,255,0.18)",margin:"8px 0 0",fontWeight:400}}>{new Date(h.savedAt).toLocaleString("nl-NL")} · {h.source||"linkedin"}</p>
                </div>
              ))}
            </div>
          )}
  
          {/* ══ FOLDER ══ */}
          {tab==="folder"&&(
            <div>
              {/* ── Geavanceerde filter-balk ── */}
              <div style={{background:"rgba(255,255,255,0.03)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"16px 18px",marginBottom:14}}>
                {/* Label + teller */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                  <span style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.3)",letterSpacing:1.2,textTransform:"uppercase"}}>Filter Kandidaten</span>
                  <span style={{fontSize:11,color:T.accent,background:T.accent+"14",border:`1px solid ${T.accent}28`,borderRadius:9999,padding:"2px 10px",fontWeight:600}}>
                    {filtered.length} / {history.length} kandidaten
                  </span>
                </div>
  
                {/* Filter rij — wrapping flex */}
                <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
  
                  {/* Vertical dropdown */}
                  <div style={{display:"flex",flexDirection:"column",gap:5,flex:"1 1 140px",minWidth:130}}>
                    <label style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",letterSpacing:0.8,textTransform:"uppercase"}}>Vertical</label>
                    <select value={fVertical} onChange={e=>setFVertical(e.target.value)}
                      style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:fVertical?"rgba(255,255,255,0.88)":"rgba(255,255,255,0.35)",borderRadius:10,padding:"8px 10px",fontSize:12,fontWeight:500,cursor:"pointer",outline:"none",appearance:"none",WebkitAppearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.3)'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 10px center"}}>
                      <option value="">Alle Verticals</option>
                      <option value="Medical Devices">Medical Devices</option>
                      <option value="Pharma">Pharma</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Life Sciences">Life Sciences</option>
                      <option value="Sales">Sales & Marketing</option>
                      <option value="QA">QA / RA</option>
                    </select>
                  </div>
  
                  {/* Rol dropdown */}
                  <div style={{display:"flex",flexDirection:"column",gap:5,flex:"1 1 130px",minWidth:120}}>
                    <label style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",letterSpacing:0.8,textTransform:"uppercase"}}>Rol / Functie</label>
                    <select value={fRol} onChange={e=>setFRol(e.target.value)}
                      style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:fRol?"rgba(255,255,255,0.88)":"rgba(255,255,255,0.35)",borderRadius:10,padding:"8px 10px",fontSize:12,fontWeight:500,cursor:"pointer",outline:"none",appearance:"none",WebkitAppearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.3)'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 10px center"}}>
                      <option value="">Alle Rollen</option>
                      <option value="QA">QA / RA</option>
                      <option value="Sales">Sales</option>
                      <option value="Engineer">Engineering</option>
                      <option value="R&D">R&D</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Clinical">Clinical Affairs</option>
                      <option value="Medical">Medical Affairs</option>
                    </select>
                  </div>
  
                  {/* Locatie input + Radius dropdown */}
                  <div style={{display:"flex",flexDirection:"column",gap:5,flex:"2 1 220px",minWidth:190}}>
                    <label style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",letterSpacing:0.8,textTransform:"uppercase"}}>Locatie & Radius</label>
                    <div style={{display:"flex",gap:6}}>
                      <input
                        value={fLoc}
                        onChange={e=>{setFLoc(e.target.value);setFActive(false);}}
                        onKeyDown={e=>{if(e.key==="Enter")setFActive(true);}}
                        placeholder="Stad of Postcode"
                        style={{flex:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.88)",borderRadius:10,padding:"8px 10px",fontSize:12,outline:"none","::placeholder":{color:"rgba(255,255,255,0.25)"}}}
                      />
                      <select value={fRadius} onChange={e=>setFRadius(e.target.value)}
                        style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.7)",borderRadius:10,padding:"8px 8px",fontSize:11,fontWeight:500,cursor:"pointer",outline:"none",appearance:"none",WebkitAppearance:"none",width:82,flexShrink:0,backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.3)'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 7px center"}}>
                        <option value="10">+10 km</option>
                        <option value="20">+20 km</option>
                        <option value="30">+30 km</option>
                        <option value="50">+50 km</option>
                        <option value="landelijk">Landelijk</option>
                      </select>
                    </div>
                  </div>
  
                  {/* Filter knop */}
                  <div style={{display:"flex",flexDirection:"column",gap:5,flexShrink:0,justifyContent:"flex-end"}}>
                    <label style={{fontSize:10,color:"transparent",userSelect:"none"}}>_</label>
                    <button
                      onClick={()=>setFActive(true)}
                      style={{
                        background: fActive ? T.btnGrad : "rgba(255,255,255,0.07)",
                        border: `1px solid ${fActive ? T.accent+"50" : "rgba(255,255,255,0.12)"}`,
                        color: fActive ? "white" : "rgba(255,255,255,0.6)",
                        borderRadius:10,padding:"8px 16px",fontSize:12,fontWeight:600,
                        cursor:"pointer",transition:"all 0.2s",whiteSpace:"nowrap",
                        boxShadow: fActive ? `0 2px 16px ${T.accentGlow}` : "none",
                        display:"flex",alignItems:"center",gap:6
                      }}
                      onMouseEnter={e=>{if(!fActive){e.currentTarget.style.background="rgba(255,255,255,0.11)";e.currentTarget.style.color="rgba(255,255,255,0.9)";}}}
                      onMouseLeave={e=>{if(!fActive){e.currentTarget.style.background="rgba(255,255,255,0.07)";e.currentTarget.style.color="rgba(255,255,255,0.6)";}}}
                    >
                      🔍 Filter
                    </button>
                  </div>
  
                  {/* Reset knop — alleen zichtbaar als er iets geselecteerd is */}
                  {(fVertical||fRol||fLoc||fActive) && (
                    <div style={{display:"flex",flexDirection:"column",gap:5,flexShrink:0,justifyContent:"flex-end"}}>
                      <label style={{fontSize:10,color:"transparent",userSelect:"none"}}>_</label>
                      <button
                        onClick={()=>{setFVertical("");setFRol("");setFLoc("");setFRadius("landelijk");setFActive(false);}}
                        style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.35)",borderRadius:10,padding:"8px 12px",fontSize:12,cursor:"pointer",transition:"all 0.18s",whiteSpace:"nowrap"}}
                        onMouseEnter={e=>{e.currentTarget.style.color="rgba(255,255,255,0.65)";}}
                        onMouseLeave={e=>{e.currentTarget.style.color="rgba(255,255,255,0.35)";}}
                      >
                        ✕ Reset
                      </button>
                    </div>
                  )}
                </div>
  
                {/* Actieve filter pills */}
                {(fVertical||fRol||(fLoc&&fActive)) && (
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                    {fVertical&&<span style={{background:T.accent+"12",border:`1px solid ${T.accent}30`,color:T.accent,borderRadius:9999,padding:"3px 10px",fontSize:11,fontWeight:500}}>📊 {fVertical}</span>}
                    {fRol&&<span style={{background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.25)",color:"rgba(192,132,252,0.9)",borderRadius:9999,padding:"3px 10px",fontSize:11,fontWeight:500}}>👤 {fRol}</span>}
                    {fLoc&&fActive&&<span style={{background:"rgba(56,189,248,0.08)",border:"1px solid rgba(56,189,248,0.2)",color:"rgba(56,189,248,0.85)",borderRadius:9999,padding:"3px 10px",fontSize:11,fontWeight:500}}>📍 {fLoc}{fRadius!=="landelijk"?` · +${fRadius} km`:""}</span>}
                  </div>
                )}
              </div>
  
              {/* Kandidaten lijst */}
              {filtered.length === 0 && history.length > 0 && (
                <div style={{textAlign:"center",padding:"32px 0",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14}}>
                  <p style={{fontSize:22,margin:"0 0 8px"}}>🔍</p>
                  <p style={{fontSize:13,color:"rgba(255,255,255,0.35)",margin:0}}>Geen kandidaten gevonden voor deze filters.</p>
                  <p style={{fontSize:11,color:"rgba(255,255,255,0.2)",margin:"4px 0 0"}}>Pas de filters aan of klik Reset.</p>
                </div>
              )}
              {filtered.map((h,i)=><div key={h.key||i} style={{marginBottom:8}}><ProfileCard result={h} theme={T} compact source={h.source}/></div>)}
            </div>
          )}
  
          {/* ══ VACATURES ══ */}
          {tab==="vacature"&&(
            <div>
              <div className="card">
                <textarea rows={8} value={vacText} onChange={e=>setVacText(e.target.value)} placeholder="Plak hier de vacaturetekst..."/>
                {vacErr&&<p style={{color:"rgba(252,165,165,0.9)",fontSize:13,margin:"10px 0 0"}}>⚠️ {vacErr}</p>}
                <div style={{marginTop:14,display:"flex",gap:10}}>
                  <button className="btn" onClick={matchVacature} disabled={vacLoading}>
                    {vacLoading?<><span className="spin"/>Matchen...</>:`🎯 Match met ${history.length} kandidaat${history.length!==1?"en":""}`}
                  </button>
                  {(vacText||vacResult)&&!vacLoading&&<button className="ghost" onClick={()=>{setVacText("");setVacResult(null);setVacErr("");setVacExp(null);}}>Wissen</button>}
                </div>
                {history.length===0&&<p style={{fontSize:13,color:"rgba(255,255,255,0.22)",margin:"12px 0 0",fontWeight:400}}>ℹ️ Analyseer eerst kandidaten via het Analyse-tabblad.</p>}
              </div>
  
              {/* ── Recente Vacatures ── */}
              {vacatureHistory.length>0&&!vacResult&&(
                <div style={{background:"rgba(255,255,255,0.025)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:18,padding:"16px 18px",marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:26,height:26,borderRadius:8,background:T.accent+"18",border:`1px solid ${T.accent}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>📋</div>
                      <span style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.7)",letterSpacing:-0.2}}>Recente Vacatures</span>
                    </div>
                    <span style={{fontSize:10,color:"rgba(255,255,255,0.22)",letterSpacing:0.5,textTransform:"uppercase"}}>Klik om te laden</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
                    {vacatureHistory.map(v=>{
                      const vertColors = {
                        "QA/RA":       {bg:"rgba(52,211,153,0.08)",  border:"rgba(52,211,153,0.22)",  color:"rgba(52,211,153,0.9)"},
                        "Engineering": {bg:"rgba(56,189,248,0.08)",  border:"rgba(56,189,248,0.22)",  color:"rgba(56,189,248,0.85)"},
                        "Sales":       {bg:"rgba(251,191,36,0.08)",  border:"rgba(251,191,36,0.22)",  color:"rgba(251,191,36,0.9)"},
                        "Healthcare":  {bg:"rgba(167,139,250,0.08)", border:"rgba(167,139,250,0.22)", color:"rgba(192,132,252,0.9)"},
                      };
                      const vc = vertColors[v.vertical] || {bg:"rgba(255,255,255,0.06)",border:"rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.5)"};
                      return (
                        <button key={v.id}
                          onClick={()=>{ /* TODO: v.text && setVacText(v.text) */ }}
                          style={{
                            background:"rgba(255,255,255,0.03)",
                            border:"1px solid rgba(255,255,255,0.07)",
                            borderRadius:12,padding:"12px 14px",
                            textAlign:"left",cursor:"pointer",
                            transition:"all 0.18s",display:"flex",
                            flexDirection:"column",gap:6
                          }}
                          onMouseEnter={e=>{
                            e.currentTarget.style.background=T.accent+"0d";
                            e.currentTarget.style.borderColor=T.accent+"35";
                            e.currentTarget.style.boxShadow=`0 2px 16px ${T.accentGlow}`;
                          }}
                          onMouseLeave={e=>{
                            e.currentTarget.style.background="rgba(255,255,255,0.03)";
                            e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";
                            e.currentTarget.style.boxShadow="none";
                          }}
                        >
                          <span style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.82)",lineHeight:1.35,letterSpacing:-0.2}}>{v.title}</span>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
                            <span style={{fontSize:10,background:vc.bg,border:`1px solid ${vc.border}`,color:vc.color,borderRadius:9999,padding:"2px 8px",fontWeight:500,whiteSpace:"nowrap"}}>{v.vertical}</span>
                            <div style={{display:"flex",alignItems:"center",gap:4}}>
                              <span style={{fontSize:10,color:"rgba(255,255,255,0.2)"}}>{v.date}</span>
                              {v.matches&&<span style={{fontSize:10,color:T.accent,fontWeight:600}}>· {v.matches} matches</span>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {vacResult&&(
                <div className="fi">
                  <div className="card">
                    <h2 style={{fontSize:19,fontWeight:600,color:"rgba(255,255,255,0.88)",margin:"0 0 4px",letterSpacing:-0.3}}>{vacResult.vacature_samenvatting?.functie}</h2>
                    <p style={{fontSize:13,color:"rgba(255,255,255,0.38)",margin:"0 0 10px",fontWeight:400}}>{vacResult.vacature_samenvatting?.locatie} · {vacResult.vacature_samenvatting?.sector}</p>
                    <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.65,margin:"0 0 12px",fontWeight:400}}>{vacResult.vacature_samenvatting?.kernvereisten}</p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                      {vacResult.vacature_samenvatting?.vereiste_skills?.map(s=><span key={s} style={{background:"rgba(56,189,248,0.08)",border:"1px solid rgba(56,189,248,0.2)",color:"rgba(56,189,248,0.85)",padding:"3px 10px",borderRadius:9999,fontSize:11,fontWeight:500}}>{s}</span>)}
                    </div>
                  </div>
                  {vacResult.kandidaten?.map((k,i)=>{
                    const isExp=vacExp===i;
                    const sc=k.match_score||0;
                    const scC=sc>=85?"#34d399":sc>=65?"#fbbf24":sc>=40?"#fb923c":"#f87171";
                    const sterke=k.sterke_punten||[];
                    const aandacht=k.aandachtspunten||[];
                    return (
                      <div key={i} className="card" style={{cursor:"pointer",marginBottom:8,transition:"border-color 0.2s,box-shadow 0.2s",borderColor:isExp?`${scC}30`:"rgba(255,255,255,0.08)",boxShadow:isExp?`0 0 0 1px ${scC}20,0 4px 24px rgba(0,0,0,0.15)`:"none"}} onClick={()=>setVacExp(isExp?null:i)}>
                        {/* Header row */}
                        <div style={{display:"flex",alignItems:"center",gap:14}}>
                          <div style={{width:50,height:50,borderRadius:"50%",background:`${scC}10`,border:`1.5px solid ${scC}40`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 0 16px ${scC}20`}}>
                            <span style={{fontSize:15,color:scC,fontWeight:700,lineHeight:1}}>{sc}</span>
                            <span style={{fontSize:9,color:scC,opacity:0.7}}>%</span>
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <p style={{fontWeight:600,fontSize:15,margin:"0 0 3px",color:"rgba(255,255,255,0.88)",letterSpacing:-0.2}}>{k.naam}</p>
                            <p style={{fontSize:12,color:"rgba(255,255,255,0.35)",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:400}}>{k.reden}</p>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                            {sterke.length>0&&<span style={{fontSize:11,color:"#34d399",background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.18)",borderRadius:9999,padding:"2px 8px",fontWeight:500}}>✓ {sterke.length}</span>}
                            {aandacht.length>0&&<span style={{fontSize:11,color:"#f87171",background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.18)",borderRadius:9999,padding:"2px 8px",fontWeight:500}}>✗ {aandacht.length}</span>}
                            <span style={{color:"rgba(255,255,255,0.2)",fontSize:10}}>{isExp?"▲":"▼"}</span>
                          </div>
                        </div>
                        {/* Expanded detail */}
                        {isExp&&(
                          <div style={{marginTop:18,borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:16}}>
                            {/* Sterke punten + aandachtspunten side by side */}
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                              <div style={{background:"rgba(52,211,153,0.04)",border:"1px solid rgba(52,211,153,0.12)",borderRadius:14,padding:"12px 14px",backdropFilter:"blur(8px)"}}>
                                <p style={{fontSize:10,fontWeight:600,color:"#34d399",margin:"0 0 10px",letterSpacing:0.8,textTransform:"uppercase"}}>✓ Sterke punten</p>
                                {sterke.length>0 ? sterke.map((pt,j)=>(
                                  <div key={j} style={{display:"flex",gap:8,marginBottom:6,alignItems:"flex-start"}}>
                                    <span style={{color:"#34d399",fontSize:12,flexShrink:0,marginTop:1}}>•</span>
                                    <p style={{fontSize:12,color:"rgba(255,255,255,0.65)",margin:0,lineHeight:1.55,fontWeight:400}}>{pt}</p>
                                  </div>
                                )) : <p style={{fontSize:12,color:"rgba(255,255,255,0.22)",margin:0}}>—</p>}
                              </div>
                              <div style={{background:"rgba(248,113,113,0.04)",border:"1px solid rgba(248,113,113,0.12)",borderRadius:14,padding:"12px 14px",backdropFilter:"blur(8px)"}}>
                                <p style={{fontSize:10,fontWeight:600,color:"#f87171",margin:"0 0 10px",letterSpacing:0.8,textTransform:"uppercase"}}>✗ Aandachtspunten</p>
                                {aandacht.length>0 ? aandacht.map((pt,j)=>(
                                  <div key={j} style={{display:"flex",gap:8,marginBottom:6,alignItems:"flex-start"}}>
                                    <span style={{color:"#f87171",fontSize:12,flexShrink:0,marginTop:1}}>•</span>
                                    <p style={{fontSize:12,color:"rgba(255,255,255,0.65)",margin:0,lineHeight:1.55,fontWeight:400}}>{pt}</p>
                                  </div>
                                )) : <p style={{fontSize:12,color:"rgba(255,255,255,0.22)",margin:0}}>—</p>}
                              </div>
                            </div>
                            {/* Aanbeveling */}
                            {k.aanbeveling&&(
                              <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"10px 14px",display:"flex",gap:10,alignItems:"flex-start",backdropFilter:"blur(8px)"}}>
                                <span style={{fontSize:14,flexShrink:0}}>💡</span>
                                <p style={{fontSize:13,color:"rgba(255,255,255,0.6)",margin:0,lineHeight:1.65,fontStyle:"italic",fontWeight:400}}>{k.aanbeveling}</p>
                              </div>
                            )}
  
                            {/* ── Belscript ── */}
                            {(()=>{
                              const bs = belScripts[i]||{};
                              return (
                                <div style={{marginTop:16}}>
                                  {/* Genereer knop */}
                                  {!bs.script&&(
                                    <button
                                      onClick={e=>{e.stopPropagation();generateBelScript(k,vacText,i);}}
                                      disabled={bs.loading}
                                      style={{display:"flex",alignItems:"center",gap:8,background:bs.loading?"rgba(16,185,129,0.06)":"rgba(16,185,129,0.08)",border:`1px solid rgba(16,185,129,${bs.loading?0.15:0.25})`,color:bs.loading?"rgba(52,211,153,0.4)":"rgba(52,211,153,0.85)",borderRadius:9999,padding:"9px 18px",fontSize:12,fontWeight:500,cursor:bs.loading?"not-allowed":"pointer",transition:"all 0.2s",width:"100%",justifyContent:"center",backdropFilter:"blur(8px)"}}>
                                      {bs.loading
                                        ?<><span style={{display:"inline-block",width:11,height:11,border:"2px solid rgba(52,211,153,0.25)",borderTopColor:"#34d399",borderRadius:"50%",animation:"s 0.7s linear infinite"}}/> Script schrijven...</>
                                        :"📞 Genereer Belscript"}
                                    </button>
                                  )}
                                  {/* Fout */}
                                  {bs.err&&<p style={{fontSize:12,color:"rgba(248,113,113,0.85)",margin:"8px 0 0"}}>⚠️ {bs.err}</p>}
                                  {/* Script resultaat */}
                                  {bs.script&&(
                                    <div style={{background:"rgba(16,185,129,0.04)",border:"1px solid rgba(16,185,129,0.15)",borderRadius:16,overflow:"hidden",marginTop:4,backdropFilter:"blur(12px)"}}>
                                      {/* Script header */}
                                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderBottom:"1px solid rgba(16,185,129,0.1)"}}>
                                        <span style={{fontSize:10,fontWeight:600,color:"rgba(52,211,153,0.8)",letterSpacing:0.8,textTransform:"uppercase"}}>📞 Belscript — {k.naam}</span>
                                        <div style={{display:"flex",gap:6}}>
                                          <button
                                            onClick={e=>{e.stopPropagation();navigator.clipboard?.writeText(bs.script);setBel(i,{copied:true});setTimeout(()=>setBel(i,{copied:false}),2000);}}
                                            style={{background:bs.copied?"rgba(16,185,129,0.15)":"rgba(255,255,255,0.05)",border:`1px solid ${bs.copied?"rgba(16,185,129,0.4)":"rgba(255,255,255,0.1)"}`,color:bs.copied?"#34d399":"rgba(255,255,255,0.4)",borderRadius:9999,padding:"3px 10px",fontSize:11,cursor:"pointer",transition:"all 0.2s"}}>
                                            {bs.copied?"✓ Gekopieerd":"📋 Kopieer"}
                                          </button>
                                          <button
                                            onClick={e=>{e.stopPropagation();setBel(i,{script:null,err:null,copied:false});}}
                                            style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.22)",borderRadius:9999,padding:"3px 8px",fontSize:11,cursor:"pointer"}}>
                                            ✕
                                          </button>
                                        </div>
                                      </div>
                                      {/* Script tekst */}
                                      <div style={{padding:"14px 16px",fontSize:13,color:"rgba(255,255,255,0.75)",lineHeight:1.8,whiteSpace:"pre-wrap",fontWeight:400}}>
                                        {bs.script.replace(/\*\*/g,"")}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
  
          {/* ══ BOOLEAN ══ */}
          {tab==="boolean"&&(
            <div>
              {/* ── Boolean Library card ── */}
              <div className="card" style={{marginBottom:12,padding:"14px 18px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                  {/* Left: label */}
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                    <span style={{fontSize:11,fontWeight:700,color:"rgba(167,139,250,0.85)",letterSpacing:0.8,textTransform:"uppercase"}}>Team Gems</span>
                    {libItems.length>0&&<span style={{fontSize:10,fontWeight:600,background:"rgba(167,139,250,0.15)",color:"rgba(167,139,250,0.7)",borderRadius:999,padding:"1px 7px"}}>{libItems.length}</span>}
                  </div>
                  {/* Right: buttons */}
                  <div style={{display:"flex",gap:7,alignItems:"center"}}>
                    {/* Save button */}
                    <button
                      onClick={()=>{ setSaveModal(true); setSaveMsg(""); setSaveTitle(""); }}
                      style={{display:"flex",alignItems:"center",gap:5,background:"rgba(167,139,250,0.12)",border:"1px solid rgba(167,139,250,0.3)",color:"rgba(167,139,250,0.9)",borderRadius:9999,padding:"5px 12px",fontSize:11,fontWeight:600,cursor:"pointer",transition:"all 0.18s"}}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(167,139,250,0.22)";e.currentTarget.style.borderColor="rgba(167,139,250,0.55)";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="rgba(167,139,250,0.12)";e.currentTarget.style.borderColor="rgba(167,139,250,0.3)";}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                      Opslaan
                    </button>
                    {/* Open/close dropdown */}
                    <button
                      onClick={()=>{
                        if (!libOpen) { loadLibrary(); }
                        setLibOpen(v=>!v); setLibSearch("");
                      }}
                      style={{display:"flex",alignItems:"center",gap:5,background:libOpen?"rgba(167,139,250,0.18)":"rgba(255,255,255,0.05)",border:`1px solid ${libOpen?"rgba(167,139,250,0.45)":"rgba(255,255,255,0.1)"}`,color:libOpen?"rgba(167,139,250,0.9)":"rgba(255,255,255,0.5)",borderRadius:9999,padding:"5px 13px",fontSize:11,fontWeight:600,cursor:"pointer",transition:"all 0.18s"}}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(167,139,250,0.15)";}}
                      onMouseLeave={e=>{e.currentTarget.style.background=libOpen?"rgba(167,139,250,0.18)":"rgba(255,255,255,0.05)";}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points={libOpen?"18 15 12 9 6 15":"6 9 12 15 18 9"}/></svg>
                      {libOpen ? "Sluit" : "Bibliotheek"}
                    </button>
                  </div>
                </div>
  
                {/* ── Dropdown panel ── */}
                {libOpen&&(
                  <div style={{marginTop:12,borderTop:"1px solid rgba(167,139,250,0.12)",paddingTop:12}}>
                    {/* Search */}
                    <div style={{position:"relative",marginBottom:10}}>
                      <svg style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      <input
                        value={libSearch} onChange={e=>setLibSearch(e.target.value)}
                        placeholder="Zoek in bibliotheek..."
                        style={{width:"100%",paddingLeft:30,paddingRight:12,paddingTop:7,paddingBottom:7,background:"rgba(0,0,0,0.25)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:9,fontSize:12,color:"rgba(255,255,255,0.75)",outline:"none",boxSizing:"border-box"}}
                      />
                    </div>
  
                    {/* Loading */}
                    {libLoading&&(
                      <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 0",color:"rgba(255,255,255,0.35)",fontSize:12}}>
                        <span className="spin" style={{width:14,height:14,border:"2px solid rgba(167,139,250,0.3)",borderTopColor:"rgba(167,139,250,0.8)",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>
                        Bibliotheek laden...
                      </div>
                    )}
  
                    {/* Error */}
                    {libErr&&!libLoading&&<p style={{color:"rgba(252,165,165,0.8)",fontSize:12,margin:"6px 0"}}>⚠️ {libErr}</p>}
  
                    {/* Empty */}
                    {!libLoading&&!libErr&&filteredLib.length===0&&(
                      <div style={{textAlign:"center",padding:"18px 0",color:"rgba(255,255,255,0.22)",fontSize:12}}>
                        {libSearch ? "Geen resultaten gevonden." : "Nog geen Booleans opgeslagen. Genereer er één en sla hem op!"}
                      </div>
                    )}
  
                    {/* Items list */}
                    {!libLoading&&filteredLib.length>0&&(
                      <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:280,overflowY:"auto",paddingRight:2}}>
                        {filteredLib.map(row=>{
                          const LABEL_COLOR = {GREEN:"#10b981",BLACK:"#9ca3af",LAB:"#3b82f6",SUPER:"#a855f7"}[row.label_id]||"#a855f7";
                          const LABEL_NAME  = {GREEN:"Morgan Green",BLACK:"Morgan Black",LAB:"Morgan Lab",SUPER:"All Teams"}[row.label_id]||row.label_id;
                          const date = new Date(row.created_at);
                          const dateStr = isNaN(date) ? "" : date.toLocaleDateString("nl-NL",{day:"numeric",month:"short"});
                          return (
                            <div key={row.id}
                              onClick={()=>{ setBoolText(row.boolean_string); setLibOpen(false); setLibSearch(""); }}
                              style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",background:"rgba(167,139,250,0.05)",border:"1px solid rgba(167,139,250,0.12)",borderRadius:11,cursor:"pointer",transition:"all 0.15s",position:"relative"}}
                              onMouseEnter={e=>{e.currentTarget.style.background="rgba(167,139,250,0.12)";e.currentTarget.style.borderColor="rgba(167,139,250,0.3)";}}
                              onMouseLeave={e=>{e.currentTarget.style.background="rgba(167,139,250,0.05)";e.currentTarget.style.borderColor="rgba(167,139,250,0.12)";}}>
                              {/* Icon */}
                              <div style={{width:30,height:30,borderRadius:8,background:"rgba(167,139,250,0.12)",border:"1px solid rgba(167,139,250,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.8)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                              </div>
                              {/* Content */}
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
                                  <span style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.82)",letterSpacing:-0.1}}>{row.title}</span>
                                  <span style={{fontSize:9,fontWeight:600,background:`${LABEL_COLOR}1a`,color:LABEL_COLOR,borderRadius:999,padding:"1px 6px",border:`1px solid ${LABEL_COLOR}30`}}>{LABEL_NAME}</span>
                                  {dateStr&&<span style={{fontSize:10,color:"rgba(255,255,255,0.22)",marginLeft:"auto"}}>{dateStr}</span>}
                                </div>
                                <p style={{fontSize:11,color:"rgba(255,255,255,0.35)",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'SF Mono','Courier New',monospace",letterSpacing:-0.2}}>
                                  {row.boolean_string}
                                </p>
                              </div>
                              {/* Delete */}
                              <button
                                onClick={e=>handleDeleteBoolean(row.id, e)}
                                title="Verwijderen"
                                style={{flexShrink:0,background:"transparent",border:"none",color:"rgba(255,255,255,0.2)",cursor:"pointer",padding:"2px 4px",fontSize:14,lineHeight:1,borderRadius:6,transition:"all 0.15s"}}
                                onMouseEnter={e=>{e.currentTarget.style.color="rgba(252,165,165,0.7)";}}
                                onMouseLeave={e=>{e.currentTarget.style.color="rgba(255,255,255,0.2)";}}>
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
  
              {/* ── Save Modal ── */}
              {saveModal&&(
                <div onClick={()=>setSaveModal(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <div onClick={e=>e.stopPropagation()} style={{background:"linear-gradient(135deg,rgba(25,17,45,0.98),rgba(18,12,30,0.98))",border:"1px solid rgba(167,139,250,0.25)",borderRadius:20,padding:"28px 28px 24px",width:"min(420px,90vw)",boxShadow:"0 24px 60px rgba(0,0,0,0.6)"}}>
                    {/* Modal header */}
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
                      <div style={{width:36,height:36,borderRadius:10,background:"rgba(167,139,250,0.12)",border:"1px solid rgba(167,139,250,0.25)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                      </div>
                      <div>
                        <p style={{fontSize:14,fontWeight:700,color:"rgba(255,255,255,0.9)",margin:0,letterSpacing:-0.2}}>Opslaan in Team Gems</p>
                        <p style={{fontSize:11,color:"rgba(255,255,255,0.35)",margin:0,fontWeight:400}}>Voeg toe aan de gedeelde Boolean bibliotheek</p>
                      </div>
                    </div>
                    {/* Title input */}
                    <label style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.45)",letterSpacing:0.8,textTransform:"uppercase",display:"block",marginBottom:6}}>Naam van deze Boolean</label>
                    <input
                      autoFocus
                      value={saveTitle}
                      onChange={e=>setSaveTitle(e.target.value)}
                      onKeyDown={e=>{ if(e.key==="Enter") handleSaveBoolean(); }}
                      placeholder="Bijv. Senior QA Manager – Medical Devices"
                      style={{width:"100%",padding:"10px 14px",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:10,fontSize:13,color:"rgba(255,255,255,0.85)",outline:"none",marginBottom:8,boxSizing:"border-box"}}
                    />
                    {/* Preview */}
                    {boolText&&(
                      <div style={{background:"rgba(0,0,0,0.25)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:9,padding:"9px 12px",fontSize:11,fontFamily:"'SF Mono','Courier New',monospace",color:"rgba(255,255,255,0.4)",marginBottom:12,maxHeight:72,overflow:"hidden",lineHeight:1.7,wordBreak:"break-all"}}>
                        {boolText.slice(0,240)}{boolText.length>240?"…":""}
                      </div>
                    )}
                    {/* Feedback */}
                    {saveMsg&&<p style={{fontSize:12,color:saveMsg.startsWith("✅")?"rgba(52,211,153,0.9)":"rgba(252,165,165,0.9)",margin:"0 0 10px",fontWeight:500}}>{saveMsg}</p>}
                    {/* Actions */}
                    <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
                      <button onClick={()=>setSaveModal(false)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.5)",borderRadius:9999,padding:"8px 18px",fontSize:12,cursor:"pointer",transition:"all 0.18s"}}>Annuleren</button>
                      <button
                        onClick={handleSaveBoolean} disabled={saveLoading}
                        style={{display:"flex",alignItems:"center",gap:6,background:saveLoading?"rgba(167,139,250,0.2)":"rgba(167,139,250,0.18)",border:"1px solid rgba(167,139,250,0.4)",color:"rgba(167,139,250,0.95)",borderRadius:9999,padding:"8px 20px",fontSize:12,fontWeight:600,cursor:saveLoading?"default":"pointer",transition:"all 0.18s"}}>
                        {saveLoading&&<span className="spin" style={{width:12,height:12,border:"2px solid rgba(167,139,250,0.3)",borderTopColor:"rgba(167,139,250,0.9)",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>}
                        {saveLoading?"Opslaan...":"💾 Opslaan in Gems"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
  
              <div className="card">
                <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.3)",margin:"0 0 4px",letterSpacing:1,textTransform:"uppercase"}}>Boolean Search Generator</p>
                <p style={{fontSize:13,color:"rgba(255,255,255,0.35)",margin:"0 0 14px",lineHeight:1.65,fontWeight:400}}>Genereer scherpe Boolean strings voor LinkedIn, Indeed én Recruit CRM op basis van een vacaturetekst.</p>
                <textarea rows={8} value={boolText} onChange={e=>setBoolText(e.target.value)} placeholder="Plak hier de vacaturetekst of een bestaande Boolean string..."/>
                {boolErr&&<p style={{color:"rgba(252,165,165,0.9)",fontSize:13,margin:"10px 0 0"}}>⚠️ {boolErr}</p>}
                <div style={{marginTop:14,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  <button className="btn" onClick={generateBoolean} disabled={boolLoading}>
                    {boolLoading?<><span className="spin"/>Genereren...</>:"🔎 Genereer Boolean Strings"}
                  </button>
                  {boolText&&!boolLoading&&(
                    <button
                      onClick={()=>{ setSaveModal(true); setSaveMsg(""); setSaveTitle(""); }}
                      style={{display:"flex",alignItems:"center",gap:5,background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.28)",color:"rgba(167,139,250,0.85)",borderRadius:9999,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.18s"}}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(167,139,250,0.2)";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="rgba(167,139,250,0.1)";}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                      Save to Gems
                    </button>
                  )}
                  {boolText&&!boolLoading&&(
                    <button
                      onClick={()=>{ navigator.clipboard?.writeText(boolText); setCopied("__raw__"); setTimeout(()=>setCopied(""),2000); }}
                      style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:copied==="__raw__"?"rgba(52,211,153,0.9)":"rgba(255,255,255,0.45)",borderRadius:9999,padding:"7px 14px",fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.18s"}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      {copied==="__raw__"?"✓ Gekopieerd":"Kopieer"}
                    </button>
                  )}
                  {(boolText||boolResult)&&!boolLoading&&<button className="ghost" onClick={()=>{setBoolText("");setBoolResult(null);setBoolErr("");setCopied("");setBoolPlatform(null);}}>Wissen</button>}
                </div>
              </div>
  
              {boolResult&&(
                <div className="fi">
                  {/* Analyse samenvatting */}
                  <div className="card">
                    <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",margin:"0 0 12px",letterSpacing:1,textTransform:"uppercase"}}>Analyse: {boolResult.functie}</p>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                      <tbody>
                        {[
                          ["Functie(s)",[boolResult.functie,...(boolResult.synoniemen||[])].join(" · ")],
                          ["Locatie",boolResult.locatie||"—"],
                          ["Skills",(boolResult.skills||[]).join(", ")],
                          ["Senioriteit",boolResult.senioriteit||"—"],
                        ].map(([k,v])=>(
                          <tr key={k} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                            <td style={{padding:"8px 14px 8px 0",color:"rgba(255,255,255,0.32)",width:"28%",fontWeight:500,fontSize:12}}>{k}</td>
                            <td style={{padding:"8px 0",color:"rgba(255,255,255,0.72)",fontWeight:400}}>{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
  
                  {/* Platform selector */}
                  {!boolPlatform&&(
                    <div className="card">
                      <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",margin:"0 0 14px",letterSpacing:1,textTransform:"uppercase"}}>Kies platform</p>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                        {/* LinkedIn */}
                        <button onClick={()=>setBoolPlatform("linkedin")}
                          style={{background:"rgba(10,102,194,0.06)",border:"1px solid rgba(10,102,194,0.2)",borderRadius:16,padding:"20px 12px",cursor:"pointer",transition:"all 0.2s",display:"flex",flexDirection:"column",alignItems:"center",gap:10,backdropFilter:"blur(12px)"}}
                          onMouseEnter={e=>{e.currentTarget.style.background="rgba(10,102,194,0.12)";e.currentTarget.style.borderColor="rgba(10,102,194,0.4)";e.currentTarget.style.transform="translateY(-2px)";}}
                          onMouseLeave={e=>{e.currentTarget.style.background="rgba(10,102,194,0.06)";e.currentTarget.style.borderColor="rgba(10,102,194,0.2)";e.currentTarget.style.transform="none";}}>
                          <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                            <rect width="40" height="40" rx="10" fill="#0A66C2"/>
                            <path d="M10 15h5v15h-5zM12.5 13a2.5 2.5 0 110-5 2.5 2.5 0 010 5zM21 15h4.8v2.1h.1c.7-1.3 2.3-2.6 4.8-2.6 5.1 0 6 3.4 6 7.7V30h-5v-7c0-1.7 0-3.9-2.4-3.9-2.4 0-2.7 1.8-2.7 3.7V30H21V15z" fill="white"/>
                          </svg>
                          <div style={{textAlign:"center"}}>
                            <p style={{fontSize:13,fontWeight:600,color:"rgba(90,173,255,0.9)",margin:"0 0 2px"}}>LinkedIn</p>
                            <p style={{fontSize:10,color:"rgba(255,255,255,0.25)",margin:0,fontWeight:400}}>Recruiter Search</p>
                          </div>
                        </button>
  
                        {/* Indeed */}
                        <button onClick={()=>setBoolPlatform("indeed")}
                          style={{background:"rgba(33,100,243,0.06)",border:"1px solid rgba(33,100,243,0.2)",borderRadius:16,padding:"20px 12px",cursor:"pointer",transition:"all 0.2s",display:"flex",flexDirection:"column",alignItems:"center",gap:10,backdropFilter:"blur(12px)"}}
                          onMouseEnter={e=>{e.currentTarget.style.background="rgba(33,100,243,0.12)";e.currentTarget.style.borderColor="rgba(33,100,243,0.4)";e.currentTarget.style.transform="translateY(-2px)";}}
                          onMouseLeave={e=>{e.currentTarget.style.background="rgba(33,100,243,0.06)";e.currentTarget.style.borderColor="rgba(33,100,243,0.2)";e.currentTarget.style.transform="none";}}>
                          <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                            <rect width="40" height="40" rx="10" fill="#2164F3"/>
                            <circle cx="20" cy="14" r="5" fill="white"/>
                            <path d="M10 32c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
                            <rect x="18" y="22" width="4" height="8" rx="2" fill="white"/>
                          </svg>
                          <div style={{textAlign:"center"}}>
                            <p style={{fontSize:13,fontWeight:600,color:"rgba(107,159,255,0.9)",margin:"0 0 2px"}}>Indeed</p>
                            <p style={{fontSize:10,color:"rgba(255,255,255,0.25)",margin:0,fontWeight:400}}>Candidate Search</p>
                          </div>
                        </button>
  
                        {/* Recruit CRM */}
                        <button onClick={()=>setBoolPlatform("recruitcrm")}
                          style={{background:"rgba(251,191,36,0.05)",border:"1px solid rgba(251,191,36,0.18)",borderRadius:16,padding:"20px 12px",cursor:"pointer",transition:"all 0.2s",display:"flex",flexDirection:"column",alignItems:"center",gap:10,backdropFilter:"blur(12px)"}}
                          onMouseEnter={e=>{e.currentTarget.style.background="rgba(251,191,36,0.1)";e.currentTarget.style.borderColor="rgba(251,191,36,0.4)";e.currentTarget.style.transform="translateY(-2px)";}}
                          onMouseLeave={e=>{e.currentTarget.style.background="rgba(251,191,36,0.05)";e.currentTarget.style.borderColor="rgba(251,191,36,0.18)";e.currentTarget.style.transform="none";}}>
                          <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                            <rect width="40" height="40" rx="10" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.3)" strokeWidth="1"/>
                            <path d="M20 8l3 9h9l-7.5 5.5 2.9 9L20 26l-7.4 5.5 2.9-9L8 17h9z" fill="#FBBF24"/>
                          </svg>
                          <div style={{textAlign:"center"}}>
                            <p style={{fontSize:13,fontWeight:600,color:"rgba(251,191,36,0.9)",margin:"0 0 2px"}}>Recruit CRM</p>
                            <p style={{fontSize:10,color:"rgba(255,255,255,0.25)",margin:0,fontWeight:400}}>ATS Search</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
  
                  {/* Gekozen platform — boolean velden per invulvak */}
                  {boolPlatform&&(()=>{
                    const cfg = {
                      linkedin:{label:"LinkedIn",color:"#0A66C2",textColor:"rgba(90,173,255,0.9)",
                        fields:{
                          job_titles:{label:"Functietitels",sublabel:"Job Titles veld",icon:"💼"},
                          keywords:  {label:"Trefwoorden", sublabel:"Keywords veld",  icon:"🔍"},
                          companies: {label:"Bedrijven",   sublabel:"Companies veld", icon:"🏢"},
                        }
                      },
                      indeed:{label:"Indeed",color:"#2164F3",textColor:"rgba(107,159,255,0.9)",
                        fields:{
                          what:{label:"Wat",sublabel:"What / Job title veld",icon:"🔍"},
                          where:{label:"Waar",sublabel:"Where / Location veld",icon:"📍"},
                        }
                      },
                      recruitcrm:{label:"Recruit CRM",color:"#FBBF24",textColor:"rgba(251,191,36,0.9)",
                        fields:{
                          keywords:{label:"Trefwoorden",sublabel:"Keywords veld",icon:"🔍"},
                        }
                      },
                    }[boolPlatform];
                    const platformData = boolResult?.boolean_strings?.[boolPlatform] || {};
                    return (
                      <div className="card">
                        {/* Header */}
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{width:8,height:8,borderRadius:"50%",background:cfg.color,display:"inline-block",boxShadow:`0 0 8px ${cfg.color}80`}}/>
                            <span style={{fontSize:12,fontWeight:600,color:cfg.textColor,letterSpacing:0.6,textTransform:"uppercase"}}>{cfg.label}</span>
                            <span style={{fontSize:10,color:"rgba(255,255,255,0.25)",fontWeight:400}}>— Plak elk veld direct in het platform</span>
                          </div>
                          <button onClick={()=>setBoolPlatform(null)}
                            style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",color:"rgba(255,255,255,0.4)",borderRadius:9999,padding:"4px 12px",fontSize:11,cursor:"pointer",transition:"all 0.2s"}}>
                            ← Terug
                          </button>
                        </div>
  
                        {/* Per-veld glassmorphism kaders */}
                        <div style={{display:"flex",flexDirection:"column",gap:12}}>
                          {Object.entries(cfg.fields).map(([fieldKey,fieldMeta])=>{
                            const fieldValue = (platformData[fieldKey] || "").replace(/'/g, '"');
                            const copyId = boolPlatform + "_" + fieldKey;
                            const isCopied = copied === copyId;
                            return (
                              <div key={fieldKey} style={{background:"rgba(0,0,0,0.22)",border:`1px solid ${cfg.color}22`,borderRadius:14,padding:"14px 16px",backdropFilter:"blur(12px)",transition:"border-color 0.2s"}}>
                                {/* Veld-header */}
                                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                                    <span style={{fontSize:14}}>{fieldMeta.icon}</span>
                                    <div>
                                      <span style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.75)",letterSpacing:0.2}}>{fieldMeta.label}</span>
                                      <span style={{fontSize:10,color:"rgba(255,255,255,0.28)",marginLeft:6,fontWeight:400}}>({fieldMeta.sublabel})</span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={()=>{
                                      if (fieldValue) {
                                        navigator.clipboard?.writeText(fieldValue);
                                        setCopied(copyId);
                                        setTimeout(()=>setCopied(""),2000);
                                      }
                                    }}
                                    disabled={!fieldValue}
                                    style={{background:isCopied?`${cfg.color}20`:"rgba(255,255,255,0.05)",border:`1px solid ${isCopied?cfg.color+"60":"rgba(255,255,255,0.09)"}`,color:isCopied?cfg.textColor:"rgba(255,255,255,0.45)",borderRadius:9999,padding:"4px 12px",fontSize:11,cursor:fieldValue?"pointer":"default",transition:"all 0.2s",opacity:fieldValue?1:0.4,flexShrink:0}}>
                                    {isCopied?"✓ Gekopieerd":"📋 Kopieer"}
                                  </button>
                                </div>
                                {/* Veld-inhoud */}
                                <div style={{background:"rgba(0,0,0,0.2)",border:`1px solid rgba(255,255,255,0.06)`,borderRadius:10,padding:"11px 14px",fontFamily:"'SF Mono','Courier New',monospace",fontSize:12,color:fieldValue?"rgba(255,255,255,0.75)":"rgba(255,255,255,0.2)",lineHeight:1.8,wordBreak:"break-word",whiteSpace:"pre-wrap",minHeight:40}}>
                                  {fieldValue||"—"}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
  
                  {/* Target bedrijven */}
                  {boolResult.target_bedrijven?.length>0&&(
                    <div className="card">
                      <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",margin:"0 0 14px",letterSpacing:1,textTransform:"uppercase"}}>🏢 Kijk bij deze bedrijven</p>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {boolResult.target_bedrijven.map((b,i)=>(
                          <div key={i} style={{display:"flex",gap:12,padding:"10px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,alignItems:"flex-start",backdropFilter:"blur(8px)"}}>
                            <div style={{width:28,height:28,borderRadius:8,background:`${T.accent}14`,border:`1px solid ${T.accent}25`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:13}}>🏢</div>
                            <div>
                              <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.82)",margin:"0 0 2px",letterSpacing:-0.1}}>{b.naam}</p>
                              <p style={{fontSize:12,color:"rgba(255,255,255,0.38)",margin:0,lineHeight:1.5,fontWeight:400}}>{b.reden}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
  
                  {/* Recruiter tips */}
                  {boolResult.recruiter_tips?.length>0&&(
                    <div className="card">
                      <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",margin:"0 0 12px",letterSpacing:1,textTransform:"uppercase"}}>💡 Tips voor de Recruiter</p>
                      {boolResult.recruiter_tips.map((tip,i)=>(
                        <div key={i} style={{display:"flex",gap:10,padding:"10px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,marginBottom:6,alignItems:"flex-start",backdropFilter:"blur(8px)"}}>
                          <span style={{color:T.accent,fontWeight:600,flexShrink:0,fontSize:13}}>{i+1}.</span>
                          <p style={{fontSize:13,color:"rgba(255,255,255,0.6)",margin:0,lineHeight:1.65,fontWeight:400}}>{tip}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
  
          {/* ══ FRONTSHEET ══ */}
          {tab==="frontsheet"&&(
            <div>
              <div className="card">
                <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.3)",margin:"0 0 4px",letterSpacing:1,textTransform:"uppercase"}}>Candidate Frontsheet Generator</p>
                <p style={{fontSize:13,color:"rgba(255,255,255,0.35)",margin:"0 0 18px",lineHeight:1.65,fontWeight:400}}>Genereer een professionele Frontsheet op basis van een geanalyseerd profiel uit de geschiedenis, of plak een nieuw CV.</p>
  
                <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
                  <button className="btn" onClick={()=>{setFrontErr("");setShowFrontConfig(true);}} disabled={frontLoading}>
                    {frontLoading?<><span className="spin"/>Genereren...</>:"📄 Maak Frontsheet"}
                  </button>
                  {frontResult&&!frontLoading&&(
                    <button onClick={()=>setShowFrontModal(true)}
                      style={{background:`${T.accent}14`,border:`1px solid ${T.accent}35`,color:T.accent,borderRadius:9999,padding:"9px 18px",fontSize:13,fontWeight:500,cursor:"pointer",transition:"all 0.2s",backdropFilter:"blur(8px)"}}>
                      👁 Bekijk laatste Frontsheet
                    </button>
                  )}
                  {frontResult&&!frontLoading&&(
                    <button className="ghost" onClick={()=>{setFrontResult(null);setFrontCvText("");setFrontSelectedKey("");setFrontErr("");}}>Wissen</button>
                  )}
                </div>
  
                {frontErr&&<p style={{color:"rgba(252,165,165,0.9)",fontSize:13,margin:"12px 0 0"}}>⚠️ {frontErr}</p>}
  
                {/* Snelkoppelingen aan beschikbare profielen */}
                {history.length>0&&(
                  <div style={{marginTop:16,padding:"12px 14px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12}}>
                    <p style={{fontSize:11,color:"rgba(255,255,255,0.25)",margin:"0 0 8px",fontWeight:500}}>{history.length} profiel{history.length!==1?"en":""} beschikbaar in geschiedenis</p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                      {history.slice(0,6).map(h=>(
                        <button key={h.key||h.naam} onClick={()=>{setFrontSelectedKey(h.key||h.naam);setFrontInputMode("history");setFrontErr("");setShowFrontConfig(true);}}
                          style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.55)",borderRadius:9999,padding:"4px 11px",fontSize:11,fontWeight:400,cursor:"pointer",transition:"all 0.18s",backdropFilter:"blur(8px)"}}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor=`${T.accent}40`;e.currentTarget.style.color="rgba(255,255,255,0.82)";}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";e.currentTarget.style.color="rgba(255,255,255,0.55)";}}>
                          {h.name||h.naam||"Onbekend"}
                        </button>
                      ))}
                      {history.length>6&&<span style={{fontSize:11,color:"rgba(255,255,255,0.2)",alignSelf:"center"}}>+{history.length-6} meer</span>}
                    </div>
                  </div>
                )}
              </div>
  
              {/* Consultant details status block */}
              <div className="card">
                <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",margin:"0 0 12px",letterSpacing:1,textTransform:"uppercase"}}>📇 Jouw Consultant Gegevens</p>
                {consultantNaam ? (
                  <div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                      {[["👤 Naam",consultantNaam],["📍 Kantoor",consultantLocatie],["📧 E-mail",consultantEmail],["📞 Telefoon",consultantPhone]].map(([k,v])=>(
                        <div key={k} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"10px 13px"}}>
                          <p style={{fontSize:10,color:"rgba(255,255,255,0.28)",margin:"0 0 3px",fontWeight:500}}>{k}</p>
                          <p style={{fontSize:13,color:"rgba(255,255,255,0.75)",margin:0,fontWeight:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v}</p>
                        </div>
                      ))}
                    </div>
                    <button onClick={()=>{setObNaam(consultantNaam);setObLocatie(consultantLocatie);setShowOnboarding(true);}}
                      style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",color:"rgba(255,255,255,0.4)",borderRadius:9999,padding:"6px 14px",fontSize:12,cursor:"pointer",transition:"all 0.2s"}}>
                      ✏️ Wijzigen
                    </button>
                  </div>
                ) : (
                  <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px",background:"rgba(251,191,36,0.04)",border:"1px solid rgba(251,191,36,0.15)",borderRadius:14}}>
                    <span style={{fontSize:20}}>⚠️</span>
                    <div style={{flex:1}}>
                      <p style={{fontSize:13,color:"rgba(255,255,255,0.7)",margin:"0 0 4px",fontWeight:500}}>Profiel nog niet ingesteld</p>
                      <p style={{fontSize:12,color:"rgba(255,255,255,0.35)",margin:0,fontWeight:400}}>Jouw naam en kantoor worden toegevoegd aan elke Frontsheet.</p>
                    </div>
                    <button onClick={()=>setShowOnboarding(true)}
                      style={{background:T.btnGrad,color:"white",border:"none",borderRadius:9999,padding:"7px 16px",fontSize:12,fontWeight:500,cursor:"pointer",flexShrink:0,boxShadow:`0 2px 12px ${T.accentGlow}`}}>
                      Instellen
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
  
          {/* Footer */}
          <div style={{textAlign:"center",marginTop:48,fontSize:11,color:"rgba(255,255,255,0.1)",fontWeight:400,letterSpacing:0.3}}>
            Talent Lens · Morgan Recruitment Group · {crmSkills.length} skills · {verticals.length} verticals · v1.8.3
          </div>
  
        </div>
        </div>
        )}
      </div>
    );
  }
  
  /* ═══════════════════════════════════════════════════════════════════
     ADMIN DASHBOARD — top-level sub-components (geen nesting)
     ══════════════════════════════════════════════════════════════════ */
  function AdminKPICard({ icon, label, value, sub, color, trend, trendLabel, onClick }) {
    const c = color || "#4DC87A";
    const isClickable = !!onClick;
    return (
      <div
        onClick={onClick}
        style={{background:"rgba(255,255,255,0.04)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"22px 20px",display:"flex",flexDirection:"column",gap:10,position:"relative",overflow:"hidden",transition:"border-color 0.2s,transform 0.2s,box-shadow 0.2s",cursor:isClickable?"pointer":"default"}}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=c+"50";e.currentTarget.style.transform="translateY(-2px)";if(isClickable)e.currentTarget.style.boxShadow=`0 8px 32px ${c}20`;}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
        
        <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:c+"12",filter:"blur(24px)",pointerEvents:"none"}}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{width:40,height:40,borderRadius:13,background:c+"16",border:"1px solid "+c+"30",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{icon}</div>
          {trend&&<span style={{fontSize:12,fontWeight:600,color:"rgba(52,211,153,0.9)",background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:9999,padding:"2px 9px"}}>{trend}</span>}
        </div>
        <div>
          <p style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.3)",margin:"0 0 6px",letterSpacing:0.8,textTransform:"uppercase"}}>{label}</p>
          <p style={{fontSize:32,fontWeight:700,color:"rgba(255,255,255,0.95)",margin:"0 0 4px",letterSpacing:-1.2,lineHeight:1}}>{value}</p>
          {sub&&<p style={{fontSize:12,color:"rgba(255,255,255,0.35)",margin:0,fontWeight:400}}>{trendLabel||sub}</p>}
        </div>
      </div>
    );
  }
  
  function AdminSectionHeader({ children }) {
    return <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",margin:"0 0 12px",letterSpacing:1,textTransform:"uppercase"}}>{children}</p>;
  }
  
  function AdminCard({ children, style }) {
    return <div style={{background:"rgba(255,255,255,0.04)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"20px",...(style||{})}}>{children}</div>;
  }
  
  function AdminSparkline({ data, color }) {
    const max = Math.max(...data);
    const c = color || "#4DC87A";
    return (
      <div style={{display:"flex",alignItems:"flex-end",gap:3,height:32}}>
        {data.map((v,i)=>(
          <div key={i} style={{flex:1,borderRadius:3,background:c+(i===data.length-1?"cc":"55"),height:Math.max(15,Math.round((v/max)*100))+"%",transition:"height 0.4s ease"}}/>
        ))}
      </div>
    );
  }
  
  function AdminProgressBar({ pct, color, label, value }) {
    const c = color || "#4DC87A";
    return (
      <div style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <span style={{fontSize:12,color:"rgba(255,255,255,0.65)",fontWeight:500}}>{label}</span>
          <span style={{fontSize:12,color:c,fontWeight:600}}>{value}</span>
        </div>
        <div style={{height:6,background:"rgba(255,255,255,0.07)",borderRadius:9999,overflow:"hidden"}}>
          <div style={{height:"100%",width:pct+"%",background:"linear-gradient(90deg,"+c+"88,"+c+")",borderRadius:9999,transition:"width 0.8s cubic-bezier(.4,0,.2,1)"}}/>
        </div>
      </div>
    );
  }
  
  function AdminRankRow({ rank, name, stat1, stat2, label1, label2, accent, onClick }) {
    const medals = ["🥇","🥈","🥉"];
    const c = accent || "#4DC87A";
    const isClickable = !!onClick;
    return (
      <div
        onClick={onClick}
        style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,marginBottom:6,backdropFilter:"blur(8px)",transition:"border-color 0.2s,box-shadow 0.2s",cursor:isClickable?"pointer":"default",position:"relative"}}
        onMouseEnter={e=>{ e.currentTarget.style.borderColor=c+"45"; if(isClickable)e.currentTarget.style.boxShadow=`0 4px 20px ${c}18`; }}
        onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow="none"; }}>
        
        <span style={{fontSize:16,flexShrink:0,width:24,textAlign:"center"}}>{medals[rank-1]||("#"+rank)}</span>
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.85)",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</p>
        </div>
        <div style={{display:"flex",gap:14,flexShrink:0}}>
          <div style={{textAlign:"right"}}>
            <p style={{fontSize:14,fontWeight:700,color:c,margin:0}}>{stat1}</p>
            <p style={{fontSize:10,color:"rgba(255,255,255,0.25)",margin:0,fontWeight:400}}>{label1}</p>
          </div>
          {stat2!=null&&(
            <div style={{textAlign:"right"}}>
              <p style={{fontSize:14,fontWeight:700,color:"rgba(255,255,255,0.5)",margin:0}}>{stat2}</p>
              <p style={{fontSize:10,color:"rgba(255,255,255,0.25)",margin:0,fontWeight:400}}>{label2}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  function AdminTrendPill({ label, value, pct, color, icon }) {
    const c = color || "#4DC87A";
    return (
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:c+"08",border:"1px solid "+c+"20",borderRadius:14,marginBottom:6,backdropFilter:"blur(8px)"}}>
        <span style={{fontSize:14,flexShrink:0}}>{icon||"🔷"}</span>
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.82)",margin:"0 0 4px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{label}</p>
          <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:9999}}>
            <div style={{height:"100%",width:pct+"%",background:"linear-gradient(90deg,"+c+"80,"+c+")",borderRadius:9999}}/>
          </div>
        </div>
        <span style={{fontSize:13,fontWeight:700,color:c,flexShrink:0}}>{value}</span>
      </div>
    );
  }
  
  function AdminAlertRow({ icon, title, sub, color }) {
    const c = color || "rgba(52,211,153,1)";
    return (
      <div style={{display:"flex",gap:12,alignItems:"flex-start",padding:"11px 14px",background:c.replace("1)","0.06)").replace("0.9)","0.06)"),border:"1px solid "+c.replace("1)","0.22)").replace("0.9)","0.22)"),borderRadius:14,marginBottom:6}}>
        <span style={{fontSize:16,flexShrink:0}}>{icon}</span>
        <div>
          <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.82)",margin:"0 0 2px"}}>{title}</p>
          <p style={{fontSize:11,color:"rgba(255,255,255,0.35)",margin:0,lineHeight:1.5,fontWeight:400}}>{sub}</p>
        </div>
      </div>
    );
  }
  
  
  function AdminDetailModal({ view, onClose, accent, uurloon, setUurloon, selectedCompany, setSelectedCompany }) {
    if (!view) return null;
  
    const overlay = {position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24};
    const panel = {background:"rgba(12,18,28,0.97)",backdropFilter:"blur(32px)",WebkitBackdropFilter:"blur(32px)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:24,padding:"28px 28px 32px",width:"100%",maxWidth:540,maxHeight:"82vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.06) inset",position:"relative"};
    const closeBtn = {position:"absolute",top:18,right:18,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.5)",borderRadius:9999,width:32,height:32,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"};
    const titleStyle = {fontSize:18,fontWeight:700,color:"rgba(255,255,255,0.95)",margin:"0 0 20px",letterSpacing:-0.4};
    const rowStyle = {display:"flex",flexDirection:"column",gap:10};
    const itemStyle = {background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"13px 16px"};
    const labelStyle = {fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.28)",letterSpacing:0.8,textTransform:"uppercase",margin:"0 0 3px"};
    const valueStyle = {fontSize:14,color:"rgba(255,255,255,0.88)",fontWeight:500,margin:0,lineHeight:1.5};
    const subStyle = {fontSize:12,color:"rgba(255,255,255,0.35)",margin:"3px 0 0",fontWeight:400};
  
    function BarRow({label, amount, pct, color}) {
      return (
        <div style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:13,color:"rgba(255,255,255,0.75)",fontWeight:500}}>{label}</span>
            <span style={{fontSize:13,color:"rgba(255,255,255,0.55)",fontWeight:600}}>{amount}</span>
          </div>
          <div style={{height:6,borderRadius:9999,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}>
            <div style={{height:"100%",width:pct+"%",borderRadius:9999,background:color,transition:"width 0.4s ease"}}/>
          </div>
        </div>
      );
    }
  
    function ActivityItem({time, title, by, color}) {
      return (
        <div style={{display:"flex",gap:12,padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:color||accent,flexShrink:0,marginTop:5}}/>
          <div>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.85)",margin:"0 0 3px",fontWeight:500}}>{title}</p>
            <p style={{fontSize:11,color:"rgba(255,255,255,0.32)",margin:0}}>{time} · {by}</p>
          </div>
        </div>
      );
    }
  
    function UserRow({name, status, time, color}) {
      return (
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,marginBottom:8}}>
          <div style={{width:36,height:36,borderRadius:11,background:color+"18",border:"1px solid "+color+"30",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>👤</div>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.88)",margin:"0 0 2px"}}>{name}</p>
            <p style={{fontSize:11,color:"rgba(255,255,255,0.32)",margin:0}}>Laatst actief: {time}</p>
          </div>
          <span style={{fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:9999,background:color+"15",border:"1px solid "+color+"30",color:color}}>{status}</span>
        </div>
      );
    }
  
    function CandidateRow({id, role, score, color}) {
      return (
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,marginBottom:8}}>
          <div style={{width:32,height:32,borderRadius:9,background:color+"18",border:"1px solid "+color+"30",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🧑</div>
          <div style={{flex:1}}>
            <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.85)",margin:"0 0 2px"}}>Kandidaat ID: {id}</p>
            <p style={{fontSize:11,color:"rgba(255,255,255,0.35)",margin:0}}>{role}</p>
          </div>
          <span style={{fontSize:12,fontWeight:700,color:color}}>{score}%</span>
        </div>
      );
    }
  
    let title = "";
    let body = null;
  
    if (view === "kosten") {
      title = "📊 API Kosten Analyse";
      const days = [
        {label:"Maandag",   amount:"$4,20", pct:42, color:"#a78bfa"},
        {label:"Dinsdag",   amount:"$8,50", pct:85, color:"#f472b6"},
        {label:"Woensdag",  amount:"$5,90", pct:59, color:accent},
        {label:"Donderdag", amount:"$4,80", pct:48, color:"#22d3ee"},
        {label:"Vrijdag",   amount:"$3,00", pct:30, color:"#34d399"},
      ];
      body = (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
            <div style={{background:"rgba(248,113,113,0.06)",border:"1px solid rgba(248,113,113,0.15)",borderRadius:14,padding:"14px 16px"}}>
              <p style={labelStyle}>Piekdag</p>
              <p style={{...valueStyle,color:"rgba(248,113,113,0.9)"}}>Dinsdag</p>
              <p style={subStyle}>34% van wekelijks verbruik</p>
            </div>
            <div style={{background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.15)",borderRadius:14,padding:"14px 16px"}}>
              <p style={labelStyle}>Piektijdstip</p>
              <p style={{...valueStyle,color:"rgba(251,191,36,0.9)"}}>10:00 – 11:30</p>
              <p style={subStyle}>Gemiddeld 3,2 CV's per kwartier</p>
            </div>
          </div>
          <p style={{...labelStyle,marginBottom:14}}>Kosten afgelopen 5 werkdagen</p>
          {days.map(d=><BarRow key={d.label} label={d.label} amount={d.amount} pct={d.pct} color={d.color}/>)}
          <div style={{marginTop:16,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>Totaal deze week</span>
            <span style={{fontSize:16,fontWeight:700,color:"rgba(52,211,153,0.9)"}}>$26,40 <span style={{fontSize:11,fontWeight:400,color:"rgba(255,255,255,0.3)"}}>van $75 budget</span></span>
          </div>
        </div>
      );
    } else if (view === "cvs") {
      title = "📄 CV Analyse Tijdlijn";
      body = (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
            {[["1.204","Totaal"],["187","Deze week"],["34","Vandaag"]].map(([v,l])=>(
              <div key={l} style={{textAlign:"center",flex:1,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"12px 8px"}}>
                <p style={{fontSize:20,fontWeight:700,color:"rgba(255,255,255,0.92)",margin:"0 0 3px"}}>{v}</p>
                <p style={{fontSize:10,color:"rgba(255,255,255,0.3)",margin:0,letterSpacing:0.5,textTransform:"uppercase"}}>{l}</p>
              </div>
            ))}
          </div>
          <p style={{...labelStyle,marginBottom:12}}>Recente activiteit</p>
          <ActivityItem time="Vandaag 14:32" title="CV geanalyseerd via LinkedIn – Medical Sales Manager" by="Consultant A" color="#34d399"/>
          <ActivityItem time="Vandaag 14:15" title="PDF Upload – Regulatory Affairs Specialist" by="Consultant B" color={accent}/>
          <ActivityItem time="Vandaag 11:47" title="CV geanalyseerd via Indeed – Field Service Engineer" by="Consultant C" color="#a78bfa"/>
          <ActivityItem time="Vandaag 11:15" title="PDF Upload Medical Sales – Account Manager rol" by="Consultant B" color="#fbbf24"/>
          <ActivityItem time="Vandaag 10:02" title="LinkedIn profiel – QA Manager Pharma" by="Consultant A" color="#f472b6"/>
          <ActivityItem time="Gisteren 17:38" title="Bulk upload – 12 CV's verwerkt (batch)" by="Consultant D" color="#22d3ee"/>
          <ActivityItem time="Gisteren 16:20" title="CV geanalyseerd via LinkedIn – KAM MedTech" by="Consultant E" color="#34d399"/>
        </div>
      );
    } else if (view === "gebruikers") {
      title = "👥 Actieve Gebruikers";
      body = (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}>
            {[["14","Online","#34d399"],["3","Idle","#fbbf24"],["1","Offline","#f87171"]].map(([v,l,c])=>(
              <div key={l} style={{textAlign:"center",flex:1,background:c+"08",border:"1px solid "+c+"20",borderRadius:12,padding:"12px 8px"}}>
                <p style={{fontSize:20,fontWeight:700,color:c,margin:"0 0 3px"}}>{v}</p>
                <p style={{fontSize:10,color:"rgba(255,255,255,0.4)",margin:0,letterSpacing:0.5,textTransform:"uppercase"}}>{l}</p>
              </div>
            ))}
          </div>
          <p style={{...labelStyle,marginBottom:12}}>Consultants overzicht</p>
          <UserRow name="Chakib J." status="Online" time="5 min geleden" color="#34d399"/>
          <UserRow name="Sanne V." status="Online" time="12 min geleden" color="#34d399"/>
          <UserRow name="Daan M." status="Online" time="28 min geleden" color="#34d399"/>
          <UserRow name="Lisa K." status="Idle" time="1u 14 min geleden" color="#fbbf24"/>
          <UserRow name="Roel B." status="Idle" time="Vandaag 13:50" color="#fbbf24"/>
          <UserRow name="Fatima A." status="Online" time="3 min geleden" color="#34d399"/>
          <UserRow name="Tom W." status="Offline" time="Gisteren 16:45" color="#f87171"/>
        </div>
      );
    } else if (view && view.startsWith("skill_")) {
      const skillName = view.replace("skill_", "");
      title = `🧬 Kandidaten met skill: ${skillName}`;
      const candidates = [
        {id:"81207", role:"Account Manager Medical Devices", score:96},
        {id:"94022", role:"Field Service Engineer", score:91},
        {id:"67841", role:"Sales Specialist Life Sciences", score:88},
        {id:"73190", role:"Business Development Manager", score:85},
        {id:"58304", role:"Key Account Manager Pharma", score:82},
        {id:"82916", role:"Product Specialist", score:78},
        {id:"61033", role:"Clinical Application Specialist", score:74},
      ];
      const clr = accent;
      body = (
        <div>
          <div style={{display:"flex",gap:10,marginBottom:18}}>
            <div style={{flex:1,background:clr+"10",border:"1px solid "+clr+"25",borderRadius:12,padding:"13px 16px",textAlign:"center"}}>
              <p style={{fontSize:20,fontWeight:700,color:clr,margin:"0 0 3px"}}>{candidates.length}</p>
              <p style={{fontSize:10,color:"rgba(255,255,255,0.3)",margin:0,textTransform:"uppercase",letterSpacing:0.5}}>Matches</p>
            </div>
            <div style={{flex:1,background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:12,padding:"13px 16px",textAlign:"center"}}>
              <p style={{fontSize:20,fontWeight:700,color:"rgba(52,211,153,0.9)",margin:"0 0 3px"}}>86%</p>
              <p style={{fontSize:10,color:"rgba(255,255,255,0.3)",margin:0,textTransform:"uppercase",letterSpacing:0.5}}>Gem. Score</p>
            </div>
            <div style={{flex:1,background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:12,padding:"13px 16px",textAlign:"center"}}>
              <p style={{fontSize:20,fontWeight:700,color:"rgba(251,191,36,0.9)",margin:"0 0 3px"}}>↑ 23%</p>
              <p style={{fontSize:10,color:"rgba(255,255,255,0.3)",margin:0,textTransform:"uppercase",letterSpacing:0.5}}>vs. vorige maand</p>
            </div>
          </div>
          <p style={{...labelStyle,marginBottom:12}}>Top kandidaten</p>
          {candidates.map(c=><CandidateRow key={c.id} id={c.id} role={c.role} score={c.score} color={clr}/>)}
        </div>
      );
    } else if (view && view.startsWith("performer_")) {
      const consultantName = view.replace("performer_", "");
      title = `📄 Frontsheets door: ${consultantName}`;
      const recentSheets = [
        {id:"81207", role:"Account Manager Medical Devices",       date:"Vandaag 14:32",     score:96},
        {id:"94022", role:"Vacature-Match Field Service Engineer", date:"Vandaag 11:47",     score:91},
        {id:"67841", role:"Sales Specialist Life Sciences",        date:"Gisteren 16:20",    score:88},
        {id:"73190", role:"Business Development Manager Pharma",   date:"Gisteren 14:05",    score:85},
        {id:"58304", role:"KAM Medical Devices",                   date:"Gisteren 11:33",    score:82},
        {id:"82916", role:"Product Specialist Diagnostics",        date:"Maandag 09:50",     score:78},
      ];
      const clr = accent;
      body = (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
            {[["45","Frontsheets",clr],["1,2 sec","Gem. generatietijd","#fbbf24"],["96%","Hoogste score","#34d399"]].map(([v,l,c])=>(
              <div key={l} style={{textAlign:"center",background:c+"0d",border:"1px solid "+c+"25",borderRadius:12,padding:"13px 8px"}}>
                <p style={{fontSize:18,fontWeight:700,color:c,margin:"0 0 3px"}}>{v}</p>
                <p style={{fontSize:10,color:"rgba(255,255,255,0.3)",margin:0,textTransform:"uppercase",letterSpacing:0.4,lineHeight:1.4}}>{l}</p>
              </div>
            ))}
          </div>
          <p style={{...labelStyle,marginBottom:12}}>Recente Frontsheets</p>
          {recentSheets.map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,marginBottom:8}}>
              <div style={{width:34,height:34,borderRadius:10,background:clr+"18",border:"1px solid "+clr+"30",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>📋</div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.85)",margin:"0 0 2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>ID: {s.id} — {s.role}</p>
                <p style={{fontSize:11,color:"rgba(255,255,255,0.3)",margin:0}}>{s.date}</p>
              </div>
              <span style={{fontSize:13,fontWeight:700,color:s.score>=90?"rgba(52,211,153,0.9)":s.score>=80?"rgba(251,191,36,0.9)":"rgba(248,113,113,0.9)",flexShrink:0}}>{s.score}%</span>
            </div>
          ))}
        </div>
      );
    } else if (view === "cache") {
      title = "🛡️ Bespaarde API Calls (Cache)";
      const cacheHits = [
        {time:"Vandaag 15:01",  id:"81207", role:"Account Manager",             url:null,                              saving:"$0,022"},
        {time:"Vandaag 14:48",  id:"94022", role:"Field Service Engineer",      url:null,                              saving:"$0,022"},
        {time:"Vandaag 11:30",  id:null,    role:null,                          url:"linkedin.com/in/j.devries-pharma",saving:"$0,019"},
        {time:"Vandaag 10:15",  id:"67841", role:"Sales Specialist",            url:null,                              saving:"$0,022"},
        {time:"Gisteren 16:55", id:null,    role:null,                          url:"linkedin.com/in/s.bakker-medtech", saving:"$0,021"},
        {time:"Gisteren 14:22", id:"73190", role:"BDM Pharma",                  url:null,                              saving:"$0,022"},
        {time:"Gisteren 11:30", id:null,    role:null,                          url:"linkedin.com/in/r.mol-medtech",   saving:"$0,019"},
      ];
      body = (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
            <div style={{background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:14,padding:"14px 16px"}}>
              <p style={labelStyle}>Voorkomen Dubbele Analyses</p>
              <p style={{fontSize:26,fontWeight:700,color:"rgba(251,191,36,0.95)",margin:"4px 0 2px",letterSpacing:-0.8}}>341</p>
              <p style={subStyle}>deze maand</p>
            </div>
            <div style={{background:"rgba(52,211,153,0.07)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:14,padding:"14px 16px"}}>
              <p style={labelStyle}>Geschatte Kostenbesparing</p>
              <p style={{fontSize:26,fontWeight:700,color:"rgba(52,211,153,0.95)",margin:"4px 0 2px",letterSpacing:-0.8}}>$6,65</p>
              <p style={subStyle}>341 × $0,022 gem.</p>
            </div>
          </div>
          <div style={{background:"rgba(34,211,238,0.05)",border:"1px solid rgba(34,211,238,0.15)",borderRadius:14,padding:"12px 16px",marginBottom:18}}>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.6)",margin:0,lineHeight:1.65}}>Het systeem herkent eerder geanalyseerde profielen automatisch en hergebruikt opgeslagen data — <span style={{color:"rgba(34,211,238,0.9)",fontWeight:600}}>zonder nieuwe API-call</span>.</p>
          </div>
          <p style={{...labelStyle,marginBottom:12}}>Recente cache hits</p>
          {cacheHits.map((h,i)=>(
            <div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:"#fbbf24",flexShrink:0,marginTop:6}}/>
              <div style={{flex:1}}>
                <p style={{fontSize:13,color:"rgba(255,255,255,0.82)",margin:"0 0 2px",fontWeight:500}}>
                  {h.id ? `ID: ${h.id}${h.role?" ("+h.role+")":""}` : `LinkedIn: ${h.url}`}
                </p>
                <p style={{fontSize:11,color:"rgba(255,255,255,0.3)",margin:0}}>{h.time} · Opgeslagen data gebruikt · <span style={{color:"rgba(52,211,153,0.7)",fontWeight:600}}>{h.saving} bespaard</span></p>
              </div>
            </div>
          ))}
        </div>
      );
    } else if (view === "groei") {
      title = "📈 Maand-op-Maand Groei";
      const teamData = [
        {team:"Team Utrecht",    prev:480, curr:586, delta:"+22%", color:"#34d399"},
        {team:"Team Amsterdam",  prev:567, curr:544, delta:"-4%",  color:"#f87171"},
        {team:"Team Rotterdam",  prev:0,   curr:74,  delta:"Nieuw",color:"#fbbf24"},
      ];
      body = (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
            <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:14,padding:"14px 16px"}}>
              <p style={labelStyle}>Vorige maand</p>
              <p style={{fontSize:28,fontWeight:700,color:"rgba(255,255,255,0.7)",margin:"4px 0 2px",letterSpacing:-0.8}}>1.047</p>
              <p style={subStyle}>totaal analyses</p>
            </div>
            <div style={{background:"rgba(52,211,153,0.07)",border:"1px solid rgba(52,211,153,0.22)",borderRadius:14,padding:"14px 16px"}}>
              <p style={labelStyle}>Deze maand</p>
              <p style={{fontSize:28,fontWeight:700,color:"rgba(52,211,153,0.95)",margin:"4px 0 2px",letterSpacing:-0.8}}>1.204</p>
              <p style={subStyle}><span style={{color:"rgba(52,211,153,0.9)",fontWeight:700}}>+15%</span> groei</p>
            </div>
          </div>
          <div style={{background:"rgba(52,211,153,0.05)",border:"1px solid rgba(52,211,153,0.15)",borderRadius:14,padding:"13px 16px",marginBottom:20}}>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.65)",margin:0,lineHeight:1.7}}>
              Piek in adoptie door <span style={{color:"rgba(52,211,153,0.9)",fontWeight:600}}>Team Utrecht (+22%)</span> compenseert lichte daling in <span style={{color:"rgba(248,113,113,0.85)",fontWeight:600}}>Amsterdam (-4%)</span>. Team Rotterdam is nieuw actief deze maand.
            </p>
          </div>
          <p style={{...labelStyle,marginBottom:12}}>Uitsplitsing per team</p>
          {teamData.map(t=>(
            <div key={t.team} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.78)"}}>{t.team}</span>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>{t.prev} → <span style={{color:"rgba(255,255,255,0.7)",fontWeight:600}}>{t.curr}</span></span>
                  <span style={{fontSize:12,fontWeight:700,padding:"2px 9px",borderRadius:9999,background:t.color+"12",border:"1px solid "+t.color+"28",color:t.color}}>{t.delta}</span>
                </div>
              </div>
              <div style={{height:5,borderRadius:9999,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}>
                <div style={{height:"100%",width:(t.curr/1204*100)+"%",borderRadius:9999,background:"linear-gradient(90deg,"+t.color+"70,"+t.color+")",transition:"width 0.4s ease"}}/>
              </div>
            </div>
          ))}
          <div style={{marginTop:16,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>Prognose volgende maand</span>
            <span style={{fontSize:14,fontWeight:700,color:"rgba(52,211,153,0.85)"}}>~1.340 <span style={{fontSize:11,fontWeight:400,color:"rgba(255,255,255,0.3)"}}>(+11% verwacht)</span></span>
          </div>
        </div>
      );
    } else if (view === "eff_uren") {
      title = "⏱️ Totale Uren Bespaard";
      body = (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
            {[["⏱️","120 uur","dit kwartaal","rgba(52,211,153,0.9)"],["⚡","1,2 sec","gem. per analyse","rgba(34,211,238,0.9)"],["📄","286","CV's verwerkt","rgba(167,139,250,0.9)"],["🎯","94%","first-time-right","rgba(251,191,36,0.9)"]].map(([icon,val,lbl,clr])=>(
              <div key={lbl} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"13px 14px",display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontSize:20,flexShrink:0}}>{icon}</span>
                <div>
                  <p style={{fontSize:16,fontWeight:700,color:clr,margin:"0 0 2px"}}>{val}</p>
                  <p style={{fontSize:10,color:"rgba(255,255,255,0.3)",margin:0,textTransform:"uppercase",letterSpacing:0.4}}>{lbl}</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{...labelStyle,marginBottom:12}}>Tijdsbesparing per workflow</p>
          {[["CV Analyse",72,"#34d399"],["Frontsheet Generatie",31,"#a78bfa"],["Boolean Search",17,"#22d3ee"]].map(([lbl,pct,clr])=>(
            <div key={lbl} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:13,color:"rgba(255,255,255,0.75)"}}>{lbl}</span>
                <span style={{fontSize:12,color:clr,fontWeight:600}}>{pct} uur</span>
              </div>
              <div style={{height:6,borderRadius:9999,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}>
                <div style={{height:"100%",width:(pct/72*100)+"%",background:clr,borderRadius:9999}}/>
              </div>
            </div>
          ))}
          <div style={{background:"rgba(52,211,153,0.06)",border:"1px solid rgba(52,211,153,0.15)",borderRadius:12,padding:"13px 16px",marginTop:14}}>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.5)",margin:"0 0 3px",fontWeight:500}}>💡 Berekening</p>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.35)",margin:0,lineHeight:1.65}}>286 CV's × (14 min − 1,2 sec) ≈ <strong style={{color:"rgba(255,255,255,0.6)"}}>66 uur</strong> directe analyse + <strong style={{color:"rgba(255,255,255,0.6)"}}>54 uur</strong> Frontsheets & Boolean — totaal 120 uur dit kwartaal.</p>
          </div>
        </div>
      );
    } else if (view === "eff_snelheid") {
      title = "⚡ Gemiddelde Tijd per Analyse";
      body = (
        <div>
          <div style={{background:"rgba(34,211,238,0.06)",border:"1px solid rgba(34,211,238,0.18)",borderRadius:14,padding:"18px",marginBottom:18,textAlign:"center"}}>
            <p style={{fontSize:42,fontWeight:800,color:"rgba(34,211,238,0.95)",margin:"0 0 4px",letterSpacing:-1.5}}>1,2 <span style={{fontSize:20,fontWeight:500}}>sec</span></p>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.4)",margin:0}}>Gemiddelde AI-verwerkingstijd per profiel</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
            {[["🐌","14 min","Handmatig","rgba(248,113,113,0.85)"],["🚀","1,2 sec","Met TalentLens AI","rgba(34,211,238,0.9)"],["🏆","700×","Snelheidswinst","rgba(251,191,36,0.9)"],["📈","94%","Proceskwaliteit","rgba(52,211,153,0.9)"]].map(([icon,val,lbl,clr])=>(
              <div key={lbl} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"13px 14px",display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontSize:20,flexShrink:0}}>{icon}</span>
                <div>
                  <p style={{fontSize:16,fontWeight:700,color:clr,margin:"0 0 2px"}}>{val}</p>
                  <p style={{fontSize:10,color:"rgba(255,255,255,0.3)",margin:0,textTransform:"uppercase",letterSpacing:0.4}}>{lbl}</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{...labelStyle,marginBottom:12}}>Responstijd verdeling (laatste 7 dagen)</p>
          {[["< 1 sec",38,"#34d399"],["1–2 sec",44,"#22d3ee"],["2–5 sec",14,"#fbbf24"],["> 5 sec",4,"#f87171"]].map(([lbl,pct,clr])=>(
            <div key={lbl} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:13,color:"rgba(255,255,255,0.7)"}}>{lbl}</span>
                <span style={{fontSize:12,color:clr,fontWeight:600}}>{pct}%</span>
              </div>
              <div style={{height:6,borderRadius:9999,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}>
                <div style={{height:"100%",width:pct+"%",background:clr,borderRadius:9999}}/>
              </div>
            </div>
          ))}
        </div>
      );
    } else if (view === "eff_kwaliteit") {
      title = "🎯 Kwaliteitsratio Frontsheets";
      body = (
        <div>
          <div style={{background:"rgba(167,139,250,0.06)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:14,padding:"18px",marginBottom:18,textAlign:"center"}}>
            <p style={{fontSize:48,fontWeight:800,color:"rgba(167,139,250,0.95)",margin:"0 0 4px",letterSpacing:-2}}>94%</p>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.4)",margin:0}}>First-time-right score — Frontsheets zonder correctie</p>
          </div>
          <p style={{...labelStyle,marginBottom:12}}>Kwaliteitsmetrics (steekproef n=50)</p>
          {[["Juiste skill-matches",94,"#34d399"],["Correcte rol-identificatie",89,accent],["Frontsheets zonder revisie",82,"#a78bfa"],["Contactgegevens foutloos",97,"#22d3ee"],["Anonimisatie correct",91,"#f472b6"]].map(([lbl,pct,clr])=>(
            <div key={lbl} style={{marginBottom:11}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:13,color:"rgba(255,255,255,0.75)"}}>{lbl}</span>
                <span style={{fontSize:12,color:clr,fontWeight:600}}>{pct}%</span>
              </div>
              <div style={{height:6,borderRadius:9999,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}>
                <div style={{height:"100%",width:pct+"%",background:clr,borderRadius:9999}}/>
              </div>
            </div>
          ))}
          <div style={{background:"rgba(52,211,153,0.06)",border:"1px solid rgba(52,211,153,0.15)",borderRadius:12,padding:"12px 16px",marginTop:16,display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{fontSize:16,marginTop:1}}>💬</span>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.5)",margin:0,lineHeight:1.65}}>94% first-time-right betekent dat gemiddeld <strong style={{color:"rgba(255,255,255,0.75)"}}>~6 van 100 frontsheets</strong> een kleine aanpassing nodig hebben — vs. ~40% bij handmatige opstelling.</p>
          </div>
        </div>
      );
    } else if (view === "roi") {
      title = "💰 ROI & Besparingsanalyse";
      const totalUren = 340;
      const besparing = totalUren * (uurloon || 45);
      body = (
        <div>
          {/* Interactief uurtarief input */}
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"14px 16px",marginBottom:18}}>
            <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.3)",letterSpacing:0.8,textTransform:"uppercase",marginBottom:8}}>
              Gemiddeld uurtarief consultant (€)
            </label>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <input
                type="number" min="20" max="200"
                value={uurloon}
                onChange={e=>setUurloon(Number(e.target.value))}
                style={{width:100,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.14)",borderRadius:9,color:"rgba(255,255,255,0.9)",padding:"8px 12px",fontSize:16,fontWeight:700,outline:"none",fontFamily:"Inter,sans-serif",textAlign:"center"}}
              />
              <div style={{flex:1,background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:10,padding:"8px 14px"}}>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>Gerealiseerde besparing → </span>
                <span style={{fontSize:16,fontWeight:700,color:"rgba(52,211,153,0.95)"}}> € {besparing.toLocaleString("nl-NL")}</span>
              </div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
            {[
              ["🕐","340 uur","Totaal bespaard (Q1–nu)","rgba(34,211,238,0.9)"],
              ["💶",`€ ${besparing.toLocaleString("nl-NL")}`,"Gerealiseerde besparing","rgba(52,211,153,0.9)"],
              ["⚡","14 min → 45 sec","Handmatig vs AI per CV","rgba(251,191,36,0.9)"],
              ["📊","236×","ROI ratio (tijdswaarde)","rgba(167,139,250,0.9)"],
            ].map(([icon,val,lbl,clr])=>(
              <div key={lbl} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"13px 14px",display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontSize:20,flexShrink:0}}>{icon}</span>
                <div>
                  <p style={{fontSize:16,fontWeight:700,color:clr,margin:"0 0 2px",letterSpacing:-0.3}}>{val}</p>
                  <p style={{fontSize:10,color:"rgba(255,255,255,0.3)",margin:0,textTransform:"uppercase",letterSpacing:0.4}}>{lbl}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:"rgba(52,211,153,0.05)",border:"1px solid rgba(52,211,153,0.15)",borderRadius:14,padding:"13px 16px",marginBottom:14}}>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.65)",margin:"0 0 4px",fontWeight:500}}>🏆 Beste maand: <span style={{color:"rgba(52,211,153,0.9)"}}>Maart (120 uur bespaard)</span></p>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.35)",margin:0,lineHeight:1.6}}>Piek voornamelijk door Frontsheet-generatie (74 uur) en CV-analyse sprint (46 uur) bij Team Utrecht.</p>
          </div>
          <div style={{background:"rgba(167,139,250,0.05)",border:"1px solid rgba(167,139,250,0.15)",borderRadius:14,padding:"13px 16px"}}>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.5)",margin:"0 0 3px",fontWeight:500}}>💡 Berekening</p>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.32)",margin:0,lineHeight:1.65}}>
              1.204 CV's × (14 min − 0,75 min) = <strong style={{color:"rgba(255,255,255,0.6)"}}>~253 uur</strong> directe tijdsbesparing + <strong style={{color:"rgba(255,255,255,0.6)"}}>87 uur</strong> Frontsheet/Boolean — totaal {totalUren} uur.
            </p>
          </div>
        </div>
      );
    } else if (view && view.startsWith("bedrijf_")) {
      const bedrijfNaam = view.replace("bedrijf_", "");
      title = `🎯 Target Analyse: ${bedrijfNaam}`;
      const functies = {
        "Philips Healthcare":     [["Quality Assurance Manager",       34],["Regulatory Affairs Specialist", 28],["R&D Engineer",                   22],["Clinical Application Specialist", 18],["Product Manager MRI",            11]],
        "Siemens Healthineers":   [["Field Service Engineer",          41],["Applications Specialist",        31],["System Integration Engineer",    19],["Sales Manager Diagnostics",      14],["Software Engineer Medical",      9]],
        "Medtronic":              [["Sales Representative CRM",        38],["Clinical Specialist Neuro",      29],["Regulatory Affairs Manager",     24],["Product Specialist Cardiac",     17],["Market Development Manager",     12]],
        "Johnson & Johnson":      [["Key Account Manager",             44],["Medical Science Liaison",        32],["Commercial Excellence Manager",  21],["Regulatory Specialist EU MDR",   15],["Health Economics Manager",       10]],
        "Abbott":                 [["Diagnostic Sales Specialist",     36],["Clinical Account Manager",       27],["Quality Engineer",               20],["Regional Sales Manager",         16],["Market Access Manager",          8]],
        "BD (Becton Dickinson)":  [["Territory Manager",               29],["Clinical Educator",              22],["Product Specialist Infusion",    18],["Supply Chain Manager",           12],["Quality Systems Manager",        9]],
        "Stryker":                [["Orthopedic Sales Consultant",     33],["Clinical Support Specialist",    25],["Sales Manager Trauma",           19],["Marketing Manager",              13],["Regulatory Manager",             8]],
        "Zimmer Biomet":          [["Joint Reconstruction Specialist", 27],["Sales Engineer",                 21],["Clinical Application Specialist",16],["Regulatory Affairs Specialist",  10],["Regional Manager",               7]],
      };
      const rows = functies[bedrijfNaam] || [["Quality Manager",(Math.floor(Math.random()*30)+20)],["Sales Specialist",(Math.floor(Math.random()*25)+15)],["Regulatory Affairs",(Math.floor(Math.random()*20)+10)]];
      const topCount = rows[0][1];
      body = (
        <div>
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"13px 16px",marginBottom:18,display:"flex",gap:16,alignItems:"center"}}>
            <div style={{textAlign:"center",padding:"0 8px"}}>
              <p style={{fontSize:22,fontWeight:700,color:accent,margin:"0 0 2px"}}>{rows.reduce((a,r)=>a+r[1],0)}</p>
              <p style={{fontSize:10,color:"rgba(255,255,255,0.28)",margin:0,textTransform:"uppercase",letterSpacing:0.4}}>Totaal searches</p>
            </div>
            <div style={{width:1,height:36,background:"rgba(255,255,255,0.08)"}}/>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.5)",margin:0,lineHeight:1.65,flex:1}}>Meest gezochte functies op basis van Boolean Search activiteit van alle consultants deze maand.</p>
          </div>
          <p style={{...labelStyle,marginBottom:12}}>Top gezochte functies</p>
          {rows.map(([functie,count],i)=>(
            <div key={functie} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:12,fontWeight:700,color:accent,width:18,textAlign:"right",flexShrink:0}}>{i+1}.</span>
                  <span style={{fontSize:13,color:"rgba(255,255,255,0.82)",fontWeight:500}}>{functie}</span>
                </div>
                <span style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.55)",flexShrink:0}}>{count}×</span>
              </div>
              <div style={{height:5,borderRadius:9999,background:"rgba(255,255,255,0.06)",overflow:"hidden",marginLeft:26}}>
                <div style={{height:"100%",width:(count/topCount*100)+"%",background:`linear-gradient(90deg,${accent}70,${accent})`,borderRadius:9999,transition:"width 0.4s"}}/>
              </div>
            </div>
          ))}
        </div>
      );
    } else if (view === "regio") {
      title = "🗺️ Kandidaten Heatmap (Nederland)";
      const regioPunten = [
        {naam:"Amsterdam",   x:100, y:90,  r:20, pct:28, color:"#f87171", glow:"rgba(248,113,113,0.6)"},
        {naam:"Utrecht",     x:112, y:118, r:16, pct:21, color:"#fb923c", glow:"rgba(251,146,60,0.6)"},
        {naam:"Rotterdam",   x:88,  y:140, r:13, pct:14, color:"#fbbf24", glow:"rgba(251,191,36,0.5)"},
        {naam:"Eindhoven",   x:118, y:188, r:13, pct:12, color:"#a78bfa", glow:"rgba(167,139,250,0.5)"},
        {naam:"Den Haag",    x:74,  y:126, r:11, pct:9,  color:"#34d399", glow:"rgba(52,211,153,0.5)"},
        {naam:"Groningen",   x:140, y:52,  r:10, pct:7,  color:"#22d3ee", glow:"rgba(34,211,238,0.45)"},
        {naam:"Maastricht",  x:130, y:240, r:9,  pct:5,  color:"#f472b6", glow:"rgba(244,114,182,0.45)"},
        {naam:"Overig",      x:0,   y:0,   r:0,  pct:4,  color:"rgba(255,255,255,0.3)", glow:"none"},
      ];
      body = (
        <div style={{display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
          {/* Kaart — robuuste div-gebaseerde dot-grid met absolute hotspot divs */}
          <div style={{flex:"0 0 auto",position:"relative",width:220,height:290,background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,overflow:"hidden"}}>
            {/* Land achtergrond raster */}
            <svg width="220" height="290" viewBox="0 0 220 290" style={{position:"absolute",top:0,left:0,display:"block"}}>
              <defs>
                <pattern id="dotgrid" x="0" y="0" width="11" height="11" patternUnits="userSpaceOnUse">
                  <circle cx="5.5" cy="5.5" r="1.2" fill="rgba(255,255,255,0.07)"/>
                </pattern>
              </defs>
              <rect width="220" height="290" fill="url(#dotgrid)"/>
              {/* Vereenvoudigde outline NL — duidelijk zichtbaar */}
              <polyline points="105,18 118,14 128,10 140,8 150,10 160,8 168,12 172,18 168,24 160,22 148,24 140,20 130,22 120,22 112,20 108,24 105,18"
                fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinejoin="round"/>
              <polyline points="90,30 105,24 112,30 118,28 126,32 130,38 140,36 152,34 160,38 168,36 176,42 182,54 186,66 184,78 188,92 186,106 190,118 185,130 190,144 185,158 178,170 180,184 174,196 172,210 175,222 170,236 162,248 152,258 140,264 128,260 116,252 106,242 100,228 96,214 92,200 88,186 84,172 80,158 78,144 80,130 76,116 78,102 82,88 84,74 88,62 90,48 88,36 90,30"
                fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            {/* Absolute glowing hotspots */}
            {regioPunten.filter(p=>p.r>0).map(p=>(
              <div key={p.naam} title={p.naam+" "+p.pct+"%"} style={{
                position:"absolute",
                left: p.x - p.r,
                top:  p.y - p.r,
                width:  p.r*2,
                height: p.r*2,
                borderRadius:"50%",
                background:p.color,
                boxShadow:`0 0 ${p.r*2}px ${p.r}px ${p.glow}, 0 0 ${p.r/2}px ${p.glow}`,
                zIndex:10,
                display:"flex",alignItems:"center",justifyContent:"center",
                border:`2px solid rgba(255,255,255,0.35)`,
                cursor:"default",
              }}>
                <div style={{width:p.r*0.6,height:p.r*0.6,borderRadius:"50%",background:"rgba(255,255,255,0.75)"}}/>
              </div>
            ))}
          </div>
          {/* Legenda */}
          <div style={{flex:1,minWidth:150}}>
            <p style={{...labelStyle,marginBottom:12}}>Verdeling per regio</p>
            {regioPunten.map(p=>(
              <div key={p.naam} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
                <div style={{width:11,height:11,borderRadius:"50%",flexShrink:0,background:p.color,boxShadow:p.r>0?`0 0 7px ${p.color}`:undefined}}/>
                <span style={{flex:1,fontSize:13,color:"rgba(255,255,255,0.75)",fontWeight:500}}>{p.naam}</span>
                <span style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.88)"}}>{p.pct}%</span>
              </div>
            ))}
            <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.07)"}}>
              <p style={{fontSize:11,color:"rgba(255,255,255,0.32)",margin:0,lineHeight:1.7}}>Randstad (AMS+UTR+RTD+DH) = <strong style={{color:"rgba(255,255,255,0.55)"}}>72%</strong> van alle kandidaten. Eindhoven groeit door MedTech-cluster.</p>
            </div>
          </div>
        </div>
      );
    } else if (view === "feedback") {
      title = "🧠 AI Feedback & Nauwkeurigheid";
      const fbItems = [
        {vote:"👍", who:"Consultant A", context:"Frontsheet",  tekst:"Perfect geformuleerd. Klant was direct enthousiast.",      time:"Vandaag 14:32", color:"rgba(52,211,153,0.9)"},
        {vote:"👎", who:"Consultant C", context:"CV Analyse",  tekst:"Herkende de specifieke ISO 13485 certificering niet direct.",time:"Vandaag 11:20", color:"rgba(248,113,113,0.9)"},
        {vote:"👍", who:"Consultant B", context:"Boolean",      tekst:"Direct raak op LinkedIn. Top 3 resultaten waren allen relevant.", time:"Vandaag 10:05", color:"rgba(52,211,153,0.9)"},
        {vote:"👍", who:"Consultant E", context:"Frontsheet",  tekst:"Toon en opbouw precies goed voor senior-niveau.",            time:"Gisteren 16:50",color:"rgba(52,211,153,0.9)"},
        {vote:"👎", who:"Consultant D", context:"Vacature Match",tekst:"Score was 78% maar kandidaat paste niet qua regio.",       time:"Gisteren 14:22",color:"rgba(248,113,113,0.9)"},
        {vote:"👍", who:"Consultant A", context:"CV Analyse",  tekst:"Alle skills correct herkend inclusief niche GMP-kennis.",   time:"Gisteren 11:08",color:"rgba(52,211,153,0.9)"},
        {vote:"👍", who:"Consultant F", context:"Boolean",      tekst:"Geeft altijd 5-8 goede doelgroep-bedrijven mee.",           time:"Ma 15:30",      color:"rgba(52,211,153,0.9)"},
      ];
      const positief = fbItems.filter(f=>f.vote==="👍").length;
      body = (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:18}}>
            {[
              [`${Math.round(positief/fbItems.length*100)}%`,"Positief","rgba(52,211,153,0.9)"],
              [`${fbItems.length}`,"Reacties totaal","rgba(255,255,255,0.7)"],
              ["92,8%","AI Nauwkeurigheid",accent],
            ].map(([v,l,c])=>(
              <div key={l} style={{textAlign:"center",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"12px 8px"}}>
                <p style={{fontSize:20,fontWeight:700,color:c,margin:"0 0 3px"}}>{v}</p>
                <p style={{fontSize:10,color:"rgba(255,255,255,0.3)",margin:0,textTransform:"uppercase",letterSpacing:0.4,lineHeight:1.4}}>{l}</p>
              </div>
            ))}
          </div>
          <p style={{...labelStyle,marginBottom:12}}>Recente feedback van consultants</p>
          {fbItems.map((f,i)=>(
            <div key={i} style={{display:"flex",gap:12,padding:"11px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              <span style={{fontSize:16,flexShrink:0,marginTop:1}}>{f.vote}</span>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3,flexWrap:"wrap"}}>
                  <span style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.8)"}}>{f.who}</span>
                  <span style={{fontSize:10,padding:"1px 8px",borderRadius:9999,background:f.vote==="👍"?"rgba(52,211,153,0.1)":"rgba(248,113,113,0.1)",border:`1px solid ${f.vote==="👍"?"rgba(52,211,153,0.2)":"rgba(248,113,113,0.2)"}`,color:f.color}}>{f.context}</span>
                </div>
                <p style={{fontSize:12,color:"rgba(255,255,255,0.55)",margin:"0 0 2px",lineHeight:1.5,fontStyle:"italic"}}>"{f.tekst}"</p>
                <p style={{fontSize:10,color:"rgba(255,255,255,0.22)",margin:0}}>{f.time}</p>
              </div>
            </div>
          ))}
        </div>
      );
    } else if (view === "klanten_heatmap") {
      title = "🏢 Klanten & Concurrentie Heatmap";
      const BEDRIJF_DATA = {
        "Philips Healthcare": {
          kleur:"#34d399", emoji:"🔬",
          vestigingen:[{naam:"Hoofdkantoor",stad:"Amsterdam",x:100,y:90},{naam:"R&D Lab",stad:"Eindhoven",x:118,y:188},{naam:"Productie",stad:"Best (N-Br.)",x:122,y:198}],
          vacatures:["QA/RA Officer","Field Service Engineer","Product Specialist MRI","Clinical Application Specialist","Marketing Manager Diagnostics"],
          insight:{tekst:"Verliest momenteel veel talent aan",concurrenten:["Siemens Healthineers","GE Healthcare"],tip:"Concentreer sourcing op ex-medewerkers van Agfa Healthcare en Canon Medical — kleinere spelers met vergelijkbare technische profielen en minder retentiebudget."},
        },
        "Siemens Healthineers": {
          kleur:"#22d3ee", emoji:"⚕️",
          vestigingen:[{naam:"Kantoor",stad:"Den Haag",x:74,y:126},{naam:"Service Hub",stad:"Utrecht",x:112,y:118},{naam:"Lab",stad:"Nijmegen",x:140,y:170}],
          vacatures:["Applications Specialist","System Integration Engineer","Sales Manager Diagnostics","Software Engineer Medical","Regional Service Manager"],
          insight:{tekst:"Actief op zoek naar kandidaten die overstappen van",concurrenten:["Philips Healthcare","Fujifilm Medical"],tip:"Kandidaten met Siemens Teamcenter / SAP PLM kennis zijn schaars. Sourcing tip: zoek op LinkedIn 'Siemens Healthineers Alumni' groepen."},
        },
        "Medtronic": {
          kleur:"#a78bfa", emoji:"💉",
          vestigingen:[{naam:"HQ Benelux",stad:"Maastricht",x:130,y:240},{naam:"Sales Office",stad:"Amsterdam",x:100,y:90},{naam:"Training Center",stad:"Utrecht",x:112,y:118}],
          vacatures:["Sales Representative CRM","Clinical Specialist Neuro","Regulatory Affairs Manager","Product Specialist Cardiac","Market Development Manager"],
          insight:{tekst:"Hoge interne mobiliteit — verliest weinig, maar moeilijk te sourcen vanwege retentie. Concurrenten:",concurrenten:["Abbott","Boston Scientific"],tip:"Target kandidaten bij distributeurs (bijv. Districon, Sanner) — vergelijkbare commerciële Medtech-skills zonder de lock-in van een groot corporate."},
        },
        "Johnson & Johnson": {
          kleur:"#fbbf24", emoji:"🏥",
          vestigingen:[{naam:"Consumer HQ",stad:"Amersfoort",x:115,y:110},{naam:"MedTech Office",stad:"Leiden",x:82,y:120},{naam:"Pharma R&D",stad:"Leiden",x:86,y:124}],
          vacatures:["Key Account Manager","Medical Science Liaison","Commercial Excellence Manager","Regulatory Specialist EU MDR","Health Economics Manager"],
          insight:{tekst:"Sterk werkgeversmerk. Verliest talent aan startups in de",concurrenten:["MedTech startup scene","Novartis","Roche"],tip:"Stel kandidaten voor die 'groot company + purpose' zoeken — J&J scoort hoog op DEI en sustainability. Focus op professionele 'boomerangs' (ex-J&J die terugkomen)."},
        },
        "ASML": {
          kleur:"#f472b6", emoji:"🔭",
          vestigingen:[{naam:"HQ",stad:"Veldhoven",x:122,y:192},{naam:"R&D",stad:"Eindhoven",x:118,y:188},{naam:"Office",stad:"Amsterdam",x:100,y:90}],
          vacatures:["System Engineer Lithography","Software Architect","Supply Chain Manager","Customer Support Engineer","Physics Researcher"],
          insight:{tekst:"Extreem competitieve sourcing markt. Verliest nauwelijks aan",concurrenten:["Nikon","Canon (Semiconductor)"],tip:"Focus op transferable skills: mechatronica, embedded software en optische systemen. Kandidaten uit aerospace (Fokker, Airbus NL) en defense zijn sterke alternatieven."},
        },
      };
      const bedrijven = Object.keys(BEDRIJF_DATA);
      const sel = selectedCompany && BEDRIJF_DATA[selectedCompany] ? BEDRIJF_DATA[selectedCompany] : null;
      const allePunten = sel ? sel.vestigingen : [
        {stad:"Amsterdam",x:100,y:90,kleur:"#f87171"},{stad:"Utrecht",x:112,y:118,kleur:"#fb923c"},
        {stad:"Eindhoven",x:118,y:188,kleur:"#a78bfa"},{stad:"Maastricht",x:130,y:240,kleur:"#f472b6"},
        {stad:"Den Haag",x:74,y:126,kleur:"#34d399"},{stad:"Leiden",x:82,y:120,kleur:"#22d3ee"},
      ];
      const dotKleur = sel ? sel.kleur : accent;
  
      body = (
        <div style={{display:"flex",gap:14,minHeight:360}}>
          {/* Kaart links */}
          <div style={{flex:"0 0 auto",position:"relative",width:210,height:280,background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,overflow:"hidden",flexShrink:0}}>
            <svg width="210" height="280" viewBox="0 0 210 280" style={{position:"absolute",top:0,left:0,display:"block"}}>
              <defs>
                <pattern id="dotgrid2" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                  <circle cx="5" cy="5" r="1" fill="rgba(255,255,255,0.06)"/>
                </pattern>
              </defs>
              <rect width="210" height="280" fill="url(#dotgrid2)"/>
              <polyline points="95,28 108,22 118,18 130,16 140,18 148,16 154,20 150,26 142,24 130,26 120,24 110,26 102,26 95,28"
                fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" strokeLinejoin="round"/>
              <polyline points="82,36 95,30 102,36 108,34 116,38 120,44 130,42 142,40 150,44 158,42 165,48 170,60 174,72 172,84 176,96 174,108 178,120 172,132 177,144 172,156 165,168 167,180 160,192 158,206 162,218 156,230 148,242 136,250 124,246 112,238 102,228 96,214 92,200 88,186 84,172 80,158 76,144 78,130 74,116 76,102 80,88 82,76 84,64 82,50 82,36"
                fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            {allePunten.map((p,i)=>(
              <div key={p.stad+i} title={p.stad||p.naam} style={{
                position:"absolute",
                left: (p.x||100) - 11,
                top:  (p.y||100) - 11,
                width:22,height:22,
                borderRadius:"50%",
                background: sel ? sel.kleur : (p.kleur||dotKleur),
                boxShadow:`0 0 18px 8px ${sel?sel.kleur+"80":dotKleur+"60"}, 0 0 6px ${sel?sel.kleur:dotKleur}`,
                zIndex:10,
                border:"2px solid rgba(255,255,255,0.4)",
                display:"flex",alignItems:"center",justifyContent:"center",
                cursor:"default",
              }}>
                <div style={{width:8,height:8,borderRadius:"50%",background:"rgba(255,255,255,0.8)"}}/>
              </div>
            ))}
            {sel&&(
              <div style={{position:"absolute",bottom:8,left:8,right:8,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)",borderRadius:8,padding:"5px 8px"}}>
                <p style={{fontSize:9,color:sel.kleur,fontWeight:700,margin:0,letterSpacing:0.5,textTransform:"uppercase"}}>{sel.emoji} {selectedCompany}</p>
              </div>
            )}
          </div>
  
          {/* Sidebar rechts */}
          <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:10,overflowY:"auto",maxHeight:360}}>
            {!sel ? (
              <>
                <p style={{...labelStyle,margin:"0 0 8px"}}>Selecteer een bedrijf</p>
                {bedrijven.map(naam=>{
                  const bd = BEDRIJF_DATA[naam];
                  return (
                    <div key={naam} onClick={()=>setSelectedCompany(naam)}
                      style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,cursor:"pointer",transition:"all 0.18s"}}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.07)";e.currentTarget.style.borderColor=bd.kleur+"40";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";}}>
                      <span style={{fontSize:18}}>{bd.emoji}</span>
                      <div style={{flex:1}}>
                        <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.85)",margin:0}}>{naam}</p>
                        <p style={{fontSize:10,color:"rgba(255,255,255,0.3)",margin:0}}>{bd.vestigingen.length} vestigingen · {bd.vacatures.length} openstaande functies</p>
                      </div>
                      <div style={{width:10,height:10,borderRadius:"50%",background:bd.kleur,flexShrink:0,boxShadow:`0 0 8px ${bd.kleur}`}}/>
                    </div>
                  );
                })}
              </>
            ) : (
              <>
                {/* Terugknop */}
                <button onClick={()=>setSelectedCompany(null)}
                  style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.6)",borderRadius:9,padding:"6px 12px",fontSize:12,cursor:"pointer",alignSelf:"flex-start",transition:"all 0.15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)";e.currentTarget.style.color="rgba(255,255,255,0.9)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.color="rgba(255,255,255,0.6)";}}>
                  ← Terug
                </button>
                {/* Bedrijfsnaam */}
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:22}}>{sel.emoji}</span>
                  <h3 style={{fontSize:16,fontWeight:700,color:"rgba(255,255,255,0.92)",margin:0,letterSpacing:-0.4}}>{selectedCompany}</h3>
                </div>
                {/* Vestigingen */}
                <div>
                  <p style={{...labelStyle,margin:"0 0 8px"}}>Vestigingen</p>
                  {sel.vestigingen.map((v,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <div style={{width:7,height:7,borderRadius:"50%",background:sel.kleur,flexShrink:0,boxShadow:`0 0 6px ${sel.kleur}`}}/>
                      <span style={{fontSize:12,color:"rgba(255,255,255,0.65)"}}><strong style={{color:"rgba(255,255,255,0.45)",fontWeight:500}}>{v.naam}:</strong> {v.stad}</span>
                    </div>
                  ))}
                </div>
                {/* Vacatures */}
                <div>
                  <p style={{...labelStyle,margin:"0 0 8px"}}>Meest Gezochte Vacatures</p>
                  {sel.vacatures.map((v,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                      <span style={{fontSize:11,color:sel.kleur,fontWeight:700,width:16,flexShrink:0}}>{i+1}.</span>
                      <span style={{fontSize:12,color:"rgba(255,255,255,0.75)"}}>{v}</span>
                    </div>
                  ))}
                </div>
                {/* Smart Insight */}
                <div style={{background:`${sel.kleur}09`,border:`1px solid ${sel.kleur}25`,borderRadius:12,padding:"12px 14px"}}>
                  <p style={{fontSize:11,fontWeight:700,color:sel.kleur,margin:"0 0 6px",letterSpacing:0.5}}>💡 TALENT FLOW INZICHT</p>
                  <p style={{fontSize:12,color:"rgba(255,255,255,0.62)",margin:"0 0 6px",lineHeight:1.65}}>
                    {sel.insight.tekst} <strong style={{color:"rgba(255,255,255,0.75)"}}>{sel.insight.concurrenten.join(" & ")}</strong>.
                  </p>
                  <p style={{fontSize:11,color:"rgba(255,255,255,0.45)",margin:0,lineHeight:1.65,fontStyle:"italic"}}>🎯 {sel.insight.tip}</p>
                </div>
              </>
            )}
          </div>
        </div>
      );
    } else if (view === "fouten") {
      title = "🚫 Geblokkeerde Inlogpogingen";
      const attempts = [
        {time:"Vandaag 16:55",    email:"m.jansen@external-agency.nl", type:"Onbekend domein",          color:"#f87171"},
        {time:"Vandaag 14:12",    email:"admin@morganrecruitment.com",  type:"Fout admin-wachtwoord",     color:"#fbbf24"},
        {time:"Gisteren 09:12",   email:"recruiter@talentbridge.nl",    type:"Onbekend domein",          color:"#f87171"},
        {time:"Gisteren 08:44",   email:"d.wit@morgan-temp.nl",         type:"Domein niet in whitelist", color:"#f87171"},
        {time:"Ma 17:30",         email:"test@test.com",                type:"Ongeldig e-mailadres",     color:"#fbbf24"},
      ];
      body = (
        <div>
          <div style={{background:"rgba(248,113,113,0.06)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:14,padding:"14px 16px",marginBottom:18}}>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.65)",margin:"0 0 4px",lineHeight:1.6}}>Inlogpogingen met <span style={{color:"rgba(248,113,113,0.9)",fontWeight:600}}>niet-geautoriseerde e-mailadressen</span> of onjuiste admin-credentials worden automatisch geblokkeerd en gelogd.</p>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.3)",margin:0}}>Totaal geblokkeerd deze maand: <span style={{color:"rgba(248,113,113,0.9)",fontWeight:700}}>2 pogingen</span></p>
          </div>
          <p style={{...labelStyle,marginBottom:12}}>Geblokkeerde pogingen</p>
          {attempts.map((a,i)=>(
            <div key={i} style={{display:"flex",gap:12,padding:"12px 14px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,marginBottom:8}}>
              <div style={{width:34,height:34,borderRadius:10,background:a.color+"12",border:"1px solid "+a.color+"25",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🔐</div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.8)",margin:"0 0 2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.email}</p>
                <p style={{fontSize:11,color:"rgba(255,255,255,0.3)",margin:0}}>{a.time}</p>
              </div>
              <span style={{fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:9999,background:a.color+"12",border:"1px solid "+a.color+"25",color:a.color,alignSelf:"center",whiteSpace:"nowrap",flexShrink:0}}>{a.type}</span>
            </div>
          ))}
        </div>
      );
    }
  
    return (
      <div style={overlay} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
        <div style={panel} className="fi">
          <button style={closeBtn}
            onClick={onClose}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.12)";e.currentTarget.style.color="rgba(255,255,255,0.9)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.color="rgba(255,255,255,0.5)";}}>
            ✕
          </button>
          <h2 style={titleStyle}>{title}</h2>
          {body}
        </div>
      </div>
    );
  }
  
  function AdminDashboard({ T, onClose, gems, adminRole }) {
    const [adminTab, setAdminTab] = React.useState("financien");
    const [adminDetailView, setAdminDetailView] = React.useState(null);
    const [uurloon, setUurloon] = React.useState(45);
    const [selectedCompany, setSelectedCompany] = React.useState(null);
    /* Gems filter: SUPER sees all teams and can switch; label-admins are locked */
    const ROLE_TEAM_MAP = { GREEN:"Morgan Green", BLACK:"Morgan Black", LAB:"Morgan Lab" };
    const lockedTeam = adminRole !== "SUPER" ? ROLE_TEAM_MAP[adminRole] : null;
    const [gemFilter, setGemFilter] = React.useState(lockedTeam || "Morgan Green");
    const [openGem,   setOpenGem]   = React.useState(null);
    const [gemCopied, setGemCopied] = React.useState(null);
    const accent = T.accent;
    const isSuper = adminRole === "SUPER";
  
    /* ── Role label badge config ── */
    const ROLE_META = {
      SUPER: { label:"Super Admin",     color:"#a855f7" },
      GREEN: { label:"Morgan Green",    color:"#10b981" },
      BLACK: { label:"Morgan Black",    color:"#9ca3af" },
      LAB:   { label:"Morgan Lab",      color:"#3b82f6" },
    };
    const roleMeta = ROLE_META[adminRole] || ROLE_META.SUPER;
    const ADMIN_TABS = [
      { id:"financien",   label:"📊 Adoptie & Financiën" },
      { id:"commercieel", label:"🚀 Commerciële Slagkracht" },
      { id:"markt",       label:"🧬 Markt- & Niche Inzichten" },
      { id:"compliance",  label:"🛡️ Kwaliteit & Compliance" },
      { id:"gems",        label:"💎 Team Gems Kennisbank" },
    ];
  
    const grid3 = {display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:16};
    const grid2 = {display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:16};
    const weekData = [42,58,71,63,88,104,122];
    const weekDays = ["Ma","Di","Wo","Do","Vr","Za","Zo"];
  
    return (
      <div style={{maxWidth:960,margin:"0 auto",padding:"24px 16px 60px"}}>
  
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,gap:12,flexWrap:"wrap"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <div style={{width:36,height:36,borderRadius:12,background:accent+"18",border:"1px solid "+accent+"30",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>⚙️</div>
              <h1 style={{fontSize:22,fontWeight:700,color:"rgba(255,255,255,0.95)",margin:0,letterSpacing:-0.6}}>Admin Dashboard</h1>
              <span style={{fontSize:10,fontWeight:600,color:accent,background:accent+"12",border:"1px solid "+accent+"28",borderRadius:9999,padding:"3px 10px",letterSpacing:0.8,textTransform:"uppercase"}}>Live</span>
              <span style={{fontSize:10,fontWeight:700,color:roleMeta.color,background:roleMeta.color+"18",border:"1px solid "+roleMeta.color+"35",borderRadius:9999,padding:"3px 10px",letterSpacing:0.8,textTransform:"uppercase"}}>{roleMeta.label}</span>
            </div>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.35)",margin:0,fontWeight:400}}>Morgan Recruitment Group · ROI & Activiteitsmonitor · {new Date().toLocaleDateString("nl-NL",{day:"numeric",month:"long",year:"numeric"})}</p>
          </div>
          <button onClick={onClose}
            style={{background:"rgba(255,255,255,0.06)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.6)",borderRadius:9999,padding:"9px 20px",fontSize:13,fontWeight:500,cursor:"pointer",transition:"all 0.2s",display:"flex",alignItems:"center",gap:7,flexShrink:0}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)";e.currentTarget.style.color="rgba(255,255,255,0.9)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.color="rgba(255,255,255,0.6)";}}>
            ⬅️ Naar Applicatie
          </button>
        </div>
  
        {/* Tab nav */}
        <div style={{display:"flex",gap:2,background:"rgba(255,255,255,0.05)",backdropFilter:"blur(16px)",borderRadius:16,padding:4,border:"1px solid rgba(255,255,255,0.07)",flexWrap:"wrap",marginBottom:24}}>
          {ADMIN_TABS.map(t=>(
            <button key={t.id} onClick={()=>setAdminTab(t.id)}
              style={{flex:"1 1 auto",padding:"8px 14px",borderRadius:12,border:"none",background:adminTab===t.id?"rgba(255,255,255,0.1)":"transparent",color:adminTab===t.id?"rgba(255,255,255,0.92)":"rgba(255,255,255,0.38)",fontSize:12,fontWeight:adminTab===t.id?600:400,cursor:"pointer",transition:"all 0.18s",whiteSpace:"nowrap",textAlign:"center"}}>
              {t.label}
            </button>
          ))}
        </div>
  
        {/* ── TAB 1: ADOPTIE & FINANCIËN ── */}
        {adminTab==="financien"&&(
          <div>
            {/* ── KPI row — SUPER sees financial metrics; label-admins see efficiency ── */}
            {isSuper ? (
              <>
                <div style={grid3}>
                  <AdminKPICard icon="💰" label="Totale API Kosten" value="$26,40" onClick={()=>setAdminDetailView("kosten")} sub="deze maand" trend="↓ 12%" trendLabel="vs. vorige maand" color="#34d399"/>
                  <AdminKPICard icon="📄" label="Geanalyseerde CV's" value="1.204" onClick={()=>setAdminDetailView("cvs")} sub="+187 deze week" trend="↑ 18%" color={accent}/>
                  <AdminKPICard icon="👥" label="Actieve Gebruikers" value="14" onClick={()=>setAdminDetailView("gebruikers")} sub="van 18 accounts" trend="↑ 2 nieuw" color="#a78bfa"/>
                  <AdminKPICard icon="⚡" label="Bespaarde API Calls" value="341" sub="via cache hit" trend="28% bespaard" color="#fbbf24" onClick={()=>setAdminDetailView("cache")}/>
                  <AdminKPICard icon="🤖" label="Gem. Kosten per CV" value="$0,022" sub="model: claude-3.5-sonnet" color="#f472b6"/>
                  <AdminKPICard icon="📈" label="Groei MoM (Month-over-Month)" value="+15%" sub="analyses t.o.v. vorige maand" trend="↑ Sterk" color="#34d399" onClick={()=>setAdminDetailView("groei")}/>
                </div>
                <div style={grid2}>
                  <AdminCard>
                    <AdminSectionHeader>📅 Analyses per dag (afgelopen 7 dagen)</AdminSectionHeader>
                    <AdminSparkline data={weekData} color={accent}/>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                      {weekDays.map((d,i)=>(
                        <span key={d} style={{fontSize:10,color:"rgba(255,255,255,0.25)",textAlign:"center",flex:1}}>
                          {d}<br/><span style={{color:"rgba(255,255,255,0.5)",fontWeight:600}}>{weekData[i]}</span>
                        </span>
                      ))}
                    </div>
                  </AdminCard>
                  <AdminCard>
                    <AdminSectionHeader>💳 Kosten uitsplitsing</AdminSectionHeader>
                    <AdminProgressBar pct={65} label="CV Analyse (claude-3.5)" value="$17,20" color={accent}/>
                    <AdminProgressBar pct={18} label="Vacature Matching" value="$4,75" color="#a78bfa"/>
                    <AdminProgressBar pct={9}  label="Boolean Search" value="$2,40" color="#fbbf24"/>
                    <AdminProgressBar pct={8}  label="Frontsheet Generator" value="$2,05" color="#f472b6"/>
                    <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>Maandbudget</span>
                      <span style={{fontSize:13,fontWeight:600,color:"rgba(52,211,153,0.85)"}}>$26,40 / $75 <span style={{fontSize:11,fontWeight:400,color:"rgba(255,255,255,0.3)"}}>(35%)</span></span>
                    </div>
                  </AdminCard>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:0}}>
                  <AdminKPICard icon="🕐" label="Uren Bespaard (Q1–nu)" value="340 uur" sub="14 min/CV handmatig vs 45 sec AI" trend="↑ 78%" color="#34d399" onClick={()=>setAdminDetailView("roi")}/>
                  <AdminKPICard icon="💶" label="Gerealiseerde Besparing (ROI)" value={`€ ${(340*uurloon).toLocaleString("nl-NL")}`} sub={`bij €${uurloon}/uur uurtarief`} trend="↑ Sterk" color="#22d3ee" onClick={()=>setAdminDetailView("roi")}/>
                  <AdminKPICard icon="📊" label="ROI Ratio" value="236×" sub="elke $1 AI levert $236 tijdswaarde" trend="🏆 Top" color="#a78bfa" onClick={()=>setAdminDetailView("roi")}/>
                </div>
              </>
            ) : (
              /* ── Label-admin: efficiency KPIs only (no financial data) ── */
              <>
                <div style={{marginBottom:12,padding:"10px 14px",background:roleMeta.color+"10",border:`1px solid ${roleMeta.color}28`,borderRadius:12,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:13}}>🏷️</span>
                  <p style={{fontSize:12,color:"rgba(255,255,255,0.5)",margin:0}}>Je bekijkt data gefilterd op <strong style={{color:roleMeta.color}}>{lockedTeam}</strong>. Financiële KPI's zijn alleen zichtbaar voor Super Admins.</p>
                </div>
                <div style={grid3}>
                  <AdminKPICard icon="⏱️" label="Totale Uren Bespaard" value="120 uur" sub="dit kwartaal door AI-analyse" trend="↑ 34%" color="#34d399" onClick={()=>setAdminDetailView("eff_uren")}/>
                  <AdminKPICard icon="⚡" label="Gem. Tijd per Analyse" value="1,2 sec" sub="vs. 14 min handmatig" trend="700× sneller" color="#22d3ee" onClick={()=>setAdminDetailView("eff_snelheid")}/>
                  <AdminKPICard icon="🎯" label="Kwaliteitsratio Frontsheets" value="94%" sub="First-time-right score" trend="↑ 3%" color="#a78bfa" onClick={()=>setAdminDetailView("eff_kwaliteit")}/>
                  <AdminKPICard icon="📄" label="Geanalyseerde CV's" value={adminRole==="GREEN"?"412":adminRole==="BLACK"?"298":"494"} onClick={()=>setAdminDetailView("cvs")} sub="+48 deze week" trend="↑ 14%" color={accent}/>
                  <AdminKPICard icon="📋" label="Frontsheets Verstuurd" value={adminRole==="GREEN"?"108":adminRole==="BLACK"?"76":"134"} sub="via TalentLens" trend="↑ 22%" color="#fbbf24"/>
                  <AdminKPICard icon="📈" label="Groei MoM" value="+15%" sub="analyses t.o.v. vorige maand" trend="↑ Sterk" color="#34d399" onClick={()=>setAdminDetailView("groei")}/>
                </div>
                <div style={grid2}>
                  <AdminCard>
                    <AdminSectionHeader>📅 Analyses per dag (afgelopen 7 dagen)</AdminSectionHeader>
                    <AdminSparkline data={weekData.map(v=>Math.round(v*(adminRole==="LAB"?0.41:adminRole==="BLACK"?0.25:0.34)))} color={accent}/>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                      {weekDays.map((d,i)=>(
                        <span key={d} style={{fontSize:10,color:"rgba(255,255,255,0.25)",textAlign:"center",flex:1}}>
                          {d}<br/><span style={{color:"rgba(255,255,255,0.5)",fontWeight:600}}>{Math.round(weekData[i]*(adminRole==="LAB"?0.41:adminRole==="BLACK"?0.25:0.34))}</span>
                        </span>
                      ))}
                    </div>
                  </AdminCard>
                  <AdminCard>
                    <AdminSectionHeader>🎯 Efficiëntie uitsplitsing</AdminSectionHeader>
                    <AdminProgressBar pct={94} label="Skill-matches correct (first-time)" value="94%" color="#34d399"/>
                    <AdminProgressBar pct={89} label="Correcte rol-identificatie"          value="89%" color={accent}/>
                    <AdminProgressBar pct={82} label="Frontsheets zonder correctie"        value="82%" color="#a78bfa"/>
                    <AdminProgressBar pct={97} label="Contactgegevens foutloos"            value="97%" color="#22d3ee"/>
                    <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:18}}>⚡</span>
                      <span style={{fontSize:13,fontWeight:600,color:"rgba(52,211,153,0.9)"}}>Gem. 92,8% nauwkeurig — <span style={{fontWeight:400,color:"rgba(255,255,255,0.3)"}}>steekproef n=50</span></span>
                    </div>
                  </AdminCard>
                </div>
              </>
            )}
          </div>
        )}
  
        {/* ── TAB 2: COMMERCIËLE SLAGKRACHT ── */}
        {adminTab==="commercieel"&&(()=>{
          /* All performers with a team tag — label-admins only see their own */
          const ALL_FRONTSHEET = [
            ["Consultant A (Amsterdam)", 45, 120, "Frontsheets", "Boolean", "GREEN"],
            ["Consultant B (Utrecht)",   38,  94, "Frontsheets", "Boolean", "GREEN"],
            ["Consultant C (Amsterdam)", 31,  81, "Frontsheets", "Boolean", "BLACK"],
            ["Consultant D (Utrecht)",   27,  67, "Frontsheets", "Boolean", "LAB"],
            ["Consultant E (Amsterdam)", 19,  52, "Frontsheets", "Boolean", "LAB"],
            ["Consultant F (Utrecht)",   16,  44, "Frontsheets", "Boolean", "BLACK"],
          ];
          const ALL_BOOLEAN = [
            ["Consultant A (Amsterdam)", 120, 45, "GREEN"],
            ["Consultant B (Utrecht)",    94, 38, "GREEN"],
            ["Consultant F (Utrecht)",    78, 22, "BLACK"],
            ["Consultant C (Amsterdam)",  81, 31, "BLACK"],
            ["Consultant G (Amsterdam)",  61, 18, "LAB"],
          ];
          const filterPerf = rows => isSuper ? rows : rows.filter(r => r[r.length-1] === adminRole);
          const fsRows = filterPerf(ALL_FRONTSHEET);
          const bRows  = filterPerf(ALL_BOOLEAN);
          return (
          <div>
            <div style={grid3}>
              <AdminKPICard icon="📋" label="Frontsheets gegenereerd" value={isSuper?"318":String(fsRows.reduce((a,r)=>a+r[1],0))} sub="deze maand" trend="↑ 41%" color={accent}/>
              <AdminKPICard icon="🔎" label="Boolean Searches" value={isSuper?"529":String(bRows.reduce((a,r)=>a+r[1],0))} sub="gemiddeld 37/dag" trend="↑ 28%" color="#a78bfa"/>
              <AdminKPICard icon="💼" label="Vacature Matches" value={isSuper?"204":"67"} sub="87 naar gesprek" trend="43% conversie" color="#fbbf24"/>
              <AdminKPICard icon="📞" label="Gegenereerde Belscripts" value={isSuper?"156":"48"} sub="bij 87% match-score" trend="↑ 33%" color="#f472b6"/>
            </div>
            <div style={grid2}>
              <AdminCard>
                <AdminSectionHeader>🏆 Top Performers — Frontsheets</AdminSectionHeader>
                {fsRows.length > 0
                  ? fsRows.map(([name,s1,s2,l1,l2],i)=>(
                      <AdminRankRow key={name} rank={i+1} name={name} stat1={s1} stat2={s2} label1={l1} label2={l2} accent={accent} onClick={()=>setAdminDetailView("performer_"+name)}/>
                    ))
                  : <p style={{fontSize:12,color:"rgba(255,255,255,0.3)",margin:"12px 0"}}>Geen performers gevonden voor {lockedTeam}.</p>
                }
              </AdminCard>
              <AdminCard>
                <AdminSectionHeader>🔎 Top Performers — Boolean Searches</AdminSectionHeader>
                {bRows.length > 0
                  ? bRows.map(([name,s1,s2],i)=>(
                      <AdminRankRow key={name} rank={i+1} name={name} stat1={s1} stat2={s2} label1="Booleans" label2="Frontsheets" accent="#a78bfa" onClick={()=>setAdminDetailView("performer_"+name)}/>
                    ))
                  : <p style={{fontSize:12,color:"rgba(255,255,255,0.3)",margin:"12px 0"}}>Geen performers gevonden voor {lockedTeam}.</p>
                }
              </AdminCard>
            </div>
            <AdminCard>
              <AdminSectionHeader>📊 Recruitment Conversie Funnel</AdminSectionHeader>
              <AdminProgressBar pct={100} label="Geanalyseerde profielen" value={isSuper?"1.204":adminRole==="GREEN"?"412":adminRole==="BLACK"?"298":"494"} color="rgba(255,255,255,0.3)"/>
              <AdminProgressBar pct={26}  label="Doorgestuurd als Frontsheet" value={isSuper?"318 (26%)":"108 (26%)"} color={accent}/>
              <AdminProgressBar pct={17}  label="Vacature-match uitgevoerd" value={isSuper?"204 (17%)":"67 (16%)"} color="#a78bfa"/>
              <AdminProgressBar pct={7}   label="Belscript gegenereerd" value={isSuper?"87 (7%)":"29 (7%)"} color="#fbbf24"/>
              <AdminProgressBar pct={4}   label="Geschatte plaatsingen" value={isSuper?"~48 (4%)":"~16 (4%)"} color="#34d399"/>
            </AdminCard>
          </div>
          );
        })()}
  
        {/* ── TAB 3: MARKT- & NICHE INZICHTEN ── */}
        {adminTab==="markt"&&(
          <div>
            <div style={grid2}>
              <AdminCard>
                <AdminSectionHeader>🔥 Trending Skills deze maand</AdminSectionHeader>
                {[
                  ["Medical Devices",        97, "#34d399", "🩺"],
                  ["B2B Sales",              88, accent,    "💼"],
                  ["Life Sciences",          82, "#a78bfa", "🧬"],
                  ["Key Account Management", 74, "#fbbf24", "🤝"],
                  ["Regulatory Affairs",     68, "#f472b6", "📋"],
                  ["GMP",                    61, "#22d3ee", "🏭"],
                  ["Pharmacovigilance",      55, "#fb923c", "💊"],
                  ["Clinical Research",      49, "#34d399", "🔬"],
                ].map(([label,pct,color,icon])=>(
                  <div key={label} onClick={()=>setAdminDetailView("skill_"+label)} style={{cursor:"pointer",borderRadius:12,transition:"background 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <AdminTrendPill label={label} value={pct+" matches"} pct={pct} color={color} icon={icon}/>
                  </div>
                ))}
              </AdminCard>
              <AdminCard>
                <AdminSectionHeader>🏢 Top Target Bedrijven (via Boolean)</AdminSectionHeader>
                {[
                  ["Philips Healthcare",    94, "#34d399", "🔬"],
                  ["Siemens Healthineers", 87, accent,    "⚕️"],
                  ["Medtronic",            81, "#a78bfa", "💉"],
                  ["Johnson & Johnson",    76, "#fbbf24", "🏥"],
                  ["Abbott",               68, "#f472b6", "🧪"],
                  ["BD (Becton Dickinson)",61, "#22d3ee", "🩸"],
                  ["Stryker",              57, "#fb923c", "🦴"],
                  ["Zimmer Biomet",        49, "#34d399", "🦷"],
                ].map(([label,pct,color,icon])=>(
                  <div key={label} onClick={()=>setAdminDetailView("bedrijf_"+label)}
                    style={{cursor:"pointer",borderRadius:12,transition:"background 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <AdminTrendPill label={label} value={pct+" searches"} pct={pct} color={color} icon={icon}/>
                  </div>
                ))}
              </AdminCard>
            </div>
            <div style={grid2}>
              <AdminCard style={{cursor:"pointer"}} onClick={()=>setAdminDetailView("regio")}
                onMouseEnter={e=>e.currentTarget.style.borderColor=accent+"40"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}>
                <AdminSectionHeader>🗺️ Kandidaten per Regio</AdminSectionHeader>
                <AdminProgressBar pct={51} label="Noord (Amsterdam e.o.)" value="612 profielen" color={accent}/>
                <AdminProgressBar pct={49} label="Zuid (Rotterdam/Utrecht)" value="592 profielen" color={accent}/>
                <div style={{height:1,background:"rgba(255,255,255,0.06)",margin:"12px 0"}}/>
                <AdminSectionHeader>📊 Top Verticals</AdminSectionHeader>
                <AdminProgressBar pct={38} label="Sales & Marketing"    value="38%" color="#f472b6"/>
                <AdminProgressBar pct={22} label="Quality"              value="22%" color="#22d3ee"/>
                <AdminProgressBar pct={18} label="Medical & Clinical"   value="18%" color="#f87171"/>
                <AdminProgressBar pct={12} label="Laboratory"           value="12%" color="#34d399"/>
                <AdminProgressBar pct={10} label="Engineering"          value="10%" color="#fbbf24"/>
              </AdminCard>
              <AdminCard>
                <AdminSectionHeader>📅 Activiteit heatmap (Ma–Vr)</AdminSectionHeader>
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginBottom:14}}>
                  {["Ma","Di","Wo","Do","Vr"].map((d,di)=>{
                    const barVals = [72,65,58,50,42];
                    const opacities = [0.85,0.7,0.55,0.42,0.3];
                    return (
                      <div key={d} style={{textAlign:"center"}}>
                        <p style={{fontSize:10,color:"rgba(255,255,255,0.25)",margin:"0 0 5px"}}>{d}</p>
                        {barVals.map((h,i)=>(
                          <div key={i} style={{height:h-di*6+"px",minHeight:8,borderRadius:4,margin:"2px 0",background:accent,opacity:opacities[i]}}/>
                        ))}
                      </div>
                    );
                  })}
                </div>
                <div style={{height:1,background:"rgba(255,255,255,0.06)",margin:"10px 0"}}/>
                <AdminSectionHeader>🌐 Bron verdeling</AdminSectionHeader>
                <AdminProgressBar pct={62} label="CV Upload (PDF)" value="748"  color={accent}/>
                <AdminProgressBar pct={28} label="LinkedIn"         value="337"  color="#a78bfa"/>
                <AdminProgressBar pct={10} label="Indeed"           value="119"  color="#fbbf24"/>
              </AdminCard>
            </div>
            {/* Klanten & Concurrentie Heatmap card */}
            <AdminCard style={{cursor:"pointer",transition:"border-color 0.2s"}} onClick={()=>setAdminDetailView("klanten_heatmap")}
              onMouseEnter={e=>e.currentTarget.style.borderColor=accent+"45"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:12,background:accent+"18",border:`1px solid ${accent}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🏢</div>
                  <div>
                    <p style={{fontSize:14,fontWeight:700,color:"rgba(255,255,255,0.88)",margin:"0 0 2px"}}>Klanten & Concurrentie Heatmap</p>
                    <p style={{fontSize:12,color:"rgba(255,255,255,0.32)",margin:0}}>Interactieve vestigingskaart per doelklant · Talent Flow inzichten</p>
                  </div>
                </div>
                <span style={{fontSize:22}}>→</span>
              </div>
            </AdminCard>
          </div>
        )}
  
        {/* ── TAB 4: KWALITEIT & COMPLIANCE ── */}
        {adminTab==="compliance"&&(
          <div>
            <div style={grid3}>
              <AdminKPICard icon="🕵️" label="Anonieme Frontsheets" value="82%" sub="van alle gegenereerde" trend="↑ 6%" color="#a78bfa"/>
              <AdminKPICard icon="📸" label="Foto's gedetecteerd & verwijderd" value="14" sub="door AI waarschuwingssysteem" color="#fbbf24"/>
              <AdminKPICard icon="✅" label="API Fouten (429)" value="0" sub="deze maand" trend="Schoon 🎉" color="#34d399" onClick={()=>setAdminDetailView("fouten")}/>
              <AdminKPICard icon="🛡️" label="Voorkomen Dubbele Analyses (Cache)" value="341" sub="API-calls bespaard" trend="28% bespaard" color="#22d3ee" onClick={()=>setAdminDetailView("cache")}/>
              <AdminKPICard icon="🧠" label="AI Nauwkeurigheid / Feedback" value="94% Positief" sub="op basis van consultant feedback" trend="↑ 3%" color="#34d399" onClick={()=>setAdminDetailView("feedback")}/>
              <AdminKPICard icon="💾" label="DEMO-modus analyses" value="189" sub="token-vrij getest" color={accent}/>
              <AdminKPICard icon="🔐" label="Login succespercentage" value="99,1%" sub="2 geblokkeerde pogingen" trend="Veilig" color="#34d399"/>
              <AdminKPICard icon="🏥" label="GDPR — Geanonimiseerd" value="261" sub="profielen zonder naam" color="#f472b6"/>
            </div>
            <AdminCard style={{marginBottom:12}}>
              <AdminSectionHeader>🚨 Systeem Notificaties & Compliance Log</AdminSectionHeader>
              <AdminAlertRow icon="✅" title="Geen API-fouten gedetecteerd deze maand" sub="Alle 1.204 analyses voltooide zonder HTTP 429 of 5xx errors. DEMO_MODUS heeft 189 calls onderschept." color="rgba(52,211,153,0.9)"/>
              <AdminAlertRow icon="📸" title="14 profielfoto's gemarkeerd door AI" sub="AI-waarschuwingssysteem detecteerde '[image]', '.jpg' of 'foto' in ruwe CV-tekst. Consultants kregen oranje melding." color="rgba(251,191,36,0.9)"/>
              <AdminAlertRow icon="🕵️" title="261 van 318 frontsheets geanonimiseerd verstuurd (82%)" sub="Kandidaatnaam vervangen door CRM-ID. Alle bedrijfsnamen omgezet naar 'Bedrijf A/B/C'. GDPR-compliant." color="rgba(167,139,250,0.9)"/>
              <AdminAlertRow icon="🔐" title="2 ongeautoriseerde inlogpogingen geblokkeerd" sub="Domeinen buiten de whitelist geweigerd via ALLOWED_DOMAINS check." color="rgba(248,113,113,0.9)"/>
            </AdminCard>
            <div style={grid2}>
              <AdminCard>
                <AdminSectionHeader>📊 AI Nauwkeurigheid (steekproef n=50)</AdminSectionHeader>
                <AdminProgressBar pct={94} label="Juiste skill-matches"             value="94%" color="#34d399"/>
                <AdminProgressBar pct={89} label="Correcte rol-identificatie"        value="89%" color={accent}/>
                <AdminProgressBar pct={97} label="Contactgegevens correct"           value="97%" color="#34d399"/>
                <AdminProgressBar pct={91} label="Bedrijven correct geanonimiseerd"  value="91%" color="#a78bfa"/>
                <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:40,height:40,borderRadius:12,background:"rgba(52,211,153,0.12)",border:"1px solid rgba(52,211,153,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🎯</div>
                  <div>
                    <p style={{fontSize:14,fontWeight:700,color:"rgba(52,211,153,0.95)",margin:"0 0 2px"}}>Gemiddeld 92,8% nauwkeurig</p>
                    <p style={{fontSize:11,color:"rgba(255,255,255,0.3)",margin:0,fontWeight:400}}>Op basis van consultant feedback & handmatige steekproef</p>
                  </div>
                </div>
              </AdminCard>
              <AdminCard>
                <AdminSectionHeader>🛡️ Data Governance Samenvatting</AdminSectionHeader>
                {[
                  ["Geen data opgeslagen op Anthropic servers",    "✅","#34d399"],
                  ["API-sleutel alleen client-side in geheugen",   "✅","#34d399"],
                  ["Supabase end-to-end encrypted (SSL)",          "✅","#34d399"],
                  ["Profieldata na sessie gewist (geen cookies)",  "✅","#34d399"],
                  ["GDPR Art. 25 — Privacy by Design",             "✅","#34d399"],
                  ["Anonimisering voor doorsturen aan klant",      "✅","#34d399"],
                  ["Candidate consent tracking",                   "⚠️","#fbbf24"],
                  ["ISO 27001 certificering",                      "🔜","rgba(148,163,184,0.6)"],
                ].map(([item,icon,color])=>(
                  <div key={item} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                    <span style={{fontSize:14,flexShrink:0,width:20,textAlign:"center"}}>{icon}</span>
                    <span style={{fontSize:12,color:"rgba(255,255,255,0.65)",flex:1,fontWeight:400}}>{item}</span>
                  </div>
                ))}
              </AdminCard>
            </div>
          </div>
        )}
  
        {/* ── TAB 5: TEAM GEMS KENNISBANK ── */}
        {adminTab==="gems"&&(()=>{
          const allGems = gems || [];
          const TEAMS_G = isSuper
            ? ["Morgan Green","Morgan Black","Morgan Lab"]
            : [lockedTeam]; // label-admins see only their own team
          const shared = allGems.filter(g=>g.isShared&&g.team===(lockedTeam||gemFilter));
          return (
            <div>
              {/* Stats */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:12,marginBottom:18}}>
                {[
                  ["💎", allGems.filter(g=>g.isShared).length+" gedeeld",  "Gedeelde Gems",       accent],
                  ["🔒", allGems.filter(g=>!g.isShared).length+" privé",   "Privé opgeslagen",    accent],
                  ["✍️", [...new Set(allGems.filter(g=>g.isShared).map(g=>g.author))].length+" consultants","Bijdragers", "rgba(255,255,255,0.6)"],
                ].map(([icon,val,lbl,c])=>(
                  <div key={lbl} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"13px 16px",display:"flex",gap:10,alignItems:"center"}}>
                    <span style={{fontSize:18}}>{icon}</span>
                    <div>
                      <p style={{fontSize:16,fontWeight:700,color:c,margin:0}}>{val}</p>
                      <p style={{fontSize:10,color:"rgba(255,255,255,0.28)",margin:0,textTransform:"uppercase",letterSpacing:0.4,lineHeight:1.4}}>{lbl}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Segmented team filter — only shown to SUPER admins */}
              {isSuper && (
              <div style={{display:"flex",gap:6,background:"rgba(255,255,255,0.04)",borderRadius:12,padding:5,border:"1px solid rgba(255,255,255,0.07)",marginBottom:18,width:"fit-content"}}>
                {TEAMS_G.map(t=>(
                  <button key={t} onClick={()=>setGemFilter(t)}
                    style={{padding:"7px 16px",borderRadius:9,border:"none",background:gemFilter===t?"rgba(255,255,255,0.1)":"transparent",color:gemFilter===t?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.4)",fontSize:12,fontWeight:gemFilter===t?600:400,cursor:"pointer",transition:"all 0.18s",whiteSpace:"nowrap"}}>
                    {t}
                  </button>
                ))}
              </div>
              )}
              {!isSuper && (
                <div style={{marginBottom:14,padding:"8px 14px",background:roleMeta.color+"10",border:`1px solid ${roleMeta.color}28`,borderRadius:10,display:"inline-flex",alignItems:"center",gap:7}}>
                  <span style={{fontSize:11,fontWeight:600,color:roleMeta.color,letterSpacing:0.6,textTransform:"uppercase"}}>{lockedTeam}</span>
                  <span style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>— alleen jouw team</span>
                </div>
              )}
              {/* Grid */}
              {shared.length===0 ? (
                <AdminCard>
                  <div style={{textAlign:"center",padding:"32px 0"}}>
                    <p style={{fontSize:26,margin:"0 0 8px"}}>💎</p>
                    <p style={{fontSize:13,color:"rgba(255,255,255,0.35)",margin:0}}>Geen gedeelde Gems voor {gemFilter}.</p>
                  </div>
                </AdminCard>
              ) : (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
                  {shared.map(g=>{
                    const tc = GEM_TYPE_COLOR[g.type]||GEM_TYPE_COLOR["Belscript"];
                    const isOpen = openGem===g.id;
                    return (
                      <div key={g.id} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${isOpen?tc.border:"rgba(255,255,255,0.08)"}`,borderRadius:16,overflow:"hidden",transition:"border-color 0.2s"}}>
                        <button onClick={()=>setOpenGem(isOpen?null:g.id)}
                          style={{width:"100%",padding:"14px 16px",background:"transparent",border:"none",cursor:"pointer",display:"flex",gap:12,alignItems:"flex-start",textAlign:"left"}}>
                          <span style={{fontSize:20,flexShrink:0,marginTop:1}}>{tc.icon}</span>
                          <div style={{flex:1,minWidth:0}}>
                            <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.88)",margin:"0 0 5px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.title}</p>
                            <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                              <span style={{fontSize:10,padding:"1px 7px",borderRadius:9999,background:tc.bg,border:`1px solid ${tc.border}`,color:tc.color,fontWeight:500}}>{g.type}</span>
                              <span style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>✍️ {g.author}</span>
                              <span style={{fontSize:10,color:"rgba(255,255,255,0.22)"}}>{g.date}</span>
                            </div>
                          </div>
                          <span style={{fontSize:10,color:"rgba(255,255,255,0.22)",flexShrink:0,display:"inline-block",transform:isOpen?"rotate(180deg)":"none",transition:"transform 0.2s",marginTop:4}}>▼</span>
                        </button>
                        {isOpen&&(
                          <div style={{padding:"0 14px 14px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                            <div style={{background:"rgba(0,0,0,0.35)",borderRadius:10,padding:"12px 14px",marginTop:10,position:"relative"}}>
                              <pre style={{fontSize:11,color:"rgba(255,255,255,0.6)",margin:0,whiteSpace:"pre-wrap",lineHeight:1.65,fontFamily:"Inter,sans-serif",paddingRight:80}}>{g.content}</pre>
                              <button onClick={()=>{navigator.clipboard?.writeText(g.content);setGemCopied(g.id);setTimeout(()=>setGemCopied(null),2000);}}
                                style={{position:"absolute",top:8,right:8,background:gemCopied===g.id?"rgba(52,211,153,0.15)":"rgba(255,255,255,0.07)",border:`1px solid ${gemCopied===g.id?"rgba(52,211,153,0.3)":"rgba(255,255,255,0.12)"}`,color:gemCopied===g.id?"rgba(52,211,153,0.9)":"rgba(255,255,255,0.4)",borderRadius:9999,padding:"3px 9px",fontSize:11,cursor:"pointer",transition:"all 0.18s",whiteSpace:"nowrap"}}>
                                {gemCopied===g.id?"✓":"📋"}
                              </button>
                            </div>
                            <div style={{marginTop:10,display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:tc.bg,border:`1px solid ${tc.border}`,borderRadius:9}}>
                              <span style={{fontSize:13}}>⭐</span>
                              <p style={{fontSize:11,color:"rgba(255,255,255,0.6)",margin:0}}>Gedeeld door <strong style={{color:tc.color}}>{g.author}</strong> — een top bijdrage voor het team!</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
  
        {/* ── Detail Modal ── */}
        <AdminDetailModal view={adminDetailView} onClose={()=>{setAdminDetailView(null);setSelectedCompany(null);}} accent={accent} uurloon={uurloon} setUurloon={setUurloon} selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany}/>
  
      </div>
    );
  }
  
  export default function Root() {
    return <ErrorBoundary><App /></ErrorBoundary>;
  }
  image/png;base64,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";

//