import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import { Theme, ColorScheme, getThemeByColor } from '@utils/theme';

interface ThemeContextValue {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  colorScheme: ColorScheme;
  setColorScheme: (value: ColorScheme) => void;
  toggleTheme: () => void;
  theme: Theme;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [colorScheme, setColorScheme] = useState<ColorScheme>('green');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      idbGet('legal_dark_mode'),
      idbGet('legal_color_scheme')
    ]).then(([savedTheme, savedColorScheme]) => {
      if (!isMounted) return;
      if (savedTheme === '1') setDarkMode(true);
      if (savedColorScheme && ['green', 'blue', 'purple', 'orange', 'pink', 'teal'].includes(savedColorScheme)) {
        setColorScheme(savedColorScheme as ColorScheme);
      }
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

  useEffect(() => {
    if (!mounted) return;
    idbSet('legal_color_scheme', colorScheme);
  }, [colorScheme, mounted]);

  const theme = useMemo<Theme>(() => getThemeByColor(colorScheme, darkMode), [colorScheme, darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const value = useMemo<ThemeContextValue>(() => ({ 
    darkMode, 
    setDarkMode, 
    colorScheme, 
    setColorScheme, 
    toggleTheme, 
    theme, 
    mounted 
  }), [darkMode, setDarkMode, colorScheme, setColorScheme, toggleTheme, theme, mounted]);

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