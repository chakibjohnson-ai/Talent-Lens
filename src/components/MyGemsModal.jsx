import React, { useState } from 'react';
import { GEM_TYPE_COLOR } from '../constants/appConstants';

export function MyGemsModal({ gems, onClose, accent }) {
  const [expanded, setExpanded] = useState(null);
  const [copied, setCopied]     = useState(null);
  const c = accent || "#34d399";
  const myGems = gems.filter(g => g.author === "Mijzelf");

  function copyGem(id, content) {
    navigator.clipboard?.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div style={{position:"fixed",inset:0,zIndex:400,display:"flex",alignItems:"flex-start",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(18px)",padding:"24px 16px",overflowY:"auto"}}>
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
          {myGems.length === 0 ? (
            <div style={{textAlign:"center",padding:"40px 0"}}>
              <p style={{fontSize:28,margin:"0 0 10px"}}>💎</p>
              <p style={{fontSize:14,color:"rgba(255,255,255,0.4)",margin:0}}>Nog geen gems opgeslagen.</p>
              <p style={{fontSize:12,color:"rgba(255,255,255,0.22)",margin:"6px 0 0"}}>Gebruik '💎 Opslaan als Gem' na een generatie.</p>
            </div>
          ) : myGems.map(g => {
            const tc = GEM_TYPE_COLOR[g.type] || GEM_TYPE_COLOR["Belscript"];
            const isOpen = expanded === g.id;
            return (
              <div key={g.id} style={{marginBottom:10,background:"rgba(255,255,255,0.03)",border:`1px solid ${isOpen ? tc.border : "rgba(255,255,255,0.08)"}`,borderRadius:14,overflow:"hidden",transition:"border-color 0.2s"}}>
                <button onClick={() => setExpanded(isOpen ? null : g.id)}
                  style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}}>
                  <span style={{fontSize:18,flexShrink:0}}>{tc.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.85)",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.title}</p>
                    <div style={{display:"flex",gap:6,alignItems:"center",marginTop:3,flexWrap:"wrap"}}>
                      <span style={{fontSize:10,padding:"1px 7px",borderRadius:9999,background:tc.bg,border:`1px solid ${tc.border}`,color:tc.color,fontWeight:500}}>{g.type}</span>
                      <span style={{fontSize:10,color:"rgba(255,255,255,0.25)"}}>{g.isShared ? "🌍 " + g.team : "🔒 Privé"}</span>
                      <span style={{fontSize:10,color:"rgba(255,255,255,0.2)"}}>{g.date}</span>
                    </div>
                  </div>
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.25)",flexShrink:0,transition:"transform 0.2s",display:"inline-block",transform:isOpen ? "rotate(180deg)" : "none"}}>▼</span>
                </button>

                {isOpen && (
                  <div style={{padding:"0 16px 14px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                    <div style={{background:"rgba(0,0,0,0.3)",borderRadius:10,padding:"12px 14px",marginTop:10,position:"relative"}}>
                      <pre style={{fontSize:11,color:"rgba(255,255,255,0.6)",margin:0,whiteSpace:"pre-wrap",lineHeight:1.65,fontFamily:"Inter,sans-serif",paddingRight:70}}>{g.content}</pre>
                      <button onClick={() => copyGem(g.id, g.content)}
                        style={{position:"absolute",top:10,right:10,background:copied===g.id?"rgba(52,211,153,0.15)":"rgba(255,255,255,0.07)",border:`1px solid ${copied===g.id?"rgba(52,211,153,0.3)":"rgba(255,255,255,0.12)"}`,color:copied===g.id?"rgba(52,211,153,0.9)":"rgba(255,255,255,0.4)",borderRadius:9999,padding:"3px 10px",fontSize:11,cursor:"pointer",transition:"all 0.18s",whiteSpace:"nowrap"}}>
                        {copied === g.id ? "✓ Gekopieerd" : "📋 Kopieer"}
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
