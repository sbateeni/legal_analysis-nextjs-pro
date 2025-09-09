/**
 * مكون مؤشر التقدم المحسن
 * Enhanced Progress Indicator Component
 */

import React from 'react';

interface ProgressIndicatorProps {
  isAutoAnalyzing: boolean;
  showSequentialProgress: boolean;
  smartAnalysisProgress: any;
  useSmartAnalysis: boolean;
  sequentialProgress: any;
  analysisProgress: number;
  currentAnalyzingStage: number;
  allStages: string[];
  estimatedTimeRemaining: string;
  canPauseResume: boolean;
  onTogglePauseResume: () => void;
  onStopAnalysis: () => void;
  smartAnalysisConfig: any;
  theme: any;
  isMobile: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  isAutoAnalyzing,
  showSequentialProgress,
  smartAnalysisProgress,
  useSmartAnalysis,
  sequentialProgress,
  analysisProgress,
  currentAnalyzingStage,
  allStages,
  estimatedTimeRemaining,
  canPauseResume,
  onTogglePauseResume,
  onStopAnalysis,
  smartAnalysisConfig,
  theme,
  isMobile
}) => {
  if (!(isAutoAnalyzing || showSequentialProgress || smartAnalysisProgress)) {
    return null;
  }

  const isPaused = sequentialProgress?.isPaused || smartAnalysisProgress?.isPaused;
  const progressData = sequentialProgress || smartAnalysisProgress;

  return (
    <div style={{
      background: theme.resultBg,
      padding: 20,
      borderRadius: 12,
      border: `2px solid ${useSmartAnalysis ? '#7c3aed' : theme.accent}`,
      marginTop: 20,
      textAlign: 'center'
    }}>
      {/* العنوان وأزرار التحكم */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 16
      }}>
        <div style={{
          width: 24,
          height: 24,
          border: '3px solid #e5e7eb',
          borderTop: isPaused ? 
            '3px solid #f59e0b' : 
            useSmartAnalysis ? '3px solid #7c3aed' : '3px solid #10b981',
          borderRadius: '50%',
          animation: isPaused ? 'none' : 'spin 1s linear infinite'
        }} />
        
        <h3 style={{
          color: theme.text,
          margin: 0,
          fontSize: 18,
          fontWeight: 'bold'
        }}>
          {isPaused ? 
            'تم إيقاف التحليل مؤقتاً...' :
            useSmartAnalysis ? 
              'جاري التحليل الذكي المحسن... 🧠' :
              'جاري التحليل التلقائي المحسن...'
          }
        </h3>
        
        {/* أزرار التحكم */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {canPauseResume && (
            <button
              onClick={onTogglePauseResume}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                background: isPaused ? '#10b981' : '#f59e0b',
                color: '#fff',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {isPaused ? 'استئناف' : 'إيقاف مؤقت'}
            </button>
          )}
          <button
            onClick={onStopAnalysis}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: 'none',
              background: '#dc2626',
              color: '#fff',
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            إيقاف
          </button>
        </div>
      </div>
      
      {/* شريط التقدم */}
      <div style={{
        background: '#e5e7eb',
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 12
      }}>
        <div style={{
          width: `${analysisProgress}%`,
          height: '100%',
          background: isPaused ? 
            'linear-gradient(90deg, #f59e0b, #fbbf24)' : 
            useSmartAnalysis ?
              'linear-gradient(90deg, #7c3aed, #a855f7)' :
              'linear-gradient(90deg, #10b981, #34d399)',
          transition: 'width 0.5s ease',
          borderRadius: 6
        }} />
      </div>
      
      {/* معلومات التقدم */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 16,
        fontSize: 14,
        color: theme.text
      }}>
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>المرحلة الحالية:</div>
          <div>المرحلة {currentAnalyzingStage + 1} من {allStages.length}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
            {allStages[currentAnalyzingStage] || 'مكتمل'}
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>التقدم:</div>
          <div>{analysisProgress}% مكتمل</div>
          {estimatedTimeRemaining && (
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
              الوقت المتبقي: {estimatedTimeRemaining}
            </div>
          )}
        </div>
      </div>

      {/* معلومات إضافية */}
      {progressData && (
        <div style={{
          marginTop: 12,
          padding: 12,
          background: theme.background,
          borderRadius: 6,
          fontSize: 12
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#10b981' }}>✓</span> مكتمل: {progressData.completedStages || 0}
            </div>
            {(progressData.failedStages || 0) > 0 && (
              <div>
                <span style={{ fontWeight: 'bold', color: '#dc2626' }}>✗</span> فاشل: {progressData.failedStages}
              </div>
            )}
            <div>
              <span style={{ fontWeight: 'bold', color: '#6b7280' }}>•</span> متبقي: {(progressData.totalStages || allStages.length) - (progressData.completedStages || 0)}
            </div>
            {useSmartAnalysis && smartAnalysisConfig?.patientMode && (
              <div>
                <span style={{ fontWeight: 'bold', color: '#7c3aed' }}>🕐</span> نظام صبور
              </div>
            )}
          </div>
        </div>
      )}

      {/* إضافة CSS للانيميشن */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProgressIndicator;