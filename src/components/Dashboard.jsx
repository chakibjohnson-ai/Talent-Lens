import React from 'react';

// Helper: vertaling bron-icon
function srcIcon(source) {
  if (source === 'cv')     return '📄';
  if (source === 'indeed') return '🔎';
  return '💼';
}

// Kandidaat-initiaal avatar
function Avatar({ name, accent }) {
  const letter = name?.trim()?.[0]?.toUpperCase() || '?';
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: `${accent}20`,
      border: `1px solid ${accent}35`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 15, fontWeight: 700, color: accent, flexShrink: 0,
      fontFamily: 'Inter, sans-serif',
    }}>
      {letter}
    </div>
  );
}

export const Dashboard = ({ stats, verticalColors, verticals, history = [], user }) => {
  const T      = user?.theme || {};
  const accent = T.accent || '#4DC87A';

  // ── Derived data ─────────────────────────────────────────────────────────────
  const totalSkills = history.reduce((sum, h) => sum + (h.matched_skills?.length || 0), 0);

  const recentActivities = history.slice(0, 10);

  const topKandidaten = history
    .filter(h => (h.matched_skills?.length || 0) > 0)
    .sort((a, b) => (b.matched_skills?.length || 0) - (a.matched_skills?.length || 0))
    .slice(0, 6);

  // ── Card-component ───────────────────────────────────────────────────────────
  const Card = ({ children, style = {} }) => (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 20,
      padding: '20px 22px',
      ...style,
    }}>
      {children}
    </div>
  );

  const SectionTitle = ({ icon, title }) => (
    <p style={{
      fontSize: 13, fontWeight: 700,
      color: 'var(--text-strong)',
      margin: '0 0 14px',
      display: 'flex', alignItems: 'center', gap: 7,
      fontFamily: 'Inter, sans-serif',
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      {title}
    </p>
  );

  const today = new Date().toLocaleDateString('nl-NL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div style={{
      padding: '24px 28px',
      fontFamily: 'Inter, sans-serif',
      background: 'var(--bg-base)',
      minHeight: '100vh',
      overflowY: 'auto',
    }}>

      {/* ── Header ── */}
      <header style={{ marginBottom: 24 }}>
        <h1 style={{
          fontSize: 26, fontWeight: 800, margin: 0,
          color: 'var(--text-strong)', letterSpacing: -0.5,
        }}>
          Recruiter Command Center
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0', fontWeight: 400 }}>
          {today}
        </p>
      </header>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Geanalyseerd',  value: history.length || '—',  icon: '👥', sub: 'kandidaten' },
          { label: 'Hard Skills',   value: totalSkills  || '—',    icon: '🎯', sub: 'gematched' },
          { label: 'Verticals',     value: verticals.length,       icon: '📊', sub: 'actief' },
          { label: 'Gems',          value: '—',                    icon: '💎', sub: 'opgeslagen' },
        ].map((s, i) => (
          <Card key={i}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>{s.icon}</div>
            <p style={{
              fontSize: 26, fontWeight: 800,
              color: 'var(--text-strong)',
              margin: 0, lineHeight: 1,
            }}>
              {s.value}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '5px 0 0', fontWeight: 500 }}>
              {s.label} {s.sub}
            </p>
          </Card>
        ))}
      </div>

      {/* ── Recente Activiteit — full width ── */}
      <Card style={{ marginBottom: 24 }}>
        <SectionTitle icon="⚡" title="Recente Activiteit" />
        {recentActivities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Nog geen activiteit.<br />Start een analyse.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 8 }}>
            {recentActivities.map((a, i) => (
              <div key={a.key || i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 12,
                background: 'var(--bg-raised)',
                border: '1px solid var(--border-subtle)',
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{srcIcon(a.source)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: 0, fontSize: 13, fontWeight: 600,
                    color: 'var(--text-strong)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {a.name || 'Onbekend'}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                    {a.current_role || 'Profiel geanalyseerd'} · {new Date(a.savedAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {a.total_years_experience && (
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: accent,
                    background: `${accent}15`,
                    border: `1px solid ${accent}30`,
                    borderRadius: 9999, padding: '2px 8px', flexShrink: 0,
                  }}>
                    {a.total_years_experience}j
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Top Matches Grid ── */}
      {topKandidaten.length > 0 && (
        <Card>
          <SectionTitle icon="🏆" title="Top Kandidaten" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12 }}>
            {topKandidaten.map((k, i) => {
              const skillCount = k.matched_skills?.length || 0;
              const firstVertical = (() => {
                const v = k.matched_verticals?.[0];
                return typeof v === 'object' ? v?.item : v;
              })();
              return (
                <div key={k.key || i} style={{
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 16, padding: '14px 16px',
                  transition: 'border-color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${accent}40`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <Avatar name={k.name} accent={accent} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0, fontSize: 13, fontWeight: 600,
                        color: 'var(--text-strong)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {k.name || 'Onbekend'}
                      </p>
                      <p style={{
                        margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {k.current_role || '—'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 5 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: accent, background: `${accent}15`,
                      border: `1px solid ${accent}30`,
                      borderRadius: 9999, padding: '2px 9px',
                    }}>
                      ✓ {skillCount} skills
                    </span>
                    {k.location && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        📍 {k.location}
                      </span>
                    )}
                  </div>

                  {firstVertical && (() => {
                    const vc = verticalColors[firstVertical];
                    return vc ? (
                      <div style={{ marginTop: 8 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 500,
                          color: vc.color, background: vc.bg,
                          border: `1px solid ${vc.border}`,
                          borderRadius: 9999, padding: '2px 8px',
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: vc.dot, display: 'inline-block' }} />
                          {firstVertical}
                        </span>
                      </div>
                    ) : null;
                  })()}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Lege state — geen history */}
      {history.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '40px 24px', marginTop: 0 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-strong)', margin: 0 }}>
            Klaar voor actie
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 0' }}>
            Analyseer je eerste kandidaat via de Analyse sectie in de sidebar.
          </p>
        </Card>
      )}
    </div>
  );
};
