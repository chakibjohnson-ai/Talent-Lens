/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],

  theme: {
    extend: {
      // ─── Semantic kleur-tokens (via CSS variabelen) ───────────────────────
      // Gebruik: bg-surface, text-strong, border-subtle, etc.
      // Waarden wisselen automatisch via .dark op <html>
      colors: {
        // Achtergronden
        'bg-base':    'var(--bg-base)',     // Pagina-achtergrond
        'bg-surface': 'var(--bg-surface)',  // Kaarten / panels
        'bg-raised':  'var(--bg-raised)',   // Modals, dropdowns (verhoogd)
        'bg-hover':   'var(--bg-hover)',    // Hover-state

        // Borders
        'border-subtle':  'var(--border-subtle)',   // Zeer subtiel
        'border-default': 'var(--border-default)',  // Standaard border
        'border-strong':  'var(--border-strong)',   // Focus / actief

        // Typografie
        'text-strong': 'var(--text-strong)', // Koppen / primaire tekst
        'text-base':   'var(--text-base)',   // Body tekst
        'text-muted':  'var(--text-muted)',  // Labels, placeholders, hints

        // Primary — Emerald (MRG brand-DNA, gemoderniseerd)
        'primary': {
          DEFAULT: 'var(--primary)',
          soft:    'var(--primary-soft)',    // Glassmorphism achtergrond
          dim:     'var(--primary-dim)',     // Hover / actief
          strong:  'var(--primary-strong)',  // Extra donker / contrast
        },

        // Accent — Saffron voor secundaire highlights
        'accent': {
          DEFAULT: 'var(--accent)',
          soft:    'var(--accent-soft)',
        },

        // Status
        'danger':  'var(--danger)',
        'warning': 'var(--warning)',
        'success': 'var(--success)',
      },

      // ─── Glassmorphism & glow shadows ─────────────────────────────────────
      boxShadow: {
        'glass':    '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)',
        'glass-lg': '0 8px 48px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glass-xl': '0 16px 64px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glow-sm':  '0 0 20px var(--primary-glow-sm)',
        'glow':     '0 0 40px var(--primary-glow)',
        'glow-lg':  '0 0 72px var(--primary-glow-lg)',
      },

      // ─── Typografie ───────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['3.5rem',  { lineHeight: '1.1',  letterSpacing: '-0.04em', fontWeight: '800' }],
        'title':   ['2rem',    { lineHeight: '1.2',  letterSpacing: '-0.03em', fontWeight: '700' }],
        'heading': ['1.25rem', { lineHeight: '1.3',  letterSpacing: '-0.02em', fontWeight: '600' }],
        'label':   ['0.75rem', { lineHeight: '1',    letterSpacing: '0.06em',  fontWeight: '700' }],
      },

      // ─── Border radii ─────────────────────────────────────────────────────
      borderRadius: {
        'card': '1rem',
        'pill': '9999px',
      },

      // ─── Animaties ────────────────────────────────────────────────────────
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.3s ease both',
      },
    },
  },
  plugins: [],
};
