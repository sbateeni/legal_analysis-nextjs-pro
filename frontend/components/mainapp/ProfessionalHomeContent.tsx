import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { isMobile } from '@utils/crypto';
import { useMainAppLogic } from '../../hooks/useMainAppLogic';
import { 
  ProfessionalLegalButton, 
  ProfessionalLegalCard,
  getProfessionalLegalColors
} from '../../components/themes';

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

interface ProfessionalHomeContentProps {
  onShowLandingPage: () => void;
}

export default function ProfessionalHomeContent({ onShowLandingPage }: ProfessionalHomeContentProps) {
  const { theme, darkMode } = useTheme();
  const professionalColors = getProfessionalLegalColors(darkMode);
  
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

  return (
    <div style={{
      fontFamily: "'Tajawal', 'Segoe UI', sans-serif",
      direction: 'rtl',
      minHeight: '100vh',
      background: darkMode ? professionalColors.background : '#f8fafc',
      color: darkMode ? professionalColors.textPrimary : professionalColors.textPrimary,
      padding: 0,
      margin: 0,
    }}>
      <main style={{
        maxWidth: 800,
        width: '100%',
        margin: '0 auto',
        padding: isMobile() ? '1rem 0.5rem' : '2rem 1rem',
      }}>
        {/* Professional Header */}
        <div style={{
          background: darkMode ? professionalColors.cardBackground : '#ffffff',
          borderRadius: '0.25rem',
          padding: '1rem',
          marginBottom: '1.5rem',
          border: `1px solid ${darkMode ? professionalColors.border : '#e2e8f0'}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <h1 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 700,
              color: darkMode ? professionalColors.textPrimary : professionalColors.primary
            }}>
              نظام التحليل القانوني
            </h1>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <ProfessionalLegalButton
                variant="outline"
                size="sm"
                onClick={onShowLandingPage}
                darkMode={darkMode}
                icon="🏠"
              >
                الصفحة الرئيسية
              </ProfessionalLegalButton>
              
              <ProfessionalLegalButton
                variant="primary"
                size="sm"
                onClick={() => {
                  try {
                    localStorage.clear();
                    window.location.reload();
                  } catch (error) {
                    console.warn('Failed to clear localStorage:', error);
                  }
                }}
                darkMode={darkMode}
                icon="🔄"
              >
                إعادة تعيين
              </ProfessionalLegalButton>
            </div>
          </div>
        </div>

        {/* Unlock Notification */}
        {showUnlockNotification && (
          <div style={{
            background: showUnlockNotification.includes('استعادة') ? 
              (darkMode ? '#10b98130' : '#10b98110') : 
              (darkMode ? '#f59e0b30' : '#f59e0b10'),
            border: `1px solid ${showUnlockNotification.includes('استعادة') ? 
              (darkMode ? '#10b981' : '#10b981') : 
              (darkMode ? '#f59e0b' : '#f59e0b')}`,
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: showUnlockNotification.includes('استعادة') ? 
                (darkMode ? '#10b981' : '#10b981') : 
                (darkMode ? '#f59e0b' : '#f59e0b')
            }}>
              {showUnlockNotification.includes('استعادة') && <span>🔄</span>}
              {showUnlockNotification.includes('فتح') && <span>🎉</span>}
              <span>{showUnlockNotification}</span>
            </div>
            {showUnlockNotification.includes('استعادة') && (
              <div style={{
                fontSize: '0.875rem', 
                marginTop: '0.5rem', 
                opacity: 0.9,
                textAlign: 'center'
              }}>
                يمكنك الاستمرار من حيث توقفت باستخدام التحليل الذكي
              </div>
            )}
          </div>
        )}

        {/* Welcome Notification */}
        {!apiKey && (
          <div style={{
            background: darkMode ? `${professionalColors.primary}30` : `${professionalColors.primary}10`,
            border: `1px solid ${professionalColors.primary}`,
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              fontSize: '1.125rem', 
              marginBottom: '0.5rem', 
              fontWeight: 700,
              color: professionalColors.primary,
              textAlign: 'center'
            }}>
              🎉 مرحباً بك في منصة التحليل القانوني الذكية!
            </div>
            <div style={{
              fontSize: '0.875rem', 
              opacity: 0.9, 
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              منصة مجانية للتحليل القانوني المدعوم بالذكاء الاصطناعي
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <ProfessionalLegalButton
                variant="primary"
                size="sm"
                onClick={onShowLandingPage}
                darkMode={darkMode}
                icon="🏠"
              >
                الصفحة الرئيسية
              </ProfessionalLegalButton>
            </div>
          </div>
        )}

        {/* Auto Detection System Summary */}
        <div style={{ marginBottom: '1.5rem' }}>
          <AutoDetectionSystemSummary
            theme={theme}
            isMobile={isMobile()}
          />
        </div>

        {/* Tab Navigation */}
        <div style={{
          background: darkMode ? professionalColors.cardBackground : '#ffffff',
          borderRadius: '0.25rem',
          border: `1px solid ${darkMode ? professionalColors.border : '#e2e8f0'}`,
          marginBottom: '1.5rem',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            background: darkMode ? professionalColors.secondary : '#f1f5f9',
            borderBottom: `1px solid ${darkMode ? professionalColors.border : '#e2e8f0'}`,
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
                  padding: isMobile() ? '0.75rem 0.5rem' : '1rem 0.75rem',
                  background: activeTab === tab.id ? professionalColors.primary : 'transparent',
                  color: activeTab === tab.id ? '#ffffff' : darkMode ? professionalColors.textPrimary : professionalColors.textSecondary,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: isMobile() ? '0.875rem' : '1rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>{tab.icon}</span>
                <span style={{ display: isMobile() ? 'none' : 'inline' }}>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: isMobile() ? '1rem 0.75rem' : '1.5rem 1rem' }}>
            {activeTab === 'input' && (
              <div>
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

                <div style={{ margin: '1.5rem 0' }}>
                  <SavedProgressNotification
                    {...getSavedProgressInfo()}
                    onLoadProgress={loadSavedStagesFromDatabase}
                    theme={theme}
                    isMobile={isMobile()}
                  />
                </div>

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
                {/* Fixed System Info */}
                <div style={{
                  background: darkMode ? `${professionalColors.accent}20` : `${professionalColors.accent}10`,
                  border: `1px solid ${darkMode ? `${professionalColors.accent}40` : `${professionalColors.accent}30`}`,
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1rem',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}>
                    <h4 style={{
                      color: professionalColors.accent,
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      ⚙️ نظام ثابت: 12 مرحلة أساسية + 4 مراحل متقدمة
                    </h4>
                    <div style={{
                      background: professionalColors.accent,
                      color: '#fff',
                      borderRadius: '1rem',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      17 مرحلة
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: darkMode ? professionalColors.textSecondary : professionalColors.textSecondary,
                    opacity: 0.8,
                    lineHeight: 1.5
                  }}>
                    🎯 نظام مبسط وفعال: 12 مرحلة أساسية للتحليل القانوني + 4 مراحل متقدمة + عريضة نهائية
                  </div>
                </div>

                {/* Progressive System */}
                <div style={{
                  background: darkMode ? `${professionalColors.primary}20` : `${professionalColors.primary}10`,
                  border: `1px solid ${darkMode ? `${professionalColors.primary}40` : `${professionalColors.primary}30`}`,
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1rem',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{
                        fontSize: '1rem',
                        color: professionalColors.primary
                      }}>
                        🎯
                      </span>
                      <span style={{
                        color: darkMode ? professionalColors.textPrimary : professionalColors.primary,
                        fontSize: isMobile() ? '0.875rem' : '1rem',
                        fontWeight: 'bold'
                      }}>
                        نظام ثابت: {unlockedStages} من 17 مرحلة
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {/* Progress Bar */}
                      <div style={{
                        background: darkMode ? professionalColors.border : '#cbd5e0',
                        borderRadius: '1rem',
                        height: '0.5rem',
                        width: '6rem',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          background: `linear-gradient(90deg, ${professionalColors.primary} 0%, ${professionalColors.accent} 100%)`,
                          height: '100%',
                          width: `${(unlockedStages / 17) * 100}%`,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      
                      {/* Unlock All Button */}
                      {unlockedStages < ALL_POSSIBLE_STAGES.length && (
                        <ProfessionalLegalButton
                          variant="primary"
                          size="sm"
                          onClick={unlockAllStages}
                          darkMode={darkMode}
                        >
                          🔓 فتح الكل
                        </ProfessionalLegalButton>
                      )}
                    </div>
                  </div>
                  
                  {/* Info Message */}
                  <div style={{
                    marginTop: '0.5rem',
                    fontSize: '0.75rem',
                    color: darkMode ? `${professionalColors.textSecondary}cc` : `${professionalColors.textSecondary}cc`,
                    lineHeight: 1.4
                  }}>
                    {currentPhase === 'essential' && 'تبدأ بالمراحل الأساسية. أكمل 80% لفتح مراحل متقدمة.'}
                    {currentPhase === 'intermediate' && 'مرحلة متوسطة - تم فتح مراحل إضافية. استمر لفتح المزيد.'}
                    {currentPhase === 'advanced' && 'مرحلة متقدمة - معظم المراحل متاحة. أكمل للوصول للنظام الشامل.'}
                    {currentPhase === 'complete' && 'اكتمل! جميع المراحل متاحة الآن.'}
                  </div>
                  
                  {/* Stats and Recommendation */}
                  <div style={{
                    marginTop: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    color: darkMode ? `${professionalColors.textSecondary}aa` : `${professionalColors.textSecondary}aa`
                  }}>
                    <span>📊 معدل الإنجاز: {Math.round((stageResults.filter(r => r !== null).length / unlockedStages) * 100)}%</span>
                    <span>🎯 متبقي: {ALL_POSSIBLE_STAGES.length - unlockedStages} مرحلة</span>
                  </div>
                  
                  {/* Next Stage Recommendation */}
                  {(() => {
                    const nextStage = getNextRecommendedStage();
                    return nextStage !== null ? (
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.375rem 0.625rem',
                        background: darkMode ? `${professionalColors.accent}25` : `${professionalColors.accent}15`,
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        color: professionalColors.accent,
                        fontWeight: 'bold',
                        border: `1px solid ${darkMode ? `${professionalColors.accent}40` : `${professionalColors.accent}30`}`
                      }}>
                        📝 اقتراح: ابدأ بالمرحلة {nextStage + 1}
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Manual Analysis Section */}
                <div style={{
                  background: darkMode ? `${professionalColors.accent}15` : `${professionalColors.accent}08`,
                  border: `2px solid ${darkMode ? `${professionalColors.accent}30` : `${professionalColors.accent}20`}`,
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{
                      color: professionalColors.accent,
                      fontSize: isMobile() ? '1.125rem' : '1.25rem',
                      fontWeight: 'bold',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🔍 التحليل اليدوي للمراحل
                    </h3>
                  </div>
                  
                  {/* Requirements Warning */}
                  {(!apiKey || !mainText.trim()) && (
                    <div style={{
                      background: darkMode ? '#f59e0b20' : '#f59e0b10',
                      border: `1px solid ${darkMode ? '#f59e0b40' : '#f59e0b30'}`,
                      borderRadius: '0.25rem',
                      padding: '0.5rem',
                      marginBottom: '0.75rem',
                      color: darkMode ? '#f59e0b' : '#92400e'
                    }}>
                      ⚠️ للبدء في التحليل اليدوي، تحتاج إلى:
                      <ul style={{ margin: '0.25rem 0', paddingRight: '1rem' }}>
                        {!apiKey && <li>إعداد مفتاح Gemini API من الإعدادات</li>}
                        {!mainText.trim() && <li>إدخال تفاصيل القضية في التبويب الأول</li>}
                      </ul>
                    </div>
                  )}
                  
                  {/* Completion Status */}
                  {apiKey && mainText.trim() && (() => {
                    const completedCount = stageResults.filter(r => r !== null && r !== '').length;
                    return completedCount > 0 ? (
                      <div style={{
                        background: darkMode ? `${professionalColors.primary}20` : `${professionalColors.primary}10`,
                        border: `1px solid ${darkMode ? `${professionalColors.primary}40` : `${professionalColors.primary}30`}`,
                        borderRadius: '0.25rem',
                        padding: '0.5rem',
                        marginBottom: '0.75rem',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          color: professionalColors.primary
                        }}>
                          🔄 وضع الاستكمال الذكي
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: darkMode ? professionalColors.textSecondary : professionalColors.textSecondary,
                          marginTop: '0.25rem',
                          opacity: 0.8
                        }}>
                          تم العثور على {completedCount} مراحل مكتملة. التحليل الذكي سيبدأ من المرحلة {completedCount + 1} مع الاحتفاظ بالنتائج السابقة.
                        </div>
                      </div>
                    ) : null;
                  })()}
                  
                  <div style={{
                    fontSize: '0.875rem',
                    color: darkMode ? professionalColors.textSecondary : professionalColors.textSecondary,
                    opacity: 0.8,
                    marginBottom: '0.75rem',
                    lineHeight: 1.5
                  }}>
                    💡 يمكنك الآن تحليل أي مرحلة بشكل فردي بالضغط على زر "تحليل يدوي" بجانب كل مرحلة. هذا يعطيك مرونة أكبر في التحليل ويسمح لك بإجراء تحليل مخصص لمراحل معينة.
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile() ? '1fr 1fr' : '1fr 1fr',
                    gap: '0.75rem',
                    fontSize: '0.75rem',
                    background: darkMode ? professionalColors.cardBackground : '#ffffff',
                    borderRadius: '0.25rem',
                    padding: '0.75rem',
                    border: `1px solid ${darkMode ? professionalColors.border : '#e2e8f0'}`
                  }}>
                    <div>
                      <span style={{ fontWeight: 'bold', color: professionalColors.accent }}>⚙️ ميزات التحليل اليدوي:</span>
                      <ul style={{ margin: '0.25rem 0', paddingRight: '1rem', lineHeight: 1.4 }}>
                        <li>تحكم كامل في ترتيب المراحل</li>
                        <li>إمكانية إعادة تحليل مرحلة معينة</li>
                        <li>توفير في استهلاك API</li>
                      </ul>
                    </div>
                    <div>
                      <span style={{ fontWeight: 'bold', color: professionalColors.accent }}>🎯 نصائح للاستخدام الأمثل:</span>
                      <ul style={{ margin: '0.25rem 0', paddingRight: '1rem', lineHeight: 1.4 }}>
                        <li>ابدأ بالمراحل الأولى</li>
                        <li>راجع نتائج كل مرحلة</li>
                        <li>اعتمد على المراحل السابقة</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Quick Access Panel */}
                <div style={{
                  background: darkMode ? professionalColors.cardBackground : '#ffffff',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  border: `1px solid ${darkMode ? professionalColors.border : '#e2e8f0'}`
                }}>
                  <h4 style={{
                    color: darkMode ? professionalColors.textPrimary : professionalColors.primary,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    margin: '0 0 1rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    ⚡ وصول سريع للمراحل
                  </h4>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile() ? '1fr 1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '0.5rem'
                  }}>
                    {CURRENT_STAGES_FINAL.slice(0, 8).map((stageName, index) => {
                      const isCompleted = stageResults[index] && stageShowResult[index];
                      const isLoading = stageLoading[index];
                      const hasError = stageErrors[index];
                      const canAnalyze = apiKey && mainText.trim();
                      
                      return (
                        <ProfessionalLegalButton
                          key={index}
                          variant={isCompleted ? "accent" : hasError ? "outline" : "primary"}
                          size="sm"
                          onClick={() => canAnalyze ? handleAnalyzeStage(index) : null}
                          disabled={isLoading || !canAnalyze}
                          darkMode={darkMode}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem' }}>
                              {isLoading ? '⟳' : isCompleted ? '✓' : hasError ? '✗' : !canAnalyze ? '⚠️' : index + 1}
                            </span>
                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {stageName.replace('المرحلة ', '').replace(': ', ': ').substring(0, isMobile() ? 15 : 25)}...
                            </span>
                          </div>
                        </ProfessionalLegalButton>
                      );
                    })}
                  </div>
                  
                  {CURRENT_STAGES_FINAL.length > 8 && (
                    <div style={{
                      marginTop: '0.75rem',
                      fontSize: '0.75rem',
                      color: darkMode ? professionalColors.textSecondary : professionalColors.textSecondary,
                      opacity: 0.7,
                      textAlign: 'center'
                    }}>
                      👇 انتقل إلى قسم "عرض جميع المراحل" أدناه لرؤية باقي المراحل ({CURRENT_STAGES_FINAL.length - 8} مراحل إضافية)
                    </div>
                  )}
                </div>

                {/* Smart Settings */}
                {showSmartSettings && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <EnhancedAnalysisSettings
                      onConfigChange={setSmartAnalysisConfig}
                      theme={theme}
                      isMobile={isMobile()}
                    />
                  </div>
                )}

                {/* Analysis Controls */}
                <div style={{ marginBottom: '1.5rem' }}>
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
                </div>

                {/* Progress Indicator */}
                <div style={{ marginBottom: '1.5rem' }}>
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
                </div>

                {/* Stage Results */}
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
                <EnhancedStageResults
                  {...getEnhancedStageData()}
                  className="mb-6"
                />
                
                <div style={{ marginTop: '1.5rem' }}>
                  <h3 style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: 'bold', 
                    marginBottom: '1rem', 
                    color: darkMode ? professionalColors.textPrimary : professionalColors.primary 
                  }}>
                    📋 النتائج التفصيلية
                  </h3>
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

        {/* Error Message */}
        {analysisError && (
          <div style={{
            background: darkMode ? '#ef444420' : '#ef444410',
            border: `1px solid ${darkMode ? '#ef444440' : '#ef444430'}`,
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: darkMode ? '#ef4444' : '#ef4444'
          }}>
            ❌ خطأ: {analysisError}
          </div>
        )}

        {/* Unlock Notification (Floating) */}
        {showUnlockNotification && (
          <div style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            background: darkMode ? `${professionalColors.primary}dd` : `${professionalColors.primary}ee`,
            color: '#fff',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            boxShadow: `0 4px 12px ${darkMode ? professionalColors.primary + '40' : professionalColors.primary + '30'}`,
            zIndex: 1001
          }}>
            {showUnlockNotification}
          </div>
        )}

        {/* Install Prompt */}
        {showInstallPrompt && deferredPrompt && (
          <div style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            zIndex: 1000
          }}>
            <ProfessionalLegalButton
              variant="primary"
              size="md"
              onClick={async () => {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                setShowInstallPrompt(false);
                setDeferredPrompt(null);
              }}
            >
              📱 تثبيت التطبيق
            </ProfessionalLegalButton>
          </div>
        )}

        {/* Case Organizer */}
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