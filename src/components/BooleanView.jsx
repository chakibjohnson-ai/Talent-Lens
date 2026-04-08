import React, { useState, useMemo } from 'react';
import { fetchSavedBooleans, insertSavedBoolean, deleteSavedBoolean } from '../services/booleanService';
import { parseJSON } from '../utils/analyseUtils';
import { callClaude } from '../lib/claudeClient';

const BOOL_SYS = `Expert Boolean search architect voor Medical Devices, Pharma, Healthcare, Life Sciences. Retourneer UITSLUITEND geldige JSON op 1 regel zonder backticks of uitleg.
CRUCIALE JSON REGELS:
1. Gebruik ALTIJD dubbele aanhalingstekens (") voor alle JSON-keys en om de string-waarden heen (bijv. "job_titles": "...").
2. BINNENIN de boolean strings (de zoektermen) mag je NOOIT dubbele aanhalingstekens gebruiken. Gebruik voor de zoektermen zelf ALTIJD enkele aanhalingstekens (').
Voorbeeld van de PERFECTE syntax: "job_titles": "'Clinical Specialist' OR 'Field Service Engineer'"
Schema dat je moet volgen: {"functie":null,"synoniemen":[],"locatie":null,"skills":[],"senioriteit":null,"boolean_strings":{"linkedin":{"job_titles":null,"keywords":null,"companies":null},"indeed":{"what":null,"where":null},"recruitcrm":{"keywords":null}},"target_bedrijven":[{"naam":null,"reden":null}],"recruiter_tips":[]}
Zorg dat de strings perfect zijn geformatteerd. Bijvoorbeeld voor LinkedIn: zet functietitels in "job_titles" (bijv. 'Clinical Specialist' OR 'Field Service Engineer'), zet verplichte skills in "keywords" (bijv. ('medical devices' OR 'medische apparatuur') AND ('service' OR 'onderhoud')), en target bedrijven in "companies" (bijv. Philips OR Siemens). Voor Indeed: functietitel + skills in "what", locatie in "where". Voor RecruitCRM: alles in "keywords". target_bedrijven: 5-8 bedrijven met korte reden.`;

const LABEL_COLORS = {
  GREEN: "#10b981",
  BLACK: "#9ca3af",
  LAB:   "#3b82f6",
  SUPER: "#a855f7",
};
const LABEL_NAMES = {
  GREEN: "Morgan Green",
  BLACK: "Morgan Black",
  LAB:   "Morgan Lab",
  SUPER: "All Teams",
};

function Spin() {
  return <span style={{display:"inline-block",width:12,height:12,border:"2px solid rgba(167,139,250,0.3)",borderTopColor:"rgba(167,139,250,0.9)",borderRadius:"50%",animation:"s 0.7s linear infinite",marginRight:6}}/>;
}

export function BooleanView({ user }) {
  const T      = user?.theme || {};
  const accent = T.accent || "#4DC87A";

  const boolLabelId = useMemo(() => {
    const d = user?.domain || "";
    if (d === "morgangreen.nl")  return "GREEN";
    if (d === "morganblack.nl")  return "BLACK";
    if (d === "morganlab.nl")    return "LAB";
    return "SUPER";
  }, [user]);

  // ── State ──────────────────────────────────────────────────────────────────
  const [boolText,    setBoolText]    = useState("");
  const [boolLoading, setBoolLoading] = useState(false);
  const [boolResult,  setBoolResult]  = useState(null);
  const [boolErr,     setBoolErr]     = useState("");
  const [boolPlatform,setBoolPlatform]= useState(null);
  const [copied,      setCopied]      = useState("");

  // Library
  const [libItems,    setLibItems]    = useState([]);
  const [libLoading,  setLibLoading]  = useState(false);
  const [libOpen,     setLibOpen]     = useState(false);
  const [libErr,      setLibErr]      = useState("");
  const [libSearch,   setLibSearch]   = useState("");

  // Save modal
  const [saveModal,   setSaveModal]   = useState(false);
  const [saveTitle,   setSaveTitle]   = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMsg,     setSaveMsg]     = useState("");

  const filteredLib = libItems.filter(r =>
    r.title.toLowerCase().includes(libSearch.toLowerCase()) ||
    r.boolean_string.toLowerCase().includes(libSearch.toLowerCase())
  );

  // ── Functions ──────────────────────────────────────────────────────────────
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
    if (!str)             { setSaveMsg("⚠️ Tekstgebied is leeg."); return; }
    if (!saveTitle.trim()){ setSaveMsg("⚠️ Geef een naam op."); return; }
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

  async function generateBoolean() {
    if (!boolText.trim()) { setBoolErr("Plak een vacaturetekst."); return; }
    setBoolErr(""); setBoolLoading(true); setBoolResult(null); setBoolPlatform(null);
    try {
      const resp = await callClaude(
        {
          model: "claude-haiku-4-5-20251001",
          max_tokens: 800,
          system: BOOL_SYS,
          messages: [
            { role: "user",      content: `Vacature:\n${boolText.trim()}` },
            { role: "assistant", content: "{" },
          ],
        },
        null,
      );
      const raw = resp.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
      const txt = raw.trimStart().startsWith("{") ? raw : "{" + raw;
      const p   = parseJSON(txt);
      if (!p) throw new Error("Geen JSON ontvangen. Probeer opnieuw.");
      setBoolResult(p);
    } catch(e) { setBoolErr(e.message || "Fout"); }
    finally    { setBoolLoading(false); }
  }

  function copyField(value, id) {
    if (!value) return;
    navigator.clipboard?.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const card = (children, extra = {}) => (
    <div style={{background:"rgba(255,255,255,0.03)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"18px 20px",marginBottom:12,...extra}}>
      {children}
    </div>
  );

  const label = (text) => (
    <p style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.3)",margin:"0 0 4px",letterSpacing:1,textTransform:"uppercase"}}>{text}</p>
  );

  return (
    <div style={{maxWidth:760,margin:"0 auto",padding:"24px 16px",fontFamily:"Inter,sans-serif"}}>

      {/* ── Team Gems Library card ── */}
      {card(<>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
            <span style={{fontSize:11,fontWeight:700,color:"rgba(167,139,250,0.85)",letterSpacing:0.8,textTransform:"uppercase"}}>Team Gems</span>
            {libItems.length > 0 && (
              <span style={{fontSize:10,fontWeight:600,background:"rgba(167,139,250,0.15)",color:"rgba(167,139,250,0.7)",borderRadius:9999,padding:"1px 7px"}}>{libItems.length}</span>
            )}
          </div>
          <div style={{display:"flex",gap:7,alignItems:"center"}}>
            <button
              onClick={() => { setSaveModal(true); setSaveMsg(""); setSaveTitle(""); }}
              style={{display:"flex",alignItems:"center",gap:5,background:"rgba(167,139,250,0.12)",border:"1px solid rgba(167,139,250,0.3)",color:"rgba(167,139,250,0.9)",borderRadius:9999,padding:"5px 12px",fontSize:11,fontWeight:600,cursor:"pointer",transition:"all 0.18s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(167,139,250,0.22)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(167,139,250,0.12)";}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Opslaan
            </button>
            <button
              onClick={() => { if (!libOpen) loadLibrary(); setLibOpen(v => !v); setLibSearch(""); }}
              style={{display:"flex",alignItems:"center",gap:5,background:libOpen?"rgba(167,139,250,0.18)":"rgba(255,255,255,0.05)",border:`1px solid ${libOpen?"rgba(167,139,250,0.45)":"rgba(255,255,255,0.1)"}`,color:libOpen?"rgba(167,139,250,0.9)":"rgba(255,255,255,0.5)",borderRadius:9999,padding:"5px 13px",fontSize:11,fontWeight:600,cursor:"pointer",transition:"all 0.18s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(167,139,250,0.15)";}}
              onMouseLeave={e=>{e.currentTarget.style.background=libOpen?"rgba(167,139,250,0.18)":"rgba(255,255,255,0.05)";}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points={libOpen?"18 15 12 9 6 15":"6 9 12 15 18 9"}/></svg>
              {libOpen ? "Sluit" : "Bibliotheek"}
            </button>
          </div>
        </div>

        {libOpen && (
          <div style={{marginTop:12,borderTop:"1px solid rgba(167,139,250,0.12)",paddingTop:12}}>
            {/* Search */}
            <div style={{position:"relative",marginBottom:10}}>
              <svg style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                value={libSearch}
                onChange={e => setLibSearch(e.target.value)}
                placeholder="Zoek in bibliotheek..."
                style={{width:"100%",paddingLeft:30,paddingRight:12,paddingTop:7,paddingBottom:7,background:"rgba(0,0,0,0.25)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:9,fontSize:12,color:"rgba(255,255,255,0.75)",outline:"none",boxSizing:"border-box",fontFamily:"Inter,sans-serif"}}
              />
            </div>

            {libLoading && (
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 0",color:"rgba(255,255,255,0.35)",fontSize:12}}>
                <Spin/> Bibliotheek laden...
              </div>
            )}
            {libErr && !libLoading && <p style={{color:"rgba(252,165,165,0.8)",fontSize:12,margin:"6px 0"}}>⚠️ {libErr}</p>}
            {!libLoading && !libErr && filteredLib.length === 0 && (
              <div style={{textAlign:"center",padding:"18px 0",color:"rgba(255,255,255,0.22)",fontSize:12}}>
                {libSearch ? "Geen resultaten gevonden." : "Nog geen Booleans opgeslagen. Genereer er één en sla hem op!"}
              </div>
            )}

            {!libLoading && filteredLib.length > 0 && (
              <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:280,overflowY:"auto",paddingRight:2}}>
                {filteredLib.map(row => {
                  const lc = LABEL_COLORS[row.label_id] || "#a855f7";
                  const ln = LABEL_NAMES[row.label_id]  || row.label_id;
                  const dateStr = (() => {
                    const d = new Date(row.created_at);
                    return isNaN(d) ? "" : d.toLocaleDateString("nl-NL", {day:"numeric",month:"short"});
                  })();
                  return (
                    <div key={row.id}
                      onClick={() => { setBoolText(row.boolean_string); setLibOpen(false); setLibSearch(""); }}
                      style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",background:"rgba(167,139,250,0.05)",border:"1px solid rgba(167,139,250,0.12)",borderRadius:11,cursor:"pointer",transition:"all 0.15s",position:"relative"}}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(167,139,250,0.12)";e.currentTarget.style.borderColor="rgba(167,139,250,0.3)";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="rgba(167,139,250,0.05)";e.currentTarget.style.borderColor="rgba(167,139,250,0.12)";}}>
                      <div style={{width:30,height:30,borderRadius:8,background:"rgba(167,139,250,0.12)",border:"1px solid rgba(167,139,250,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.8)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
                          <span style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.82)"}}>{row.title}</span>
                          <span style={{fontSize:9,fontWeight:600,background:`${lc}1a`,color:lc,borderRadius:999,padding:"1px 6px",border:`1px solid ${lc}30`}}>{ln}</span>
                          {dateStr && <span style={{fontSize:10,color:"rgba(255,255,255,0.22)",marginLeft:"auto"}}>{dateStr}</span>}
                        </div>
                        <p style={{fontSize:11,color:"rgba(255,255,255,0.35)",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'SF Mono','Courier New',monospace"}}>
                          {row.boolean_string}
                        </p>
                      </div>
                      <button
                        onClick={e => handleDeleteBoolean(row.id, e)}
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
      </>)}

      {/* ── Save Boolean Modal ── */}
      {saveModal && (
        <div onClick={() => setSaveModal(false)}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e => e.stopPropagation()}
            style={{background:"linear-gradient(135deg,rgba(25,17,45,0.98),rgba(18,12,30,0.98))",border:"1px solid rgba(167,139,250,0.25)",borderRadius:20,padding:"28px 28px 24px",width:"min(420px,90vw)",boxShadow:"0 24px 60px rgba(0,0,0,0.6)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
              <div style={{width:36,height:36,borderRadius:10,background:"rgba(167,139,250,0.12)",border:"1px solid rgba(167,139,250,0.25)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              </div>
              <div>
                <p style={{fontSize:14,fontWeight:700,color:"rgba(255,255,255,0.9)",margin:0}}>Opslaan in Team Gems</p>
                <p style={{fontSize:11,color:"rgba(255,255,255,0.35)",margin:0}}>Voeg toe aan de gedeelde Boolean bibliotheek</p>
              </div>
            </div>

            <label style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.45)",letterSpacing:0.8,textTransform:"uppercase",display:"block",marginBottom:6}}>Naam van deze Boolean</label>
            <input
              autoFocus
              value={saveTitle}
              onChange={e => setSaveTitle(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSaveBoolean(); }}
              placeholder="Bijv. Senior QA Manager – Medical Devices"
              style={{width:"100%",padding:"10px 14px",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:10,fontSize:13,color:"rgba(255,255,255,0.85)",outline:"none",marginBottom:8,boxSizing:"border-box",fontFamily:"Inter,sans-serif"}}
            />

            {boolText && (
              <div style={{background:"rgba(0,0,0,0.25)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:9,padding:"9px 12px",fontSize:11,fontFamily:"'SF Mono','Courier New',monospace",color:"rgba(255,255,255,0.4)",marginBottom:12,maxHeight:72,overflow:"hidden",lineHeight:1.7,wordBreak:"break-all"}}>
                {boolText.slice(0, 240)}{boolText.length > 240 ? "…" : ""}
              </div>
            )}

            {saveMsg && <p style={{fontSize:12,color:saveMsg.startsWith("✅")?"rgba(52,211,153,0.9)":"rgba(252,165,165,0.9)",margin:"0 0 10px",fontWeight:500}}>{saveMsg}</p>}

            <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
              <button onClick={() => setSaveModal(false)}
                style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.5)",borderRadius:9999,padding:"8px 18px",fontSize:12,cursor:"pointer",transition:"all 0.18s"}}>
                Annuleren
              </button>
              <button onClick={handleSaveBoolean} disabled={saveLoading}
                style={{display:"flex",alignItems:"center",gap:6,background:"rgba(167,139,250,0.18)",border:"1px solid rgba(167,139,250,0.4)",color:"rgba(167,139,250,0.95)",borderRadius:9999,padding:"8px 20px",fontSize:12,fontWeight:600,cursor:saveLoading?"default":"pointer",transition:"all 0.18s"}}>
                {saveLoading && <Spin/>}
                {saveLoading ? "Opslaan..." : "💾 Opslaan in Gems"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Boolean generator input ── */}
      {card(<>
        {label("Boolean Search Generator")}
        <p style={{fontSize:13,color:"rgba(255,255,255,0.35)",margin:"0 0 14px",lineHeight:1.65}}>
          Genereer scherpe Boolean strings voor LinkedIn, Indeed én Recruit CRM op basis van een vacaturetekst.
        </p>
        <textarea
          rows={8}
          value={boolText}
          onChange={e => setBoolText(e.target.value)}
          placeholder="Plak hier de vacaturetekst of een bestaande Boolean string..."
          style={{width:"100%",boxSizing:"border-box",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:11,color:"rgba(255,255,255,0.82)",padding:"12px 14px",fontSize:13,outline:"none",fontFamily:"Inter,sans-serif",resize:"vertical",lineHeight:1.6}}
        />
        {boolErr && <p style={{color:"rgba(252,165,165,0.9)",fontSize:13,margin:"10px 0 0"}}>⚠️ {boolErr}</p>}
        <div style={{marginTop:14,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <button
            onClick={generateBoolean}
            disabled={boolLoading}
            style={{display:"flex",alignItems:"center",gap:7,padding:"9px 20px",borderRadius:9999,border:"none",background:boolLoading?"rgba(167,139,250,0.3)":`linear-gradient(135deg,rgba(167,139,250,0.8),rgba(139,92,246,0.8))`,color:"white",fontSize:13,fontWeight:600,cursor:boolLoading?"default":"pointer",transition:"all 0.2s"}}>
            {boolLoading ? <><Spin/>Genereren...</> : "🔎 Genereer Boolean Strings"}
          </button>

          {boolText && !boolLoading && (
            <button
              onClick={() => { setSaveModal(true); setSaveMsg(""); setSaveTitle(""); }}
              style={{display:"flex",alignItems:"center",gap:5,background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.28)",color:"rgba(167,139,250,0.85)",borderRadius:9999,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.18s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(167,139,250,0.2)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(167,139,250,0.1)";}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Save to Gems
            </button>
          )}
          {boolText && !boolLoading && (
            <button
              onClick={() => { copyField(boolText, "__raw__"); }}
              style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:copied==="__raw__"?"rgba(52,211,153,0.9)":"rgba(255,255,255,0.45)",borderRadius:9999,padding:"7px 14px",fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.18s"}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              {copied === "__raw__" ? "✓ Gekopieerd" : "Kopieer"}
            </button>
          )}
          {(boolText || boolResult) && !boolLoading && (
            <button
              onClick={() => { setBoolText(""); setBoolResult(null); setBoolErr(""); setCopied(""); setBoolPlatform(null); }}
              style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.35)",borderRadius:9999,padding:"7px 14px",fontSize:12,cursor:"pointer",transition:"all 0.18s"}}>
              Wissen
            </button>
          )}
        </div>
      </>)}

      {/* ── Results ── */}
      {boolResult && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>

          {/* Analyse samenvatting */}
          {card(<>
            <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",margin:"0 0 12px",letterSpacing:1,textTransform:"uppercase"}}>Analyse: {boolResult.functie}</p>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <tbody>
                {[
                  ["Functie(s)", [boolResult.functie, ...(boolResult.synoniemen || [])].join(" · ")],
                  ["Locatie",    boolResult.locatie || "—"],
                  ["Skills",    (boolResult.skills || []).join(", ")],
                  ["Senioriteit",boolResult.senioriteit || "—"],
                ].map(([k, v]) => (
                  <tr key={k} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                    <td style={{padding:"8px 14px 8px 0",color:"rgba(255,255,255,0.32)",width:"28%",fontWeight:500,fontSize:12}}>{k}</td>
                    <td style={{padding:"8px 0",color:"rgba(255,255,255,0.72)",fontWeight:400}}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>)}

          {/* Platform selector */}
          {!boolPlatform && card(<>
            <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",margin:"0 0 14px",letterSpacing:1,textTransform:"uppercase"}}>Kies platform</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {[
                { id:"linkedin",   label:"LinkedIn",    sub:"Recruiter Search",  color:"#0A66C2",  textColor:"rgba(90,173,255,0.9)",
                  svg:<svg width="36" height="36" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="#0A66C2"/><path d="M10 15h5v15h-5zM12.5 13a2.5 2.5 0 110-5 2.5 2.5 0 010 5zM21 15h4.8v2.1h.1c.7-1.3 2.3-2.6 4.8-2.6 5.1 0 6 3.4 6 7.7V30h-5v-7c0-1.7 0-3.9-2.4-3.9-2.4 0-2.7 1.8-2.7 3.7V30H21V15z" fill="white"/></svg> },
                { id:"indeed",     label:"Indeed",      sub:"Candidate Search",  color:"#2164F3",  textColor:"rgba(107,159,255,0.9)",
                  svg:<svg width="36" height="36" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="#2164F3"/><circle cx="20" cy="14" r="5" fill="white"/><path d="M10 32c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/><rect x="18" y="22" width="4" height="8" rx="2" fill="white"/></svg> },
                { id:"recruitcrm", label:"Recruit CRM", sub:"ATS Search",        color:"#FBBF24",  textColor:"rgba(251,191,36,0.9)",
                  svg:<svg width="36" height="36" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.3)" strokeWidth="1"/><path d="M20 8l3 9h9l-7.5 5.5 2.9 9L20 26l-7.4 5.5 2.9-9L8 17h9z" fill="#FBBF24"/></svg> },
              ].map(p => (
                <button key={p.id} onClick={() => setBoolPlatform(p.id)}
                  style={{background:`${p.color}0f`,border:`1px solid ${p.color}33`,borderRadius:16,padding:"20px 12px",cursor:"pointer",transition:"all 0.2s",display:"flex",flexDirection:"column",alignItems:"center",gap:10}}
                  onMouseEnter={e=>{e.currentTarget.style.background=`${p.color}1e`;e.currentTarget.style.transform="translateY(-2px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background=`${p.color}0f`;e.currentTarget.style.transform="none";}}>
                  {p.svg}
                  <div style={{textAlign:"center"}}>
                    <p style={{fontSize:13,fontWeight:600,color:p.textColor,margin:"0 0 2px"}}>{p.label}</p>
                    <p style={{fontSize:10,color:"rgba(255,255,255,0.25)",margin:0}}>{p.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </>)}

          {/* Platform fields */}
          {boolPlatform && (() => {
            const platforms = {
              linkedin:   { label:"LinkedIn",    color:"#0A66C2", textColor:"rgba(90,173,255,0.9)",
                            fields: { job_titles:{label:"Functietitels",sublabel:"Job Titles veld",icon:"💼"}, keywords:{label:"Trefwoorden",sublabel:"Keywords veld",icon:"🔍"}, companies:{label:"Bedrijven",sublabel:"Companies veld",icon:"🏢"} } },
              indeed:     { label:"Indeed",      color:"#2164F3", textColor:"rgba(107,159,255,0.9)",
                            fields: { what:{label:"Wat",sublabel:"What / Job title veld",icon:"🔍"}, where:{label:"Waar",sublabel:"Where / Location veld",icon:"📍"} } },
              recruitcrm: { label:"Recruit CRM", color:"#FBBF24", textColor:"rgba(251,191,36,0.9)",
                            fields: { keywords:{label:"Trefwoorden",sublabel:"Keywords veld",icon:"🔍"} } },
            };
            const cfg = platforms[boolPlatform];
            const platformData = boolResult?.boolean_strings?.[boolPlatform] || {};
            return card(<>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:cfg.color,display:"inline-block",boxShadow:`0 0 8px ${cfg.color}80`}}/>
                  <span style={{fontSize:12,fontWeight:600,color:cfg.textColor,letterSpacing:0.6,textTransform:"uppercase"}}>{cfg.label}</span>
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.25)"}}>— Plak elk veld direct in het platform</span>
                </div>
                <button onClick={() => setBoolPlatform(null)}
                  style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",color:"rgba(255,255,255,0.4)",borderRadius:9999,padding:"4px 12px",fontSize:11,cursor:"pointer"}}>
                  ← Terug
                </button>
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {Object.entries(cfg.fields).map(([fk, fm]) => {
                  const fv = (platformData[fk] || "").replace(/'/g, '"');
                  const cid = boolPlatform + "_" + fk;
                  return (
                    <div key={fk} style={{background:"rgba(0,0,0,0.22)",border:`1px solid ${cfg.color}22`,borderRadius:14,padding:"14px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <span style={{fontSize:14}}>{fm.icon}</span>
                          <span style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.75)"}}>{fm.label}</span>
                          <span style={{fontSize:10,color:"rgba(255,255,255,0.28)"}}>({fm.sublabel})</span>
                        </div>
                        <button
                          onClick={() => copyField(fv, cid)}
                          disabled={!fv}
                          style={{background:copied===cid?`${cfg.color}20`:"rgba(255,255,255,0.05)",border:`1px solid ${copied===cid?cfg.color+"60":"rgba(255,255,255,0.09)"}`,color:copied===cid?cfg.textColor:"rgba(255,255,255,0.45)",borderRadius:9999,padding:"4px 12px",fontSize:11,cursor:fv?"pointer":"default",transition:"all 0.2s",opacity:fv?1:0.4}}>
                          {copied === cid ? "✓ Gekopieerd" : "📋 Kopieer"}
                        </button>
                      </div>
                      <div style={{background:"rgba(0,0,0,0.2)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"11px 14px",fontFamily:"'SF Mono','Courier New',monospace",fontSize:12,color:fv?"rgba(255,255,255,0.75)":"rgba(255,255,255,0.2)",lineHeight:1.8,wordBreak:"break-word",whiteSpace:"pre-wrap",minHeight:40}}>
                        {fv || "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>);
          })()}

          {/* Target bedrijven */}
          {boolResult.target_bedrijven?.length > 0 && card(<>
            <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",margin:"0 0 14px",letterSpacing:1,textTransform:"uppercase"}}>🏢 Kijk bij deze bedrijven</p>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {boolResult.target_bedrijven.map((b, i) => (
                <div key={i} style={{display:"flex",gap:12,padding:"10px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,alignItems:"flex-start"}}>
                  <div style={{width:28,height:28,borderRadius:8,background:`${accent}14`,border:`1px solid ${accent}25`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:13}}>🏢</div>
                  <div>
                    <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.82)",margin:"0 0 2px"}}>{b.naam}</p>
                    <p style={{fontSize:12,color:"rgba(255,255,255,0.38)",margin:0,lineHeight:1.5}}>{b.reden}</p>
                  </div>
                </div>
              ))}
            </div>
          </>)}

          {/* Recruiter tips */}
          {boolResult.recruiter_tips?.length > 0 && card(<>
            <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",margin:"0 0 12px",letterSpacing:1,textTransform:"uppercase"}}>💡 Tips voor de Recruiter</p>
            {boolResult.recruiter_tips.map((tip, i) => (
              <div key={i} style={{display:"flex",gap:10,padding:"10px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,marginBottom:6,alignItems:"flex-start"}}>
                <span style={{color:accent,fontWeight:600,flexShrink:0,fontSize:13}}>{i+1}.</span>
                <p style={{fontSize:13,color:"rgba(255,255,255,0.6)",margin:0,lineHeight:1.65}}>{tip}</p>
              </div>
            ))}
          </>)}
        </div>
      )}
    </div>
  );
}
