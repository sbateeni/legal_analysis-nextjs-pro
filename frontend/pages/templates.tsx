import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { isMobile } from '@utils/crypto';
import { getAllTemplates, addTemplate, updateTemplate, deleteTemplate, getAllCases, LegalTemplate, LegalCase, AnalysisStage } from '@utils/db';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export default function TemplatesPage() {
  const { theme } = useTheme();
  const [templates, setTemplates] = useState<LegalTemplate[]>([]);
  const [name, setName] = useState('قالب جديد');
  const [content, setContent] = useState('عنوان: {{caseName}}\n\nملخص المراحل:\n{{stageSummaries}}');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');

  useEffect(() => {
    getAllTemplates().then(setTemplates);
    getAllCases().then(setCases);
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) return;
    const now = new Date().toISOString();
    if (selectedId) {
      const updated: LegalTemplate = { id: selectedId, name, content, createdAt: now, updatedAt: now };
      await updateTemplate(updated);
      setTemplates(await getAllTemplates());
    } else {
      const t: LegalTemplate = { id: Math.random().toString(36).slice(2), name, content, createdAt: now, updatedAt: now };
      await addTemplate(t);
      setTemplates(await getAllTemplates());
    }
    setSelectedId(null);
  };

  const handleEdit = (t: LegalTemplate) => {
    setSelectedId(t.id);
    setName(t.name);
    setContent(t.content);
  };

  const handleDelete = async (id: string) => {
    await deleteTemplate(id);
    setTemplates(await getAllTemplates());
  };

  const generateFilled = (t: LegalTemplate) => {
    const c = cases.find((x: LegalCase) => x.id === selectedCaseId);
    if (!c) return t.content;
    const stageSummaries = (c.stages || []).map((s: AnalysisStage, i: number) => `المرحلة ${i + 1}: ${s.stage}\n${s.output}`).join('\n\n');
    return t.content
      .replace(/{{caseName}}/g, c.name)
      .replace(/{{stageSummaries}}/g, stageSummaries);
  };

  const exportTemplateAsDocx = async (t: LegalTemplate) => {
    const filled = generateFilled(t);
    const paragraphs = filled.split(/\n+/).map(line => line.trim()).filter(Boolean).map(line => new Paragraph({ children: [new TextRun({ text: line })] }));
    const doc = new Document({ sections: [{ children: [ new Paragraph({ text: t.name, heading: HeadingLevel.HEADING_2 }), ...paragraphs ] }] });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${t.name}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ fontFamily:'Tajawal, Arial, sans-serif', direction:'rtl', minHeight:'100vh', background: theme.background, color: theme.text }}>
      <main style={{ maxWidth: 960, margin: '0 auto', padding: isMobile()? '1rem 0.5rem' : '2rem 1rem' }}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:16}}>
          <span style={{fontSize: isMobile()? 28:32}}>🧾</span>
          <h1 style={{margin:0, color: theme.accent}}>قوالب المرافعات</h1>
        </div>

        <div style={{ background: theme.card, borderRadius: 12, border:`1.5px solid ${theme.border}`, boxShadow: `0 2px 12px ${theme.shadow}`, padding: isMobile()? 12:18, marginBottom: 16 }}>
          <div style={{display:'grid', gridTemplateColumns: isMobile()? '1fr' : '1fr 1fr', gap:12}}>
            <div>
              <label style={{display:'block', fontWeight:700, color: theme.accent2, marginBottom:6}}>اسم القالب</label>
              <input value={name} onChange={e => setName(e.target.value)} style={{width:'100%', border:`1.5px solid ${theme.input}`, borderRadius:10, padding:10}} />
            </div>
            <div>
              <label style={{display:'block', fontWeight:700, color: theme.accent2, marginBottom:6}}>اختر قضية للتعبئة</label>
              <select value={selectedCaseId} onChange={e => setSelectedCaseId(e.target.value)} style={{width:'100%', border:`1.5px solid ${theme.input}`, borderRadius:10, padding:10}}>
                <option value="">— بدون —</option>
                {cases.map((c: LegalCase) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <label style={{display:'block', fontWeight:700, color: theme.accent2, margin:'10px 0 6px'}}>محتوى القالب</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={isMobile()? 10:14} style={{width:'100%', border:`1.5px solid ${theme.input}`, borderRadius:10, padding:10, fontFamily:'Tajawal, Arial, sans-serif'}} />
          <div style={{display:'flex', gap:10, flexWrap:'wrap', marginTop:10}}>
            <button onClick={handleSave} style={{background: theme.accent2, color:'#fff', border:'none', borderRadius:8, padding:'8px 14px', fontWeight:800}}>حفظ القالب</button>
            <div style={{color:'#666', fontSize:13}}>المتغيرات المتاحة: {'{{caseName}}'}, {'{{stageSummaries}}'}</div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns: isMobile()? '1fr' : '1fr 1fr', gap:12 }}>
          {templates.map(t => (
            <div key={t.id} style={{ background: theme.card, borderRadius: 12, border:`1.5px solid ${theme.border}`, boxShadow: `0 2px 12px ${theme.shadow}`, padding: 12 }}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, flexWrap:'wrap'}}>
                <div style={{fontWeight:800, color: theme.accent}}>{t.name}</div>
                <div style={{display:'flex', gap:8}}>
                  <button onClick={() => handleEdit(t)} style={{background: theme.accent2, color:'#fff', border:'none', borderRadius:8, padding:'6px 10px', fontWeight:700}}>تعديل</button>
                  <button onClick={() => exportTemplateAsDocx(t)} style={{background: '#0ea5e9', color:'#fff', border:'none', borderRadius:8, padding:'6px 10px', fontWeight:700}}>تصدير Word</button>
                  <button onClick={() => handleDelete(t.id)} style={{background: '#ef4444', color:'#fff', border:'none', borderRadius:8, padding:'6px 10px', fontWeight:700}}>حذف</button>
                </div>
              </div>
              <div style={{whiteSpace:'pre-wrap', color:'#555', marginTop:8}}>{generateFilled(t)}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 