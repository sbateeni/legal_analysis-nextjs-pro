import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from './Header';
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
    if (!mounted || !isMobile()) return;

    // تحسين كشف تثبيت PWA - دعم أفضل للأجهزة المختلفة
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA install prompt detected');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    // إضافة مستمعين متعددين لضمان التوافق
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      setShowInstallButton(false);
      setDeferredPrompt(null);
    });

    // التحقق من حالة التثبيت بطرق متعددة
    const isStandalone = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://')
      );
    };

    if (isStandalone()) {
      setShowInstallButton(false);
    }

    // تحقق دوري من إمكانية التثبيت (لبعض المتصفحات)
    const checkInstallability = () => {
      if ('getInstalledRelatedApps' in navigator) {
        (navigator as any).getInstalledRelatedApps().then((apps: any[]) => {
          if (apps.length > 0) {
            setShowInstallButton(false);
          }
        }).catch(() => {});
      }
    };

    const timer = setTimeout(checkInstallability, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, [mounted]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    console.log('Attempting PWA installation...');
    
    try {
      // عرض نافذة التثبيت
      const result = await deferredPrompt.prompt();
      console.log('Install prompt result:', result);

      // انتظار اختيار المستخدم
      const { outcome } = await deferredPrompt.userChoice;
      console.log('User choice:', outcome);

      if (outcome === 'accepted') {
        console.log('تم قبول تثبيت التطبيق');
        setShowInstallButton(false);
      } else {
        console.log('تم رفض تثبيت التطبيق');
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during PWA installation:', error);
      // في حالة الفشل، نعرض تعليمات يدوية
      alert('لتثبيت التطبيق، اضغط على "إضافة إلى الشاشة الرئيسية" في قائمة المتصفح');
    }
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
      {/* إظهار ElegantSidebar إذا كان مفعل */}
      {useElegantSidebar && <ElegantSidebar />}
      
      {/* إظهار ModernNavigation إذا كان مفعل */}
      {useModernNavigation && <ModernNavigation navigationType="sidebar-toolbar" />}
      
      {/* إظهار Header فقط إذا لم يكن ElegantSidebar أو ModernNavigation مفعل */}
      {!useElegantSidebar && !useModernNavigation && showHeader && <Header />}
      
      {/* إظهار البانر فقط إذا لم يكن أي من المكونات السابقة مفعل */}
      {!useElegantSidebar && !useModernNavigation && !showHeader && (
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

      {/* زر تحميل التطبيق - محسّن للهواتف */}
      {mounted && isMobile() && showInstallButton && (
        <div style={{
          position: 'fixed',
          top: 'max(20px, env(safe-area-inset-top))',
          left: 'max(20px, env(safe-area-inset-left))',
          zIndex: 1000,
          background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accent}dd 100%)`,
          color: 'white',
          padding: '12px 20px',
          borderRadius: '25px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 8px 40px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transition: 'all 0.3s ease',
          border: 'none',
          outline: 'none',
          animation: 'pulse 2s infinite',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
        onClick={handleInstallClick}
        onTouchStart={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)';
          e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3), 0 8px 40px rgba(0,0,0,0.15)';
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
      {/* تم حذف MobileNav لتجنب تضارب مع البانر الجانبي */}

    </div>
  );
} 