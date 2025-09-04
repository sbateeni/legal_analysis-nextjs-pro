import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../contexts/ThemeContext';
import Link from 'next/link';

interface SmartToolbarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  category: 'main' | 'management' | 'tools' | 'settings';
  priority: number;
  isNew?: boolean;
}

export default function SmartToolbar({ isCollapsed = false, onToggle }: SmartToolbarProps) {
  const { theme, darkMode, setDarkMode, colorScheme } = useTheme();
  const router = useRouter();
  const [isExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteItems, setFavoriteItems] = useState<string[]>([]);

  // تعريف عناصر التنقل مع التصنيف والأولوية
  const navigationItems: NavigationItem[] = [
    // الصفحات الرئيسية
    { id: 'home', label: 'الرئيسية', icon: '🏠', href: '/', category: 'main', priority: 1 },
    { id: 'chat', label: 'المساعد الذكي', icon: '🤖', href: '/chat', category: 'main', priority: 2 },
    { id: 'analytics', label: 'التحليلات', icon: '📊', href: '/analytics', category: 'main', priority: 3 },
    
    // إدارة القضايا
    { id: 'cases', label: 'إدارة القضايا', icon: '📋', href: '/cases', category: 'management', priority: 1 },
    { id: 'calendar', label: 'التقويم', icon: '📅', href: '/calendar', category: 'management', priority: 2 },
    { id: 'documents', label: 'المستندات', icon: '📁', href: '/documents', category: 'management', priority: 3 },
    { id: 'collaboration', label: 'التعاون', icon: '🤝', href: '/collaboration', category: 'management', priority: 4 },
    
    // الأدوات
    { id: 'templates', label: 'القوالب', icon: '📝', href: '/templates', category: 'tools', priority: 1 },
    { id: 'kb', label: 'قاعدة المعرفة', icon: '📚', href: '/kb', category: 'tools', priority: 2 },
    { id: 'rag', label: 'البحث القانوني', icon: '🔍', href: '/rag', category: 'tools', priority: 3 },
    { id: 'advanced-search', label: 'البحث المتقدم', icon: '🔍', href: '/advanced-search', category: 'tools', priority: 4, isNew: true },
    { id: 'legal-updates', label: 'التحديثات القانونية', icon: '🔄', href: '/legal-updates', category: 'tools', priority: 5, isNew: true },
    { id: 'reference-checker', label: 'المدقق المرجعي', icon: '🔍', href: '/reference-checker', category: 'tools', priority: 6 },
    { id: 'exports', label: 'الصادرات', icon: '⬇️', href: '/exports', category: 'tools', priority: 7 },
    { id: 'resources', label: 'الموارد', icon: '📚', href: '/resources', category: 'tools', priority: 8 },
    
    // الإعدادات
    { id: 'about', label: 'تعليمات النظام', icon: '📖', href: '/about', category: 'settings', priority: 1 },
    { id: 'history', label: 'التاريخ', icon: '📑', href: '/history', category: 'settings', priority: 2 },
    { id: 'settings', label: 'الإعدادات', icon: '⚙️', href: '/settings', category: 'settings', priority: 3 },
    { id: 'privacy', label: 'الخصوصية', icon: '🔒', href: '/privacy', category: 'settings', priority: 4 },
    { id: 'offline', label: 'وضع عدم الاتصال', icon: '📱', href: '/offline', category: 'settings', priority: 5 },
    
    // صفحات إضافية
    { id: 'navigation-demo', label: 'تجربة التنقل', icon: '🧭', href: '/navigation-demo', category: 'tools', priority: 9, isNew: true },
  ];

  // تصنيف العناصر حسب الفئة
  const categorizedItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, NavigationItem[]>);

  // ترتيب العناصر حسب الأولوية
  Object.keys(categorizedItems).forEach(category => {
    categorizedItems[category].sort((a, b) => a.priority - b.priority);
  });

  // العناصر المفضلة (الأكثر استخداماً)
  const favoriteItemsList = navigationItems.filter(item => favoriteItems.includes(item.id));

  // البحث المفلتر
  const filteredItems = navigationItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.icon.includes(searchQuery)
  );

  // تحميل المفضلة من التخزين المحلي
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteNavigationItems');
    if (savedFavorites) {
      setFavoriteItems(JSON.parse(savedFavorites));
    }
  }, []);

  // حفظ المفضلة
  const toggleFavorite = (itemId: string) => {
    const newFavorites = favoriteItems.includes(itemId)
      ? favoriteItems.filter(id => id !== itemId)
      : [...favoriteItems, itemId];
    
    setFavoriteItems(newFavorites);
    localStorage.setItem('favoriteNavigationItems', JSON.stringify(newFavorites));
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'main': return 'الصفحات الرئيسية';
      case 'management': return 'إدارة القضايا';
      case 'tools': return 'الأدوات';
      case 'settings': return 'الإعدادات';
      default: return category;
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

  if (isCollapsed) {
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={onToggle}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: 'none',
            background: theme.accent,
            color: '#fff',
            fontSize: '24px',
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
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: theme.card,
      borderBottom: `1px solid ${theme.border}`,
      boxShadow: `0 2px 10px ${theme.shadow}`,
      zIndex: 1000,
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '12px 20px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <h1 style={{
              color: theme.text,
              margin: '0',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              ⚖️ منصة التحليل القانوني الذكي
            </h1>
            <div style={{
              padding: '4px 8px',
              borderRadius: '12px',
              background: theme.accent,
              color: '#fff',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              AI-Powered
            </div>
            <div style={{
              padding: '4px 8px',
              borderRadius: '12px',
              background: theme.accent2,
              color: '#fff',
              fontSize: '10px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              🎨 {colorScheme === 'green' ? 'أخضر' : 
                   colorScheme === 'blue' ? 'أزرق' : 
                   colorScheme === 'purple' ? 'بنفسجي' : 
                   colorScheme === 'orange' ? 'برتقالي' : 
                   colorScheme === 'pink' ? 'وردي' : 
                   colorScheme === 'teal' ? 'تركوازي' : 'أخضر'}
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Search */}
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <input
                type="text"
                placeholder="بحث سريع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '8px 12px 8px 36px',
                  borderRadius: '20px',
                  border: `1px solid ${theme.border}`,
                  background: theme.background,
                  color: theme.text,
                  fontSize: '14px',
                  outline: 'none',
                  width: '200px'
                }}
              />
              <span style={{
                position: 'absolute',
                left: '12px',
                color: theme.text,
                opacity: 0.7
              }}>
                🔍
              </span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: 'transparent',
                color: theme.text,
                cursor: 'pointer',
                fontSize: '16px'
              }}
              title={darkMode ? 'التبديل للوضع النهاري' : 'التبديل للوضع الليلي'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Toggle Button */}
            <button
              onClick={onToggle}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: 'transparent',
                color: theme.text,
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              {isExpanded ? '📤' : '📥'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '8px',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {/* المفضلة */}
          {favoriteItemsList.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              minWidth: '80px'
            }}>
              <div style={{
                fontSize: '10px',
                color: theme.text,
                opacity: 0.7,
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                ⭐ المفضلة
              </div>
              <div style={{
                display: 'flex',
                gap: '4px'
              }}>
                {favoriteItemsList.slice(0, 3).map((item) => (
                  <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>
                    <div style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: router.pathname === item.href ? theme.accent : theme.resultBg,
                      color: router.pathname === item.href ? '#fff' : theme.text,
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '40px',
                      height: '40px'
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
                    title={item.label}
                    >
                      {item.icon}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* البحث المفلتر */}
          {searchQuery && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              minWidth: '80px'
            }}>
              <div style={{
                fontSize: '10px',
                color: theme.text,
                opacity: 0.7,
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                🔍 النتائج
              </div>
              <div style={{
                display: 'flex',
                gap: '4px',
                flexWrap: 'wrap'
              }}>
                {filteredItems.slice(0, 5).map((item) => (
                  <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>
                    <div style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: router.pathname === item.href ? theme.accent : theme.resultBg,
                      color: router.pathname === item.href ? '#fff' : theme.text,
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '40px',
                      height: '40px'
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
                    title={item.label}
                    >
                      {item.icon}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* الفئات */}
          {!searchQuery && Object.keys(categorizedItems).map((category) => (
            <div key={category} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              minWidth: '120px',
              maxWidth: '200px'
            }}>
              <div style={{
                fontSize: '10px',
                color: theme.text,
                opacity: 0.7,
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                {getCategoryIcon(category)} {getCategoryLabel(category)}
              </div>
              <div style={{
                display: 'flex',
                gap: '6px',
                flexWrap: 'wrap',
                justifyContent: 'flex-start'
              }}>
                {categorizedItems[category].map((item) => (
                  <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>
                    <div style={{
                      padding: '6px',
                      borderRadius: '6px',
                      background: router.pathname === item.href ? theme.accent : theme.resultBg,
                      color: router.pathname === item.href ? '#fff' : theme.text,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '32px',
                      height: '32px',
                      position: 'relative'
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
                    onContextMenu={(e) => {
                      e.preventDefault();
                      toggleFavorite(item.id);
                    }}
                    title={`${item.label} (انقر بالزر الأيمن لإضافة للمفضلة)`}
                    >
                      {item.icon}
                      {item.isNew && (
                        <div style={{
                          position: 'absolute',
                          top: '-2px',
                          right: '-2px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#ef4444',
                          fontSize: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff'
                        }}>
                          N
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: `1px solid ${theme.border}`
        }}>
          <button style={{
            padding: '4px 8px',
            borderRadius: '12px',
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
            padding: '4px 8px',
            borderRadius: '12px',
            border: 'none',
            background: theme.accent2,
            color: '#fff',
            fontSize: '10px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            📊 تقرير سريع
          </button>
          <button style={{
            padding: '4px 8px',
            borderRadius: '12px',
            border: 'none',
            background: theme.accent2,
            color: '#fff',
            fontSize: '10px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            🔔 التنبيهات
          </button>
        </div>
      </div>
    </div>
  );
}
