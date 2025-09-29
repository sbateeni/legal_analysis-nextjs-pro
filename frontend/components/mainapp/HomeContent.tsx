import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { isMobile } from '@utils/crypto';
import { useMainAppLogic } from '../../hooks/useMainAppLogic';

// Import section components
import { DataInputSection } from '../sections';
import { AnalysisControls } from '../sections';
import { ProgressIndicator } from '../sections';
import { StageResults } from '../sections';
import { AdvancedSettings } from '../sections';

// Import other components
import EnhancedStageResults from '../EnhancedStageResults';
import CaseOrganizer from '../CaseOrganizer';
import CaseTypeSelection from '../CaseTypeSelection';
import AutoDetectionSystemSummary from '../AutoDetectionSystemSummary';
import EnhancedAnalysisSettings from '../EnhancedAnalysisSettings';
import SavedProgressNotification from '../SavedProgressNotification';
import CollabPanel from '../CollabPanel';

interface HomeContentProps {
  onShowLandingPage: () => void;
}

export default function HomeContent({ onShowLandingPage }: HomeContentProps) {
  const { theme, darkMode } = useTheme();
  const {
    // State variables
    mounted,
    activeTab,
    setActiveTab,
    currentPhase,
    setCurrentPhase,
    apiKey,
    setApiKey,
    mainText,
    setMainText,
    caseNameInput,
    setCaseNameInput,
    partyRole,
    setPartyRole,
    caseType,
    setCaseType,
    preferredModel,
    setPreferredModel,
    stageGating,
    setStageGating,
    showDeadlines,
    setShowDeadlines,
    selectedCaseTypes,
    setSelectedCaseTypes,
    caseComplexity,
    setCaseComplexity,
    customStages,
    setCustomStages,
    showCustomStages,
    setShowCustomStages,
    oldSystemDetection,
    unlockedStages,
    setUnlockedStages,
    showUnlockNotification,
    setShowUnlockNotification,
    ALL_POSSIBLE_STAGES,
    CURRENT_STAGES_FINAL,
    stageResults,
    setStageResults,
    stageLoading,
    setStageLoading,
    stageErrors,
    setStageErrors,
    stageShowResult,
    setStageShowResult,
    isAutoAnalyzing,
    setIsAutoAnalyzing,
    currentAnalyzingStage,
    setCurrentAnalyzingStage,
    analysisProgress,
    setAnalysisProgress,
    analysisError,
    setAnalysisError,
    estimatedTimeRemaining,
    setEstimatedTimeRemaining,
    showCaseOrganizer,
    setShowCaseOrganizer,
    sequentialAnalysisManager,
    setSequentialAnalysisManager,
    sequentialProgress,
    setSequentialProgress,
    showSequentialProgress,
    setShowSequentialProgress,
    analysisResults,
    setAnalysisResults,
    canPauseResume,
    setCanPauseResume,
    smartAnalysisManager,
    setSmartAnalysisManager,
    smartAnalysisConfig,
    setSmartAnalysisConfig,
    useSmartAnalysis,
    setUseSmartAnalysis,
    showSmartSettings,
    setShowSmartSettings,
    smartAnalysisProgress,
    setSmartAnalysisProgress,
    currentAnalysisCase,
    setCurrentAnalysisCase,
    autoSaveEnabled,
    setAutoSaveEnabled,
    existingCases,
    setExistingCases,
    selectedStageForCollab,
    setSelectedStageForCollab,
    showInstallPrompt,
    setShowInstallPrompt,
    deferredPrompt,
    setDeferredPrompt,
    
    // Functions
    handleOrganizeCase,
    handleCaseOrganized,
    handleCancelOrganizer,
    unlockNextStages,
    unlockAllStages,
    getNextRecommendedStage,
    handleApiKeyChange,
    loadExistingCases,
    handleSelectExistingCase,
    loadSavedStagesFromDatabase,
    saveCompletedStageToDatabase,
    getSavedProgressInfo,
    getEnhancedStageData,
    startSmartAnalysis,
    startStandardAnalysis,
    stopAutoAnalysis,
    togglePauseResume,
    handleAnalyzeStage,
    saveCaseToDatabase,
    determineSmartCaseType,
  } = useMainAppLogic(theme, isMobile);

  if (!mounted) {
    return null;
  }

  // إضافة CSS للأنيميشن
  if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    if (!document.querySelector('#progressive-stages-styles')) {
      styleElement.id = 'progressive-stages-styles';
      document.head.appendChild(styleElement);
    }
  }

  return (
    <div style={{
      fontFamily: 'Tajawal, Arial, sans-serif',
      direction: 'rtl',
      minHeight: '100vh',
      background: theme.background,
      color: theme.text,
      padding: 0,
      margin: 0,
      transition: 'all 0.3s ease',
    }}>
      <main style={{
        maxWidth: 800,
        width: '100%',
        margin: '0 auto',
        padding: isMobile() ? '1rem 0.5rem' : '2rem 1rem',
      }}>
        {/* تنبيه استعادة المراحل */}
        {showUnlockNotification && (
          <div style={{
            background: showUnlockNotification.includes('استعادة') ? 
              'linear-gradient(135deg, #10b981 0%, #34d399 100%)' : 
              'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 16,
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
            fontWeight: 600,
            textAlign: 'center',
            color: '#fff',
            animation: 'slideInRight 0.5s ease-out'
          }}>
            <div style={{fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}}>
              {showUnlockNotification.includes('استعادة') && <span>🔄</span>}
              {showUnlockNotification.includes('فتح') && <span>🎉</span>}
              <span>{showUnlockNotification}</span>
            </div>
            {showUnlockNotification.includes('استعادة') && (
              <div style={{fontSize: '13px', marginTop: '8px', opacity: 0.9}}>
                يمكنك الاستمرار من حيث توقفت باستخدام التحليل الذكي
              </div>
            )}
          </div>
        )}

        {/* تنبيه الترحيب */}
        {!apiKey && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 16,
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            fontWeight: 600,
            textAlign: 'center',
            color: '#fff'
          }}>
            <div style={{fontSize: '18px', marginBottom: '8px'}}>
              🎉 مرحباً بك في منصة التحليل القانوني الذكية!
            </div>
            <div style={{fontSize: '14px', opacity: 0.9, marginBottom: '12px'}}>
              منصة مجانية للتحليل القانوني المدعوم بالذكاء الاصطناعي
            </div>
            {/* أيقونة الوصول لصفحة الترحيب */}
            <button
              onClick={onShowLandingPage}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 8,
                padding: '8px 16px',
                color: '#fff',
                fontSize: 14,
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                margin: '0 auto',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              title="العودة إلى صفحة الترحيب"
            >
              <span>🏠</span>
              <span>صفحة الترحيب</span>
            </button>
          </div>
        )}

        {/* عرض ملخص النظام الجديد */}
        <AutoDetectionSystemSummary
          theme={theme}
          isMobile={isMobile()}
        />

        {/* نظام التبويبات */}
        <div style={{
          background: theme.card,
          borderRadius: 16,
          boxShadow: `0 4px 20px ${theme.shadow}`,
          marginBottom: 24,
          border: `1.5px solid ${theme.border}`,
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex',
            background: darkMode ? '#2a2d3e' : '#f8fafc',
            borderBottom: `1px solid ${theme.border}`,
          }}>
            {[
              { id: 'input', label: '📝 إدخال البيانات', icon: '✍️' },
              { id: 'stages', label: '🔍 مراحل التحليل', icon: '⚖️' },
              { id: 'results', label: '📊 النتائج', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'input' | 'stages' | 'results')}
                style={{
                  flex: 1,
                  padding: isMobile() ? '12px 8px' : '16px 12px',
                  background: activeTab === tab.id ? theme.accent : 'transparent',
                  color: activeTab === tab.id ? '#fff' : theme.text,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: isMobile() ? 14 : 16,
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <span>{tab.icon}</span>
                <span style={{ display: isMobile() ? 'none' : 'inline' }}>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* محتوى التبويبات */}
          <div style={{ padding: isMobile() ? 16 : 24 }}>
            {activeTab === 'input' && (
              <div>
                {/* مكون إدخال البيانات */}
                <DataInputSection
                  mainText={mainText}
                  setMainText={setMainText}
                  caseNameInput={caseNameInput}
                  setCaseNameInput={setCaseNameInput}
                  partyRole={partyRole}
                  setPartyRole={(role: string) => setPartyRole(role as any)}
                  theme={theme}
                  isMobile={isMobile()}
                  darkMode={darkMode}
                  existingCases={existingCases}
                  onSelectExistingCase={handleSelectExistingCase}
                  onOrganizeCase={handleOrganizeCase}
                />

                {/* إشعار التقدم المحفوظ */}
                <SavedProgressNotification
                  {...getSavedProgressInfo()}
                  onLoadProgress={loadSavedStagesFromDatabase}
                  theme={theme}
                  isMobile={isMobile()}
                />

                {/* نظام اختيار نوع القضية */}
                <CaseTypeSelection
                  text={mainText}
                  currentType={caseType}
                  onTypeChange={setSelectedCaseTypes}
                  onComplexityChange={setCaseComplexity}
                  theme={theme}
                  isMobile={isMobile()}
                  oldSystemDetection={mainText.length > 20 ? oldSystemDetection : undefined}
                />
              </div>
            )}

            {activeTab === 'stages' && (
              <div>
                {/* عرض معلومات النظام الثابت */}
                <div style={{
                  background: `${theme.accent}10`,
                  borderRadius: 12,
                  padding: isMobile() ? 16 : 20,
                  marginBottom: 20,
                  border: `1px solid ${theme.accent}30`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12
                  }}>
                    <h4 style={{
                      color: theme.accent,
                      fontSize: 16,
                      fontWeight: 'bold',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      ⚙️ نظام ثابت: 12 مرحلة أساسية + 4 مراحل متقدمة
                    </h4>
                    <div style={{
                      background: theme.accent,
                      color: '#fff',
                      borderRadius: 12,
                      padding: '4px 8px',
                      fontSize: 12,
                      fontWeight: 'bold'
                    }}>
                      17 مرحلة
                    </div>
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: theme.text,
                    opacity: 0.8,
                    lineHeight: 1.5
                  }}>
                    🎯 نظام مبسط وفعال: 12 مرحلة أساسية للتحليل القانوني + 4 مراحل متقدمة + عريضة نهائية
                  </div>
                </div>

                {/* قسم النظام التدريجي */}
                <div style={{
                  background: `linear-gradient(135deg, ${theme.accent}20 0%, ${theme.accent}10 100%)`,
                  borderRadius: 12,
                  padding: isMobile() ? 12 : 16,
                  marginBottom: 16,
                  border: `1px solid ${theme.accent}30`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <span style={{
                        fontSize: 16,
                        color: theme.accent
                      }}>
                        🎯
                      </span>
                      <span style={{
                        color: theme.text,
                        fontSize: isMobile() ? 14 : 16,
                        fontWeight: 'bold'
                      }}>
                        نظام ثابت: {unlockedStages} من 17 مرحلة
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      {/* مؤشر التقدم */}
                      <div style={{
                        background: theme.input,
                        borderRadius: 20,
                        height: 8,
                        width: 100,
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          background: `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accent}dd 100%)`,
                          height: '100%',
                          width: `${(unlockedStages / 17) * 100}%`,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      
                      {/* زر فتح جميع المراحل */}
                      {unlockedStages < ALL_POSSIBLE_STAGES.length && (
                        <button
                          onClick={unlockAllStages}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            border: 'none',
                            background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accent}dd 100%)`,
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = `0 4px 12px ${theme.accent}40`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          🔓 فتح الكل
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* رسالة توضيحية */}
                  <div style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: `${theme.text}88`,
                    lineHeight: 1.4
                  }}>
                    {currentPhase === 'essential' && 'تبدأ بالمراحل الأساسية. أكمل 80% لفتح مراحل متقدمة.'}
                    {currentPhase === 'intermediate' && 'مرحلة متوسطة - تم فتح مراحل إضافية. استمر لفتح المزيد.'}
                    {currentPhase === 'advanced' && 'مرحلة متقدمة - معظم المراحل متاحة. أكمل للوصول للنظام الشامل.'}
                    {currentPhase === 'complete' && 'اكتمل! جميع المراحل متاحة الآن.'}
                  </div>
                  
                  {/* إحصائيات واقتراحات ذكية */}
                  <div style={{
                    marginTop: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 11,
                    color: `${theme.text}66`
                  }}>
                    <span>📊 معدل الإنجاز: {Math.round((stageResults.filter(r => r !== null).length / unlockedStages) * 100)}%</span>
                    <span>🎯 متبقي: {ALL_POSSIBLE_STAGES.length - unlockedStages} مرحلة</span>
                  </div>
                  
                  {/* اقتراح المرحلة التالية */}
                  {(() => {
                    const nextStage = getNextRecommendedStage();
                    return nextStage !== null ? (
                      <div style={{
                        marginTop: 8,
                        padding: '6px 10px',
                        background: `${theme.accent}15`,
                        borderRadius: 6,
                        fontSize: 11,
                        color: theme.accent,
                        fontWeight: 'bold',
                        border: `1px solid ${theme.accent}30`
                      }}>
                        📝 اقتراح: ابدأ بالمرحلة {nextStage + 1}
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* قسم التحليل اليدوي المبرز - دائماً مرئي */}
                <div style={{
                  background: `linear-gradient(135deg, ${theme.accent}15 0%, ${theme.accent}08 100%)`,
                  borderRadius: 16,
                  padding: isMobile() ? 16 : 20,
                  marginBottom: 20,
                  border: `2px solid ${theme.accent}30`,
                  boxShadow: `0 4px 20px ${theme.accent}10`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16
                  }}>
                    <h3 style={{
                      color: theme.accent,
                      fontSize: isMobile() ? 18 : 20,
                      fontWeight: 'bold',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      🔍 التحليل اليدوي للمراحل
                    </h3>
                  </div>
                  
                  {/* تحذير عند عدم توفر المتطلبات */}
                  {(!apiKey || !mainText.trim()) && (
                    <div style={{
                      background: '#fef3c7',
                      border: '1px solid #f59e0b',
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 12,
                      fontSize: 13,
                      color: '#92400e',
                      fontWeight: 'bold'
                    }}>
                      ⚠️ للبدء في التحليل اليدوي، تحتاج إلى:
                      <ul style={{ margin: '4px 0', paddingRight: 16 }}>
                        {!apiKey && <li>إعداد مفتاح Gemini API من الإعدادات</li>}
                        {!mainText.trim() && <li>إدخال تفاصيل القضية في التبويب الأول</li>}
                      </ul>
                    </div>
                  )}
                  
                  {/* عرض حالة الاستكمال */}
                  {apiKey && mainText.trim() && (() => {
                    const completedCount = stageResults.filter(r => r !== null && r !== '').length;
                    return completedCount > 0 ? (
                      <div style={{
                        background: `${theme.accent}20`,
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 12,
                        border: `1px solid ${theme.accent}50`
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 14,
                          fontWeight: 'bold',
                          color: theme.accent
                        }}>
                          🔄 وضع الاستكمال الذكي
                        </div>
                        <div style={{
                          fontSize: 12,
                          color: theme.text,
                          marginTop: 4,
                          opacity: 0.8
                        }}>
                          تم العثور على {completedCount} مراحل مكتملة. التحليل الذكي سيبدأ من المرحلة {completedCount + 1} مع الاحتفاظ بالنتائج السابقة.
                        </div>
                      </div>
                    ) : null;
                  })()}
                  
                  <div style={{
                    fontSize: 14,
                    color: theme.text,
                    opacity: 0.8,
                    marginBottom: 12,
                    lineHeight: 1.5
                  }}>
                    💡 يمكنك الآن تحليل أي مرحلة بشكل فردي بالضغط على زر "تحليل يدوي" بجانب كل مرحلة. هذا يعطيك مرونة أكبر في التحليل ويسمح لك بإجراء تحليل مخصص لمراحل معينة.
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile() ? '1fr 1fr' : '1fr 1fr',
                    gap: 12,
                    fontSize: 12,
                    background: theme.background,
                    borderRadius: 8,
                    padding: 12,
                    border: `1px solid ${theme.input}`
                  }}>
                    <div>
                      <span style={{ fontWeight: 'bold', color: theme.accent }}>⚙️ ميزات التحليل اليدوي:</span>
                      <ul style={{ margin: '4px 0', paddingRight: 16, lineHeight: 1.4 }}>
                        <li>تحكم كامل في ترتيب المراحل</li>
                        <li>إمكانية إعادة تحليل مرحلة معينة</li>
                        <li>توفير في استهلاك API</li>
                      </ul>
                    </div>
                    <div>
                      <span style={{ fontWeight: 'bold', color: theme.accent }}>🎯 نصائح للاستخدام الأمثل:</span>
                      <ul style={{ margin: '4px 0', paddingRight: 16, lineHeight: 1.4 }}>
                        <li>ابدأ بالمراحل الأولى</li>
                        <li>راجع نتائج كل مرحلة</li>
                        <li>اعتمد على المراحل السابقة</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* لوحة الوصول السريع للمراحل - دائماً مرئية */}
                <div style={{
                  background: theme.card,
                  borderRadius: 12,
                  padding: isMobile() ? 16 : 20,
                  marginBottom: 20,
                  border: `1px solid ${theme.border}`
                }}>
                  <h4 style={{
                    color: theme.text,
                    fontSize: 16,
                    fontWeight: 'bold',
                    margin: '0 0 16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    ⚡ وصول سريع للمراحل
                  </h4>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile() ? '1fr 1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 8
                  }}>
                    {CURRENT_STAGES_FINAL.slice(0, 8).map((stageName, index) => {
                      const isCompleted = stageResults[index] && stageShowResult[index];
                      const isLoading = stageLoading[index];
                      const hasError = stageErrors[index];
                      const canAnalyze = apiKey && mainText.trim();
                      
                      return (
                        <button
                          key={index}
                          onClick={() => canAnalyze ? handleAnalyzeStage(index) : null}
                          disabled={isLoading || !canAnalyze}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: `1px solid ${isCompleted ? theme.accent : hasError ? '#ef4444' : theme.input}`,
                            background: isCompleted ? `${theme.accent}20` : hasError ? '#ef444415' : !canAnalyze ? '#f3f4f6' : theme.background,
                            color: isCompleted ? theme.accent : hasError ? '#ef4444' : !canAnalyze ? '#6b7280' : theme.text,
                            fontSize: 12,
                            fontWeight: 'bold',
                            cursor: isLoading ? 'not-allowed' : canAnalyze ? 'pointer' : 'not-allowed',
                            textAlign: 'right',
                            transition: 'all 0.2s ease',
                            opacity: (isLoading || !canAnalyze) ? 0.6 : 1
                          }}
                          title={!canAnalyze ? 'يرجى إعداد API Key وإدخال تفاصيل القضية أولاً' : 'تحليل هذه المرحلة'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                            <span style={{ fontSize: 10 }}>
                              {isLoading ? '⟳' : isCompleted ? '✓' : hasError ? '✗' : !canAnalyze ? '⚠️' : index + 1}
                            </span>
                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {stageName.replace('المرحلة ', '').replace(': ', ': ').substring(0, isMobile() ? 20 : 30)}...
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {CURRENT_STAGES_FINAL.length > 8 && (
                    <div style={{
                      marginTop: 12,
                      fontSize: 12,
                      color: theme.text,
                      opacity: 0.7,
                      textAlign: 'center'
                    }}>
                      👇 انتقل إلى قسم "عرض جميع المراحل" أدناه لرؤية باقي المراحل ({CURRENT_STAGES_FINAL.length - 8} مراحل إضافية)
                    </div>
                  )}
                </div>

                {/* إعدادات النظام الذكي المحسن */}
                {showSmartSettings && (
                  <div style={{ marginBottom: 20 }}>
                    <EnhancedAnalysisSettings
                      onConfigChange={setSmartAnalysisConfig}
                      theme={theme}
                      isMobile={isMobile()}
                    />
                  </div>
                )}

                {/* أزرار التحكم في التحليل */}
                <AnalysisControls
                  isAutoAnalyzing={isAutoAnalyzing}
                  useSmartAnalysis={useSmartAnalysis}
                  setUseSmartAnalysis={setUseSmartAnalysis}
                  showSmartSettings={showSmartSettings}
                  setShowSmartSettings={setShowSmartSettings}
                  smartAnalysisConfig={smartAnalysisConfig}
                  mainText={mainText}
                  apiKey={apiKey}
                  onStartSmartAnalysis={startSmartAnalysis}
                  onStartStandardAnalysis={startStandardAnalysis}
                  onStopAnalysis={stopAutoAnalysis}
                  theme={theme}
                  isMobile={isMobile()}
                />

                {/* مؤشر التقدم */}
                <ProgressIndicator
                  isAutoAnalyzing={isAutoAnalyzing}
                  showSequentialProgress={showSequentialProgress}
                  smartAnalysisProgress={smartAnalysisProgress}
                  useSmartAnalysis={useSmartAnalysis}
                  sequentialProgress={sequentialProgress}
                  analysisProgress={analysisProgress}
                  currentAnalyzingStage={currentAnalyzingStage}
                  allStages={CURRENT_STAGES_FINAL}
                  estimatedTimeRemaining={estimatedTimeRemaining}
                  canPauseResume={canPauseResume}
                  onTogglePauseResume={togglePauseResume}
                  onStopAnalysis={stopAutoAnalysis}
                  smartAnalysisConfig={smartAnalysisConfig}
                  theme={theme}
                  isMobile={isMobile()}
                />

                {/* عرض المراحل التقليدي مع أزرار التحليل */}
                <StageResults
                  stageResults={stageResults}
                  stageShowResult={stageShowResult}
                  stageErrors={stageErrors}
                  stageLoading={stageLoading}
                  allStages={CURRENT_STAGES_FINAL}
                  onAnalyzeStage={handleAnalyzeStage}
                  apiKey={apiKey}
                  mainText={mainText}
                  theme={theme}
                  isMobile={isMobile()}
                />
              </div>
            )}

            {activeTab === 'results' && (
              <div>
                {/* عرض نتائج المراحل المحسن */}
                <EnhancedStageResults
                  {...getEnhancedStageData()}
                  className="mb-6"
                />
                
                {/* عرض النتائج التفصيلية التقليدية */}
                <div style={{ marginTop: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: theme.text }}>📋 النتائج التفصيلية</h3>
                  <StageResults
                    stageResults={stageResults}
                    stageShowResult={stageShowResult}
                    stageErrors={stageErrors}
                    allStages={CURRENT_STAGES_FINAL}
                    theme={theme}
                    isMobile={isMobile()}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* رسائل الأخطاء */}
        {analysisError && (
          <div style={{
            background: '#ef444415',
            border: '1px solid #ef4444',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            color: '#ef4444',
            fontSize: 14,
            fontWeight: 'bold'
          }}>
            ❌ خطأ: {analysisError}
          </div>
        )}

        {/* إشعار فتح المراحل */}
        {showUnlockNotification && (
          <div style={{
            position: 'fixed',
            top: 20,
            right: 20,
            background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accent}dd 100%)`,
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 'bold',
            boxShadow: `0 6px 20px ${theme.accent}40`,
            zIndex: 1001,
            animation: 'slideInRight 0.3s ease-out'
          }}>
            {showUnlockNotification}
          </div>
        )}

        {/* زر التثبيت */}
        {showInstallPrompt && deferredPrompt && (
          <button
            onClick={async () => {
              deferredPrompt.prompt();
              const { outcome } = await deferredPrompt.userChoice;
              setShowInstallPrompt(false);
              setDeferredPrompt(null);
            }}
            style={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '12px 16px',
              fontSize: 14,
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              zIndex: 1000
            }}
          >
            📱 تثبيت التطبيق
          </button>
        )}

        {/* منظم القضية */}
        <CaseOrganizer
          originalText={mainText}
          onOrganized={handleCaseOrganized}
          onCancel={handleCancelOrganizer}
          isVisible={showCaseOrganizer}
          apiKey={apiKey}
        />
      </main>
    </div>
  );
}