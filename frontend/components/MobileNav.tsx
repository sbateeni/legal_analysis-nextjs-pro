import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';
import { isMobile } from '../utils/crypto';
import { useState, useEffect } from 'react';

// تعريف نوع BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function MobileNav() {
  const { darkMode, setDarkMode, mounted } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [clientMounted, setClientMounted] = useState(false);

  useEffect(() => {
    setClientMounted(true);
  }, []);

  useEffect(() => {
    if (!clientMounted) return;

    // استماع لحدث beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // التحقق من أن التطبيق مثبت بالفعل
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [clientMounted]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // عرض نافذة التثبيت
    deferredPrompt.prompt();

    // انتظار اختيار المستخدم
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('تم قبول تثبيت التطبيق');
      setShowInstallButton(false);
    } else {
      console.log('تم رفض تثبيت التطبيق');
    }

    setDeferredPrompt(null);
  };

  if (!mounted || !isMobile()) return null;

  return (
    <>
      {/* زر تحميل التطبيق للجوال */}
      {clientMounted && showInstallButton && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 101,
          background: '#22c55e',
          color: 'white',
          padding: '14px 24px',
          borderRadius: '30px',
          boxShadow: '0 6px 25px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 15,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          transition: 'all 0.3s ease',
          border: 'none',
          outline: 'none',
          whiteSpace: 'nowrap',
          minWidth: '180px',
          justifyContent: 'center'
        }}
        onClick={handleInstallClick}
        onTouchStart={(e) => {
          e.currentTarget.style.transform = 'translateX(-50%) scale(0.95)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,0,0,0.4)';
        }}
        >
          📱 تثبيت التطبيق
        </div>
      )}

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
    </>
  );
} 