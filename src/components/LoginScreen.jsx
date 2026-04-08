import React, { useState } from 'react';
import { DOMAIN_THEMES, DEFAULT_THEME, DOMAIN_BANNER } from '../constants/appConstants';
import { sbSignIn, sbGetProfile, SB_SESSION_KEY } from '../services/authService';

// ── Static CSS — module-level zodat het precies één keer geïnjecteerd wordt
// en nooit opnieuw geëvalueerd bij re-renders van de component.
const LOGIN_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing: border-box; font-family: 'Inter', sans-serif; }

  @keyframes blob1 {
    0%,100% { transform: translate(0,0)        scale(1);    opacity:.9;  }
    40%      { transform: translate(55px,-45px) scale(1.12); opacity:1;   }
    70%      { transform: translate(-25px,40px) scale(.92);  opacity:.85; }
  }
  @keyframes blob2 {
    0%,100% { transform: translate(0,0)         scale(1);    opacity:.8;  }
    35%      { transform: translate(-65px,30px)  scale(1.08); opacity:.95; }
    70%      { transform: translate(38px,-55px)  scale(1.14); opacity:.75; }
  }
  @keyframes blob3 {
    0%,100% { transform: translate(0,0)        scale(1);   opacity:.7; }
    50%      { transform: translate(45px,35px)  scale(1.1); opacity:.9; }
  }
  @keyframes blob4 {
    0%,100% { transform: translate(0,0)         scale(1);   opacity:.6;  }
    45%      { transform: translate(-35px,-28px) scale(.88); opacity:.8;  }
    80%      { transform: translate(28px,42px)   scale(1.1); opacity:.65; }
  }
  @keyframes particleDrift {
    0%   { opacity:0;   transform:translateY(0px);    }
    25%  { opacity:.55; }
    75%  { opacity:.25; }
    100% { opacity:0;   transform:translateY(-100px); }
  }
  @keyframes panelIn {
    from { opacity:0; transform:translateY(20px) scale(.97); }
    to   { opacity:1; transform:translateY(0)    scale(1);   }
  }
  @keyframes logoFloat {
    0%,100% { transform:translateY(0px);  }
    50%      { transform:translateY(-5px); }
  }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes glowPulseGreen {
    0%,100% { box-shadow:0 4px 20px rgba(52,160,95,.35); }
    50%      { box-shadow:0 6px 32px rgba(52,160,95,.60); }
  }

  .fl-wrap { position:relative; }
  .fl-input {
    width:100%;
    background:rgba(255,255,255,0.045);
    border:1px solid rgba(255,255,255,0.1);
    border-radius:14px;
    color:rgba(255,255,255,0.88);
    padding:20px 16px 8px;
    font-size:15px;
    outline:none;
    transition:border-color .25s, box-shadow .25s;
    font-family:'Inter',sans-serif;
  }
  .fl-input::placeholder { color:transparent; }
  .fl-input:focus {
    border-color:rgba(52,160,95,.6);
    box-shadow:0 0 0 3px rgba(52,160,95,.14);
  }
  .fl-label {
    position:absolute;
    left:16px; top:50%;
    transform:translateY(-50%);
    font-size:14px;
    color:rgba(255,255,255,0.3);
    pointer-events:none;
    transition:all .25s cubic-bezier(.4,0,.2,1);
    font-family:'Inter',sans-serif;
  }
  .fl-input:focus ~ .fl-label,
  .fl-input:not(:placeholder-shown) ~ .fl-label {
    top:9px; transform:translateY(0);
    font-size:10px; letter-spacing:.7px;
    text-transform:uppercase;
    color:rgba(52,160,95,.9);
    font-weight:700;
  }
  .login-btn { transition:all .22s ease; }
  .login-btn:hover:not(:disabled) {
    animation:glowPulseGreen 1.8s ease-in-out infinite;
    transform:translateY(-1px);
  }
  .login-btn:active:not(:disabled) { transform:scale(.98); }
`;

// ── FloatField — module-level zodat React het nooit opnieuw mountt bij re-render
function FloatField({ id, label, value, onChange, type, onEnter }) {
  return (
    <div className="fl-wrap">
      <input
        id={id}
        type={type || "text"}
        value={value}
        onChange={onChange}
        onKeyDown={e => e.key === "Enter" && onEnter && onEnter()}
        placeholder=" "
        className="fl-input"
        autoComplete={type === "password" ? "current-password" : "email"}
      />
      <label htmlFor={id} className="fl-label">{label}</label>
    </div>
  );
}

const BLOBS = [
  { top:"-12%",  left:"-10%", w:580, h:580, bg:"radial-gradient(ellipse at 40% 40%,rgba(22,163,74,.22) 0%,rgba(16,185,129,.1) 45%,transparent 72%)", anim:"blob1 30s ease-in-out infinite" },
  { bottom:"-8%",right:"-12%",w:640, h:640, bg:"radial-gradient(ellipse at 60% 60%,rgba(20,184,166,.16) 0%,rgba(6,182,212,.07) 45%,transparent 72%)", anim:"blob2 36s ease-in-out infinite" },
  { top:"18%",   right:"3%",  w:360, h:360, bg:"radial-gradient(ellipse at 50% 50%,rgba(251,191,36,.09) 0%,transparent 68%)",                         anim:"blob3 24s ease-in-out infinite" },
  { top:"38%",   left:"28%",  w:500, h:500, bg:"radial-gradient(ellipse at 50% 50%,rgba(15,23,42,.55) 0%,rgba(30,41,59,.3) 55%,transparent 75%)",     anim:"blob4 40s ease-in-out infinite" },
];

const PARTICLES = [
  {x:"11%",y:"21%",s:3,d:"3.2s",del:"0s"},   {x:"79%",y:"14%",s:2,d:"4.6s",del:"1.1s"},
  {x:"87%",y:"61%",s:4,d:"5.1s",del:"0.5s"}, {x:"24%",y:"76%",s:2,d:"3.9s",del:"2.0s"},
  {x:"54%",y:"87%",s:3,d:"4.3s",del:"0.9s"}, {x:"41%",y:"9%", s:2,d:"6.1s",del:"1.7s"},
  {x:"7%", y:"54%",s:3,d:"4.0s",del:"3.1s"}, {x:"66%",y:"36%",s:2,d:"5.4s",del:"0.3s"},
];

export function LoginScreen({ onLogin, logo }) {
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [err,     setErr]     = useState("");
  const [loading, setLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const domain = email.split("@")[1]?.toLowerCase() || "";
  const T      = DOMAIN_THEMES[domain] || DEFAULT_THEME;
  const accent = T.accent || "#34A05F";

  // Dynamische tenant CSS — alleen accent-kleur, geen volledige stijlen
  const tenantCSS = `
    .fl-input:focus {
      border-color:${accent}99;
      box-shadow:0 0 0 3px ${accent}22;
    }
    .fl-input:focus ~ .fl-label,
    .fl-input:not(:placeholder-shown) ~ .fl-label { color:${accent}; }
    @keyframes glowPulseTenant {
      0%,100% { box-shadow:0 4px 20px ${accent}55; }
      50%      { box-shadow:0 6px 32px ${accent}88; }
    }
    .login-btn:hover:not(:disabled) {
      animation:glowPulseTenant 1.8s ease-in-out infinite;
      transform:translateY(-1px);
    }
  `;

  async function attempt() {
    if (!email || !pass) return;
    setLoading(true);
    setErr("");
    try {
      const session = await sbSignIn(email.trim(), pass);
      const profile = await sbGetProfile(session.access_token);
      localStorage.setItem(SB_SESSION_KEY, JSON.stringify(session));
      setFadeOut(true);
      setTimeout(() => onLogin({
        email:       email.trim(),
        domain,
        isAdmin:     profile?.is_org_admin || profile?.is_team_admin || false,
        accessToken: session.access_token,
        profile,
      }), 600);
    } catch (e) {
      setLoading(false);
      setErr(e.message || "Inloggen mislukt.");
    }
  }

  return (
    <div style={{
      minHeight:"100vh", background:"#080d09",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:24, position:"relative", overflow:"hidden",
      opacity:fadeOut ? 0 : 1,
      transform:fadeOut ? "scale(1.05)" : "scale(1)",
      transition:"opacity 0.6s cubic-bezier(0.4,0,0.2,1),transform 0.6s cubic-bezier(0.4,0,0.2,1)",
      pointerEvents:fadeOut ? "none" : "auto",
    }}>
      <style>{LOGIN_STYLE}</style>
      <style>{tenantCSS}</style>

      {/* Achtergrond: blobs + particles + grid */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"}}>
        {BLOBS.map((b, i) => (
          <div key={i} style={{
            position:"absolute",
            top:b.top, bottom:b.bottom, left:b.left, right:b.right,
            width:b.w, height:b.h,
            borderRadius:"50%",
            background:b.bg,
            animation:b.anim,
            willChange:"transform, opacity",
          }}/>
        ))}
        {PARTICLES.map((p, i) => (
          <div key={i} style={{
            position:"absolute", left:p.x, top:p.y,
            width:p.s, height:p.s, borderRadius:"50%",
            background:"rgba(52,211,153,.5)",
            animation:`particleDrift ${p.d} ease-in-out ${p.del} infinite`,
          }}/>
        ))}
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:"linear-gradient(rgba(255,255,255,.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.013) 1px,transparent 1px)",
          backgroundSize:"48px 48px",
        }}/>
      </div>

      {/* Login panel */}
      <div style={{position:"relative",zIndex:10,width:"100%",maxWidth:400,animation:"panelIn .5s cubic-bezier(.22,1,.36,1) both"}}>

        {/* Card */}
        <div style={{
          background:"rgba(12,20,14,.6)",
          backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)",
          border:`1px solid ${DOMAIN_THEMES[domain] ? accent+"40" : "rgba(255,255,255,.08)"}`,
          borderRadius:26, padding:"38px 34px 32px",
          boxShadow:`0 32px 72px rgba(0,0,0,.55),0 0 0 1px ${accent}10 inset,0 0 ${DOMAIN_THEMES[domain] ? "48px" : "0px"} ${accent}18`,
          transition:"box-shadow .4s ease,border-color .4s ease",
        }}>

          {/* Domain banner — animates in via maxHeight */}
          <div style={{
            overflow:"hidden",
            maxHeight:DOMAIN_BANNER[domain] ? 70 : 0,
            marginBottom:DOMAIN_BANNER[domain] ? 18 : 0,
            opacity:DOMAIN_BANNER[domain] ? 1 : 0,
            transition:"max-height .4s ease,margin-bottom .4s ease,opacity .4s ease",
          }}>
            {DOMAIN_BANNER[domain] && (
              <img src={DOMAIN_BANNER[domain]} alt="" style={{width:"100%",borderRadius:11,height:66,objectFit:"cover",objectPosition:"center",display:"block"}}/>
            )}
          </div>

          {/* Logo + titel */}
          <div style={{textAlign:"center",marginBottom:28}}>
            <h2 style={{fontSize:26,fontWeight:800,color:"rgba(255,255,255,.93)",margin:"0 0 4px",letterSpacing:-.8}}>
              <span style={{color:accent}}>Talent</span> Lens
            </h2>
            <div style={{height:22,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {domain && DOMAIN_THEMES[domain]
                ? <span style={{fontSize:10,fontWeight:700,color:accent,background:accent+"15",border:`1px solid ${accent}30`,borderRadius:9999,padding:"3px 12px",letterSpacing:.9,textTransform:"uppercase"}}>{T.label}</span>
                : <p style={{fontSize:11,color:"rgba(255,255,255,.18)",margin:0,letterSpacing:.3}}>Morgan Recruitment Group</p>
              }
            </div>
          </div>

          {/* Invoervelden */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <FloatField id="tl-email" label="E-mailadres" value={email} onChange={e => setEmail(e.target.value)} type="email"    onEnter={attempt}/>
            <FloatField id="tl-pass"  label="Wachtwoord"  value={pass}  onChange={e => setPass(e.target.value)}  type="password" onEnter={attempt}/>

            <div style={{minHeight:18}}>
              {err && (
                <div style={{display:"flex",alignItems:"center",gap:7,padding:"8px 12px",background:"rgba(248,113,113,.07)",border:"1px solid rgba(248,113,113,.22)",borderRadius:10}}>
                  <span style={{fontSize:12}}>⚠️</span>
                  <p style={{fontSize:12,color:"rgba(248,113,113,.9)",margin:0,fontWeight:500}}>{err}</p>
                </div>
              )}
            </div>

            <button
              className="login-btn"
              onClick={attempt}
              disabled={loading || !email || !pass}
              style={{
                background: (loading || !email || !pass) ? "rgba(255,255,255,.05)" : T.btnGrad,
                color:      (loading || !email || !pass) ? "rgba(255,255,255,.25)" : "white",
                border:"none", borderRadius:14, padding:"14px 0",
                fontSize:15, fontWeight:700, cursor:(loading || !email || !pass) ? "not-allowed" : "pointer",
                marginTop:4, display:"flex", alignItems:"center", justifyContent:"center", gap:9, letterSpacing:-.2,
                boxShadow:(!loading && email && pass) ? `0 4px 22px ${accent}38` : "none",
              }}>
              {loading
                ? <><span style={{display:"inline-block",width:15,height:15,border:"2.5px solid rgba(255,255,255,.25)",borderTopColor:"white",borderRadius:"50%",animation:"spin .7s linear infinite"}}/> Bezig…</>
                : "Inloggen →"
              }
            </button>
          </div>

          <p style={{fontSize:10,color:"rgba(255,255,255,.09)",textAlign:"center",marginTop:22,lineHeight:1.6}}>
            Alleen toegankelijk voor MRG medewerkers
          </p>
        </div>

        {/* Badge */}
        <div style={{textAlign:"center",marginTop:14,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
          <div style={{width:4,height:4,borderRadius:"50%",background:accent,boxShadow:`0 0 6px ${accent}`}}/>
          <span style={{fontSize:10,color:"rgba(255,255,255,.15)",letterSpacing:.8,textTransform:"uppercase"}}>Secure · AI-Native Platform</span>
          <div style={{width:4,height:4,borderRadius:"50%",background:accent,boxShadow:`0 0 6px ${accent}`}}/>
        </div>

        <p style={{textAlign:"center",marginTop:10,fontSize:9,color:"rgba(255,255,255,.07)",letterSpacing:.5}}>
          software by JohnsonStack
        </p>

      </div>
    </div>
  );
}
