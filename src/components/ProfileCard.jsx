import React, { useState } from 'react';
import { vColor } from '../utils/analyseUtils';
import { DEFAULT_V } from '../constants/appConstants';
import { saveToSupabase } from '../services/candidateService';
import { SalesToolkit } from './SalesToolkit';
import { FeedbackWidget } from './FeedbackWidget';

// Collapsible section wrapper used throughout the expanded card
function CollapsibleSection({ title, count, children, defaultOpen = true }) {
  const [sOpen, setSOpen] = useState(defaultOpen);
  if (count === 0) return null;
  return (
    <div style={{ marginBottom: 10 }}>
      <button
        onClick={e => { e.stopPropagation(); setSOpen(o => !o); }}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: sOpen ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10,
          padding: "7px 12px", cursor: "pointer", marginBottom: sOpen ? 8 : 0, transition: "all 0.18s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.38)", letterSpacing: 0.9, textTransform: "uppercase" }}>{title}</span>
          <span style={{ fontSize: 9, background: "rgba(255,255,255,0.07)", borderRadius: 9999, padding: "1px 6px", color: "rgba(255,255,255,0.28)" }}>{count}</span>
        </div>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.22)", display: "inline-block", transform: sOpen ? "rotate(180deg)" : "none", transition: "transform 0.18s" }}>▼</span>
      </button>
      {sOpen && <div style={{ paddingLeft: 2 }}>{children}</div>}
    </div>
  );
}

export function ProfileCard({ result: r, theme: T, compact, source, onSaveGem, isTester }) {
  const [open, setOpen]           = useState(!compact);
  const [xaiOpen, setXaiOpen]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null); // { itemKey, label, reasoning, category }
  if (!r) return null;
  const accent = T?.accent || "#34A05F";

  // Backward-compat: supports both old (string) and new ({item,reasoning}) formats
  const itemOf    = x => (x && typeof x === "object") ? (x.item || "") : (x || "");
  const reasonOf  = x => (x && typeof x === "object") ? x.reasoning : null;
  const vertOfItem= x => (x && typeof x === "object") ? (x.related_vertical || null) : null;
  const toItems   = arr => (arr || []).map(x => ({ item: itemOf(x), reasoning: reasonOf(x), related_vertical: vertOfItem(x) })).filter(e => e.item);

  const SKILL_FALLBACK = { bg:"rgba(56,189,248,0.08)",  border:"rgba(56,189,248,0.22)",  color:"rgba(56,189,248,0.85)"  };
  const ROLE_FALLBACK  = { bg:"rgba(52,211,153,0.07)",  border:"rgba(52,211,153,0.2)",   color:"rgba(52,211,153,0.85)"  };

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

  // Simple pill for XAI section (non-interactive)
  const Pill = ({ label, bg, border, color, dot }) => (
    <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:500,margin:"2px",background:bg,border:`1px solid ${border}`,color}}>
      {dot && <span style={{width:6,height:6,borderRadius:"50%",background:dot,flexShrink:0,display:"inline-block"}}/>}
      {label}
    </span>
  );

  // Interactive badge pill with click-to-reveal
  const InteractivePill = ({ label, bg, border, color, dot, itemKey, reasoning, category }) => {
    const isActive = selectedBadge?.itemKey === itemKey;
    return (
      <span
        onClick={e => { e.stopPropagation(); setSelectedBadge(isActive ? null : { itemKey, label, reasoning, category }); }}
        className="cursor-pointer transition-all"
        style={{
          display:"inline-flex", alignItems:"center", gap:5,
          padding:"4px 11px", borderRadius:9999, fontSize:11, fontWeight:500, margin:"2px",
          background: bg,
          border: `1.5px solid ${border}`,
          color,
          outline: isActive ? `2px solid ${border}` : "none",
          outlineOffset: "2px",
          transition: "all 0.15s",
          userSelect: "none",
        }}
      >
        {dot && <span style={{width:6,height:6,borderRadius:"50%",background:dot,flexShrink:0,display:"inline-block"}}/>}
        {label}
        {reasoning && <span style={{fontSize:8, opacity:0.45, marginLeft:2}}>ℹ</span>}
      </span>
    );
  };

  async function handleSave() {
    setSaving(true);
    try {
      await saveToSupabase(r, source || "onbekend");
      window.alert(`✅ ${r.name || "Kandidaat"} is opgeslagen in de database.`);
    } catch(e) {
      window.alert(`❌ Opslaan mislukt: ${e.message}`);
    } finally { setSaving(false); }
  }

  const verticals = toItems(r.matched_verticals).map(e => e.item);

  // XAI category renderer (unchanged — uses simple Pill)
  const XAICategory = ({ title, matched, suggested, fallback }) => {
    const m = toItems(matched);
    const s = toItems(suggested);
    if (m.length === 0 && s.length === 0) return null;
    return (
      <div style={{marginBottom:14}}>
        <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.28)",margin:"0 0 8px",letterSpacing:1,textTransform:"uppercase"}}>{title}</p>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {m.map((e, i) => {
            const ps = pillStyle(e, fallback || SKILL_FALLBACK);
            return (
              <div key={`m${i}`} style={{display:"flex",gap:10,padding:"9px 12px",background:"rgba(52,211,153,0.04)",border:"1px solid rgba(52,211,153,0.12)",borderRadius:12,alignItems:"flex-start",backdropFilter:"blur(8px)"}}>
                <span style={{fontSize:12,flexShrink:0,marginTop:1}}>✅</span>
                <div style={{flex:1,minWidth:0}}>
                  <Pill label={e.item} bg={ps.bg} border={ps.border} color={ps.color}/>
                  {e.related_vertical && (
                    <span style={{display:"inline-flex",alignItems:"center",gap:3,marginLeft:4,padding:"1px 7px",borderRadius:9999,fontSize:9,fontWeight:500,background:vColor(e.related_vertical).bg,border:`1px solid ${vColor(e.related_vertical).border}`,color:vColor(e.related_vertical).color,verticalAlign:"middle"}}>
                      <span style={{width:4,height:4,borderRadius:"50%",background:vColor(e.related_vertical).dot,display:"inline-block"}}/>
                      {e.related_vertical}
                    </span>
                  )}
                  {e.reasoning && <p style={{fontSize:11,color:"rgba(255,255,255,0.38)",margin:"5px 0 0",lineHeight:1.55,fontWeight:400,fontStyle:"italic"}}>{e.reasoning}</p>}
                </div>
              </div>
            );
          })}
          {s.map((e, i) => {
            const ps = pillStyle(e, fallback || SKILL_FALLBACK, true);
            return (
              <div key={`s${i}`} style={{display:"flex",gap:10,padding:"9px 12px",background:"rgba(251,191,36,0.03)",border:"1px solid rgba(251,191,36,0.12)",borderRadius:12,alignItems:"flex-start",backdropFilter:"blur(8px)"}}>
                <span style={{fontSize:12,flexShrink:0,marginTop:1}}>⚠️</span>
                <div style={{flex:1,minWidth:0}}>
                  <Pill label={e.item} bg={ps.bg} border={ps.border} color={ps.color}/>
                  {e.related_vertical && (
                    <span style={{display:"inline-flex",alignItems:"center",gap:3,marginLeft:4,padding:"1px 7px",borderRadius:9999,fontSize:9,fontWeight:500,background:vColor(e.related_vertical).bg,border:`1px solid ${vColor(e.related_vertical).border}`,color:vColor(e.related_vertical).color,opacity:0.65,verticalAlign:"middle"}}>
                      <span style={{width:4,height:4,borderRadius:"50%",background:vColor(e.related_vertical).dot,display:"inline-block"}}/>
                      {e.related_vertical}
                    </span>
                  )}
                  {e.reasoning && <p style={{fontSize:11,color:"rgba(255,255,255,0.32)",margin:"5px 0 0",lineHeight:1.55,fontWeight:400,fontStyle:"italic"}}>{e.reasoning}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl"
      style={{overflow:"hidden",marginBottom:8}}
    >
      {/* Header — always visible */}
      <div onClick={() => setOpen(o => !o)} style={{padding:"14px 16px",cursor:"pointer"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {verticals.length > 0 && (
            <div style={{display:"flex",gap:3,flexShrink:0}}>
              {verticals.slice(0, 4).map(v => (
                <span key={v} title={v} style={{width:9,height:9,borderRadius:"50%",background:vColor(v).dot,flexShrink:0,display:"inline-block",border:`1px solid ${vColor(v).border}`,boxShadow:`0 0 5px ${vColor(v).dot}60`}}/>
              ))}
              {verticals.length > 4 && <span style={{fontSize:9,color:"rgba(255,255,255,0.25)",alignSelf:"center"}}>+{verticals.length - 4}</span>}
            </div>
          )}
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:15,fontWeight:600,color:"rgba(255,255,255,0.88)",margin:"0 0 1px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",letterSpacing:-0.2}}>{r.name || "Onbekend"}</p>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.35)",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:400}}>{[r.current_role, r.location].filter(Boolean).join(" · ")}</p>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
            {isTester && (
              <>
                <style>{`@keyframes godCardPulse{0%,100%{box-shadow:0 0 5px rgba(251,191,36,0.2)}50%{box-shadow:0 0 12px rgba(251,191,36,0.55)}}`}</style>
                <span style={{
                  display:"inline-flex",alignItems:"center",gap:4,
                  fontSize:9,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",
                  color:"#fbbf24",
                  background:"linear-gradient(135deg,rgba(251,191,36,0.15),rgba(245,158,11,0.08))",
                  border:"1px solid rgba(251,191,36,0.4)",
                  borderRadius:9999,padding:"2px 8px",
                  animation:"godCardPulse 2.4s ease-in-out infinite",
                }}>⚡ GOD MODE</span>
              </>
            )}
            {r.total_years_experience && <span style={{fontSize:11,color:"rgba(255,255,255,0.25)",background:"rgba(255,255,255,0.05)",borderRadius:9999,padding:"2px 8px",fontWeight:400}}>{r.total_years_experience}j</span>}
            <span style={{color:"rgba(255,255,255,0.2)",fontSize:10}}>{open ? "▲" : "▼"}</span>
          </div>
        </div>
        {/* Vertical pills compact */}
        {verticals.length > 0 && (
          <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:3}}>
            {verticals.map(v => (
              <span key={v} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:9999,fontSize:10,fontWeight:500,background:vColor(v).bg,border:`1px solid ${vColor(v).border}`,color:vColor(v).color}}>
                <span style={{width:4,height:4,borderRadius:"50%",background:vColor(v).dot,display:"inline-block"}}/>
                {v}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expanded detail */}
      {open && (
        <div style={{padding:"4px 16px 16px",borderTop:"1px solid rgba(255,255,255,0.05)"}}>
          {r.general_comments && <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.7,margin:"12px 0 10px",fontWeight:400}}>{r.general_comments}</p>}

          {/* Skills */}
          <CollapsibleSection title="Skills" count={toItems(r.matched_skills).length + toItems(r.suggested_skills).length}>
            {toItems(r.matched_skills).map(e => {
              const ps = pillStyle(e, SKILL_FALLBACK);
              return <InteractivePill key={e.item} itemKey={`sk_${e.item}`} label={e.item} bg={ps.bg} border={ps.border} color={ps.color} reasoning={e.reasoning} category="Skill"/>;
            })}
            {toItems(r.suggested_skills).map(e => {
              const ps = pillStyle(e, SKILL_FALLBACK, true);
              return <InteractivePill key={e.item} itemKey={`sks_${e.item}`} label={"⚠ " + e.item} bg={ps.bg} border={ps.border} color={ps.color} reasoning={e.reasoning} category="Skill (mogelijk)"/>;
            })}
          </CollapsibleSection>

          {/* Verticals */}
          <CollapsibleSection title="Verticals" count={verticals.length + toItems(r.suggested_verticals).length}>
            {verticals.map(v => (
              <InteractivePill key={v} itemKey={`vt_${v}`} label={v} bg={vColor(v).bg} border={vColor(v).border} color={vColor(v).color} dot={vColor(v).dot} reasoning={null} category="Vertical"/>
            ))}
            {toItems(r.suggested_verticals).map(e => (
              <InteractivePill key={e.item} itemKey={`vts_${e.item}`} label={"⚠ " + e.item} bg="rgba(148,163,184,0.06)" border="rgba(148,163,184,0.15)" color="rgba(251,191,36,0.7)" reasoning={e.reasoning} category="Vertical (mogelijk)"/>
            ))}
          </CollapsibleSection>

          {/* Rollen */}
          <CollapsibleSection title="Rollen" count={toItems(r.matched_roles).length + toItems(r.suggested_roles).length}>
            {toItems(r.matched_roles).map(e => {
              const ps = pillStyle(e, ROLE_FALLBACK);
              return <InteractivePill key={e.item} itemKey={`ro_${e.item}`} label={e.item} bg={ps.bg} border={ps.border} color={ps.color} reasoning={e.reasoning} category="Rol"/>;
            })}
            {toItems(r.suggested_roles).map(e => {
              const ps = pillStyle(e, ROLE_FALLBACK, true);
              return <InteractivePill key={e.item} itemKey={`ros_${e.item}`} label={"⚠ " + e.item} bg={ps.bg} border={ps.border} color={ps.color} reasoning={e.reasoning} category="Rol (mogelijk)"/>;
            })}
          </CollapsibleSection>

          {/* Industrie */}
          <CollapsibleSection title="Industrie" count={toItems(r.matched_industries).length + toItems(r.suggested_industries).length}>
            {toItems(r.matched_industries).map(e => (
              <InteractivePill key={e.item} itemKey={`ind_${e.item}`} label={e.item} bg="rgba(168,85,247,0.07)" border="rgba(168,85,247,0.2)" color="rgba(192,132,252,0.85)" reasoning={e.reasoning} category="Industrie"/>
            ))}
            {toItems(r.suggested_industries).map(e => (
              <InteractivePill key={e.item} itemKey={`inds_${e.item}`} label={"⚠ " + e.item} bg="rgba(168,85,247,0.03)" border="rgba(168,85,247,0.1)" color="rgba(251,191,36,0.7)" reasoning={e.reasoning} category="Industrie (mogelijk)"/>
            ))}
          </CollapsibleSection>

          {/* Talen */}
          <CollapsibleSection title="Talen" count={(r.languages || []).length}>
            {(r.languages || []).map((lang, i) => (
              <span key={i} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 11px",borderRadius:9999,fontSize:11,fontWeight:500,margin:"2px",background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.2)",color:"rgba(251,191,36,0.85)"}}>
                🌐 {lang}
              </span>
            ))}
          </CollapsibleSection>

          {/* Opleidingen */}
          <CollapsibleSection title="Opleidingen" count={(r.education || []).length}>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {(r.education || []).map((edu, i) => (
                <div key={i} style={{padding:"7px 12px",background:"rgba(56,189,248,0.05)",border:"1px solid rgba(56,189,248,0.12)",borderRadius:10,fontSize:12,color:"rgba(255,255,255,0.6)",lineHeight:1.4}}>
                  🎓 {edu}
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Click-to-reveal badge detail */}
          {selectedBadge && (
            <div style={{margin:"0 0 14px",padding:"10px 14px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:14,transition:"all 0.2s"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:selectedBadge.reasoning ? 5 : 0}}>
                <span style={{fontSize:9,color:"rgba(255,255,255,0.28)",textTransform:"uppercase",letterSpacing:0.9,fontWeight:600}}>{selectedBadge.category}</span>
                <span style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.82)"}}>{selectedBadge.label.replace(/^⚠ /,"")}</span>
              </div>
              {selectedBadge.reasoning
                ? <p style={{fontSize:12,color:"rgba(255,255,255,0.48)",margin:0,lineHeight:1.6,fontStyle:"italic"}}>{selectedBadge.reasoning}</p>
                : <p style={{fontSize:11,color:"rgba(255,255,255,0.22)",margin:0,fontStyle:"italic"}}>Geen extra onderbouwing beschikbaar voor deze badge.</p>
              }
            </div>
          )}

          {/* Contact */}
          {r.contact && Object.entries(r.contact).filter(([, v]) => v).length > 0 && (
            <div style={{marginTop:12,padding:"10px 13px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,backdropFilter:"blur(8px)"}}>
              {Object.entries(r.contact).filter(([, v]) => v).map(([k, v]) => (
                <p key={k} style={{fontSize:12,color:"rgba(255,255,255,0.45)",margin:"3px 0",fontWeight:400}}>
                  <span style={{color:"rgba(255,255,255,0.22)"}}>{k}: </span>{v}
                </p>
              ))}
            </div>
          )}

          {/* AI Onderbouwing accordion */}
          {(toItems(r.matched_skills).length > 0 || toItems(r.matched_verticals).length > 0 || toItems(r.matched_roles).length > 0 || toItems(r.matched_industries).length > 0) && (
            <div style={{marginTop:14}}>
              <button
                onClick={e => { e.stopPropagation(); setXaiOpen(o => !o); }}
                style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:xaiOpen?"rgba(139,92,246,0.08)":"rgba(255,255,255,0.03)",border:`1px solid ${xaiOpen?"rgba(139,92,246,0.25)":"rgba(255,255,255,0.07)"}`,borderRadius:14,padding:"10px 14px",cursor:"pointer",transition:"all 0.22s",backdropFilter:"blur(12px)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:14}}>🧠</span>
                  <span style={{fontSize:12,fontWeight:600,color:xaiOpen?"rgba(192,132,252,0.9)":"rgba(255,255,255,0.45)",transition:"color 0.22s"}}>AI Onderbouwing</span>
                  <span style={{fontSize:10,background:xaiOpen?"rgba(139,92,246,0.15)":"rgba(255,255,255,0.05)",border:`1px solid ${xaiOpen?"rgba(139,92,246,0.3)":"rgba(255,255,255,0.08)"}`,color:xaiOpen?"rgba(192,132,252,0.8)":"rgba(255,255,255,0.25)",borderRadius:9999,padding:"1px 7px",transition:"all 0.22s"}}>
                    Explainable AI
                  </span>
                </div>
                <span style={{fontSize:10,color:"rgba(255,255,255,0.2)",transition:"transform 0.22s",display:"inline-block",transform:xaiOpen ? "rotate(180deg)" : "none"}}>▼</span>
              </button>

              {xaiOpen && (
                <div style={{marginTop:6,background:"rgba(139,92,246,0.03)",border:"1px solid rgba(139,92,246,0.1)",borderRadius:16,padding:"16px 14px",backdropFilter:"blur(16px)"}}>
                  <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"flex-start",padding:"8px 12px",background:"rgba(139,92,246,0.06)",border:"1px solid rgba(139,92,246,0.15)",borderRadius:10}}>
                    <span style={{fontSize:11}}>ℹ️</span>
                    <p style={{fontSize:11,color:"rgba(255,255,255,0.32)",margin:0,lineHeight:1.6,fontWeight:400}}>
                      <span style={{color:"rgba(192,132,252,0.7)",fontWeight:600}}>✅ Zekere match</span> — expliciet vermeld in profiel. &nbsp;
                      <span style={{color:"rgba(251,191,36,0.7)",fontWeight:600}}>⚠️ Twijfelgeval</span> — waarschijnlijk op basis van context.
                    </p>
                  </div>
                  <XAICategory title="Skills"    matched={r.matched_skills}    suggested={r.suggested_skills}    fallback={SKILL_FALLBACK}/>
                  <XAICategory title="Verticals" matched={r.matched_verticals} suggested={r.suggested_verticals}/>
                  <XAICategory title="Rollen"    matched={r.matched_roles}     suggested={r.suggested_roles}     fallback={ROLE_FALLBACK}/>
                  <XAICategory title="Industrie" matched={r.matched_industries} suggested={r.suggested_industries} fallback={{bg:"rgba(168,85,247,0.08)",border:"rgba(168,85,247,0.22)",color:"rgba(192,132,252,0.9)"}}/>
                </div>
              )}
            </div>
          )}

          {/* Sales Toolkit */}
          <SalesToolkit result={r} accent={accent} onSaveGem={onSaveGem}/>

          {/* Action buttons */}
          <div style={{marginTop:16,display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}>
            <button
              onClick={e => { e.stopPropagation(); window.alert("🔗 Recruit CRM koppeling — nog niet geconfigureerd."); }}
              className="bg-transparent border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white transition-all"
              style={{borderRadius:9999,padding:"7px 16px",fontSize:12,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
              🔗 Recruit CRM
            </button>
            <button
              onClick={e => { e.stopPropagation(); handleSave(); }}
              disabled={saving}
              style={{background:saving?"rgba(99,102,241,0.15)":"linear-gradient(135deg,rgba(79,70,229,0.8),rgba(124,58,237,0.8))",color:"white",border:"1px solid rgba(99,102,241,0.3)",borderRadius:9999,padding:"7px 16px",fontSize:12,fontWeight:500,cursor:saving?"not-allowed":"pointer",opacity:saving?0.5:1,transition:"all 0.2s",display:"flex",alignItems:"center",gap:5,backdropFilter:"blur(8px)",boxShadow:saving?"none":"0 2px 12px rgba(99,102,241,0.25)"}}>
              {saving
                ? <><span style={{display:"inline-block",width:11,height:11,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"white",borderRadius:"50%",animation:"s 0.7s linear infinite"}}/> Opslaan...</>
                : "💾 Opslaan in Database"}
            </button>
          </div>
        </div>
      )}

      {/* FeedbackWidget — fixed bottom-right, only in primary (non-compact) view */}
      {open && !compact && (
        <div style={{position:"fixed",bottom:24,right:24,zIndex:200,maxWidth:300,opacity:0.88}}>
          <FeedbackWidget context="cv-analyse" accent={accent}/>
        </div>
      )}
    </div>
  );
}
