import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ProfileCard } from './ProfileCard';
import { SaveGemModal } from './SaveGemModal';
import { buildSystemPrompt, parseJSON, vColor } from '../utils/analyseUtils';
import {
  VERTICAL_COLORS, DEMO_MODUS,
  ANTHROPIC_API_KEY,
} from '../constants/appConstants';
import { supabase } from '../lib/supabaseClient';
import { validateAndSaveAnalysis, fetchAllAnalyses, lockAnalysis } from '../services/analysisService';
import { generateOutreach, fetchMarketData, fetchWritingStyle, CHANNELS, FILTER_TYPES } from '../services/ghostwriterService';
import { uploadAndCreateJob, subscribeToJobs, unsubscribeFromJobs } from '../services/cvUploadService';

function Spin() {
  return <span style={{display:"inline-block",width:11,height:11,border:"2px solid rgba(255,255,255,0.25)",borderTopColor:"white",borderRadius:"50%",animation:"s 0.7s linear infinite",marginRight:6}}/>;
}

// Toont bedrijfslogo; bij laad-fout of ontbrekende URL → letter-avatar
function LogoAvatar({ url, name, size = 36 }) {
  const [failed, setFailed] = useState(false);
  const letter = (name || "?").charAt(0).toUpperCase();
  const r = Math.round(size * 0.22);
  if (!url || failed) {
    return (
      <div style={{
        width:size, height:size, borderRadius:r,
        background:"rgba(77,200,122,0.15)", border:"1px solid rgba(77,200,122,0.3)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:Math.round(size * 0.44), fontWeight:700, color:"#4DC87A", flexShrink:0,
      }}>
        {letter}
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={name || "logo"}
      onError={() => setFailed(true)}
      style={{width:size, height:size, objectFit:"contain", borderRadius:r,
              background:"rgba(255,255,255,0.08)", padding:Math.round(size*0.1), flexShrink:0}}
    />
  );
}

export function AnalyseView({ user, crmSkills, verticals: verList, roles, industries, gems, setGems, history, setHistory, onGoToInstellingen, activeSubTab }) {
  const T      = user?.theme || {};
  const accent = T.accent || "#4DC87A";

  // Subscription gate — tester, actief Stripe-abonnement of Enterprise domein
  const hasAccess = !!(
    user?.profile?.is_tester ||
    user?.profile?.subscription_status === 'active' ||
    user?.profile?.org_id
  );

  const [showGemModal, setShowGemModal] = useState(false);
  const [gemToSave, setGemToSave]       = useState(null);
  const [tab, setTab]                   = useState(activeSubTab || "analyse");

  // Sync internal tab state when sidebar navigation changes activeSubTab
  useEffect(() => { if (activeSubTab) setTab(activeSubTab); }, [activeSubTab]);

  // Laad analyses uit DB op mount — hydreer history + toon meest recente als result
  useEffect(() => {
    if (!user) return;
    fetchAllAnalyses().then(rows => {
      if (rows.length === 0) return;
      setHistory(rows);
      setResult(prev => prev || rows[0]);
    });
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Realtime listener voor actieve CV-analyse jobs ──────────────────────────
  // Zodra alle jobs de status 'completed' of 'error' hebben, stopt de loader.
  useEffect(() => {
    if (!cvJobs.length || !user?.id) return;

    // Verwijder eventueel bestaand kanaal
    if (realtimeChannelRef.current) {
      unsubscribeFromJobs(realtimeChannelRef.current);
    }

    const jobIds = cvJobs.map(j => j.id);

    const channel = subscribeToJobs(user.id, jobIds, (updatedJob) => {
      if (updatedJob.status === 'completed' && updatedJob.result_data) {
        const simple = updatedJob.result_data;

        // Map backend-schema → ProfileCard-compatibele structuur
        const parsed = {
          name:                   updatedJob.file_name.replace(/\.[^.]+$/, ""),
          total_years_experience: simple.werkervaring_jaren,
          general_comments:       simple.korte_samenvatting || null,
          education:              simple.opleidingen || [],
          languages:              simple.talen || [],
          matched_skills:    (simple.hard_skills || []).map(s => ({ item: s, related_vertical: null, reasoning: null })),
          suggested_skills:  (simple.soft_skills || []).map(s => ({ item: s, related_vertical: null, reasoning: null })),
          matched_verticals: [], suggested_verticals: [],
          matched_roles:     [], suggested_roles: [],
          matched_industries:[], suggested_industries:[],
          contact: {},
        };

        const key = `cv_job_${updatedJob.id}`;
        setCvResults(prev => prev.map(cr =>
          cr.jobId === updatedJob.id ? { ...cr, result: parsed, error: null } : cr
        ));
        setHistory(h => [{ key, ...parsed, savedAt: Date.now(), source: "cv" }, ...h]);
        validateAndSaveAnalysis({ type: 'cv', data: parsed }).catch(e =>
          console.warn('[TL] save CV analyse fout:', e)
        );

      } else if (updatedJob.status === 'error') {
        setCvResults(prev => prev.map(cr =>
          cr.jobId === updatedJob.id
            ? { ...cr, result: null, error: updatedJob.error_message || 'Analyse mislukt op de server.' }
            : cr
        ));
      }

      // Vernieuw de jobs-lijst; stop de loader als alles klaar is
      setCvJobs(prev => {
        const updated = prev.map(j => j.id === updatedJob.id ? updatedJob : j);
        const allDone = updated.every(j => j.status === 'completed' || j.status === 'error');
        if (allDone) {
          setLoading(false);
          setProgress(100);
          setAnalyseStatus("");
          setTimeout(() => setProgress(0), 500);
          if (realtimeChannelRef.current) {
            unsubscribeFromJobs(realtimeChannelRef.current);
            realtimeChannelRef.current = null;
          }
        }
        return updated;
      });
    });

    realtimeChannelRef.current = channel;

    // Cleanup bij unmount of nieuwe jobs-batch
    return () => {
      if (realtimeChannelRef.current) {
        unsubscribeFromJobs(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
    };
  }, [cvJobs.map(j => j.id).join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  // Analyse state
  const [src, setSrc]                   = useState("linkedin");
  const [profileText, setProfileText]   = useState("");
  const [cvFiles, setCvFiles]           = useState([]);   // raw File objecten
  const [cvResults, setCvResults]       = useState([]);
  const [cvJobs, setCvJobs]             = useState([]);   // actieve analyse-jobs
  const realtimeChannelRef              = useRef(null);
  const [loading, setLoading]           = useState(false);
  const [progress, setProgress]         = useState(0);
  const [analyseStatus, setAnalyseStatus] = useState("");
  const [fact, setFact]                 = useState("");
  const [result, setResult]             = useState(null);
  const [analyseErr, setAnalyseErr]     = useState("");

  // Folder filters
  const [fLoc, setFLoc]           = useState("");
  const [fRadius, setFRadius]     = useState("landelijk");
  const [fVertical, setFVertical] = useState("");
  const [fRol, setFRol]           = useState("");
  const [fActive, setFActive]     = useState(false);

  // Vacature
  const [vacUrl, setVacUrl]             = useState("");
  const [vacScanLoading, setVacScanLoading] = useState(false);
  const [vacText, setVacText]           = useState("");
  const [vacLoading, setVacLoading]     = useState(false);
  const [vacResult, setVacResult]       = useState(null);
  const [vacErr, setVacErr]             = useState("");
  const [vacExp, setVacExp]             = useState(null);
  const [belScripts, setBelScripts]     = useState({});
  const [vacCompany, setVacCompany]     = useState(null); // { name, logo_url } van scraper
  function setBel(i, patch) { setBelScripts(prev => ({ ...prev, [i]: { ...prev[i], ...patch } })); }

  // Markt Vergelijking
  const [marktData,    setMarktData]    = useState('');
  const [marktLoading, setMarktLoading] = useState(false);
  const [marktErr,     setMarktErr]     = useState('');

  // Outreach Generator
  const [outreachChannel,     setOutreachChannel]     = useState('LinkedIn Connect');
  const [outreachStyleSource, setOutreachStyleSource] = useState('filter');
  const [outreachFilterType,  setOutreachFilterType]  = useState('Warm');
  const [outreachText,        setOutreachText]        = useState('');
  const [outreachLoading,     setOutreachLoading]     = useState(false);
  const [outreachErr,         setOutreachErr]         = useState('');
  const [outreachCopied,      setOutreachCopied]      = useState(false);

  const [vacatureHistory] = useState([
    { id:1, title:"QA Manager — ISO 13485",         date:"Vandaag",  vertical:"QA/RA",       matches:12 },
    { id:2, title:"Field Service Engineer",          date:"Gisteren", vertical:"Engineering", matches:7  },
    { id:3, title:"Product Specialist MRI",          date:"Ma 9 jun", vertical:"Sales",       matches:9  },
    { id:4, title:"Clinical Application Specialist", date:"Vr 6 jun", vertical:"Healthcare",  matches:5  },
  ]);

  const filtered = useMemo(() => {
    if (!fActive && !fVertical && !fRol) return history;
    return history.filter(h => {
      const allVerts = [...(h.matched_verticals || []), ...(h.suggested_verticals || [])];
      const allRoles = [...(h.matched_roles    || []), ...(h.suggested_roles    || [])];
      const gi = x => typeof x === "object" ? x.item || "" : x || "";
      if (fVertical && !allVerts.some(x => gi(x).toLowerCase().includes(fVertical.toLowerCase()))) return false;
      if (fRol      && !allRoles.some(x  => gi(x).toLowerCase().includes(fRol.toLowerCase()))) return false;
      if (fLoc && fActive && !(h.location || "").toLowerCase().includes(fLoc.toLowerCase())) return false;
      return true;
    });
  }, [history, fVertical, fRol, fLoc, fActive]);

  const apiKey = user?.apiKey || ANTHROPIC_API_KEY;

  // ── Vertaal HTTP-statuscodes naar leesbare Nederlandse foutmeldingen ────────
  function apiErrorMessage(status, body) {
    const detail = body?.error?.message || "";
    if (status === 401) return `🔑 API key ongeldig of verlopen. Controleer je .env bestand. (401)`;
    if (status === 400) return `⚠️ Ongeldige aanvraag. ${detail} (400)`;
    if (status === 403) return `🚫 Toegang geweigerd. Controleer je API-rechten. (403)`;
    if (status === 413) return `📦 Invoer te groot. Probeer een kortere tekst. (413)`;
    if (status === 429) return `⏱️ Te veel aanvragen. Even wachten en opnieuw proberen. (429)`;
    if (status === 529) return `🔧 Anthropic servers overbelast. Probeer over een minuut opnieuw. (529)`;
    if (status >= 500)  return `🌐 Anthropic serverfout (${status}). Probeer opnieuw.`;
    return `Onbekende API-fout (HTTP ${status}). ${detail}`;
  }

  // ── Centrale fetch naar Anthropic — geeft direct geparsde data terug ────────
  async function callAPI(system, messages, maxTokens = 2000, useCaching = false) {
    if (!apiKey) throw new Error("🔑 Geen API key gevonden. Voeg VITE_ANTHROPIC_API_KEY toe aan je .env bestand.");

    console.log("[TL] callAPI →", {
      model: "claude-haiku-4-5-20251001",
      maxTokens,
      systemChars: JSON.stringify(system).length,
      userChars:   JSON.stringify(messages).length,
      apiKeySet:   !!apiKey,
      apiKeyPrefix: apiKey.slice(0, 16) + "…",
    });

    const headers = {
      "Content-Type":                             "application/json",
      "x-api-key":                                apiKey,
      "anthropic-dangerous-direct-browser-access":"true",
      "anthropic-version":                        "2023-06-01",
      ...(useCaching ? { "anthropic-beta": "prompt-caching-2024-07-31" } : {}),
    };

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:maxTokens, system, messages }),
    });

    // Body altijd uitlezen — ook bij foutresponse
    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      console.error("[TL] API fout:", resp.status, data);
      throw new Error(apiErrorMessage(resp.status, data));
    }

    console.log("[TL] API OK →", {
      stopReason:   data.stop_reason,
      inputTokens:  data.usage?.input_tokens,
      outputTokens: data.usage?.output_tokens,
    });

    return data;
  }

  // ── Haal een willekeurig feit op via Supabase RPC; lokale fallback als DB niet bereikbaar ──
  async function fetchRandomFact() {
    try {
      const { data, error } = await supabase.rpc('get_random_fact');
      if (!error && data) return data;
    } catch (_) { /* silent */ }
    const FB = [
      "Wist je dat 80% van de vacatures via netwerk worden ingevuld?",
      "Recruiters lezen een CV gemiddeld slechts 7 seconden.",
      "Bedrijven met diverse teams presteren 35% beter financieel.",
      "Het eerste CV ooit werd geschreven door Leonardo da Vinci in 1482.",
      "In 2025 creëert AI meer banen dan het verdringt — 97 miljoen vs 85 miljoen.",
    ];
    return FB[Math.floor(Math.random() * FB.length)];
  }

  async function analyse() {
    if (!hasAccess) { setAnalyseErr("🔒 Geen actieve licentie. Activeer een code via Instellingen."); return; }
    const isCv = src === "cv";
    if (!isCv && !profileText.trim()) { setAnalyseErr("Plak eerst profieltekst."); return; }
    if (isCv && cvFiles.length === 0)  { setAnalyseErr("Upload eerst een CV."); return; }
    setAnalyseErr(""); setResult(null); setCvResults([]);

    if (DEMO_MODUS) {
      setLoading(true); setProgress(0);
      let prog = 0;
      const t = setInterval(() => { prog += (88 - prog) * 0.045 + 0.3; setProgress(Math.min(88, Math.round(prog))); }, 300);
      await new Promise(r => setTimeout(r, 2000));
      clearInterval(t); setProgress(100);
      const demo = { name:"Demo Kandidaat", current_role:"Account Manager Medical Devices", location:"Utrecht", total_years_experience:5, matched_skills:[{item:"Medical Devices",related_vertical:"Sales & Marketing",reasoning:"expliciet vermeld"},{item:"B2B",related_vertical:"Sales & Marketing",reasoning:"alle posities B2B"}], suggested_skills:[{item:"Cold Calling",related_vertical:"Sales & Marketing",reasoning:"functies impliceren prospecting"}], matched_verticals:[{item:"Sales & Marketing",reasoning:"alle functies sales"}], suggested_verticals:[], matched_roles:[{item:"Sales",related_vertical:"Sales & Marketing",reasoning:"expliciete functies"}], suggested_roles:[], matched_industries:[{item:"Medical Devices",reasoning:"uitsluitend MD fabrikanten"}], suggested_industries:[], general_comments:"Demo-profiel. Zet DEMO_MODUS op false voor echte analyses.", contact:{email:"demo@morgangreen.nl",phone:null,linkedin_url:null} };
      if (isCv) {
        const res = cvFiles.map((f, i) => ({ key:`demo_cv_${i}`, file:f.name, result:{...demo,name:`Demo ${i+1} (${f.name.replace(/\.[^.]+$/,"")})`}, open:i===0 }));
        res.forEach(r => setHistory(h => [{ key:r.key, ...r.result, savedAt:Date.now(), source:"cv" }, ...h]));
        setCvResults(res);
      } else {
        setResult(demo);
        setHistory(h => [{ key:`demo_${Date.now()}`, ...demo, savedAt:Date.now(), source:src }, ...h]);
      }
      setTimeout(() => { setLoading(false); setProgress(0); }, 500);
      return;
    }

    fetchRandomFact().then(f => { if (f) setFact(f); });
    const factTimer = setInterval(() => { fetchRandomFact().then(f => { if (f) setFact(f); }); }, 10000);
    setLoading(true); setProgress(0); setAnalyseStatus("");

    // ── CV-flow: upload naar Storage → job aanmaken → wacht op Realtime ────────
    if (isCv) {
      const uploadedJobs = [];
      const initialResults = [];

      for (let i = 0; i < cvFiles.length; i++) {
        const file = cvFiles[i];
        setProgress(Math.round(((i + 0.5) / cvFiles.length) * 80));
        setAnalyseStatus(`CV ${i + 1} van ${cvFiles.length} uploaden...`);
        try {
          const job = await uploadAndCreateJob(file, user.id);
          uploadedJobs.push(job);
          // Voeg meteen een placeholder toe met jobId voor Realtime-koppeling
          initialResults.push({ key: `cv_job_${job.id}`, jobId: job.id, file: file.name, result: null, error: null, open: i === 0 });
          console.log("[TL] CV geüpload, job aangemaakt:", file.name, job.id);
        } catch (e) {
          console.error("[TL] CV upload mislukt:", file.name, e.message);
          initialResults.push({ key: `err_${i}`, jobId: null, file: file.name, result: null, error: e.message, open: true });
        }
      }

      setCvResults(initialResults);
      clearInterval(factTimer);

      // Als alle uploads mislukt zijn: reset loading direct en toon fouten
      if (uploadedJobs.length === 0) {
        setLoading(false);
        setProgress(0);
        setAnalyseStatus("");
        setAnalyseErr("Upload mislukt. Controleer je verbinding of gebruik LinkedIn-tekst als alternatief.");
        return;
      }

      setCvJobs(uploadedJobs);
      setProgress(90);
      // Loader blijft actief tot de Realtime useEffect alle jobs als 'done' markeert
      setAnalyseStatus("Verwerken op server… even geduld.");

      // Timeout-beveiliging: als de backend na 90s niet reageert, stop de loader
      setTimeout(() => {
        setLoading(prev => {
          if (prev) {
            setAnalyseErr("Server reageert niet. Is de backend gestart? (cd backend && npm run dev)");
            setAnalyseStatus("");
            setProgress(0);
          }
          return false;
        });
      }, 90_000);

      return;
    }

    // ── LinkedIn / Indeed flow: uitgebreid schema met vertical matching ───────
    const sys = [{
      type: "text",
      text: buildSystemPrompt(
        src === "indeed" ? "Indeed" : "LinkedIn",
        crmSkills.join(","), verList.join(","), roles.join(","), industries.join(",")
      ),
      cache_control: { type: "ephemeral" },
    }];

    let prog = 0;
    const progTimer = setInterval(() => { prog += (88 - prog) * 0.045 + 0.3; setProgress(Math.min(88, Math.round(prog))); }, 300);
    setAnalyseStatus("Profiel analyseren...");
    const done = () => {
      clearInterval(factTimer); clearInterval(progTimer);
      setProgress(100); setAnalyseStatus("Afronden...");
      setTimeout(() => { setLoading(false); setProgress(0); setAnalyseStatus(""); }, 500);
    };
    try {
      const d = await callAPI(sys, [
        { role:"user", content:`${src === "indeed" ? "Indeed" : "LinkedIn"} profiel:\n${profileText.trim()}` },
        { role:"assistant", content:"{" },
      ], 2000, true);
      let raw = d.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
      if (d.stop_reason === "max_tokens") {
        let depth = 0; let inStr = false; let esc = false;
        for (const c of ("{" + raw)) {
          if (esc) { esc = false; continue; }
          if (c === "\\" && inStr) { esc = true; continue; }
          if (c === '"') { inStr = !inStr; continue; }
          if (!inStr) { if (c === "{" || c === "[") depth++; else if (c === "}" || c === "]") depth--; }
        }
        for (let i = 0; i < depth; i++) raw += "}";
      }
      const txt = raw.trimStart().startsWith("{") ? raw : "{" + raw;
      const parsed = parseJSON(txt);
      if (!parsed) throw new Error("Kon JSON niet verwerken. Probeer opnieuw.");
      setResult(parsed);
      setHistory(h => [{ key:`p_${Date.now()}`, ...parsed, savedAt:Date.now(), source:src, raw_text:profileText.trim() }, ...h]);
      validateAndSaveAnalysis({ type: src, data: parsed }).catch(e => console.warn('[TL] save analyse fout:', e));
    } catch(e) { setAnalyseErr(e.message || "Onbekende fout"); }
    finally    { done(); }
  }

  async function matchVacature() {
    if (!hasAccess)           { setVacErr("🔒 Geen actieve licentie. Activeer een code via Instellingen."); return; }
    if (!vacText.trim())      { setVacErr("Plak een vacaturetekst."); return; }
    if (history.length === 0) { setVacErr("Geen kandidaten in geschiedenis."); return; }
    setVacErr(""); setVacLoading(true); setVacResult(null);
    try {
      // ── Stap A: Haal org-kandidaten op via RPC (max 30), fallback naar lokale history ──
      let pool = history;
      const orgId = user?.profile?.organization_id;
      if (orgId) {
        const { data: rpcCands, error: rpcErr } = await supabase.rpc('get_org_candidates', {
          p_org_id: orgId,
          p_limit:  30,
        });
        if (!rpcErr && rpcCands?.length) {
          pool = rpcCands.map(r => ({
            ...r,
            current_role:           r.job_title,
            total_years_experience: r.ai_analysis?.total_years_experience || null,
            matched_skills:         r.ai_analysis?.matched_skills         || [],
          }));
        }
      }
      const candidates = pool.slice(0, 30);

      // ── Stap B: Comprimeer elke kandidaat naar een korte string ──
      const compressed = candidates.map((c, i) => {
        const skills = (c.matched_skills || []).slice(0, 6)
          .map(s => (typeof s === "object" ? s.item : s))
          .filter(Boolean).join(",");
        const exp = c.total_years_experience ? `${c.total_years_experience}jr` : "?";
        return `${i + 1}|${c.name || "?"}|${c.current_role || "?"}|${exp}|${skills}`;
      }).join("\n");

      // ── Stap C: Stuur gecomprimeerde string + vacature naar Sonnet — retourneer alleen idx ──
      const sysPr = 'Je bent een expert recruiter. Gegeven een vacaturetekst en een kandidatenlijst, retourneer ALLEEN geldig JSON zonder uitleg: {"vacature":{"functie":null,"locatie":{"city":null,"region":null,"type":"unknown"},"sector":null,"vereiste_skills":[],"company":{"name":null,"logo_url":null}},"matches":[{"idx":1,"score":0,"reden":null}]}. LOCATIE-INSTRUCTIE: Als er een stad vermeld staat, vul city in en zet type op "city". Als er alleen een regio staat (bijv. "Randstad", "Noord-Holland"), laat city null en zet type op "region". Bij "remote" of "thuiswerken" zet type op "remote". Anders type "unknown". BEDRIJF-INSTRUCTIE: Extraheer de bedrijfsnaam uit de vacaturetekst. logo_url is altijd null (wordt apart bepaald). Sorteer matches op score aflopend.';
      const userMsg = `Vacature:\n${vacText.slice(0, 3000)}\n\nKandidaten (idx|naam|rol|exp|skills):\n${compressed}`;

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type":                              "application/json",
          "x-api-key":                                 apiKey,
          "anthropic-dangerous-direct-browser-access": "true",
          "anthropic-version":                         "2023-06-01",
        },
        body: JSON.stringify({
          model:      "claude-sonnet-4-6",
          max_tokens: 1200,
          system:     sysPr,
          messages:   [{ role:"user", content:userMsg }, { role:"assistant", content:"{" }],
        }),
      });
      const raw = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(apiErrorMessage(resp.status, raw));

      const txt = (raw.content?.filter(b => b.type === "text").map(b => b.text).join("") || "");
      const p   = parseJSON(txt.trimStart().startsWith("{") ? txt : "{" + txt);
      if (!p) throw new Error("Kon het antwoord niet verwerken. Probeer opnieuw.");

      // ── Stap D: Koppel idx-nummers terug aan volledige kandidaat-objecten ──
      const enrichedMatches = (p.matches || []).map(m => {
        const full = candidates[(m.idx || 1) - 1] || {};
        const sterke = (full.matched_skills || []).slice(0, 3)
          .map(s => (typeof s === "object" ? s.item : s)).filter(Boolean);
        return {
          naam:            full.name         || `Kandidaat ${m.idx}`,
          match_score:     m.score           || 0,
          reden:           m.reden           || null,
          sterke_punten:   sterke,
          aandachtspunten: [],
          aanbeveling:     m.reden           || null,
        };
      });

      const loc = p.vacature?.locatie || {};
      setVacResult({
        vacature_samenvatting: {
          functie:          p.vacature?.functie         || null,
          locatie:          loc.city || loc.region || null,
          location_structured: {
            city:   loc.city   || null,
            region: loc.region || null,
            type:   loc.type   || 'unknown',
          },
          kernvereisten:    p.vacature?.sector          || null,
          vereiste_skills:  p.vacature?.vereiste_skills || [],
          sector:           p.vacature?.sector          || null,
          company: {
            name:     p.vacature?.company?.name || null,
            logo_url: null, // wordt gezet via scraper metadata
          },
        },
        kandidaten: enrichedMatches,
      });
    } catch(e) { setVacErr(e.message || "Fout"); }
    finally    { setVacLoading(false); }
  }

  async function scanVacatureUrl() {
    const url = vacUrl.trim();
    if (!url) return;
    setVacErr("");
    setVacScanLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-vacancy", {
        body: { url },
      });
      if (error) throw new Error(error.message || "Edge function fout");
      if (data?.blocked) {
        setVacErr("Website blokkeert automatische scan, kopieer de tekst handmatig.");
        return;
      }
      if (data?.error) {
        setVacErr(data.error);
        return;
      }
      if (!data?.text) {
        setVacErr("Geen tekst gevonden op deze pagina.");
        return;
      }
      setVacText(data.text);
      // Sla scraper-metadata op voor gebruik in matchVacatureWithText
      if (data.metadata) setVacCompany(data.metadata);
      // Direct de analyse starten zodra de tekst is ingeladen
      setTimeout(() => matchVacatureWithText(data.text), 0);
    } catch (e) {
      setVacErr(e.message || "Scan mislukt. Kopieer de tekst handmatig.");
    } finally {
      setVacScanLoading(false);
    }
  }

  // Variant van matchVacature die een expliciete tekst accepteert (voor directe koppeling na scan)
  async function matchVacatureWithText(tekst) {
    if (!hasAccess)            { setVacErr("🔒 Geen actieve licentie. Activeer een code via Instellingen."); return; }
    if (!tekst?.trim())        { setVacErr("Geen vacaturetekst beschikbaar."); return; }
    if (history.length === 0)  { setVacErr("Geen kandidaten in geschiedenis."); return; }
    setVacErr(""); setVacLoading(true); setVacResult(null);
    try {
      let pool = history;
      const orgId = user?.profile?.organization_id;
      if (orgId) {
        const { data: rpcCands, error: rpcErr } = await supabase.rpc("get_org_candidates", {
          p_org_id: orgId,
          p_limit: 30,
        });
        if (!rpcErr && rpcCands?.length) {
          pool = rpcCands.map(r => ({
            ...r,
            current_role:           r.job_title,
            total_years_experience: r.ai_analysis?.total_years_experience || null,
            matched_skills:         r.ai_analysis?.matched_skills         || [],
          }));
        }
      }
      const candidates = pool.slice(0, 30);
      const compressed = candidates.map((c, i) => {
        const skills = (c.matched_skills || []).slice(0, 6)
          .map(s => (typeof s === "object" ? s.item : s))
          .filter(Boolean).join(",");
        const exp = c.total_years_experience ? `${c.total_years_experience}jr` : "?";
        return `${i + 1}|${c.name || "?"}|${c.current_role || "?"}|${exp}|${skills}`;
      }).join("\n");

      const sysPr = 'Je bent een expert recruiter. Gegeven een vacaturetekst en een kandidatenlijst, retourneer ALLEEN geldig JSON zonder uitleg: {"vacature":{"functie":null,"locatie":{"city":null,"region":null,"type":"unknown"},"sector":null,"vereiste_skills":[],"company":{"name":null,"logo_url":null}},"matches":[{"idx":1,"score":0,"reden":null}]}. LOCATIE-INSTRUCTIE: Als er een stad vermeld staat, vul city in en zet type op "city". Als er alleen een regio staat (bijv. "Randstad", "Noord-Holland"), laat city null en zet type op "region". Bij "remote" of "thuiswerken" zet type op "remote". Anders type "unknown". BEDRIJF-INSTRUCTIE: Extraheer de bedrijfsnaam uit de vacaturetekst. logo_url is altijd null (wordt apart bepaald). Sorteer matches op score aflopend.';
      const userMsg = `Vacature:\n${tekst.slice(0, 3000)}\n\nKandidaten (idx|naam|rol|exp|skills):\n${compressed}`;

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type":                              "application/json",
          "x-api-key":                                 apiKey,
          "anthropic-dangerous-direct-browser-access": "true",
          "anthropic-version":                         "2023-06-01",
        },
        body: JSON.stringify({
          model:      "claude-sonnet-4-6",
          max_tokens: 1200,
          system:     sysPr,
          messages:   [{ role: "user", content: userMsg }, { role: "assistant", content: "{" }],
        }),
      });
      const raw = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(apiErrorMessage(resp.status, raw));

      const txt = (raw.content?.filter(b => b.type === "text").map(b => b.text).join("") || "");
      const p   = parseJSON(txt.trimStart().startsWith("{") ? txt : "{" + txt);
      if (!p) throw new Error("Kon het antwoord niet verwerken. Probeer opnieuw.");

      const enrichedMatches = (p.matches || []).map(m => {
        const full  = candidates[(m.idx || 1) - 1] || {};
        const sterke = (full.matched_skills || []).slice(0, 3)
          .map(s => (typeof s === "object" ? s.item : s)).filter(Boolean);
        return {
          naam:            full.name      || `Kandidaat ${m.idx}`,
          match_score:     m.score        || 0,
          reden:           m.reden        || null,
          sterke_punten:   sterke,
          aandachtspunten: [],
          aanbeveling:     m.reden        || null,
        };
      });

      const loc2 = p.vacature?.locatie || {};
      setVacResult({
        vacature_samenvatting: {
          functie:          p.vacature?.functie         || null,
          locatie:          loc2.city || loc2.region || null,
          location_structured: {
            city:   loc2.city   || null,
            region: loc2.region || null,
            type:   loc2.type   || 'unknown',
          },
          kernvereisten:    p.vacature?.sector          || null,
          vereiste_skills:  p.vacature?.vereiste_skills || [],
          sector:           p.vacature?.sector          || null,
          company: {
            name:     p.vacature?.company?.name || null,
            logo_url: vacCompany?.logo_url      || null,
          },
        },
        kandidaten: enrichedMatches,
      });
    } catch (e) { setVacErr(e.message || "Fout"); }
    finally     { setVacLoading(false); }
  }

  async function runMarktScan() {
    const functie = vacResult?.vacature_samenvatting?.functie;
    const locatie = vacResult?.vacature_samenvatting?.locatie || 'Nederland';
    if (!functie) { setMarktErr('Geen functietitel beschikbaar in de vacature.'); return; }
    setMarktLoading(true); setMarktErr(''); setMarktData('');
    try {
      const samenvatting = await fetchMarketData(functie, locatie, apiKey, vacResult?.vacature_samenvatting);
      setMarktData(samenvatting);
    } catch (e) {
      setMarktErr(e.message || 'Marktdata ophalen mislukt.');
    } finally {
      setMarktLoading(false);
    }
  }

  async function runOutreach() {
    if (!vacResult?.vacature_samenvatting) { setOutreachErr('Analyseer eerst een vacature.'); return; }
    setOutreachLoading(true); setOutreachErr(''); setOutreachText(''); setOutreachCopied(false);
    try {
      let writingSample = '';
      if (outreachStyleSource === 'user_sample' && user?.id) {
        writingSample = await fetchWritingStyle(user.id);
      }
      const tekst = await generateOutreach({
        vacancy_data:         vacResult.vacature_samenvatting,
        channel:              outreachChannel,
        style_source:         outreachStyleSource,
        filter_type:          outreachFilterType,
        writing_style_sample: writingSample,
        apiKey,
      });
      setOutreachText(tekst);
    } catch (e) {
      setOutreachErr(e.message || 'Genereren mislukt.');
    } finally {
      setOutreachLoading(false);
    }
  }

  async function generateBelScript(kandidaat, vacatureTekst, idx) {
    setBel(idx, { loading:true, script:null, err:null, copied:false });
    try {
      const prompt = `Kandidaat: ${kandidaat.naam || "?"}\nMatch: ${kandidaat.match_score || 0}%\nSterke punten: ${(kandidaat.sterke_punten || []).join("; ")}\nAandachtspunten: ${(kandidaat.aandachtspunten || []).join("; ")}\nAanbeveling: ${kandidaat.aanbeveling || ""}\n\nVacature:\n${vacatureTekst}`;
      const d = await callAPI(
        "Je bent een top-biller consultant. Schrijf een kort bondig belscript (max 3 bullet points) gericht op overeenkomsten kandidaat-vacature. Doel: 30 seconden overtuigen. Spreektaal.",
        [{ role:"user", content:prompt }], 600
      );
      const script = d.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
      if (!script) throw new Error("Leeg antwoord ontvangen.");
      setBel(idx, { loading:false, script, err:null, copied:false });
    } catch(e) { setBel(idx, { loading:false, script:null, err:e.message || "Fout" }); }
  }

  const vacVertColors = {
    "QA/RA":       { bg:"rgba(52,211,153,0.08)",  border:"rgba(52,211,153,0.22)",  color:"rgba(52,211,153,0.9)"  },
    "Engineering": { bg:"rgba(56,189,248,0.08)",  border:"rgba(56,189,248,0.22)",  color:"rgba(56,189,248,0.85)" },
    "Sales":       { bg:"rgba(251,191,36,0.08)",  border:"rgba(251,191,36,0.22)",  color:"rgba(251,191,36,0.9)"  },
    "Healthcare":  { bg:"rgba(167,139,250,0.08)", border:"rgba(167,139,250,0.22)", color:"rgba(192,132,252,0.9)" },
  };

  const cardStyle = { background:"rgba(255,255,255,0.025)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:"16px" };

  return (
    <div className="bg-slate-950 min-h-full" style={{padding:"16px 20px"}}>

      {/* ── PAYWALL BANNER — toon als geen toegang ── */}
      {!hasAccess && (
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          gap:12, flexWrap:"wrap",
          background:"rgba(251,191,36,0.06)", border:"1px solid rgba(251,191,36,0.25)",
          borderRadius:14, padding:"12px 18px", marginBottom:14,
        }}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>🔒</span>
            <div>
              <p style={{fontSize:13,fontWeight:600,color:"rgba(251,191,36,0.95)",margin:"0 0 2px"}}>
                Geen actieve licentie
              </p>
              <p style={{fontSize:12,color:"rgba(255,255,255,0.4)",margin:0}}>
                AI-functies zijn uitgeschakeld. Activeer een licentiecode om aan de slag te gaan.
              </p>
            </div>
          </div>
          {onGoToInstellingen && (
            <button
              onClick={onGoToInstellingen}
              style={{
                background:"rgba(251,191,36,0.12)", border:"1px solid rgba(251,191,36,0.35)",
                color:"rgba(251,191,36,0.95)", borderRadius:9999,
                padding:"7px 16px", fontSize:12, fontWeight:600,
                cursor:"pointer", whiteSpace:"nowrap", flexShrink:0,
              }}>
              ⚙️ Licentie activeren
            </button>
          )}
        </div>
      )}

      {/* ══ ANALYSE ══ */}
      {tab === "analyse" && (
        <div style={{display:"flex",gap:16,alignItems:"flex-start"}}>

          {/* LEFT — sticky input panel */}
          <div style={{width:"44%",flexShrink:0,position:"sticky",top:16,alignSelf:"flex-start"}}>

          {/* Vertical legenda */}
          <div style={{...cardStyle, marginBottom:12}}>
            <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.3)",margin:"0 0 10px",letterSpacing:1,textTransform:"uppercase"}}>Vertical legenda</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:5}}>
              {Object.entries(VERTICAL_COLORS).map(([name, c]) => (
                <div key={name} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 10px",background:c.bg,border:`1px solid ${c.border}`,borderRadius:10}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:c.dot,flexShrink:0,display:"inline-block",boxShadow:`0 0 6px ${c.dot}80`}}/>
                  <span style={{fontSize:11,fontWeight:500,color:c.color,lineHeight:1.3}}>{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Input card */}
          <div style={cardStyle}>
            {/* Source selector — segmented controls */}
            <div className="flex gap-1 mb-4 bg-slate-800 p-1 rounded-lg border border-slate-700/50">
              {[["linkedin","💼 LinkedIn"],["indeed","🔎 Indeed"],["cv","📄 CV"]].map(([k, lbl]) => (
                <button key={k} onClick={() => { setSrc(k); setAnalyseErr(""); }}
                  className={`flex-1 py-2 px-2 rounded-md text-sm transition-all cursor-pointer border-none ${
                    src === k
                      ? "bg-emerald-600 shadow text-white font-semibold"
                      : "text-slate-400 hover:text-slate-200 bg-transparent"
                  }`}>
                  {lbl}
                </button>
              ))}
            </div>

            {src !== "cv" && (
              <textarea rows={7} value={profileText} onChange={e => setProfileText(e.target.value)}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) { const reader = new FileReader(); reader.onload = ev => setProfileText(ev.target.result || ""); reader.readAsText(file); }
                  else { const text = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("text"); if (text) setProfileText(p => p ? p + "\n" + text : text); }
                }}
                placeholder={`Plak of sleep hier de volledige ${src === "indeed" ? "Indeed" : "LinkedIn"}-profieltekst...`}
                style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"rgba(255,255,255,0.88)",padding:"12px 14px",fontSize:13,outline:"none",resize:"vertical",fontFamily:"Inter,sans-serif",lineHeight:1.65}}
              />
            )}

            {src === "cv" && (
              <>
                <div onClick={() => document.getElementById("cvin").click()}
                  style={{border:`2px dashed ${cvFiles.length ? accent : "rgba(255,255,255,0.12)"}`,borderRadius:10,padding:20,textAlign:"center",cursor:"pointer",background:cvFiles.length?`${accent}0d`:"transparent",transition:"all 0.2s"}}>
                  <input id="cvin" type="file" accept=".pdf,.docx" multiple style={{display:"none"}} onChange={e => {
                    const ALLOWED = new Set(['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
                    const files = Array.from(e.target.files || []).filter(f => ALLOWED.has(f.type) && f.size <= 5 * 1024 * 1024);
                    setCvFiles(prev => { const ns = new Set(prev.map(f => f.name)); return [...prev, ...files.filter(f => !ns.has(f.name))]; });
                    e.target.value = "";
                  }}/>
                  {cvFiles.length === 0
                    ? <><div style={{fontSize:28,marginBottom:6}}>📄</div><p style={{color:"rgba(255,255,255,0.45)",fontSize:14,margin:0}}>Klik om CV's te uploaden</p><p style={{color:"rgba(255,255,255,0.25)",fontSize:12,margin:"4px 0 0"}}>PDF · meerdere tegelijk · max 5MB</p></>
                    : <><div style={{fontSize:24,marginBottom:4}}>✅</div><p style={{color:accent,fontSize:14,margin:0,fontWeight:500}}>{cvFiles.length} CV{cvFiles.length !== 1 ? "'s" : ""} klaar</p></>
                  }
                </div>
                {cvFiles.length > 0 && (
                  <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4}}>
                    {cvFiles.map((f, i) => (
                      <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 10px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:7}}>
                        <span style={{fontSize:12,color:"rgba(255,255,255,0.6)"}}>📄 {f.name}</span>
                        <button onClick={() => setCvFiles(p => p.filter((_, j) => j !== i))} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:14}}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {analyseErr && <div style={{marginTop:12,padding:"10px 14px",background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:12,color:"rgba(252,165,165,0.9)",fontSize:13}}>⚠️ {analyseErr}</div>}

            <div style={{marginTop:16,display:"flex",gap:10}}>
              <button onClick={analyse} disabled={loading}
                className={`flex items-center bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all ${
                  loading ? "opacity-70 cursor-not-allowed" : "hover:bg-emerald-500 hover:scale-105 cursor-pointer"
                }`}>
                {loading ? <><Spin/>Analyseren...</> : "🔍 Analyseer"}
              </button>
              {(profileText || result || cvFiles.length > 0) && !loading && (
                <button onClick={() => { setProfileText(""); setResult(null); setAnalyseErr(""); setCvFiles([]); setCvResults([]); setCvJobs([]); setProgress(0); }}
                  className="bg-transparent border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white py-3 px-5 rounded-lg text-sm transition-all cursor-pointer">
                  Wissen
                </button>
              )}
            </div>
          </div>

          {/* Loading indicator — stays in left column */}
          {loading && (
            <div style={{...cardStyle, marginTop:10}}>
              {analyseStatus && <p style={{fontSize:12,fontWeight:500,color:"rgba(255,255,255,0.45)",margin:"0 0 8px"}}>{analyseStatus}</p>}
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{flex:1,height:4,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${progress}%`,background:T.progressGrad||`linear-gradient(90deg,${accent},${accent}cc)`,borderRadius:99,transition:"width 0.35s ease"}}/>
                </div>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.28)",minWidth:30}}>{progress}%</span>
              </div>
              {fact && <p style={{fontSize:13,color:"rgba(255,255,255,0.3)",margin:0,lineHeight:1.65}}>💡 {fact}</p>}
            </div>
          )}

          </div>{/* end LEFT column */}

          {/* RIGHT — results container */}
          <div style={{flex:1,minWidth:0}}>

          {result && !loading && (
            <ProfileCard result={result} theme={T} source={src} isTester={user?.profile?.is_tester} onSaveGem={d => { setGemToSave(d); setShowGemModal(true); }}/>
          )}

          {cvResults.length > 0 && !loading && (
            <div>
              <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.3)",margin:"0 0 10px",letterSpacing:1,textTransform:"uppercase"}}>Resultaten ({cvResults.length})</p>
              {cvResults.map((cr, i) => (
                <div key={cr.key} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${cr.error?"rgba(239,68,68,0.2)":"rgba(255,255,255,0.08)"}`,borderRadius:16,overflow:"hidden",marginBottom:8}}>
                  <button onClick={() => setCvResults(p => p.map((x, j) => j === i ? { ...x, open: !x.open } : x))}
                    style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px",background:"transparent",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.75)",fontSize:13}}>
                    <span style={{fontWeight:500}}>{cr.error ? "❌" : "✅"} {cr.result?.name || cr.file}</span>
                    <span style={{color:accent,fontSize:11}}>{cr.open ? "▲" : "▼"}</span>
                  </button>
                  {cr.open && (
                    <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",padding:"4px 4px 10px"}}>
                      {cr.error ? <p style={{padding:"10px 16px",color:"rgba(252,165,165,0.9)",fontSize:13,margin:0}}>⚠️ {cr.error}</p> : <ProfileCard result={cr.result} theme={T} compact source="cv" isTester={user?.profile?.is_tester}/>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          </div>

        </div>
      )}

      {/* ══ GESCHIEDENIS ══ */}
      {tab === "history" && (
        <div>
          {history.length === 0 && (
            <div style={{...cardStyle, padding:"48px 24px", textAlign:"center"}}>
              <p style={{fontSize:14,color:"rgba(255,255,255,0.25)",margin:0}}>Nog geen profielen geanalyseerd.</p>
            </div>
          )}
          {history.map((h, i) => (
            <div key={h.key || i} style={{...cardStyle, marginBottom:10}}>
              <ProfileCard result={h} theme={T} compact source={h.source} isTester={user?.profile?.is_tester}/>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8}}>
                <p style={{fontSize:11,color:"rgba(255,255,255,0.18)",margin:0}}>
                  {new Date(h.savedAt).toLocaleString("nl-NL")} · {h.source || "linkedin"}
                  {h.is_locked && <span style={{marginLeft:6,opacity:0.5}}>🔒</span>}
                </p>
                {h.is_locked ? (
                  <button
                    onClick={() => validateAndSaveAnalysis({ type: h.source || 'linkedin', data: h }).catch(e => console.warn('[TL] save als nieuwe versie fout:', e))}
                    style={{background:"rgba(56,189,248,0.08)",border:"1px solid rgba(56,189,248,0.25)",color:"rgba(56,189,248,0.85)",borderRadius:8,padding:"4px 12px",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
                    📋 Opslaan als nieuwe versie
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (!h.key) return;
                      lockAnalysis(h.key).then(res => {
                        if (res.ok) setHistory(prev => prev.map(x => x.key === h.key ? { ...x, is_locked: true } : x));
                      });
                    }}
                    style={{background:"rgba(74,222,128,0.08)",border:"1px solid rgba(74,222,128,0.25)",color:"rgba(74,222,128,0.85)",borderRadius:8,padding:"4px 12px",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
                    💾 Opslaan
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ FOLDER ══ */}
      {tab === "folder" && (
        <div>
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"16px 18px",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <span style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.3)",letterSpacing:1.2,textTransform:"uppercase"}}>Filter Kandidaten</span>
              <span style={{fontSize:11,color:accent,background:accent+"14",border:`1px solid ${accent}28`,borderRadius:9999,padding:"2px 10px",fontWeight:600}}>{filtered.length} / {history.length} kandidaten</span>
            </div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
              <div style={{display:"flex",flexDirection:"column",gap:5,flex:"1 1 140px",minWidth:130}}>
                <label style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",letterSpacing:0.8,textTransform:"uppercase"}}>Vertical</label>
                <select value={fVertical} onChange={e => setFVertical(e.target.value)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:fVertical?"rgba(255,255,255,0.88)":"rgba(255,255,255,0.35)",borderRadius:10,padding:"8px 10px",fontSize:12,cursor:"pointer",outline:"none",appearance:"none"}}>
                  <option value="">Alle Verticals</option>
                  {Object.keys(VERTICAL_COLORS).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:5,flex:"1 1 130px",minWidth:120}}>
                <label style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",letterSpacing:0.8,textTransform:"uppercase"}}>Rol / Functie</label>
                <select value={fRol} onChange={e => setFRol(e.target.value)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:fRol?"rgba(255,255,255,0.88)":"rgba(255,255,255,0.35)",borderRadius:10,padding:"8px 10px",fontSize:12,cursor:"pointer",outline:"none",appearance:"none"}}>
                  <option value="">Alle Rollen</option>
                  {["QA / RA","Sales","Engineering","R&D","Marketing","Clinical Affairs","Medical Affairs"].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:5,flex:"2 1 220px",minWidth:190}}>
                <label style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",letterSpacing:0.8,textTransform:"uppercase"}}>Locatie & Radius</label>
                <div style={{display:"flex",gap:6}}>
                  <input value={fLoc} onChange={e => { setFLoc(e.target.value); setFActive(false); }} onKeyDown={e => e.key === "Enter" && setFActive(true)} placeholder="Stad of Postcode"
                    style={{flex:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.88)",borderRadius:10,padding:"8px 10px",fontSize:12,outline:"none"}}/>
                  <select value={fRadius} onChange={e => setFRadius(e.target.value)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.7)",borderRadius:10,padding:"8px 8px",fontSize:11,cursor:"pointer",outline:"none",appearance:"none",width:82,flexShrink:0}}>
                    {["10","20","30","50"].map(r => <option key={r} value={r}>+{r} km</option>)}
                    <option value="landelijk">Landelijk</option>
                  </select>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:5,flexShrink:0,justifyContent:"flex-end"}}>
                <label style={{fontSize:10,color:"transparent"}}>_</label>
                <button onClick={() => setFActive(true)} style={{background:fActive?T.btnGrad||`linear-gradient(135deg,${accent}cc,${accent}88)`:"rgba(255,255,255,0.07)",border:`1px solid ${fActive?accent+"50":"rgba(255,255,255,0.12)"}`,color:fActive?"white":"rgba(255,255,255,0.6)",borderRadius:10,padding:"8px 16px",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>🔍 Filter</button>
              </div>
              {(fVertical || fRol || fLoc || fActive) && (
                <div style={{display:"flex",flexDirection:"column",gap:5,flexShrink:0,justifyContent:"flex-end"}}>
                  <label style={{fontSize:10,color:"transparent"}}>_</label>
                  <button onClick={() => { setFVertical(""); setFRol(""); setFLoc(""); setFRadius("landelijk"); setFActive(false); }} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.35)",borderRadius:10,padding:"8px 12px",fontSize:12,cursor:"pointer",whiteSpace:"nowrap"}}>✕ Reset</button>
                </div>
              )}
            </div>
            {(fVertical || fRol || (fLoc && fActive)) && (
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                {fVertical && <span style={{background:accent+"12",border:`1px solid ${accent}30`,color:accent,borderRadius:9999,padding:"3px 10px",fontSize:11,fontWeight:500}}>📊 {fVertical}</span>}
                {fRol      && <span style={{background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.25)",color:"rgba(192,132,252,0.9)",borderRadius:9999,padding:"3px 10px",fontSize:11,fontWeight:500}}>👤 {fRol}</span>}
                {fLoc && fActive && <span style={{background:"rgba(56,189,248,0.08)",border:"1px solid rgba(56,189,248,0.2)",color:"rgba(56,189,248,0.85)",borderRadius:9999,padding:"3px 10px",fontSize:11,fontWeight:500}}>📍 {fLoc}{fRadius !== "landelijk" ? ` · +${fRadius} km` : ""}</span>}
              </div>
            )}
          </div>
          {filtered.length === 0 && history.length > 0 && (
            <div style={{textAlign:"center",padding:"32px 0",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14}}>
              <p style={{fontSize:13,color:"rgba(255,255,255,0.35)",margin:0}}>Geen kandidaten gevonden voor deze filters.</p>
            </div>
          )}
          {filtered.map((h, i) => <div key={h.key || i} style={{marginBottom:8}}><ProfileCard result={h} theme={T} compact source={h.source} isTester={user?.profile?.is_tester}/></div>)}
        </div>
      )}

      {/* ══ VACATURES ══ */}
      {tab === "vacature" && (
        <div>
          <div style={cardStyle}>
            {/* URL scanner */}
            <div style={{marginBottom:12}}>
              <p style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",margin:"0 0 6px",letterSpacing:0.6,textTransform:"uppercase"}}>Vacature URL</p>
              <div style={{display:"flex",gap:8}}>
                <input
                  type="url"
                  value={vacUrl}
                  onChange={e => setVacUrl(e.target.value)}
                  placeholder="https://www.werkenbij.nl/vacature/..."
                  style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"rgba(255,255,255,0.88)",padding:"10px 14px",fontSize:13,outline:"none",fontFamily:"Inter,sans-serif"}}
                  onKeyDown={e => { if (e.key === "Enter" && vacUrl.trim()) scanVacatureUrl(); }}
                />
                <button
                  onClick={scanVacatureUrl}
                  disabled={vacScanLoading || !vacUrl.trim()}
                  style={{display:"flex",alignItems:"center",gap:6,background:"rgba(56,189,248,0.08)",border:"1px solid rgba(56,189,248,0.22)",color:"rgba(56,189,248,0.85)",borderRadius:10,padding:"10px 16px",fontSize:13,fontWeight:500,cursor:(vacScanLoading || !vacUrl.trim())?"not-allowed":"pointer",opacity:(vacScanLoading || !vacUrl.trim())?0.55:1,whiteSpace:"nowrap",transition:"all 0.2s"}}
                >
                  {vacScanLoading ? <><Spin/>Scannen...</> : "🔍 Scan Pagina"}
                </button>
              </div>
              <p style={{fontSize:11,color:"rgba(255,255,255,0.22)",margin:"5px 0 0"}}>
                Plak een vacature-URL om de tekst automatisch in te laden en te analyseren.
              </p>
            </div>

            <div style={{display:"flex",alignItems:"center",gap:8,margin:"0 0 8px"}}>
              <div style={{flex:1,height:"1px",background:"rgba(255,255,255,0.06)"}}/>
              <span style={{fontSize:11,color:"rgba(255,255,255,0.22)",letterSpacing:0.5}}>OF</span>
              <div style={{flex:1,height:"1px",background:"rgba(255,255,255,0.06)"}}/>
            </div>

            <textarea rows={8} value={vacText} onChange={e => setVacText(e.target.value)} placeholder="Plak hier de vacaturetekst..."
              style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"rgba(255,255,255,0.88)",padding:"12px 14px",fontSize:13,outline:"none",resize:"vertical",fontFamily:"Inter,sans-serif",lineHeight:1.65}}
            />
            {vacErr && <p style={{color:"rgba(252,165,165,0.9)",fontSize:13,margin:"10px 0 0"}}>⚠️ {vacErr}</p>}
            <div style={{marginTop:14,display:"flex",gap:10}}>
              <button onClick={matchVacature} disabled={vacLoading}
                className={`flex items-center bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all ${
                  vacLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-emerald-500 hover:scale-105 cursor-pointer"
                }`}>
                {vacLoading ? <><Spin/>Matchen...</> : `🎯 Match met ${history.length} kandidaat${history.length !== 1 ? "en" : ""}`}
              </button>
              {(vacText || vacResult) && !vacLoading && (
                <button onClick={() => { setVacText(""); setVacResult(null); setVacErr(""); setVacExp(null); setVacUrl(""); setVacCompany(null); }}
                  className="bg-transparent border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white py-3 px-5 rounded-lg text-sm transition-all cursor-pointer">
                  Wissen
                </button>
              )}
            </div>
            {history.length === 0 && <p style={{fontSize:13,color:"rgba(255,255,255,0.22)",margin:"12px 0 0"}}>ℹ️ Analyseer eerst kandidaten via het Analyse-tabblad.</p>}
          </div>

          {vacatureHistory.length > 0 && !vacResult && (
            <div style={{...cardStyle, marginTop:14}}>
              <p style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.7)",margin:"0 0 12px"}}>📋 Recente Vacatures</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
                {vacatureHistory.map(v => {
                  const vc = vacVertColors[v.vertical] || { bg:"rgba(255,255,255,0.06)", border:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.5)" };
                  return (
                    <div key={v.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"12px 14px",display:"flex",flexDirection:"column",gap:6}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        {v.company && <LogoAvatar url={v.logo_url || null} name={v.company} size={22} />}
                        <span style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.82)",lineHeight:1.35}}>{v.title}</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
                        <span style={{fontSize:10,background:vc.bg,border:`1px solid ${vc.border}`,color:vc.color,borderRadius:9999,padding:"2px 8px",fontWeight:500}}>{v.vertical}</span>
                        <span style={{fontSize:10,color:accent,fontWeight:600}}>· {v.matches} matches</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {vacResult && (
            <div style={{marginTop:14}}>
              <div style={{...cardStyle, marginBottom:10}}>
                {/* Bedrijfslogo + naam */}
                {(() => {
                  const co = vacResult.vacature_samenvatting?.company;
                  const logoUrl     = co?.logo_url || vacCompany?.logo_url;
                  const companyName = co?.name     || vacCompany?.name;
                  if (!companyName) return null;
                  return (
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,padding:"10px 12px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12}}>
                      <LogoAvatar url={logoUrl} name={companyName} size={36} />
                      <span style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,0.75)"}}>{companyName}</span>
                    </div>
                  );
                })()}
                <h2 style={{fontSize:19,fontWeight:600,color:"rgba(255,255,255,0.88)",margin:"0 0 4px"}}>{vacResult.vacature_samenvatting?.functie}</h2>
                <div style={{display:"flex",alignItems:"center",gap:8,margin:"0 0 10px",flexWrap:"wrap"}}>
                  {vacResult.vacature_samenvatting?.locatie && (
                    <span style={{fontSize:12,color:"rgba(255,255,255,0.38)"}}>
                      {(() => {
                        const ls = vacResult.vacature_samenvatting?.location_structured;
                        const icon = ls?.type === 'remote' ? '🌐' : ls?.type === 'region' ? '📍' : '📌';
                        return `${icon} ${vacResult.vacature_samenvatting.locatie}`;
                      })()}
                    </span>
                  )}
                  {vacResult.vacature_samenvatting?.sector && (
                    <span style={{fontSize:12,color:"rgba(255,255,255,0.28)"}}>· {vacResult.vacature_samenvatting.sector}</span>
                  )}
                </div>
                <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.65,margin:"0 0 12px"}}>{vacResult.vacature_samenvatting?.kernvereisten}</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {vacResult.vacature_samenvatting?.vereiste_skills?.map(s => <span key={s} style={{background:"rgba(56,189,248,0.08)",border:"1px solid rgba(56,189,248,0.2)",color:"rgba(56,189,248,0.85)",padding:"3px 10px",borderRadius:9999,fontSize:11,fontWeight:500}}>{s}</span>)}
                </div>
              </div>

              {vacResult.kandidaten?.map((k, i) => {
                const isExp = vacExp === i;
                const sc    = k.match_score || 0;
                const scC   = sc >= 85 ? "#34d399" : sc >= 65 ? "#fbbf24" : sc >= 40 ? "#fb923c" : "#f87171";
                const bs    = belScripts[i] || {};
                return (
                  <div key={i} style={{...cardStyle, marginBottom:8, cursor:"pointer", border:`1px solid ${isExp?scC+"30":"rgba(255,255,255,0.07)"}`, boxShadow:isExp?`0 0 0 1px ${scC}20,0 4px 24px rgba(0,0,0,0.15)`:"none"}} onClick={() => setVacExp(isExp ? null : i)}>
                    <div style={{display:"flex",alignItems:"center",gap:14}}>
                      <div style={{width:50,height:50,borderRadius:"50%",background:`${scC}10`,border:`1.5px solid ${scC}40`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{fontSize:15,color:scC,fontWeight:700,lineHeight:1}}>{sc}</span>
                        <span style={{fontSize:9,color:scC,opacity:0.7}}>%</span>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontWeight:600,fontSize:15,margin:"0 0 3px",color:"rgba(255,255,255,0.88)"}}>{k.naam}</p>
                        <p style={{fontSize:12,color:"rgba(255,255,255,0.35)",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{k.reden}</p>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                        {(k.sterke_punten||[]).length   > 0 && <span style={{fontSize:11,color:"#34d399",background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.18)",borderRadius:9999,padding:"2px 8px"}}>✓ {(k.sterke_punten||[]).length}</span>}
                        {(k.aandachtspunten||[]).length > 0 && <span style={{fontSize:11,color:"#f87171",background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.18)",borderRadius:9999,padding:"2px 8px"}}>✗ {(k.aandachtspunten||[]).length}</span>}
                        <span style={{color:"rgba(255,255,255,0.2)",fontSize:10}}>{isExp ? "▲" : "▼"}</span>
                      </div>
                    </div>

                    {isExp && (
                      <div style={{marginTop:18,borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:16}}>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                          {[
                            { arr:k.sterke_punten||[], color:"#34d399", bg:"rgba(52,211,153,0.04)", border:"rgba(52,211,153,0.12)", label:"✓ Sterke punten" },
                            { arr:k.aandachtspunten||[], color:"#f87171", bg:"rgba(248,113,113,0.04)", border:"rgba(248,113,113,0.12)", label:"✗ Aandachtspunten" },
                          ].map(({ arr, color, bg, border, label }) => (
                            <div key={label} style={{background:bg,border:`1px solid ${border}`,borderRadius:14,padding:"12px 14px"}}>
                              <p style={{fontSize:10,fontWeight:600,color,margin:"0 0 10px",letterSpacing:0.8,textTransform:"uppercase"}}>{label}</p>
                              {arr.length > 0 ? arr.map((pt, j) => (
                                <div key={j} style={{display:"flex",gap:8,marginBottom:6,alignItems:"flex-start"}}>
                                  <span style={{color,fontSize:12,flexShrink:0,marginTop:1}}>•</span>
                                  <p style={{fontSize:12,color:"rgba(255,255,255,0.65)",margin:0,lineHeight:1.55}}>{pt}</p>
                                </div>
                              )) : <p style={{fontSize:12,color:"rgba(255,255,255,0.22)",margin:0}}>—</p>}
                            </div>
                          ))}
                        </div>

                        {k.aanbeveling && (
                          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"10px 14px",display:"flex",gap:10,marginBottom:16}}>
                            <span style={{fontSize:14}}>💡</span>
                            <p style={{fontSize:13,color:"rgba(255,255,255,0.6)",margin:0,lineHeight:1.65,fontStyle:"italic"}}>{k.aanbeveling}</p>
                          </div>
                        )}

                        <div>
                          {!bs.script && (
                            <button onClick={e => { e.stopPropagation(); generateBelScript(k, vacText, i); }} disabled={bs.loading}
                              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.25)",color:"rgba(52,211,153,0.85)",borderRadius:9999,padding:"9px 18px",fontSize:12,fontWeight:500,cursor:bs.loading?"not-allowed":"pointer",width:"100%",transition:"all 0.2s"}}>
                              {bs.loading ? <><Spin/> Script schrijven...</> : "📞 Genereer Belscript"}
                            </button>
                          )}
                          {bs.err && <p style={{fontSize:12,color:"rgba(248,113,113,0.85)",margin:"8px 0 0"}}>⚠️ {bs.err}</p>}
                          {bs.script && (
                            <div style={{background:"rgba(16,185,129,0.04)",border:"1px solid rgba(16,185,129,0.15)",borderRadius:16,overflow:"hidden",marginTop:4}}>
                              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderBottom:"1px solid rgba(16,185,129,0.1)"}}>
                                <span style={{fontSize:10,fontWeight:600,color:"rgba(52,211,153,0.8)",letterSpacing:0.8,textTransform:"uppercase"}}>📞 Belscript — {k.naam}</span>
                                <div style={{display:"flex",gap:6}}>
                                  <button onClick={e => { e.stopPropagation(); navigator.clipboard?.writeText(bs.script); setBel(i,{copied:true}); setTimeout(()=>setBel(i,{copied:false}),2000); }}
                                    style={{background:bs.copied?"rgba(16,185,129,0.15)":"rgba(255,255,255,0.05)",border:`1px solid ${bs.copied?"rgba(16,185,129,0.4)":"rgba(255,255,255,0.1)"}`,color:bs.copied?"#34d399":"rgba(255,255,255,0.4)",borderRadius:9999,padding:"3px 10px",fontSize:11,cursor:"pointer"}}>
                                    {bs.copied ? "✓ Gekopieerd" : "📋 Kopieer"}
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); setBel(i,{script:null,err:null,copied:false}); }}
                                    style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.22)",borderRadius:9999,padding:"3px 8px",fontSize:11,cursor:"pointer"}}>✕</button>
                                </div>
                              </div>
                              <div style={{padding:"14px 16px",fontSize:13,color:"rgba(255,255,255,0.75)",lineHeight:1.8,whiteSpace:"pre-wrap"}}>
                                {bs.script.replace(/\*\*/g, "")}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* ── Markt Vergelijking widget ── */}
              <div style={{...cardStyle, marginTop:10, border:"1px solid rgba(139,92,246,0.2)", background:"rgba(139,92,246,0.03)"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:marktData?14:0}}>
                  <div>
                    <p style={{fontSize:11,fontWeight:700,color:"rgba(139,92,246,0.8)",letterSpacing:0.8,textTransform:"uppercase",margin:"0 0 2px"}}>
                      📊 Markt Vergelijking
                    </p>
                    {!marktData && !marktLoading && (
                      <p style={{fontSize:12,color:"rgba(255,255,255,0.3)",margin:0}}>
                        Vergelijk {vacResult.vacature_samenvatting?.functie || 'deze functie'} met de markt in {vacResult.vacature_samenvatting?.locatie || 'Nederland'}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={runMarktScan}
                    disabled={marktLoading}
                    style={{
                      display:"flex",alignItems:"center",gap:6,flexShrink:0,
                      background: marktLoading ? "rgba(255,255,255,0.04)" : "rgba(139,92,246,0.1)",
                      border:"1px solid rgba(139,92,246,0.3)",
                      color: marktLoading ? "rgba(255,255,255,0.25)" : "rgba(167,139,250,0.9)",
                      borderRadius:9999, padding:"7px 16px", fontSize:12, fontWeight:600,
                      cursor: marktLoading ? "not-allowed" : "pointer", transition:"all 0.2s",
                    }}>
                    {marktLoading ? <><Spin/>Scannen…</> : marktData ? "🔄 Opnieuw" : "🔍 Scan Markt"}
                  </button>
                </div>
                {marktErr && <p style={{fontSize:12,color:"rgba(248,113,113,0.85)",margin:"8px 0 0"}}>⚠️ {marktErr}</p>}
                {marktData && (
                  <div style={{fontSize:13,color:"rgba(255,255,255,0.72)",lineHeight:1.8,whiteSpace:"pre-wrap",borderTop:"1px solid rgba(139,92,246,0.1)",paddingTop:14}}>
                    {marktData}
                  </div>
                )}
              </div>

              {/* ── Outreach Generator widget ── */}
              <div style={{...cardStyle, marginTop:10, border:"1px solid rgba(251,191,36,0.2)", background:"rgba(251,191,36,0.02)"}}>
                <p style={{fontSize:11,fontWeight:700,color:"rgba(251,191,36,0.8)",letterSpacing:0.8,textTransform:"uppercase",margin:"0 0 14px"}}>
                  ✍️ Outreach Generator
                </p>

                {/* Kanaal + Stijl selectors */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                  <div>
                    <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.3)",letterSpacing:0.7,textTransform:"uppercase",margin:"0 0 5px"}}>Kanaal</p>
                    <select
                      value={outreachChannel}
                      onChange={e => setOutreachChannel(e.target.value)}
                      style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:9,color:"rgba(255,255,255,0.82)",padding:"8px 10px",fontSize:12,outline:"none",fontFamily:"Inter,sans-serif"}}>
                      {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.3)",letterSpacing:0.7,textTransform:"uppercase",margin:"0 0 5px"}}>Stijlbron</p>
                    <select
                      value={outreachStyleSource}
                      onChange={e => setOutreachStyleSource(e.target.value)}
                      style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:9,color:"rgba(255,255,255,0.82)",padding:"8px 10px",fontSize:12,outline:"none",fontFamily:"Inter,sans-serif"}}>
                      <option value="filter">Stijlfilter</option>
                      <option value="user_sample">Mijn schrijfstijl</option>
                    </select>
                  </div>
                </div>

                {outreachStyleSource === 'filter' && (
                  <div style={{marginBottom:12}}>
                    <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.3)",letterSpacing:0.7,textTransform:"uppercase",margin:"0 0 6px"}}>Toon</p>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {FILTER_TYPES.map(f => (
                        <button
                          key={f}
                          onClick={() => setOutreachFilterType(f)}
                          style={{
                            background: outreachFilterType === f ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.04)",
                            border: `1px solid ${outreachFilterType === f ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.08)"}`,
                            color: outreachFilterType === f ? "rgba(251,191,36,0.95)" : "rgba(255,255,255,0.4)",
                            borderRadius:9999, padding:"5px 12px", fontSize:12, fontWeight:500,
                            cursor:"pointer", transition:"all 0.15s",
                          }}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {outreachStyleSource === 'user_sample' && (
                  <p style={{fontSize:11,color:"rgba(255,255,255,0.28)",margin:"0 0 10px",lineHeight:1.5}}>
                    ℹ️ Jouw schrijfstijl wordt geladen vanuit Instellingen → Schrijfstijl.
                  </p>
                )}

                <button
                  onClick={runOutreach}
                  disabled={outreachLoading}
                  style={{
                    display:"flex",alignItems:"center",gap:8,width:"100%",justifyContent:"center",
                    background: outreachLoading ? "rgba(255,255,255,0.04)" : "rgba(251,191,36,0.1)",
                    border:"1px solid rgba(251,191,36,0.3)",
                    color: outreachLoading ? "rgba(255,255,255,0.25)" : "rgba(251,191,36,0.9)",
                    borderRadius:10, padding:"10px 0", fontSize:13, fontWeight:600,
                    cursor: outreachLoading ? "not-allowed" : "pointer", transition:"all 0.2s",
                    marginBottom: outreachText || outreachErr ? 12 : 0,
                  }}>
                  {outreachLoading ? <><Spin/>Bericht schrijven…</> : "✨ Genereer Bericht"}
                </button>

                {outreachErr && <p style={{fontSize:12,color:"rgba(248,113,113,0.85)",margin:"4px 0 0"}}>⚠️ {outreachErr}</p>}

                {outreachText && (
                  <div style={{background:"rgba(251,191,36,0.04)",border:"1px solid rgba(251,191,36,0.15)",borderRadius:12,overflow:"hidden"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 14px",borderBottom:"1px solid rgba(251,191,36,0.1)"}}>
                      <span style={{fontSize:10,fontWeight:600,color:"rgba(251,191,36,0.7)",letterSpacing:0.8,textTransform:"uppercase"}}>
                        {outreachChannel} · {outreachStyleSource === 'user_sample' ? 'Eigen stijl' : outreachFilterType}
                      </span>
                      <div style={{display:"flex",gap:6}}>
                        <button
                          onClick={() => { navigator.clipboard?.writeText(outreachText); setOutreachCopied(true); setTimeout(() => setOutreachCopied(false), 2000); }}
                          style={{
                            background: outreachCopied ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)",
                            border:`1px solid ${outreachCopied ? "rgba(52,211,153,0.35)" : "rgba(255,255,255,0.1)"}`,
                            color: outreachCopied ? "#34d399" : "rgba(255,255,255,0.45)",
                            borderRadius:9999, padding:"3px 10px", fontSize:11, cursor:"pointer",
                          }}>
                          {outreachCopied ? "✓ Gekopieerd" : "📋 Kopieer"}
                        </button>
                        <button
                          onClick={() => { setOutreachText(''); setOutreachCopied(false); }}
                          style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.22)",borderRadius:9999,padding:"3px 8px",fontSize:11,cursor:"pointer"}}>
                          ✕
                        </button>
                      </div>
                    </div>
                    <div style={{padding:"14px 16px",fontSize:13,color:"rgba(255,255,255,0.78)",lineHeight:1.8,whiteSpace:"pre-wrap"}}>
                      {outreachText}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* Boolean en Frontsheet zijn nu top-level routes via de Sidebar (Intelligence groep) */}

      {showGemModal && gemToSave && (
        <SaveGemModal
          gemToSave={gemToSave}
          accent={accent}
          onClose={() => { setShowGemModal(false); setGemToSave(null); }}
          onSave={gem => { setGems(prev => [...prev, gem]); setShowGemModal(false); setGemToSave(null); }}
        />
      )}
    </div>
  );
}
