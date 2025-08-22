import React from 'react';
import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';

export default function AuthCallToAction() {
  const { theme } = useTheme();

  return (
    <div style={{
      background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accent2} 100%)`,
      borderRadius: 16,
      padding: '32px',
      marginBottom: 24,
      boxShadow: `0 4px 20px ${theme.accent}33`,
      border: `1px solid ${theme.accent}`,
      textAlign: 'center',
      color: '#fff'
    }}>
      <div style={{fontSize: 28, fontWeight: 800, marginBottom: 16}}>
        🚀 منصة التحليل القانوني الذكي
      </div>
      <div style={{fontSize: 18, opacity: 0.9, marginBottom: 24, lineHeight: 1.6}}>
        انضم إلينا واحصل على تحليل قانوني متقدم في 12 مرحلة<br/>
        مع عريضة قانونية نهائية جاهزة للمحكمة
      </div>
      <div style={{display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap'}}>
        <Link href="/login" style={{ textDecoration: 'none' }}>
          <button style={{
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: 12,
            padding: '16px 32px',
            fontSize: 18,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}>
            🔐 تسجيل الدخول
          </button>
        </Link>
        <Link href="/register" style={{ textDecoration: 'none' }}>
          <button style={{
            background: 'rgba(255,255,255,0.9)',
            color: theme.accent,
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: 12,
            padding: '16px 32px',
            fontSize: 18,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            🚀 إنشاء حساب جديد
          </button>
        </Link>
      </div>
    </div>
  );
} 