import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { isMobile } from '@utils/crypto';
import { useTheme } from '../contexts/ThemeContext';
import NotificationSystem from './NotificationSystem';

export default function Header() {
  const { darkMode, setDarkMode } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      if (!isMobile()) setShowMenu(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prefetch للمسارات الشائعة لتحسين التنقل على Vercel
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    const routesToPrefetch = [
      '/', '/chat', '/analytics', '/cases', '/calendar', '/documents', '/collaboration', '/history', '/settings', '/about', '/exports', '/reference-checker', '/kb', '/templates', '/privacy'
    ];
    const doPrefetch = () => {
      try {
        routesToPrefetch.forEach((r) => {
          // تجاهل المسار الحالي
          if (typeof router.pathname === 'string' && router.pathname === r) return;
          router.prefetch(r).catch(() => {});
        });
      } catch {}
    };
    if (typeof window !== 'undefined') {
      const ric = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 300));
      ric(() => doPrefetch());
    }
  }, [router]);

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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              style={{ 
                background: 'transparent', 
                border: '1px solid #ffffff55', 
                color: '#fff', 
                borderRadius: 6, 
                padding: '4px 6px', 
                cursor: 'pointer',
                fontSize: '12px'
              }} 
              title={darkMode ? 'التبديل للوضع النهاري' : 'التبديل للوضع الليلي'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <Link href="/" style={{ color: '#fff', textDecoration: 'none' }}>🏠 الرئيسية</Link>
          </div>
          <Link href="/chat" style={{ color: '#fff', textDecoration: 'none' }}>🤖 المساعد</Link>
          <Link href="/analytics" style={{ color: '#fff', textDecoration: 'none' }}>📊 التحليلات</Link>
          <Link href="/cases" style={{ color: '#fff', textDecoration: 'none' }}>📋 إدارة القضايا</Link>
          <Link href="/calendar" style={{ color: '#fff', textDecoration: 'none' }}>📅 التقويم</Link>
          <Link href="/documents" style={{ color: '#fff', textDecoration: 'none' }}>📁 المستندات</Link>
          <Link href="/collaboration" style={{ color: '#fff', textDecoration: 'none' }}>🤝 التعاون</Link>
          <Link href="/history" style={{ color: '#fff', textDecoration: 'none' }}>📑 القضايا</Link>
          <Link href="/settings" style={{ color: '#fff', textDecoration: 'none' }}>⚙️ الإعدادات</Link>
          <Link href="/about" style={{ color: '#fff', textDecoration: 'none' }}>؟ تعليمات</Link>
          <Link href="/exports" style={{ color: '#fff', textDecoration: 'none' }}>⬇️ الصادرات</Link>
          <Link href="/reference-checker" style={{ color: '#fff', textDecoration: 'none' }}>🔍 المدقق المرجعي</Link>
          <Link href="/kb" style={{ color: '#fff', textDecoration: 'none' }}>📚 قاعدة المعرفة</Link>
          <Link href="/templates" style={{ color: '#fff', textDecoration: 'none' }}>🧩 القوالب</Link>
        </nav>
        <NotificationSystem />
        {isMobile() && (
          <button onClick={() => setShowMenu(s => !s)} style={{ marginInlineStart: 8, background: 'transparent', border: '1px solid #ffffff55', color: '#fff', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>☰</button>
        )}
      </div>
      {isMobile() && showMenu && (
        <div style={{ padding: '8px 12px', display: 'grid', gap: 8, background: '#4f46e5' }}>
          <Link href="/" style={{ color: '#fff', textDecoration: 'none' }}>🏠 الرئيسية</Link>
          <Link href="/chat" style={{ color: '#fff', textDecoration: 'none' }}>🤖 المساعد</Link>
                     <Link href="/analytics" style={{ color: '#fff', textDecoration: 'none' }}>📊 التحليلات</Link>
           <Link href="/cases" style={{ color: '#fff', textDecoration: 'none' }}>📋 إدارة القضايا</Link>
           <Link href="/calendar" style={{ color: '#fff', textDecoration: 'none' }}>📅 التقويم</Link>
           <Link href="/documents" style={{ color: '#fff', textDecoration: 'none' }}>📁 المستندات</Link>
           <Link href="/collaboration" style={{ color: '#fff', textDecoration: 'none' }}>🤝 التعاون</Link>
           <Link href="/history" style={{ color: '#fff', textDecoration: 'none' }}>📑 القضايا</Link>
          <Link href="/settings" style={{ color: '#fff', textDecoration: 'none' }}>⚙️ الإعدادات</Link>
          <Link href="/about" style={{ color: '#fff', textDecoration: 'none' }}>؟ تعليمات</Link>
          <Link href="/exports" style={{ color: '#fff', textDecoration: 'none' }}>⬇️ الصادرات</Link>
          <Link href="/reference-checker" style={{ color: '#fff', textDecoration: 'none' }}>🔍 المدقق المرجعي</Link>
          <Link href="/kb" style={{ color: '#fff', textDecoration: 'none' }}>📚 قاعدة المعرفة</Link>
          <Link href="/templates" style={{ color: '#fff', textDecoration: 'none' }}>🧩 القوالب</Link>
          <Link href="/privacy" style={{ color: '#fff', textDecoration: 'none' }}>🔐 الخصوصية</Link>
        </div>
      )}
    </header>
  );
} 