import React from 'react';
import { ChatMessage } from './types';

interface MessageBubbleProps {
  message: ChatMessage;
  index: number;
  theme: any;
  onCopy: (text: string, index: number) => void;
  copiedMessageIndex: number | null;
}

export default function MessageBubble({ 
  message, 
  index, 
  theme, 
  onCopy, 
  copiedMessageIndex 
}: MessageBubbleProps) {
  return (
    <div style={{
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
                              <div style={{ 
                    fontWeight: 800, 
                    color: theme.accent, 
                    marginBottom: 6,
                    textShadow: '0 0 1px currentColor'
                  }}>الإجابة:</div>
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
              <button 
                onClick={() => onCopy(message.content, index)} 
                aria-label="نسخ إجابة المساعد" 
                style={{
                  background:'#eef2ff', 
                  border:`1px solid ${theme.border}`, 
                  borderRadius:6, 
                  padding:'4px 8px', 
                  cursor:'pointer', 
                  color:'#4338ca'
                }}
              >
                نسخ
              </button>
              {copiedMessageIndex === index && <span style={{fontSize:12, color:'#10b981'}}>تم النسخ</span>}
            </div>
          </>
        ) : (
          <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
        )}
        
        {/* Suggestions */}
        {message.role === 'assistant' && message.suggestions && message.suggestions.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
                                  <div style={{ 
                        fontSize: '0.95rem', 
                        marginBottom: '0.25rem', 
                        fontWeight: 700, 
                        color: theme.accent2,
                        textShadow: '0 0 0.5px currentColor'
                      }}>
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
                                  <div style={{ 
                        fontSize: '0.95rem', 
                        marginBottom: '0.25rem', 
                        fontWeight: 700, 
                        color: theme.accent2,
                        textShadow: '0 0 0.5px currentColor'
                      }}>
                        الخطوات التالية:
                      </div>
            <ol style={{ margin: 0, paddingRight: 18 }}>
              {message.nextSteps.map((step, idx) => (
                <li key={idx} style={{ marginBottom: 6 }}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Legal Sources */}
        {message.role === 'assistant' && message.legalSources && message.legalSources.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
                                  <div style={{ 
                        fontSize: '0.95rem', 
                        marginBottom: '0.5rem', 
                        fontWeight: 700, 
                        color: theme.accent2,
                        textShadow: '0 0 0.5px currentColor'
                      }}>
                        📚 المصادر القانونية المستخدمة:
                      </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {message.legalSources.map((source, idx) => (
                <div key={idx} style={{
                  padding: '0.5rem',
                  background: '#f8fafc',
                  borderRadius: '0.375rem',
                  border: `1px solid ${theme.border}`,
                  fontSize: '0.85rem'
                }}>
                  <div style={{ fontWeight: 600, color: theme.text, marginBottom: '0.25rem' }}>
                    {source.title}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                    {source.source} • {source.type}
                  </div>
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      color: theme.accent2,
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    🔗 عرض المصدر
                  </a>
                </div>
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
  );
}
