import React, { useState, useEffect } from 'react';
import Header from './Header';
import MobileNav from './MobileNav';
import ModernNavigation from './ModernNavigation';
import ElegantSidebar from './ElegantSidebar';
import { useTheme } from '../contexts/ThemeContext';
import { isMobile } from '@utils/crypto';
import Image from 'next/image';

// تعريف نوع BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const showHeader = !isMobile();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [useModernNavigation] = useState(false);
  const [useElegantSidebar] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isMobile()) return; // فقط على الهاتف

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
  }, [mounted]);

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
      display: 'flex',
      flexDirection: isMobile() ? 'column' : 'row',
    }}>
      {showHeader && !useModernNavigation && !useElegantSidebar && <Header />}
      {useModernNavigation && <ModernNavigation navigationType="sidebar-toolbar" />}
      {useElegantSidebar && <ElegantSidebar />}
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

      {/* زر تحميل التطبيق - فقط على الهاتف */}
      {mounted && isMobile() && showInstallButton && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 1000,
          background: theme.accent,
          color: 'white',
          padding: '12px 20px',
          borderRadius: '25px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transition: 'all 0.3s ease',
          border: 'none',
          outline: 'none'
        }}
        onClick={handleInstallClick}
        onTouchStart={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)';
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        >
          📱 تثبيت التطبيق
        </div>
      )}

      <main style={{ 
        flex: 1,
        maxWidth: 'none',
        width: '100%', 
        margin: 0, 
        padding: '2rem 1rem',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '100vh',
        overflow: 'auto'
      }}>
        {children}
      </main>
      {!useModernNavigation && <MobileNav />}
      

    </div>
  );
} 