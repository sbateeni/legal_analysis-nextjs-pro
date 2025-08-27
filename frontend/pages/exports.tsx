import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ExportLogItem {
  type: 'pdf' | 'docx';
  caseName: string;
  partyRole?: string;
  date: string;
  filename: string;
}

export default function ExportsPage() {
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
      <header style={{ background: theme.accent2, color: '#fff', padding: '1rem', textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>سجل التصدير</h1>
        <p className="muted" style={{ margin: '0.25rem 0 0 0' }}>آخر ملفات PDF/Docx التي قمت بتصديرها</p>
      </header>
      <main className="container p-1">
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button onClick={load} className="btn btn-info" style={{ background: theme.accent }}>تحديث</button>
          <button onClick={clear} className="btn btn-danger">مسح السجل</button>
        </div>

        {logs.length === 0 ? (
          <div className="card-panel text-center" style={{ padding: 16, background: theme.card, borderColor: theme.border }}>
            لا توجد عناصر في السجل بعد.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            {logs.map((item, idx) => (
              <div key={idx} className="card-panel" style={{ background: theme.card, borderColor: theme.border, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, color: theme.accent }}>{item.caseName || 'قضية'}</span>
                  <span style={{ opacity: 0.8 }}>{item.type.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>الصفة: {item.partyRole || '-'}</div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>التاريخ: {new Date(item.date).toLocaleString('ar-EG')}</div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6, direction: 'ltr' }}>{item.filename}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


