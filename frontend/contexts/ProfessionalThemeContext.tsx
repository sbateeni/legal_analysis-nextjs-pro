import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import { getProfessionalLegalTheme, ProfessionalLegalTheme } from '../components/themes/ProfessionalLegalTheme';

interface ProfessionalThemeContextValue {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  toggleTheme: () => void;
  theme: ProfessionalLegalTheme;
  mounted: boolean;
  formalMode: boolean;
  setFormalMode: (value: boolean) => void;
}

const ProfessionalThemeContext = createContext<ProfessionalThemeContextValue | undefined>(undefined);

export function ProfessionalThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [formalMode, setFormalMode] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      idbGet('legal_dark_mode'),
      idbGet('legal_formal_mode')
    ]).then(([savedTheme, savedFormalMode]) => {
      if (!isMounted) return;
      if (savedTheme === '1') setDarkMode(true);
      if (savedFormalMode === '1') setFormalMode(true);
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
    idbSet('legal_formal_mode', formalMode ? '1' : '0');
  }, [formalMode, mounted]);

  const theme = useMemo<ProfessionalLegalTheme>(() => getProfessionalLegalTheme(darkMode), [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const value = useMemo<ProfessionalThemeContextValue>(() => ({ 
    darkMode, 
    setDarkMode, 
    toggleTheme, 
    theme, 
    mounted,
    formalMode,
    setFormalMode
  }), [darkMode, setDarkMode, toggleTheme, theme, mounted, formalMode, setFormalMode]);

  return (
    <ProfessionalThemeContext.Provider value={value}>
      {children}
    </ProfessionalThemeContext.Provider>
  );
}

export function useProfessionalTheme() {
  const ctx = useContext(ProfessionalThemeContext);
  if (!ctx) throw new Error('useProfessionalTheme must be used within ProfessionalThemeProvider');
  return ctx;
}