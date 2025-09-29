/**
 * مكون عرض نتائج المراحل
 * Stages Results Display Component
 */

import React, { useEffect } from 'react';

// إضافة الـ CSS للأنيميشن
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    @keyframes spinner-rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .spinner-icon {
      animation: spinner-rotate 1s linear infinite;
      display: inline-block;
    }
  `;
  if (!document.querySelector('#stage-results-styles')) {
    styleElement.id = 'stage-results-styles';
    document.head.appendChild(styleElement);
  }
}

interface StageResultsProps {
  stageResults: (string | null)[];
  stageShowResult: boolean[];
  stageErrors: (string | null)[];
  allStages: string[];
  theme: any;
  isMobile: boolean;
  // إضافة الدعم للتحليل الفردي
  stageLoading?: boolean[];
  onAnalyzeStage?: (index: number) => void;
  apiKey?: string;
  mainText?: string;
}

export const StageResults: React.FC<StageResultsProps> = ({
  stageResults,
  stageShowResult,
  stageErrors,
  allStages,
  theme,
  isMobile,
  stageLoading = [],
  onAnalyzeStage,
  apiKey,
  mainText
}) => {
  const completedStages = stageResults.filter(result => result !== null).length;
  const canAnalyzeIndividually = onAnalyzeStage && apiKey && mainText;
  
  // إجبار عرض جميع المراحل مع أزرار التحليل
  const shouldShowAllStages = true;
  
  // أزرار التحليل تظهر دائماً إذا توفرت الشروط الأساسية
  const showAnalysisButtons = onAnalyzeStage && apiKey;
  
  // Debug info
  console.log('🔍 StageResults Debug:', {
    hasOnAnalyzeStage: !!onAnalyzeStage,
    hasApiKey: !!apiKey,
    hasMainText: !!mainText,
    showAnalysisButtons,
    canAnalyzeIndividually,
    completedStages,
    totalStages: allStages.length
  });
  
  // لا نخفي المراحل أبداً - نعرضها دائماً
  // if (completedStages === 0 && !shouldShowAllStages) {
  //   return null; // تم تعطيل إخفاء المراحل
  // }

  return (
    <div style={{
      background: theme.card,
      borderRadius: 12,
      padding: isMobile ? 16 : 20,
      border: `1px solid ${theme.border}`
    }}>
      {/* العنوان */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: `1px solid ${theme.border}`
      }}>
        <h3 style={{
          color: theme.accent,
          fontSize: isMobile ? 18 : 20,
          fontWeight: 'bold',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          📊 نتائج المراحل
        </h3>
        <div style={{
          background: `${theme.accent}15`,
          color: theme.accent,
          padding: '4px 12px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 'bold'
        }}>
          {completedStages} من {allStages.length} مكتملة
        </div>
      </div>

      {/* عرض النتائج */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        {allStages.map((stageName, index) => {
          const hasResult = stageResults[index] && stageShowResult[index];
          const hasError = stageErrors[index];
          const isCompleted = hasResult && !hasError;
          const isFailed = hasError;
          const isPending = !hasResult && !hasError;

          return (
            <div
              key={index}
              style={{
                background: isCompleted ? 
                  `${theme.accent}10` : 
                  isFailed ? 
                    '#ef444415' : 
                    isPending && index >= (stageLoading.length > 0 ? Math.min(stageLoading.length, 5) : 5) ?
                      `${theme.input}50` : // مراحل غير مفتوحة بعد
                      theme.background,
                border: `1px solid ${
                  isCompleted ? theme.accent : 
                  isFailed ? '#ef4444' : 
                  theme.input
                }`,
                borderRadius: 8,
                padding: 12,
                transition: 'all 0.3s ease'
              }}
            >
              {/* عنوان المرحلة */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: hasResult ? 8 : 0
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: theme.text,
                  flex: 1
                }}>
                  <span style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: isCompleted ? 
                      theme.accent : 
                      isFailed ? 
                        '#ef4444' : 
                        theme.input,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 'bold'
                  }}>
                    {isCompleted ? '✓' : isFailed ? '✗' : index + 1}
                  </span>
                  <span style={{ flex: 1 }}>
                    المرحلة {index + 1}: {stageName}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* زر التحليل الفردي - دائماً مرئي عند توفر الشروط */}
                  {showAnalysisButtons && !isCompleted && (
                    <button
                      onClick={() => onAnalyzeStage!(index)}
                      disabled={stageLoading[index] || (!mainText?.trim())}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: 'none',
                        background: stageLoading[index] ? '#9ca3af' : 
                                  !mainText?.trim() ? '#fbbf24' : // أصفر للتنبيه بدلاً من رمادي
                                  `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accent}dd 100%)`,
                        color: '#fff',
                        fontSize: 12,
                        cursor: (stageLoading[index] || !mainText?.trim()) ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: !stageLoading[index] ? `0 2px 8px ${!mainText?.trim() ? '#fbbf2440' : theme.accent + '40'}` : 'none',
                        transition: 'all 0.2s ease',
                        transform: 'translateY(0)',
                      }}
                      onMouseEnter={(e) => {
                        if (!stageLoading[index]) {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          const shadowColor = !mainText?.trim() ? '#fbbf2460' : theme.accent + '60';
                          e.currentTarget.style.boxShadow = `0 4px 12px ${shadowColor}`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        const shadowColor = !mainText?.trim() ? '#fbbf2440' : theme.accent + '40';
                        e.currentTarget.style.boxShadow = `0 2px 8px ${shadowColor}`;
                      }}
                      title={!mainText?.trim() ? 'يرجى إدخال تفاصيل القضية أولاً' : 'تحليل هذه المرحلة يدوياً'}
                    >
                      {stageLoading[index] ? (
                        <>
                          <span className="spinner-icon">⟳</span>
                          <span>جاري التحليل...</span>
                        </>
                      ) : !mainText?.trim() ? (
                        <>
                          <span>⚠️</span>
                          <span>يتطلب نص</span>
                        </>
                      ) : (
                        <>
                          <span>🔍</span>
                          <span>تحليل يدوي</span>
                        </>
                      )}
                    </button>
                  )}
                  
                  {/* رسالة توضيحية إذا لم تظهر أزرار التحليل */}
                  {!showAnalysisButtons && !isCompleted && (
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: 11,
                      color: '#ef4444',
                      background: '#ef444415',
                      border: '1px solid #ef444430',
                      fontWeight: 'bold'
                    }}>
                      {!apiKey ? '⚠️ يتطلب API Key' : !onAnalyzeStage ? '⚠️ التحليل اليدوي غير متاح' : 'غير متاح'}
                    </div>
                  )}
                  
                  {/* شارة الحالة */}
                  <div style={{
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 10,
                    fontWeight: 'bold',
                    background: isCompleted ? 
                      '#10b981' : 
                      isFailed ? 
                        '#ef4444' : 
                        stageLoading[index] ? 
                          '#f59e0b' :
                          '#6b7280',
                    color: '#fff'
                  }}>
                    {stageLoading[index] ? 'جاري' : isCompleted ? 'مكتملة' : isFailed ? 'فاشلة' : 'معلقة'}
                  </div>
                </div>
              </div>

              {/* محتوى النتيجة */}
              {hasResult && (
                <div style={{
                  background: theme.background,
                  borderRadius: 6,
                  padding: 12,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: theme.text,
                  maxHeight: 200,
                  overflowY: 'auto',
                  border: `1px solid ${theme.input}`
                }}>
                  {stageResults[index]}
                </div>
              )}

              {/* رسالة الخطأ */}
              {hasError && (
                <div style={{
                  background: '#ef444415',
                  border: '1px solid #ef4444',
                  borderRadius: 6,
                  padding: 12,
                  fontSize: 13,
                  color: '#ef4444',
                  fontWeight: 'bold'
                }}>
                  ❌ خطأ: {stageErrors[index]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* إحصائيات سريعة */}
      <div style={{
        marginTop: 16,
        padding: 12,
        background: theme.background,
        borderRadius: 8,
        border: `1px solid ${theme.input}`,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: 12,
        fontSize: 12
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#10b981' }}>
            {stageResults.filter(r => r !== null).length}
          </div>
          <div style={{ color: theme.text, opacity: 0.7 }}>مكتملة</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#ef4444' }}>
            {stageErrors.filter(e => e !== null).length}
          </div>
          <div style={{ color: theme.text, opacity: 0.7 }}>فاشلة</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#6b7280' }}>
            {allStages.length - stageResults.filter(r => r !== null).length}
          </div>
          <div style={{ color: theme.text, opacity: 0.7 }}>متبقية</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: theme.accent }}>
            {Math.round((completedStages / allStages.length) * 100)}%
          </div>
          <div style={{ color: theme.text, opacity: 0.7 }}>التقدم</div>
        </div>
      </div>
    </div>
  );
};

export default StageResults;