import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { CommentRecord, TaskRecord } from '../utils/db.types';
import type { UnifiedCase } from '../utils/db.bridge';
import type { Theme } from '../utils/theme';

type PanelProps = {
  caseName: string;
  caseType: string;
  theme: Theme;
  darkMode?: boolean;
  stageName?: string | null;
};

export default function CollabPanel({ caseName, caseType, theme, darkMode, stageName }: PanelProps) {
  const [initialized, setInitialized] = useState(false);
  type BridgeAPI = {
    init: () => Promise<void>;
    listCases: (filters?: { caseType?: string; status?: string; limit?: number; offset?: number }) => Promise<UnifiedCase[]>;
    createCase: (caseData: { name: string; caseType: string; complexity: 'basic'|'intermediate'|'advanced'; status: 'active'|'archived'|'completed'; description?: string; tags?: string }) => Promise<string>;
    listComments: (caseId: string, stageId?: string) => Promise<CommentRecord[]>;
    listTasks: (caseId: string, filters?: { stageId?: string; status?: TaskRecord['status']; assignee?: string }) => Promise<TaskRecord[]>;
    createComment: (comment: Omit<CommentRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
    createTask: (task: Omit<TaskRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
    updateTask: (id: string, updates: Partial<TaskRecord>, meta: { caseId: string }) => Promise<void>;
    deleteTask: (id: string, meta: { caseId: string }) => Promise<void>;
  };
  const bridgeRef = useRef<BridgeAPI | null>(null);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [filters, setFilters] = useState<{ status?: TaskRecord['status'] | 'all'; assignee?: string; priority?: TaskRecord['priority'] | 'all'; dueFrom?: string; dueTo?: string; q?: string }>({ status: 'all', priority: 'all' });
  const [newComment, setNewComment] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);

  const panelStyle: React.CSSProperties = useMemo(() => ({
    background: theme.card,
    borderRadius: 16,
    boxShadow: `0 4px 20px ${theme.shadow}`,
    padding: 16,
    border: `1.5px solid ${theme.border}`,
  }), [theme]);

  useEffect(() => {
    (async () => {
      if (typeof window === 'undefined') return;
      try {
        const mod = await import('../utils/db.bridge');
        bridgeRef.current = mod.dbBridge as BridgeAPI;
        await bridgeRef.current!.init();
        setInitialized(true);
      } catch {
        // noop
      }
    })();
  }, []);

  // Ensure case exists in SQLite, return id
  useEffect(() => {
    if (!initialized) return;
    (async () => {
      const effectiveName = (caseName && caseName.trim()) ? caseName.trim() : 'قضية بدون اسم';
      // Try to find by listing and matching name
      const cases = await bridgeRef.current!.listCases();
      const existing = (cases || []).find((c: UnifiedCase) => c.name === effectiveName);
      if (existing) {
        setCaseId(existing.id);
        return;
      }
      // Create minimal case
      const id = await bridgeRef.current!.createCase({
        name: effectiveName,
        caseType: caseType || 'عام',
        complexity: 'basic',
        status: 'active',
        description: 'Created by collaboration panel',
        tags: 'collab'
      });
      setCaseId(id);
    })();
  }, [initialized, caseName, caseType]);

  // Load comments and tasks
  const loadData = async (cid: string) => {
    const stg = stageName || undefined;
    const [cmts, tks] = await Promise.all([
      bridgeRef.current!.listComments(cid, stg),
      bridgeRef.current!.listTasks(cid, { stageId: stg, status: (filters.status && filters.status !== 'all') ? filters.status as TaskRecord['status'] : undefined, assignee: filters.assignee || undefined })
    ]);
    setComments(cmts);
    setTasks(tks);
  };

  useEffect(() => {
    if (!caseId) return;
    loadData(caseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, stageName]);

  const addComment = async () => {
    if (!caseId || !newComment.trim()) return;
    setLoading(true);
    try {
      await bridgeRef.current!.createComment({
        caseId,
        stageId: stageName || undefined,
        author: 'أنا',
        content: newComment.trim(),
        parentId: undefined,
      });
      setNewComment('');
      await loadData(caseId);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!caseId || !newTaskTitle.trim()) return;
    setLoading(true);
    try {
      await bridgeRef.current!.createTask({
        caseId,
        stageId: stageName || undefined,
        title: newTaskTitle.trim(),
        dueDate: newTaskDue || undefined,
        status: 'open',
        priority: newTaskPriority
      });
      setNewTaskTitle('');
      setNewTaskDue('');
      setNewTaskPriority('medium');
      await loadData(caseId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={panelStyle}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12 }}>
        <div style={{ fontWeight: 800, color: theme.accent, display:'flex', alignItems:'center', gap:8 }}>
          <span>🤝</span>
          لوحة التعاون (تعليقات ومهام)
        </div>
        <button onClick={() => { if (caseId) { loadData(caseId); } }} style={{
          background: 'transparent', color: theme.text, border: `1.5px solid ${theme.input}`, borderRadius: 10,
          padding: '6px 10px', cursor: 'pointer', fontWeight: 700
        }}>تحديث</button>
      </div>

      {/* التعليقات */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, color: theme.accent2, marginBottom: 8 }}>💬 التعليقات</div>
        <div style={{ display:'flex', gap:8, alignItems:'stretch', marginBottom: 10 }}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="أضف تعليقًا..."
            style={{ flex:1, border:`2px solid ${theme.input}`, borderRadius: 12, padding: 10, background: darkMode ? '#181a2a' : '#fff', color: theme.text }}
          />
          <button onClick={addComment} disabled={loading || !newComment.trim()} style={{
            background: 'transparent', color: theme.text, border: `1.5px solid ${theme.input}`, borderRadius: 10,
            padding: '6px 10px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: (!newComment.trim() || loading) ? 0.6 : 1
          }}>إضافة</button>
        </div>
        {comments.length === 0 ? (
          <div style={{ fontSize: 13, opacity: 0.8, color: theme.text }}>لا توجد تعليقات بعد.</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {comments.map((c) => (
              <div key={c.id} style={{ background: theme.resultBg, border:`1px solid ${theme.border}`, borderRadius: 12, padding: 10 }}>
                <div style={{ fontSize: 12, color: theme.accent2, marginBottom: 4 }}>{new Date(c.createdAt).toLocaleString('ar-SA')} • {c.author || 'مستخدم'}</div>
                <div style={{ color: theme.text }}>{c.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* المهام */}
      <div>
        <div style={{ fontWeight: 700, color: theme.accent2, marginBottom: 8 }}>✅ المهام</div>
        {/* فلاتر متقدمة */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:8, marginBottom:10 }}>
          <select value={filters.status || 'all'} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as TaskRecord['status'] | 'all' }))} style={{ border:`1.5px solid ${theme.input}`, borderRadius: 10, padding: 8, background: darkMode ? '#181a2a' : '#fff', color: theme.text }}>
            <option value="all">كل الحالات</option>
            <option value="open">مفتوحة</option>
            <option value="in_progress">قيد التنفيذ</option>
            <option value="done">مكتملة</option>
          </select>
          <select value={filters.priority || 'all'} onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as TaskRecord['priority'] | 'all' }))} style={{ border:`1.5px solid ${theme.input}`, borderRadius: 10, padding: 8, background: darkMode ? '#181a2a' : '#fff', color: theme.text }}>
            <option value="all">كل الأولويات</option>
            <option value="low">منخفضة</option>
            <option value="medium">متوسطة</option>
            <option value="high">مرتفعة</option>
          </select>
          <input type="text" value={filters.assignee || ''} onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))} placeholder="المسؤول" style={{ border:`1.5px solid ${theme.input}`, borderRadius: 10, padding: 8, background: darkMode ? '#181a2a' : '#fff', color: theme.text }} />
          <input type="date" value={filters.dueFrom || ''} onChange={(e) => setFilters(prev => ({ ...prev, dueFrom: e.target.value }))} style={{ border:`1.5px solid ${theme.input}`, borderRadius: 10, padding: 8, background: darkMode ? '#181a2a' : '#fff', color: theme.text }} />
          <input type="date" value={filters.dueTo || ''} onChange={(e) => setFilters(prev => ({ ...prev, dueTo: e.target.value }))} style={{ border:`1.5px solid ${theme.input}`, borderRadius: 10, padding: 8, background: darkMode ? '#181a2a' : '#fff', color: theme.text }} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:8, marginBottom:10 }}>
          <input type="text" value={filters.q || ''} onChange={(e) => setFilters(prev => ({ ...prev, q: e.target.value }))} placeholder="🔍 بحث في العنوان" style={{ border:`1.5px solid ${theme.input}`, borderRadius: 10, padding: 8, background: darkMode ? '#181a2a' : '#fff', color: theme.text }} />
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <button onClick={() => { if (caseId) { loadData(caseId); } }} style={{ background:'transparent', border:`1.5px solid ${theme.input}`, color: theme.text, borderRadius:10, padding:'6px 10px', fontWeight:700, cursor:'pointer' }}>تطبيق الفلاتر</button>
            <button onClick={() => { setFilters({ status:'all', priority:'all' }); if (caseId) { loadData(caseId); } }} style={{ background:'transparent', border:`1.5px solid ${theme.input}`, color: theme.text, borderRadius:10, padding:'6px 10px', fontWeight:700, cursor:'pointer' }}>إعادة تعيين</button>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto', gap:8, alignItems:'center', marginBottom: 10 }}>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="عنوان المهمة"
            style={{ border:`2px solid ${theme.input}`, borderRadius: 12, padding: 10, background: darkMode ? '#181a2a' : '#fff', color: theme.text }}
          />
          <input
            type="date"
            value={newTaskDue}
            onChange={(e) => setNewTaskDue(e.target.value)}
            style={{ border:`2px solid ${theme.input}`, borderRadius: 12, padding: 10, background: darkMode ? '#181a2a' : '#fff', color: theme.text }}
          />
          <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value as 'low'|'medium'|'high')} style={{
            border:`2px solid ${theme.input}`, borderRadius: 12, padding: 10, background: darkMode ? '#181a2a' : '#fff', color: theme.text
          }}>
            <option value="low">منخفضة</option>
            <option value="medium">متوسطة</option>
            <option value="high">مرتفعة</option>
          </select>
          <button onClick={addTask} disabled={loading || !newTaskTitle.trim()} style={{
            background: 'transparent', color: theme.text, border: `1.5px solid ${theme.input}`, borderRadius: 10,
            padding: '6px 10px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: (!newTaskTitle.trim() || loading) ? 0.6 : 1
          }}>إضافة</button>
        </div>
        {tasks
          .filter(t => (filters.priority && filters.priority !== 'all') ? t.priority === filters.priority : true)
          .filter(t => (filters.dueFrom ? (t.dueDate ? new Date(t.dueDate).getTime() >= new Date(filters.dueFrom!).getTime() : false) : true))
          .filter(t => (filters.dueTo ? (t.dueDate ? new Date(t.dueDate).getTime() <= (new Date(filters.dueTo!).getTime() + 24*60*60*1000 - 1) : false) : true))
          .filter(t => (filters.q ? t.title.toLowerCase().includes(filters.q.toLowerCase()) : true))
          .length === 0 ? (
          <div style={{ fontSize: 13, opacity: 0.8, color: theme.text }}>لا توجد مهام بعد.</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {tasks
              .filter(t => (filters.priority && filters.priority !== 'all') ? t.priority === filters.priority : true)
              .filter(t => (filters.dueFrom ? (t.dueDate ? new Date(t.dueDate).getTime() >= new Date(filters.dueFrom!).getTime() : false) : true))
              .filter(t => (filters.dueTo ? (t.dueDate ? new Date(t.dueDate).getTime() <= (new Date(filters.dueTo!).getTime() + 24*60*60*1000 - 1) : false) : true))
              .filter(t => (filters.q ? t.title.toLowerCase().includes(filters.q.toLowerCase()) : true))
              .map((t) => (
              <div key={t.id} style={{ background: theme.resultBg, border:`1px solid ${theme.border}`, borderRadius: 12, padding: 10, display:'grid', gridTemplateColumns:'1fr auto auto', gap:8, alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: theme.text }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: theme.accent2 }}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString('ar-SA') : 'بدون موعد'}</div>
                </div>
                <div style={{ fontSize: 12, color: theme.text }}>
                  {t.status === 'done' ? 'مكتملة' : t.status === 'in_progress' ? 'قيد التنفيذ' : 'مفتوحة'} • {t.priority === 'high' ? 'مرتفعة' : t.priority === 'low' ? 'منخفضة' : 'متوسطة'}
                </div>
                <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                  <button onClick={async () => { await bridgeRef.current!.updateTask(t.id, { status: t.status === 'done' ? 'open' : 'done' }, { caseId: caseId! }); await loadData(caseId!); }} style={{
                    background: 'transparent', color: theme.text, border: `1.5px solid ${theme.input}`, borderRadius: 10, padding: '6px 10px', fontWeight: 700, cursor:'pointer'
                  }}>{t.status === 'done' ? 'إعادة فتح' : 'تم'}</button>
                  <button onClick={async () => { await bridgeRef.current!.deleteTask(t.id, { caseId: caseId! }); await loadData(caseId!); }} style={{
                    background: 'transparent', color: '#dc2626', border: `1.5px solid ${theme.input}`, borderRadius: 10, padding: '6px 10px', fontWeight: 700, cursor:'pointer'
                  }}>حذف</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


