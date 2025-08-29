import React, { useEffect, useMemo, useState } from 'react';
// جلب التحليلات من الجسر (SQLite)
let bridge: any = null;
async function loadBridge() {
  if (typeof window === 'undefined') return null;
  if (!bridge) {
    const mod = await import('../utils/db.bridge');
    bridge = mod.dbBridge;
    await bridge.init();
  }
  return bridge;
}
import { saveAllCases, getAllCases, loadApiKey } from '../utils/db';
import { isMobile } from '../utils/crypto';
import { useTheme } from '../contexts/ThemeContext';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { exportResultsToPDF, exportResultsToDocx } from '../utils/export';

const STAGES = [
  'المرحلة الأولى: تحديد المشكلة القانونية',
  'المرحلة الثانية: جمع المعلومات والوثائق',
  'المرحلة الثالثة: تحليل النصوص القانونية',
  'المرحلة الرابعة: تحديد القواعد القانونية المنطبقة',
  'المرحلة الخامسة: تحليل السوابق القضائية',
  'المرحلة السادسة: تحليل الفقه القانوني',
  'المرحلة السابعة: تحليل الظروف الواقعية',
  'المرحلة الثامنة: تحديد الحلول القانونية الممكنة',
  'المرحلة التاسعة: تقييم الحلول القانونية',
  'المرحلة العاشرة: اختيار الحل الأمثل',
  'المرحلة الحادية عشرة: صياغة الحل القانوني',
  'المرحلة الثانية عشرة: تقديم التوصيات',
];

const lightTheme = {
  background: 'linear-gradient(135deg, #e0e7ff 0%, #f7f7fa 100%)',
  card: '#fff',
  border: '#e0e7ff',
  accent: '#4f46e5',
  accent2: '#6366f1',
  text: '#222',
  shadow: '#6366f122',
  resultBg: 'linear-gradient(135deg, #f5f7ff 0%, #e0e7ff 100%)',
};
const darkTheme = {
  background: 'linear-gradient(135deg, #232946 0%, #16161a 100%)',
  card: '#232946',
  border: '#393e5c',
  accent: '#a3a8f0',
  accent2: '#6366f1',
  text: '#f7f7fa',
  shadow: '#23294655',
  resultBg: 'linear-gradient(135deg, #232946 0%, #393e5c 100%)',
};

type AnalysisHistoryItem = {
  id: string;
  stageIndex: number;
  stage: string;
  input: string;
  output: string;
  date: string;
};

// تعريف نوع جديد للقضية
interface Case {
  id: string;
  name: string;
  createdAt: string;
  stages: AnalysisHistoryItem[];
  chats?: ChatMessage[]; // إضافة خاصية المحادثات كخيارية
  tags?: string[]; // إضافة خاصية الوسوم
}

// تعريف نوع جديد للمحادثة
interface ChatMessage {
  id: string;
  question: string;
  answer: string;
  date: string;
}



export default function History() {
  const { theme, darkMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [editNameId, setEditNameId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState<string>('');
  const [activity, setActivity] = useState<Array<{ id:string; action:string; timestamp:string; metadata?: string; duration?: number }>>([]);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const filteredActivity = useMemo(() => {
    return activity.filter((a) => {
      if (actionFilter !== 'all' && a.action !== actionFilter) return false;
      const ts = new Date(a.timestamp).getTime();
      if (dateFrom) {
        const from = new Date(dateFrom).getTime();
        if (isFinite(from) && ts < from) return false;
      }
      if (dateTo) {
        // include whole day
        const to = new Date(dateTo).getTime() + 24*60*60*1000 - 1;
        if (isFinite(to) && ts > to) return false;
      }
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const meta = (a.metadata || '').toLowerCase();
        if (!a.action.toLowerCase().includes(q) && !meta.includes(q)) return false;
      }
      return true;
    });
  }, [activity, actionFilter, dateFrom, dateTo, query]);

  const exportActivityCSV = () => {
    const rows = [
      ['id', 'caseId', 'action', 'timestamp', 'duration', 'metadata'] as const,
      ...filteredActivity.map((a: any) => [
        a.id,
        selectedCaseId || '',
        a.action,
        a.timestamp,
        (a.duration ?? '').toString(),
        (a.metadata ?? '').replace(/\n/g, ' ').replace(/"/g, '""')
      ])
    ];
    const csv = rows
      .map(r => r.map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_${selectedCaseId || 'case'}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  // بحث وفلاتر
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [minStages, setMinStages] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'date_desc'|'date_asc'|'stages_desc'|'stages_asc'>('date_desc');
  // حذف المتغيرات غير المستخدمة:
  // const [newStageIndex, setNewStageIndex] = useState<number>(0);
  // const [newStageInput, setNewStageInput] = useState<string>('');
  // const [addingStage, setAddingStage] = useState(false);

  // تحويل البيانات القديمة (history) إلى بنية قضايا عند أول تحميل
  useEffect(() => {
    setMounted(true);
    // جلب القضايا من IndexedDB فقط
    getAllCases().then((dbCases: Case[]) => {
      if (dbCases && dbCases.length > 0) {
        setCases(dbCases.map((c: Case) => ({ ...c, chats: c.chats || [] })));
      }
    });
  }, []);
  // تحميل نشاط القضية عند اختيارها
  useEffect(() => {
    if (!selectedCaseId) { setActivity([]); return; }
    (async () => {
      try {
        const b = await loadBridge();
        if (!b) return;
        const logs = await b.listAnalytics(selectedCaseId, 200);
        setActivity(logs || []);
      } catch {
        setActivity([]);
      }
    })();
  }, [selectedCaseId]);

  useEffect(() => {
    saveAllCases(cases);
  }, [cases]);

  const handleDeleteCase = (id: string) => {
    setCases(cs => cs.filter(c => c.id !== id));
    if (selectedCaseId === id) setSelectedCaseId(null);
  };

  // حذف مرحلة من قضية
  const handleDeleteStage = (caseId: string, stageId: string) => {
    setCases(cs => cs.map(c => c.id === caseId ? {
      ...c,
      stages: c.stages.filter(s => s.id !== stageId)
    } : c));
  };

  // تصدير القضايا كملف JSON
  const handleExport = () => {
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

  // استيراد القضايا من ملف JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      if (typeof ev.target?.result === 'string') {
        try {
          const imported = JSON.parse(ev.target.result);
          if (Array.isArray(imported)) {
            // دمج القضايا (مع استبعاد التكرار حسب id)
            const merged = [...cases];
            imported.forEach((c: Case) => {
              if (!merged.some(cc => cc.id === c.id)) merged.push(c);
            });
            setCases(merged);
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

  const handleExportCasePdf = (c: Case) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    let y = 40;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`قضية: ${c.name}`, 40, y);
    y += 24;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`تاريخ الإنشاء: ${new Date(c.createdAt).toLocaleString('ar-EG')}`, 40, y);
    y += 20;
    (c.stages || []).forEach((s, idx) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${idx + 1}) ${STAGES[s.stageIndex]}`, 40, y);
      y += 18;
      doc.setFont('helvetica', 'normal');
      const inputLines = doc.splitTextToSize(`النص: ${s.input}`, 520);
      doc.text(inputLines as string[], 40, y);
      y += (inputLines as string[]).length * 14 + 8;
      const outLines = doc.splitTextToSize(`النتيجة: ${s.output}`, 520);
      doc.text(outLines as string[], 40, y);
      y += (outLines as string[]).length * 14 + 14;
      if (y > 720) { doc.addPage(); y = 40; }
    });
    doc.save(`${c.name}.pdf`);
  };

  const handleExportCaseDocx = async (c: Case) => {
    const children: Paragraph[] = [
      new Paragraph({ text: `قضية: ${c.name}`, heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ text: `تاريخ الإنشاء: ${new Date(c.createdAt).toLocaleString('ar-EG')}` }),
    ];
    (c.stages || []).forEach((s, idx) => {
      children.push(new Paragraph({ text: `${idx + 1}) ${STAGES[s.stageIndex]}`, heading: HeadingLevel.HEADING_3 }));
      children.push(new Paragraph({ children: [new TextRun({ text: `النص: ${s.input}` })] }));
      children.push(new Paragraph({ children: [new TextRun({ text: `النتيجة: ${s.output}` })] }));
    });

    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${c.name}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // واجهة القضايا
  return (
    <div style={{ fontFamily: 'Tajawal, Arial, sans-serif', direction: 'rtl', minHeight: '100vh', background: theme.background, color: theme.text, padding: 0, margin: 0, transition: 'background 0.4s' }}>
      {mounted && (
        <>
          {/* شريط علوي - أزيل واستبدل بالهيدر العام من التخطيط */}
      <main className="fade-in-up" style={{
        maxWidth: 950,
        width: '100%',
        margin: '0 auto',
        padding: isMobile() ? '1rem 0.5rem' : '2.5rem 1rem',
      }}>
        {/* Card البحث والتصدير/الاستيراد */}
        <div style={{background:theme.card, borderRadius:14, boxShadow:`0 2px 12px ${theme.shadow}`, border:`1.5px solid ${theme.border}`, padding:isMobile()?12:22, marginBottom:28, display:'flex', flexDirection:'column', alignItems:'stretch', gap:14}}>
          <button onClick={handleExport} className="btn btn-info" style={{ background: theme.accent }}>⬇️ تصدير القضايا</button>
          <label className="btn btn-primary" style={{ display:'inline-block', background: theme.accent2 }}>
            ⬆️ استيراد قضايا
            <input type="file" accept="application/json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile()? '1fr' : 'repeat(4, 1fr)', gap: 10 }}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 ابحث عن قضية..." style={{ borderRadius:8, border:`1.5px solid ${theme.accent2}`, padding:'10px 14px', fontSize:15, outline:'none', background:darkMode?'#232946':'#fff', color:theme.text, boxShadow:'0 1px 4px #6366f122' }} />
            <input type="text" value={tagFilter} onChange={e => setTagFilter(e.target.value)} placeholder="🏷️ فلترة بالوسم..." style={{ borderRadius:8, border:`1.5px solid ${theme.accent2}`, padding:'10px 14px', fontSize:15, outline:'none', background:darkMode?'#232946':'#fff', color:theme.text, boxShadow:'0 1px 4px #6366f122' }} />
            <input type="number" min={0} value={minStages} onChange={e => setMinStages(Number(e.target.value) || 0)} placeholder="🔢 حد أدنى للمراحل" style={{ borderRadius:8, border:`1.5px solid ${theme.accent2}`, padding:'10px 14px', fontSize:15, outline:'none', background:darkMode?'#232946':'#fff', color:theme.text, boxShadow:'0 1px 4px #6366f122' }} />
            <select value={sortBy} onChange={e => setSortBy(e.target.value as 'date_desc'|'date_asc'|'stages_desc'|'stages_asc')} style={{ borderRadius:8, border:`1.5px solid ${theme.accent2}`, padding:'10px 14px', fontSize:15, background:darkMode?'#232946':'#fff', color:theme.text }}>
              <option value="date_desc">الأحدث أولاً</option>
              <option value="date_asc">الأقدم أولاً</option>
              <option value="stages_desc">أكثر مراحل</option>
              <option value="stages_asc">أقل مراحل</option>
            </select>
          </div>
        </div>
        {/* عرض القضايا */}
        <div className="font-headline" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:18}}>
          <span style={{fontSize:32}}>📑</span>
          <h1 className="headline-lg" style={{ color: theme.accent, margin: 0 }}>قائمة القضايا</h1>
        </div>
        {cases.length === 0 ? (
          <div style={{textAlign:'center', color:theme.accent2, fontSize:18, marginTop:40, background:theme.card, borderRadius:12, padding:24, boxShadow:`0 1px 8px ${theme.shadow}`}}>لا يوجد قضايا محفوظة بعد.</div>
        ) : selectedCaseId ? (
          // تفاصيل القضية المختارة
          <div style={{marginBottom:32}}>
            <button onClick={() => setSelectedCaseId(null)} className="btn btn-info" style={{ marginBottom: 18, background: theme.accent2 }}>← العودة للقضايا</button>
            {cases.filter(c => c.id === selectedCaseId).map(c => (
              <div key={c.id} style={{background:theme.card, borderRadius:18, boxShadow:`0 2px 16px ${theme.shadow}`, border:`2px solid ${theme.accent2}`, padding:isMobile()?14:32, marginBottom:18}}>
                <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10, flexWrap:'wrap'}}>
                  {editNameId === c.id ? (
                    <>
                      <input
                        type="text"
                        value={editNameValue}
                        onChange={e => setEditNameValue(e.target.value)}
                        style={{fontWeight:800, fontSize:22, color:theme.accent, border:'1.5px solid '+theme.accent2, borderRadius:8, padding:'4px 10px', outline:'none', width: isMobile() ? 180 : 320}}
                      />
                      <button onClick={() => {
                        setCases(cs => cs.map(cc => cc.id === c.id ? {...cc, name: editNameValue} : cc));
                        setEditNameId(null);
                      }} className="btn btn-info" style={{ marginRight: 6, background: theme.accent2 }}>حفظ</button>
                      <button onClick={() => setEditNameId(null)} className="btn" style={{ background: '#9ca3af' }}>إلغاء</button>
                    </>
                  ) : (
                    <>
                      <span style={{fontWeight:900, fontSize:26, color:theme.accent}}>{c.name}</span>
                      <button onClick={() => handleExportCasePdf(c)} className="btn btn-danger">تصدير PDF</button>
                      <button onClick={() => handleExportCaseDocx(c)} className="btn btn-info">تصدير Word</button>
                      <button onClick={() => {setEditNameId(c.id); setEditNameValue(c.name);}} className="btn btn-info" style={{ background: theme.accent2, marginRight: 8 }}>تعديل الاسم</button>
                    </>
                  )}
                </div>
                <div style={{fontSize:15, color:'#888', marginBottom:18}}>تاريخ الإنشاء: {new Date(c.createdAt).toLocaleString('ar-EG')}</div>
                <div style={{display:'flex', flexDirection:'column', gap:18}}>
                  <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
                    <span style={{fontWeight:700, color:theme.accent2}}>وسوم:</span>
                    <TagEditor c={c} setCases={setCases} theme={theme} />
                  </div>
                  {/* Activity Timeline */}
                  <div style={{background: theme.resultBg, border:`1px solid ${theme.border}`, borderRadius: 12, padding: isMobile()? 10 : 16}}>
                    <div style={{fontWeight:800, color: theme.accent, marginBottom: 8, display:'flex', alignItems:'center', gap:8}}>
                      <span>🕒</span> سجل النشاط
                    </div>
                    {/* فلاتر السجل */}
                    <div style={{display:'grid', gridTemplateColumns: isMobile()? '1fr' : '1fr 150px 150px 150px 140px', gap: 8, marginBottom: 10, alignItems:'center'}}>
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="🔍 بحث في الحدث/البيانات"
                        style={{ borderRadius:8, border:`1px solid ${theme.border}`, padding:'8px 10px', background: darkMode ? '#232946' : '#fff', color: theme.text }}
                      />
                      <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} style={{ borderRadius:8, border:`1px solid ${theme.border}`, padding:'8px 10px', background: darkMode ? '#232946' : '#fff', color: theme.text }}>
                        <option value="all">كل الأحداث</option>
                        <option value="case_created">case_created</option>
                        <option value="case_updated">case_updated</option>
                        <option value="case_deleted">case_deleted</option>
                        <option value="stage_created">stage_created</option>
                        <option value="comment_created">comment_created</option>
                        <option value="comment_deleted">comment_deleted</option>
                        <option value="task_created">task_created</option>
                        <option value="task_updated">task_updated</option>
                        <option value="task_deleted">task_deleted</option>
                        <option value="migration">migration</option>
                      </select>
                      <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ borderRadius:8, border:`1px solid ${theme.border}`, padding:'8px 10px', background: darkMode ? '#232946' : '#fff', color: theme.text }} />
                      <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ borderRadius:8, border:`1px solid ${theme.border}`, padding:'8px 10px', background: darkMode ? '#232946' : '#fff', color: theme.text }} />
                      {!isMobile() && (
                        <button onClick={exportActivityCSV} className="btn btn-info" style={{ background: theme.accent2, color:'#fff', border:'none', borderRadius:8, padding:'8px 10px', fontWeight:700, cursor:'pointer' }}>
                          ⬇️ تصدير CSV
                        </button>
                      )}
                    </div>
                    {isMobile() && (
                      <div style={{display:'flex', justifyContent:'flex-end', marginBottom:8}}>
                        <button onClick={exportActivityCSV} className="btn btn-info" style={{ background: theme.accent2, color:'#fff', border:'none', borderRadius:8, padding:'8px 10px', fontWeight:700, cursor:'pointer' }}>
                          ⬇️ تصدير CSV
                        </button>
                      </div>
                    )}
                    {activity.length === 0 ? (
                      <div style={{fontSize:13, color:'#888'}}>لا يوجد نشاط مسجل بعد.</div>
                    ) : (
                      <div style={{display:'flex', flexDirection:'column', gap:10}}>
                        {filteredActivity.map((a) => (
                          <div key={a.id} style={{display:'grid', gridTemplateColumns: isMobile()? '1fr' : '160px 1fr', gap:10, background: darkMode? '#181a2a' : '#fff', border:`1px solid ${theme.border}`, borderRadius: 10, padding: 10}}>
                            <div style={{color: theme.accent2, fontWeight: 700}}>{new Date(a.timestamp).toLocaleString('ar-EG')}</div>
                            <div>
                              <div style={{fontWeight: 700, color: theme.text}}>{a.action}</div>
                              {a.metadata && (
                                <div style={{fontSize: 12, color: '#888', marginTop:4, whiteSpace:'pre-wrap'}}>{a.metadata}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {c.stages.map((stage) => (
                    <div key={stage.id} style={{background:lightTheme.resultBg, borderRadius:12, boxShadow:`0 1px 6px ${theme.shadow}`, border:`1.5px solid ${theme.accent2}`, padding:isMobile()?10:18, position:'relative', marginBottom:8}}>
                      <div style={{color:theme.accent2, fontWeight:800, fontSize:17, marginBottom:6}}><span style={{fontSize:18}}>🧩</span> {STAGES[stage.stageIndex]}</div>
                      <div style={{fontWeight:600, color:theme.accent, marginBottom:4}}>النص المدخل:</div>
                      <div style={{background:darkTheme.card, borderRadius:8, padding:'8px 12px', fontSize:16, whiteSpace:'pre-line', border:`1px solid ${theme.border}`, marginBottom:8}}>{stage.input}</div>
                      <div style={{fontWeight:600, color:theme.accent, marginBottom:4}}>مخرجات التحليل:</div>
                      <div style={{background:darkTheme.card, borderRadius:8, padding:'8px 12px', fontSize:16, whiteSpace:'pre-line', border:`1px solid ${theme.border}`}}>{stage.output}</div>
                      <div style={{fontSize:13, color:'#888', marginTop:6}}>تاريخ المرحلة: {new Date(stage.date).toLocaleString('ar-EG')}</div>
                      <button onClick={() => handleDeleteStage(c.id, stage.id)} className="btn btn-danger" style={{position:'absolute', left:14, top:14, padding:isMobile()?'4px 8px':'5px 12px', fontSize:isMobile()?12:14}}>حذف المرحلة</button>
                    </div>
                  ))}
                  {/* واجهة المحادثة */}
                  <div style={{marginTop:10}}>
                    <div style={{background:lightTheme.resultBg, borderRadius:12, boxShadow:`0 1px 6px ${theme.shadow}`, border:`1.5px solid ${theme.accent2}`, padding:isMobile()?10:18}}>
                      <ChatBox caseObj={c} setCases={setCases} theme={theme} darkMode={darkMode} />
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDeleteCase(c.id)} className="btn btn-danger" style={{marginTop:18, padding:isMobile()?'7px 14px':'8px 22px', fontSize:isMobile()?15:17}}>حذف القضية</button>
              </div>
            ))}
          </div>
        ) : (
          // عرض القضايا في Grid متجاوب
          <div className="grid-responsive" style={{justifyContent:'center'}}>
            {cases
              .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
              .filter(c => !tagFilter.trim() || (c.tags||[]).some(t => t.toLowerCase().includes(tagFilter.toLowerCase())))
              .filter(c => (c.stages?.length || 0) >= minStages)
              .sort((a, b) => {
                if (sortBy === 'date_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                if (sortBy === 'date_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                if (sortBy === 'stages_desc') return (b.stages?.length || 0) - (a.stages?.length || 0);
                return (a.stages?.length || 0) - (b.stages?.length || 0);
              })
              .map(c => (
              <div key={c.id} className="article-card fade-in" style={{border:`2px solid ${theme.accent2}`, padding:isMobile()?12:24, position:'relative', minHeight:200, display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
                <div>
                  <div className="headline-sm font-headline" style={{color:theme.accent, marginBottom:8, textOverflow:'ellipsis', overflow:'hidden', whiteSpace:'nowrap'}} onClick={() => setSelectedCaseId(c.id)}>{c.name}</div>
                  <div style={{fontSize:14, color:'#888', marginBottom:10}}>تاريخ الإنشاء: {new Date(c.createdAt).toLocaleString('ar-EG')}</div>
                  <div style={{fontSize:15, color:theme.accent2, marginBottom:8}}>عدد المراحل: {c.stages.length}</div>
                  {!!(c.tags && c.tags.length) && (
                    <div style={{display:'flex', flexWrap:'wrap', gap:6, marginTop:6}}>
                      {c.tags.map((t, i) => (
                        <span key={i} style={{background:'#eef2ff', color:'#4338ca', border:`1px solid ${theme.border}`, borderRadius:6, padding:'2px 6px', fontSize:12}}>#{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8 }}>
                  <button onClick={e => { e.stopPropagation(); const stages = (c.stages||[]).map(s => ({ title: STAGES[s.stageIndex], content: s.output })); exportResultsToPDF(stages, { caseName: c.name }); }} className="btn btn-danger">PDF</button>
                  <button onClick={e => { e.stopPropagation(); const stages = (c.stages||[]).map(s => ({ title: STAGES[s.stageIndex], content: s.output })); exportResultsToDocx(stages, { caseName: c.name }); }} className="btn btn-info">Word</button>
                  <button onClick={e => {e.stopPropagation(); handleDeleteCase(c.id);}} className="btn btn-danger" style={{ background: '#ff6b6b' }}>حذف</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* فاصل سفلي وfooter */}
        <div style={{height:40}}></div>
        <footer style={{ textAlign: 'center', color: '#888', marginTop: 32, fontSize: 15, borderTop:`1.5px solid ${theme.border}`, paddingTop:18 }}>
          &copy; {new Date().getFullYear()} منصة التحليل القانوني الذكي
        </footer>
      </main>
        </>
      )}
    </div>
  );
}

function TagEditor({ c, setCases, theme }: { c: Case, setCases: React.Dispatch<React.SetStateAction<Case[]>>, theme: typeof lightTheme }) {
  const [tagInput, setTagInput] = useState('');
  const tags = c.tags || [];

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    setCases(prev => prev.map(cc => cc.id === c.id ? { ...cc, tags: Array.from(new Set([...(cc.tags || []), t])) } : cc));
    setTagInput('');
  };

  const removeTag = (t: string) => {
    setCases(prev => prev.map(cc => cc.id === c.id ? { ...cc, tags: (cc.tags || []).filter(x => x !== t) } : cc));
  };

  return (
    <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
      {tags.map((t, i) => (
        <span key={i} style={{display:'inline-flex', alignItems:'center', gap:6, background:'#eef2ff', color:'#4338ca', border:`1px solid ${theme.border}`, borderRadius:16, padding:'2px 8px', fontSize:12}}>
          #{t}
          <button onClick={() => removeTag(t)} aria-label={`حذف الوسم ${t}`} style={{background:'transparent', border:'none', color:'#ef4444', cursor:'pointer'}}>×</button>
        </span>
      ))}
      <input
        type="text"
        value={tagInput}
        onChange={e => setTagInput(e.target.value)}
        placeholder="أضف وسمًا"
        style={{borderRadius:8, border:`1.5px solid ${theme.accent2}`, padding:'6px 10px', fontSize:13, outline:'none'}}
      />
      <button onClick={addTag} disabled={!tagInput.trim()} style={{background: theme.accent2, color:'#fff', border:'none', borderRadius:8, padding:'6px 10px', fontWeight:700, fontSize:13, cursor: !tagInput.trim() ? 'not-allowed':'pointer'}}>إضافة</button>
    </div>
  );
}

function ChatBox({ caseObj, setCases, theme, darkMode }: { caseObj: Case, setCases: React.Dispatch<React.SetStateAction<Case[]>>, theme: typeof lightTheme, darkMode: boolean }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [localApiKey, setLocalApiKey] = useState('');
  useEffect(() => {
    loadApiKey().then(val => setLocalApiKey(val || ''));
  }, []);
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!input.trim()) return;
    if (!localApiKey) { setError('يرجى إدخال مفتاح Gemini API في الصفحة الرئيسية أولاً.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, stageIndex: 0, apiKey: localApiKey }),
      });
      const data = await res.json();
      if (res.ok) {
        const newMsg = {
          id: Math.random().toString(36).slice(2),
          question: input,
          answer: data.analysis,
          date: new Date().toISOString(),
        };
        setCases((prev: Case[]) => prev.map((c: Case) => c.id === caseObj.id ? { ...c, chats: [...(c.chats||[]), newMsg] } : c));
        setInput('');
      } else {
        setError(data.error || 'حدث خطأ أثناء التحليل');
      }
    } catch {
      setError('تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{marginTop:18, background:darkMode?'#181a2a':'#f5f7ff', borderRadius:12, border:`1px solid ${theme.border}`, padding:14}}>
      <div style={{fontWeight:700, color:theme.accent, marginBottom:8, fontSize:16}}>💬 تحدث مع مخرجات القضية</div>
      <form onSubmit={handleSend} style={{display:'flex', gap:8, marginBottom:10}}>
        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="اكتب سؤالك أو استفسارك..." style={{flex:1, borderRadius:8, border:`1.5px solid ${theme.accent2}`, padding:10, fontSize:15, outline:'none', background:darkMode?'#232946':'#fff', color:theme.text}} disabled={loading} />
        <button type="submit" disabled={loading || !input.trim()} style={{background:theme.accent2, color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontWeight:700, fontSize:15, cursor:loading?'not-allowed':'pointer'}}>إرسال</button>
      </form>
      {error && <div style={{color:'#ff6b6b', fontWeight:700, marginBottom:8}}>{error}</div>}
      <div style={{display:'flex', flexDirection:'column', gap:10, marginTop:8}}>
        {(caseObj.chats||[]).length === 0 && <div style={{color:'#888', fontSize:14}}>لا توجد محادثات بعد.</div>}
        {(caseObj.chats||[]).map((msg: ChatMessage) => (
          <div key={msg.id} style={{background:darkMode?'#232946':'#fff', borderRadius:8, border:`1px solid ${theme.accent2}22`, padding:10}}>
            <div style={{fontWeight:700, color:theme.accent2, marginBottom:4, fontSize:15}}>سؤالك:</div>
            <div style={{marginBottom:6, fontSize:15}}>{msg.question}</div>
            <div style={{fontWeight:700, color:theme.accent, marginBottom:4, fontSize:15}}>الرد:</div>
            <div style={{fontSize:15, whiteSpace:'pre-line'}}>{msg.answer}</div>
            <div style={{fontSize:12, color:'#888', marginTop:4}}>بتاريخ: {new Date(msg.date).toLocaleString('ar-EG')}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 