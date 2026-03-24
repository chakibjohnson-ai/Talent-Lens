import React, { useState } from 'react';
import { parseJSON } from '../utils/analyseUtils';
import { FeedbackWidget } from './FeedbackWidget';
import { DEMO_MODUS } from '../constants/appConstants';
import { callClaude } from '../lib/claudeClient';

function Spin() {
  return <span style={{display:"inline-block",width:13,height:13,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"white",borderRadius:"50%",animation:"s 0.7s linear infinite",marginRight:7}}/>;
}

function buildFrontSys(frontType, frontLang, frontCrmId) {
  return `Je bent een professionele recruitment-assistent bij Morgan Recruitment Group. Genereer een strakke Candidate Frontsheet in het ${frontLang === "nl" ? "Nederlands" : "Engels"} op basis van de aangeleverde kandidaatinformatie.

Het type frontsheet is: ${frontType}.

⛔ ABSOLUTE RESTRICTIE — SALARIS & BESCHIKBAARHEID:
Verzin NOOIT zelf een Salaris of Beschikbaarheid. Gebruik in de output ALTIJD de exacte tekst: "[Zelf in te vullen door consultant]" voor deze twee velden.

${frontType === "anoniem" ? `🕵️ ANONIEM MODUS — VERPLICHTE REGELS:
- Gebruik als naam ALTIJD exact 'Kandidaat ID: ${frontCrmId || "ONBEKEND"}'. Gebruik NOOIT de echte naam.
- Anonimiseer ALLE bedrijfsnamen in werkervaring en omschrijvingsparagrafen naar 'Bedrijf A', 'Bedrijf B', etc. (chronologisch).
- Verwijder ALLE contactgegevens, e-mailadressen en telefoonnummers van de kandidaat volledig uit de output.
` : ""}📸 FOTO DETECTIE:
Analyseer de ruwe tekst op aanwijzingen van een profielfoto (zoals de tekst '[image]', 'foto', 'photo', bestandsnamen als '.jpg' of '.png', of vergelijkbare aanwijzingen). Als je vermoedt dat het originele document een foto bevat, zet dan een korte waarschuwing in 'foto_waarschuwing'. Zo niet, gebruik null.

Het Word-sjabloon heeft precies 5 invulvelden. Retourneer ALLEEN geldig JSON op één regel, zonder backticks, zonder uitleg:
{"naam":null,"huidige_functie":null,"locatie":null,"salaris":"[Zelf in te vullen door consultant]","beschikbaarheid":"[Zelf in te vullen door consultant]","profiel_bullets":[],"omschrijving_paragrafen":[],"opleiding":null,"consultant_notitie":null,"foto_waarschuwing":null}

Definities:
- profiel_bullets: array van 5-8 korte bulletpunten (elk max 12 woorden) die het profiel van de kandidaat omschrijven. Begin elk punt met een werkwoord of zelfstandig naamwoord. Geen alinea's.
- omschrijving_paragrafen: array van 2-4 alinea's (elk 2-4 zinnen) die de werkervaring en achtergrond beschrijven.
- opleiding: één zin met de hoogst behaalde opleiding en eventuele relevante cursussen.
- foto_waarschuwing: string met korte waarschuwing als er aanwijzingen zijn van een profielfoto, anders null.
- Vul ALLEEN in wat je kunt halen uit de tekst. Gebruik null voor ontbrekende gegevens.
- Schrijf ALLE veldinhoud in het ${frontLang === "nl" ? "Nederlands" : "Engels"}.`;
}

function generateDocx(fr, rawCvText, consultant) {
  const esc = s => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const bullets    = (fr.profiel_bullets || []).map(b => `<li>${esc(b)}</li>`).join("");
  const paragrafen = (fr.omschrijving_paragrafen || []).map(p => `<p>${esc(p)}</p>`).join("");
  const rawSection = rawCvText
    ? `<br clear="all" style="page-break-before:always"/><h2>Origineel CV / Profiel</h2><div style="color:#444;font-size:10pt;line-height:1.7;">${esc(rawCvText).replace(/\n/g, "<br/>")}</div>`
    : "";
  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>Frontsheet ${esc(fr.naam)}</title>
<style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#1a1a1a;margin:2cm;}h1{font-size:16pt;color:#1a3d2b;border-bottom:2px solid #1a6b3c;padding-bottom:6pt;}h2{font-size:11pt;color:#1a6b3c;margin:12pt 0 4pt;text-transform:uppercase;}table{width:100%;border-collapse:collapse;}td{padding:5pt 8pt;border-bottom:1px solid #eee;font-size:10.5pt;vertical-align:top;}td.l{color:#666;width:36%;font-weight:bold;}td.y{color:#b45309;font-style:italic;}ul{margin:4pt 0;padding-left:18pt;}li{margin-bottom:3pt;}p{margin:0 0 8pt;line-height:1.6;}.cb{background:#f0f7f3;border:1px solid #1a6b3c;padding:10pt 14pt;margin-top:16pt;}</style></head>
<body>
<h1>Candidate Frontsheet — Morgan Recruitment Group</h1>
<table>
<tr><td class="l">Naam</td><td>${esc(fr.naam || "—")}</td></tr>
<tr><td class="l">Huidige functie</td><td>${esc(fr.huidige_functie || "—")}</td></tr>
<tr><td class="l">Locatie</td><td>${esc(fr.locatie || "—")}</td></tr>
<tr><td class="l">Opleiding</td><td>${esc(fr.opleiding || "—")}</td></tr>
<tr><td class="l">Salaris</td><td class="y">${esc(fr.salaris)}</td></tr>
<tr><td class="l">Beschikbaarheid</td><td class="y">${esc(fr.beschikbaarheid)}</td></tr>
</table>
${bullets ? `<h2>Profiel</h2><ul>${bullets}</ul>` : ""}
${paragrafen ? `<h2>Omschrijving</h2>${paragrafen}` : ""}
<div class="cb">
<h2>Consultant Details</h2>
<table>
<tr><td class="l">Naam</td><td>${esc(consultant.naam || "—")}</td></tr>
<tr><td class="l">E-mail</td><td>${esc(consultant.email || "—")}</td></tr>
<tr><td class="l">Telefoon</td><td>${esc(consultant.phone)}</td></tr>
<tr><td class="l">Kantoor</td><td>${esc(consultant.locatie || "—")}</td></tr>
</table>
</div>
${rawSection}
</body></html>`;
  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = `Frontsheet_${(fr.naam || "Kandidaat").replace(/\s+/g, "_")}.doc`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
}

export function FrontsheetView({ user, history = [], onSaveGem }) {
  const T      = user?.theme || {};
  const accent = T.accent || "#4DC87A";

  // Consultant info from user profile
  const consultantNaam    = user?.profile?.naam     || "";
  const consultantLocatie = user?.profile?.locatie  || "";
  const consultantEmail   = user?.email             || "";
  const consultantPhone   = consultantLocatie.includes("Amsterdam") ? "020 - XXX XXXX" : "030 - XXX XXXX";
  const consultant = { naam: consultantNaam, locatie: consultantLocatie, email: consultantEmail, phone: consultantPhone };

  // ── State ──────────────────────────────────────────────────────────────────
  const [frontLoading,     setFrontLoading]     = useState(false);
  const [frontResult,      setFrontResult]      = useState(null);
  const [frontErr,         setFrontErr]         = useState("");
  const [showFrontModal,   setShowFrontModal]   = useState(false);
  const [showFrontConfig,  setShowFrontConfig]  = useState(false);
  const [frontInputMode,   setFrontInputMode]   = useState("history"); // "history" | "cv"
  const [frontSelectedKey, setFrontSelectedKey] = useState("");
  const [frontCvText,      setFrontCvText]      = useState("");
  const [frontCopied,      setFrontCopied]      = useState(false);
  const [frontLang,        setFrontLang]        = useState("nl");
  const [frontType,        setFrontType]        = useState("openbaar");
  const [frontCrmId,       setFrontCrmId]       = useState("");

  // ── Functions ──────────────────────────────────────────────────────────────
  async function doGenerate() {
    let inputContext = "";
    if (frontInputMode === "history") {
      const c = history.find(h => (h.key || h.naam) === frontSelectedKey);
      if (!c) { setFrontErr("Selecteer een kandidaat uit de lijst."); return; }
      inputContext = `Geanalyseerd CRM-profiel (JSON):\n${JSON.stringify(c, null, 2)}`;
    } else {
      if (!frontCvText.trim()) { setFrontErr("Plak eerst de CV-tekst."); return; }
      inputContext = `Ruwe CV-tekst:\n${frontCvText.trim()}`;
    }

    setFrontLoading(true); setFrontResult(null); setFrontErr(""); setFrontCopied(false);
    setShowFrontConfig(false);

    if (DEMO_MODUS) {
      setTimeout(() => {
        let demoName = "Demo Kandidaat";
        if (frontType === "anoniem") {
          demoName = "Kandidaat ID: " + (frontCrmId || "XXXX");
        } else if (frontInputMode === "history") {
          const c = history.find(h => (h.key || h.naam) === frontSelectedKey);
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
            "Sterk in relatiebeheer op C-level en medisch specialist niveau.",
          ],
          omschrijving_paragrafen: [
            "Deze gedreven professional heeft een bewezen track record binnen de medische industrie.",
            "In de afgelopen jaren heeft de kandidaat gewerkt bij diverse toonaangevende organisaties.",
          ],
          opleiding: "Bachelor (HBO) Commerciële Economie",
          consultant_notitie: "DEMO MODUS — Geen echte AI data.",
          foto_waarschuwing: null,
        });
        setFrontLoading(false);
        setShowFrontModal(true);
      }, 1500);
      return;
    }

    try {
      const d   = await callClaude(
        {
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2000,
          system: buildFrontSys(frontType, frontLang, frontCrmId),
          messages: [
            { role: "user",      content: `Kandidaatinformatie:\n${inputContext}` },
            { role: "assistant", content: "{" },
          ],
        },
        user.apiKey,
      );
      const raw = "{" + (d.content?.filter(b => b.type === "text").map(b => b.text).join("") || "");
      const p   = parseJSON(raw);
      if (!p) throw new Error("Geen geldige JSON ontvangen.");
      setFrontResult(p);
      setShowFrontModal(true);
    } catch(e) {
      setFrontErr(e.message || "Onbekende fout");
      setShowFrontConfig(true);
    } finally {
      setFrontLoading(false);
    }
  }

  function buildCopyText(fr) {
    return [
      "═══════════════════════════════════════",
      "  CANDIDATE FRONTSHEET",
      "  Morgan Recruitment Group",
      "═══════════════════════════════════════",
      "",
      `NAAM              ${fr.naam || "—"}`,
      `HUIDIGE FUNCTIE   ${fr.huidige_functie || "—"}`,
      `LOCATIE           ${fr.locatie || "—"}`,
      `OPLEIDING         ${fr.opleiding || "—"}`,
      `SALARIS           ${fr.salaris}`,
      `BESCHIKBAARHEID   ${fr.beschikbaarheid}`,
      "",
      "── PROFIEL ──────────────────────────────",
      ...(fr.profiel_bullets || []).map(b => `  • ${b}`),
      "",
      "── OMSCHRIJVING ─────────────────────────",
      ...(fr.omschrijving_paragrafen || []).map(p => `  ${p}`),
      "",
      "═══════════════════════════════════════",
      "  CONSULTANT DETAILS",
      "═══════════════════════════════════════",
      `Naam     ${consultantNaam || "—"}`,
      `E-mail   ${consultantEmail || "—"}`,
      `Telefoon ${consultantPhone}`,
      `Kantoor  ${consultantLocatie || "—"}`,
      "═══════════════════════════════════════",
    ].join("\n");
  }

  // ── Shared style ────────────────────────────────────────────────────────────
  const card = (children, extra = {}) => (
    <div style={{background:"rgba(255,255,255,0.03)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"18px 20px",marginBottom:12,...extra}}>
      {children}
    </div>
  );
  const segBtn = (active, onClick, children) => (
    <button onClick={onClick}
      style={{flex:1,padding:"9px 12px",borderRadius:11,border:"none",background:active?`${accent}18`:"transparent",color:active?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.38)",fontSize:12,fontWeight:active?600:400,cursor:"pointer",transition:"all 0.18s",boxShadow:active?`inset 0 0 0 1px ${accent}35`:"none"}}>
      {children}
    </button>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{maxWidth:760,margin:"0 auto",padding:"24px 16px",fontFamily:"Inter,sans-serif"}}>

      {/* Main card */}
      {card(<>
        <p style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.3)",margin:"0 0 4px",letterSpacing:1,textTransform:"uppercase"}}>Candidate Frontsheet Generator</p>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.35)",margin:"0 0 18px",lineHeight:1.65}}>
          Genereer een professionele Frontsheet op basis van een geanalyseerd profiel uit de geschiedenis, of plak een nieuw CV.
        </p>

        <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
          <button
            onClick={() => { setFrontErr(""); setShowFrontConfig(true); }}
            disabled={frontLoading}
            style={{display:"flex",alignItems:"center",gap:7,padding:"10px 22px",borderRadius:9999,border:"none",background:frontLoading?"rgba(255,255,255,0.1)":`linear-gradient(135deg,${accent}cc,${accent}88)`,color:"white",fontSize:13,fontWeight:600,cursor:frontLoading?"default":"pointer",transition:"all 0.2s",boxShadow:frontLoading?"none":`0 2px 12px ${accent}40`}}>
            {frontLoading ? <><Spin/>Genereren...</> : "📄 Maak Frontsheet"}
          </button>
          {frontResult && !frontLoading && (
            <button onClick={() => setShowFrontModal(true)}
              style={{background:`${accent}14`,border:`1px solid ${accent}35`,color:accent,borderRadius:9999,padding:"9px 18px",fontSize:13,fontWeight:500,cursor:"pointer",transition:"all 0.2s"}}>
              👁 Bekijk laatste Frontsheet
            </button>
          )}
          {frontResult && !frontLoading && (
            <button onClick={() => { setFrontResult(null); setFrontCvText(""); setFrontSelectedKey(""); setFrontErr(""); }}
              style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.35)",borderRadius:9999,padding:"9px 18px",fontSize:12,cursor:"pointer"}}>
              Wissen
            </button>
          )}
        </div>

        {frontErr && <p style={{color:"rgba(252,165,165,0.9)",fontSize:13,margin:"12px 0 0"}}>⚠️ {frontErr}</p>}

        {/* Snelkoppelingen naar profielen */}
        {history.length > 0 && (
          <div style={{marginTop:16,padding:"12px 14px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12}}>
            <p style={{fontSize:11,color:"rgba(255,255,255,0.25)",margin:"0 0 8px",fontWeight:500}}>
              {history.length} profiel{history.length !== 1 ? "en" : ""} beschikbaar in geschiedenis
            </p>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {history.slice(0, 6).map(h => (
                <button key={h.key || h.naam}
                  onClick={() => { setFrontSelectedKey(h.key || h.naam); setFrontInputMode("history"); setFrontErr(""); setShowFrontConfig(true); }}
                  style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.55)",borderRadius:9999,padding:"4px 11px",fontSize:11,cursor:"pointer",transition:"all 0.18s"}}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=`${accent}40`; e.currentTarget.style.color="rgba(255,255,255,0.82)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; e.currentTarget.style.color="rgba(255,255,255,0.55)"; }}>
                  {h.name || h.naam || "Onbekend"}
                </button>
              ))}
              {history.length > 6 && <span style={{fontSize:11,color:"rgba(255,255,255,0.2)",alignSelf:"center"}}>+{history.length - 6} meer</span>}
            </div>
          </div>
        )}
      </>)}

      {/* Consultant details card */}
      {card(<>
        <p style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.28)",margin:"0 0 12px",letterSpacing:1,textTransform:"uppercase"}}>📇 Jouw Consultant Gegevens</p>
        {consultantNaam ? (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[["👤 Naam", consultantNaam], ["📍 Kantoor", consultantLocatie], ["📧 E-mail", consultantEmail], ["📞 Telefoon", consultantPhone]].map(([k, v]) => (
              <div key={k} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"10px 13px"}}>
                <p style={{fontSize:10,color:"rgba(255,255,255,0.28)",margin:"0 0 3px",fontWeight:500}}>{k}</p>
                <p style={{fontSize:13,color:"rgba(255,255,255,0.75)",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v}</p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px",background:"rgba(251,191,36,0.04)",border:"1px solid rgba(251,191,36,0.15)",borderRadius:14}}>
            <span style={{fontSize:20}}>⚠️</span>
            <div style={{flex:1}}>
              <p style={{fontSize:13,color:"rgba(255,255,255,0.7)",margin:"0 0 4px",fontWeight:500}}>Profiel nog niet ingesteld</p>
              <p style={{fontSize:12,color:"rgba(255,255,255,0.35)",margin:0}}>Jouw naam en kantoor worden toegevoegd aan elke Frontsheet.</p>
            </div>
          </div>
        )}
      </>)}

      {/* ── Config Modal ── */}
      {showFrontConfig && (
        <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.72)",backdropFilter:"blur(14px)",padding:24}}>
          <div style={{background:"rgba(10,22,14,0.97)",backdropFilter:"blur(32px)",border:`1px solid ${accent}30`,borderRadius:24,width:"100%",maxWidth:480,boxShadow:`0 24px 72px rgba(0,0,0,0.65)`}}>

            {/* Header */}
            <div style={{padding:"22px 24px 18px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:16}}>📄</span>
                <div>
                  <p style={{fontSize:15,fontWeight:700,color:"rgba(255,255,255,0.92)",margin:0,letterSpacing:-0.3}}>Frontsheet Generator</p>
                  <p style={{fontSize:11,color:"rgba(255,255,255,0.32)",margin:0}}>Kies de bron van de kandidaatgegevens</p>
                </div>
              </div>
              <button onClick={() => setShowFrontConfig(false)}
                style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",color:"rgba(255,255,255,0.35)",borderRadius:9999,padding:"5px 12px",fontSize:12,cursor:"pointer"}}>✕</button>
            </div>

            <div style={{padding:"18px 24px 24px"}}>
              {/* Input mode toggle */}
              <div style={{display:"flex",gap:4,background:"rgba(255,255,255,0.05)",borderRadius:14,padding:4,border:"1px solid rgba(255,255,255,0.07)",marginBottom:18}}>
                {segBtn(frontInputMode === "history", () => setFrontInputMode("history"), "👤 Geanalyseerd profiel")}
                {segBtn(frontInputMode === "cv",      () => setFrontInputMode("cv"),      "📋 Nieuw CV")}
              </div>

              {/* Input content */}
              {frontInputMode === "history" ? (
                <div>
                  <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.3)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Selecteer kandidaat</label>
                  {history.length === 0 ? (
                    <div style={{padding:16,background:"rgba(251,191,36,0.04)",border:"1px solid rgba(251,191,36,0.15)",borderRadius:14,textAlign:"center"}}>
                      <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",margin:0,lineHeight:1.6}}>Nog geen kandidaten geanalyseerd.<br/><span style={{fontSize:12,color:"rgba(255,255,255,0.25)"}}>Ga naar het Analyse-tabblad om te beginnen.</span></p>
                    </div>
                  ) : (
                    <>
                      <select
                        value={frontSelectedKey}
                        onChange={e => setFrontSelectedKey(e.target.value)}
                        style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${frontSelectedKey ? accent + "50" : "rgba(255,255,255,0.1)"}`,borderRadius:12,color:frontSelectedKey ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.35)",padding:"11px 14px",fontSize:13,outline:"none",cursor:"pointer",appearance:"none",WebkitAppearance:"none",fontFamily:"Inter,sans-serif"}}>
                        <option value="" style={{background:"#0a1a0f"}}>— Kies een kandidaat —</option>
                        {history.map(h => (
                          <option key={h.key || h.naam} value={h.key || h.naam} style={{background:"#0a1a0f"}}>
                            {h.name || h.naam || "Onbekend"}{h.current_role ? ` · ${h.current_role}` : ""}
                          </option>
                        ))}
                      </select>
                      {frontSelectedKey && (() => {
                        const c = history.find(h => (h.key || h.naam) === frontSelectedKey);
                        return c ? (
                          <div style={{marginTop:10,padding:"10px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12}}>
                            <p style={{fontSize:12,color:"rgba(255,255,255,0.55)",margin:0,lineHeight:1.6}}>
                              <span style={{color:"rgba(255,255,255,0.28)",fontWeight:500}}>Locatie: </span>{c.location || "—"}&nbsp;&nbsp;
                              <span style={{color:"rgba(255,255,255,0.28)",fontWeight:500}}>Ervaring: </span>{c.total_years_experience || "—"}j
                            </p>
                          </div>
                        ) : null;
                      })()}
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.3)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>CV-tekst</label>
                  <textarea
                    rows={7}
                    value={frontCvText}
                    onChange={e => setFrontCvText(e.target.value)}
                    placeholder="Plak hier de tekst van het CV..."
                    style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${frontCvText.trim() ? accent + "50" : "rgba(255,255,255,0.09)"}`,borderRadius:14,color:"rgba(255,255,255,0.85)",padding:"13px 15px",fontSize:13,lineHeight:1.65,resize:"vertical",outline:"none",fontFamily:"Inter,sans-serif",boxSizing:"border-box"}}
                  />
                </div>
              )}

              {frontErr && <p style={{color:"rgba(252,165,165,0.85)",fontSize:12,margin:"10px 0 0"}}>⚠️ {frontErr}</p>}

              {/* Type Frontsheet */}
              <div style={{marginTop:16}}>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.3)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>🔒 Type Frontsheet</label>
                <div style={{display:"flex",gap:4,background:"rgba(255,255,255,0.05)",borderRadius:14,padding:4,border:"1px solid rgba(255,255,255,0.07)"}}>
                  {[["openbaar","🌍 Openbaar"],["anoniem","🕵️ Anoniem"]].map(([type, lbl]) => (
                    <button key={type} onClick={() => setFrontType(type)}
                      style={{flex:1,padding:"9px 12px",borderRadius:11,border:"none",
                        background:frontType===type?(type==="anoniem"?"rgba(251,191,36,0.15)":`${accent}18`):"transparent",
                        color:frontType===type?(type==="anoniem"?"rgba(251,191,36,0.95)":"rgba(255,255,255,0.9)"):"rgba(255,255,255,0.38)",
                        fontSize:12,fontWeight:frontType===type?600:400,cursor:"pointer",transition:"all 0.18s",
                        boxShadow:frontType===type?`inset 0 0 0 1px ${type==="anoniem"?"rgba(251,191,36,0.45)":accent+"35"}`:"none"}}>
                      {lbl}
                    </button>
                  ))}
                </div>
                {frontType === "anoniem" && (
                  <div style={{marginTop:10}}>
                    <div style={{padding:"10px 14px",background:"rgba(251,191,36,0.04)",border:"1px solid rgba(251,191,36,0.18)",borderRadius:12,marginBottom:10,display:"flex",alignItems:"flex-start",gap:8}}>
                      <span style={{fontSize:13,flexShrink:0}}>🕵️</span>
                      <p style={{fontSize:11,color:"rgba(251,191,36,0.65)",margin:0,lineHeight:1.6}}>
                        Bedrijfsnamen worden geanonimiseerd. De kandidaatnaam wordt vervangen door het CRM-ID.
                      </p>
                    </div>
                    <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.3)",letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>CRM Kandidaat ID</label>
                    <input
                      value={frontCrmId}
                      onChange={e => setFrontCrmId(e.target.value)}
                      placeholder="bijv. 81207"
                      style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${frontCrmId ? "rgba(251,191,36,0.5)" : "rgba(255,255,255,0.09)"}`,borderRadius:10,color:"rgba(255,255,255,0.85)",padding:"10px 14px",fontSize:13,outline:"none",fontFamily:"Inter,sans-serif",boxSizing:"border-box"}}
                    />
                  </div>
                )}
              </div>

              {/* Taal Frontsheet */}
              <div style={{marginTop:16}}>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.3)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>🌐 Taal Frontsheet</label>
                <div style={{display:"flex",gap:4,background:"rgba(255,255,255,0.05)",borderRadius:14,padding:4,border:"1px solid rgba(255,255,255,0.07)"}}>
                  {segBtn(frontLang === "nl", () => setFrontLang("nl"), "🇳🇱 Nederlands")}
                  {segBtn(frontLang === "en", () => setFrontLang("en"), "🇬🇧 Engels")}
                </div>
              </div>

              {/* Genereer knop */}
              <button
                onClick={doGenerate}
                disabled={frontLoading || (frontInputMode === "history" ? (!frontSelectedKey || history.length === 0) : (frontCvText.trim().length === 0))}
                style={{marginTop:18,width:"100%",background:T.btnGrad || `linear-gradient(135deg,${accent}cc,${accent}88)`,color:"white",border:"none",borderRadius:14,padding:"13px",fontSize:14,fontWeight:600,cursor:"pointer",transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:(frontLoading || (frontInputMode==="history"?(!frontSelectedKey||history.length===0):(frontCvText.trim().length===0)))?0.4:1}}>
                {frontLoading ? <><Spin/>Genereren...</> : "📄 Genereer Frontsheet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview Modal ── */}
      {showFrontModal && frontResult && (() => {
        const fr = frontResult;
        const copyText = buildCopyText(fr);
        return (
          <div style={{position:"fixed",inset:0,zIndex:150,display:"flex",alignItems:"flex-start",justifyContent:"center",background:"rgba(0,0,0,0.75)",backdropFilter:"blur(14px)",padding:"20px 16px",overflowY:"auto"}}>
            <div style={{background:"rgba(10,22,14,0.97)",backdropFilter:"blur(32px)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:24,width:"100%",maxWidth:620,boxShadow:"0 32px 80px rgba(0,0,0,0.7)"}}>
              {/* Header */}
              <div style={{padding:"20px 24px 18px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:16}}>📄</span>
                  <div>
                    <p style={{fontSize:15,fontWeight:700,color:"rgba(255,255,255,0.92)",margin:0}}>Candidate Frontsheet</p>
                    <p style={{fontSize:11,color:"rgba(255,255,255,0.32)",margin:0}}>{fr.naam || "Onbekend"}</p>
                  </div>
                </div>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  <button
                    onClick={() => {
                      const c = frontInputMode === "history" ? history.find(h => (h.key || h.naam) === frontSelectedKey) : null;
                      const rawCvText = frontInputMode === "cv" ? frontCvText : (c?.raw_text || "");
                      generateDocx(fr, rawCvText, consultant);
                    }}
                    style={{background:`${accent}14`,border:`1px solid ${accent}35`,color:accent,borderRadius:9999,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5,boxShadow:`0 2px 10px ${accent}30`}}
                    onMouseEnter={e => e.currentTarget.style.background=`${accent}22`}
                    onMouseLeave={e => e.currentTarget.style.background=`${accent}14`}>
                    ⬇️ Download (.doc)
                  </button>
                  <button
                    onClick={() => { navigator.clipboard?.writeText(copyText); setFrontCopied(true); setTimeout(() => setFrontCopied(false), 2500); }}
                    style={{background:frontCopied?"rgba(52,211,153,0.1)":"rgba(255,255,255,0.06)",border:`1px solid ${frontCopied?"rgba(52,211,153,0.35)":"rgba(255,255,255,0.1)"}`,color:frontCopied?"rgba(52,211,153,0.9)":"rgba(255,255,255,0.5)",borderRadius:9999,padding:"6px 14px",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                    {frontCopied ? "✓ Gekopieerd" : "📋 Kopieer tekst"}
                  </button>
                  {onSaveGem && (
                    <button
                      onClick={() => onSaveGem({ content: copyText, type: "Frontsheet" })}
                      style={{background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.28)",color:"rgba(251,191,36,0.85)",borderRadius:9999,padding:"6px 14px",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}
                      onMouseEnter={e => e.currentTarget.style.background="rgba(251,191,36,0.16)"}
                      onMouseLeave={e => e.currentTarget.style.background="rgba(251,191,36,0.08)"}>
                      💎 Opslaan als Gem
                    </button>
                  )}
                  <button onClick={() => setShowFrontModal(false)}
                    style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",color:"rgba(255,255,255,0.4)",borderRadius:9999,padding:"6px 14px",fontSize:12,cursor:"pointer"}}>
                    ✕ Sluiten
                  </button>
                </div>
              </div>

              <div style={{padding:"20px 24px"}}>
                {/* Foto waarschuwing */}
                {fr.foto_waarschuwing && (
                  <div style={{display:"flex",gap:12,alignItems:"flex-start",padding:"13px 16px",background:"rgba(251,146,60,0.08)",border:"1px solid rgba(251,146,60,0.35)",borderRadius:14,marginBottom:16}}>
                    <span style={{fontSize:18,flexShrink:0}}>⚠️</span>
                    <div>
                      <p style={{fontSize:13,fontWeight:600,color:"rgba(251,146,60,0.95)",margin:"0 0 3px"}}>AI Waarschuwing: Mogelijke profielfoto gedetecteerd</p>
                      <p style={{fontSize:12,color:"rgba(251,146,60,0.7)",margin:0,lineHeight:1.6}}>
                        Er staat mogelijk een profielfoto in het originele bestand. <strong>Vergeet deze niet handmatig te verwijderen</strong> als je een anonieme versie verstuurt.
                      </p>
                    </div>
                  </div>
                )}

                {/* Anoniem badge */}
                {frontType === "anoniem" && (
                  <div style={{display:"flex",gap:10,alignItems:"center",padding:"10px 14px",background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:12,marginBottom:14}}>
                    <span>🕵️</span>
                    <p style={{fontSize:12,color:"rgba(251,191,36,0.8)",margin:0,fontWeight:500}}>Anonieme frontsheet — naam en bedrijfsnamen zijn geanonimiseerd</p>
                  </div>
                )}

                {/* Kandidaatinfo tabel */}
                <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,overflow:"hidden",marginBottom:14}}>
                  <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(255,255,255,0.02)"}}>
                    <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",margin:0,letterSpacing:1,textTransform:"uppercase"}}>Kandidaatprofiel</p>
                  </div>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                    <tbody>
                      {[
                        ["Naam", fr.naam], ["Huidige functie", fr.huidige_functie],
                        ["Locatie", fr.locatie], ["Opleiding", fr.opleiding],
                        ["Salaris", fr.salaris], ["Beschikbaarheid", fr.beschikbaarheid],
                      ].filter(([, v]) => v).map(([k, v]) => (
                        <tr key={k} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                          <td style={{padding:"9px 16px",color:"rgba(255,255,255,0.3)",width:"36%",fontWeight:500,fontSize:12,verticalAlign:"top"}}>{k}</td>
                          <td style={{padding:"9px 16px 9px 0",color:v === "[Zelf in te vullen door consultant]" ? "rgba(251,191,36,0.75)" : "rgba(255,255,255,0.78)",fontWeight:400,lineHeight:1.5}}>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Profiel bullets */}
                {(fr.profiel_bullets || []).length > 0 && (
                  <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"14px 16px",marginBottom:14}}>
                    <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",margin:"0 0 10px",letterSpacing:1,textTransform:"uppercase"}}>Profiel</p>
                    <div style={{display:"flex",flexDirection:"column",gap:5}}>
                      {fr.profiel_bullets.map((b, i) => (
                        <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                          <span style={{color:accent,fontWeight:700,flexShrink:0,lineHeight:"20px",fontSize:13}}>•</span>
                          <p style={{fontSize:13,color:"rgba(255,255,255,0.7)",margin:0,lineHeight:1.6}}>{b}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Omschrijving paragrafen */}
                {(fr.omschrijving_paragrafen || []).length > 0 && (
                  <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"14px 16px",marginBottom:14}}>
                    <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",margin:"0 0 10px",letterSpacing:1,textTransform:"uppercase"}}>Omschrijving</p>
                    <div style={{display:"flex",flexDirection:"column",gap:12}}>
                      {fr.omschrijving_paragrafen.map((p, i) => (
                        <p key={i} style={{fontSize:13,color:"rgba(255,255,255,0.6)",margin:0,lineHeight:1.75}}>{p}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Consultant details */}
                <div style={{background:`${accent}08`,border:`1px solid ${accent}25`,borderRadius:16,padding:16}}>
                  <p style={{fontSize:10,fontWeight:600,color:accent,margin:"0 0 12px",letterSpacing:1,textTransform:"uppercase",opacity:0.8}}>📇 Consultant Details</p>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {[
                      ["Naam",     consultantNaam  || "—"],
                      ["E-mail",   consultantEmail || "—"],
                      ["Telefoon", consultantPhone],
                      ["Kantoor",  consultantLocatie || "—"],
                    ].map(([k, v]) => (
                      <div key={k} style={{display:"flex",gap:10,alignItems:"baseline"}}>
                        <span style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.28)",width:68,flexShrink:0}}>{k}</span>
                        <span style={{fontSize:13,color:"rgba(255,255,255,0.72)"}}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{marginTop:16}}>
                  <FeedbackWidget context="frontsheet" accent={accent} />
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
