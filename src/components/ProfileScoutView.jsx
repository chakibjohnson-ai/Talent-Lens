import React, { useState, useRef } from 'react';
import { parseSearchQuery, saveSearchProfile } from '../services/profileScoutService';
import { generateOutreach, CHANNELS, FILTER_TYPES } from '../services/ghostwriterService';
import { callClaude } from '../lib/claudeClient';

// ── Mini spinner ──────────────────────────────────────────────────────────────
function Spin({ color = 'rgba(167,139,250,0.9)' }) {
  return (
    <span style={{
      display: 'inline-block', width: 13, height: 13,
      border: `2px solid rgba(167,139,250,0.25)`, borderTopColor: color,
      borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginRight: 7,
    }} />
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ label, value, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20,
      background: `${color}18`, border: `1px solid ${color}40`,
      fontSize: 12, color, fontFamily: 'Inter, sans-serif',
    }}>
      <span style={{ opacity: 0.7, fontSize: 11 }}>{label}</span>
      <strong>{value}</strong>
    </span>
  );
}

// ── Boolean systeem prompt (zelfde als BooleanView) ───────────────────────────
const BOOL_SYS = `Expert Boolean search architect voor Medical Devices, Pharma, Healthcare, Life Sciences. Retourneer UITSLUITEND geldige JSON op 1 regel zonder backticks of uitleg.
CRUCIALE JSON REGELS:
1. Gebruik ALTIJD dubbele aanhalingstekens (") voor alle JSON-keys en om de string-waarden heen.
2. BINNENIN de boolean strings (de zoektermen) gebruik je ALTIJD enkele aanhalingstekens (').
Schema: {"functie":null,"synoniemen":[],"locatie":null,"skills":[],"senioriteit":null,"boolean_strings":{"linkedin":{"job_titles":null,"keywords":null,"companies":null},"indeed":{"what":null,"where":null},"recruitcrm":{"keywords":null}},"target_bedrijven":[{"naam":null,"reden":null}],"recruiter_tips":[]}`;

export function ProfileScoutView({ user, onGoToBoolean }) {
  const T      = user?.theme || {};
  const accent = T.accent || '#a78bfa';

  // ── State ──────────────────────────────────────────────────────────────────
  const [query,      setQuery]      = useState('');
  const [parsing,    setParsing]    = useState(false);
  const [parsed,     setParsed]     = useState(null);   // gestructureerde data
  const [parseErr,   setParseErr]   = useState('');

  const [boolLoading, setBoolLoading] = useState(false);
  const [boolResult,  setBoolResult]  = useState(null);
  const [boolPlatform,setBoolPlatform]= useState('linkedin');
  const [boolErr,     setBoolErr]     = useState('');
  const [copied,      setCopied]      = useState('');

  const [outreachLoading, setOutreachLoading] = useState(false);
  const [outreachText,    setOutreachText]    = useState('');
  const [outreachErr,     setOutreachErr]     = useState('');
  const [outreachChannel, setOutreachChannel] = useState('InMail');
  const [outreachStyle,   setOutreachStyle]   = useState('Warm');
  const [outreachCopied,  setOutreachCopied]  = useState(false);

  const textareaRef = useRef(null);

  // ── Parse handler ──────────────────────────────────────────────────────────
  async function handleParse() {
    if (!query.trim()) return;
    setParsing(true); setParseErr(''); setParsed(null);
    setBoolResult(null); setOutreachText('');
    try {
      const result = await parseSearchQuery(query, apiKey);
      setParsed(result);
      // Sla op in Supabase (fire-and-forget)
      if (user?.profile?.id) {
        saveSearchProfile(user.profile.id, query, result).catch(() => {});
      }
    } catch (e) {
      setParseErr(e.message);
    } finally {
      setParsing(false);
    }
  }

  // ── Boolean genereren ──────────────────────────────────────────────────────
  async function handleGenerateBoolean() {
    if (!parsed) return;
    setBoolLoading(true); setBoolErr(''); setBoolResult(null);

    const prompt = buildBooleanPrompt(parsed, query);

    try {
      const data = await callClaude(
        {
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1200,
          system: BOOL_SYS,
          messages: [{ role: 'user', content: prompt }],
        },
        null,
      );
      const raw = data.content?.[0]?.text?.trim() || '{}';
      let parsed_bool;
      try { parsed_bool = JSON.parse(raw); } catch { throw new Error('Kon boolean niet verwerken.'); }
      setBoolResult(parsed_bool);
    } catch (e) {
      setBoolErr(e.message);
    } finally {
      setBoolLoading(false);
    }
  }

  function buildBooleanPrompt(p, originalQuery) {
    const parts = [];
    if (p.sector)         parts.push(`Functie/sector: ${p.sector}`);
    if (p.min_experience) parts.push(`Minimale ervaring: ${p.min_experience} jaar`);
    if (p.regions?.length)parts.push(`Locatie: ${p.regions.join(', ')}`);
    if (p.languages?.length) parts.push(`Talen: ${p.languages.join(', ')}`);
    if (p.tags?.length)   parts.push(`Extra tags: ${p.tags.join(', ')}`);
    return `Genereer een Boolean search voor deze kandidaatprofielzoekopdracht:\n${parts.join('\n')}\n\nOriginele zoekopdracht: "${originalQuery}"`;
  }

  // ── Copy helper ────────────────────────────────────────────────────────────
  function copyToClipboard(text, key) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 1500);
    });
  }

  // ── Outreach genereren ─────────────────────────────────────────────────────
  async function handleGenerateOutreach() {
    if (!parsed) return;
    setOutreachLoading(true); setOutreachErr(''); setOutreachText('');
    try {
      const vacancyData = {
        functie:         parsed.sector || query,
        company:         { name: '' },
        sector:          parsed.sector || '',
        locatie:         parsed.regions?.[0] || '',
        vereiste_skills: parsed.tags?.slice(0, 6) || [],
        kernvereisten:   [
          parsed.min_experience ? `${parsed.min_experience} jaar ervaring` : null,
          parsed.sector,
          parsed.languages?.length ? `Talen: ${parsed.languages.join(', ')}` : null,
        ].filter(Boolean).join(', '),
      };
      const text = await generateOutreach({
        vacancy_data:          vacancyData,
        channel:               outreachChannel,
        style_source:          'filter',
        filter_type:           outreachStyle,
        writing_style_sample:  '',
      });
      setOutreachText(text);
    } catch (e) {
      setOutreachErr(e.message);
    } finally {
      setOutreachLoading(false);
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const boolStr = boolResult?.boolean_strings;
  const platformStr = {
    linkedin:  boolStr?.linkedin ? `Job titles: ${boolStr.linkedin.job_titles || ''}\nKeywords: ${boolStr.linkedin.keywords || ''}${boolStr.linkedin.companies ? `\nCompanies: ${boolStr.linkedin.companies}` : ''}` : null,
    indeed:    boolStr?.indeed   ? `What: ${boolStr.indeed.what || ''}\nWhere: ${boolStr.indeed.where || ''}` : null,
    recruitcrm:boolStr?.recruitcrm ? boolStr.recruitcrm.keywords || '' : null,
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const card = {
    background: 'var(--bg-card, #1a1a2e)',
    border: '1px solid var(--border, rgba(255,255,255,0.08))',
    borderRadius: 12, padding: 20, marginBottom: 16,
  };
  const label = { fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted, #888)', textTransform: 'uppercase', marginBottom: 8, display: 'block' };
  const btn = (color = accent, disabled = false) => ({
    background: disabled ? 'rgba(255,255,255,0.04)' : color,
    color: disabled ? '#555' : '#fff',
    border: 'none', borderRadius: 8, padding: '9px 18px',
    fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'Inter, sans-serif', display: 'inline-flex', alignItems: 'center',
    transition: 'opacity 0.15s',
  });
  const platformBtn = (active) => ({
    padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
    border: `1px solid ${active ? accent : 'rgba(255,255,255,0.1)'}`,
    background: active ? `${accent}20` : 'transparent',
    color: active ? accent : 'var(--text-muted, #888)',
    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
  });

  return (
    <div style={{ padding: '24px 32px', maxWidth: 780, fontFamily: 'Inter, sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text, #fff)' }}>
          🎯 Profile Scout
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-muted, #888)' }}>
          Beschrijf in eigen woorden wie je zoekt. De AI haalt de criteria eruit.
        </p>
      </div>

      {/* Zoekbalk */}
      <div style={card}>
        <label style={label}>Wie zoek je?</label>
        <textarea
          ref={textareaRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleParse(); }}
          placeholder="Bijv: 2 jaar ervaring longzorg Brabant, bij voorkeur Engels sprekend"
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'var(--bg-input, rgba(255,255,255,0.05))',
            border: '1px solid var(--border, rgba(255,255,255,0.1))',
            borderRadius: 8, padding: '12px 14px',
            color: 'var(--text, #fff)', fontSize: 15, fontFamily: 'Inter, sans-serif',
            resize: 'vertical', outline: 'none',
          }}
        />
        <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={handleParse}
            disabled={parsing || !query.trim()}
            style={btn(accent, parsing || !query.trim())}
          >
            {parsing && <Spin color="#fff" />}
            {parsing ? 'Analyseren…' : '🔍 Analyseer zoekopdracht'}
          </button>
          {query && <span style={{ fontSize: 11, color: 'var(--text-muted,#888)' }}>⌘+Enter</span>}
        </div>
        {parseErr && <p style={{ margin: '10px 0 0', fontSize: 12, color: '#f87171' }}>⚠️ {parseErr}</p>}
      </div>

      {/* Gevonden Criteria badges */}
      {parsed && (
        <div style={{ ...card, borderColor: `${accent}30` }}>
          <label style={label}>Gevonden Criteria</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {parsed.min_experience != null && (
              <Badge label="Ervaring" value={`≥ ${parsed.min_experience} jaar`} color="#34d399" />
            )}
            {parsed.sector && (
              <Badge label="Sector" value={parsed.sector} color={accent} />
            )}
            {parsed.regions.map(r => (
              <Badge key={r} label="Regio" value={r} color="#60a5fa" />
            ))}
            {parsed.languages.map(l => (
              <Badge key={l} label="Taal" value={l} color="#fbbf24" />
            ))}
            {parsed.tags.map(t => (
              <Badge key={t} label="Tag" value={t} color="rgba(255,255,255,0.6)" />
            ))}
          </div>

          {/* Actieknoppen */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={handleGenerateBoolean}
              disabled={boolLoading}
              style={btn('#3b82f6', boolLoading)}
            >
              {boolLoading && <Spin color="#fff" />}
              {boolLoading ? 'Genereren…' : '⚡ Genereer Boolean'}
            </button>
            <button
              onClick={handleGenerateOutreach}
              disabled={outreachLoading}
              style={btn('#8b5cf6', outreachLoading)}
            >
              {outreachLoading && <Spin color="#fff" />}
              {outreachLoading ? 'Genereren…' : '✍️ Stuur naar Ghostwriter'}
            </button>
          </div>
        </div>
      )}

      {/* Boolean resultaat */}
      {(boolResult || boolErr) && (
        <div style={card}>
          <label style={label}>Boolean Zoekstring</label>
          {boolErr && <p style={{ fontSize: 12, color: '#f87171' }}>⚠️ {boolErr}</p>}
          {boolResult && (
            <>
              {/* Platform tabs */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {['linkedin', 'indeed', 'recruitcrm'].map(p => (
                  <button key={p} onClick={() => setBoolPlatform(p)} style={platformBtn(boolPlatform === p)}>
                    {p === 'linkedin' ? '🔵 LinkedIn' : p === 'indeed' ? '🟠 Indeed' : '🟢 RecruitCRM'}
                  </button>
                ))}
              </div>

              {/* String */}
              {platformStr[boolPlatform] ? (
                <div style={{ position: 'relative' }}>
                  <pre style={{
                    background: 'var(--bg-input, rgba(0,0,0,0.3))',
                    border: '1px solid var(--border, rgba(255,255,255,0.08))',
                    borderRadius: 8, padding: '12px 14px',
                    fontSize: 12, color: 'var(--text, #fff)',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    fontFamily: 'monospace', margin: 0,
                  }}>
                    {platformStr[boolPlatform]}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(platformStr[boolPlatform], boolPlatform)}
                    style={{ ...btn(copied === boolPlatform ? '#10b981' : 'rgba(255,255,255,0.1)'), marginTop: 8, fontSize: 12 }}
                  >
                    {copied === boolPlatform ? '✅ Gekopieerd!' : '📋 Kopieer'}
                  </button>
                </div>
              ) : (
                <p style={{ fontSize: 12, color: 'var(--text-muted,#888)' }}>Geen string beschikbaar voor dit platform.</p>
              )}

              {/* Recruiter tips */}
              {boolResult.recruiter_tips?.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <span style={{ ...label, marginBottom: 6 }}>Recruiter tips</span>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--text-muted,#888)', lineHeight: 1.7 }}>
                    {boolResult.recruiter_tips.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Ghostwriter sectie */}
      {parsed && (
        <div style={card}>
          <label style={label}>Ghostwriter — Outreach op basis van profiel</label>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-muted,#888)', display: 'block', marginBottom: 4 }}>Kanaal</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {CHANNELS.map(c => (
                  <button key={c} onClick={() => setOutreachChannel(c)} style={platformBtn(outreachChannel === c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted,#888)', display: 'block', marginBottom: 4 }}>Schrijfstijl</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {FILTER_TYPES.map(f => (
                  <button key={f} onClick={() => setOutreachStyle(f)} style={platformBtn(outreachStyle === f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateOutreach}
            disabled={outreachLoading}
            style={btn('#8b5cf6', outreachLoading)}
          >
            {outreachLoading && <Spin color="#fff" />}
            {outreachLoading ? 'Genereren…' : '✍️ Genereer outreach'}
          </button>

          {outreachErr && <p style={{ margin: '10px 0 0', fontSize: 12, color: '#f87171' }}>⚠️ {outreachErr}</p>}

          {outreachText && (
            <div style={{ marginTop: 14 }}>
              <pre style={{
                background: 'var(--bg-input, rgba(0,0,0,0.3))',
                border: '1px solid var(--border, rgba(255,255,255,0.08))',
                borderRadius: 8, padding: '12px 14px',
                fontSize: 13, color: 'var(--text, #fff)',
                whiteSpace: 'pre-wrap', fontFamily: 'Inter, sans-serif', margin: 0, lineHeight: 1.6,
              }}>
                {outreachText}
              </pre>
              <button
                onClick={() => { navigator.clipboard.writeText(outreachText); setOutreachCopied(true); setTimeout(() => setOutreachCopied(false), 1500); }}
                style={{ ...btn(outreachCopied ? '#10b981' : 'rgba(255,255,255,0.1)'), marginTop: 8, fontSize: 12 }}
              >
                {outreachCopied ? '✅ Gekopieerd!' : '📋 Kopieer bericht'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
