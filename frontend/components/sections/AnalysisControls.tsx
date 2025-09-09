/**
 * مكون أزرار التحكم في التحليل
 * Analysis Control Buttons Component
 */

import React from 'react';

interface AnalysisControlsProps {
  isAutoAnalyzing: boolean;
  useSmartAnalysis: boolean;
  setUseSmartAnalysis: (value: boolean) => void;
  showSmartSettings: boolean;
  setShowSmartSettings: (value: boolean) => void;
  smartAnalysisConfig: any;
  mainText: string;
  apiKey: string;
  onStartSmartAnalysis: () => void;
  onStartStandardAnalysis: () => void;
  onStopAnalysis: () => void;
  theme: any;
  isMobile: boolean;
}

export const AnalysisControls: React.FC<AnalysisControlsProps> = ({
  isAutoAnalyzing,
  useSmartAnalysis,
  setUseSmartAnalysis,
  showSmartSettings,
  setShowSmartSettings,
  smartAnalysisConfig,
  mainText,
  apiKey,
  onStartSmartAnalysis,
  onStartStandardAnalysis,
  onStopAnalysis,
  theme,
  isMobile
}) => {
  return (
    <div style={{ marginBottom: 20 }}>
      {/* تنبيه مفتاح API */}
      {!apiKey && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          fontSize: 14,
          color: '#92400e',
          textAlign: 'center'
        }}>
          ⚠️ <strong>مطلوب:</strong> يجب إدخال مفتاح Gemini API في{' '}
          <a href="/settings" style={{ color: theme.accent, fontWeight: 'bold' }}>
            صفحة الإعدادات
          </a>{' '}
          قبل بدء التحليل
        </div>
      )}
      {/* خيارات نوع التحليل */}
      <div style={{
        background: theme.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        border: `1px solid ${theme.border}`,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 14,
          color: theme.text
        }}>
          <div style={{ fontWeight: 'bold', color: theme.accent }}>
            ⚡ نوع التحليل:
          </div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: 8,
            background: useSmartAnalysis ? theme.accent : theme.background,
            color: useSmartAnalysis ? '#fff' : theme.text,
            border: `1px solid ${useSmartAnalysis ? theme.accent : theme.input}`,
            transition: 'all 0.3s ease'
          }}>
            <input
              type="checkbox"
              checked={useSmartAnalysis}
              onChange={(e) => setUseSmartAnalysis(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontWeight: 'bold' }}>
              🧠 نظام ذكي محسن
            </span>
            {smartAnalysisConfig?.patientMode && (
              <span style={{
                background: '#10b981',
                color: '#fff',
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 'bold'
              }}>
                صبور
              </span>
            )}
          </label>
        </div>
        
        <button
          onClick={() => setShowSmartSettings(!showSmartSettings)}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: `1px solid ${theme.accent}`,
            background: showSmartSettings ? theme.accent : 'transparent',
            color: showSmartSettings ? '#fff' : theme.accent,
            fontSize: 12,
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.3s ease'
          }}
        >
          ⚙️ إعدادات متقدمة
        </button>
      </div>

      {/* أزرار بدء التحليل */}
      <div style={{
        display: 'flex',
        gap: 12,
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {!isAutoAnalyzing ? (
          <button
            onClick={useSmartAnalysis ? onStartSmartAnalysis : onStartStandardAnalysis}
            disabled={!mainText.trim() || !apiKey}
            style={{
              padding: '16px 32px',
              borderRadius: 12,
              border: 'none',
              background: (!mainText.trim() || !apiKey) ? '#9ca3af' : 
                useSmartAnalysis ? 
                  'linear-gradient(135deg, #7c3aed, #a855f7)' : 
                  'linear-gradient(135deg, #10b981, #34d399)',
              color: '#fff',
              fontSize: 16,
              cursor: (!mainText.trim() || !apiKey) ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: useSmartAnalysis ? 
                '0 4px 16px rgba(124, 58, 237, 0.3)' : 
                '0 4px 16px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            {useSmartAnalysis ? (
              <>
                🧠 بدء التحليل الذكي
                {smartAnalysisConfig?.patientMode && (
                  <span style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 'bold'
                  }}>
                    نظام صبور 🕐
                  </span>
                )}
              </>
            ) : (
              '🚀 بدء التحليل التلقائي'
            )}
          </button>
        ) : (
          <button
            onClick={onStopAnalysis}
            style={{
              padding: '16px 32px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #ef4444, #f87171)',
              color: '#fff',
              fontSize: 16,
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            ⏹️ إيقاف التحليل
          </button>
        )}
      </div>
    </div>
  );
};

export default AnalysisControls;