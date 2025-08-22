import { useState, useRef, useEffect } from 'react';
import { isMobile } from '../utils/crypto';
import { useTheme } from '../contexts/ThemeContext';
import { getAllCases, LegalCase } from '../utils/db';

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

  useEffect(() => {
    // تحميل API Key من localStorage
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    // تحميل القضايا المحفوظة
    getAllCases().then((dbCases) => {
      setCases(dbCases || []);
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        throw new Error(data.message || 'حدث خطأ في الاتصال');
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

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleNextStepClick = (step: string) => {
    setInputMessage(`أخبرني المزيد عن: ${step}`);
  };

  const handleStop = () => {
    try { controllerRef.current?.abort(); } catch {}
  };

  const handleRegenerate = () => {
    if (lastUserMessage) {
      sendMessage(lastUserMessage);
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

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.background,
      color: theme.text,
      fontFamily: 'Tajawal, Arial, sans-serif'
    }}>
      {/* بطاقة تذكير إعداد المفتاح + اختيار القضية */}
      <div style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: isMobile() ? '1rem 0.5rem' : '2rem 1rem'
      }}>
        <div style={{
          background: theme.card,
          borderRadius: 16,
          boxShadow: `0 4px 20px ${theme.shadow}`,
          border: `1.5px solid ${theme.border}`,
          padding: isMobile() ? 16 : 24,
          marginBottom: 16
        }}>
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
        <div style={{
          background: theme.card,
          borderRadius: 16,
          boxShadow: `0 4px 20px ${theme.shadow}`,
          border: `1.5px solid ${theme.border}`,
          padding: 0,
          overflow: 'hidden'
        }}>
          <div style={{padding: isMobile()? 14:18, borderBottom: `1px solid ${theme.border}`, background: 'rgba(99,102,241,0.06)'}}>
            <div style={{display:'flex', alignItems:'center', gap:10, justifyContent:'space-between', flexWrap:'wrap'}}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{fontSize: isMobile()? 22:26}}>🤖</span>
                <h2 style={{margin:0, color: theme.accent, fontSize: isMobile()? 18:20}}>المساعد القانوني الفلسطيني</h2>
              </div>
              {selectedCaseId && (
                <div style={{fontSize: isMobile()? 12:13, color: theme.accent2}}>
                  المحادثة حول: <b>{cases.find(c => c.id === selectedCaseId)?.name}</b>
                </div>
              )}
              <div style={{display:'flex', gap:8}}>
                <button onClick={copyTranscript} aria-label="نسخ المحادثة كاملة" style={{background:'#f3f4f6', border:`1px solid ${theme.border}`, borderRadius:8, padding:'6px 10px', cursor:'pointer'}}>نسخ المحادثة</button>
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
                  <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
                  {message.role === 'assistant' && (
                    <div style={{marginTop:8, display:'flex', gap:8, alignItems:'center'}}>
                      <button onClick={() => copyToClipboard(message.content, index)} aria-label="نسخ إجابة المساعد" style={{background:'#eef2ff', border:`1px solid ${theme.border}`, borderRadius:6, padding:'4px 8px', cursor:'pointer', color:'#4338ca'}}>نسخ</button>
                      {copiedMessageIndex === index && <span style={{fontSize:12, color:'#10b981'}}>تم النسخ</span>}
                    </div>
                  )}
                  
                  {/* Suggestions */}
                  {message.role === 'assistant' && message.suggestions && message.suggestions.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.8 }}>
                        اقتراحات:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {message.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: '#f3f4f6',
                              border: `1px solid ${theme.border}`,
                              borderRadius: '0.25rem',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              color: '#374151'
                            }}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Steps */}
                  {message.role === 'assistant' && message.nextSteps && message.nextSteps.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.8 }}>
                        الخطوات التالية:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {message.nextSteps.map((step, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleNextStepClick(step)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: '#e0e7ff',
                              border: '1px solid #c7d2fe',
                              borderRadius: '0.25rem',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              color: '#4338ca',
                              textAlign: 'left'
                            }}
                          >
                            {step}
                          </button>
                        ))}
                      </div>
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
              alignItems: 'flex-end'
            }}>
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
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
                  maxHeight: '120px',
                  fontFamily: 'inherit'
                }}
              />
              <button
                onClick={handleStop}
                disabled={!isLoading}
                aria-label="إيقاف الطلب الجاري"
                style={{
                  padding: '0.75rem 1rem',
                  background: !isLoading ? '#9ca3af' : '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  cursor: !isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ⏹️
              </button>
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                aria-label="إرسال الرسالة"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: isLoading || !inputMessage.trim() ? '#9ca3af' : theme.accent2,
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {isLoading ? '⏳' : '📤'}
              </button>
              <button
                onClick={handleRegenerate}
                disabled={isLoading || !lastUserMessage}
                aria-label="إعادة توليد آخر إجابة"
                style={{
                  padding: '0.75rem 1rem',
                  background: isLoading || !lastUserMessage ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  cursor: isLoading || !lastUserMessage ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🔁
              </button>
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