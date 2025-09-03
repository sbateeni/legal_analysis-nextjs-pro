import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../contexts/ThemeContext';
import Link from 'next/link';

interface FloatingNavigationProps {
  isVisible?: boolean;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  color: string;
  category: string;
}

export default function FloatingNavigation({ isVisible = true }: FloatingNavigationProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('main');

  // تعريف عناصر التنقل مع الألوان
  const navigationItems: NavigationItem[] = [
    // الصفحات الرئيسية
    { id: 'home', label: 'الرئيسية', icon: '🏠', href: '/', color: '#3b82f6', category: 'main' },
    { id: 'chat', label: 'المساعد', icon: '🤖', href: '/chat', color: '#10b981', category: 'main' },
    { id: 'analytics', label: 'التحليلات', icon: '📊', href: '/analytics', color: '#f59e0b', category: 'main' },
    
    // إدارة القضايا
    { id: 'cases', label: 'القضايا', icon: '📋', href: '/cases', color: '#ef4444', category: 'management' },
    { id: 'calendar', label: 'التقويم', icon: '📅', href: '/calendar', color: '#8b5cf6', category: 'management' },
    { id: 'documents', label: 'المستندات', icon: '📁', href: '/documents', color: '#06b6d4', category: 'management' },
    { id: 'collaboration', label: 'التعاون', icon: '🤝', href: '/collaboration', color: '#84cc16', category: 'management' },
    
    // الأدوات
    { id: 'templates', label: 'القوالب', icon: '📝', href: '/templates', color: '#f97316', category: 'tools' },
    { id: 'kb', label: 'المعرفة', icon: '📚', href: '/kb', color: '#ec4899', category: 'tools' },
    { id: 'reference-checker', label: 'المدقق', icon: '🔍', href: '/reference-checker', color: '#6366f1', category: 'tools' },
    { id: 'exports', label: 'الصادرات', icon: '⬇️', href: '/exports', color: '#14b8a6', category: 'tools' },
    
    // الإعدادات
    { id: 'history', label: 'التاريخ', icon: '📑', href: '/history', color: '#64748b', category: 'settings' },
    { id: 'settings', label: 'الإعدادات', icon: '⚙️', href: '/settings', color: '#6b7280', category: 'settings' },
    { id: 'about', label: 'تعليمات', icon: '❓', href: '/about', color: '#9ca3af', category: 'settings' },
    { id: 'navigation-demo', label: 'تجربة التنقل', icon: '🧭', href: '/navigation-demo', color: '#8b5cf6', category: 'tools' },
  ];

  // تصنيف العناصر
  const categorizedItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, NavigationItem[]>);

  // العناصر النشطة حسب الفئة
  const activeItems = categorizedItems[activeCategory] || [];

  // إغلاق القائمة عند تغيير الصفحة
  useEffect(() => {
    setIsOpen(false);
  }, [router.pathname]);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.floating-nav')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'main': return '⭐';
      case 'management': return '📊';
      case 'tools': return '🔧';
      case 'settings': return '⚙️';
      default: return '📁';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'main': return 'الرئيسية';
      case 'management': return 'الإدارة';
      case 'tools': return 'الأدوات';
      case 'settings': return 'الإعدادات';
      default: return category;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="floating-nav" style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000
    }}>
      {/* القائمة الدائرية */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          right: '0',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '16px',
          background: theme.card,
          borderRadius: '20px',
          boxShadow: `0 8px 32px ${theme.shadow}`,
          border: `1px solid ${theme.border}`,
          minWidth: '300px',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          {/* فئات التنقل */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '12px',
            paddingBottom: '12px',
            borderBottom: `1px solid ${theme.border}`
          }}>
            {Object.keys(categorizedItems).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: activeCategory === category ? theme.accent : theme.resultBg,
                  color: activeCategory === category ? '#fff' : theme.text,
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{getCategoryIcon(category)}</span>
                <span>{getCategoryLabel(category)}</span>
              </button>
            ))}
          </div>

          {/* عناصر التنقل */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '8px'
          }}>
            {activeItems.map((item, index) => (
              <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: router.pathname === item.href ? item.color : theme.resultBg,
                  color: router.pathname === item.href ? '#fff' : theme.text,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  border: `2px solid ${router.pathname === item.href ? item.color : 'transparent'}`,
                  animation: isOpen ? `slideInUp 0.3s ease ${index * 0.1}s both` : 'none'
                }}
                onMouseEnter={(e) => {
                  if (router.pathname !== item.href) {
                    e.currentTarget.style.background = item.color;
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (router.pathname !== item.href) {
                    e.currentTarget.style.background = theme.resultBg;
                    e.currentTarget.style.color = theme.text;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
                >
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', textAlign: 'center' }}>
                    {item.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* إجراءات سريعة */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: `1px solid ${theme.border}`
          }}>
            <button style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: theme.accent2,
              color: '#fff',
              fontSize: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}>
              🚀 إجراء سريع
            </button>
            <button style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: theme.accent2,
              color: '#fff',
              fontSize: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}>
              📊 تقرير
            </button>
          </div>
        </div>
      )}

      {/* الزر الرئيسي */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          background: isOpen ? theme.accent : theme.accent2,
          color: '#fff',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: `0 4px 20px ${theme.shadow}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = isOpen ? 'rotate(45deg) scale(1.1)' : 'rotate(0deg) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isOpen ? 'rotate(45deg) scale(1)' : 'rotate(0deg) scale(1)';
        }}
      >
        {isOpen ? '✕' : '🧭'}
      </button>

      {/* مؤشر التنبيهات */}
      <div style={{
        position: 'absolute',
        top: '-5px',
        right: '-5px',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: '#ef4444',
        color: '#fff',
        fontSize: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        animation: 'pulse 2s infinite'
      }}>
        3
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
