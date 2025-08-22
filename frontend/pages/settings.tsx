import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { isMobile } from '../utils/crypto';
import { set as idbSet } from 'idb-keyval';
import { saveApiKey, loadApiKey, getAllCases, saveAllCases, clearAllCases } from '../utils/db';

export default function Settings() {
  const { theme, darkMode, setDarkMode } = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    loadApiKey().then(val => setApiKey(val || '')); 
  }, []);

  const handleSaveKey = async () => {
    setSaving(true);
    try {
      await saveApiKey(apiKey.trim());
      // توافق مع إصدارات سابقة: حفظ نسخة في localStorage إن لزم
      try { localStorage.setItem('gemini_api_key', apiKey.trim()); } catch {}
      setStatus('تم حفظ مفتاح API بنجاح.');
      setTimeout(() => setStatus(null), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    const cases = await getAllCases();
    const blob = new Blob([JSON.stringify(cases, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'legal_cases.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function(ev) {
      if (typeof ev.target?.result === 'string') {
        try {
          const imported = JSON.parse(ev.target.result);
          if (Array.isArray(imported)) {
            await saveAllCases(imported);
            setStatus('تم استيراد القضايا بنجاح.');
            setTimeout(() => setStatus(null), 2000);
          } else {
            alert('صيغة الملف غير صحيحة!');
          }
        } catch {
          alert('فشل في قراءة الملف!');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = async () => {
    if (!confirm('هل أنت متأكد من مسح جميع القضايا وإعادة تعيين الإعدادات؟')) return;
    await clearAllCases();
    await idbSet('legal_dark_mode', '0');
    setDarkMode(false);
    setApiKey('');
    await saveApiKey('');
    try { localStorage.removeItem('gemini_api_key'); } catch {}
    setStatus('تم مسح البيانات وإعادة الضبط.');
    setTimeout(() => setStatus(null), 2000);
  };

  return (
    <div style={{ fontFamily: 'Tajawal, Arial, sans-serif', direction: 'rtl', minHeight: '100vh', background: theme.background, color: theme.text }}>
      <main style={{ maxWidth: 900, margin: '0 auto', padding: isMobile() ? '1rem 0.5rem' : '2rem 1rem' }}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:16}}>
          <span style={{fontSize: isMobile()? 28:32}}>⚙️</span>
          <h1 style={{margin:0, color: theme.accent}}>الإعدادات</h1>
        </div>

        {/* بطاقة مفتاح API */}
        <div style={{ background: theme.card, borderRadius: 16, boxShadow: `0 2px 12px ${theme.shadow}`, border: `1.5px solid ${theme.border}`, padding: isMobile()? 16:24, marginBottom: 16 }}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
            <span style={{fontSize: isMobile()? 22:24}}>🔑</span>
            <h2 style={{margin:0, color: theme.accent2, fontSize: isMobile()? 18:20}}>مفتاح Gemini API</h2>
          </div>
          <input
            type="password"
            placeholder="أدخل مفتاح Gemini API"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ width: '100%', padding: isMobile()? 12:14, border: `1.5px solid ${theme.input}`, borderRadius: 12, fontSize: isMobile()? 15:16, outline: 'none' }}
          />
          <div style={{display:'flex', gap:10, marginTop:10, flexWrap:'wrap'}}>
            <button onClick={handleSaveKey} disabled={saving} style={{background: theme.accent2, color:'#fff', border:'none', borderRadius: 10, padding:'10px 18px', fontWeight:800, cursor: saving? 'not-allowed':'pointer'}}>حفظ المفتاح</button>
            <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{background:'#fff', color: theme.accent, border:`1px solid ${theme.accent2}`, borderRadius: 10, padding:'10px 18px', fontWeight:800, textDecoration:'none'}}>الحصول على المفتاح</a>
          </div>
        </div>

        {/* بطاقة المظهر والخصوصية */}
        <div style={{ background: theme.card, borderRadius: 16, boxShadow: `0 2px 12px ${theme.shadow}`, border: `1.5px solid ${theme.border}`, padding: isMobile()? 16:24, marginBottom: 16 }}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
            <span style={{fontSize: isMobile()? 22:24}}>{darkMode ? '🌙' : '☀️'}</span>
            <h2 style={{margin:0, color: theme.accent2, fontSize: isMobile()? 18:20}}>المظهر والخصوصية</h2>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} style={{background: 'none', border:`1px solid ${theme.accent2}`, color: theme.accent2, borderRadius: 10, padding:'10px 18px', fontWeight:800, cursor:'pointer'}}>
            تبديل الوضع ({darkMode ? 'ليلي' : 'فاتح'})
          </button>
          <p style={{marginTop:12, fontSize:14, lineHeight:1.8, background: '#f5f7ff', color:'#222', borderRadius: 10, padding: '10px 12px', border:`1px solid ${theme.border}`}}>
            🔒 جميع بياناتك (القضايا والمفاتيح) تحفظ محليًا على جهازك فقط ولا يتم رفعها إلى أي خادم.
          </p>
        </div>

        {/* بطاقة القضايا: تصدير/استيراد ومسح */}
        <div style={{ background: theme.card, borderRadius: 16, boxShadow: `0 2px 12px ${theme.shadow}`, border: `1.5px solid ${theme.border}`, padding: isMobile()? 16:24 }}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
            <span style={{fontSize: isMobile()? 22:24}}>📦</span>
            <h2 style={{margin:0, color: theme.accent2, fontSize: isMobile()? 18:20}}>القضايا</h2>
          </div>
          <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
            <button onClick={handleExport} style={{background: theme.accent, color:'#fff', border:'none', borderRadius: 10, padding:'10px 18px', fontWeight:800, cursor:'pointer'}}>⬇️ تصدير القضايا</button>
            <label style={{background: theme.accent2, color:'#fff', borderRadius: 10, padding:'10px 18px', fontWeight:800, cursor:'pointer'}}>
              ⬆️ استيراد قضايا
              <input type="file" accept="application/json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
            <button onClick={handleClearAll} style={{background:'#ff6b6b', color:'#fff', border:'none', borderRadius: 10, padding:'10px 18px', fontWeight:800, cursor:'pointer'}}>🗑️ مسح كل البيانات</button>
          </div>
        </div>

        {status && (
          <div style={{marginTop:12, textAlign:'center', color: theme.accent2, fontWeight:800}}>{status}</div>
        )}
      </main>
    </div>
  );
} 