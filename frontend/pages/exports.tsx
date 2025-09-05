import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { isMobile } from '@utils/crypto';
// تم حذف AuthGuard لجعل الموقع عاماً

interface ExportLogItem {
  type: 'pdf' | 'docx';
  caseName: string;
  partyRole?: string;
  date: string;
  filename: string;
  fileSize?: number;
  status?: 'success' | 'failed' | 'pending';
}

export default function ExportsPage() {
  return <ExportsPageContent />;
}

function ExportsPageContent() {
  const { theme } = useTheme();
  const [logs, setLogs] = useState<ExportLogItem[]>([]);

  const load = () => {
    try {
      const raw = localStorage.getItem('export_logs') || '[]';
      const parsed = JSON.parse(raw) as ExportLogItem[];
      setLogs(parsed.reverse());
    } catch {
      setLogs([]);
    }
  };

  // إحصائيات التصدير
  const exportStats = useMemo(() => {
    const total = logs.length;
    const pdfCount = logs.filter(l => l.type === 'pdf').length;
    const docxCount = logs.filter(l => l.type === 'docx').length;
    const today = new Date().toDateString();
    const todayCount = logs.filter(l => new Date(l.date).toDateString() === today).length;
    return { total, pdfCount, docxCount, todayCount };
  }, [logs]);

  useEffect(() => {
    load();
  }, []);

  const clear = () => {
    try {
      localStorage.removeItem('export_logs');
      load();
    } catch {}
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.background, color: theme.text, fontFamily: 'Tajawal, Arial, sans-serif' }}>
      {/* Header محسن */}
      <header style={{ 
        background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accent2} 100%)`, 
        color: '#fff', 
        padding: isMobile() ? '1.5rem 1rem' : '2rem 1rem', 
        textAlign: 'center',
        boxShadow: `0 4px 20px ${theme.shadow}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 32 }}>📤</span>
          <h1 style={{ margin: 0, fontSize: isMobile() ? '1.8rem' : '2.2rem' }}>مركز التصدير</h1>
        </div>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '1.1rem' }}>إدارة وتتبع جميع ملفات التصدير</p>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile() ? '1rem' : '2rem' }}>
        {/* إرشادات الصفحة */}
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#064e3b',
          borderRadius: 12,
          padding: 12,
          marginBottom: 16
        }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>ℹ️ كيفية استخدام مركز التصدير</div>
          <ul style={{ margin: 0, paddingInlineStart: 18 }}>
            <li>اضغط "تحديث" لجلب أحدث عمليات التصدير المخزّنة محلياً.</li>
            <li>استخدم "مسح السجل" لإعادة تعيين القائمة.</li>
            <li>اعثر على اسم القضية، نوع الملف، التاريخ، واسم الملف لسهولة التتبع.</li>
          </ul>
        </div>
        {/* إحصائيات سريعة */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile() ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
          gap: 16, 
          marginBottom: 24 
        }}>
          <div style={{ 
            background: theme.card, 
            padding: 20, 
            borderRadius: 12, 
            textAlign: 'center',
            boxShadow: `0 2px 8px ${theme.shadow}`,
            border: `1px solid ${theme.border}`
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: theme.accent }}>{exportStats.total}</div>
            <div style={{ fontSize: 14, color: theme.text, opacity: 0.8 }}>إجمالي الملفات</div>
          </div>
          <div style={{ 
            background: theme.card, 
            padding: 20, 
            borderRadius: 12, 
            textAlign: 'center',
            boxShadow: `0 2px 8px ${theme.shadow}`,
            border: `1px solid ${theme.border}`
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>{exportStats.pdfCount}</div>
            <div style={{ fontSize: 14, color: theme.text, opacity: 0.8 }}>ملفات PDF</div>
          </div>
          <div style={{ 
            background: theme.card, 
            padding: 20, 
            borderRadius: 12, 
            textAlign: 'center',
            boxShadow: `0 2px 8px ${theme.shadow}`,
            border: `1px solid ${theme.border}`
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#3b82f6' }}>{exportStats.docxCount}</div>
            <div style={{ fontSize: 14, color: theme.text, opacity: 0.8 }}>ملفات Word</div>
          </div>
          <div style={{ 
            background: theme.card, 
            padding: 20, 
            borderRadius: 12, 
            textAlign: 'center',
            boxShadow: `0 2px 8px ${theme.shadow}`,
            border: `1px solid ${theme.border}`
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: theme.accent2 }}>{exportStats.todayCount}</div>
            <div style={{ fontSize: 14, color: theme.text, opacity: 0.8 }}>اليوم</div>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div style={{ 
          display: 'flex', 
          gap: 12, 
          marginBottom: 24, 
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button 
            onClick={load} 
            style={{ 
              background: theme.accent, 
              color: '#fff', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: 8, 
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            🔄 تحديث
          </button>
          <button 
            onClick={clear} 
            style={{ 
              background: '#ef4444', 
              color: '#fff', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: 8, 
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            🗑️ مسح السجل
          </button>
        </div>

        {logs.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 48, 
            background: theme.card, 
            borderRadius: 12,
            border: `1px solid ${theme.border}`,
            boxShadow: `0 2px 8px ${theme.shadow}`
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📤</div>
            <h3 style={{ color: theme.accent, marginBottom: 8 }}>لا توجد ملفات مصدرة بعد</h3>
            <p style={{ color: theme.text, opacity: 0.7 }}>ستظهر هنا جميع الملفات التي تقوم بتصديرها من القضايا</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile() ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: 16 
          }}>
            {logs.map((item, idx) => (
              <div key={idx} style={{ 
                background: theme.card, 
                borderRadius: 12, 
                padding: 20, 
                boxShadow: `0 2px 8px ${theme.shadow}`,
                border: `1px solid ${theme.border}`,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontWeight: 800, color: theme.accent, fontSize: 16 }}>{item.caseName || 'قضية'}</span>
                  <span style={{ 
                    background: item.type === 'pdf' ? '#ef4444' : '#3b82f6', 
                    color: '#fff', 
                    padding: '4px 8px', 
                    borderRadius: 6, 
                    fontSize: 12, 
                    fontWeight: 600 
                  }}>
                    {item.type.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: theme.text, opacity: 0.8, marginBottom: 8 }}>
                  <strong>الصفة:</strong> {item.partyRole || 'غير محدد'}
                </div>
                <div style={{ fontSize: 13, color: theme.text, opacity: 0.7, marginBottom: 8 }}>
                  <strong>التاريخ:</strong> {new Date(item.date).toLocaleString('ar-EG')}
                </div>
                <div style={{ 
                  fontSize: 12, 
                  color: theme.text, 
                  opacity: 0.6, 
                  direction: 'ltr', 
                  background: theme.background,
                  padding: 8,
                  borderRadius: 6,
                  fontFamily: 'monospace',
                  wordBreak: 'break-all'
                }}>
                  {item.filename}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


