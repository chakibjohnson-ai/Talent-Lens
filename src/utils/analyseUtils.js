import { VERTICAL_COLORS, DEFAULT_V, REGIO_NOORD, REGIO_ZUID, NOORD_CITIES, ZUID_CITIES } from '../constants/appConstants';

// ── Vertical colour lookup ───────────────────────────────────────────────────
export function vColor(v) {
  return VERTICAL_COLORS[v] || DEFAULT_V;
}

// ── Regio detection from location string ────────────────────────────────────
export function detectRegio(loc) {
  if (!loc) return null;
  const l = loc.toLowerCase();
  if (REGIO_NOORD.some(r => l.includes(r.toLowerCase()))) return "Noord";
  if (REGIO_ZUID.some(r  => l.includes(r.toLowerCase()))) return "Zuid";
  if (NOORD_CITIES.some(c => l.includes(c))) return "Noord";
  if (ZUID_CITIES.some(c  => l.includes(c))) return "Zuid";
  return null;
}

// ── System prompt builder (injects taxonomy lists) ───────────────────────────
export function buildSystemPrompt(bron, skills, verticals, roles, industries) {
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
{"name":null,"current_role":null,"location":null,"total_years_experience":null,"matched_skills":[{"item":null,"related_vertical":null,"reasoning":null}],"suggested_skills":[{"item":null,"related_vertical":null,"reasoning":null}],"matched_verticals":[{"item":null,"reasoning":null}],"suggested_verticals":[{"item":null,"reasoning":null}],"matched_roles":[{"item":null,"related_vertical":null,"reasoning":null}],"suggested_roles":[{"item":null,"related_vertical":null,"reasoning":null}],"matched_industries":[{"item":null,"reasoning":null}],"suggested_industries":[{"item":null,"reasoning":null}],"languages":[],"education":[],"general_comments":null,"contact":{"email":null,"phone":null,"linkedin_url":null}}

Definities:
- matched_*: EXPLICIET in profiel vermeld. reasoning = max 5 woorden bewijs.
- suggested_*: WAARSCHIJNLIJK van toepassing, niet expliciet. reasoning = max 5 woorden redenering.
- related_vertical: EXACT één term uit VERTICALS-lijst, of null.
- total_years_experience: getal (referentiejaar = 2026).
- general_comments: max 2 zinnen, Nederlands.
- contact: ALLEEN uit tekst, anders null.
- languages: gesproken/geschreven talen als array van strings (bijv. ["Nederlands","Engels"]), anders [].
- education: opleidingen/diploma's als array van strings (bijv. ["HBO Biologie, HAN 2015"]), anders [].

🇳🇱 TAALREGEL: Alle tekst ALTIJD in het Nederlands.`;
}

// ── CV tekst opschoner (pre-processing voor kostenbesparing) ─────────────────
export function cleanCVText(rawText) {
  if (!rawText) return "";
  return rawText
    .replace(/[ \t]+/g, " ")                          // meerdere spaties/tabs → 1 spatie
    .replace(/\n{3,}/g, "\n\n")                        // 3+ lege regels → max 2
    .replace(/[^\S\n]*\n[^\S\n]*/g, "\n")              // spaties rondom newlines
    .replace(/[^\x20-\x7E\n\r\u00C0-\u024F]/g, " ")   // onnodige speciale karakters
    .replace(/ +/g, " ")                               // dubbele spaties na vorige stap
    .trim();
}

// ── Vereenvoudigde CV system prompt (Haiku-geoptimaliseerd) ──────────────────
export function buildCVSystemPrompt() {
  return `Je bent een CV-analist. Analyseer de CV-tekst en retourneer UITSLUITEND een geldig JSON-object, zonder markdown-formatting, backticks of extra tekst.

Schema (gebruik exact dit formaat):
{"korte_samenvatting":"string","werkervaring_jaren":number,"opleidingen":["string"],"talen":["string"],"hard_skills":["string"],"soft_skills":["string"]}

Regels:
- korte_samenvatting: max 2 zinnen in het Nederlands
- werkervaring_jaren: totale jaren werkervaring als getal (referentiejaar 2026), ontbreekt = null
- opleidingen: volledige opleiding/diploma namen
- talen: gesproken of geschreven talen
- hard_skills: technische vaardigheden, tools, certificaten, software
- soft_skills: interpersoonlijke en persoonlijke vaardigheden
- Lege arrays als [], ontbrekende waarden als null
- Retourneer ALLEEN de JSON, geen uitleg`;
}

// ── Robust JSON parser (4-pass repair strategy) ─────────────────────────────
export function parseJSON(txt) {
  if (!txt) return null;

  // Pass 0: strip markdown code fences
  let s = txt.replace(/```[\w]*\n?/g, "").replace(/```/g, "").trim();

  // Extract outermost JSON object
  const start = s.indexOf("{");
  const end   = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  s = s.slice(start, end + 1);

  // Basic repairs
  s = s.replace(/^\{\s*\{/, "{");
  s = s.replace(/[\u201C\u201D\u201E\u201F]/g, '"').replace(/[\u2018\u2019\u201A\u201B]/g, "'");
  s = s.replace(/,(\s*[}\]])/g, "$1");

  // Pass 1: direct parse
  try { return JSON.parse(s); } catch {}

  // Pass 2: char-by-char escape repair
  try {
    const VALID_ESCAPES = new Set(['"','\\','/','b','f','n','r','t','u']);
    let out = ""; let inStr = false; let esc = false;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (esc) {
        if (inStr && !VALID_ESCAPES.has(c)) { out = out.slice(0, -1) + "\\\\"; }
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
    out = out.replace(/,(\s*[}\]])/g, "$1");
    return JSON.parse(out);
  } catch {}

  // Pass 3: aggressive whitespace strip
  try {
    const s3 = s.replace(/\r?\n/g, " ").replace(/[\x00-\x1F\x7F]/g, " ").replace(/,(\s*[}\]])/g, "$1");
    return JSON.parse(s3);
  } catch {}

  // Pass 4: regex repair on string values
  try {
    const s4 = s.replace(/"((?:[^"\\]|\\.)*)"/g, (_match, inner) => {
      const fixed = inner.replace(/\r?\n/g, "\\n").replace(/\t/g, "\\t").replace(/[\x00-\x1F\x7F]/g, " ");
      return '"' + fixed + '"';
    }).replace(/,(\s*[}\]])/g, "$1");
    return JSON.parse(s4);
  } catch { return null; }
}
