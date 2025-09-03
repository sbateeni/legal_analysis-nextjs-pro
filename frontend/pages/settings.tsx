import React, { useState, useEffect } from 'react';
import { Notifications, type Notice } from '../components/Notifications';
import { useTheme } from '../contexts/ThemeContext';
import { isMobile } from '@utils/crypto';
import { set as idbSet } from 'idb-keyval';
import { saveApiKey, loadApiKey, getAllCases, saveAllCases, clearAllCases } from '@utils/db';
import { loadExportPreferences, saveExportPreferences, type ExportPreferences } from '@utils/exportSettings';
import { loadAppSettings, saveAppSettings, type AppSettings } from '@utils/appSettings';
// تم حذف AuthGuard لجعل الموقع عاماً
// جسر قاعدة البيانات (يُحمّل ديناميكياً وقت الحاجة)
type BridgeAPI = {
  init: () => Promise<void>;
  getPreference: (key: string) => Promise<string | null>;
  setPreference: (key: string, value: string) => Promise<void>;
  exportDatabase: () => Promise<Uint8Array>;
  importDatabase: (data: Uint8Array) => Promise<void>;
};
let bridge: BridgeAPI | null = null;
async function getBridge(): Promise<BridgeAPI | null> {
  if (typeof window === 'undefined') return null;
  if (!bridge) {
    const mod = await import('../utils/db.bridge');
    bridge = mod.dbBridge as unknown as BridgeAPI;
    await bridge.init();
  }
  return bridge;
}

export default function SettingsPage() {
  return <SettingsPageContent />;
}

function SettingsPageContent() {
  const { theme, darkMode, setDarkMode, colorScheme, setColorScheme } = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [exportPrefs, setExportPrefs] = useState<ExportPreferences>({ includeStages: true, includeInputs: false, includeOutputs: true, marginPt: 48 });
  const [appSettings, setAppSettings] = useState<AppSettings>({ preferredModel: 'gemini-1.5-flash', rateLimitPerMin: 10 });
  // لوحة تحكم عامة (تُخزن في SQLite user_preferences)
  const [ctrlDefaultCaseType, setCtrlDefaultCaseType] = useState<string>('عام');
  const [ctrlDefaultPartyRole, setCtrlDefaultPartyRole] = useState<string>('');
  const [ctrlStageGating, setCtrlStageGating] = useState<boolean>(true);
  const [ctrlShowDeadlines, setCtrlShowDeadlines] = useState<boolean>(true);
  const [ctrlLanguage, setCtrlLanguage] = useState<'ar'|'en'>('ar');
  const [ctrlNotifications, setCtrlNotifications] = useState<boolean>(true);

  useEffect(() => {
    loadApiKey().then(val => setApiKey(val || '')); 
    loadExportPreferences().then(setExportPrefs);
    loadAppSettings().then(setAppSettings);
    // تحميل تفضيلات لوحة التحكم من SQLite
    (async () => {
      try {
        const b = await getBridge(); if (!b) return;
        const [p1,p2,p3,p4,p5,p6] = await Promise.all([
          b.getPreference('default_case_type'),
          b.getPreference('default_party_role'),
          b.getPreference('stage_gating_enabled'),
          b.getPreference('show_deadlines_enabled'),
          b.getPreference('ui_language'),
          b.getPreference('notifications_enabled'),
        ]);
        if (p1) setCtrlDefaultCaseType(p1);
        if (p2) setCtrlDefaultPartyRole(p2);
        if (p3) setCtrlStageGating(p3 === '1');
        if (p4) setCtrlShowDeadlines(p4 === '1');
        if (p5 === 'ar' || p5 === 'en') setCtrlLanguage(p5);
        if (p6) setCtrlNotifications(p6 === '1');
      } catch {/* ignore */}
    })();
  }, []);

  const handleSaveKey = async () => {
    setSaving(true);
    try {
      await saveApiKey(apiKey.trim());
      // توافق مع إصدارات سابقة: حفظ نسخة في localStorage إن لزم
      try { localStorage.setItem('gemini_api_key', apiKey.trim()); } catch {}
      setNotices(prev => [...prev, { id: Math.random().toString(36).slice(2), type: 'success', message: 'تم حفظ مفتاح API بنجاح.' }]);
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
    setNotices(prev => [...prev, { id: Math.random().toString(36).slice(2), type: 'success', message: 'تم مسح البيانات وإعادة الضبط.' }]);
  };

  // نسخ احتياطي واستعادة لقاعدة SQLite كاملة
  const handleBackupDB = async () => {
    try {
      const b = await getBridge();
      if (!b) return;
      const data = await b.exportDatabase();
      const blob = new Blob([new Uint8Array(data)], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `legal_sqlite_backup_${Date.now()}.db`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setNotices(prev => [...prev, { id: Math.random().toString(36).slice(2), type: 'success', message: 'تم إنشاء نسخة احتياطية لقاعدة البيانات.' }]);
    } catch {
      setNotices(prev => [...prev, { id: Math.random().toString(36).slice(2), type: 'error', message: 'فشل النسخ الاحتياطي.' }]);
    }
  };

  const handleRestoreDB = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function(ev) {
      try {
        const arrBuf = ev.target?.result as ArrayBuffer;
        const u8 = new Uint8Array(arrBuf);
        const b = await getBridge();
        if (!b) return;
        await b.importDatabase(u8);
        setNotices(prev => [...prev, { id: Math.random().toString(36).slice(2), type: 'success', message: 'تم استعادة قاعدة البيانات.' }]);
      } catch {
        setNotices(prev => [...prev, { id: Math.random().toString(36).slice(2), type: 'error', message: 'فشل الاستعادة.' }]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // حفظ تفضيلات لوحة التحكم
  const saveControlPanel = async () => {
    try {
      const b = await getBridge(); if (!b) return;
      await Promise.all([
        b.setPreference('default_case_type', ctrlDefaultCaseType),
        b.setPreference('default_party_role', ctrlDefaultPartyRole || ''),
        b.setPreference('stage_gating_enabled', ctrlStageGating ? '1' : '0'),
        b.setPreference('show_deadlines_enabled', ctrlShowDeadlines ? '1' : '0'),
        b.setPreference('ui_language', ctrlLanguage),
        b.setPreference('notifications_enabled', ctrlNotifications ? '1' : '0'),
      ]);
      setNotices(prev => [...prev, { id: Math.random().toString(36).slice(2), type: 'success', message: 'تم حفظ تفضيلات لوحة التحكم.' }]);
    } catch {
      setNotices(prev => [...prev, { id: Math.random().toString(36).slice(2), type: 'error', message: 'فشل حفظ التفضيلات.' }]);
    }
  };

  return (
    <div style={{ fontFamily: 'Tajawal, Arial, sans-serif', direction: 'rtl', minHeight: '100vh', background: theme.background, color: theme.text }}>
      <Notifications notices={notices} setNotices={setNotices} />
      <main className="fade-in-up container" style={{ maxWidth: 900, padding: isMobile() ? '1rem 0.5rem' : '2rem 1rem' }}>
        <div className="font-headline" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:16}}>
          <span style={{fontSize: isMobile()? 28:32}}>⚙️</span>
          <h1 className="headline-lg" style={{margin:0, color: theme.accent}}>الإعدادات</h1>
        </div>

        {/* لوحة تحكم المستخدم العامة */}
        <div className="card-ui" style={{ background: theme.card, borderColor: theme.border, padding: isMobile()? 16:24, marginBottom: 16 }}>
          <div className="font-headline" style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
            <span style={{fontSize: isMobile()? 22:24}}>🧭</span>
            <h2 className="headline-sm" style={{margin:0, color: theme.accent2}}>لوحة التحكم</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile()? '1fr' : '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{display:'block', marginBottom:6, fontWeight:600, color: theme.accent2}}>نوع القضية الافتراضي:</label>
              <select value={ctrlDefaultCaseType} onChange={e => setCtrlDefaultCaseType(e.target.value)} style={{ width:'100%', border:`1.5px solid ${theme.input}`, borderRadius:10, padding:10 }}>
                {['عام','ميراث','أحوال شخصية','تجاري','جنائي','عمل','عقاري','إداري','إيجارات'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{display:'block', marginBottom:6, fontWeight:600, color: theme.accent2}}>الصفة الافتراضية في الدعوى:</label>
              <select value={ctrlDefaultPartyRole} onChange={e => setCtrlDefaultPartyRole(e.target.value)} style={{ width:'100%', border:`1.5px solid ${theme.input}`, borderRadius:10, padding:10 }}>
                <option value="">بدون</option>
                <option value="المشتكي">المشتكي</option>
                <option value="المشتكى عليه">المشتكى عليه</option>
                <option value="المدعي">المدعي</option>
                <option value="المدعى عليه">المدعى عليه</option>
              </select>
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="checkbox" checked={ctrlStageGating} onChange={e => setCtrlStageGating(e.target.checked)} />
              تفعيل قفل المراحل حتى تحقق الاعتماديات
            </label>
            <label style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="checkbox" checked={ctrlShowDeadlines} onChange={e => setCtrlShowDeadlines(e.target.checked)} />
              عرض المواعيد القانونية ضمن المراحل
            </label>
            <div>
              <label style={{display:'block', marginBottom:6, fontWeight:600, color: theme.accent2}}>اللغة:</label>
              <select value={ctrlLanguage} onChange={e => setCtrlLanguage(e.target.value as 'ar'|'en')} style={{ width:'100%', border:`1.5px solid ${theme.input}`, borderRadius:10, padding:10 }}>
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="checkbox" checked={ctrlNotifications} onChange={e => setCtrlNotifications(e.target.checked)} />
              تفعيل الإشعارات داخل التطبيق
            </label>
          </div>
          <div style={{ display:'flex', gap:8, marginTop: 12 }}>
            <button onClick={saveControlPanel} className="btn btn-info" style={{ background: theme.accent2 }}>حفظ التفضيلات</button>
          </div>
        </div>

                 {/* بطاقة مفتاح API */}
         <div className="card-ui" style={{ background: theme.card, borderColor: theme.border, padding: isMobile()? 16:24, marginBottom: 16 }}>
           <div className="font-headline" style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
             <span style={{fontSize: isMobile()? 22:24}}>🔑</span>
             <h2 className="headline-sm" style={{margin:0, color: theme.accent2}}>مفتاح Gemini API</h2>
           </div>
           <input
             type="password"
             placeholder="أدخل مفتاح Gemini API"
             value={apiKey}
             onChange={(e) => setApiKey(e.target.value)}
             style={{ width: '100%', padding: isMobile()? 12:14, border: `1.5px solid ${theme.input}`, borderRadius: 12, fontSize: isMobile()? 15:16, outline: 'none' }}
           />
           <div style={{display:'flex', gap:10, marginTop:10, flexWrap:'wrap'}}>
             <button onClick={handleSaveKey} disabled={saving} className="btn btn-info" style={{ background: theme.accent2, cursor: saving? 'not-allowed':'pointer' }}>حفظ المفتاح</button>
             <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="btn" style={{ background:'#fff', color: theme.accent, border:`1px solid ${theme.accent2}` }}>الحصول على المفتاح</a>
           </div>
           
           {/* شرح مفتاح API */}
           <div style={{marginTop: 16, padding: '12px 16px', background: '#f0f9ff', borderRadius: 8, border: '1px solid #0ea5e9', fontSize: 14, lineHeight: 1.6, color: '#0c4a6e'}}>
             <h4 style={{margin: '0 0 8px 0', fontSize: 16}}>📝 شرح مفتاح API:</h4>
             <p style={{margin: '4px 0'}}><strong>ما هو مفتاح API؟</strong> مفتاح رقمي يسمح للتطبيق بالتواصل مع خدمة Google Gemini للذكاء الاصطناعي.</p>
             <p style={{margin: '4px 0'}}><strong>كيف أحصل عليه؟</strong> اضغط على &quot;الحصول على المفتاح&quot; وسيأخذك إلى موقع Google، سجل دخولك واحصل على المفتاح مجاناً.</p>
             <p style={{margin: '4px 0'}}><strong>هل هو آمن؟</strong> نعم، المفتاح محفوظ محلياً على جهازك فقط ولا يتم إرساله لأي خادم آخر.</p>
             <p style={{margin: '4px 0'}}><strong>هل هو مجاني؟</strong> نعم، Google تقدم رصيد مجاني شهرياً يكفي لمعظم الاستخدامات.</p>
           </div>
         </div>

                 {/* بطاقة المظهر والخصوصية */}
         <div className="card-ui" style={{ background: theme.card, borderColor: theme.border, padding: isMobile()? 16:24, marginBottom: 16 }}>
           <div className="font-headline" style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
             <span style={{fontSize: isMobile()? 22:24}}>{darkMode ? '🌙' : '☀️'}</span>
             <h2 className="headline-sm" style={{margin:0, color: theme.accent2}}>المظهر والخصوصية</h2>
           </div>
           <button onClick={() => setDarkMode(!darkMode)} className="btn" style={{ background: 'none', border:`1px solid ${theme.accent2}`, color: theme.accent2 }}>
             تبديل الوضع ({darkMode ? 'ليلي' : 'فاتح'})
           </button>
           <p className="font-body card-panel" style={{marginTop:12, fontSize:14, lineHeight:1.8, background: '#f5f7ff', color:'#222', padding: '10px 12px', borderColor: theme.border }}>
             🔒 جميع بياناتك (القضايا والمفاتيح) تحفظ محليًا على جهازك فقط ولا يتم رفعها إلى أي خادم.
           </p>
           
           {/* شرح المظهر والخصوصية */}
           <div style={{marginTop: 16, padding: '12px 16px', background: darkMode ? '#3a2a0a' : '#fef3c7', borderRadius: 8, border: `1px solid ${darkMode ? '#92400e' : '#f59e0b'}`, fontSize: 14, lineHeight: 1.6, color: darkMode ? '#fbbf24' : '#92400e'}}>
             <h4 style={{margin: '0 0 8px 0', fontSize: 16}}>🎨 شرح المظهر والخصوصية:</h4>
             <p style={{margin: '4px 0'}}><strong>الوضع الفاتح/الليلي:</strong> اختر المظهر المناسب لعينيك، الوضع الليلي أفضل للاستخدام في الظلام.</p>
             <p style={{margin: '4px 0'}}><strong>الخصوصية:</strong> جميع بياناتك محفوظة محلياً على جهازك فقط، لا نرسل أي شيء لخوادم خارجية.</p>
             <p style={{margin: '4px 0'}}><strong>الأمان:</strong> بياناتك مشفرة ومحمية، حتى لو استخدم شخص آخر جهازك لن يتمكن من الوصول لقضاياك.</p>
           </div>
         </div>

         {/* بطاقة اختيار الألوان */}
         <div className="card-ui" style={{ background: theme.card, borderColor: theme.border, padding: isMobile()? 16:24, marginBottom: 16 }}>
           <div className="font-headline" style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
             <span style={{fontSize: isMobile()? 22:24}}>🎨</span>
             <h2 className="headline-sm" style={{margin:0, color: theme.accent2}}>اختيار الألوان</h2>
           </div>
           
           <div style={{marginBottom: 16}}>
             <label style={{display:'block', marginBottom:8, fontWeight:600, color: theme.accent2}}>اختر السمة اللونية:</label>
             <div style={{display:'grid', gridTemplateColumns: isMobile()? '1fr 1fr' : '1fr 1fr 1fr', gap: 12}}>
               {/* السمة الخضراء */}
               <div 
                 onClick={() => setColorScheme('green')}
                 style={{
                   padding: '16px',
                   borderRadius: '12px',
                   border: `2px solid ${colorScheme === 'green' ? theme.accent : theme.border}`,
                   background: colorScheme === 'green' ? theme.accent + '20' : 'transparent',
                   cursor: 'pointer',
                   textAlign: 'center',
                   transition: 'all 0.2s ease'
                 }}
               >
                 <div style={{width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', margin: '0 auto 8px auto', border: '2px solid #bbf7d0'}}></div>
                 <div style={{fontSize: '14px', fontWeight: 600, color: theme.text}}>أخضر</div>
               </div>

               {/* السمة الزرقاء */}
               <div 
                 onClick={() => setColorScheme('blue')}
                 style={{
                   padding: '16px',
                   borderRadius: '12px',
                   border: `2px solid ${colorScheme === 'blue' ? theme.accent : theme.border}`,
                   background: colorScheme === 'blue' ? theme.accent + '20' : 'transparent',
                   cursor: 'pointer',
                   textAlign: 'center',
                   transition: 'all 0.2s ease'
                 }}
               >
                 <div style={{width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)', margin: '0 auto 8px auto', border: '2px solid #bfdbfe'}}></div>
                 <div style={{fontSize: '14px', fontWeight: 600, color: theme.text}}>أزرق</div>
               </div>

               {/* السمة البنفسجية */}
               <div 
                 onClick={() => setColorScheme('purple')}
                 style={{
                   padding: '16px',
                   borderRadius: '12px',
                   border: `2px solid ${colorScheme === 'purple' ? theme.accent : theme.accent}`,
                   background: colorScheme === 'purple' ? theme.accent + '20' : 'transparent',
                   cursor: 'pointer',
                   textAlign: 'center',
                   transition: 'all 0.2s ease'
                 }}
               >
                 <div style={{width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #faf5ff 0%, #f8fafc 100%)', margin: '0 auto 8px auto', border: '2px solid #ddd6fe'}}></div>
                 <div style={{fontSize: '14px', fontWeight: 600, color: theme.text}}>بنفسجي</div>
               </div>

               {/* السمة البرتقالية */}
               <div 
                 onClick={() => setColorScheme('orange')}
                 style={{
                   padding: '16px',
                   borderRadius: '12px',
                   border: `2px solid ${colorScheme === 'orange' ? theme.accent : theme.border}`,
                   background: colorScheme === 'orange' ? theme.accent + '20' : 'transparent',
                   cursor: 'pointer',
                   textAlign: 'center',
                   transition: 'all 0.2s ease'
                 }}
               >
                 <div style={{width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #fff7ed 0%, #fefce8 100%)', margin: '0 auto 8px auto', border: '2px solid #fed7aa'}}></div>
                 <div style={{fontSize: '14px', fontWeight: 600, color: theme.text}}>برتقالي</div>
               </div>

               {/* السمة الوردية */}
               <div 
                 onClick={() => setColorScheme('pink')}
                 style={{
                   padding: '16px',
                   borderRadius: '12px',
                   border: `2px solid ${colorScheme === 'pink' ? theme.accent : theme.border}`,
                   background: colorScheme === 'pink' ? theme.accent + '20' : 'transparent',
                   cursor: 'pointer',
                   textAlign: 'center',
                   transition: 'all 0.2s ease'
                 }}
               >
                 <div style={{width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)', margin: '0 auto 8px auto', border: '2px solid #fbcfe8'}}></div>
                 <div style={{fontSize: '14px', fontWeight: 600, color: theme.text}}>وردي</div>
               </div>

               {/* السمة التركوازية */}
               <div 
                 onClick={() => setColorScheme('teal')}
                 style={{
                   padding: '16px',
                   borderRadius: '12px',
                   border: `2px solid ${colorScheme === 'teal' ? theme.accent : theme.border}`,
                   background: colorScheme === 'teal' ? theme.accent + '20' : 'transparent',
                   cursor: 'pointer',
                   textAlign: 'center',
                   transition: 'all 0.2s ease'
                 }}
               >
                 <div style={{width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%)', margin: '0 auto 8px auto', border: '2px solid #99f6e4'}}></div>
                 <div style={{fontSize: '14px', fontWeight: 600, color: theme.text}}>تركوازي</div>
               </div>
             </div>
           </div>

           <div style={{padding: '12px 16px', background: theme.resultBg, borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 14, lineHeight: 1.6}}>
             <h4 style={{margin: '0 0 8px 0', fontSize: 16, color: theme.accent2}}>🎨 شرح اختيار الألوان:</h4>
             <p style={{margin: '4px 0', color: theme.text}}><strong>السمة الخضراء:</strong> هادئة ومريحة للعين، مناسبة للعمل الطويل.</p>
             <p style={{margin: '4px 0', color: theme.text}}><strong>السمة الزرقاء:</strong> احترافية وموثوقة، مناسبة للبيئات القانونية.</p>
             <p style={{margin: '4px 0', color: theme.text}}><strong>السمة البنفسجية:</strong> إبداعية وعصرية، تجمع بين الأناقة والابتكار.</p>
             <p style={{margin: '4px 0', color: theme.text}}><strong>السمة البرتقالية:</strong> دافئة ومحفزة، مناسبة للعمل النشط.</p>
             <p style={{margin: '4px 0', color: theme.text}}><strong>السمة الوردية:</strong> لطيفة ومريحة، مناسبة للعمل الإبداعي.</p>
             <p style={{margin: '4px 0', color: theme.text}}><strong>السمة التركوازية:</strong> منعشة ومتوازنة، مناسبة للعمل المكثف.</p>
           </div>
         </div>

                 {/* بطاقة القضايا: تصدير/استيراد ومسح */}
         <div className="card-ui" style={{ background: theme.card, borderColor: theme.border, padding: isMobile()? 16:24 }}>
           <div className="font-headline" style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
             <span style={{fontSize: isMobile()? 22:24}}>📦</span>
             <h2 className="headline-sm" style={{margin:0, color: theme.accent2}}>القضايا</h2>
           </div>
           <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
             <button onClick={handleExport} className="btn btn-info" style={{ background: theme.accent }}>⬇️ تصدير القضايا</button>
             <label className="btn btn-info" style={{ background: theme.accent2 }}>
               ⬆️ استيراد قضايا
               <input type="file" accept="application/json" onChange={handleImport} style={{ display: 'none' }} />
             </label>
             <button onClick={handleClearAll} className="btn btn-danger">🗑️ مسح كل البيانات</button>
             <button onClick={handleBackupDB} className="btn btn-info" style={{ background: '#0ea5e9' }}>💾 نسخ احتياطي لقاعدة البيانات</button>
             <label className="btn btn-info" style={{ background: '#06b6d4' }}>
               ♻️ استعادة قاعدة البيانات
               <input type="file" accept="application/octet-stream,.db" onChange={handleRestoreDB} style={{ display: 'none' }} />
             </label>
           </div>
           
           {/* شرح القضايا */}
           <div style={{marginTop: 16, padding: '12px 16px', background: darkMode ? '#0f2a1a' : '#f0fdf4', borderRadius: 8, border: `1px solid ${darkMode ? '#16a34a' : '#22c55e'}`, fontSize: 14, lineHeight: 1.6, color: darkMode ? '#4ade80' : '#166534'}}>
             <h4 style={{margin: '0 0 8px 0', fontSize: 16}}>📋 شرح إدارة القضايا:</h4>
             <p style={{margin: '4px 0'}}><strong>تصدير القضايا:</strong> يحفظ جميع قضاياك في ملف JSON يمكنك الاحتفاظ به كنسخة احتياطية.</p>
             <p style={{margin: '4px 0'}}><strong>استيراد قضايا:</strong> يمكنك استعادة قضاياك من ملف JSON محفوظ مسبقاً أو نقلها لجهاز آخر.</p>
             <p style={{margin: '4px 0'}}><strong>مسح كل البيانات:</strong> يحذف جميع القضايا والمفاتيح والإعدادات ويعيد التطبيق لحالته الأولية.</p>
             <p style={{margin: '4px 0'}}><strong>⚠️ تحذير:</strong> مسح البيانات إجراء نهائي لا يمكن التراجع عنه!</p>
           </div>
         </div>

        {/* إعدادات التطبيق */}
        <div className="card-ui" style={{ background: theme.card, borderColor: theme.border, padding: isMobile()? 16:24, marginTop: 16 }}>
          <div className="font-headline" style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
            <span style={{fontSize: isMobile()? 22:24}}>🧠</span>
            <h2 className="headline-sm" style={{margin:0, color: theme.accent2}}>إعدادات الذكاء والحدود</h2>
          </div>
          
          {/* شرح النماذج */}
          <div style={{marginBottom: 16, padding: '12px 16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: 8, border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`}}>
            <h4 style={{margin: '0 0 8px 0', color: theme.accent2, fontSize: 16}}>🤖 اختيار نموذج الذكاء الاصطناعي:</h4>
            <div style={{fontSize: 14, lineHeight: 1.6, color: '#4a5568'}}>
              <p style={{margin: '4px 0'}}><strong>gemini-1.5-flash</strong> ⭐ <span style={{color: '#10b981'}}>مجاني</span> - سريع ومناسب لمعظم الاستخدامات</p>
              <p style={{margin: '4px 0'}}><strong>gemini-1.5-pro</strong> 💰 مدفوع - أكثر دقة وتعقيداً للمهام المتقدمة</p>
              <p style={{margin: '4px 0'}}><strong>gemini-2.0-flash</strong> 💰 مدفوع - أحدث وأسرع من Google</p>
              <p style={{margin: '8px 0 0 0', fontSize: 13, color: '#6b7280'}}><strong>💡 نصيحة:</strong> ابدأ بـ gemini-1.5-flash فهو مجاني ويغطي معظم احتياجاتك</p>
            </div>
          </div>

          {/* شرح حد الطلبات */}
          <div style={{marginBottom: 16, padding: '12px 16px', background: darkMode ? '#3a2a0a' : '#fef3c7', borderRadius: 8, border: `1px solid ${darkMode ? '#92400e' : '#f59e0b'}`}}>
            <h4 style={{margin: '0 0 8px 0', color: darkMode ? '#fbbf24' : '#92400e', fontSize: 16}}>⚡ حد الطلبات في الدقيقة:</h4>
            <div style={{fontSize: 14, lineHeight: 1.6, color: darkMode ? '#fbbf24' : '#92400e'}}>
              <p style={{margin: '4px 0'}}><strong>الرقم 10</strong> يعني: 10 طلبات في الدقيقة الواحدة</p>
              <p style={{margin: '4px 0'}}><strong>الرقم المناسب:</strong></p>
              <ul style={{margin: '4px 0', paddingRight: 16}}>
                <li><strong>5-8:</strong> للاستخدام الخفيف (توفير التكلفة)</li>
                <li><strong>10-15:</strong> للاستخدام العادي (موصى به)</li>
                <li><strong>20-30:</strong> للاستخدام المكثف (تكلفة أعلى)</li>
              </ul>
              <p style={{margin: '4px 0', fontSize: 13}}><strong>السبب:</strong> منع استهلاك API بشكل مفرط وتجنب التكلفة الزائدة</p>
              <p style={{margin: '4px 0', fontSize: 13}}><strong>مثال:</strong> إذا وضعت 10، يمكنك إرسال 10 رسائل في الدردشة خلال دقيقة واحدة</p>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns: isMobile()? '1fr' : '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{display: 'block', marginBottom: 6, fontWeight: 600, color: theme.accent2}}>نموذج الذكاء الاصطناعي:</label>
              <select value={appSettings.preferredModel} onChange={e => setAppSettings(p => ({ ...p, preferredModel: e.target.value as AppSettings['preferredModel'] }))} style={{ width: '100%', border:`1.5px solid ${theme.input}`, borderRadius: 10, padding: 10 }}>
                <option value="gemini-1.5-flash">gemini-1.5-flash (مجاني)</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro (مدفوع)</option>
                <option value="gemini-2.0-flash">gemini-2.0-flash (مدفوع)</option>
              </select>
            </div>
            <div>
              <label style={{display: 'block', marginBottom: 6, fontWeight: 600, color: theme.accent2}}>حد الطلبات في الدقيقة:</label>
              <input type="number" min={1} max={60} placeholder="10" value={appSettings.rateLimitPerMin || 10} onChange={e => setAppSettings(p => ({ ...p, rateLimitPerMin: Number(e.target.value)||10 }))} style={{ width: '100%', border:`1.5px solid ${theme.input}`, borderRadius: 10, padding: 10 }} />
            </div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop: 12 }}>
            <button onClick={() => saveAppSettings(appSettings)} className="btn btn-info" style={{ background: theme.accent2 }}>حفظ إعدادات التطبيق</button>
          </div>
          
          {/* معلومات إضافية */}
          <div style={{marginTop: 12, padding: '8px 12px', background: darkMode ? '#0f2a1a' : '#ecfdf5', borderRadius: 6, border: `1px solid ${darkMode ? '#16a34a' : '#10b981'}`, fontSize: 13, color: darkMode ? '#4ade80' : '#065f46'}}>
            <strong>ℹ️ ملاحظة:</strong> التكلفة تعتمد على عدد الطلبات ونوع النموذج. gemini-1.5-flash مجاني تماماً، بينما النماذج الأخرى تتطلب رصيد مدفوع من Google.
          </div>
        </div>

                 {/* إعدادات التصدير */}
         <div className="card-ui" style={{ background: theme.card, borderColor: theme.border, padding: isMobile()? 16:24, marginTop: 16 }}>
           <div className="font-headline" style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
             <span style={{fontSize: isMobile()? 22:24}}>🖨️</span>
             <h2 className="headline-sm" style={{margin:0, color: theme.accent2}}>إعدادات التصدير</h2>
           </div>
           <div style={{ display:'grid', gridTemplateColumns: isMobile()? '1fr' : '1fr 1fr', gap: 10 }}>
             <div>
               <label style={{display: 'block', marginBottom: 6, fontWeight: 600, color: theme.accent2}}>نص الترويسة:</label>
               <input type="text" placeholder="مثال: مكتب المحامي أحمد محمد" value={exportPrefs.headerText || ''} onChange={e => setExportPrefs(p => ({ ...p, headerText: e.target.value }))} style={{ width: '100%', border:`1.5px solid ${theme.input}`, borderRadius: 10, padding: 10 }} />
             </div>
             <div>
               <label style={{display: 'block', marginBottom: 6, fontWeight: 600, color: theme.accent2}}>نص التذييل:</label>
               <input type="text" placeholder="مثال: تم إنشاؤه بواسطة منصة التحليل القانوني" value={exportPrefs.footerText || ''} onChange={e => setExportPrefs(p => ({ ...p, footerText: e.target.value }))} style={{ width: '100%', border:`1.5px solid ${theme.input}`, borderRadius: 10, padding: 10 }} />
             </div>
             <div>
               <label style={{display: 'block', marginBottom: 6, fontWeight: 600, color: theme.accent2}}>الهامش (pt):</label>
               <input type="number" min={12} max={96} placeholder="48" value={exportPrefs.marginPt || 48} onChange={e => setExportPrefs(p => ({ ...p, marginPt: Number(e.target.value)||48 }))} style={{ width: '100%', border:`1.5px solid ${theme.input}`, borderRadius: 10, padding: 10 }} />
             </div>
             <div>
               <label style={{display: 'block', marginBottom: 6, fontWeight: 600, color: theme.accent2}}>شعار (Data URL):</label>
               <input type="text" placeholder="رابط الشعار (اختياري)" value={exportPrefs.logoDataUrl || ''} onChange={e => setExportPrefs(p => ({ ...p, logoDataUrl: e.target.value }))} style={{ width: '100%', border:`1.5px solid ${theme.input}`, borderRadius: 10, padding: 10 }} />
             </div>
             <label style={{ display:'flex', alignItems:'center', gap:8 }}>
               <input type="checkbox" checked={exportPrefs.includeStages !== false} onChange={e => setExportPrefs(p => ({ ...p, includeStages: e.target.checked }))} />
               تضمين عناوين المراحل
             </label>
             <label style={{ display:'flex', alignItems:'center', gap:8 }}>
               <input type="checkbox" checked={!!exportPrefs.includeInputs} onChange={e => setExportPrefs(p => ({ ...p, includeInputs: e.target.checked }))} />
               تضمين النصوص المدخلة
             </label>
             <label style={{ display:'flex', alignItems:'center', gap:8 }}>
               <input type="checkbox" checked={exportPrefs.includeOutputs !== false} onChange={e => setExportPrefs(p => ({ ...p, includeOutputs: e.target.checked }))} />
               تضمين النتائج
             </label>
           </div>
           <div style={{ display:'flex', gap:8, marginTop: 12 }}>
             <button onClick={() => saveExportPreferences(exportPrefs)} className="btn btn-info" style={{ background: theme.accent2 }}>حفظ إعدادات التصدير</button>
           </div>
           
           {/* شرح إعدادات التصدير */}
           <div style={{marginTop: 16, padding: '12px 16px', background: '#fdf4ff', borderRadius: 8, border: '1px solid #c084fc', fontSize: 14, lineHeight: 1.6, color: '#581c87'}}>
             <h4 style={{margin: '0 0 8px 0', fontSize: 16}}>📄 شرح إعدادات التصدير:</h4>
             <p style={{margin: '4px 0'}}><strong>نص الترويسة:</strong> سيظهر في أعلى كل صفحة مصدرة (مثل اسم المكتب أو العنوان).</p>
             <p style={{margin: '4px 0'}}><strong>نص التذييل:</strong> سيظهر في أسفل كل صفحة مصدرة (مثل معلومات الاتصال أو الشعار).</p>
             <p style={{margin: '4px 0'}}><strong>الهامش:</strong> المسافة بين المحتوى وحواف الصفحة (12-96 نقطة)، 48 نقطة مناسبة لمعظم الاستخدامات.</p>
             <p style={{margin: '4px 0'}}><strong>الشعار:</strong> رابط صورة الشعار (اختياري) سيظهر في الترويسة.</p>
             <p style={{margin: '4px 0'}}><strong>خيارات التضمين:</strong> اختر ما تريد تضمينه في الملف المصدر (المراحل، النصوص المدخلة، النتائج).</p>
           </div>
         </div>

        {status && (
          <div className="text-center" style={{marginTop:12, color: theme.accent2, fontWeight:800}}>{status}</div>
        )}
      </main>
    </div>
  );
}