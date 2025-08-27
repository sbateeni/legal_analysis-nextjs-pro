import { useState, useRef, useEffect } from 'react';
import { isMobile } from '../utils/crypto';
import { useTheme } from '../contexts/ThemeContext';
import { getAllCases, LegalCase, loadApiKey } from '../utils/db';
import { loadAppSettings } from '../utils/appSettings';
import { Button } from '../components/UI';
import { extractApiError, mapApiErrorToMessage } from '../utils/errors';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  suggestions?: string[];
  nextSteps?: string[];
  confidence?: number;
}

export default function ChatPage() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const controllerRef = useRef<AbortController | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const [preferredModel, setPreferredModel] = useState<string>('gemini-1.5-flash');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const CHAT_STORAGE_KEY_PREFIX = 'legal_chat_';
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // تحميل API Key من قاعدة البيانات الموحدة
    loadApiKey().then((key) => {
      if (key) setApiKey(key);
    });
    // تحميل القضايا المحفوظة
    getAllCases().then((dbCases) => {
      setCases(dbCases || []);
    });
    // تحميل نموذج مفضّل
    loadAppSettings().then(s => setPreferredModel(s.preferredModel || 'gemini-1.5-flash'));

    // معالجة تثبيت التطبيق كتطبيق أيقونة
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // التحقق من وجود التطبيق مثبت
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // عرض نافذة التثبيت
    deferredPrompt.prompt();

    // انتظار اختيار المستخدم
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('تم قبول تثبيت التطبيق');
      setShowInstallButton(false);
    } else {
      console.log('تم رفض تثبيت التطبيق');
    }

    setDeferredPrompt(null);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages when switching case (or first mount)
  useEffect(() => {
    const key = `${CHAT_STORAGE_KEY_PREFIX}${selectedCaseId || 'general'}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed)) setMessages(parsed);
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
  }, [selectedCaseId]);

  // Persist messages per selected case
  useEffect(() => {
    const key = `${CHAT_STORAGE_KEY_PREFIX}${selectedCaseId || 'general'}`;
    try {
      localStorage.setItem(key, JSON.stringify(messages));
    } catch {
      // ignore storage errors
    }
  }, [messages, selectedCaseId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const buildCaseContext = () => {
    const selected = cases.find(c => c.id === selectedCaseId);
    if (!selected) return undefined;
    const sortedStages = [...selected.stages].sort((a, b) => a.stageIndex - b.stageIndex);
    const previousAnalysis = sortedStages
      .map(s => `مرحلة ${s.stageIndex + 1}: ${s.stage}\n${s.output}`)
      .join('\n\n');
    const MAX_CHARS = 20000;
    const trimmed = previousAnalysis.length > MAX_CHARS ? previousAnalysis.slice(-MAX_CHARS) : previousAnalysis;
    return {
      caseType: selected.name,
      currentStage: sortedStages.length,
      previousAnalysis: trimmed,
    };
  };

  const sendMessage = async (overrideMessage?: string) => {
    const messageToSend = (overrideMessage ?? inputMessage).trim();
    if (!messageToSend || !apiKey.trim()) {
      setError('يرجى إعداد مفتاح API من الإعدادات ثم إرسال الرسالة');
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setLastUserMessage(messageToSend);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      // إعداد الإيقاف
      if (controllerRef.current) {
        try { controllerRef.current.abort(); } catch {}
      }
      controllerRef.current = new AbortController();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-model': preferredModel,
        },
        body: JSON.stringify({
          message: messageToSend,
          apiKey: apiKey.trim(),
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          })),
          context: buildCaseContext()
        }),
        signal: controllerRef.current.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        const { code, message } = extractApiError(response, data);
        throw new Error(mapApiErrorToMessage(code, message));
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: data.timestamp,
        suggestions: data.suggestions,
        nextSteps: data.nextSteps,
        confidence: data.confidence
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'name' in err && (err as { name?: string }).name === 'AbortError') {
        setError('تم إيقاف الطلب');
      } else {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleStop = () => {
    try { controllerRef.current?.abort(); } catch {}
  };

  const handleRegenerate = () => {
    if (lastUserMessage) {
      sendMessage(lastUserMessage);
    }
  };

  type StrategyPayload = {
    strategy_title?: string;
    strategy_steps?: string[];
    legal_basis?: Array<{ source: string; article?: string }>;
    tags?: string[];
  };

  const handleSaveStrategy = async () => {
    if (!apiKey) {
      setError('يرجى إعداد مفتاح API أولاً');
      return;
    }
    if (!messages.length) {
      setError('لا توجد محادثة لحفظها');
      return;
    }
    try {
      setSaving(true);
      const summaryPrompt = 'لخص الاستراتيجية القانونية بشكل مجرد دون أي أسماء أو بيانات شخصية: عنوان مختصر للخطة + 4-6 خطوات + أساس قانوني (مصادر/مواد إن أمكن) + وسوم. أعد فقط JSON بالمفاتيح: strategy_title, strategy_steps[], legal_basis[{source, article}], tags[]';
      await sendMessage(summaryPrompt);
      setTimeout(async () => {
        const last = messages[messages.length - 1];
        if (!last || last.role !== 'assistant') { setSaving(false); return; }
        let payload: StrategyPayload | null = null;
        try { payload = JSON.parse(last.content) as StrategyPayload; } catch {}
        const record = {
          id: `kb-${Date.now()}`,
          topic: (payload?.strategy_title) || 'خطة قانونية من المحادثة',
          jurisdiction: 'PS',
          strategy_title: (payload?.strategy_title) || 'خطة قانونية',
          strategy_steps: (payload?.strategy_steps) || ['خطوة 1','خطوة 2'],
          legal_basis: (payload?.legal_basis) || [],
          patterns: [],
          risk_notes: [],
          citations: [],
          tags: (payload?.tags) || ['محادثة','استراتيجية'],
          reviewed: false,
          createdAt: new Date().toISOString(),
        };
        await fetch('/api/legal-kb', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record) });
        setSaving(false);
      }, 1200);
    } catch {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (typeof index === 'number') {
        setCopiedMessageIndex(index);
        setTimeout(() => setCopiedMessageIndex(null), 1500);
      }
    } catch {}
  };

  const copyTranscript = () => {
    const transcript = messages.map(m => `${m.role === 'user' ? 'المستخدم' : 'المساعد'}: ${m.content}`).join('\n\n');
    copyToClipboard(transcript);
  };

  const clearChat = () => {
    if (messages.length === 0) return;
    
    const caseName = selectedCaseId ? cases.find(c => c.id === selectedCaseId)?.name : 'العامة';
    const confirmMessage = `هل أنت متأكد من حذف المحادثة الحالية حول "${caseName}"؟\n\nهذا الإجراء سيحذف ${messages.length} رسالة ولا يمكن التراجع عنه.`;
    
    if (window.confirm(confirmMessage)) {
      setMessages([]);
      setLastUserMessage('');
      setCopiedMessageIndex(null);
      
      // حذف المحادثة من التخزين المحلي
      const key = `${CHAT_STORAGE_KEY_PREFIX}${selectedCaseId || 'general'}`;
      try {
        localStorage.removeItem(key);
      } catch {
        // تجاهل أخطاء التخزين
      }
    }
  };

  const autoResizeInput = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const max = isMobile() ? 300 : 240;
    const next = Math.min(max, el.scrollHeight);
    el.style.height = `${next}px`;
  };

  useEffect(() => {
    autoResizeInput();
  }, [inputMessage, isLoading]);

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.background,
      color: theme.text,
      fontFamily: 'Tajawal, Arial, sans-serif'
    }}>
      {/* زر تحميل التطبيق - فقط على الهاتف */}
      {mounted && isMobile() && showInstallButton && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 1000,
          background: theme.accent,
          color: 'white',
          padding: '12px 20px',
          borderRadius: '25px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transition: 'all 0.3s ease',
          border: 'none',
          outline: 'none'
        }}
        onClick={handleInstallClick}
        onTouchStart={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)';
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        >
          📱 تثبيت التطبيق
        </div>
      )}

      {/* بطاقة تذكير إعداد المفتاح + اختيار القضية */}
      <div style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: isMobile() ? '1rem 0.5rem' : '2rem 1rem'
      }}>
        <div className="card-ui" style={{ background: theme.card, borderColor: theme.border, padding: isMobile() ? 16 : 24, marginBottom: 16 }}>
          {!apiKey && (
            <div style={{
              background: '#fffbe6',
              color: '#b7791f',
              border: '1px solid #f6ad55',
              borderRadius: 12,
              padding: '10px 12px',
              marginBottom: 12,
              textAlign: 'center',
              fontWeight: 700
            }}>
              لم يتم إعداد مفتاح API بعد. انتقل إلى صفحة الإعدادات لإعداده.
            </div>
          )}
          <div style={{display:'grid', gridTemplateColumns: isMobile()? '1fr' : '1fr 1fr', gap: 12}}>
            <div>
              <label style={{display:'block', marginBottom:6, fontWeight:700, color: theme.accent2}}>اختر قضية (اختياري)</label>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                style={{
                  width: '100%',
                  padding: isMobile()? 12:14,
                  border: `1.5px solid ${theme.input}`,
                  borderRadius: 12,
                  fontSize: isMobile()? 15:16,
                  background: 'white',
                  outline: 'none'
                }}
              >
                <option value="">بدون قضية محددة</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* بطاقة المحادثة */}
        <div className="card-ui" style={{ background: theme.card, borderColor: theme.border, padding: 0, overflow: 'hidden' }}>
          <div style={{padding: isMobile()? 14:18, borderBottom: `1px solid ${theme.border}`, background: 'rgba(99,102,241,0.06)'}}>
            <div style={{display:'flex', alignItems:'center', gap:10, justifyContent:'space-between', flexWrap:'wrap'}}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{fontSize: isMobile()? 22:26}}>🤖</span>
                <h2 style={{margin:0, color: theme.accent, fontSize: isMobile()? 18:20}}>المساعد القانوني الفلسطيني</h2>
              </div>
              {selectedCaseId && (
                <div style={{fontSize: isMobile()? 12:13, color: theme.accent2}}>
                  المحادثة حول: <b>{cases.find(c => c.id === selectedCaseId)?.name}</b>
                  <br />
                  <small style={{color: '#6b7280'}}>
                    {cases.find(c => c.id === selectedCaseId)?.stages?.length || 0} مرحلة محللة
                  </small>
                </div>
              )}
              <div style={{display:'flex', gap:8, flexWrap: 'wrap'}}>
                <Button onClick={copyTranscript} ariaLabel="نسخ المحادثة كاملة" variant="info" style={{ background: '#0ea5e9' }}>نسخ المحادثة</Button>
                <Button onClick={handleSaveStrategy} disabled={saving || !messages.length} ariaLabel="حفظ كاستراتيجية" variant="success" style={{ background: saving || !messages.length ? '#9ca3af' : '#10b981', cursor: saving || !messages.length ? 'not-allowed' : 'pointer' }}>{saving ? '⏳' : '💾 حفظ كاستراتيجية'}</Button>
                <Button onClick={clearChat} disabled={messages.length === 0} ariaLabel="حذف المحادثة" variant="danger" style={{ background: messages.length === 0 ? '#9ca3af' : '#ef4444', cursor: messages.length === 0 ? 'not-allowed' : 'pointer' }}>
                  🗑️ حذف المحادثة {messages.length > 0 && `(${messages.length})`}
                </Button>
              </div>
            </div>
            <div style={{marginTop:6, color:'#6b7280', fontSize: isMobile()? 13:14}}>اسأل ضمن الإطار القانوني الفلسطيني لتحصل على إجابات مبنية على القوانين والأنظمة الفلسطينية</div>
          </div>

          {/* Messages Container داخل البطاقة */}
          <div style={{
            padding: isMobile()? 12:16,
            maxHeight: isMobile() ? '50vh' : '60vh',
            overflowY: 'auto'
          }}>
            {messages.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                <h3>ابدأ المحادثة</h3>
                <p>اسأل أي سؤال قانوني وسأجيبك بذكاء</p>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} style={{
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '1rem',
                  borderRadius: '1rem',
                  background: message.role === 'user' ? theme.accent2 : 'white',
                  color: message.role === 'user' ? 'white' : '#1f2937',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: message.role === 'assistant' ? `1px solid ${theme.border}` : 'none'
                }}>
                  {message.role === 'assistant' ? (
                    <>
                      <div style={{ fontWeight: 800, color: theme.accent, marginBottom: 6 }}>الإجابة:</div>
                      {/* حاول إبراز JSON ككتلة منفصلة إن وجد */}
                      {(() => {
                        try {
                          const fenced = message.content.match(/```json\n([\s\S]*?)\n```/i);
                          const plain = fenced ? fenced[1] : message.content;
                          const parsed = JSON.parse(plain);
                          return (
                            <div style={{
                              background: '#f8fafc',
                              border: `1px solid ${theme.border}`,
                              borderRadius: 8,
                              padding: 12,
                              marginBottom: 8,
                              direction: 'ltr',
                              textAlign: 'left',
                              overflowX: 'auto',
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                              fontSize: 13
                            }}>
                              {JSON.stringify(parsed, null, 2)}
                            </div>
                          );
                        } catch {
                          return <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{message.content}</div>;
                        }
                      })()}
                      <div style={{marginTop:8, display:'flex', gap:8, alignItems:'center'}}>
                        <button onClick={() => copyToClipboard(message.content, index)} aria-label="نسخ إجابة المساعد" style={{background:'#eef2ff', border:`1px solid ${theme.border}`, borderRadius:6, padding:'4px 8px', cursor:'pointer', color:'#4338ca'}}>نسخ</button>
                        {copiedMessageIndex === index && <span style={{fontSize:12, color:'#10b981'}}>تم النسخ</span>}
                      </div>
                    </>
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
                  )}
                  
                  {/* Suggestions */}
                  {message.role === 'assistant' && message.suggestions && message.suggestions.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ fontSize: '0.95rem', marginBottom: '0.25rem', fontWeight: 700, color: theme.accent2 }}>
                        اقتراحات:
                      </div>
                      <ul style={{ margin: 0, paddingRight: 18 }}>
                        {message.suggestions.map((suggestion, idx) => (
                          <li key={idx} style={{ marginBottom: 6 }}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Next Steps */}
                  {message.role === 'assistant' && message.nextSteps && message.nextSteps.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ fontSize: '0.95rem', marginBottom: '0.25rem', fontWeight: 700, color: theme.accent2 }}>
                        الخطوات التالية:
                      </div>
                      <ol style={{ margin: 0, paddingRight: 18 }}>
                        {message.nextSteps.map((step, idx) => (
                          <li key={idx} style={{ marginBottom: 6 }}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Confidence Level */}
                  {message.role === 'assistant' && message.confidence && (
                    <div style={{
                      marginTop: '0.5rem',
                      fontSize: '0.8rem',
                      opacity: 0.7,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <span>مستوى الثقة:</span>
                      <div style={{
                        width: '60px',
                        height: '4px',
                        background: '#e5e7eb',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${message.confidence * 100}%`,
                          height: '100%',
                          background: message.confidence > 0.8 ? '#10b981' : 
                                           message.confidence > 0.6 ? '#f59e0b' : '#ef4444'
                        }} />
                      </div>
                      <span>{Math.round(message.confidence * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div style={{
                  padding: '1rem',
                  borderRadius: '1rem',
                  background: 'white',
                  border: `1px solid ${theme.border}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid #e5e7eb',
                      borderTop: '2px solid #6366f1',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <span>جاري الكتابة...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />

            {/* Error Display داخل البطاقة */}
            {error && (
              <div style={{
                padding: '1rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                borderRadius: '0.5rem'
              }}>
                ❌ {error}
              </div>
            )}
          </div>

          {/* Input Area داخل البطاقة */}
          <div style={{
            padding: isMobile()? 12:16,
            background: theme.card,
            borderTop: `1px solid ${theme.border}`
          }}>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: isMobile()? 'stretch' : 'flex-end',
              flexDirection: isMobile()? 'column' : 'row'
            }}>
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => { setInputMessage(e.target.value); requestAnimationFrame(autoResizeInput); }}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك هنا..."
                disabled={isLoading}
                aria-label="حقل إدخال رسالة المحادثة"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  resize: 'none',
                  minHeight: '44px',
                  maxHeight: isMobile()? '300px' : '240px',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Button onClick={handleStop} disabled={!isLoading} ariaLabel="إيقاف الطلب الجاري" variant="danger" style={{ background: isLoading ? '#ef4444' : '#9ca3af', cursor: !isLoading ? 'not-allowed' : 'pointer' }}>⏹️</Button>
                <Button onClick={() => sendMessage()} disabled={isLoading || !inputMessage.trim()} ariaLabel="إرسال الرسالة" variant="info" style={{ background: isLoading || !inputMessage.trim() ? '#9ca3af' : theme.accent2, cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer' }}>{isLoading ? '⏳' : '📤'}</Button>
                <Button onClick={handleRegenerate} disabled={isLoading || !lastUserMessage} ariaLabel="إعادة توليد آخر إجابة" variant="success" style={{ background: isLoading || !lastUserMessage ? '#9ca3af' : '#10b981', cursor: isLoading || !lastUserMessage ? 'not-allowed' : 'pointer' }}>🔁</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 