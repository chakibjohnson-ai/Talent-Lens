import React, { useState } from 'react';
import { GEM_TYPE_COLOR } from '../constants/appConstants';

const TEAMS = ["Morgan Green", "Morgan Black", "Morgan Lab"];

export function SaveGemModal({ gemToSave, onClose, onSave, accent }) {
  const [title, setTitle]           = useState("");
  const [visibility, setVisibility] = useState("private");
  const [team, setTeam]             = useState("Morgan Green");
  const [saved, setSaved]           = useState(false);
  const c = accent || "#34d399";

  if (!gemToSave) return null;
  const tc = GEM_TYPE_COLOR[gemToSave.type] || GEM_TYPE_COLOR["Belscript"];

  function handleSave() {
    if (!title.trim()) return;
    onSave({
      id:       Date.now(),
      title:    title.trim(),
      type:     gemToSave.type,
      content:  gemToSave.content,
      isShared: visibility === "shared",
      team:     visibility === "shared" ? team : "Privé",
      author:   "Mijzelf",
      date:     "Zojuist",
    });
    setSaved(true);
    setTimeout(onClose, 1400);
  }

  return (
    <div style={{position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(18px)",padding:"20px 16px"}}>
      <div style={{background:"rgba(8,16,12,0.97)",backdropFilter:"blur(40px)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:22,width:"100%",maxWidth:420,boxShadow:"0 40px 90px rgba(0,0,0,0.8)"}}>
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
            <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.35)",letterSpacing:0.7,textTransform:"uppercase",marginBottom:7}}>Titel voor je Gem</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSave()}
              placeholder="Bijv. Geniale Boolean voor QA Managers..."
              autoFocus
              style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:11,color:"rgba(255,255,255,0.88)",padding:"11px 14px",fontSize:13,outline:"none",fontFamily:"Inter,sans-serif",marginBottom:18}}
              onFocus={e  => e.target.style.borderColor = c + "60"}
              onBlur={e   => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
            />

            <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.35)",letterSpacing:0.7,textTransform:"uppercase",marginBottom:8}}>Zichtbaarheid</label>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              {[
                { v: "private", label: "🔒 Alleen voor mij" },
                { v: "shared",  label: "🌍 Delen met team" },
              ].map(opt => (
                <button key={opt.v} onClick={() => setVisibility(opt.v)}
                  style={{flex:1,padding:"10px 8px",borderRadius:11,border:`1px solid ${visibility===opt.v?c+"50":"rgba(255,255,255,0.1)"}`,background:visibility===opt.v?c+"12":"rgba(255,255,255,0.04)",color:visibility===opt.v?"rgba(255,255,255,0.88)":"rgba(255,255,255,0.4)",fontSize:12,fontWeight:visibility===opt.v?600:400,cursor:"pointer",transition:"all 0.18s"}}>
                  {opt.label}
                </button>
              ))}
            </div>

            {visibility === "shared" && (
              <div style={{marginBottom:18}}>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.35)",letterSpacing:0.7,textTransform:"uppercase",marginBottom:8}}>Label / Team</label>
                <div style={{display:"flex",gap:6}}>
                  {TEAMS.map(t => (
                    <button key={t} onClick={() => setTeam(t)}
                      style={{flex:1,padding:"8px 4px",borderRadius:9,border:`1px solid ${team===t?c+"50":"rgba(255,255,255,0.09)"}`,background:team===t?c+"14":"rgba(255,255,255,0.03)",color:team===t?c:"rgba(255,255,255,0.38)",fontSize:11,fontWeight:team===t?600:400,cursor:"pointer",transition:"all 0.18s",whiteSpace:"nowrap"}}>
                      {t.replace("Morgan ", "")}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={!title.trim()}
              style={{width:"100%",padding:"12px",borderRadius:12,border:"none",background:title.trim()?`linear-gradient(135deg,${c}cc,${c}88)`:"rgba(255,255,255,0.06)",color:title.trim()?"white":"rgba(255,255,255,0.25)",fontSize:14,fontWeight:700,cursor:title.trim()?"pointer":"not-allowed",transition:"all 0.2s",boxShadow:title.trim()?`0 4px 20px ${c}35`:"none"}}>
              💎 Opslaan als Gem
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
