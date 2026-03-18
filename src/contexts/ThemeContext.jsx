import React, { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'tl-theme';

const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
  isDark: true,
});

/**
 * ThemeProvider — beheert dark/light mode voor de hele app.
 *
 * - Laadt voorkeur uit localStorage (valt terug op 'dark')
 * - Schrijft 'dark' class op <html> zodat Tailwind darkMode: 'class' werkt
 * - Biedt toggleTheme() aan via context
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    // Systeemvoorkeur als fallback
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Synchroniseer <html> class bij elke theme-wissel
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Hook — gebruik in elke component: const { isDark, toggleTheme } = useTheme() */
export function useTheme() {
  return useContext(ThemeContext);
}
