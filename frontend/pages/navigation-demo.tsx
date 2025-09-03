import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import SmartToolbar from '../components/SmartToolbar';
import FloatingNavigation from '../components/FloatingNavigation';
import SmartSidebar from '../components/SmartSidebar';
import SidebarToolbar from '../components/SidebarToolbar';

export default function NavigationDemo() {
  const { theme } = useTheme();
  const [activeDemo, setActiveDemo] = useState<'toolbar' | 'floating' | 'sidebar' | 'sidebar-toolbar'>('sidebar-toolbar');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);
  const [isSidebarToolbarCollapsed, setIsSidebarToolbarCollapsed] = useState(false);

  const demos = [
    {
      id: 'sidebar-toolbar',
      name: 'التولبار الجانبي',
      description: 'تولبار جانبي شامل مع جميع الصفحات',
      icon: '📑',
      features: ['جميع الصفحات', 'بحث متقدم', 'مفضلة', 'تاريخ التنقل']
    },
    {
      id: 'toolbar',
      name: 'التولبار الذكي',
      description: 'شريط تنقل علوي ذكي مع بحث وتجميع',
      icon: '📊',
      features: ['بحث سريع', 'تجميع ذكي', 'مفضلة', 'إجراءات سريعة']
    },
    {
      id: 'floating',
      name: 'التنقل العائم',
      description: 'زر عائم مع قائمة دائرية تفاعلية',
      icon: '🎯',
      features: ['قائمة دائرية', 'فئات منظمة', 'تأثيرات بصرية', 'تنبيهات']
    },
    {
      id: 'sidebar',
      name: 'الشريط الجانبي',
      description: 'شريط جانبي شامل مع بحث ووصف',
      icon: '📋',
      features: ['بحث متقدم', 'وصف الصفحات', 'تاريخ التنقل', 'فئات منظمة']
    }
  ];

  return (
    <div style={{
      background: theme.background,
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: theme.card,
          padding: '24px',
          borderRadius: '12px',
          boxShadow: `0 4px 20px ${theme.shadow}`,
          marginBottom: '24px',
          border: `1px solid ${theme.border}`
        }}>
          <h1 style={{
            color: theme.text,
            margin: '0 0 16px 0',
            fontSize: '28px',
            fontWeight: 'bold'
          }}>
            🧭 عرض أنظمة التنقل الجديدة
          </h1>
          <p style={{
            color: theme.text,
            margin: '0',
            fontSize: '16px',
            opacity: 0.8
          }}>
            جرب الأنظمة الثلاثة الجديدة للتنقل واختر الأفضل لك
          </p>
        </div>

        {/* Demo Selector */}
        <div style={{
          background: theme.card,
          padding: '24px',
          borderRadius: '12px',
          boxShadow: `0 4px 20px ${theme.shadow}`,
          marginBottom: '24px',
          border: `1px solid ${theme.border}`
        }}>
          <h2 style={{
            color: theme.text,
            margin: '0 0 20px 0',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            اختر نظام التنقل للتجربة:
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {demos.map((demo) => (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id as any)}
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: `2px solid ${activeDemo === demo.id ? theme.accent : theme.border}`,
                  background: activeDemo === demo.id ? theme.accent : theme.resultBg,
                  color: activeDemo === demo.id ? '#fff' : theme.text,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (activeDemo !== demo.id) {
                    e.currentTarget.style.background = theme.accent2;
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeDemo !== demo.id) {
                    e.currentTarget.style.background = theme.resultBg;
                    e.currentTarget.style.color = theme.text;
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>{demo.icon}</span>
                  <h3 style={{
                    margin: '0',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    {demo.name}
                  </h3>
                </div>
                <p style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  opacity: 0.8
                }}>
                  {demo.description}
                </p>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '4px'
                }}>
                  {demo.features.map((feature, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '2px 6px',
                        borderRadius: '8px',
                        background: activeDemo === demo.id ? 'rgba(255,255,255,0.2)' : theme.accent2,
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Demo Area */}
        <div style={{
          background: theme.card,
          padding: '24px',
          borderRadius: '12px',
          boxShadow: `0 4px 20px ${theme.shadow}`,
          border: `1px solid ${theme.border}`,
          minHeight: '400px',
          position: 'relative'
        }}>
          <h2 style={{
            color: theme.text,
            margin: '0 0 20px 0',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            منطقة التجربة - {demos.find(d => d.id === activeDemo)?.name}
          </h2>

          {/* Sidebar Toolbar Demo */}
          {activeDemo === 'sidebar-toolbar' && (
            <div>
              <SidebarToolbar
                isCollapsed={isSidebarToolbarCollapsed}
                onToggle={() => setIsSidebarToolbarCollapsed(!isSidebarToolbarCollapsed)}
              />
              <div style={{
                marginLeft: isSidebarToolbarCollapsed ? '80px' : '320px',
                padding: '20px',
                background: theme.resultBg,
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                transition: 'margin-left 0.3s ease'
              }}>
                <h3 style={{
                  color: theme.text,
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  مميزات التولبار الجانبي:
                </h3>
                <ul style={{
                  color: theme.text,
                  margin: '0',
                  padding: '0 0 0 20px',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  <li>جميع الصفحات في مكان واحد</li>
                  <li>بحث متقدم مع وصف مفصل لكل صفحة</li>
                  <li>نظام المفضلة للصفحات المهمة</li>
                  <li>تاريخ التنقل الأخير</li>
                  <li>تصميم قابل للطي لتوفير المساحة</li>
                  <li>فئات منظمة مع أيقونات واضحة</li>
                </ul>
              </div>
            </div>
          )}

          {/* Toolbar Demo */}
          {activeDemo === 'toolbar' && (
            <div>
              <SmartToolbar
                isCollapsed={isToolbarCollapsed}
                onToggle={() => setIsToolbarCollapsed(!isToolbarCollapsed)}
              />
              <div style={{
                marginTop: '120px',
                padding: '20px',
                background: theme.resultBg,
                borderRadius: '8px',
                border: `1px solid ${theme.border}`
              }}>
                <h3 style={{
                  color: theme.text,
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  مميزات التولبار الذكي:
                </h3>
                <ul style={{
                  color: theme.text,
                  margin: '0',
                  padding: '0 0 0 20px',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  <li>بحث سريع في جميع الصفحات</li>
                  <li>تجميع ذكي للصفحات حسب الفئة</li>
                  <li>نظام المفضلة للصفحات الأكثر استخداماً</li>
                  <li>إجراءات سريعة للعمليات الشائعة</li>
                  <li>تصميم متجاوب يعمل على جميع الأجهزة</li>
                </ul>
              </div>
            </div>
          )}

          {/* Floating Demo */}
          {activeDemo === 'floating' && (
            <div>
              <FloatingNavigation isVisible={true} />
              <div style={{
                padding: '20px',
                background: theme.resultBg,
                borderRadius: '8px',
                border: `1px solid ${theme.border}`
              }}>
                <h3 style={{
                  color: theme.text,
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  مميزات التنقل العائم:
                </h3>
                <ul style={{
                  color: theme.text,
                  margin: '0',
                  padding: '0 0 0 20px',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  <li>زر عائم في الزاوية السفلية اليمنى</li>
                  <li>قائمة دائرية تفاعلية مع تأثيرات بصرية</li>
                  <li>فئات منظمة للصفحات</li>
                  <li>مؤشر التنبيهات</li>
                  <li>إجراءات سريعة مدمجة</li>
                </ul>
              </div>
            </div>
          )}

          {/* Sidebar Demo */}
          {activeDemo === 'sidebar' && (
            <div>
              <button
                onClick={() => setIsSidebarOpen(true)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: theme.accent,
                  color: '#fff',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginBottom: '20px'
                }}
              >
                فتح الشريط الجانبي
              </button>
              <SmartSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
              />
              <div style={{
                padding: '20px',
                background: theme.resultBg,
                borderRadius: '8px',
                border: `1px solid ${theme.border}`
              }}>
                <h3 style={{
                  color: theme.text,
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  مميزات الشريط الجانبي:
                </h3>
                <ul style={{
                  color: theme.text,
                  margin: '0',
                  padding: '0 0 0 20px',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  <li>بحث متقدم في الصفحات</li>
                  <li>وصف مفصل لكل صفحة</li>
                  <li>تاريخ التنقل الأخير</li>
                  <li>فئات منظمة مع أيقونات</li>
                  <li>تصميم شامل ومفصل</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div style={{
          background: theme.card,
          padding: '24px',
          borderRadius: '12px',
          boxShadow: `0 4px 20px ${theme.shadow}`,
          marginTop: '24px',
          border: `1px solid ${theme.border}`
        }}>
          <h2 style={{
            color: theme.text,
            margin: '0 0 16px 0',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            📋 تعليمات الاستخدام:
          </h2>
                     <div style={{
             display: 'grid',
             gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
             gap: '16px'
           }}>
             <div style={{
               padding: '16px',
               background: theme.resultBg,
               borderRadius: '8px',
               border: `1px solid ${theme.border}`
             }}>
               <h4 style={{
                 color: theme.text,
                 margin: '0 0 8px 0',
                 fontSize: '14px',
                 fontWeight: 'bold'
               }}>
                 📑 التولبار الجانبي
               </h4>
               <p style={{
                 color: theme.text,
                 margin: '0',
                 fontSize: '12px',
                 opacity: 0.8
               }}>
                 جميع الصفحات في مكان واحد، أضف للمفضلة بالنقر بالزر الأيمن
               </p>
             </div>
             <div style={{
               padding: '16px',
               background: theme.resultBg,
               borderRadius: '8px',
               border: `1px solid ${theme.border}`
             }}>
               <h4 style={{
                 color: theme.text,
                 margin: '0 0 8px 0',
                 fontSize: '14px',
                 fontWeight: 'bold'
               }}>
                 🧭 التولبار الذكي
               </h4>
               <p style={{
                 color: theme.text,
                 margin: '0',
                 fontSize: '12px',
                 opacity: 0.8
               }}>
                 استخدم البحث السريع، أضف الصفحات للمفضلة بالنقر بالزر الأيمن
               </p>
             </div>
            <div style={{
              padding: '16px',
              background: theme.resultBg,
              borderRadius: '8px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{
                color: theme.text,
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                🎯 التنقل العائم
              </h4>
              <p style={{
                color: theme.text,
                margin: '0',
                fontSize: '12px',
                opacity: 0.8
              }}>
                انقر على الزر العائم لفتح القائمة، جرب الفئات المختلفة
              </p>
            </div>
            <div style={{
              padding: '16px',
              background: theme.resultBg,
              borderRadius: '8px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{
                color: theme.text,
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                📋 الشريط الجانبي
              </h4>
              <p style={{
                color: theme.text,
                margin: '0',
                fontSize: '12px',
                opacity: 0.8
              }}>
                استخدم البحث المتقدم، تصفح الفئات، شاهد تاريخ التنقل
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
