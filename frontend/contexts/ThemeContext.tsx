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
  professionalMode: boolean;
  setProfessionalMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [colorScheme, setColorScheme] = useState<ColorScheme>('green');
  const [professionalMode, setProfessionalMode] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      idbGet('legal_dark_mode'),
      idbGet('legal_color_scheme'),
      idbGet('legal_professional_mode')
    ]).then(([savedTheme, savedColorScheme, savedProfessionalMode]) => {
      if (!isMounted) return;
      if (savedTheme === '1') setDarkMode(true);
      if (savedColorScheme && ['green', 'blue', 'purple', 'orange', 'pink', 'teal', 'professional'].includes(savedColorScheme)) {
        setColorScheme(savedColorScheme as ColorScheme);
      }
      if (savedProfessionalMode === '1') setProfessionalMode(true);
      setMounted(true);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    idbSet('legal_dark_mode', darkMode ? '1' : '0');
    
    // Update body class for dark mode
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode, mounted]);

  useEffect(() => {
    if (!mounted) return;
    idbSet('legal_color_scheme', colorScheme);
  }, [colorScheme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    idbSet('legal_professional_mode', professionalMode ? '1' : '0');
    
    // Update body class for professional mode
    if (professionalMode) {
      document.body.classList.add('professional-mode');
    } else {
      document.body.classList.remove('professional-mode');
    }
    
    // Also update dark mode class when professional mode changes
    if (professionalMode && darkMode) {
      document.body.classList.add('dark-mode');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, [professionalMode, mounted]);

  const theme = useMemo<Theme>(() => {
    // If professional mode is enabled, use professional theme
    if (professionalMode) {
      return getThemeByColor('professional', darkMode);
    }
    // Otherwise use the selected color scheme
    return getThemeByColor(colorScheme, darkMode);
  }, [colorScheme, darkMode, professionalMode]);

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
    mounted,
    professionalMode,
    setProfessionalMode
  }), [darkMode, setDarkMode, colorScheme, setColorScheme, toggleTheme, theme, mounted, professionalMode, setProfessionalMode]);

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