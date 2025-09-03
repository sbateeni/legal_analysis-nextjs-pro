import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../contexts/ThemeContext';
import SmartToolbar from './SmartToolbar';
import FloatingNavigation from './FloatingNavigation';
import SmartSidebar from './SmartSidebar';
import SidebarToolbar from './SidebarToolbar';

interface ModernNavigationProps {
  navigationType?: 'toolbar' | 'floating' | 'sidebar' | 'sidebar-toolbar' | 'auto';
}

export default function ModernNavigation({ navigationType = 'auto' }: ModernNavigationProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const [currentType, setCurrentType] = useState(navigationType);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);
  const [isSidebarToolbarCollapsed, setIsSidebarToolbarCollapsed] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // تحديد نوع الشاشة
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
        if (navigationType === 'auto') {
          setCurrentType('floating');
        }
      } else if (width < 1024) {
        setScreenSize('tablet');
        if (navigationType === 'auto') {
          setCurrentType('sidebar');
        }
             } else {
         setScreenSize('desktop');
         if (navigationType === 'auto') {
           setCurrentType('sidebar-toolbar');
         }
       }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigationType]);

  // حفظ تفضيلات المستخدم
  useEffect(() => {
    const savedType = localStorage.getItem('preferredNavigationType');
    if (savedType && navigationType === 'auto') {
      setCurrentType(savedType as any);
    }
  }, [navigationType]);

  const handleNavigationTypeChange = (type: string) => {
    setCurrentType(type as any);
    localStorage.setItem('preferredNavigationType', type);
  };

  const renderNavigation = () => {
    switch (currentType) {
      case 'toolbar':
        return (
          <SmartToolbar
            isCollapsed={isToolbarCollapsed}
            onToggle={() => setIsToolbarCollapsed(!isToolbarCollapsed)}
          />
        );
      case 'floating':
        return <FloatingNavigation isVisible={true} />;
      case 'sidebar':
        return (
          <>
            <button
              onClick={() => setIsSidebarOpen(true)}
              style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                zIndex: 1000,
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                border: 'none',
                background: theme.accent,
                color: '#fff',
                fontSize: '20px',
                cursor: 'pointer',
                boxShadow: `0 4px 20px ${theme.shadow}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              🧭
            </button>
            <SmartSidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          </>
        );
      case 'sidebar-toolbar':
        return (
          <SidebarToolbar
            isCollapsed={isSidebarToolbarCollapsed}
            onToggle={() => setIsSidebarToolbarCollapsed(!isSidebarToolbarCollapsed)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderNavigation()}
      
      {/* Navigation Type Selector */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 999,
        background: theme.card,
        borderRadius: '12px',
        padding: '8px',
        boxShadow: `0 4px 20px ${theme.shadow}`,
        border: `1px solid ${theme.border}`,
        display: 'flex',
        gap: '4px'
      }}>
                 {[
           { type: 'toolbar', icon: '📊', label: 'شريط علوي' },
           { type: 'floating', icon: '🎯', label: 'عائم' },
           { type: 'sidebar', icon: '📋', label: 'جانبي' },
           { type: 'sidebar-toolbar', icon: '📑', label: 'تولبار جانبي' }
         ].map((option) => (
          <button
            key={option.type}
            onClick={() => handleNavigationTypeChange(option.type)}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: currentType === option.type ? theme.accent : 'transparent',
              color: currentType === option.type ? '#fff' : theme.text,
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px'
            }}
            title={option.label}
            onMouseEnter={(e) => {
              if (currentType !== option.type) {
                e.currentTarget.style.background = theme.accent2;
              }
            }}
            onMouseLeave={(e) => {
              if (currentType !== option.type) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {option.icon}
          </button>
        ))}
      </div>

      {/* Screen Size Indicator */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 999,
        background: theme.card,
        borderRadius: '8px',
        padding: '4px 8px',
        boxShadow: `0 2px 10px ${theme.shadow}`,
        border: `1px solid ${theme.border}`,
        fontSize: '10px',
        color: theme.text,
        fontWeight: 'bold'
      }}>
        {screenSize === 'mobile' && '📱 Mobile'}
        {screenSize === 'tablet' && '📱 Tablet'}
        {screenSize === 'desktop' && '💻 Desktop'}
      </div>

      {/* Quick Stats */}
      <div style={{
        position: 'fixed',
        top: '60px',
        right: '20px',
        zIndex: 999,
        background: theme.card,
        borderRadius: '8px',
        padding: '8px 12px',
        boxShadow: `0 2px 10px ${theme.shadow}`,
        border: `1px solid ${theme.border}`,
        fontSize: '10px',
        color: theme.text,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>📊</span>
          <span>القضايا: 12</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>📅</span>
          <span>المواعيد: 5</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>🔔</span>
          <span>التنبيهات: 3</span>
        </div>
      </div>
    </>
  );
}
