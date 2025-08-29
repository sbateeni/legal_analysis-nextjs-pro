import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '../contexts/ThemeContext';
import { isMobile } from '../utils/crypto';

export default function Header() {
  const { darkMode, setDarkMode, theme, mounted } = useTheme();
  const router = useRouter();

  if (!mounted) return null;

  const isActive = (path: string) => router.pathname === path;

  return (
    <header style={{
      width: '100%',
      background: `linear-gradient(135deg, ${theme.accent2} 0%, ${theme.accent} 100%)`,
      color: '#fff',
      padding: isMobile() ? '16px 0 10px 0' : '18px 0 12px 0',
      marginBottom: 0,
      boxShadow: '0 4px 20px rgba(79, 70, 229, 0.3)',
      textAlign: 'center',
      letterSpacing: 1,
      fontWeight: 800,
      fontSize: isMobile() ? 22 : 26,
    }}>
      <nav style={{display:'flex', flexDirection:'column', alignItems:'center', gap: isMobile() ? 10 : 14}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:12}}>
          <span style={{fontSize: isMobile() ? 26 : 30}}>⚖️</span>
          <Link href="/" style={{color:'#fff', textDecoration:'none'}}>
            <span>منصة التحليل القانوني الذكي</span>
          </Link>
        </div>
        <div className="header-nav" style={{
          display: 'flex',
          flexDirection: isMobile() ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isMobile() ? 8 : 18,
          marginTop: isMobile() ? 8 : 6,
          flexWrap: 'wrap',
          maxWidth: '100%'
        }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: isMobile() ? 22 : 26, color: '#fff', outline: 'none',
              transition: 'color 0.2s',
              padding: 0,
            }}
            aria-label="تبديل الوضع الليلي"
          >
            {darkMode ? '🌙' : '☀️'}
          </button>

          <Link href="/" style={{
            color: '#fff', background: isActive('/') ? '#22c55e' : '#22c55ecc', borderRadius: 8, padding: isMobile() ? '8px 16px' : '4px 14px', fontWeight: 700, fontSize: isMobile() ? 14 : 16, textDecoration: 'none', boxShadow: '0 1px 4px #0002', letterSpacing: 1, transition: 'background 0.2s',
            width: isMobile() ? '100%' : 'auto',
            minWidth: isMobile() ? '140px' : 'auto',
            maxWidth: isMobile() ? '200px' : 'none',
            textAlign: 'center'
          }}>🏠 الرئيسية</Link>
          <Link href="/chat" style={{
            color: '#fff', background: isActive('/chat') ? '#10b981' : '#10b981cc', borderRadius: 8, padding: isMobile() ? '8px 16px' : '4px 14px', fontWeight: 700, fontSize: isMobile() ? 14 : 16, textDecoration: 'none', boxShadow: '0 1px 4px #0002', letterSpacing: 1, transition: 'background 0.2s',
            width: isMobile() ? '100%' : 'auto',
            minWidth: isMobile() ? '140px' : 'auto',
            maxWidth: isMobile() ? '200px' : 'none',
            textAlign: 'center'
          }}>🤖 المساعد</Link>
          <Link href="/analytics" style={{
            color: '#fff', background: isActive('/analytics') ? '#f59e0b' : '#f59e0bcc', borderRadius: 8, padding: isMobile() ? '8px 16px' : '4px 14px', fontWeight: 700, fontSize: isMobile() ? 14 : 16, textDecoration: 'none', boxShadow: '0 1px 4px #0002', letterSpacing: 1, transition: 'background 0.2s',
            width: isMobile() ? '100%' : 'auto',
            minWidth: isMobile() ? '140px' : 'auto',
            maxWidth: isMobile() ? '200px' : 'none',
            textAlign: 'center'
          }}>📊 التحليلات</Link>
          <Link href="/history" style={{
            color: '#fff', background: isActive('/history') ? '#6366f1' : '#6366f1cc', borderRadius: 8, padding: isMobile() ? '8px 16px' : '4px 14px', fontWeight: 700, fontSize: isMobile() ? 14 : 16, textDecoration: 'none', boxShadow: '0 1px 4px #0002', letterSpacing: 1, transition: 'background 0.2s',
            width: isMobile() ? '100%' : 'auto',
            minWidth: isMobile() ? '140px' : 'auto',
            maxWidth: isMobile() ? '200px' : 'none',
            textAlign: 'center'
          }}>📑 القضايا</Link>
          <Link href="/settings" style={{
            color: '#fff', background: isActive('/settings') ? '#14b8a6' : '#14b8a6cc', borderRadius: 8, padding: isMobile() ? '8px 16px' : '4px 14px', fontWeight: 700, fontSize: isMobile() ? 14 : 16, textDecoration: 'none', boxShadow: '0 1px 4px #0002', letterSpacing: 1, transition: 'background 0.2s',
            width: isMobile() ? '100%' : 'auto',
            minWidth: isMobile() ? '140px' : 'auto',
            maxWidth: isMobile() ? '200px' : 'none',
            textAlign: 'center'
          }}>⚙️ الإعدادات</Link>
          <Link href="/about" style={{
            color: '#fff', background: isActive('/about') ? '#4f46e5' : '#4f46e5cc', borderRadius: 8, padding: isMobile() ? '8px 16px' : '4px 14px', fontWeight: 700, fontSize: isMobile() ? 14 : 16, textDecoration: 'none', boxShadow: '0 1px 4px #0002', letterSpacing: 1, transition: 'background 0.2s',
            width: isMobile() ? '100%' : 'auto',
            minWidth: isMobile() ? '140px' : 'auto',
            maxWidth: isMobile() ? '200px' : 'none',
            textAlign: 'center'
          }}>؟ تعليمات</Link>
          <Link href="/exports" style={{
            color: '#fff', background: isActive('/exports') ? '#dc2626' : '#dc2626cc', borderRadius: 8, padding: isMobile() ? '8px 16px' : '4px 14px', fontWeight: 700, fontSize: isMobile() ? 14 : 16, textDecoration: 'none', boxShadow: '0 1px 4px #0002', letterSpacing: 1, transition: 'background 0.2s',
            width: isMobile() ? '100%' : 'auto',
            minWidth: isMobile() ? '140px' : 'auto',
            maxWidth: isMobile() ? '200px' : 'none',
            textAlign: 'center'
          }}>⬇️ الصادرات</Link>
          <Link href="/reference-checker" style={{
            color: '#fff', background: isActive('/reference-checker') ? '#8b5cf6' : '#8b5cf6cc', borderRadius: 8, padding: isMobile() ? '8px 16px' : '4px 14px', fontWeight: 700, fontSize: isMobile() ? 14 : 16, textDecoration: 'none', boxShadow: '0 1px 4px #0002', letterSpacing: 1, transition: 'background 0.2s',
            width: isMobile() ? '100%' : 'auto',
            minWidth: isMobile() ? '140px' : 'auto',
            maxWidth: isMobile() ? '200px' : 'none',
            textAlign: 'center'
          }}>🔍 المدقق المرجعي</Link>
        </div>
      </nav>
    </header>
  );
} 