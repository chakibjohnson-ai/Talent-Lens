import React, { useState, useRef, useEffect } from 'react';
import { SUPABASE_URL, SB_HEADERS } from '../lib/supabaseClient';
import { sbSaveProfile } from '../services/authService';
import { saveWritingStyle, fetchWritingStyle, saveOfficeZip, fetchOfficeZip } from '../services/ghostwriterService';

// ── Helpers ──────────────────────────────────────────────────────────────────

function Label({ children }) {
  return (
    <p style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.35)',
                letterSpacing:0.9, textTransform:'uppercase', margin:'0 0 6px' }}>
      {children}
    </p>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', readOnly = false }) {
  return (
    <div style={{ marginBottom:16 }}>
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          width:'100%', boxSizing:'border-box',
          background: readOnly ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
          border:'1px solid rgba(255,255,255,0.1)',
          borderRadius:10, color: readOnly ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.88)',
          padding:'10px 14px', fontSize:13, outline:'none', fontFamily:'Inter,sans-serif',
          cursor: readOnly ? 'default' : 'text',
        }}
      />
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
      borderRadius:16, padding:24, marginBottom:16, ...style,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.3)',
                letterSpacing:1, textTransform:'uppercase', margin:'0 0 18px' }}>
      {children}
    </p>
  );
}

// ── Licentie status badge ─────────────────────────────────────────────────────
function LicentieBadge({ status, isTester }) {
  if (isTester) {
    return (
      <span style={{ background:'rgba(167,139,250,0.12)', border:'1px solid rgba(167,139,250,0.3)',
                     color:'rgba(192,132,252,0.9)', borderRadius:9999, padding:'4px 12px',
                     fontSize:11, fontWeight:600 }}>
        🧪 Tester
      </span>
    );
  }
  const map = {
    active:   { bg:'rgba(52,211,153,0.1)',  border:'rgba(52,211,153,0.3)',  color:'#34d399', label:'✓ Actief' },
    past_due: { bg:'rgba(251,191,36,0.1)',  border:'rgba(251,191,36,0.3)',  color:'#fbbf24', label:'⚠ Betaling vereist' },
    canceled: { bg:'rgba(248,113,113,0.1)', border:'rgba(248,113,113,0.3)', color:'#f87171', label:'✗ Geannuleerd' },
    free:     { bg:'rgba(255,255,255,0.05)', border:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.35)', label:'Gratis' },
  };
  const s = map[status] || map.free;
  return (
    <span style={{ background:s.bg, border:`1px solid ${s.border}`, color:s.color,
                   borderRadius:9999, padding:'4px 12px', fontSize:11, fontWeight:600 }}>
      {s.label}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
export function InstellingenView({ user, onUserUpdate }) {
  const T      = user?.theme || {};
  const accent = T.accent || '#4DC87A';

  // ── Profiel state ──
  const [naam,     setNaam]     = useState(user?.profile?.naam     || '');
  const [locatie,  setLocatie]  = useState(user?.profile?.locatie  || '');
  const [telefoon, setTelefoon] = useState(user?.profile?.telefoon || '');
  const [uurloon,  setUurloon]  = useState(String(user?.profile?.uurloon || ''));
  const [saving,   setSaving]   = useState(false);
  const [saveOk,   setSaveOk]   = useState(false);
  const [saveErr,  setSaveErr]  = useState('');

  // ── Licentie state ──
  const [licCode,    setLicCode]    = useState('');
  const [licLoading, setLicLoading] = useState(false);
  const [licMsg,     setLicMsg]     = useState(null);  // { ok, text }

  // ── Stripe state ──
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeErr,     setStripeErr]     = useState('');

  // ── Kantoorpostcode state ──
  const [officeZip,     setOfficeZip]     = useState('');
  const [zipSaving,     setZipSaving]     = useState(false);
  const [zipOk,         setZipOk]         = useState(false);
  const [zipErr,        setZipErr]        = useState('');

  // ── Tone of Voice state ──
  const [tovSample,  setTovSample]  = useState('');
  const [tovSaving,  setTovSaving]  = useState(false);
  const [tovOk,      setTovOk]      = useState(false);
  const [tovErr,     setTovErr]     = useState('');

  useEffect(() => {
    if (!user?.id) return;
    fetchWritingStyle(user.id).then(s => { if (s) setTovSample(s); }).catch(() => {});
    fetchOfficeZip(user.id).then(z => { if (z) setOfficeZip(z); }).catch(() => {});
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveZip() {
    if (!user?.id) return;
    setZipSaving(true); setZipErr(''); setZipOk(false);
    try {
      await saveOfficeZip(user.id, officeZip);
      setZipOk(true);
      setTimeout(() => setZipOk(false), 3000);
    } catch (e) {
      setZipErr(e.message || 'Opslaan mislukt.');
    } finally {
      setZipSaving(false);
    }
  }

  async function saveTov() {
    if (!user?.id) return;
    setTovSaving(true); setTovErr(''); setTovOk(false);
    try {
      await saveWritingStyle(user.id, tovSample);
      setTovOk(true);
      setTimeout(() => setTovOk(false), 3000);
    } catch (e) {
      setTovErr(e.message || 'Opslaan mislukt.');
    } finally {
      setTovSaving(false);
    }
  }

  const subscriptionStatus = user?.profile?.subscription_status || 'free';
  const isTester           = user?.profile?.is_tester || false;
  const hasAccess          = isTester || subscriptionStatus === 'active';
  const orgId              = user?.profile?.org_id;
  const isAdmin            = !!(user?.profile?.is_org_admin || user?.profile?.is_team_admin);

  // ── Admin Asset Management state ──
  const ASSET_SLOTS = [
    { key: 'banner_green',       label: 'Morgan Green Banner',       path: 'LinkedIn%20Banner%20Morgan%20Green.png' },
    { key: 'banner_lab',         label: 'Morgan Lab Banner',         path: 'LinkedIn%20Banner%20Morgan%20Lab.png' },
    { key: 'banner_black',       label: 'Morgan Black Banner',       path: 'LinkedIn%20Banner%20Morgan%20Black.png' },
    { key: 'banner_recruitment', label: 'Morgan Recruitment Banner', path: 'Linkedin%20Banner%20MRG.png' },
    { key: 'tl_logo',            label: 'TalentLens Logo',           path: 'TL_logo_trans.png' },
  ];
  const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/app-assets/Afbeeldingen`;
  const STORAGE_PUB  = `${SUPABASE_URL}/storage/v1/object/public/app-assets/Afbeeldingen`;

  const [assetStatus, setAssetStatus] = useState({}); // { [key]: { loading, ok, err } }
  const fileInputRefs = useRef({});

  async function uploadAsset(slot, file) {
    if (!file || !user?.accessToken) return;
    setAssetStatus(prev => ({ ...prev, [slot.key]: { loading: true, ok: false, err: null } }));
    try {
      const res = await fetch(
        `${STORAGE_BASE}/${decodeURIComponent(slot.path)}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            'Content-Type': file.type || 'image/png',
            'x-upsert': 'true',
          },
          body: file,
        }
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `Upload mislukt (HTTP ${res.status})`);
      }
      setAssetStatus(prev => ({ ...prev, [slot.key]: { loading: false, ok: true, err: null } }));
      setTimeout(() => setAssetStatus(prev => ({ ...prev, [slot.key]: { ...prev[slot.key], ok: false } })), 3500);
    } catch (e) {
      setAssetStatus(prev => ({ ...prev, [slot.key]: { loading: false, ok: false, err: e.message } }));
    }
  }

  // ── Profiel opslaan ─────────────────────────────────────────────────────────
  async function saveProfile() {
    if (!user?.accessToken || !user?.email) return;
    setSaving(true); setSaveErr(''); setSaveOk(false);
    try {
      await sbSaveProfile(user.accessToken, user.email, {
        naam, locatie, telefoon,
        uurloon: uurloon ? parseFloat(uurloon) : null,
      });
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 3000);
      onUserUpdate?.({ ...user, profile: { ...user.profile, naam, locatie, telefoon, uurloon } });
    } catch (e) {
      setSaveErr(e.message || 'Opslaan mislukt.');
    } finally {
      setSaving(false);
    }
  }

  // ── Licentiecode inwisselen ─────────────────────────────────────────────────
  async function redeemCode() {
    const code = licCode.trim().toUpperCase();
    if (!code) { setLicMsg({ ok:false, text:'Voer een code in.' }); return; }
    if (!user?.accessToken) return;

    setLicLoading(true); setLicMsg(null);
    try {
      // Stap 1: zoek de code (ongebruikt)
      const r1 = await fetch(
        `${SUPABASE_URL}/rest/v1/license_keys` +
        `?code=eq.${encodeURIComponent(code)}` +
        `&is_redeemed=eq.false` +
        `&select=id,org_id` +
        `&limit=1`,
        { headers: { ...SB_HEADERS, Authorization: `Bearer ${user.accessToken}` } }
      );
      const keys = await r1.json();
      if (!Array.isArray(keys) || keys.length === 0) {
        setLicMsg({ ok:false, text:'Code niet gevonden of al gebruikt.' });
        return;
      }
      const { id: keyId, org_id } = keys[0];

      // Stap 2: markeer als ingelost
      const r2 = await fetch(
        `${SUPABASE_URL}/rest/v1/license_keys?id=eq.${keyId}`,
        {
          method:'PATCH',
          headers: {
            ...SB_HEADERS,
            Authorization: `Bearer ${user.accessToken}`,
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            is_redeemed: true,
            redeemed_by: user.profile?.user_id
              || JSON.parse(atob(user.accessToken.split('.')[1])).sub
              || null,
            redeemed_at: new Date().toISOString(),
          }),
        }
      );
      if (!r2.ok) throw new Error('Activatie vastleggen mislukt.');

      // Stap 3: koppel gebruiker aan organisatie + zet subscription active
      const r3 = await fetch(
        `${SUPABASE_URL}/rest/v1/user_profiles?email=eq.${encodeURIComponent(user.email)}`,
        {
          method:'PATCH',
          headers: {
            ...SB_HEADERS,
            Authorization: `Bearer ${user.accessToken}`,
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            org_id,
            subscription_status: 'active',
          }),
        }
      );
      if (!r3.ok) throw new Error('Profiel koppelen mislukt.');

      setLicMsg({ ok:true, text:'✓ Licentie succesvol geactiveerd! Je hebt nu volledige toegang.' });
      setLicCode('');

      // Update lokale user state
      onUserUpdate?.({
        ...user,
        profile: { ...user.profile, org_id, subscription_status: 'active' },
      });
    } catch (e) {
      setLicMsg({ ok:false, text: e.message || 'Activatie mislukt.' });
    } finally {
      setLicLoading(false);
    }
  }

  // ── Stripe Billing Portal openen ────────────────────────────────────────────
  async function openStripePortal() {
    if (!user?.accessToken) return;
    setStripeLoading(true); setStripeErr('');
    try {
      const r = await fetch(
        `${SUPABASE_URL}/functions/v1/stripe-portal`,
        {
          method:'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify({ return_url: window.location.href }),
        }
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Stripe portal kon niet worden geopend.');
      window.open(d.url, '_blank');
    } catch (e) {
      setStripeErr(e.message || 'Verbinding met Stripe mislukt.');
    } finally {
      setStripeLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding:32, maxWidth:680, fontFamily:'Inter,sans-serif' }}>
      <h2 style={{ fontSize:22, fontWeight:700, color:'rgba(255,255,255,0.88)',
                   margin:'0 0 24px', letterSpacing:-0.3 }}>
        ⚙️ Instellingen
      </h2>

      {/* ── ABONNEMENT STATUS ── */}
      <Card>
        <SectionTitle>Licentie &amp; Abonnement</SectionTitle>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                      flexWrap:'wrap', gap:12 }}>
          <div>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.55)', margin:'0 0 6px' }}>
              Huidige status
            </p>
            <LicentieBadge status={subscriptionStatus} isTester={isTester} />
            {orgId && (
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.25)', margin:'8px 0 0' }}>
                Enterprise licentie · Org ID: {orgId.slice(0, 8)}…
              </p>
            )}
          </div>

          {/* Stripe portal knop — alleen tonen bij Stripe abonnement */}
          {!isTester && subscriptionStatus !== 'free' && (
            <div>
              <button
                onClick={openStripePortal}
                disabled={stripeLoading}
                style={{
                  display:'flex', alignItems:'center', gap:8,
                  background: stripeLoading ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)',
                  border:'1px solid rgba(255,255,255,0.12)',
                  color: stripeLoading ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.75)',
                  borderRadius:10, padding:'10px 18px', fontSize:13, fontWeight:500,
                  cursor: stripeLoading ? 'not-allowed' : 'pointer',
                  transition:'all 0.2s',
                }}>
                {stripeLoading ? '⏳ Laden…' : '💳 Beheer Abonnement'}
              </button>
              {stripeErr && (
                <p style={{ fontSize:12, color:'rgba(248,113,113,0.85)', margin:'8px 0 0' }}>
                  ⚠️ {stripeErr}
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* ── LICENTIE ACTIVEREN ── */}
      {!hasAccess && (
        <Card style={{ border:`1px solid ${accent}20`, background:`${accent}05` }}>
          <SectionTitle>Licentie Activeren</SectionTitle>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', margin:'0 0 16px', lineHeight:1.65 }}>
            Heb je een licentiecode ontvangen van je organisatie? Voer hem hieronder in om volledige toegang te krijgen.
          </p>

          <div style={{ display:'flex', gap:8 }}>
            <input
              type="text"
              value={licCode}
              onChange={e => setLicCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && redeemCode()}
              placeholder="bijv. TL-ENT-2024-ABCD"
              maxLength={32}
              style={{
                flex:1, background:'rgba(255,255,255,0.05)',
                border:`1px solid ${licMsg ? (licMsg.ok ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)') : 'rgba(255,255,255,0.12)'}`,
                borderRadius:10, color:'rgba(255,255,255,0.88)',
                padding:'10px 14px', fontSize:13, outline:'none',
                fontFamily:'Inter,sans-serif', letterSpacing:0.5,
              }}
            />
            <button
              onClick={redeemCode}
              disabled={licLoading || !licCode.trim()}
              style={{
                background: licLoading || !licCode.trim()
                  ? 'rgba(255,255,255,0.04)'
                  : `linear-gradient(135deg,${T.accentDark || '#217A40'},${T.accentMid || '#2FA854'})`,
                border: 'none',
                color: licLoading || !licCode.trim() ? 'rgba(255,255,255,0.25)' : 'white',
                borderRadius:10, padding:'10px 20px', fontSize:13, fontWeight:600,
                cursor: licLoading || !licCode.trim() ? 'not-allowed' : 'pointer',
                whiteSpace:'nowrap', transition:'all 0.2s',
              }}>
              {licLoading ? '⏳ Activeren…' : '🔑 Activeer'}
            </button>
          </div>

          {licMsg && (
            <p style={{
              fontSize:13, margin:'12px 0 0', lineHeight:1.55,
              color: licMsg.ok ? '#34d399' : 'rgba(248,113,113,0.9)',
            }}>
              {licMsg.text}
            </p>
          )}
        </Card>
      )}

      {/* ── PROFIEL ── */}
      <Card>
        <SectionTitle>Mijn Profiel</SectionTitle>

        <Field
          label="E-mailadres"
          value={user?.email || ''}
          onChange={() => {}}
          readOnly
        />
        <Field
          label="Naam"
          value={naam}
          onChange={setNaam}
          placeholder="Jouw volledige naam"
        />
        <Field
          label="Locatie"
          value={locatie}
          onChange={setLocatie}
          placeholder="bijv. Amsterdam"
        />
        <Field
          label="Telefoon"
          value={telefoon}
          onChange={setTelefoon}
          placeholder="+31 6 12345678"
          type="tel"
        />
        <Field
          label="Uurloon (€)"
          value={uurloon}
          onChange={setUurloon}
          placeholder="bijv. 95"
          type="number"
        />

        <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:4 }}>
          <button
            onClick={saveProfile}
            disabled={saving}
            style={{
              background: saving
                ? 'rgba(255,255,255,0.04)'
                : `linear-gradient(135deg,${T.accentDark || '#217A40'},${T.accentMid || '#2FA854'})`,
              border:'none',
              color: saving ? 'rgba(255,255,255,0.3)' : 'white',
              borderRadius:10, padding:'10px 22px', fontSize:13, fontWeight:600,
              cursor: saving ? 'not-allowed' : 'pointer', transition:'all 0.2s',
            }}>
            {saving ? '⏳ Opslaan…' : '💾 Profiel Opslaan'}
          </button>
          {saveOk && (
            <span style={{ fontSize:13, color:'#34d399' }}>✓ Opgeslagen</span>
          )}
          {saveErr && (
            <span style={{ fontSize:13, color:'rgba(248,113,113,0.9)' }}>⚠️ {saveErr}</span>
          )}
        </div>
      </Card>

      {/* ── ADMIN ASSET MANAGEMENT — alleen voor org/team admins ── */}
      {isAdmin && (
        <Card style={{ border: '1px solid rgba(251,191,36,0.18)', background: 'rgba(251,191,36,0.03)' }}>
          <SectionTitle>🛠 Beheer Assets (Admin)</SectionTitle>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '0 0 20px', lineHeight: 1.6 }}>
            Upload Morgan-labels en logo's naar de <code style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>app-assets</code> bucket.
            Bestandsnamen worden automatisch overschreven (upsert).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ASSET_SLOTS.map(slot => {
              const st  = assetStatus[slot.key] || {};
              const url = `${STORAGE_PUB}/${slot.path}`;
              return (
                <div key={slot.key} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12, padding: '12px 14px',
                }}>
                  {/* Thumbnail */}
                  <img
                    src={url}
                    alt={slot.label}
                    onError={e => { e.target.style.opacity = '0.12'; }}
                    style={{ width: 52, height: 32, objectFit: 'contain', borderRadius: 6,
                             background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                             flexShrink: 0 }}
                  />

                  {/* Label + URL */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>
                      {slot.label}
                    </p>
                    <a
                      href={url} target="_blank" rel="noreferrer"
                      style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', wordBreak: 'break-all',
                               textDecoration: 'none' }}
                      onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
                      onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.25)'}
                    >
                      {decodeURIComponent(slot.path)}
                    </a>
                  </div>

                  {/* Status */}
                  {st.ok  && <span style={{ fontSize: 12, color: '#34d399', flexShrink: 0 }}>✓ Geüpload</span>}
                  {st.err && <span style={{ fontSize: 11, color: 'rgba(248,113,113,0.9)', flexShrink: 0, maxWidth: 140 }}>⚠ {st.err}</span>}

                  {/* Upload knop */}
                  <input
                    ref={el => fileInputRefs.current[slot.key] = el}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadAsset(slot, f); e.target.value = ''; }}
                  />
                  <button
                    onClick={() => fileInputRefs.current[slot.key]?.click()}
                    disabled={st.loading}
                    style={{
                      flexShrink: 0,
                      background: st.loading ? 'rgba(255,255,255,0.04)' : 'rgba(251,191,36,0.1)',
                      border: '1px solid rgba(251,191,36,0.3)',
                      color: st.loading ? 'rgba(255,255,255,0.2)' : 'rgba(251,191,36,0.9)',
                      borderRadius: 9, padding: '7px 14px', fontSize: 12, fontWeight: 600,
                      cursor: st.loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
                    }}
                    onMouseEnter={e => { if (!st.loading) e.currentTarget.style.background = 'rgba(251,191,36,0.18)'; }}
                    onMouseLeave={e => { if (!st.loading) e.currentTarget.style.background = 'rgba(251,191,36,0.10)'; }}
                  >
                    {st.loading ? '⏳ Uploaden…' : '⬆ Upload'}
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── KANTOORPOSTCODE ── */}
      <Card>
        <SectionTitle>📍 Kantoorlocatie</SectionTitle>
        <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', margin:'0 0 14px', lineHeight:1.65 }}>
          Vul de postcode van jouw kantoor in. Deze wordt gebruikt om automatisch de reistijd van kandidaten te berekenen.
        </p>
        <div style={{ display:'flex', gap:8 }}>
          <input
            type="text"
            value={officeZip}
            onChange={e => setOfficeZip(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && saveZip()}
            placeholder="bijv. 3511 BN (Utrecht) of 1012 AB (Amsterdam)"
            maxLength={7}
            style={{
              flex:1, background:'rgba(255,255,255,0.05)',
              border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:10, color:'rgba(255,255,255,0.88)',
              padding:'10px 14px', fontSize:13, outline:'none',
              fontFamily:'Inter,sans-serif', letterSpacing:0.5,
            }}
          />
          <button
            onClick={saveZip}
            disabled={zipSaving || !officeZip.trim()}
            style={{
              background: zipSaving || !officeZip.trim()
                ? 'rgba(255,255,255,0.04)'
                : `linear-gradient(135deg,${T.accentDark || '#217A40'},${T.accentMid || '#2FA854'})`,
              border:'none',
              color: zipSaving || !officeZip.trim() ? 'rgba(255,255,255,0.25)' : 'white',
              borderRadius:10, padding:'10px 20px', fontSize:13, fontWeight:600,
              cursor: zipSaving || !officeZip.trim() ? 'not-allowed' : 'pointer',
              whiteSpace:'nowrap', transition:'all 0.2s',
            }}>
            {zipSaving ? '⏳ Opslaan…' : '💾 Opslaan'}
          </button>
        </div>
        <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:12 }}>
          {zipOk  && <span style={{ fontSize:13, color:'#34d399' }}>✓ Opgeslagen</span>}
          {zipErr && <span style={{ fontSize:13, color:'rgba(248,113,113,0.9)' }}>⚠️ {zipErr}</span>}
          {!zipOk && !zipErr && (
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.2)' }}>
              Per recruiter opgeslagen — elke gebruiker vult zijn eigen kantoorlocatie in.
            </span>
          )}
        </div>
      </Card>

      {/* ── TONE OF VOICE ── */}
      <Card>
        <SectionTitle>✍️ Schrijfstijl (Ghostwriter)</SectionTitle>
        <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', margin:'0 0 6px', lineHeight:1.65 }}>
          Plak hieronder een stukje tekst dat jouw schrijfstijl vertegenwoordigt — bijv. een eerder bericht of e-mail.
        </p>
        <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', margin:'0 0 14px', lineHeight:1.55,
                    background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
                    borderRadius:8, padding:'8px 12px' }}>
          ℹ️ Let op: we analyseren alleen je Tone of Voice (stijl/vibe), niet de opbouw van je bericht.
        </p>
        <textarea
          rows={6}
          value={tovSample}
          onChange={e => setTovSample(e.target.value)}
          placeholder="Bijv: 'Hey [naam], ik zag je profiel voorbijkomen en dacht meteen: dit is iemand die we moeten spreken…'"
          style={{
            width:'100%', boxSizing:'border-box', resize:'vertical',
            background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:10, color:'rgba(255,255,255,0.85)', padding:'10px 14px',
            fontSize:13, outline:'none', fontFamily:'Inter,sans-serif', lineHeight:1.6,
          }}
        />
        <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:12 }}>
          <button
            onClick={saveTov}
            disabled={tovSaving || !tovSample.trim()}
            style={{
              background: tovSaving || !tovSample.trim()
                ? 'rgba(255,255,255,0.04)'
                : `linear-gradient(135deg,${T.accentDark || '#217A40'},${T.accentMid || '#2FA854'})`,
              border:'none',
              color: tovSaving || !tovSample.trim() ? 'rgba(255,255,255,0.25)' : 'white',
              borderRadius:10, padding:'10px 22px', fontSize:13, fontWeight:600,
              cursor: tovSaving || !tovSample.trim() ? 'not-allowed' : 'pointer',
              transition:'all 0.2s',
            }}>
            {tovSaving ? '⏳ Opslaan…' : '💾 Stijl Opslaan'}
          </button>
          {tovOk  && <span style={{ fontSize:13, color:'#34d399' }}>✓ Opgeslagen</span>}
          {tovErr && <span style={{ fontSize:13, color:'rgba(248,113,113,0.9)' }}>⚠️ {tovErr}</span>}
          {tovSample.trim() && (
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.2)', marginLeft:'auto' }}>
              {tovSample.length} tekens
            </span>
          )}
        </div>
      </Card>

      {/* ── SYSTEEM INFO ── */}
      <Card>
        <SectionTitle>Systeem</SectionTitle>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[
            { label:'Verbinding',  value:'✓ Online',     color:'#34d399' },
            { label:'Omgeving',    value:'Productie',     color:'rgba(255,255,255,0.5)' },
            { label:'Versie',      value:'TL v2.4',       color:'rgba(255,255,255,0.5)' },
            { label:'Domein',      value:user?.domain || '—', color:'rgba(255,255,255,0.5)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background:'rgba(255,255,255,0.02)',
                                      border:'1px solid rgba(255,255,255,0.05)',
                                      borderRadius:10, padding:'10px 14px' }}>
              <p style={{ fontSize:10, color:'rgba(255,255,255,0.25)',
                          fontWeight:600, textTransform:'uppercase',
                          letterSpacing:0.8, margin:'0 0 4px' }}>
                {label}
              </p>
              <p style={{ fontSize:13, color, fontWeight:500, margin:0 }}>{value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
