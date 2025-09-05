import React, { useRef, useEffect } from 'react';
import { Button } from '../UI';
import { isMobile } from '@utils/crypto';
import QuickActions from './QuickActions';

interface ChatInputProps {
  theme: any;
  inputMessage: string;
  setInputMessage: (message: string) => void;
  isLoading: boolean;
  lastUserMessage: string;
  onSend: () => void;
  onStop: () => void;
  onRegenerate: () => void;
  onFactualExtraction: () => void;
  onLegalBasis: () => void;
  onPleadingSkeleton: () => void;
  onAnalyticsInsights: () => void;
  onRiskAssessment: () => void;
  onStrategicAnalysis: () => void;
  onAutoAnalysis: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export default function ChatInput({
  theme,
  inputMessage,
  setInputMessage,
  isLoading,
  lastUserMessage,
  onSend,
  onStop,
  onRegenerate,
  onFactualExtraction,
  onLegalBasis,
  onPleadingSkeleton,
  onAnalyticsInsights,
  onRiskAssessment,
  onStrategicAnalysis,
  onAutoAnalysis,
  onKeyPress
}: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

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
      padding: isMobile() ? 12 : 16,
      background: theme.card,
      borderTop: `1px solid ${theme.border}`
    }}>
      {/* Quick Actions (Mobile only) */}
      {isMobile() && (
        <QuickActions
          theme={theme}
          onFactualExtraction={onFactualExtraction}
          onLegalBasis={onLegalBasis}
          onPleadingSkeleton={onPleadingSkeleton}
          onAnalyticsInsights={onAnalyticsInsights}
          onRiskAssessment={onRiskAssessment}
          onStrategicAnalysis={onStrategicAnalysis}
          onAutoAnalysis={onAutoAnalysis}
        />
      )}
      
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: isMobile() ? 'stretch' : 'flex-end',
        flexDirection: isMobile() ? 'column' : 'row'
      }}>
        <textarea
          ref={inputRef}
          value={inputMessage}
          onChange={(e) => { 
            setInputMessage(e.target.value); 
            requestAnimationFrame(autoResizeInput); 
          }}
          onKeyPress={onKeyPress}
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
                  maxHeight: isMobile() ? '300px' : '240px',
                  fontFamily: 'inherit',
                  textShadow: '0 0 0.5px currentColor',
                  fontWeight: 500
                }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Button 
            onClick={onStop} 
            disabled={!isLoading} 
            ariaLabel="إيقاف الطلب الجاري" 
            variant="danger" 
            style={{ 
              background: isLoading ? '#ef4444' : '#9ca3af', 
              cursor: !isLoading ? 'not-allowed' : 'pointer' 
            }}
          >
            ⏹️
          </Button>
          <Button 
            onClick={onSend} 
            disabled={isLoading || !inputMessage.trim()} 
            ariaLabel="إرسال الرسالة" 
            variant="info" 
            style={{ 
              background: isLoading || !inputMessage.trim() ? '#9ca3af' : theme.accent2, 
              cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer' 
            }}
          >
            {isLoading ? '⏳' : '📤'}
          </Button>
          <Button 
            onClick={onRegenerate} 
            disabled={isLoading || !lastUserMessage} 
            ariaLabel="إعادة توليد آخر إجابة" 
            variant="success" 
            style={{ 
              background: isLoading || !lastUserMessage ? '#9ca3af' : '#10b981', 
              cursor: isLoading || !lastUserMessage ? 'not-allowed' : 'pointer' 
            }}
          >
            🔁
          </Button>
        </div>
      </div>
    </div>
  );
}
