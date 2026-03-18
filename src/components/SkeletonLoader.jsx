import React from 'react';

// ── Basis skeleton-blok met shimmer-animatie ─────────────────────────────────
function Bone({ w = '100%', h = 14, radius = 8, style = {} }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: 'var(--sk-bg, rgba(255,255,255,0.06))',
      backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
      backgroundSize: '200% 100%',
      animation: 'skShimmer 1.6s ease-in-out infinite',
      flexShrink: 0,
      ...style,
    }} />
  );
}

// ── App shell skeleton — toont sidebar + hoofd-content ───────────────────────
export function AppSkeleton() {
  return (
    <>
      <style>{`
        @keyframes skShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{
        display: 'flex', height: '100vh', overflow: 'hidden',
        background: 'var(--bg-base)',
      }}>
        {/* ── Sidebar skeleton ── */}
        <aside style={{
          width: 216, flexShrink: 0,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex', flexDirection: 'column',
          padding: '16px 10px',
          gap: 8,
        }}>
          {/* Logo area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Bone w={32} h={32} radius={9999} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <Bone w="70%" h={12} />
              <Bone w="45%" h={9} />
            </div>
          </div>
          {/* Nav items */}
          {[...Array(8)].map((_, i) => (
            <Bone key={i} h={34} radius={9} style={{ opacity: 1 - i * 0.08 }} />
          ))}
          <div style={{ flex: 1 }} />
          {/* Footer */}
          <Bone h={34} radius={9} />
          <Bone h={34} radius={9} />
          <Bone h={60} radius={12} />
        </aside>

        {/* ── Content skeleton ── */}
        <main style={{ flex: 1, padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
            <Bone w="38%" h={28} radius={10} />
            <Bone w="22%" h={13} />
          </div>
          {/* Stat cards row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                borderRadius: 20, padding: '20px 22px',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <Bone w={32} h={32} radius={9999} />
                <Bone w="55%" h={22} radius={8} />
                <Bone w="70%" h={11} />
              </div>
            ))}
          </div>
          {/* Main card */}
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            borderRadius: 20, padding: '20px 22px', flex: 1,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <Bone w="25%" h={16} />
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px',
                background: 'var(--bg-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
              }}>
                <Bone w={36} h={36} radius={9999} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Bone w="45%" h={13} />
                  <Bone w="30%" h={10} />
                </div>
                <Bone w={40} h={22} radius={9999} />
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
