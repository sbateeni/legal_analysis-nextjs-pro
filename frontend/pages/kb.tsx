import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';
import { isMobile } from '@utils/crypto';

type KBRecord = {
  id: string;
  topic: string;
  jurisdiction: string;
  strategy_title: string;
  strategy_steps: string[];
  legal_basis: Array<{ source: string; article?: string; note?: string }>;
  tags: string[];
  reviewed: boolean;
  createdAt: string;
};

export default function KBPage() {
  const { theme, darkMode } = useTheme();
  const [q, setQ] = useState('');
  const [items, setItems] = useState<KBRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async (query: string) => {
    setLoading(true);
    setError('');
    try {
      const url = `/api/legal-kb${query ? `?q=${encodeURIComponent(query)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل تحميل قاعدة المعرفة');
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { search(''); }, []);

  return (
    <div style={{ minHeight: '100vh', background: theme.background, color: theme.text, fontFamily: 'Tajawal, Arial, sans-serif' }}>
      <main style={{ maxWidth: 900, margin: '0 auto', padding: isMobile() ? '1rem 0.5rem' : '2rem 1rem' }}>
        <div className="card-ui" style={{ background: theme.card, borderColor: theme.border, padding: isMobile() ? 16 : 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, color: theme.accent }}>📚 قاعدة المعرفة القانونية المشتركة</h1>
            <Link href="/chat" style={{ textDecoration: 'none', background: theme.accent, color: '#fff', padding: '8px 12px', borderRadius: 8 }}>العودة إلى المحادثة</Link>
          </div>
          <p style={{ marginTop: 8, opacity: 0.8 }}>استراتيجيات مجردة ومواد قانونية فلسطينية بدون أي بيانات شخصية.</p>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="ابحث بالموضوع، الوسوم أو المصدر القانوني"
              style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${theme.border}`, background: darkMode ? '#181a2a' : '#fff', color: theme.text }}
            />
            <button onClick={() => search(q)} style={{ padding: '12px 16px', borderRadius: 10, border: 'none', background: theme.accent2, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>بحث</button>
          </div>

          {loading && (<div style={{ marginTop: 16 }}>⏳ جاري التحميل...</div>)}
          {error && (<div style={{ marginTop: 16, color: '#dc2626' }}>❌ {error}</div>)}

          <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
            {items.map(item => (
              <div key={item.id} className="card-ui" style={{ background: theme.resultBg, borderColor: theme.border, padding: 16, color: theme.text }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ color: theme.accent, fontWeight: 800 }}>{item.strategy_title}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>{new Date(item.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ marginTop: 8, fontSize: 14, opacity: 0.9 }}>الموضوع: {item.topic}</div>
                {item.legal_basis?.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 14 }}>
                    <span style={{ fontWeight: 700 }}>الأساس القانوني:</span> {item.legal_basis.map(b => `${b.source}${b.article ? ` ${b.article}` : ''}`).join(' ؛ ')}
                  </div>
                )}
                {item.strategy_steps?.length > 0 && (
                  <ol style={{ marginTop: 8, paddingRight: 18 }}>
                    {item.strategy_steps.map((s, i) => (<li key={i} style={{ marginBottom: 4 }}>{s}</li>))}
                  </ol>
                )}
                {item.tags?.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {item.tags.map((t, i) => (
                      <span key={i} style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 6, padding: '2px 8px', fontSize: 12 }}>#{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {items.length === 0 && !loading && (
              <div style={{ opacity: 0.8, marginTop: 8 }}>لا توجد نتائج.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


