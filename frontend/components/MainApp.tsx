/**
 * الصفحة الرئيسية المحسنة - مقسمة إلى مكونات منفصلة
 * Enhanced Main Page - Split into Separate Components
 */

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { mapApiErrorToMessage, extractApiError } from '@utils/errors';
import { saveApiKey, loadApiKey, addCase, getAllCases, updateCase, LegalCase } from '@utils/db';
import { isMobile } from '@utils/crypto';
import { useTheme } from '../contexts/ThemeContext';
import { LandingPage } from '../components/pages/landing';

// استيراد أدوات التصدير
import { exportResultsToPDF, exportResultsToDocx } from '@utils/export';
import { loadExportPreferences } from '@utils/exportSettings';
import { Button } from '../components/UI';

// استيراد أنظمة التحليل
import stagesDef from '../stages';
import type { StageDetails } from '../types/analysis';
import { 
  SequentialAnalysisManager, 
  createSequentialAnalysisManager, 
  DEFAULT_LEGAL_STAGES,
  AnalysisProgress,
  AnalysisStage as SequentialAnalysisStage
} from '../utils/sequentialAnalysisManager';

// استيراد النظام الذكي المحسن
import { SmartSequentialAnalysisManager, createSmartAnalysisManager, ROBUST_ANALYSIS_CONFIG, PATIENT_ANALYSIS_CONFIG } from '../utils/smartSequentialAnalysis';
import { IntelligentIntegrationManager, IntegratedAnalysisResult, IntegratedAnalysisConfig } from '../utils/integration/intelligentIntegrationManager';
import { globalContextManager } from '../utils/context';

// استيراد نظام الكشف التلقائي
import { detectCaseType, analyzeCaseComplexity } from '../utils/caseTypeDetection';
import { generateCustomStages, integrateCustomStages, customizeStagesByComplexity } from '../utils/customStages';

// استيراد المكونات المقسمة
import DataInputSection from '../components/sections/DataInputSection';
import AnalysisControls from '../components/sections/AnalysisControls';
import ProgressIndicator from '../components/sections/ProgressIndicator';
import StageResults from '../components/sections/StageResults';
import AdvancedSettings from '../components/sections/AdvancedSettings';
import CaseTypeSelection from '../components/CaseTypeSelection';
import AutoDetectionSystemSummary from '../components/AutoDetectionSystemSummary';
import EnhancedAnalysisSettings from '../components/EnhancedAnalysisSettings';
import CollabPanel from '../components/CollabPanel';

// تعريف المراحل
const STAGES = Object.keys(stagesDef).sort((a, b) => {
  const da = (stagesDef as Record<string, StageDetails>)[a]?.order ?? 9999;
  const db = (stagesDef as Record<string, StageDetails>)[b]?.order ?? 9999;
  return da - db;
});

const FINAL_STAGE = 'المرحلة الثالثة عشرة: العريضة القانونية النهائية';
const ALL_STAGES = [...STAGES, FINAL_STAGE];

type PartyRole = 'المشتكي' | 'المشتكى عليه' | 'المدعي' | 'المدعى عليه';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Home() {
  const [showLandingPage, setShowLandingPage] = useState(true);
  
  useEffect(() => {
    try {
      const hasVisited = localStorage.getItem('hasVisited');
      if (hasVisited) {
        setShowLandingPage(false);
      }
    } catch (error) {
      console.warn('Failed to access localStorage:', error);
    }
  }, []);

  const handleSkipLanding = () => {
    setShowLandingPage(false);
    try {
      localStorage.setItem('hasVisited', 'true');
      localStorage.setItem('start_on_stages', '1');
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  };

  if (showLandingPage) {
    return <LandingPage onSkip={handleSkipLanding} />;
  }

  return <HomeContent />;
}

function HomeContent() {
  const { theme, darkMode } = useTheme();
  
  // الحالة الأساسية
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'stages' | 'results'>('input');
  
  // بيانات الإدخال
  const [apiKey, setApiKey] = useState('');
  const [mainText, setMainText] = useState('');
  const [caseNameInput, setCaseNameInput] = useState('');
  const [partyRole, setPartyRole] = useState<PartyRole | ''>('');
  const [caseType, setCaseType] = useState<string>('عام');
  
  // إعدادات النظام
  const [preferredModel, setPreferredModel] = useState<string>('gemini-1.5-flash');
  const [stageGating, setStageGating] = useState<boolean>(true);
  const [showDeadlines, setShowDeadlines] = useState<boolean>(true);
  
  // نتائج المراحل
  const [stageResults, setStageResults] = useState<(string|null)[]>(() => Array(ALL_STAGES.length).fill(null));
  const [stageLoading, setStageLoading] = useState<boolean[]>(() => Array(ALL_STAGES.length).fill(false));
  const [stageErrors, setStageErrors] = useState<(string|null)[]>(() => Array(ALL_STAGES.length).fill(null));
  const [stageShowResult, setStageShowResult] = useState<boolean[]>(() => Array(ALL_STAGES.length).fill(false));
  
  // حالة التحليل
  const [isAutoAnalyzing, setIsAutoAnalyzing] = useState(false);
  const [currentAnalyzingStage, setCurrentAnalyzingStage] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisError, setAnalysisError] = useState('');
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<string>('');
  
  // النظام المتسلسل
  const [sequentialAnalysisManager, setSequentialAnalysisManager] = useState<SequentialAnalysisManager | null>(null);
  const [sequentialProgress, setSequentialProgress] = useState<AnalysisProgress | null>(null);
  const [showSequentialProgress, setShowSequentialProgress] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<SequentialAnalysisStage[]>([]);
  const [canPauseResume, setCanPauseResume] = useState(false);
  
  // النظام الذكي المحسن
  const [smartAnalysisManager, setSmartAnalysisManager] = useState<SmartSequentialAnalysisManager | null>(null);
  const [smartAnalysisConfig, setSmartAnalysisConfig] = useState(ROBUST_ANALYSIS_CONFIG);
  const [useSmartAnalysis, setUseSmartAnalysis] = useState(true);
  const [showSmartSettings, setShowSmartSettings] = useState(false);
  const [smartAnalysisProgress, setSmartAnalysisProgress] = useState<any>(null);
  
  // نظام الكشف التلقائي
  const [selectedCaseTypes, setSelectedCaseTypes] = useState<string[]>([caseType]);
  const [caseComplexity, setCaseComplexity] = useState<any>(null);
  const [customStages, setCustomStages] = useState<any[]>([]);
  const [showCustomStages, setShowCustomStages] = useState(false);
  const [oldSystemDetection] = useState<string>('أحوال شخصية');
  
  // متغيرات أخرى
  const [existingCases, setExistingCases] = useState<LegalCase[]>([]);
  const [selectedStageForCollab, setSelectedStageForCollab] = useState<string | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  
  const collabRef = useRef<HTMLDivElement | null>(null);

  // تهيئة المكون
  useEffect(() => {
    setMounted(true);
    loadApiKey().then(val => {
      if (val) setApiKey(val);
    });
    loadExistingCases();
  }, []);

  // حفظ مفتاح API
  const handleApiKeyChange = async (newKey: string) => {
    setApiKey(newKey);
    try {
      await saveApiKey(newKey);
    } catch (error) {
      console.error('Error saving API key:', error);
    }
  };

  // تحميل القضايا الموجودة
  const loadExistingCases = async () => {
    try {
      const cases = await getAllCases();
      setExistingCases(cases);
    } catch (error) {
      console.error('Error loading cases:', error);
    }
  };

  // دوال التحليل الذكي
  const startSmartAnalysis = async () => {
    console.log('🧠 بدء التحليل الذكي المحسن...');
    
    const manager = new SmartSequentialAnalysisManager(
      ALL_STAGES,
      smartAnalysisConfig,
      (progress: any) => {
        setSmartAnalysisProgress(progress);
        setCurrentAnalyzingStage(progress.currentStage);
        setAnalysisProgress(progress.progress);
        setIsAutoAnalyzing(progress.isRunning);
        
        // تحديث النتائج في الواجهة
        progress.stages?.forEach((stage: any, index: number) => {
          if (stage.status === 'completed' && stage.output) {
            setStageResults(prev => {
              const newResults = [...prev];
              newResults[index] = stage.output;
              return newResults;
            });
            
            setStageShowResult(prev => {
              const newShow = [...prev];
              newShow[index] = true;
              return newShow;
            });
          }
          
          if (stage.status === 'failed') {
            setStageErrors(prev => {
              const newErrors = [...prev];
              newErrors[index] = stage.error || 'فشل في المرحلة';
              return newErrors;
            });
          }
        });
      }
    );
    
    setSmartAnalysisManager(manager);
    
    try {
      const result = await manager.startSmartAnalysis(
        mainText,
        apiKey,
        {
          partyRole: partyRole || undefined,
          caseType: selectedCaseTypes[0] || 'عام',
          preferredModel,
          selectedCaseTypes,
          caseComplexity
        }
      );
      
      console.log('🎉 اكتمل التحليل الذكي:', result);
      
      if (result.success) {
        await saveCaseToDatabase(result.stages);
      }
      
      setAnalysisResults(result.stages);
      
    } catch (error) {
      console.error('❌ خطأ في التحليل الذكي:', error);
      setAnalysisError(error instanceof Error ? error.message : 'خطأ غير معروف');
    } finally {
      setIsAutoAnalyzing(false);
    }
  };

  const startStandardAnalysis = async () => {
    // دالة التحليل العادي (للاحتياط)
    console.log('🚀 بدء التحليل العادي...');
    // التنفيذ يمكن إضافته لاحقاً إذا لزم الأمر
  };

  const stopAutoAnalysis = () => {
    if (smartAnalysisManager) {
      smartAnalysisManager.stop();
    }
    if (sequentialAnalysisManager) {
      sequentialAnalysisManager.stop();
    }
    setIsAutoAnalyzing(false);
  };

  const togglePauseResume = () => {
    if (smartAnalysisManager) {
      if (smartAnalysisProgress?.isPaused) {
        smartAnalysisManager.resume();
      } else {
        smartAnalysisManager.pause();
      }
    }
  };

  // حفظ القضية في قاعدة البيانات
  const saveCaseToDatabase = async (stages: any[]) => {
    try {
      const caseName = caseNameInput.trim() || 
        `قضية ${selectedCaseTypes[0] || 'عام'} - ${new Date().toLocaleDateString('ar')}`;
      
      const newCaseId = `${caseName}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      await addCase({
        id: newCaseId,
        name: caseName,
        createdAt: new Date().toISOString(),
        stages: stages,
      });
      
      console.log(`تم حفظ قضية: ${caseName}`);
      loadExistingCases();
    } catch (error) {
      console.error('خطأ في حفظ القضية:', error);
    }
  };

  // دالة تحديد نوع القضية الذكي
  const determineSmartCaseType = (text: string): string => {
    if (!text || text.length < 10) return 'عام';
    const detection = detectCaseType(text);
    return detection.confidence > 30 ? detection.suggestedType : 'عام';
  };

  if (!mounted) {
    return null;
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
            <div style={{fontSize: '14px', opacity: 0.9}}>
              منصة مجانية للتحليل القانوني المدعوم بالذكاء الاصطناعي
            </div>
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
                  setPartyRole={(role: string) => setPartyRole(role as PartyRole | '')}
                  theme={theme}
                  isMobile={isMobile()}
                  darkMode={darkMode}
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

                {/* الإعدادات المبسطة */}
                <AdvancedSettings
                  apiKey={apiKey}
                  setApiKey={handleApiKeyChange}
                  preferredModel={preferredModel}
                  setPreferredModel={setPreferredModel}
                  theme={theme}
                  isMobile={isMobile()}
                  darkMode={darkMode}
                />
              </div>
            )}

            {activeTab === 'stages' && (
              <div>
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
                  allStages={ALL_STAGES}
                  estimatedTimeRemaining={estimatedTimeRemaining}
                  canPauseResume={canPauseResume}
                  onTogglePauseResume={togglePauseResume}
                  onStopAnalysis={stopAutoAnalysis}
                  smartAnalysisConfig={smartAnalysisConfig}
                  theme={theme}
                  isMobile={isMobile()}
                />
              </div>
            )}

            {activeTab === 'results' && (
              <div>
                {/* عرض نتائج المراحل */}
                <StageResults
                  stageResults={stageResults}
                  stageShowResult={stageShowResult}
                  stageErrors={stageErrors}
                  allStages={ALL_STAGES}
                  theme={theme}
                  isMobile={isMobile()}
                />
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
      </main>
    </div>
  );
}