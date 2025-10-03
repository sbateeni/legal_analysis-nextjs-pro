import React, { createContext, useContext, useState, useEffect } from 'react';

interface ElegantSidebarContextValue {
  showMobileMenu: boolean;
  setShowMobileMenu: (value: boolean) => void;
}

const ElegantSidebarContext = createContext<ElegantSidebarContextValue | undefined>(undefined);

export function ElegantSidebarProvider({ children }: { children: React.ReactNode }) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Show mobile menu by default on non-landing pages
  useEffect(() => {
    // Check if we're on a landing page
    const isLandingPage = window.location.pathname === '/';
    
    // Show mobile menu on all pages except landing page
    setShowMobileMenu(!isLandingPage);
  }, []);

  const value = {
    showMobileMenu,
    setShowMobileMenu
  };

  return (
    <ElegantSidebarContext.Provider value={value}>
      {children}
    </ElegantSidebarContext.Provider>
  );
}

export function useElegantSidebar() {
  const context = useContext(ElegantSidebarContext);
  if (!context) {
    throw new Error('useElegantSidebar must be used within an ElegantSidebarProvider');
  }
  return context;
}