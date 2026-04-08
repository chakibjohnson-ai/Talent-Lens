import React, { useState } from 'react';
import { generateOutreach, fetchWritingStyle, CHANNELS, FILTER_TYPES } from '../services/ghostwriterService';
function Spin() {
  return <span style={{display:"inline-block",width:11,height:11,border:"2px solid rgba(255,255,255,0.25)",borderTopColor:"white",borderRadius:"50%",animation:"s 0.7s linear infinite",marginRight:6}}/>;
}

export function OutreachView({ user }) {
  const T      = user?.theme || {};
  const accent = T.accent || '#4DC87A';

  // Vacature invoer
  const [functie,  setFunctie]  = useState('');
  const [bedrijf,  setBedrijf]  = useState('');
  const [sector,   setSector]   = useState('');
  const [locatie,  setLocatie]  = useState('');
  const [skills,   setSkills]   = useState('');

  // Generator opties
  const [channel,     setChannel]     = useState('LinkedIn Connect');
  const [styleSource, setStyleSource] = useState('filter');
  const [filterType,  setFilterType]  = useState('Warm');

  // Output
  const [outreachText, setOutreachText] = useState('');
  const [loading,      setLoading]      = useState(false);
  const [err,          setErr]          = useState('');
  const [copied,       setCopied]       = useState(false);

  async function generate() {
    if (!functie.trim()) { setErr('Vul minimaal een functietitel in.'); return; }
    setLoading(true); setErr(''); setOutreachText(''); setCopied(false);
    try {
      let writingSample = '';
      if (styleSource === 'user_sample' && user?.id) {
        writingSample = await fetchWritingStyle(user.id);
        if (!writingSample) {
          setErr('Geen schrijfstijl gevonden. Sla eerst een voorbeeld op via Instellingen → Schrijfstijl.');
          setLoading(false);
          return;
        }
      }
      const vacancy_data = {
        functie,
        company: { name: bedrijf || null },
        sector:  sector || null,
        locatie: locatie || null,
        vereiste_skills: skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      const tekst = await generateOutreach({
        vacancy_data,
        channel,
        style_source:         styleSource,
        filter_type:          filterType,
        writing_style_sample: writingSample,
      });
      setOutreachText(tekst);
    } catch (e) {
      setErr(e.message || 'Genereren mislukt.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width:'100%', boxSizing:'border-box',
    background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:10, color:'rgba(255,255,255,0.88)', padding:'10px 14px',
    fontSize:13, outline:'none', fontFamily:'Inter,sans-serif',
  };

  const labelStyle = {
    fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.3)',
    letterSpacing:0.7, textTransform:'uppercase', margin:'0 0 5px', display:'block',
  };

  return (
    <div style={{ padding:32, maxWidth:720, fontFamily:'Inter,sans-serif' }}>
      <h2 style={{ fontSize:22, fontWeight:700, color:'rgba(255,255,255,0.88)', margin:'0 0 6px', letterSpacing:-0.3 }}>
        ✍️ Outreach Generator
      </h2>
      <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', margin:'0 0 28px' }}>
        Genereer een persoonlijk outreach bericht op basis van een vacature en jouw schrijfstijl.
      </p>

      {/* ── Vacature info ── */}
      <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:24, marginBottom:16 }}>
        <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:1, textTransform:'uppercase', margin:'0 0 18px' }}>
          Vacature
        </p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
          <div>
            <label style={labelStyle}>Functietitel *</label>
            <input value={functie} onChange={e => setFunctie(e.target.value)} placeholder="bijv. QA Manager" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Bedrijf</label>
            <input value={bedrijf} onChange={e => setBedrijf(e.target.value)} placeholder="bijv. Siemens Healthineers" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Sector</label>
            <input value={sector} onChange={e => setSector(e.target.value)} placeholder="bijv. Medical Devices" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Locatie</label>
            <input value={locatie} onChange={e => setLocatie(e.target.value)} placeholder="bijv. Amsterdam" style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Vereiste skills (komma-gescheiden)</label>
          <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="bijv. ISO 13485, Python, Stakeholder management" style={inputStyle} />
        </div>
      </div>

      {/* ── Generator opties ── */}
      <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:24, marginBottom:16 }}>
        <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:1, textTransform:'uppercase', margin:'0 0 18px' }}>
          Kanaal &amp; Stijl
        </p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
          <div>
            <label style={labelStyle}>Kanaal</label>
            <select value={channel} onChange={e => setChannel(e.target.value)} style={{...inputStyle, cursor:'pointer'}}>
              {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Stijlbron</label>
            <select value={styleSource} onChange={e => setStyleSource(e.target.value)} style={{...inputStyle, cursor:'pointer'}}>
              <option value="filter">Stijlfilter</option>
              <option value="user_sample">Mijn schrijfstijl</option>
            </select>
          </div>
        </div>

        {styleSource === 'filter' && (
          <div>
            <label style={labelStyle}>Toon</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {FILTER_TYPES.map(f => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  style={{
                    background: filterType === f ? `${accent}20` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${filterType === f ? accent + '55' : 'rgba(255,255,255,0.08)'}`,
                    color: filterType === f ? accent : 'rgba(255,255,255,0.4)',
                    borderRadius:9999, padding:'6px 14px', fontSize:12, fontWeight:500,
                    cursor:'pointer', transition:'all 0.15s',
                  }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {styleSource === 'user_sample' && (
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.28)', margin:0, lineHeight:1.5 }}>
            ℹ️ Jouw schrijfstijl wordt geladen vanuit <strong style={{color:'rgba(255,255,255,0.45)'}}>Instellingen → Schrijfstijl</strong>.
          </p>
        )}
      </div>

      {/* ── Genereer knop ── */}
      <button
        onClick={generate}
        disabled={loading || !functie.trim()}
        style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          width:'100%', padding:'13px 0', borderRadius:12, fontSize:14, fontWeight:700,
          border:'none', cursor: loading || !functie.trim() ? 'not-allowed' : 'pointer',
          background: loading || !functie.trim()
            ? 'rgba(255,255,255,0.05)'
            : `linear-gradient(135deg,${T.accentDark || '#217A40'},${T.accentMid || '#2FA854'})`,
          color: loading || !functie.trim() ? 'rgba(255,255,255,0.2)' : 'white',
          transition:'all 0.2s', marginBottom:16,
        }}>
        {loading ? <><Spin/>Bericht schrijven…</> : '✨ Genereer Bericht'}
      </button>

      {err && (
        <p style={{ fontSize:13, color:'rgba(248,113,113,0.9)', margin:'0 0 12px' }}>⚠️ {err}</p>
      )}

      {/* ── Output ── */}
      {outreachText && (
        <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${accent}30`, borderRadius:16, overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', borderBottom:`1px solid ${accent}18` }}>
            <span style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.4)', letterSpacing:0.8, textTransform:'uppercase' }}>
              {channel} · {styleSource === 'user_sample' ? 'Eigen stijl' : filterType}
            </span>
            <div style={{ display:'flex', gap:8 }}>
              <button
                onClick={() => { navigator.clipboard?.writeText(outreachText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                style={{
                  background: copied ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${copied ? 'rgba(52,211,153,0.35)' : 'rgba(255,255,255,0.1)'}`,
                  color: copied ? '#34d399' : 'rgba(255,255,255,0.5)',
                  borderRadius:9999, padding:'5px 14px', fontSize:12, fontWeight:500, cursor:'pointer',
                }}>
                {copied ? '✓ Gekopieerd' : '📋 Kopieer'}
              </button>
              <button
                onClick={generate}
                disabled={loading}
                style={{
                  background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
                  color:'rgba(255,255,255,0.4)', borderRadius:9999, padding:'5px 12px',
                  fontSize:12, cursor: loading ? 'not-allowed' : 'pointer',
                }}>
                🔄
              </button>
            </div>
          </div>
          <div style={{ padding:'18px 20px', fontSize:14, color:'rgba(255,255,255,0.82)', lineHeight:1.9, whiteSpace:'pre-wrap' }}>
            {outreachText}
          </div>
        </div>
      )}
    </div>
  );
}
