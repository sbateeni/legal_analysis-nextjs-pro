import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { isMobile } from '@utils/crypto';
import { calculateInheritance, InheritanceInputs, InheritanceResult } from '@utils/inheritance';

export default function InheritancePage() {
  return <InheritancePageContent />;
}

function InheritancePageContent() {
  const { theme } = useTheme();
  const [inputs, setInputs] = useState<InheritanceInputs>({
    estateAmount: 0,
    husband: false,
    wives: 0,
    father: false,
    mother: false,
    sons: 0,
    daughters: 0,
  });
  const [result, setResult] = useState<InheritanceResult | null>(null);
  const [error, setError] = useState('');
  const [details, setDetails] = useState('');
  const [parsing, setParsing] = useState(false);

  const onCalculate = () => {
    setError('');
    try {
      if (inputs.husband && inputs.wives > 0) {
        setError('لا يجتمع الزوج والزوجات. رجاءً اختر أحدهما.');
        setResult(null);
        return;
      }
      const res = calculateInheritance(inputs);
      setResult(res);
    } catch (e) {
      setError('حدث خطأ أثناء الحساب');
      setResult(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.background, color: theme.text }}>
      <header style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)',
        color: 'white',
        padding: isMobile() ? '1rem' : '2rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: isMobile() ? '1.5rem' : '2rem' }}>⚖️ حاسبة المواريث الفلسطينية (مبسطة)</h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.95 }}>أدخل بيانات التركة والورثة لحساب الحصص وفق قواعد مبسطة</p>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile() ? '1rem' : '2rem' }}>
        {/* Banner مختصر يُظهر ملخصاً فور الحساب */}
        {result && (
          <div style={{
            marginBottom: '1rem',
            padding: isMobile() ? '0.75rem' : '1rem',
            borderRadius: 12,
            border: '1px solid #a7f3d0',
            background: 'linear-gradient(90deg, #ecfeff 0%, #f0fdf4 100%)',
            color: '#065f46'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 800 }}>📊 ملخص سريع</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ padding: '6px 10px', borderRadius: 8, background: '#d1fae5', color: '#065f46', fontWeight: 700 }}>
                  التركة: {inputs.estateAmount.toLocaleString('ar-EG')} ₪
                </span>
                <span style={{ padding: '6px 10px', borderRadius: 8, background: '#e0e7ff', color: '#1e3a8a', fontWeight: 700 }}>
                  عناصر: {result.allocations.length}
                </span>
                <span style={{ padding: '6px 10px', borderRadius: 8, background: '#fee2e2', color: '#991b1b', fontWeight: 700 }}>
                  الباقي: {result.remainder.toLocaleString('ar-EG')} ₪
                </span>
              </div>
            </div>
          </div>
        )}
        <div style={{
          background: theme.card,
          padding: isMobile() ? '1rem' : '1.5rem',
          borderRadius: '0.75rem',
          boxShadow: `0 1px 3px ${theme.shadow}`,
          marginBottom: '1.5rem',
        }}>
          <h2 style={{ margin: '0 0 1rem 0' }}>🧮 البيانات</h2>

          {/* مربع تفاصيل لتحليلها وملء الحقول تلقائياً */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: 6 }}>تفاصيل الحالة (اختياري):</label>
            <textarea value={details} onChange={(e) => setDetails(e.target.value)}
              placeholder="مثال: توفي وترك تركة قدرها 100000 شيكل، وزوجة واحدة، وأماً وأباً، وابنين وبنتين..."
              style={{ width: '100%', minHeight: 90, padding: 10, border: `1px solid ${theme.border}`, borderRadius: 8 }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="button" onClick={async () => {
                try {
                  setParsing(true);
                  const res = await fetch('/api/inheritance/parse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ details }) });
                  const data = await res.json();
                  const inp = data.inputs || {};
                  setInputs(prev => ({
                    estateAmount: typeof inp.estateAmount === 'number' ? inp.estateAmount : prev.estateAmount,
                    husband: typeof inp.husband === 'boolean' ? inp.husband : prev.husband,
                    wives: typeof inp.wives === 'number' ? inp.wives : prev.wives,
                    father: typeof inp.father === 'boolean' ? inp.father : prev.father,
                    mother: typeof inp.mother === 'boolean' ? inp.mother : prev.mother,
                    sons: typeof inp.sons === 'number' ? inp.sons : prev.sons,
                    daughters: typeof inp.daughters === 'number' ? inp.daughters : prev.daughters,
                  }));
                } finally {
                  setParsing(false);
                }
              }}
                style={{ padding: '8px 12px', border: 'none', borderRadius: 8, background: '#0ea5e9', color: 'white', fontWeight: 800, cursor: 'pointer' }}>
                {parsing ? '⏳ جاري التحليل...' : '✨ تحليل تلقائي وملء الحقول'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile() ? '1fr' : 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6 }}>قيمة التركة (بالشيكل):</label>
              <input type="text" value={String(inputs.estateAmount)}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.,]/g, '');
                  setInputs(prev => ({ ...prev, estateAmount: parseFloat(v.replace(',', '.')) || 0 }));
                }}
                style={{ width: '100%', padding: 10, border: `1px solid ${theme.border}`, borderRadius: 8 }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={inputs.husband}
                  onChange={(e) => setInputs(prev => ({ ...prev, husband: e.target.checked, wives: e.target.checked ? 0 : prev.wives }))} />
                الزوج
              </label>
              <div>
                <label>عدد الزوجات:</label>
                <input type="text" value={String(inputs.wives)}
                  onChange={(e) => {
                    const n = parseInt((e.target.value || '').replace(/[^0-9]/g, '')) || 0;
                    setInputs(prev => ({ ...prev, wives: Math.max(0, n), husband: prev.husband && n > 0 ? false : prev.husband }));
                  }}
                  style={{ width: '100%', padding: 10, border: `1px solid ${theme.border}`, borderRadius: 8 }} />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={inputs.father}
                onChange={(e) => setInputs(prev => ({ ...prev, father: e.target.checked }))} />
              الأب
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={inputs.mother}
                onChange={(e) => setInputs(prev => ({ ...prev, mother: e.target.checked }))} />
              الأم
            </label>

            <div>
              <label>عدد الأبناء (ذكور):</label>
              <input type="text" value={String(inputs.sons)}
                onChange={(e) => {
                  const n = parseInt((e.target.value || '').replace(/[^0-9]/g, '')) || 0;
                  setInputs(prev => ({ ...prev, sons: Math.max(0, n) }));
                }}
                style={{ width: '100%', padding: 10, border: `1px solid ${theme.border}`, borderRadius: 8 }} />
            </div>

            <div>
              <label>عدد البنات:</label>
              <input type="text" value={String(inputs.daughters)}
                onChange={(e) => {
                  const n = parseInt((e.target.value || '').replace(/[^0-9]/g, '')) || 0;
                  setInputs(prev => ({ ...prev, daughters: Math.max(0, n) }));
                }}
                style={{ width: '100%', padding: 10, border: `1px solid ${theme.border}`, borderRadius: 8 }} />
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 10, color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: 10, borderRadius: 8 }}>
              {error}
            </div>
          )}

          <button onClick={onCalculate}
            style={{
              marginTop: 12,
              width: '100%',
              padding: 12,
              border: 'none',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)',
              color: 'white',
              fontWeight: 800,
              cursor: 'pointer'
            }}>
            🧮 احسب التوزيع
          </button>
        </div>

        {result && (
          <div style={{
            background: theme.card,
            padding: isMobile() ? '1rem' : '1.5rem',
            borderRadius: '0.75rem',
            boxShadow: `0 1px 3px ${theme.shadow}`,
          }}>
            <h3 style={{ margin: 0 }}>📊 النتائج</h3>
            <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
              {result.allocations.map((a, idx) => (
                <div key={idx} style={{ background: '#f8fafc', border: `1px solid ${theme.border}`, padding: 12, borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b>{a.heir}</b>
                    <span style={{ fontWeight: 800, color: theme.accent2 }}>{a.amount.toLocaleString('ar-EG')} ₪</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {a.fraction ? `النصيب: ${a.fraction}` : null}
                    {a.details ? ` — ${a.details}` : null}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: '#fff7ed', border: '1px solid #fed7aa' }}>
              <b>الباقي:</b> {result.remainder.toLocaleString('ar-EG')} ₪
            </div>

            <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: '#ecfeff', border: '1px solid #a5f3fc' }}>
              <b>تنبيهات:</b>
              <ul style={{ margin: 0, paddingInlineStart: 18 }}>
                {result.notes.map((n, i) => (
                  <li key={i} style={{ marginTop: 6 }}>{n}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>
              هذه الحاسبة مبسطة لأغراض الإرشاد الأولي فقط، ولا تغني عن الفتوى القضائية/الشرعية. قد توجد ورثة آخرون أو حالات خاصة تؤثر على التوزيع.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


