import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../contexts/ThemeContext';
import Link from 'next/link';

interface SmartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  category: string;
  description: string;
  isNew?: boolean;
  badge?: string;
}

export default function SmartSidebar({ isOpen, onClose }: SmartSidebarProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [recentItems, setRecentItems] = useState<string[]>([]);

  // تعريف عناصر التنقل مع الوصف
  const navigationItems: NavigationItem[] = [
    // الصفحات الرئيسية
    { 
      id: 'home', 
      label: 'الرئيسية', 
      icon: '🏠', 
      href: '/', 
      category: 'main',
      description: 'الصفحة الرئيسية للمنصة'
    },
    { 
      id: 'chat', 
      label: 'المساعد الذكي', 
      icon: '🤖', 
      href: '/chat', 
      category: 'main',
      description: 'المساعد القانوني المدعوم بالذكاء الاصطناعي',
      badge: 'AI'
    },
    { 
      id: 'analytics', 
      label: 'التحليلات', 
      icon: '📊', 
      href: '/analytics', 
      category: 'main',
      description: 'تحليلات شاملة للقضايا والأداء'
    },
    
    // إدارة القضايا
    { 
      id: 'cases', 
      label: 'إدارة القضايا', 
      icon: '📋', 
      href: '/cases', 
      category: 'management',
      description: 'إدارة شاملة لجميع القضايا القانونية'
    },
    { 
      id: 'calendar', 
      label: 'التقويم', 
      icon: '📅', 
      href: '/calendar', 
      category: 'management',
      description: 'تقويم المواعيد والجلسات'
    },
    { 
      id: 'documents', 
      label: 'المستندات', 
      icon: '📁', 
      href: '/documents', 
      category: 'management',
      description: 'إدارة المستندات والملفات القانونية'
    },
    { 
      id: 'collaboration', 
      label: 'التعاون', 
      icon: '🤝', 
      href: '/collaboration', 
      category: 'management',
      description: 'نظام التعاون والمراجعة مع الفريق',
      isNew: true
    },
    
    // الأدوات
    { 
      id: 'templates', 
      label: 'القوالب', 
      icon: '📝', 
      href: '/templates', 
      category: 'tools',
      description: 'قوالب المرافعات والمذكرات القانونية'
    },
    { 
      id: 'kb', 
      label: 'قاعدة المعرفة', 
      icon: '📚', 
      href: '/kb', 
      category: 'tools',
      description: 'قاعدة المعرفة القانونية الفلسطينية'
    },
    { 
      id: 'reference-checker', 
      label: 'المدقق المرجعي', 
      icon: '🔍', 
      href: '/reference-checker', 
      category: 'tools',
      description: 'فحص المراجع القانونية'
    },
    { 
      id: 'exports', 
      label: 'الصادرات', 
      icon: '⬇️', 
      href: '/exports', 
      category: 'tools',
      description: 'تصدير التقارير والمستندات'
    },
    
    // الإعدادات
    { 
      id: 'history', 
      label: 'التاريخ', 
      icon: '📑', 
      href: '/history', 
      category: 'settings',
      description: 'تاريخ القضايا والأنشطة'
    },
    { 
      id: 'settings', 
      label: 'الإعدادات', 
      icon: '⚙️', 
      href: '/settings', 
      category: 'settings',
      description: 'إعدادات المنصة والتخصيص'
    },
    { 
      id: 'about', 
      label: 'تعليمات', 
      icon: '❓', 
      href: '/about', 
      category: 'settings',
      description: 'دليل الاستخدام والمساعدة'
    },
    { 
      id: 'navigation-demo', 
      label: 'تجربة التنقل', 
      icon: '🧭', 
      href: '/navigation-demo', 
      category: 'tools',
      description: 'تجربة أنظمة التنقل الجديدة',
      isNew: true
    },
  ];

  // تصنيف العناصر
  const categorizedItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, NavigationItem[]>);

  // البحث المفلتر
  const filteredItems = navigationItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.icon.includes(searchQuery)
  );

  // العناصر المعروضة
  const displayItems = searchQuery ? filteredItems : 
    (activeCategory === 'all' ? navigationItems : categorizedItems[activeCategory] || []);

  // تحميل العناصر الأخيرة
  useEffect(() => {
    const savedRecent = localStorage.getItem('recentNavigationItems');
    if (savedRecent) {
      setRecentItems(JSON.parse(savedRecent));
    }
  }, []);

  // حفظ العنصر كأخير
  const addToRecent = (itemId: string) => {
    const newRecent = [itemId, ...recentItems.filter(id => id !== itemId)].slice(0, 5);
    setRecentItems(newRecent);
    localStorage.setItem('recentNavigationItems', JSON.stringify(newRecent));
  };

  // العناصر الأخيرة
  const recentItemsList = navigationItems.filter(item => recentItems.includes(item.id));

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'main': return 'الصفحات الرئيسية';
      case 'management': return 'إدارة القضايا';
      case 'tools': return 'الأدوات';
      case 'settings': return 'الإعدادات';
      default: return 'الكل';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'main': return '⭐';
      case 'management': return '📊';
      case 'tools': return '🔧';
      case 'settings': return '⚙️';
      default: return '📁';
    }
  };

  // إغلاق الشريط الجانبي عند النقر خارجه
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.smart-sidebar') && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="smart-sidebar" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      width: '320px',
      background: theme.card,
      borderRight: `1px solid ${theme.border}`,
      boxShadow: `4px 0 20px ${theme.shadow}`,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideInLeft 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: `1px solid ${theme.border}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{
            color: theme.text,
            margin: '0',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            ⚖️ التنقل الذكي
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.text,
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div style={{
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder="بحث في الصفحات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              background: theme.background,
              color: theme.text,
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <span style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: theme.text,
            opacity: 0.7
          }}>
            🔍
          </span>
        </div>
      </div>

      {/* Categories */}
      {!searchQuery && (
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${theme.border}`
        }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px'
          }}>
            <button
              onClick={() => setActiveCategory('all')}
              style={{
                padding: '8px 12px',
                borderRadius: '16px',
                border: 'none',
                background: activeCategory === 'all' ? theme.accent : theme.resultBg,
                color: activeCategory === 'all' ? '#fff' : theme.text,
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}
            >
              📁 الكل
            </button>
            {Object.keys(categorizedItems).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '16px',
                  border: 'none',
                  background: activeCategory === category ? theme.accent : theme.resultBg,
                  color: activeCategory === category ? '#fff' : theme.text,
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}
              >
                {getCategoryIcon(category)} {getCategoryLabel(category)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Items */}
      {!searchQuery && recentItemsList.length > 0 && activeCategory === 'all' && (
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${theme.border}`
        }}>
          <h3 style={{
            color: theme.text,
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            🕒 الأخيرة
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {recentItemsList.map((item) => (
              <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>
                <div
                  onClick={() => addToRecent(item.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: router.pathname === item.href ? theme.accent : theme.resultBg,
                    color: router.pathname === item.href ? '#fff' : theme.text,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (router.pathname !== item.href) {
                      e.currentTarget.style.background = theme.accent2;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (router.pathname !== item.href) {
                      e.currentTarget.style.background = theme.resultBg;
                    }
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px 20px'
      }}>
        {searchQuery && (
          <div style={{
            marginBottom: '16px',
            paddingBottom: '16px',
            borderBottom: `1px solid ${theme.border}`
          }}>
            <h3 style={{
              color: theme.text,
              margin: '0 0 12px 0',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              🔍 نتائج البحث ({filteredItems.length})
            </h3>
          </div>
        )}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {displayItems.map((item) => (
            <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>
              <div
                onClick={() => {
                  addToRecent(item.id);
                  onClose();
                }}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: router.pathname === item.href ? theme.accent : theme.resultBg,
                  color: router.pathname === item.href ? '#fff' : theme.text,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: `1px solid ${router.pathname === item.href ? theme.accent : 'transparent'}`,
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (router.pathname !== item.href) {
                    e.currentTarget.style.background = theme.accent2;
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (router.pathname !== item.href) {
                    e.currentTarget.style.background = theme.resultBg;
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '4px'
                }}>
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', flex: 1 }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '8px',
                      background: '#10b981',
                      color: '#fff',
                      fontSize: '8px',
                      fontWeight: 'bold'
                    }}>
                      {item.badge}
                    </span>
                  )}
                  {item.isNew && (
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '8px',
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '8px',
                      fontWeight: 'bold'
                    }}>
                      جديد
                    </span>
                  )}
                </div>
                <p style={{
                  margin: '0',
                  fontSize: '12px',
                  opacity: 0.8,
                  lineHeight: '1.4'
                }}>
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: `1px solid ${theme.border}`,
        background: theme.background
      }}>
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <button style={{
            flex: 1,
            padding: '8px',
            borderRadius: '6px',
            border: 'none',
            background: theme.accent2,
            color: '#fff',
            fontSize: '10px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            🚀 إجراء سريع
          </button>
          <button style={{
            flex: 1,
            padding: '8px',
            borderRadius: '6px',
            border: 'none',
            background: theme.accent2,
            color: '#fff',
            fontSize: '10px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            📊 تقرير
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
