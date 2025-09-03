import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getAllEvents, getCalendarSettings } from '@utils/db';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'hearing' | 'deadline' | 'meeting' | 'reminder';
  caseId?: string;
  caseName?: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  completed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface CalendarSettings {
  defaultView: 'month' | 'week' | 'day';
  showWeekends: boolean;
  workingHours: {
    start: string;
    end: string;
  };
  notifications: {
    enabled: boolean;
    beforeMinutes: number[];
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  eventId?: string;
  timestamp: number;
  read: boolean;
}

export default function NotificationSystem() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<CalendarSettings | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadSettings();
    checkForUpcomingEvents();
    
    // فحص المواعيد كل دقيقة
    const interval = setInterval(checkForUpcomingEvents, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadSettings = async () => {
    try {
      const calendarSettings = await getCalendarSettings();
      setSettings(calendarSettings);
    } catch (error) {
      console.error('Error loading calendar settings:', error);
    }
  };

  const checkForUpcomingEvents = async () => {
    if (!settings?.notifications.enabled) return;

    try {
      const events = await getAllEvents();
      const now = new Date();
      const newNotifications: Notification[] = [];

      events.forEach(event => {
        if (event.completed) return;

        const eventDate = new Date(event.date);
        const timeUntilEvent = eventDate.getTime() - now.getTime();

        // فحص كل فترة تنبيه
        settings.notifications.beforeMinutes.forEach(minutes => {
          const notificationTime = minutes * 60 * 1000; // تحويل إلى مللي ثانية
          const timeDiff = Math.abs(timeUntilEvent - notificationTime);
          
          // إذا كان الوقت مناسب للتنبيه (مع هامش خطأ 30 ثانية)
          if (timeDiff <= 30000 && timeUntilEvent > 0) {
            const existingNotification = notifications.find(n => 
              n.eventId === event.id && 
              Math.abs(n.timestamp - now.getTime()) < 60000 // في آخر دقيقة
            );

            if (!existingNotification) {
              newNotifications.push({
                id: `notification-${event.id}-${minutes}`,
                title: getNotificationTitle(event, minutes),
                message: getNotificationMessage(event, minutes),
                type: getNotificationType(event, minutes),
                eventId: event.id,
                timestamp: now.getTime(),
                read: false
              });
            }
          }
        });
      });

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
        showBrowserNotification(newNotifications[0]);
      }
    } catch (error) {
      console.error('Error checking for upcoming events:', error);
    }
  };

  const getNotificationTitle = (event: CalendarEvent, minutes: number): string => {
    const timeText = minutes >= 60 ? 
      `${Math.floor(minutes / 60)} ساعة` : 
      `${minutes} دقيقة`;

    switch (event.type) {
      case 'hearing':
        return `⚖️ جلسة قضائية خلال ${timeText}`;
      case 'deadline':
        return `⏰ موعد نهائي خلال ${timeText}`;
      case 'meeting':
        return `👥 اجتماع خلال ${timeText}`;
      case 'reminder':
        return `🔔 تذكير خلال ${timeText}`;
      default:
        return `📅 موعد خلال ${timeText}`;
    }
  };

  const getNotificationMessage = (event: CalendarEvent, minutes: number): string => {
    let message = event.title;
    if (event.caseName) {
      message += ` - ${event.caseName}`;
    }
    if (event.time) {
      message += ` في الساعة ${event.time}`;
    }
    return message;
  };

  const getNotificationType = (event: CalendarEvent, minutes: number): 'info' | 'warning' | 'error' | 'success' => {
    if (minutes <= 15) return 'error';
    if (minutes <= 30) return 'warning';
    return 'info';
  };

  const showBrowserNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.svg',
        tag: notification.id
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted');
      }
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'success': return '#10b981';
      default: return '#3b82f6';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Notification Bell */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          style={{
            background: 'transparent',
            border: 'none',
            color: theme.text,
            fontSize: '20px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            position: 'relative'
          }}
        >
          🔔
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              background: '#ef4444',
              color: '#fff',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            boxShadow: `0 4px 20px ${theme.shadow}`,
            width: '350px',
            maxHeight: '400px',
            overflow: 'auto',
            zIndex: 1000,
            marginTop: '8px'
          }}>
            {/* Header */}
            <div style={{
              padding: '16px',
              borderBottom: `1px solid ${theme.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                color: theme.text,
                margin: '0',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                🔔 التنبيهات
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: theme.accent,
                      fontSize: '12px',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    تعيين الكل كمقروء
                  </button>
                )}
                <button
                  onClick={requestNotificationPermission}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: theme.accent,
                    fontSize: '12px',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}
                >
                  تفعيل التنبيهات
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div>
              {notifications.length === 0 ? (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: theme.text,
                  opacity: 0.7
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔔</div>
                  <p style={{ margin: '0', fontSize: '14px' }}>
                    لا توجد تنبيهات
                  </p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: `1px solid ${theme.border}`,
                      background: notification.read ? 'transparent' : theme.resultBg,
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                    onClick={() => markAsRead(notification.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme.resultBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = notification.read ? 'transparent' : theme.resultBg;
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '4px'
                        }}>
                          <span style={{ fontSize: '16px' }}>
                            {getNotificationIcon(notification.type)}
                          </span>
                          <h4 style={{
                            color: theme.text,
                            margin: '0',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: getNotificationColor(notification.type)
                            }} />
                          )}
                        </div>
                        <p style={{
                          color: theme.text,
                          margin: '0',
                          fontSize: '12px',
                          opacity: 0.8,
                          lineHeight: '1.4'
                        }}>
                          {notification.message}
                        </p>
                        <p style={{
                          color: theme.text,
                          margin: '4px 0 0 0',
                          fontSize: '11px',
                          opacity: 0.6
                        }}>
                          {new Date(notification.timestamp).toLocaleString('ar-SA')}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: theme.text,
                          fontSize: '16px',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          opacity: 0.5
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {showNotifications && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowNotifications(false)}
        />
      )}
    </>
  );
}
