import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { isMobile } from '../utils/crypto';

interface UpdateStats {
  totalUpdates: number;
  unreadNotifications: number;
  lastUpdate: Date | null;
  activeSources: number;
}

interface LegalUpdate {
  id: string;
  sourceId: string;
  title: string;
  content: string;
  type: 'new' | 'modified' | 'repealed';
  date: Date;
  url: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  affectedLaws?: string[];
  summary: string;
}

interface UpdateNotification {
  id: string;
  type: 'new_law' | 'law_modified' | 'law_repealed' | 'system_update';
  title: string;
  message: string;
  date: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
}

export default function LegalUpdatesPage() {
  const { theme } = useTheme();
  const [stats, setStats] = useState<UpdateStats | null>(null);
  const [updates, setUpdates] = useState<LegalUpdate[]>([]);
  const [notifications, setNotifications] = useState<UpdateNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'updates' | 'notifications'>('updates');
  const [filter, setFilter] = useState<'all' | 'new' | 'modified' | 'repealed'>('all');
  const [importanceFilter, setImportanceFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');

  useEffect(() => {
    fetchData();
    // لا يوجد تحديث تلقائي - التحديث يدوي فقط للحفاظ على التوكينز
  }, []);

  const fetchData = async () => {
    try {
      const [statusResponse, notificationsResponse] = await Promise.all([
        fetch('/api/legal-updates/status'),
        fetch('/api/legal-updates/notifications?limit=100')
      ]);

      const statusData = await statusResponse.json();
      const notificationsData = await notificationsResponse.json();

      if (statusData.status === 'success') {
        setStats(statusData.data.stats);
        setUpdates(statusData.data.recentUpdates);
      }

      if (notificationsData.status === 'success') {
        setNotifications(notificationsData.data.notifications);
      }
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualUpdate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/legal-updates/manual-update', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        await fetchData();
      }
    } catch (error) {
      console.error('خطأ في التحديث اليدوي:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/legal-updates/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId,
          action: 'mark_read'
        })
      });
      
      await fetchData();
    } catch (error) {
      console.error('خطأ في تحديد الإشعار كمقروء:', error);
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#059669';
      default: return theme.text;
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📢';
      case 'low': return 'ℹ️';
      default: return '📄';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new': return '🆕';
      case 'modified': return '✏️';
      case 'repealed': return '🗑️';
      default: return '📄';
    }
  };

  const filteredUpdates = updates.filter(update => {
    if (filter !== 'all' && update.type !== filter) return false;
    if (importanceFilter !== 'all' && update.importance !== importanceFilter) return false;
    return true;
  });

  const filteredNotifications = notifications.filter(notification => {
    if (importanceFilter !== 'all' && notification.priority !== importanceFilter) return false;
    return true;
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.background,
      color: theme.text,
      fontFamily: 'Tajawal, Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: isMobile() ? '1rem' : '2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: isMobile() ? '1.5rem' : '2rem' }}>
            🔄 التحديثات القانونية
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: isMobile() ? '0.9rem' : '1rem' }}>
            مراقبة وتتبع التحديثات في القوانين والأحكام الفلسطينية
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile() ? '1rem' : '2rem' }}>
        {/* Stats Cards */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile() ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: theme.card,
              padding: '1.5rem',
              borderRadius: '0.75rem',
              boxShadow: `0 1px 3px ${theme.shadow}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', color: '#0c4a6e', marginBottom: '0.5rem' }}>
                {stats.totalUpdates}
              </div>
              <div style={{ fontSize: '0.9rem', color: theme.text, opacity: 0.7 }}>
                إجمالي التحديثات
              </div>
            </div>
            
            <div style={{
              background: theme.card,
              padding: '1.5rem',
              borderRadius: '0.75rem',
              boxShadow: `0 1px 3px ${theme.shadow}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', color: '#dc2626', marginBottom: '0.5rem' }}>
                {stats.unreadNotifications}
              </div>
              <div style={{ fontSize: '0.9rem', color: theme.text, opacity: 0.7 }}>
                إشعارات غير مقروءة
              </div>
            </div>
            
            <div style={{
              background: theme.card,
              padding: '1.5rem',
              borderRadius: '0.75rem',
              boxShadow: `0 1px 3px ${theme.shadow}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', color: '#166534', marginBottom: '0.5rem' }}>
                {stats.activeSources}
              </div>
              <div style={{ fontSize: '0.9rem', color: theme.text, opacity: 0.7 }}>
                مصادر نشطة
              </div>
            </div>
            
            <div style={{
              background: theme.card,
              padding: '1.5rem',
              borderRadius: '0.75rem',
              boxShadow: `0 1px 3px ${theme.shadow}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', color: '#92400e', marginBottom: '0.5rem' }}>
                {stats.lastUpdate ? '🟢' : '🔴'}
              </div>
              <div style={{ fontSize: '0.9rem', color: theme.text, opacity: 0.7 }}>
                {stats.lastUpdate ? 'متصل' : 'غير متصل'}
              </div>
            </div>
          </div>
        )}

        {/* Warning Message */}
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '2px solid #f59e0b',
          padding: '1rem',
          borderRadius: '0.75rem',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#92400e', marginBottom: '0.5rem' }}>
            ⚠️ تنبيه مهم
          </div>
          <div style={{ fontSize: '0.9rem', color: '#92400e' }}>
            التحديث يدوي فقط للحفاظ على التوكينز. يتم استخدام Gemini AI لتحليل المحتوى من المصادر الرسمية.
          </div>
        </div>

        {/* Controls */}
        <div style={{
          background: theme.card,
          padding: '1rem',
          borderRadius: '0.75rem',
          boxShadow: `0 1px 3px ${theme.shadow}`,
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setActiveTab('updates')}
                style={{
                  background: activeTab === 'updates' ? theme.accent : 'transparent',
                  color: activeTab === 'updates' ? 'white' : theme.text,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '0.5rem',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                📄 التحديثات
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                style={{
                  background: activeTab === 'notifications' ? theme.accent : 'transparent',
                  color: activeTab === 'notifications' ? 'white' : theme.text,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '0.5rem',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                🔔 الإشعارات
              </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {activeTab === 'updates' && (
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  style={{
                    background: theme.background,
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '0.25rem',
                    padding: '0.5rem',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="new">جديد</option>
                  <option value="modified">معدل</option>
                  <option value="repealed">ملغي</option>
                </select>
              )}
              
              <select
                value={importanceFilter}
                onChange={(e) => setImportanceFilter(e.target.value as any)}
                style={{
                  background: theme.background,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '0.25rem',
                  padding: '0.5rem',
                  fontSize: '0.9rem'
                }}
              >
                <option value="all">جميع الأهمية</option>
                <option value="critical">حرج</option>
                <option value="high">عالي</option>
                <option value="medium">متوسط</option>
                <option value="low">منخفض</option>
              </select>
            </div>

            {/* Manual Update Button */}
            <button
              onClick={handleManualUpdate}
              disabled={isLoading}
              style={{
                background: theme.accent,
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem 1rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                fontSize: '0.9rem'
              }}
            >
              {isLoading ? '🔄 جاري التحديث مع Gemini AI...' : '🤖 تحديث يدوي مع Gemini AI'}
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{
            background: theme.card,
            padding: '3rem',
            borderRadius: '0.75rem',
            boxShadow: `0 1px 3px ${theme.shadow}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h3>جاري تحميل البيانات...</h3>
          </div>
        ) : (
          <div style={{
            background: theme.card,
            borderRadius: '0.75rem',
            boxShadow: `0 1px 3px ${theme.shadow}`,
            overflow: 'hidden'
          }}>
            {activeTab === 'updates' ? (
              <div>
                <div style={{
                  padding: '1rem',
                  borderBottom: `1px solid ${theme.border}`,
                  background: theme.background
                }}>
                  <h3 style={{ margin: 0, color: theme.text }}>
                    التحديثات القانونية ({filteredUpdates.length})
                  </h3>
                </div>
                
                {filteredUpdates.length === 0 ? (
                                     <div style={{
                     padding: '3rem',
                     textAlign: 'center',
                     color: theme.text,
                     opacity: 0.7
                   }}>
                     <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                     <h3>لا توجد تحديثات</h3>
                     <p>لم يتم العثور على تحديثات تطابق المرشحات المحددة</p>
                   </div>
                ) : (
                  <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {filteredUpdates.map((update) => (
                      <div key={update.id} style={{
                        padding: '1rem',
                        borderBottom: `1px solid ${theme.border}`,
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = theme.background}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '0.5rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>
                              {getTypeIcon(update.type)}
                            </span>
                            <span style={{ fontSize: '1.2rem' }}>
                              {getImportanceIcon(update.importance)}
                            </span>
                            <h4 style={{ 
                              margin: 0, 
                              color: getImportanceColor(update.importance),
                              fontSize: '1rem'
                            }}>
                              {update.title}
                            </h4>
                          </div>
                                                     <div style={{
                             fontSize: '0.8rem',
                             color: theme.text,
                             opacity: 0.7
                           }}>
                             {new Date(update.date).toLocaleDateString('ar-EG')}
                           </div>
                        </div>
                        
                        <p style={{
                          margin: '0 0 0.5rem 0',
                          color: theme.text,
                          lineHeight: 1.6
                        }}>
                          {update.summary}
                        </p>
                        
                        {update.affectedLaws && update.affectedLaws.length > 0 && (
                          <div style={{ marginBottom: '0.5rem' }}>
                                                         <div style={{
                               fontSize: '0.8rem',
                               color: theme.text,
                               opacity: 0.7,
                               marginBottom: '0.25rem'
                             }}>
                               القوانين المتأثرة:
                             </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                              {update.affectedLaws.map((law, idx) => (
                                <span key={idx} style={{
                                  background: '#f0f9ff',
                                  color: '#0c4a6e',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '0.25rem',
                                  fontSize: '0.7rem'
                                }}>
                                  {law}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <a
                          href={update.url}
                          target="_blank"
                          rel="noopener noreferrer"
                                                   style={{
                           color: theme.accent,
                           textDecoration: 'none',
                           fontSize: '0.8rem'
                         }}
                        >
                          🔗 عرض التفاصيل
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{
                  padding: '1rem',
                  borderBottom: `1px solid ${theme.border}`,
                  background: theme.background
                }}>
                  <h3 style={{ margin: 0, color: theme.text }}>
                    الإشعارات ({filteredNotifications.length})
                  </h3>
                </div>
                
                {filteredNotifications.length === 0 ? (
                                     <div style={{
                     padding: '3rem',
                     textAlign: 'center',
                     color: theme.text,
                     opacity: 0.7
                   }}>
                     <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
                     <h3>لا توجد إشعارات</h3>
                     <p>لم يتم العثور على إشعارات تطابق المرشحات المحددة</p>
                   </div>
                ) : (
                  <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {filteredNotifications.map((notification) => (
                      <div key={notification.id} style={{
                        padding: '1rem',
                        borderBottom: `1px solid ${theme.border}`,
                        background: notification.isRead ? 'transparent' : '#fef2f2',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onClick={() => markNotificationAsRead(notification.id)}
                      onMouseEnter={(e) => e.currentTarget.style.background = notification.isRead ? theme.background : '#fecaca'}
                      onMouseLeave={(e) => e.currentTarget.style.background = notification.isRead ? 'transparent' : '#fef2f2'}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '0.5rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>
                              {getImportanceIcon(notification.priority)}
                            </span>
                            <h4 style={{ 
                              margin: 0, 
                              color: getImportanceColor(notification.priority),
                              fontSize: '1rem'
                            }}>
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <span style={{
                                background: '#dc2626',
                                color: 'white',
                                fontSize: '0.6rem',
                                padding: '0.2rem 0.4rem',
                                borderRadius: '0.25rem'
                              }}>
                                جديد
                              </span>
                            )}
                          </div>
                                                     <div style={{
                             fontSize: '0.8rem',
                             color: theme.text,
                             opacity: 0.7
                           }}>
                             {new Date(notification.date).toLocaleDateString('ar-EG')}
                           </div>
                        </div>
                        
                        <p style={{
                          margin: 0,
                          color: theme.text,
                          lineHeight: 1.6
                        }}>
                          {notification.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
