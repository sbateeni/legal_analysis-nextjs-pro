import React from 'react';
import { Button } from '../UI';
import { LegalCase } from './types';
import { isMobile } from '@utils/crypto';

interface ChatHeaderProps {
  theme: any;
  selectedCaseId: string;
  cases: LegalCase[];
  chatMode: 'legal' | 'general';
  setChatMode: (mode: 'legal' | 'general') => void;
  showAnalytics: boolean;
  setShowAnalytics: (show: boolean) => void;
  analyticsLoading: boolean;
  onRefreshAnalytics: () => void;
  onCopyTranscript: () => void;
  onSaveStrategy: () => void;
  saving: boolean;
  messagesLength: number;
  onClearChat: () => void;
  onReferenceCheck: () => void;
}

export default function ChatHeader({
  theme,
  selectedCaseId,
  cases,
  chatMode,
  setChatMode,
  showAnalytics,
  setShowAnalytics,
  analyticsLoading,
  onRefreshAnalytics,
  onCopyTranscript,
  onSaveStrategy,
  saving,
  messagesLength,
  onClearChat,
  onReferenceCheck
}: ChatHeaderProps) {
  return (
    <div style={{
      padding: isMobile() ? 14 : 18, 
      borderBottom: `1px solid ${theme.border}`, 
      background: 'rgba(99,102,241,0.06)'
    }}>
      <div style={{
        display: 'flex', 
        alignItems: 'center', 
        gap: 10, 
        justifyContent: 'space-between', 
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: isMobile() ? 22 : 26 }}>🤖</span>
          <h2 style={{ margin: 0, color: theme.accent, fontSize: isMobile() ? 18 : 20 }}>
            المساعد القانوني الفلسطيني
          </h2>
        </div>
        
        {selectedCaseId && (
          <div style={{ fontSize: isMobile() ? 12 : 13, color: theme.accent2 }}>
            المحادثة حول: <b>{cases.find(c => c.id === selectedCaseId)?.name}</b>
            <br />
            <small style={{ color: '#6b7280' }}>
              {cases.find(c => c.id === selectedCaseId)?.stages?.length || 0} مرحلة محللة
            </small>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {/* وضع الدردشة */}
          <div style={{ 
            display: 'inline-flex', 
            border: `1px solid ${theme.border}`, 
            borderRadius: 10, 
            overflow: 'hidden' 
          }}>
            <button 
              type="button" 
              onClick={() => { 
                setChatMode('legal'); 
                try { localStorage.setItem('chat_mode', 'legal') } catch {} 
              }} 
              style={{ 
                padding: '6px 10px', 
                fontWeight: 800, 
                background: chatMode === 'legal' ? theme.accent : 'transparent', 
                color: chatMode === 'legal' ? '#fff' : theme.text, 
                border: 'none', 
                cursor: 'pointer' 
              }}
            >
              ⚖️ قانوني
            </button>
            <button 
              type="button" 
              onClick={() => { 
                setChatMode('general'); 
                try { localStorage.setItem('chat_mode', 'general') } catch {} 
              }} 
              style={{ 
                padding: '6px 10px', 
                fontWeight: 800, 
                background: chatMode === 'general' ? theme.accent : 'transparent', 
                color: chatMode === 'general' ? '#fff' : theme.text, 
                border: 'none', 
                cursor: 'pointer' 
              }}
            >
              🌐 عام
            </button>
          </div>
          
          <Button 
            onClick={() => setShowAnalytics(!showAnalytics)} 
            ariaLabel="عرض التحليلات" 
            variant="info" 
            style={{ background: showAnalytics ? '#f59e0b' : '#8b5cf6' }}
          >
            {showAnalytics ? '📊 إخفاء التحليلات' : '📊 عرض التحليلات'}
          </Button>
          
          <Button 
            onClick={onRefreshAnalytics} 
            disabled={analyticsLoading} 
            ariaLabel="تحديث التحليلات" 
            variant="info" 
            style={{ 
              background: analyticsLoading ? '#9ca3af' : '#06b6d4', 
              cursor: analyticsLoading ? 'not-allowed' : 'pointer' 
            }}
          >
            {analyticsLoading ? '⏳' : '🔄 تحديث'}
          </Button>
          
          <Button 
            onClick={onCopyTranscript} 
            ariaLabel="نسخ المحادثة كاملة" 
            variant="info" 
            style={{ background: '#0ea5e9' }}
          >
            نسخ المحادثة
          </Button>
          
          <Button 
            onClick={onSaveStrategy} 
            disabled={saving || !messagesLength} 
            ariaLabel="حفظ كاستراتيجية" 
            variant="success" 
            style={{ 
              background: saving || !messagesLength ? '#9ca3af' : '#10b981', 
              cursor: saving || !messagesLength ? 'not-allowed' : 'pointer' 
            }}
          >
            {saving ? '⏳' : '💾 حفظ كاستراتيجية'}
          </Button>
          
          <Button 
            onClick={onClearChat} 
            disabled={messagesLength === 0} 
            ariaLabel="حذف المحادثة" 
            variant="danger" 
            style={{ 
              background: messagesLength === 0 ? '#9ca3af' : '#ef4444', 
              cursor: messagesLength === 0 ? 'not-allowed' : 'pointer' 
            }}
          >
            🗑️ حذف المحادثة {messagesLength > 0 && `(${messagesLength})`}
          </Button>
          
          {selectedCaseId && (
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                onReferenceCheck();
              }} 
              style={{ 
                textDecoration: 'none', 
                padding: '6px 10px', 
                border: `1px solid ${theme.border}`, 
                borderRadius: 8, 
                background: '#fff7ed', 
                color: '#9a3412', 
                fontWeight: 700 
              }}
            >
              🔎 فحص المراجع
            </a>
          )}
        </div>
      </div>
      
      <div style={{
        marginTop: 6, 
        color: '#6b7280', 
        fontSize: isMobile() ? 13 : 14
      }}>
        اسأل ضمن الإطار القانوني الفلسطيني لتحصل على إجابات مبنية على القوانين والأنظمة الفلسطينية
      </div>
    </div>
  );
}
