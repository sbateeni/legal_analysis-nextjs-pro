import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../contexts/ThemeContext';
import Link from 'next/link';

interface SidebarToolbarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  category: 'main' | 'management' | 'tools' | 'settings';
  description: string;
  isNew?: boolean;
  badge?: string;
}

export default function SidebarToolbar({ isCollapsed = false, onToggle }: SidebarToolbarProps) {
  const { theme, darkMode, setDarkMode } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [favoriteItems, setFavoriteItems] = useState<string[]>([]);
  const [recentItems, setRecentItems] = useState<string[]>([]);

  // تعريف عناصر التنقل
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
    { 
      id: 'navigation-demo', 
      label: 'تجربة التنقل', 
      icon: '🧭', 
      href: '/navigation-demo', 
      category: 'tools',
      description: 'تجربة أنظمة التنقل الجديدة',
      isNew: true
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

  // تحميل البيانات المحفوظة
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteNavigationItems');
    const savedRecent = localStorage.getItem('recentNavigationItems');
    
    if (savedFavorites) {
      setFavoriteItems(JSON.parse(savedFavorites));
    }
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

  // تبديل المفضلة
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

  // العناصر المفضلة والأخيرة
  const favoriteItemsList = navigationItems.filter(item => favoriteItems.includes(item.id));
  const recentItemsList = navigationItems.filter(item => recentItems.includes(item.id));

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      width: isCollapsed ? '80px' : '320px',
      background: theme.card,
      borderRight: `1px solid ${theme.border}`,
      boxShadow: `4px 0 20px ${theme.shadow}`,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: isCollapsed ? '20px 16px' : '20px',
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '80px'
      }}>
        {!isCollapsed && (
          <div>
            <h2 style={{
              color: theme.text,
              margin: '0 0 8px 0',
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⚖️ منصة التحليل القانوني
            </h2>
            <div style={{
              padding: '2px 8px',
              borderRadius: '12px',
              background: theme.accent,
              color: '#fff',
              fontSize: '10px',
              fontWeight: 'bold',
              display: 'inline-block'
            }}>
              AI-Powered
            </div>
          </div>
        )}
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {/* Theme Toggle Button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: theme.accent2,
              color: '#fff',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
            title={darkMode ? 'التبديل للوضع النهاري' : 'التبديل للوضع الليلي'}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          <button
            onClick={onToggle}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: theme.accent2,
              color: '#fff',
              fontSize: '16px',
              cursor: 'pointer',
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
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${theme.border}`
        }}>
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
      )}

      {/* Categories */}
      {!isCollapsed && !searchQuery && (
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

      {/* Navigation Items */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px 0'
      }}>
        {/* المفضلة */}
        {!isCollapsed && !searchQuery && favoriteItemsList.length > 0 && activeCategory === 'all' && (
          <div style={{
            padding: '0 20px 16px 20px',
            borderBottom: `1px solid ${theme.border}`,
            marginBottom: '16px'
          }}>
            <h3 style={{
              color: theme.text,
              margin: '0 0 12px 0',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⭐ المفضلة
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {favoriteItemsList.map((item) => (
                <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>
                  <div
                    onClick={() => addToRecent(item.id)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: router.pathname === item.href ? theme.accent : theme.resultBg,
                      color: router.pathname === item.href ? '#fff' : theme.text,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
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
                    <span style={{ fontSize: '18px' }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        marginBottom: '2px'
                      }}>
                        {item.label}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        opacity: 0.7
                      }}>
                        {item.description}
                      </div>
                    </div>
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
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* الأخيرة */}
        {!isCollapsed && !searchQuery && recentItemsList.length > 0 && activeCategory === 'all' && (
          <div style={{
            padding: '0 20px 16px 20px',
            borderBottom: `1px solid ${theme.border}`,
            marginBottom: '16px'
          }}>
            <h3 style={{
              color: theme.text,
              margin: '0 0 12px 0',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
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
                      padding: '12px',
                      borderRadius: '8px',
                      background: router.pathname === item.href ? theme.accent : theme.resultBg,
                      color: router.pathname === item.href ? '#fff' : theme.text,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
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
                    <span style={{ fontSize: '18px' }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        marginBottom: '2px'
                      }}>
                        {item.label}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        opacity: 0.7
                      }}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* العناصر الرئيسية */}
        <div style={{
          padding: '0 20px'
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
                  onClick={() => addToRecent(item.id)}
                  style={{
                    padding: isCollapsed ? '16px 8px' : '12px',
                    borderRadius: '8px',
                    background: router.pathname === item.href ? theme.accent : theme.resultBg,
                    color: router.pathname === item.href ? '#fff' : theme.text,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: isCollapsed ? '0' : '12px',
                    flexDirection: isCollapsed ? 'column' : 'row',
                    position: 'relative',
                    minHeight: isCollapsed ? '60px' : 'auto'
                  }}
                  onMouseEnter={(e) => {
                    if (router.pathname !== item.href) {
                      e.currentTarget.style.background = theme.accent2;
                      if (!isCollapsed) {
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (router.pathname !== item.href) {
                      e.currentTarget.style.background = theme.resultBg;
                      e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    toggleFavorite(item.id);
                  }}
                  title={isCollapsed ? item.label : `${item.label} (انقر بالزر الأيمن لإضافة للمفضلة)`}
                >
                  <span style={{ 
                    fontSize: isCollapsed ? '20px' : '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.icon}
                  </span>
                  
                  {!isCollapsed && (
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        marginBottom: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {item.label}
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
                      <div style={{
                        fontSize: '11px',
                        opacity: 0.7
                      }}>
                        {item.description}
                      </div>
                    </div>
                  )}

                  {!isCollapsed && item.badge && (
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
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      {!isCollapsed && (
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
              borderRadius: '6px',
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
    </div>
  );
}
