import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { isMobile } from '@utils/crypto';
import { useTheme } from '../contexts/ThemeContext';

export default function Header() {
  const { darkMode, setDarkMode } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (!isMobile()) setShowMenu(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header style={{
      width: '100%',
      background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)',
      color: '#fff',
      boxShadow: '0 2px 12px #0002',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
          <span style={{ fontSize: 22 }}>⚖️</span>
          <span>منصة التحليل القانوني الذكي</span>
        </Link>
        <nav style={{ marginInlineStart: 'auto', display: isMobile() ? 'none' : 'flex', gap: 12 }}>
          <Link href="/" style={{ color: '#fff', textDecoration: 'none' }}>🏠 الرئيسية</Link>
          <Link href="/chat" style={{ color: '#fff', textDecoration: 'none' }}>🤖 المساعد</Link>
          <Link href="/analytics" style={{ color: '#fff', textDecoration: 'none' }}>📊 التحليلات</Link>
          <Link href="/history" style={{ color: '#fff', textDecoration: 'none' }}>📑 القضايا</Link>
          <Link href="/settings" style={{ color: '#fff', textDecoration: 'none' }}>⚙️ الإعدادات</Link>
          <Link href="/about" style={{ color: '#fff', textDecoration: 'none' }}>؟ تعليمات</Link>
          <Link href="/exports" style={{ color: '#fff', textDecoration: 'none' }}>⬇️ الصادرات</Link>
          <Link href="/reference-checker" style={{ color: '#fff', textDecoration: 'none' }}>🔍 المدقق المرجعي</Link>
        </nav>
        <button onClick={() => setDarkMode(!darkMode)} style={{ marginInlineStart: 8, background: 'transparent', border: '1px solid #ffffff55', color: '#fff', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>{darkMode ? '🌙' : '☀️'}</button>
        {isMobile() && (
          <button onClick={() => setShowMenu(s => !s)} style={{ marginInlineStart: 8, background: 'transparent', border: '1px solid #ffffff55', color: '#fff', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>☰</button>
        )}
      </div>
      {isMobile() && showMenu && (
        <div style={{ padding: '8px 12px', display: 'grid', gap: 8, background: '#4f46e5' }}>
          <Link href="/" style={{ color: '#fff', textDecoration: 'none' }}>🏠 الرئيسية</Link>
          <Link href="/chat" style={{ color: '#fff', textDecoration: 'none' }}>🤖 المساعد</Link>
          <Link href="/analytics" style={{ color: '#fff', textDecoration: 'none' }}>📊 التحليلات</Link>
          <Link href="/history" style={{ color: '#fff', textDecoration: 'none' }}>📑 القضايا</Link>
          <Link href="/settings" style={{ color: '#fff', textDecoration: 'none' }}>⚙️ الإعدادات</Link>
          <Link href="/about" style={{ color: '#fff', textDecoration: 'none' }}>؟ تعليمات</Link>
          <Link href="/exports" style={{ color: '#fff', textDecoration: 'none' }}>⬇️ الصادرات</Link>
          <Link href="/reference-checker" style={{ color: '#fff', textDecoration: 'none' }}>🔍 المدقق المرجعي</Link>
        </div>
      )}
    </header>
  );
} 