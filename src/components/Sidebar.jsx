import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const TL_LOGO = "https://cebpwkavlxipkrqixbab.supabase.co/storage/v1/object/public/app-assets/Afbeeldingen/TL_logo_trans.png";

// Route-sets voor actieve styling
const WORKSPACE_IDS = new Set(["analyse", "geschiedenis", "folder", "vacature", "boolean", "frontsheet"]);

export const Sidebar = ({
  activeTab,
  setActiveTab,
  navItems,
  workspaceItems = [],
  bottomItems = [],
  // legacy prop — still accepted, mapped to workspaceItems if workspaceItems is empty
  intelligenceItems = [],
  onShowMyGems,
  onLogout,
  user,
  gems = [],
}) => {
  const T      = user?.theme || {};
  const accent = T.accent || "#4DC87A";
  const { isDark, toggleTheme } = useTheme();
  const myGems = gems.filter(g => g.author === "Mijzelf");

  const items = workspaceItems.length > 0 ? workspaceItems : intelligenceItems;

  // ── Base nav button style ─────────────────────────────────────────────────
  const base = {
    width: "100%", display: "flex", alignItems: "center", gap: 9,
    padding: "8px 11px", borderRadius: 9,
    border: "1px solid transparent", background: "transparent",
    fontSize: 13, cursor: "pointer", textAlign: "left",
    transition: "all 0.14s", fontFamily: "Inter, sans-serif",
  };

  function navStyle(isActive) {
    return isActive
      ? { ...base, border: `1px solid ${accent}35`, background: `${accent}14`, color: accent, fontWeight: 600 }
      : { ...base, color: "var(--text-muted)", fontWeight: 400 };
  }

  function onEnter(e, isActive) {
    if (!isActive) { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text-base)"; }
  }
  function onLeave(e, isActive) {
    if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }
  }

  return (
    <aside style={{
      width: 216, flexShrink: 0,
      background: "var(--bg-surface)",
      borderRight: "1px solid var(--border-subtle)",
      display: "flex", flexDirection: "column",
      height: "100vh", fontFamily: "Inter, sans-serif",
    }}>

      {/* ── Logo ── */}
      <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-strong)", letterSpacing: -0.4 }}>
              <span style={{ color: accent }}>Talent</span> Lens
            </p>
            {T.label && (
              <span style={{
                fontSize: 9, fontWeight: 600, color: accent,
                background: `${accent}18`, border: `1px solid ${accent}30`,
                borderRadius: 9999, padding: "1px 7px", letterSpacing: 0.7, textTransform: "uppercase",
              }}>
                {T.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Nav container — flex-col h-full ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", padding: "8px 6px 0" }}>

        {/* Top nav (Dashboard) */}
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <motion.button key={item.id} onClick={() => setActiveTab(item.id)}
              whileTap={{ scale: 0.98 }}
              style={navStyle(isActive)}
              onMouseEnter={e => onEnter(e, isActive)}
              onMouseLeave={e => onLeave(e, isActive)}>
              {item.label}
            </motion.button>
          );
        })}

        {/* Workspace section */}
        {items.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <p style={{
              fontSize: 9, fontWeight: 700, color: "var(--text-muted)",
              letterSpacing: 1.1, textTransform: "uppercase",
              padding: "0 11px", margin: "0 0 5px",
            }}>
              Workspace
            </p>
            {items.map(item => {
              const isActive = activeTab === item.id;
              return (
                <motion.button key={item.id} onClick={() => setActiveTab(item.id)}
                  whileTap={{ scale: 0.98 }}
                  style={navStyle(isActive)}
                  onMouseEnter={e => onEnter(e, isActive)}
                  onMouseLeave={e => onLeave(e, isActive)}>
                  {item.label}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Spacer — duwt footer naar beneden */}
        <div style={{ flex: 1 }} />

        {/* Mijn Gems */}
        {onShowMyGems && (
          <div style={{ padding: "0 0 4px" }}>
            <button onClick={onShowMyGems} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "7px 11px", borderRadius: 9,
              border: "1px solid rgba(251,191,36,0.22)", background: "rgba(251,191,36,0.07)",
              color: "rgba(251,191,36,0.85)", fontSize: 12, fontWeight: 500,
              cursor: "pointer", width: "100%", fontFamily: "Inter, sans-serif", transition: "all 0.14s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(251,191,36,0.14)"; e.currentTarget.style.color = "rgba(251,191,36,1)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(251,191,36,0.07)"; e.currentTarget.style.color = "rgba(251,191,36,0.85)"; }}>
              <span>💎 Mijn Gems</span>
              {myGems.length > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(251,191,36,0.2)", borderRadius: 9999, padding: "1px 7px" }}>
                  {myGems.length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: "6px 6px 10px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: 4 }}>

        {/* Bottom items (Instellingen) — mt-auto effect via being in footer */}
        {bottomItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <motion.button key={item.id} onClick={() => setActiveTab(item.id)}
              whileTap={{ scale: 0.98 }}
              style={navStyle(isActive)}
              onMouseEnter={e => onEnter(e, isActive)}
              onMouseLeave={e => onLeave(e, isActive)}>
              {item.label}
            </motion.button>
          );
        })}

        {/* Theme toggle */}
        <button onClick={toggleTheme} style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "7px 11px", borderRadius: 9,
          border: "1px solid var(--border-subtle)", background: "var(--bg-raised)",
          color: "var(--text-muted)", fontSize: 12, fontWeight: 500,
          cursor: "pointer", width: "100%", fontFamily: "Inter, sans-serif", transition: "all 0.14s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text-base)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-raised)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
          {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

        {/* User info */}
        {user?.email && (
          <div style={{
            padding: "8px 10px", borderRadius: 9,
            background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", flexShrink: 0, display: "inline-block" }} />
              <span style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                {user.email}
              </span>
            </div>

            {/* ── GOD MODE BADGE — goud met glow-puls ── */}
            {user?.profile?.is_tester && (
              <div style={{
                display: "flex", alignItems: "center", gap: 5,
                marginBottom: 5,
                background: "linear-gradient(135deg,rgba(251,191,36,0.15),rgba(245,158,11,0.08))",
                border: "1px solid rgba(251,191,36,0.45)",
                borderRadius: 7, padding: "4px 9px",
                boxShadow: "0 0 10px rgba(251,191,36,0.2)",
                animation: "godmodePulse 2.4s ease-in-out infinite",
              }}>
                <span style={{ fontSize: 11 }}>⚡</span>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: "#fbbf24",
                  letterSpacing: 0.9, textTransform: "uppercase",
                }}>
                  God Mode
                </span>
                <style>{`
                  @keyframes godmodePulse {
                    0%,100% { box-shadow: 0 0 6px rgba(251,191,36,0.18); border-color: rgba(251,191,36,0.35); }
                    50%     { box-shadow: 0 0 14px rgba(251,191,36,0.45); border-color: rgba(251,191,36,0.7); }
                  }
                `}</style>
              </div>
            )}

            {onLogout && (
              <button onClick={onLogout} style={{
                width: "100%", padding: "5px 0", borderRadius: 7,
                border: "1px solid var(--border-subtle)", background: "transparent",
                color: "var(--text-muted)", fontSize: 11,
                cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "all 0.14s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text-base)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}>
                Uitloggen
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
