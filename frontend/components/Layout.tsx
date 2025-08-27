import React from 'react';
import Header from './Header';
import MobileNav from './MobileNav';
import { useTheme } from '../contexts/ThemeContext';
import { isMobile } from '../utils/crypto';
import Image from 'next/image';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const showHeader = !isMobile();
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
      {!showHeader && (
        <div>
          <div style={{
            width: '100%',
            overflow: 'hidden',
            borderBottom: `1px solid ${theme.border}`
          }}>
            <Image
              src="/DeWatermark.ai_1756309976798.jpeg"
              alt="بانر قانوني"
              width={1200}
              height={120}
              style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px 0',
            fontWeight: 800,
            letterSpacing: 0.5,
            fontSize: 18
          }}>
            <span style={{ fontSize: 22 }}>⚖️</span>
            <span>منصة التحليل القانوني الذكي</span>
          </div>
        </div>
      )}
      <main style={{ maxWidth: 1000, width: '100%', margin: '0 auto', padding: '2rem 1rem' }}>
        {children}
      </main>
      <MobileNav />
    </div>
  );
} 