import React, { useState } from 'react';

export function FeedbackWidget({ context, accent }) {
  const [vote, setVote] = useState(null);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
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
        <button onClick={() => { setVote("up"); setSent(true); }}
          style={{background:vote==="up"?"rgba(52,211,153,0.15)":"rgba(255,255,255,0.05)",border:`1px solid ${vote==="up"?"rgba(52,211,153,0.4)":"rgba(255,255,255,0.1)"}`,color:vote==="up"?"rgba(52,211,153,0.9)":"rgba(255,255,255,0.45)",borderRadius:9999,padding:"4px 11px",fontSize:13,cursor:"pointer",transition:"all 0.18s"}}>
          👍
        </button>
        <button onClick={() => setVote(vote === "down" ? null : "down")}
          style={{background:vote==="down"?"rgba(248,113,113,0.12)":"rgba(255,255,255,0.05)",border:`1px solid ${vote==="down"?"rgba(248,113,113,0.35)":"rgba(255,255,255,0.1)"}`,color:vote==="down"?"rgba(248,113,113,0.9)":"rgba(255,255,255,0.45)",borderRadius:9999,padding:"4px 11px",fontSize:13,cursor:"pointer",transition:"all 0.18s"}}>
          👎
        </button>
      </div>
      {vote === "down" && (
        <div style={{marginTop:10,display:"flex",gap:8,alignItems:"center"}}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && text.trim() && setSent(true)}
            placeholder="Wat kan er beter?"
            style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:9,color:"rgba(255,255,255,0.8)",padding:"7px 11px",fontSize:12,outline:"none",fontFamily:"Inter,sans-serif",transition:"border-color 0.2s"}}
          />
          <button
            onClick={() => text.trim() && setSent(true)}
            disabled={!text.trim()}
            style={{background:text.trim()?c+"22":"rgba(255,255,255,0.04)",border:`1px solid ${text.trim()?c+"45":"rgba(255,255,255,0.08)"}`,color:text.trim()?"rgba(255,255,255,0.85)":"rgba(255,255,255,0.25)",borderRadius:9,padding:"7px 14px",fontSize:12,fontWeight:500,cursor:text.trim()?"pointer":"not-allowed",transition:"all 0.18s",whiteSpace:"nowrap"}}>
            Verzend
          </button>
        </div>
      )}
    </div>
  );
}
