export const DOMAIN_THEMES = {
  "morgangreen.nl": {
    bg:           "linear-gradient(170deg,#0B1F0E 0%,#0F2714 40%,#0A1A0C 100%)",
    accent:       "#4DC87A",
    accentDark:   "#217A40",
    accentMid:    "#2FA854",
    accentGlow:   "rgba(77,200,122,0.3)",
    accentFaint:  "rgba(77,200,122,0.07)",
    accentBorder: "rgba(77,200,122,0.2)",
    badge:        "rgba(77,200,122,0.08)",
    badgeBorder:  "rgba(77,200,122,0.2)",
    badgeText:    "rgba(77,200,122,0.9)",
    dot:          "#4DC87A",
    btnGrad:      "linear-gradient(135deg,#217A40,#2FA854)",
    progressGrad: "linear-gradient(90deg,#217A40,#2FA854,#6EE89A)",
    tabActive:    "#4DC87A",
    histHover:    "rgba(77,200,122,0.06)",
    histActive:   "rgba(77,200,122,0.09)",
    histBorder:   "rgba(77,200,122,0.28)",
    scrollThumb:  "rgba(77,200,122,0.2)",
    label:        "Morgan Green",
  },
  "morganlab.nl": {
    bg:           "linear-gradient(170deg,#060E14 0%,#091520 40%,#050C12 100%)",
    accent:       "#00C2DE",
    accentDark:   "#006A7A",
    accentMid:    "#008FA5",
    accentGlow:   "rgba(0,194,222,0.28)",
    accentFaint:  "rgba(0,194,222,0.06)",
    accentBorder: "rgba(0,194,222,0.18)",
    badge:        "rgba(0,194,222,0.07)",
    badgeBorder:  "rgba(0,194,222,0.18)",
    badgeText:    "rgba(0,194,222,0.9)",
    dot:          "#00C2DE",
    btnGrad:      "linear-gradient(135deg,#006A7A,#008FA5)",
    progressGrad: "linear-gradient(90deg,#006A7A,#00A8C2,#67E8F9)",
    tabActive:    "#00C2DE",
    histHover:    "rgba(0,194,222,0.05)",
    histActive:   "rgba(0,194,222,0.08)",
    histBorder:   "rgba(0,194,222,0.28)",
    scrollThumb:  "rgba(0,194,222,0.2)",
    label:        "Morgan Lab",
  },
  "morganblack.nl": {
    bg:           "linear-gradient(170deg,#080808 0%,#111111 50%,#0A0A0A 100%)",
    accent:       "#C8C8C8",
    accentDark:   "#555555",
    accentMid:    "#888888",
    accentGlow:   "rgba(200,200,200,0.15)",
    accentFaint:  "rgba(255,255,255,0.04)",
    accentBorder: "rgba(255,255,255,0.1)",
    badge:        "rgba(255,255,255,0.04)",
    badgeBorder:  "rgba(255,255,255,0.1)",
    badgeText:    "rgba(255,255,255,0.5)",
    dot:          "#888888",
    btnGrad:      "linear-gradient(135deg,#333333,#555555)",
    progressGrad: "linear-gradient(90deg,#333333,#777777,#CCCCCC)",
    tabActive:    "#C8C8C8",
    histHover:    "rgba(255,255,255,0.03)",
    histActive:   "rgba(255,255,255,0.05)",
    histBorder:   "rgba(255,255,255,0.15)",
    scrollThumb:  "rgba(255,255,255,0.12)",
    label:        "Morgan Black",
  },
  "morganrecruitment.nl": {
    bg:           "linear-gradient(170deg,#060C18 0%,#0A1428 40%,#060B16 100%)",
    accent:       "#5B9BF0",
    accentDark:   "#1E4A9E",
    accentMid:    "#2E64D4",
    accentGlow:   "rgba(91,155,240,0.3)",
    accentFaint:  "rgba(91,155,240,0.07)",
    accentBorder: "rgba(91,155,240,0.2)",
    badge:        "rgba(91,155,240,0.08)",
    badgeBorder:  "rgba(91,155,240,0.2)",
    badgeText:    "rgba(91,155,240,0.9)",
    dot:          "#5B9BF0",
    btnGrad:      "linear-gradient(135deg,#1E4A9E,#2E64D4)",
    progressGrad: "linear-gradient(90deg,#1E4A9E,#2E64D4,#7BB3F8)",
    tabActive:    "#5B9BF0",
    histHover:    "rgba(91,155,240,0.06)",
    histActive:   "rgba(91,155,240,0.09)",
    histBorder:   "rgba(91,155,240,0.28)",
    scrollThumb:  "rgba(91,155,240,0.2)",
    label:        "Morgan Recruitment",
  },
};

export const DEFAULT_THEME    = DOMAIN_THEMES["morgangreen.nl"];
export const ALLOWED_DOMAINS  = Object.keys(DOMAIN_THEMES);

// API key uit .env (VITE_ANTHROPIC_API_KEY) — nooit hardcoden in broncode
export const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || "";

// Banners — gehost in Supabase Storage (app-assets/Afbeeldingen/)
export const DOMAIN_BANNER = {
  "morgangreen.nl":      "https://cebpwkavlxipkrqixbab.supabase.co/storage/v1/object/public/app-assets/Afbeeldingen/LinkedIn%20Banner%20Morgan%20Green.png",
  "morganlab.nl":        "https://cebpwkavlxipkrqixbab.supabase.co/storage/v1/object/public/app-assets/Afbeeldingen/LinkedIn%20Banner%20Morgan%20Lab.png",
  "morganblack.nl":      "https://cebpwkavlxipkrqixbab.supabase.co/storage/v1/object/public/app-assets/Afbeeldingen/LinkedIn%20Banner%20Morgan%20Black.png",
  "morganrecruitment.nl":"https://cebpwkavlxipkrqixbab.supabase.co/storage/v1/object/public/app-assets/Afbeeldingen/Linkedin%20Banner%20MRG.png",
};

// Top nav
export const NAV_ITEMS = [
  { id: "dashboard", label: "📊 Dashboard" },
];

// Workspace-items — flat, direct bereikbaar vanuit sidebar
export const WORKSPACE_ITEMS = [
  { id: "analyse",      label: "🔍 Analyse" },
  { id: "geschiedenis", label: "🕒 Geschiedenis" },
  { id: "folder",       label: "📁 Folder" },
  { id: "vacature",     label: "🎯 Vacature" },
  { id: "boolean",        label: "⚡ Boolean" },
  { id: "frontsheet",     label: "📄 Frontsheet" },
  { id: "outreach",       label: "✍️ Outreach" },
  { id: "profile-scout",  label: "🎯 Profile Scout" },
];

// Onderste nav-item (mt-auto in sidebar)
export const BOTTOM_ITEMS = [
  { id: "instellingen", label: "⚙️ Instellingen" },
];

// Legacy export
export const INTELLIGENCE_ITEMS = WORKSPACE_ITEMS;

// Full vertical color palette — bg, border, color, dot
export const VERTICAL_COLORS = {
  "Quality":                { bg:"rgba(6,182,212,0.10)",   border:"rgba(6,182,212,0.28)",   color:"#22d3ee",            dot:"#22d3ee"  },
  "Maintenance":            { bg:"rgba(249,115,22,0.10)",  border:"rgba(249,115,22,0.28)",  color:"#fb923c",            dot:"#fb923c"  },
  "Engineering":            { bg:"rgba(56,189,248,0.10)",  border:"rgba(56,189,248,0.28)",  color:"rgba(56,189,248,0.9)",dot:"#38bdf8" },
  "Sales & Marketing":      { bg:"rgba(251,191,36,0.10)",  border:"rgba(251,191,36,0.28)",  color:"#fbbf24",            dot:"#fbbf24"  },
  "Operations":             { bg:"rgba(167,139,250,0.10)", border:"rgba(167,139,250,0.28)", color:"#a78bfa",            dot:"#a78bfa"  },
  "Medical & Clinical Affairs":{ bg:"rgba(244,114,182,0.10)",border:"rgba(244,114,182,0.28)",color:"#f472b6",           dot:"#f472b6"  },
  "Market Access":          { bg:"rgba(52,211,153,0.10)",  border:"rgba(52,211,153,0.28)",  color:"#34d399",            dot:"#34d399"  },
  "R&D":                    { bg:"rgba(192,132,252,0.10)", border:"rgba(192,132,252,0.28)", color:"#c084fc",            dot:"#c084fc"  },
  "Healthcare":             { bg:"rgba(129,140,248,0.10)", border:"rgba(129,140,248,0.28)", color:"#818cf8",            dot:"#818cf8"  },
  "Life Sciences":          { bg:"rgba(16,185,129,0.10)",  border:"rgba(16,185,129,0.28)",  color:"#10b981",            dot:"#10b981"  },
};

export const DEFAULT_V = {
  bg:     "rgba(148,163,184,0.1)",
  border: "rgba(148,163,184,0.25)",
  color:  "rgba(255,255,255,0.38)",
  dot:    "rgba(255,255,255,0.28)",
};

export const GEM_TYPE_COLOR = {
  "Belscript":  { bg:"rgba(34,211,238,0.1)",  border:"rgba(34,211,238,0.3)",  color:"#22d3ee", icon:"📞" },
  "Frontsheet": { bg:"rgba(251,191,36,0.1)",  border:"rgba(251,191,36,0.3)",  color:"#fbbf24", icon:"📄" },
  "Boolean":    { bg:"rgba(167,139,250,0.1)", border:"rgba(167,139,250,0.3)", color:"#a78bfa", icon:"🔎" },
  "Interview":  { bg:"rgba(52,211,153,0.1)",  border:"rgba(52,211,153,0.3)",  color:"#34d399", icon:"🎯" },
};

export const STAT_CARDS = [
  { label: "Kandidaten", value: "1,248", icon: "👥" },
  { label: "Matches",    value: "842",   icon: "🎯" },
];

// DAILY_FACTS verwijderd — feiten worden nu live geladen via supabase.rpc('get_random_fact')
// Zie: src/components/AnalyseView.jsx → fetchRandomFact()

export const REGIO_NOORD = ["Noord-Holland","Groningen","Friesland","Flevoland","Utrecht","Drenthe"];
export const REGIO_ZUID  = ["Zuid-Holland","Overijssel","Noord-Brabant","Limburg","Gelderland"];
export const NOORD_CITIES = ["amsterdam","haarlem","alkmaar","zaandam","hilversum","almere","lelystad","amersfoort","utrecht","groningen","leeuwarden","assen","emmen"];
export const ZUID_CITIES  = ["rotterdam","den haag","leiden","delft","dordrecht","zwolle","enschede","eindhoven","tilburg","breda","maastricht","nijmegen","arnhem","apeldoorn","venlo"];

export const DEMO_MODUS = false;

// Interne sub-tabs van AnalyseView (boolean + frontsheet zijn nu top-level routes)
export const TABS = [
  { id: "analyse",  label: "🔍 Analyse" },
  { id: "history",  label: "📋 Geschiedenis" },
  { id: "folder",   label: "📁 Folder" },
  { id: "vacature", label: "💼 Vacatures" },
];
