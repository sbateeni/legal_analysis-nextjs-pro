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

interface LegalUpdatesStatusProps {
  theme: any;
  isMobile: boolean;
}

export default function LegalUpdatesStatus({ theme, isMobile }: LegalUpdatesStatusProps) {
  const [stats, setStats] = useState<UpdateStats | null>(null);
  const [recentUpdates, setRecentUpdates] = useState<LegalUpdate[]>([]);
  const [notifications, setNotifications] = useState<UpdateNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  useEffect(() => {
    fetchUpdateStatus();
    
    // تحديث كل 30 ثانية
    const interval = setInterval(fetchUpdateStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUpdateStatus = async () => {
    try {
      const response = await fetch('/api/legal-updates/status');
      const data = await response.json();
      
      if (data.status === 'success') {
        setStats(data.data.stats);
        setRecentUpdates(data.data.recentUpdates);
        setNotifications(data.data.unreadNotifications);
        setLastUpdateTime(new Date());
      }
    } catch (error) {
      console.error('خطأ في جلب حالة التحديثات:', error);
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
        await fetchUpdateStatus();
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
      
      await fetchUpdateStatus();
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

  if (isLoading && !stats) {
    return (
      <div style={{
        background: theme.card,
        padding: isMobile ? '0.75rem' : '1rem',
        borderRadius: '0.5rem',
        boxShadow: `0 1px 3px ${theme.shadow}`,
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '1rem', 
            height: '1rem', 
            border: `2px solid ${theme.primary}`,
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ color: theme.text, fontSize: '0.9rem' }}>
            جاري تحميل حالة التحديثات...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: theme.card,
      padding: isMobile ? '0.75rem' : '1rem',
      borderRadius: '0.5rem',
      boxShadow: `0 1px 3px ${theme.shadow}`,
      marginBottom: '1rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🔄</span>
          <h3 style={{ 
            margin: 0, 
            color: theme.text, 
            fontSize: isMobile ? '0.9rem' : '1rem' 
          }}>
            التحديثات القانونية
          </h3>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleManualUpdate}
            disabled={isLoading}
            style={{
              background: theme.primary,
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? '🔄' : '🔄 تحديث'}
          </button>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: 'transparent',
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: '0.25rem',
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            {showDetails ? '📖 إخفاء' : '📖 تفاصيل'}
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: '0.5rem',
          marginBottom: '0.75rem'
        }}>
          <div style={{
            background: '#f0f9ff',
            padding: '0.5rem',
            borderRadius: '0.25rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.2rem', color: '#0c4a6e' }}>
              {stats.totalUpdates}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#0c4a6e' }}>
              إجمالي التحديثات
            </div>
          </div>
          
          <div style={{
            background: '#fef2f2',
            padding: '0.5rem',
            borderRadius: '0.25rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.2rem', color: '#dc2626' }}>
              {stats.unreadNotifications}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#dc2626' }}>
              إشعارات غير مقروءة
            </div>
          </div>
          
          <div style={{
            background: '#f0fdf4',
            padding: '0.5rem',
            borderRadius: '0.25rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.2rem', color: '#166534' }}>
              {stats.activeSources}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#166534' }}>
              مصادر نشطة
            </div>
          </div>
          
          <div style={{
            background: '#fef3c7',
            padding: '0.5rem',
            borderRadius: '0.25rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.2rem', color: '#92400e' }}>
              {lastUpdateTime ? '🟢' : '🔴'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#92400e' }}>
              {lastUpdateTime ? 'متصل' : 'غير متصل'}
            </div>
          </div>
        </div>
      )}

      {/* Recent Updates */}
      {showDetails && recentUpdates.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <h4 style={{ 
            margin: '0 0 0.5rem 0', 
            color: theme.text, 
            fontSize: '0.9rem' 
          }}>
            آخر التحديثات:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentUpdates.slice(0, 3).map((update) => (
              <div key={update.id} style={{
                background: theme.background,
                padding: '0.5rem',
                borderRadius: '0.25rem',
                border: `1px solid ${theme.border}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.8rem' }}>
                    {getTypeIcon(update.type)}
                  </span>
                  <span style={{ fontSize: '0.8rem' }}>
                    {getImportanceIcon(update.importance)}
                  </span>
                  <span style={{ 
                    fontSize: '0.8rem', 
                    color: getImportanceColor(update.importance),
                    fontWeight: 'bold'
                  }}>
                    {update.title}
                  </span>
                </div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  color: theme.textSecondary,
                  lineHeight: 1.4
                }}>
                  {update.summary}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
      {showDetails && notifications.length > 0 && (
        <div>
          <h4 style={{ 
            margin: '0 0 0.5rem 0', 
            color: theme.text, 
            fontSize: '0.9rem' 
          }}>
            الإشعارات الجديدة:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {notifications.slice(0, 3).map((notification) => (
              <div key={notification.id} style={{
                background: notification.isRead ? theme.background : '#fef2f2',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                border: `1px solid ${notification.isRead ? theme.border : '#fecaca'}`,
                cursor: 'pointer'
              }}
              onClick={() => markNotificationAsRead(notification.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.8rem' }}>
                    {getImportanceIcon(notification.priority)}
                  </span>
                  <span style={{ 
                    fontSize: '0.8rem', 
                    color: getImportanceColor(notification.priority),
                    fontWeight: 'bold'
                  }}>
                    {notification.title}
                  </span>
                  {!notification.isRead && (
                    <span style={{ 
                      background: '#dc2626',
                      color: 'white',
                      fontSize: '0.6rem',
                      padding: '0.1rem 0.3rem',
                      borderRadius: '0.25rem'
                    }}>
                      جديد
                    </span>
                  )}
                </div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  color: theme.textSecondary,
                  lineHeight: 1.4
                }}>
                  {notification.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Update Time */}
      {lastUpdateTime && (
        <div style={{
          marginTop: '0.5rem',
          paddingTop: '0.5rem',
          borderTop: `1px solid ${theme.border}`,
          fontSize: '0.7rem',
          color: theme.textSecondary,
          textAlign: 'center'
        }}>
          آخر تحديث: {lastUpdateTime.toLocaleTimeString('ar-SA')}
        </div>
      )}
    </div>
  );
}
