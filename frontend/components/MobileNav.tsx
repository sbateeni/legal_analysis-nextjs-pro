import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';
import { isMobile } from '../utils/crypto';

export default function MobileNav() {
  const { darkMode, setDarkMode, mounted } = useTheme();
  if (!mounted || !isMobile()) return null;

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100vw',
      background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)',
      boxShadow: '0 -2px 12px #0002',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '6px 0 4px 0',
      zIndex: 100,
      paddingBottom: 'calc(6px + env(safe-area-inset-bottom))',
    }}>
      <Link href="/" style={{color:'#fff', textAlign:'center', fontSize:20, flex:1, textDecoration:'none'}}>
        <div>🏠</div>
        <div style={{fontSize:10, marginTop:2}}>الرئيسية</div>
      </Link>
      <Link href="/chat" style={{color:'#fff', textAlign:'center', fontSize:20, flex:1, textDecoration:'none'}}>
        <div>🤖</div>
        <div style={{fontSize:10, marginTop:2}}>المساعد</div>
      </Link>
      <Link href="/analytics" style={{color:'#fff', textAlign:'center', fontSize:20, flex:1, textDecoration:'none'}}>
        <div>📊</div>
        <div style={{fontSize:10, marginTop:2}}>التحليلات</div>
      </Link>
      <Link href="/history" style={{color:'#fff', textAlign:'center', fontSize:20, flex:1, textDecoration:'none'}}>
        <div>📑</div>
        <div style={{fontSize:10, marginTop:2}}>القضايا</div>
      </Link>
      <Link href="/settings" style={{color:'#fff', textAlign:'center', fontSize:20, flex:1, textDecoration:'none'}}>
        <div>⚙️</div>
        <div style={{fontSize:10, marginTop:2}}>الإعدادات</div>
      </Link>
      <Link href="/about" style={{color:'#fff', textAlign:'center', fontSize:20, flex:1, textDecoration:'none'}}>
        <div>❓</div>
        <div style={{fontSize:10, marginTop:2}}>عن</div>
      </Link>
      <Link href="/exports" style={{color:'#fff', textAlign:'center', fontSize:20, flex:1, textDecoration:'none'}}>
        <div>⬇️</div>
        <div style={{fontSize:10, marginTop:2}}>الصادرات</div>
      </Link>
      <button onClick={() => setDarkMode(!darkMode)} style={{background:'none', border:'none', color:'#fff', fontSize:20, flex:1, textAlign:'center', cursor:'pointer', outline:'none'}}>
        <div>{darkMode ? '🌙' : '☀️'}</div>
        <div style={{fontSize:10, marginTop:2}}>الوضع</div>
      </button>
    </nav>
  );
} 