import React from 'react';
import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';

interface User {
  username: string;
  role: string;
  officeId: string;
}

interface WelcomeHeaderProps {
  user: User;
  onLogout: () => void;
}

export default function WelcomeHeader({ user, onLogout }: WelcomeHeaderProps) {
  const { theme } = useTheme();

  return (
    <div style={{
      background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accent2} 100%)`,
      borderRadius: 16,
      padding: '20px',
      marginBottom: 24,
      boxShadow: `0 4px 20px ${theme.accent}33`,
      border: `1px solid ${theme.accent}`,
      color: '#fff',
      textAlign: 'center'
    }}>
      <div style={{fontSize: 24, fontWeight: 800, marginBottom: 8}}>
        🎉 مرحباً بك، {user.username}!
      </div>
      <div style={{fontSize: 16, opacity: 0.9, marginBottom: 16}}>
        {user.role === 'admin' ? 'مدير مكتب' : 'موظف'} في {user.officeId}
      </div>
      <div style={{display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap'}}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <button style={{
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            🏢 لوحة التحكم
          </button>
        </Link>
        <button
          onClick={onLogout}
          style={{
            background: 'rgba(239,68,68,0.2)',
            color: '#fff',
            border: '2px solid rgba(239,68,68,0.3)',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          🚪 تسجيل الخروج
        </button>
      </div>
    </div>
  );
} 