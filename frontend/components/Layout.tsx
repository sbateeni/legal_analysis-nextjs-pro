import React from 'react';
import Header from './Header';
import MobileNav from './MobileNav';
import { useTheme } from '../contexts/ThemeContext';
import { isMobile } from '../utils/crypto';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, mounted } = useTheme();
  const showHeader = !mounted ? true : !isMobile();
  return (
    <div style={{
      fontFamily: 'Tajawal, Arial, sans-serif',
      direction: 'rtl',
      minHeight: '100vh',
      background: theme.background,
      color: theme.text,
      padding: 0,
      margin: 0,
      transition: 'background 0.4s',
    }}>
      {showHeader && <Header />}
      <main style={{ maxWidth: 1000, width: '100%', margin: '0 auto', padding: '2rem 1rem' }}>
        {children}
      </main>
      <MobileNav />
    </div>
  );
} 