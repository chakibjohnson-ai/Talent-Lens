import React, { useState } from 'react';

export function SalesToolkit({ result, accent, onSaveGem }) {
  const [actionContent, setActionContent] = useState(null);
  const [actionType, setActionType]       = useState("");
  const [isLoading, setIsLoading]         = useState(false);
  const [copied, setCopied]               = useState(false);
  const c = accent || "#34A05F";

  const topSkill1 = result?.matched_skills?.[0]?.item || result?.matched_skills?.[0] || "Life Sciences";
  const topSkill2 = result?.matched_skills?.[1]?.item || result?.matched_skills?.[1] || "Medical Devices";
  const naam      = result?.name || "de kandidaat";
  const rol       = result?.current_role || "Sales Professional";

  function handleGenerate(type) {
    setActionType(type);
    setActionContent(null);
    setIsLoading(true);
    setTimeout(() => {
      if (type === "call") {
        setActionContent([
          { label: "Doel",             text: `Pitch ${naam} direct telefonisch bij de hiring manager.` },
          { label: "Opening",          text: `"Hi [Naam], ik bel je kort omdat ik net een ${rol} sprak die exact de ${topSkill1} ervaring heeft waar jullie vaak naar zoeken..."` },
          { label: "Hook (USP's)",     text: `Benoem direct de <strong>${topSkill1}</strong> en <strong>${topSkill2}</strong>. Koppel dit aan een concreet resultaat.` },
          { label: "Bezwaar opvangen", text: `"Ik begrijp dat je druk bent — stuur ik je het profiel alvast op? Dan heb je het voor de vergadering."` },
          { label: "Call to Action",   text: `"Wanneer ben je vanmiddag 5 minuten beschikbaar om zijn profiel door te nemen?"` },
        ]);
      } else {
        setActionContent([
          { label: "Vraag 1 — Sales Track Record",     text: `"Kun je een voorbeeld geven van een complex sales-traject binnen Medical Devices of ${topSkill1} dat je recent hebt gesloten? Wat was jouw persoonlijke rol?"` },
          { label: "Vraag 2 — Regulatory Awareness",   text: `"Hoe ga je om met de strenge regulatory compliance (ISO 13485 / MDR) tijdens je pitch aan een ziekenhuisinkoper?"` },
          { label: "Vraag 3 — Leercurve & Adaptability",text:`"Je hebt sterke ervaring met ${topSkill2}, maar hoe snel kun je je inwerken in een compleet nieuwe productgroep — en hoe pak je dat concreet aan?"` },
          { label: "Bonus — Motivatie",                text: `"Wat trekt je specifiek aan bij onze klant ten opzichte van je huidige werkgever?"` },
        ]);
      }
      setIsLoading(false);
    }, 950);
  }

  function copyText() {
    if (!actionContent) return;
    const txt = actionContent.map(b => `${b.label}:\n${b.text.replace(/<[^>]+>/g, "")}`).join("\n\n");
    navigator.clipboard?.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  const Spinner = () => (
    <span style={{display:"inline-block",width:10,height:10,border:"2px solid rgba(255,255,255,0.25)",borderTopColor:"white",borderRadius:"50%",animation:"s 0.7s linear infinite"}}/>
  );

  return (
    <div style={{marginTop:16,background:"linear-gradient(135deg,rgba(255,255,255,0.03) 0%,rgba(255,255,255,0.015) 100%)",border:`1px solid ${c}28`,borderRadius:16,overflow:"hidden",backdropFilter:"blur(20px)"}}>
      {/* Header */}
      <div style={{padding:"12px 16px 10px",borderBottom:`1px solid ${c}18`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,borderRadius:9,background:c+"18",border:`1px solid ${c}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🚀</div>
          <span style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.88)",letterSpacing:-0.2}}>Sales & Actiecentrum</span>
        </div>
        <span style={{fontSize:10,color:"rgba(255,255,255,0.25)",letterSpacing:0.5,textTransform:"uppercase"}}>Quick Actions</span>
      </div>

      {/* Action buttons */}
      <div style={{padding:"12px 16px",display:"flex",gap:8,flexWrap:"wrap"}}>
        <button
          onClick={e => { e.stopPropagation(); handleGenerate("call"); }}
          disabled={isLoading && actionType === "call"}
          style={{display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:9999,border:`1px solid ${c}40`,background:actionType==="call"&&actionContent?c+"18":"rgba(255,255,255,0.05)",color:actionType==="call"&&actionContent?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.65)",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}>
          {isLoading && actionType === "call" ? <><Spinner/> Genereren...</> : "📞 Genereer Belscript"}
        </button>
        <button
          onClick={e => { e.stopPropagation(); handleGenerate("interview"); }}
          disabled={isLoading && actionType === "interview"}
          style={{display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:9999,border:"1px solid rgba(167,139,250,0.35)",background:actionType==="interview"&&actionContent?"rgba(167,139,250,0.14)":"rgba(255,255,255,0.05)",color:actionType==="interview"&&actionContent?"rgba(192,132,252,0.95)":"rgba(255,255,255,0.65)",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}>
          {isLoading && actionType === "interview" ? <><Spinner/> Genereren...</> : "🎯 Interview Vragen"}
        </button>
      </div>

      {/* Output */}
      {actionContent && (
        <div style={{margin:"0 12px 12px",background:"rgba(0,0,0,0.25)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"14px 16px",position:"relative",backdropFilter:"blur(12px)"}}>
          <div style={{position:"absolute",top:10,right:10,display:"flex",gap:5}}>
            {onSaveGem && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  const txt = actionContent.map(b => b.label + ":\n" + b.text.replace(/<[^>]+>/g, "")).join("\n\n");
                  onSaveGem({ content: txt, type: actionType === "call" ? "Belscript" : "Interview" });
                }}
                style={{background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.3)",color:"rgba(251,191,36,0.85)",borderRadius:9999,padding:"3px 10px",fontSize:11,cursor:"pointer",whiteSpace:"nowrap"}}>
                💎 Gem
              </button>
            )}
            <button
              onClick={e => { e.stopPropagation(); copyText(); }}
              style={{background:copied?"rgba(52,211,153,0.15)":"rgba(255,255,255,0.07)",border:`1px solid ${copied?"rgba(52,211,153,0.3)":"rgba(255,255,255,0.12)"}`,color:copied?"rgba(52,211,153,0.9)":"rgba(255,255,255,0.4)",borderRadius:9999,padding:"3px 10px",fontSize:11,cursor:"pointer",transition:"all 0.18s"}}>
              {copied ? "✓ Gekopieerd" : "📋 Kopieer"}
            </button>
          </div>
          <div style={{paddingRight:80}}>
            {actionContent.map((block, i) => (
              <div key={i} style={{marginBottom: i < actionContent.length - 1 ? 12 : 0}}>
                <p style={{fontSize:10,fontWeight:700,color:actionType==="call"?c:"rgba(192,132,252,0.8)",margin:"0 0 4px",letterSpacing:0.8,textTransform:"uppercase"}}>{block.label}</p>
                <p style={{fontSize:12,color:"rgba(255,255,255,0.72)",margin:0,lineHeight:1.7,fontWeight:400}} dangerouslySetInnerHTML={{__html: block.text}}/>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
