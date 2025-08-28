import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Image from 'next/image';

type Props = {
  apiKey: string;
  model?: string;
};

export default function LegalNews({ apiKey, model = 'gemini-1.5-flash' }: Props) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [imgSrc] = useState<string>('/DeWatermark.ai_1756309976798.jpeg');

  const fetchNews = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/legal-news?model=${encodeURIComponent(model)}${force ? '&force=1' : ''}`;
      const res = await fetch(url, { headers: { 'x-api-key': apiKey, 'x-model': model } });
      if (res.status === 204) {
        // لا يوجد كاش بعد ولم يُجبر التحديث — لا تغييرات
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch legal news');
      setContent(data.content || '');
      setUpdatedAt(Number(data.updatedAt) || Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [apiKey, model]);

  useEffect(() => {
    if (!apiKey) return;
    // عند التحميل: حاول التوليد مباشرة إذا لم يوجد كاش
    fetchNews(true);
  }, [fetchNews, apiKey]);

  if (!apiKey) return null;

  return (
    <section className="fade-in-up" style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 12 }}>
        <Image
          src={imgSrc}
          alt="أخبار قانونية"
          width={800}
          height={400}
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: 12,
            boxShadow: `0 4px 20px ${theme.shadow}`,
            border: `1px solid ${theme.border}`,
            display: 'block'
          }}
          onError={undefined}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 className="headline-lg" style={{ margin: 0 }}>أخبار قانونية فلسطينية خلال 24 ساعة</h2>
        <button
          onClick={() => fetchNews(true)}
          style={{
            background: theme.accent,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 12px',
            cursor: 'pointer',
            fontWeight: 700
          }}
          title="تحديث الآن"
        >
          تحديث
        </button>
      </div>
      <div style={{ fontSize: 14, color: theme.text, opacity: 0.8, marginBottom: 8 }}>
        {updatedAt ? new Date(updatedAt).toLocaleString() : ''}
      </div>
      <div style={{
        background: theme.resultBg,
        border: `1px solid ${theme.border}`,
        borderRadius: 12,
        padding: 16,
        color: theme.text,
        whiteSpace: 'pre-line',
        lineHeight: 1.7
      }}>
        {loading ? '⏳ جاري الجلب...' : error ? `❌ ${error}` : (content || 'لا توجد تحديثات قانونية خلال 24 ساعة الماضية.')}
      </div>
    </section>
  );
}


