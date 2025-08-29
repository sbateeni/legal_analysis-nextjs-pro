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
      padding: isMobile() ? '10px 0 8px 0' : '18px 0 12px 0',
      marginBottom: 0,
      boxShadow: '0 4px 20px rgba(79, 70, 229, 0.3)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      textAlign: 'center',
      letterSpacing: 1,
      fontWeight: 800,
      fontSize: isMobile() ? 20 : 26,
    }}>
      <nav style={{display:'flex', flexDirection:'column', alignItems:'center', gap: isMobile() ? 8 : 14}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:12}}>
          <span style={{fontSize: isMobile() ? 22 : 30}}>⚖️</span>
          <Link href="/" style={{color:'#fff', textDecoration:'none'}}>
            <span>منصة التحليل القانوني الذكي</span>
          </Link>
        </div>
        <div className="header-nav" style={{
          display: 'flex',
          flexDirection: isMobile() ? 'row' : 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: isMobile() ? 8 : 18,
          marginTop: isMobile() ? 6 : 6,
          flexWrap: isMobile() ? 'nowrap' : 'wrap',
          maxWidth: '100%',
          overflowX: isMobile() ? 'auto' : 'visible',
          padding: isMobile() ? '0 10px' : 0,
          WebkitOverflowScrolling: 'touch'
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
            color: '#fff', background: isActive('/') ? '#22c55e' : '#22c55ecc', borderRadius: 10, padding: isMobile() ? '8px 12px' : '6px 14px', fontWeight: 700, fontSize: isMobile() ? 13 : 16, textDecoration: 'none', boxShadow: '0 1px 4px #0002', letterSpacing: 1, transition: 'background 0.2s',
            whiteSpace: 'nowrap'
          }}>🏠 الرئيسية</Link>
          <Link href="/chat" style={{
            color: '#fff', background: isActive('/chat') ? '#10b981' : '#10b981cc', borderRadius: 10, padding: isMobile() ? '8px 12px' : '6px 14px', fontWeight: 700, fontSize: isMobile() ? 13 : 16, textDecoration: 'none', boxShadow: '0 1px 4px #0002', letterSpacing: 1, transition: 'background 0.2s',
            whiteSpace: 'nowrap'
          }}>🤖 المساعد</Link>
          <Link href="/analytics" style={{
            color: '#fff', background: isActive('/analytics') ? '#f59e0b' : '#f59e0bcc', borderRadius: 10, padding: isMobile() ? '8px 12px' : '6px 14px', fontWeight: 700, fontSize: isMobile() ? 13 : 16, textDecoration: 'none', boxShadow: '0 1px 4px #0002', letterSpacing: 1, transition: 'background 0.2s',
            whiteSpace: 'nowrap'
          }}>📊 التحليلات</Link>
          <Link href="/history" style={{
            color: '#fff', background: isActive('/history') ? '#6366f1' : '#6366f1cc', borderRadius: 10, padding: isMobile() ? '8px 12px' : '6px 14px', fontWeight: 700, fontSize: isMobile() ? 13 : 16, textDecoration: 'none', boxShadow: '0 1px 4px #0002', letterSpacing: 1, transition: 'background 0.2s',
            whiteSpace: 'nowrap'
          }}>📑 القضايا</Link>
          <Link href="/settings" style={{
            color: '#fff', background: isActive('/settings') ? '#14b8a6' : '#14b8a6cc', borderRadius: 10, padding: isMobile() ? '8px 12px' : '6px 14px', fontWeight: 700, fontSize: isMobile() ? 13 : 16, textDecoration: 'none', boxShadow: '0 1px 4px #0002', letterSpacing: 1, transition: 'background 0.2s',
            whiteSpace: 'nowrap'
          }}>⚙️ الإعدادات</Link>
          <Link href="/about" style={{
            color: '#fff', background: isActive('/about') ? '#4f46e5' : '#4f46e5cc', borderRadius: 10, padding: isMobile() ? '8px 12px' : '6px 14px', fontWeight: 700, fontSize: isMobile() ? 13 : 16, textDecoration: 'none', boxShadow: '0 1px 4px #0002', letterSpacing: 1, transition: 'background 0.2s',
            whiteSpace: 'nowrap'
          }}>؟ تعليمات</Link>
          <Link href="/exports" style={{
            color: '#fff', background: isActive('/exports') ? '#dc2626' : '#dc2626cc', borderRadius: 10, padding: isMobile() ? '8px 12px' : '6px 14px', fontWeight: 700, fontSize: isMobile() ? 13 : 16, textDecoration: 'none', boxShadow: '0 1px 4px #0002', letterSpacing: 1, transition: 'background 0.2s',
            whiteSpace: 'nowrap'
          }}>⬇️ الصادرات</Link>
          <Link href="/reference-checker" style={{
            color: '#fff', background: isActive('/reference-checker') ? '#8b5cf6' : '#8b5cf6cc', borderRadius: 10, padding: isMobile() ? '8px 12px' : '6px 14px', fontWeight: 700, fontSize: isMobile() ? 13 : 16, textDecoration: 'none', boxShadow: '0 1px 4px #0002', letterSpacing: 1, transition: 'background 0.2s',
            whiteSpace: 'nowrap'
          }}>🔍 المدقق المرجعي</Link>
        </div>
      </nav>
    </header>
  );
} 