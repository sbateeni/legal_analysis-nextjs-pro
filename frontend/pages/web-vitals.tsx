import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

type Summary = Record<string, { count: number; p95: number; avg: number }>;

export default function WebVitalsPage() {
  const { theme } = useTheme();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [count, setCount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'فشل جلب الملخص');
      setSummary(data.summary || {});
      setCount(data.vitalsCount || 0);
      setError('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'خطأ غير معروف');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.background,
      color: theme.text,
      fontFamily: 'Tajawal, Arial, sans-serif'
    }}>
      <header style={{
        background: theme.accent,
        color: '#fff',
        padding: '1rem',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0 }}>Web Vitals</h1>
        <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9 }}>ملخص فوري للقياسات</p>
      </header>
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button onClick={fetchSummary} className="btn btn-info" style={{ background: theme.accent2 }}>تحديث</button>
          <div style={{ opacity: 0.8 }}>العينات: {count}</div>
        </div>

        {loading && <div>⏳ جارٍ التحميل...</div>}
        {error && (
          <div style={{ padding: 12, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 8 }}>❌ {error}</div>
        )}

        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {Object.entries(summary).map(([name, s]) => (
              <div key={name} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 800, color: theme.accent, marginBottom: 6 }}>{name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span>العدد</span>
                  <span>{s.count}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span>المتوسط</span>
                  <span>{Math.round(s.avg * 100) / 100}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span>P95</span>
                  <span>{Math.round(s.p95 * 100) / 100}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


