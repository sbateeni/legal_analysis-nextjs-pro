import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import { Theme, lightTheme, darkTheme } from '@utils/theme';

interface ThemeContextValue {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  theme: Theme;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    idbGet('legal_dark_mode').then((savedTheme: string | undefined) => {
      if (!isMounted) return;
      if (savedTheme === '1') setDarkMode(true);
      setMounted(true);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    idbSet('legal_dark_mode', darkMode ? '1' : '0');
  }, [darkMode, mounted]);

  const theme = useMemo<Theme>(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  const value = useMemo<ThemeContextValue>(() => ({ darkMode, setDarkMode, theme, mounted }), [darkMode, theme, mounted]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
} 