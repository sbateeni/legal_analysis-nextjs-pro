import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getAllCases, getAllEvents } from '@utils/db';
import AddEventModal from '../components/AddEventModal';
import Link from 'next/link';

// تعريف أنواع البيانات
interface AnalysisStage {
  id: string;
  stageIndex: number;
  stage: string;
  input: string;
  output: string;
  date: string;
}

interface LegalCase {
  id: string;
  name: string;
  createdAt: string;
  stages: AnalysisStage[];
  tags?: string[];
  status?: 'active' | 'completed' | 'archived';
  priority?: 'low' | 'medium' | 'high';
  caseType?: string;
  clientName?: string;
  courtName?: string;
  nextHearing?: string;
  notes?: string;
}

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
}



export default function CalendarPage() {
  return <CalendarPageContent />;
}

function CalendarPageContent() {
  const { theme } = useTheme();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedDateString, setSelectedDateString] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allCases = await getAllCases();
      const formattedCases: LegalCase[] = allCases.map((c: any) => ({
        ...c,
        status: c.status || 'active',
        priority: c.priority || 'medium',
        caseType: c.caseType || 'غير محدد',
        clientName: c.clientName || '',
        courtName: c.courtName || '',
        nextHearing: c.nextHearing || '',
        notes: c.notes || '',
      }));

      // تحميل الأحداث من قاعدة البيانات
      const savedEvents = await getAllEvents();
      setEvents(savedEvents);

      // إنشاء أحداث من القضايا (إذا لم تكن موجودة)
      const caseEvents: CalendarEvent[] = [];
      formattedCases.forEach(caseItem => {
        if (caseItem.nextHearing) {
          const existingEvent = savedEvents.find(e => e.caseId === caseItem.id && e.type === 'hearing');
          if (!existingEvent) {
            caseEvents.push({
              id: `hearing-${caseItem.id}`,
              title: `جلسة: ${caseItem.name}`,
              date: caseItem.nextHearing,
              type: 'hearing',
              caseId: caseItem.id,
              caseName: caseItem.name,
              description: `جلسة قضائية - ${caseItem.caseType}`,
              priority: caseItem.priority || 'medium',
              createdAt: new Date().toISOString(),
            });
          }
        }
      });

      // إضافة الأحداث الجديدة إذا وجدت
      if (caseEvents.length > 0) {
        setEvents([...savedEvents, ...caseEvents]);
      }
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'hearing': return '#ef4444';
      case 'deadline': return '#f59e0b';
      case 'meeting': return '#3b82f6';
      case 'reminder': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'hearing': return '⚖️';
      case 'deadline': return '⏰';
      case 'meeting': return '👥';
      case 'reminder': return '🔔';
      default: return '📅';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'hearing': return 'جلسة';
      case 'deadline': return 'موعد نهائي';
      case 'meeting': return 'اجتماع';
      case 'reminder': return 'تذكير';
      default: return 'موعد';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };



  const getUpcomingEvents = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= nextWeek;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const handleAddEvent = () => {
    setSelectedDateString('');
    setShowAddEvent(true);
  };

  const handleEventAdded = () => {
    loadData(); // إعادة تحميل البيانات
  };

  if (loading) {
    return (
      <div style={{
        background: theme.background,
        minHeight: '100vh',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          background: theme.card,
          padding: '40px',
          borderRadius: '12px',
          boxShadow: `0 4px 20px ${theme.shadow}`,
          textAlign: 'center',
          color: theme.text
        }}>
          جاري تحميل التقويم...
        </div>
      </div>
    );
  }

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
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h1 style={{
              color: theme.text,
              margin: '0',
              fontSize: '28px',
              fontWeight: 'bold'
            }}>
              📅 التقويم القانوني
            </h1>
            <button
              onClick={handleAddEvent}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                background: theme.accent,
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ➕ إضافة موعد
            </button>
          </div>

          {/* View Mode Toggle */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px'
          }}>
            {[
              { key: 'month', label: 'شهري', icon: '📅' },
              { key: 'week', label: 'أسبوعي', icon: '📆' },
              { key: 'day', label: 'يومي', icon: '📋' }
            ].map((mode) => (
              <button
                key={mode.key}
                onClick={() => setViewMode(mode.key as any)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: viewMode === mode.key ? theme.accent : 'transparent',
                  color: viewMode === mode.key ? '#fff' : theme.text,
                  fontSize: '14px',
                  cursor: 'pointer',
                  border: `1px solid ${viewMode === mode.key ? theme.accent : theme.border}`
                }}
              >
                {mode.icon} {mode.label}
              </button>
            ))}
          </div>

          {/* Current Date Display */}
          <div style={{
            color: theme.text,
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {formatDate(currentDate)}
          </div>
        </div>

        {/* Upcoming Events */}
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
            🔔 المواعيد القادمة (الأسبوع القادم)
          </h2>
          
          {getUpcomingEvents().length > 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {getUpcomingEvents().map((event) => (
                <div key={event.id} style={{
                  background: theme.resultBg,
                  padding: '16px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    fontSize: '24px'
                  }}>
                    {getEventTypeIcon(event.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      color: theme.text,
                      margin: '0 0 4px 0',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>
                      {event.title}
                    </h3>
                    <p style={{
                      color: theme.text,
                      margin: '0',
                      fontSize: '14px',
                      opacity: 0.8
                    }}>
                      {new Date(event.date).toLocaleDateString('ar-SA')} - {getEventTypeLabel(event.type)}
                    </p>
                    {event.caseName && (
                      <p style={{
                        color: theme.text,
                        margin: '4px 0 0 0',
                        fontSize: '12px',
                        opacity: 0.7
                      }}>
                        القضية: {event.caseName}
                      </p>
                    )}
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#fff',
                      background: getEventTypeColor(event.type)
                    }}>
                      {getEventTypeLabel(event.type)}
                    </span>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#fff',
                      background: getPriorityColor(event.priority)
                    }}>
                      {event.priority === 'high' ? 'عالية' : 
                       event.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                    </span>
                    {event.caseId && (
                      <Link href={`/cases/${event.caseId}`}>
                        <button style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          background: theme.accent2,
                          color: '#fff',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}>
                          عرض القضية
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: theme.text,
              opacity: 0.7
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                📅
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
                لا توجد مواعيد قادمة
              </h3>
              <p style={{ margin: '0' }}>
                أضف مواعيد جديدة أو ربط مواعيد بالقضايا الموجودة
              </p>
            </div>
          )}
        </div>

        {/* Calendar View Placeholder */}
        <div style={{
          background: theme.card,
          padding: '24px',
          borderRadius: '12px',
          boxShadow: `0 4px 20px ${theme.shadow}`,
          border: `1px solid ${theme.border}`
        }}>
          <h2 style={{
            color: theme.text,
            margin: '0 0 20px 0',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            📅 عرض التقويم
          </h2>
          
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: theme.text,
            opacity: 0.7
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>
              📅
            </div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '20px' }}>
              عرض التقويم قيد التطوير
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '16px' }}>
              سيتم إضافة عرض التقويم الشهري والأسبوعي واليومي قريباً
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <span style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: theme.accent2,
                color: '#fff',
                fontSize: '14px'
              }}>
                📅 تقويم شهري
              </span>
              <span style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: theme.accent2,
                color: '#fff',
                fontSize: '14px'
              }}>
                📆 تقويم أسبوعي
              </span>
              <span style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: theme.accent2,
                color: '#fff',
                fontSize: '14px'
              }}>
                📋 تقويم يومي
              </span>
            </div>
          </div>
        </div>

        {/* Add Event Modal */}
        <AddEventModal
          isOpen={showAddEvent}
          onClose={() => setShowAddEvent(false)}
          onEventAdded={handleEventAdded}
          selectedDate={selectedDateString}
        />
      </div>
    </div>
  );
}
