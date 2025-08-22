import React from 'react';
import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';

export default function ProtectedContent() {
  const { theme } = useTheme();

  return (
    <div style={{
      background: theme.card,
      borderRadius: 16,
      padding: '48px 24px',
      boxShadow: `0 4px 20px ${theme.shadow}`,
      border: `1.5px solid ${theme.border}`,
      textAlign: 'center'
    }}>
      <div style={{fontSize: 64, marginBottom: 24}}>🔒</div>
      <h2 style={{
        fontSize: '28px',
        fontWeight: 800,
        color: theme.accent,
        margin: 0,
        marginBottom: 16
      }}>
        المحتوى محمي
      </h2>
      <p style={{
        fontSize: '18px',
        color: theme.text,
        margin: 0,
        marginBottom: 32,
        lineHeight: 1.6,
        opacity: 0.8
      }}>
        يجب عليك تسجيل الدخول أو إنشاء حساب جديد للوصول إلى منصة التحليل القانوني
      </p>
      <div style={{display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap'}}>
        <Link href="/login" style={{ textDecoration: 'none' }}>
          <button style={{
            background: theme.accent,
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            🔐 تسجيل الدخول
          </button>
        </Link>
        <Link href="/register" style={{ textDecoration: 'none' }}>
          <button style={{
            background: 'transparent',
            color: theme.accent,
            border: `2px solid ${theme.accent}`,
            borderRadius: 12,
            padding: '16px 32px',
            fontSize: '18px',
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