import { useEffect, useRef } from 'react';
import { isMobile } from '@utils/crypto';
import { useTheme } from '../contexts/ThemeContext';
import { loadApiKey } from '@utils/db';
import { loadAppSettings } from '@utils/appSettings';
import { 
  MessageBubble, 
  QuickActions, 
  AnalyticsPanel, 
  Sidebar, 
  ChatInput, 
  ChatHeader,
  useChatLogic,
  usePWA
} from '../components/chat';

export default function ChatPage() {
  return <ChatPageContent />;
}

function ChatPageContent() {
  const { theme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // استخدام الـ hooks المخصصة
  const {
    messages,
    setMessages,
    inputMessage,
    setInputMessage,
    isLoading,
    apiKey,
    setApiKey,
    error,
    setError,
    cases,
    selectedCaseId,
    setSelectedCaseId,
    lastUserMessage,
    copiedMessageIndex,
    preferredModel,
    setPreferredModel,
    chatMode,
    setChatMode,
    saving,
    analytics,
    analyticsLoading,
    showAnalytics,
    setShowAnalytics,
    CHAT_STORAGE_KEY_PREFIX,
    fetchAnalytics,
    sendMessage,
    handleStop,
    handleRegenerate,
    handleSaveStrategy,
    copyToClipboard,
    copyTranscript,
    clearChat,
    handleReferenceCheck,
    applyFactualExtraction,
    applyLegalBasis,
    applyPleadingSkeleton,
    applyAnalyticsInsights,
    applyRiskAssessment,
    applyStrategicAnalysis,
    applyAutoAnalysis
  } = useChatLogic();

  const { mounted, showInstallButton, handleInstallClick } = usePWA();

  // تحميل البيانات الأولية
  useEffect(() => {
    // تحميل API Key من قاعدة البيانات الموحدة
    loadApiKey().then((key) => {
      if (key) setApiKey(key);
    });
    // تحميل القضايا المحفوظة والتحليلات
    fetchAnalytics();
    // تحميل نموذج مفضّل
    loadAppSettings().then(s => setPreferredModel(s.preferredModel || 'gemini-1.5-flash'));
    // وضع الدردشة المفضل
    try {
      const m = localStorage.getItem('chat_mode');
      if (m === 'general' || m === 'legal') setChatMode(m);
    } catch {}
  }, [fetchAnalytics, setApiKey, setPreferredModel, setChatMode]);

  // التمرير للأسفل عند إضافة رسائل جديدة
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages when switching case (or first mount)
  useEffect(() => {
    const key = `${CHAT_STORAGE_KEY_PREFIX}${selectedCaseId || 'general'}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setMessages(parsed);
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
  }, [selectedCaseId, setMessages, CHAT_STORAGE_KEY_PREFIX]);

  // Persist messages per selected case
  useEffect(() => {
    const key = `${CHAT_STORAGE_KEY_PREFIX}${selectedCaseId || 'general'}`;
    try {
      localStorage.setItem(key, JSON.stringify(messages));
    } catch {
      // ignore storage errors
    }
  }, [messages, selectedCaseId, CHAT_STORAGE_KEY_PREFIX]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
        maxWidth: 1200,
        margin: '0 auto',
        padding: isMobile() ? '1rem 0.5rem' : '2rem 1rem'
      }}>
        
        <div className="card-ui" style={{ 
          background: theme.card, 
          borderColor: theme.border, 
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

        {/* تخطيط بعرضين: المحادثة + شريط جانبي للسياق */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile()? '1fr' : '2fr 1fr', gap: 12 }}>
          {/* بطاقة المحادثة */}
          <div className="card-ui" style={{ 
            background: theme.card, 
            borderColor: theme.border, 
            padding: 0, 
            overflow: 'hidden' 
          }}>
            <ChatHeader
              theme={theme}
              selectedCaseId={selectedCaseId}
              cases={cases}
              chatMode={chatMode}
              setChatMode={setChatMode}
              showAnalytics={showAnalytics}
              setShowAnalytics={setShowAnalytics}
              analyticsLoading={analyticsLoading}
              onRefreshAnalytics={fetchAnalytics}
              onCopyTranscript={copyTranscript}
              onSaveStrategy={handleSaveStrategy}
              saving={saving}
              messagesLength={messages.length}
              onClearChat={clearChat}
              onReferenceCheck={handleReferenceCheck}
            />

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
                <MessageBubble
                  key={index}
                  message={message}
                  index={index}
                  theme={theme}
                  onCopy={copyToClipboard}
                  copiedMessageIndex={copiedMessageIndex}
                />
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
            <ChatInput
              theme={theme}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              isLoading={isLoading}
              lastUserMessage={lastUserMessage}
              onSend={sendMessage}
              onStop={handleStop}
              onRegenerate={handleRegenerate}
              onFactualExtraction={applyFactualExtraction}
              onLegalBasis={applyLegalBasis}
              onPleadingSkeleton={applyPleadingSkeleton}
              onAnalyticsInsights={applyAnalyticsInsights}
              onRiskAssessment={applyRiskAssessment}
              onStrategicAnalysis={applyStrategicAnalysis}
              onAutoAnalysis={applyAutoAnalysis}
              onKeyPress={handleKeyPress}
            />
          </div>

          {/* قسم التحليلات */}
          {showAnalytics && analytics && (
            <AnalyticsPanel analytics={analytics} theme={theme} />
          )}

          {/* الشريط الجانبي للسياق */}
          <Sidebar
            theme={theme}
            selectedCaseId={selectedCaseId}
            cases={cases}
            analytics={analytics}
            onFactualExtraction={applyFactualExtraction}
            onLegalBasis={applyLegalBasis}
            onPleadingSkeleton={applyPleadingSkeleton}
            onAnalyticsInsights={applyAnalyticsInsights}
            onRiskAssessment={applyRiskAssessment}
            onStrategicAnalysis={applyStrategicAnalysis}
            onAutoAnalysis={applyAutoAnalysis}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
