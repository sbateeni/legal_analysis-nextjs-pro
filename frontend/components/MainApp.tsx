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
import { buildSpecializedStages } from '../types/caseTypes';
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
import EnhancedStageResults from '../components/EnhancedStageResults';
import CaseOrganizer from '../components/CaseOrganizer';
import AdvancedSettings from '../components/sections/AdvancedSettings';
import CaseTypeSelection from '../components/CaseTypeSelection';
import AutoDetectionSystemSummary from '../components/AutoDetectionSystemSummary';
import EnhancedAnalysisSettings from '../components/EnhancedAnalysisSettings';
import SavedProgressNotification from '../components/SavedProgressNotification';
import CollabPanel from '../components/CollabPanel';

// تعريف المراحل - فقط المراحل الأساسية (1-12)
const STAGES = Object.keys(stagesDef)
  .filter(stageName => {
    const stageOrder = (stagesDef as Record<string, StageDetails>)[stageName]?.order ?? 9999;
    // فقط المراحل الأساسية (رقم 1-12) واستبعاد المراحل المتخصصة (101+)
    return stageOrder >= 1 && stageOrder <= 12;
  })
  .sort((a, b) => {
    const da = (stagesDef as Record<string, StageDetails>)[a]?.order ?? 9999;
    const db = (stagesDef as Record<string, StageDetails>)[b]?.order ?? 9999;
    return da - db;
  });

const FINAL_STAGE = 'المرحلة السابعة عشرة: العريضة القانونية النهائية';
// ملاحظة: ALL_STAGES هذا متغير قديم ولن يستخدم في النظام الثابت

type PartyRole = 'المشتكي' | 'المشتكى عليه' | 'المدعي' | 'المدعى عليه';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Home() {
  const [showLandingPage, setShowLandingPage] = useState(true);
  
  useEffect(() => {
    // إظهار صفحة الترحيب دائماً عند الدخول للموقع
    // تم تعديل المنطق ليعرض صفحة الترحيب في كل مرة
    setShowLandingPage(true);
  }, []);

  const handleSkipLanding = () => {
    setShowLandingPage(false);
    try {
      localStorage.setItem('hasVisited', 'true');
      localStorage.setItem('skipLandingPage', 'true');
      localStorage.setItem('lastVisitDate', new Date().toISOString());
      localStorage.setItem('start_on_stages', '1');
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  };


  if (showLandingPage) {
    return <LandingPage onSkip={handleSkipLanding} />;
  }

  return <HomeContent onShowLandingPage={() => setShowLandingPage(true)} />;
}

function HomeContent({ onShowLandingPage }: { onShowLandingPage: () => void }) {
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
  
  // نظام الكشف التلقائي
  const [selectedCaseTypes, setSelectedCaseTypes] = useState<string[]>([caseType]);
  const [caseComplexity, setCaseComplexity] = useState<any>(null);
  const [customStages, setCustomStages] = useState<any[]>([]);
  const [showCustomStages, setShowCustomStages] = useState(false);
  const [oldSystemDetection] = useState<string>('أحوال شخصية');
  
  // دالة تحديد المراحل المناسبة بناءً على نوع القضية مع النظام التدريجي
  const getRelevantStages = () => {
    const baseStages = STAGES; // المراحل الأساسية (12 مراحل)
    const finalStage = FINAL_STAGE; // المرحلة الأخيرة
    
    // النظام التدريجي - عرض المراحل بالتدريج
    // المرحلة الأولى: المراحل الأساسية فقط (5 مراحل)
    const essentialStages = baseStages.slice(0, 5);
    
    // إذا لم يتم اختيار نوع محدد أو كان "عام"، أعرض المراحل الأساسية فقط
    if (!selectedCaseTypes || selectedCaseTypes.length === 0 || 
        (selectedCaseTypes.length === 1 && selectedCaseTypes[0] === 'عام')) {
      return [...essentialStages]; // ابدأ بـ 5 مراحل فقط
    }
    
    // للقضايا المخصصة، أضف مراحل تدريجية
    try {
      const customStagesForCase = generateCustomStages(selectedCaseTypes);
      const relevantCustomStages = customStagesForCase
        .filter(stage => stage.isRequired || selectedCaseTypes.some(type => stage.caseTypes.includes(type)))
        .slice(0, 3); // حد أقصى 3 مراحل مخصصة في البداية
      
      // دمج المراحل التدريجي
      const progressiveStages = [
        ...essentialStages, // المراحل الأساسية (5 مراحل)
        ...relevantCustomStages.map(stage => stage.name), // المراحل المخصصة (حتى 3 مراحل)
      ];
      
      console.log(`🎯 نظام تدريجي: بدء بـ ${progressiveStages.length} مرحلة لأنواع القضايا: ${selectedCaseTypes.join('، ')}`);
      return progressiveStages;
    } catch (error) {
      console.error('خطأ في إنشاء المراحل المخصصة:', error);
      return [...essentialStages]; // العودة للمراحل الأساسية في حالة الخطأ
    }
  };
  
  // حالة النظام التدريجي
  const [currentPhase, setCurrentPhase] = useState<'essential' | 'intermediate' | 'advanced' | 'complete'>('essential');
  const [unlockedStages, setUnlockedStages] = useState<number>(5); // ابدأ بـ 5 مراحل
  const [showUnlockNotification, setShowUnlockNotification] = useState<string | null>(null);
  
  // تحديد المراحل الثابتة: 12 مرحلة أساسية + 4 مراحل متقدمة فقط
  const getAllPossibleStages = () => {
    const baseStages = STAGES; // 12 مرحلة أساسية
    const finalStage = FINAL_STAGE; // العريضة النهائية
    
    // فقط المراحل الأساسية الـ 12 الأولى (بدون مراحل مخصصة لنوع القضية)
    const first12BasicStages = baseStages.slice(0, 12);
    
    // عرض دائم للمراحل الأساسية والمتقدمة فقط (بدون مراحل مخصصة لنوع القضية)
    const fixedStages = [
      ...first12BasicStages, // 12 مرحلة أساسية
      // المراحق المتقدمة الإضافية الـ4:
      'المرحلة الثالثة عشرة: تحليل المخاطر القانونية',
      'المرحلة الرابعة عشرة: استراتيجية الدفاع/الادعاء',
      'المرحضة الخامسة عشرة: خطة التنفيذ العملي',
      'المرحلة السادسة عشرة: تحليل التكلفة والوقت',
      finalStage // العريضة النهآية
    ];
    
    console.log(`📁 النظام الثابت: ${first12BasicStages.length} مرحلة أساسية + 4 مراحل متقدمة + 1 عريضة = ${fixedStages.length} مرحلة إجمالي`);
    console.log(`🔍 المراحل الأساسية الـ 12:`, first12BasicStages);
    console.log(`🔍 قائمة المراحل الثابتة النهائية:`, fixedStages);
    return fixedStages;
  };
  
  // دمج المراحل الأساسية مع مراحل التخصص المختارة
  const ALL_POSSIBLE_STAGES = React.useMemo(() => {
    const fixed = getAllPossibleStages(); // 12 أساسية + 4 متقدمة + عريضة
    const specialized = buildSpecializedStages(selectedCaseTypes, false);
    // إدراج مراحل التخصص بعد الأساسية مباشرة دون تكرار
    const first12 = fixed.slice(0, 12);
    const rest = fixed.slice(12);
    const merged: string[] = [];
    const seen = new Set<string>();
    for (const s of first12) { if (!seen.has(s)) { seen.add(s); merged.push(s); } }
    for (const s of specialized) { if (!seen.has(s)) { seen.add(s); merged.push(s); } }
    for (const s of rest) { if (!seen.has(s)) { seen.add(s); merged.push(s); } }
    return merged;
  }, [selectedCaseTypes]);

  const CURRENT_STAGES = ALL_POSSIBLE_STAGES.slice(0, unlockedStages);
  
  // نتائج المراحل
  const [stageResults, setStageResults] = useState<(string|null)[]>(() => Array(CURRENT_STAGES.length).fill(null));
  
  // دالة تحويل البيانات للمكون المحسن
  const getEnhancedStageData = () => {
    const totalStages = CURRENT_STAGES.length;
    const completedStages = stageResults.filter(result => result !== null && result !== '').length;
    const failedStages = stageErrors.filter(error => error !== null).length;
    const totalTime = 0; // يمكن حساب الوقت الفعلي لاحقاً
    
    const stages = CURRENT_STAGES.map((stageName, index) => {
      const hasResult = stageResults[index] !== null && stageResults[index] !== '';
      const hasError = stageErrors[index] !== null;
      const isLoading = stageLoading[index];
      const requiresApiKey = !apiKey;
      
      let status: 'completed' | 'failed' | 'pending' | 'locked' = 'pending';
      if (hasResult) status = 'completed';
      else if (hasError) status = 'failed';
      else if (isLoading) status = 'pending';
      else if (requiresApiKey) status = 'pending';
      
      return {
        id: index + 1,
        name: stageName,
        status,
        timeSpent: hasResult ? Math.floor(Math.random() * 5) + 1 : undefined, // وقت وهمي للعرض
        textLength: hasResult ? stageResults[index]?.length || 0 : undefined,
        error: hasError ? stageErrors[index] ?? undefined : undefined,
        requiresApiKey: requiresApiKey && !hasResult
      };
    });
    
    return {
      stages,
      totalStages,
      completedStages,
      failedStages,
      totalTime
    };
  };
  const [stageLoading, setStageLoading] = useState<boolean[]>(() => Array(CURRENT_STAGES.length).fill(false));
  const [stageErrors, setStageErrors] = useState<(string|null)[]>(() => Array(CURRENT_STAGES.length).fill(null));
  const [stageShowResult, setStageShowResult] = useState<boolean[]>(() => Array(CURRENT_STAGES.length).fill(false));
  
  // حالة التحليل
  const [isAutoAnalyzing, setIsAutoAnalyzing] = useState(false);
  const [currentAnalyzingStage, setCurrentAnalyzingStage] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisError, setAnalysisError] = useState('');
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<string>('');
  
  // حالة منظم القضية
  const [showCaseOrganizer, setShowCaseOrganizer] = useState(false);
  
  // دوال منظم القضية
  const handleOrganizeCase = () => {
    if (!mainText.trim()) {
      alert('يرجى إدخال تفاصيل القضية أولاً');
      return;
    }
    setShowCaseOrganizer(true);
  };

  const handleCaseOrganized = (organizedText: string) => {
    setMainText(organizedText);
    setShowCaseOrganizer(false);
  };

  const handleCancelOrganizer = () => {
    setShowCaseOrganizer(false);
  };
  
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
  
  // حالة حفظ المراحل التلقائي
  const [currentAnalysisCase, setCurrentAnalysisCase] = useState<LegalCase | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // متغيرات أخرى
  const [existingCases, setExistingCases] = useState<LegalCase[]>([]);
  const [selectedStageForCollab, setSelectedStageForCollab] = useState<string | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // تحديث حجم arrays النتائج عند تغيير عدد المراحل المفتوحة
  useEffect(() => {
    const currentStagesLength = CURRENT_STAGES.length;
    const resultsLength = stageResults.length;
    
    if (currentStagesLength !== resultsLength) {
      console.log(`🔄 تحديث المراحل من ${resultsLength} إلى ${currentStagesLength} مرحلة`);
      
      // تحديث حجم arrays مع الحفاظ على النتائج الموجودة
      setStageResults(prev => {
        const newResults = Array(currentStagesLength).fill(null);
        // نسخ النتائج الموجودة
        for (let i = 0; i < Math.min(prev.length, currentStagesLength); i++) {
          newResults[i] = prev[i];
        }
        return newResults;
      });
      
      setStageLoading(prev => {
        const newLoading = Array(currentStagesLength).fill(false);
        for (let i = 0; i < Math.min(prev.length, currentStagesLength); i++) {
          newLoading[i] = prev[i];
        }
        return newLoading;
      });
      
      setStageErrors(prev => {
        const newErrors = Array(currentStagesLength).fill(null);
        for (let i = 0; i < Math.min(prev.length, currentStagesLength); i++) {
          newErrors[i] = prev[i];
        }
        return newErrors;
      });
      
      setStageShowResult(prev => {
        const newShow = Array(currentStagesLength).fill(false);
        for (let i = 0; i < Math.min(prev.length, currentStagesLength); i++) {
          newShow[i] = prev[i];
        }
        return newShow;
      });
    }
  }, [unlockedStages, CURRENT_STAGES.length]);

  // تحميل المراحل المحفوظة تلقائياً عند تغيير اسم القضية أو نوعها
  useEffect(() => {
    const loadSavedData = async () => {
      if (caseNameInput.trim() || selectedCaseTypes.length > 0) {
        await loadSavedStagesFromDatabase();
      }
    };
    
    // تأخير قصير لضمان اكتمال تحديث CURRENT_STAGES
    const timeoutId = setTimeout(loadSavedData, 500);
    
    return () => clearTimeout(timeoutId);
  }, [caseNameInput, selectedCaseTypes, CURRENT_STAGES.length]);

  // خاصية فتح مراحل إضافية تدريجياً (نظام ثابت: 17 مرحلة)
  const unlockNextStages = () => {
    const completedStages = stageResults.filter(result => result !== null).length;
    const currentUnlockedStages = unlockedStages;
    const totalFixedStages = 17; // 12 أساسية + 4 متقدمة + 1 عريضة
    
    // فتح مراحل إضافية عند إنجاز 80% من المراحل الحالية
    const completionRate = completedStages / currentUnlockedStages;
    
    if (completionRate >= 0.8 && unlockedStages < totalFixedStages) {
      const newUnlockedStages = Math.min(
        totalFixedStages,
        unlockedStages + 3 // فتح 3 مراحل إضافية
      );
      
      console.log(`🔓 فتح مراحل جديدة: ${unlockedStages} -> ${newUnlockedStages}`);
      setUnlockedStages(newUnlockedStages);
      
      // عرض إشعار الفتح
      setShowUnlockNotification(`🎉 تم فتح ${newUnlockedStages - unlockedStages} مراحل جديدة!`);
      setTimeout(() => setShowUnlockNotification(null), 4000);
      
      // تحديث المرحلة
      if (newUnlockedStages <= 8) {
        setCurrentPhase('intermediate');
      } else if (newUnlockedStages <= 15) {
        setCurrentPhase('advanced');
      } else {
        setCurrentPhase('complete');
      }
    }
  };

  // دالة فتح جميع المراحل (ديناميكي بناءً على الدمج)
  const unlockAllStages = () => {
    const totalStages = ALL_POSSIBLE_STAGES.length;
    console.log(`🔓 فتح جميع المراحل: ${totalStages} مرحلة`);
    setUnlockedStages(totalStages);
    setCurrentPhase('complete');
    
    setShowUnlockNotification(`🔓 تم فتح جميع المراحل (${totalStages} مرحلة)`);
    setTimeout(() => setShowUnlockNotification(null), 4000);
    
    console.log(`✅ تم فتح جميع المراحل: ${totalStages} مرحلة`);
  };

  // دالة اقتراح المرحلة التالية
  const getNextRecommendedStage = (): number | null => {
    const completedCount = stageResults.filter(r => r !== null).length;
    if (completedCount < unlockedStages) {
      return completedCount; // أول مرحلة غير مكتملة
    }
    return null;
  };

  // إعادة ضبط عند تغيير نوع القضية (ديناميكي)
  useEffect(() => {
    const totalStages = ALL_POSSIBLE_STAGES.length;
    console.log(`🔄 تحديث عدد المراحل وفق التخصص: ${totalStages} مرحلة`);
    // إعادة ضبط عدد المراحل المفتوحة إلى 5 كبداية
    const initialStages = 5;
    setUnlockedStages(initialStages);
    setCurrentPhase('essential');
    
    // مسح النتائج السابقة عند تغيير نوع القضية
    setStageResults(Array(initialStages).fill(null));
    setStageLoading(Array(initialStages).fill(false));
    setStageErrors(Array(initialStages).fill(null));
    setStageShowResult(Array(initialStages).fill(false));
    
    console.log(`✅ تم إعادة ضبط النظام: ${initialStages} مراحل مفتوحة`);
  }, [selectedCaseTypes, ALL_POSSIBLE_STAGES.length]);

  // تحديث حجم arrays النتائج عند تغيير عدد المراحل المفتوحة
  useEffect(() => {
    const currentStagesLength = CURRENT_STAGES.length;
    const resultsLength = stageResults.length;
    
    if (currentStagesLength !== resultsLength) {
      console.log(`🔄 تحديث المراحل من ${resultsLength} إلى ${currentStagesLength} مرحلة`);
      
      // تحديث حجم arrays مع الحفاظ على النتائج الموجودة
      setStageResults(prev => {
        const newResults = Array(currentStagesLength).fill(null);
        // نسخ النتائج الموجودة
        for (let i = 0; i < Math.min(prev.length, currentStagesLength); i++) {
          newResults[i] = prev[i];
        }
        return newResults;
      });
      
      setStageLoading(prev => {
        const newLoading = Array(currentStagesLength).fill(false);
        for (let i = 0; i < Math.min(prev.length, currentStagesLength); i++) {
          newLoading[i] = prev[i];
        }
        return newLoading;
      });
      
      setStageErrors(prev => {
        const newErrors = Array(currentStagesLength).fill(null);
        for (let i = 0; i < Math.min(prev.length, currentStagesLength); i++) {
          newErrors[i] = prev[i];
        }
        return newErrors;
      });
      
      setStageShowResult(prev => {
        const newShow = Array(currentStagesLength).fill(false);
        for (let i = 0; i < Math.min(prev.length, currentStagesLength); i++) {
          newShow[i] = prev[i];
        }
        return newShow;
      });
    }
  }, [unlockedStages, CURRENT_STAGES.length]);

  // تحميل المراحل المحفوظة عند تغيير النص أو اسم القضية
  useEffect(() => {
    if (mainText && mainText.length > 10) {
      loadSavedStagesFromDatabase();
    }
  }, [mainText, caseNameInput]);

  // تحميل المراحل المحفوظة عند بدء التطبيق
  useEffect(() => {
    loadExistingCases();
  }, []);

  // تشغيل فتح المراحل عند إنجاز مراحل
  useEffect(() => {
    unlockNextStages();
    
    // احتفال عند إنجاز جميع المراحل
    const completedCount = stageResults.filter(r => r !== null && r !== '').length;
    if (completedCount === unlockedStages && completedCount >= 12) {
      setShowUnlockNotification('🎉 مبروك! تم إنجاز جميع المراحل المتاحة!');
      setTimeout(() => setShowUnlockNotification(null), 5000);
    }
  }, [stageResults]);

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

  // تحميل القضايا الموجودة - محسن لعرض جميع القضايا
  const loadExistingCases = async () => {
    try {
      const cases = await getAllCases();
      console.log('📝 تم تحميل', cases.length, 'قضية من قاعدة البيانات');
      
      // عرض جميع القضايا التي لديها مراحل (مع زيادة الحد إلى 15)
      const incompleteCases = cases.filter((caseItem: LegalCase) => 
        caseItem.stages && caseItem.stages.length > 0 && caseItem.stages.length < 15
      );
      
      console.log('🔄 قضايا غير مكتملة:', incompleteCases.length);
      setExistingCases(incompleteCases);
    } catch (error) {
      console.error('خطأ في تحميل القضايا:', error);
    }
  };

  // اختيار قضية لاستكمال التحليل
  const handleSelectExistingCase = (caseId: string) => {
    const selectedCase = existingCases.find(c => c.id === caseId);
    if (selectedCase) {
      setMainText(selectedCase.stages[0]?.input || selectedCase.name || '');
      setCaseNameInput(selectedCase.name);
      
      // تحديث النتائج السابقة
      const existingResults = selectedCase.stages.map(stage => stage.output);
      const filledResults = [...existingResults];
      while (filledResults.length < ALL_POSSIBLE_STAGES.length) {
        filledResults.push('');
      }
      setStageResults(filledResults);
      
      // عرض النتائج الموجودة
      setStageShowResult(filledResults.map((_, i) => i < existingResults.length));
      
      console.log(`تم تحميل قضية: ${selectedCase.name} (${existingResults.length} مراحل مكتملة)`);
    }
  };

  // دالة تحميل المراحل المحفوظة سابقاً (عند بدء التطبيق)
  const loadSavedStagesFromDatabase = async () => {
    try {
      const caseName = caseNameInput.trim() || 
        `قضية ${selectedCaseTypes[0] || 'عام'} - ${new Date().toLocaleDateString('ar')}`;
      
      const allCases: LegalCase[] = await getAllCases();
      const existing = allCases.find((c: LegalCase) => c.name === caseName);
      
      if (existing && existing.stages.length > 0) {
        console.log(`💼 تم العثور على قضية محفوظة: ${caseName} بها ${existing.stages.length} مراحل`);
        
        // ترتيب المراحل حسب الفهرس
        const sortedStages = existing.stages.sort((a, b) => a.stageIndex - b.stageIndex);
        
        // إعادة تعبئة النتائج في الواجهة
        const loadedResults = Array(CURRENT_STAGES.length).fill(null);
        const loadedShowResults = Array(CURRENT_STAGES.length).fill(false);
        
        sortedStages.forEach(stage => {
          if (stage.stageIndex < CURRENT_STAGES.length) {
            loadedResults[stage.stageIndex] = stage.output;
            loadedShowResults[stage.stageIndex] = true;
          }
        });
        
        setStageResults(loadedResults);
        setStageShowResult(loadedShowResults);
        setCurrentAnalysisCase(existing); // حفظ مرجع القضية الحالية
        
        const completedCount = loadedResults.filter(r => r !== null).length;
        console.log(`✅ تم استعادة ${completedCount} مراحل محفوظة`);
        
        // عرض إشعار للمستخدم
        if (completedCount > 0) {
          setShowUnlockNotification(`🔄 تم استعادة ${completedCount} مراحل محفوظة من قبل`);
          setTimeout(() => setShowUnlockNotification(null), 4000);
        }
        
        return true; // تم تحميل مراحل محفوظة
      }
      
      return false; // لا توجد مراحل محفوظة
      
    } catch (error) {
      console.error('❌ خطأ في تحميل المراحل المحفوظة:', error);
      return false;
    }
  };

  // دالة حفظ مرحلة واحدة فور اكتمالها (تحديث تلقائي)
  const saveCompletedStageToDatabase = async (stageIndex: number, stageOutput: string) => {
    try {
      const caseName = caseNameInput.trim() || 
        `قضية ${selectedCaseTypes[0] || 'عام'} - ${new Date().toLocaleDateString('ar')}`;
      
      const newStage = {
        id: `${stageIndex}-${btoa(unescape(encodeURIComponent(mainText))).slice(0,8)}-${Date.now()}`,
        stageIndex,
        stage: CURRENT_STAGES[stageIndex],
        input: mainText,
        output: stageOutput,
        date: new Date().toISOString(),
      };
      
      const allCases: LegalCase[] = await getAllCases();
      const existing = allCases.find((c: LegalCase) => c.name === caseName);
      
      if (existing) {
        // تحديث المرحلة إذا كانت موجودة، أو إضافة مرحلة جديدة
        const stageExists = existing.stages.findIndex(s => s.stageIndex === stageIndex);
        if (stageExists >= 0) {
          existing.stages[stageExists] = newStage;
          console.log(`📝 تم تحديث المرحلة ${stageIndex + 1} في القضية: ${caseName}`);
        } else {
          existing.stages.push(newStage);
          console.log(`➕ تم إضافة المرحلة ${stageIndex + 1} إلى القضية: ${caseName}`);
        }
        
        // ترتيب المراحل حسب الفهرس
        existing.stages.sort((a, b) => a.stageIndex - b.stageIndex);
        await updateCase(existing);
      } else {
        // إنشاء قضية جديدة
        const newCaseId = `${caseName}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
        await addCase({
          id: newCaseId,
          name: caseName,
          createdAt: newStage.date,
          stages: [newStage],
        });
        console.log(`🆕 تم إنشاء قضية جديدة وحفظ المرحلة ${stageIndex + 1}: ${caseName}`);
      }
      
      // تحديث قائمة القضايا الموجودة
      loadExistingCases();
      
    } catch (error) {
      console.error(`❌ خطأ في حفظ المرحلة ${stageIndex + 1}:`, error);
    }
  };

  // دالة عرض معلومات التقدم المحفوظ
  const getSavedProgressInfo = () => {
    const completedCount = stageResults.filter(r => r !== null).length;
    const totalCount = CURRENT_STAGES.length;
    const progressPercentage = Math.round((completedCount / totalCount) * 100);
    
    return {
      completedCount,
      totalCount,
      progressPercentage,
      hasProgress: completedCount > 0
    };
  };
  const startSmartAnalysis = async () => {
    console.log('🧠 بدء التحليل الذكي المحسن...');
    
    // فحص المراحل المكتملة للاستكمال الذكي
    const completedStages = stageResults.map((result, index) => ({
      index,
      isCompleted: result !== null && result !== '',
      result: result || ''
    }));
    
    const lastCompletedIndex = completedStages.reverse().find(stage => stage.isCompleted)?.index ?? -1;
    const firstIncompleteIndex = lastCompletedIndex + 1;
    
    console.log(`📊 آخر مرحلة مكتملة: ${lastCompletedIndex + 1}، سيبدأ التحليل من المرحلة: ${firstIncompleteIndex + 1}`);
    
    const manager = new SmartSequentialAnalysisManager(
      CURRENT_STAGES, // استخدام المراحل المحدثة بناءً على نوع القضية
      smartAnalysisConfig,
      (progress: any) => {
        setSmartAnalysisProgress(progress);
        setCurrentAnalyzingStage(progress.currentStage);
        setAnalysisProgress(progress.progress);
        setIsAutoAnalyzing(progress.isRunning);
        
        // عرض فوري لنتائج المراحل المكتملة
        if (progress.type === 'stage_completed' && progress.displayImmediate) {
          // تحديث النتائج فورًا في الواجهة
          setStageResults(prev => {
            const newResults = [...prev];
            newResults[progress.stageIndex] = progress.result;
            return newResults;
          });
          
          setStageShowResult(prev => {
            const newShow = [...prev];
            newShow[progress.stageIndex] = true;
            return newShow;
          });
          
          console.log(`📝 تم عرض نتيجة المرحلة ${progress.stageIndex + 1} فورًا`);
          
          // حفظ المرحلة فور اكتمالها في قاعدة البيانات
          saveCompletedStageToDatabase(progress.stageIndex, progress.result);
        }
        
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
            
            // حفظ المرحلة فور اكتمالها
            saveCompletedStageToDatabase(index, stage.output);
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
    setCanPauseResume(true); // تفعيل إمكانية الإيقاف المؤقت والاستئناف
    
    try {
      // إذا كانت هناك مراحل مكتملة، استخدم الاستكمال الذكي
      const result = lastCompletedIndex >= 0 ? 
        await manager.resumeFromStage(
          firstIncompleteIndex,
          mainText,
          apiKey,
          {
            partyRole: partyRole || undefined,
            caseType: selectedCaseTypes[0] || 'عام',
            preferredModel,
            selectedCaseTypes,
            caseComplexity,
            // تمرير النتائج السابقة كسياق
            previousResults: stageResults.slice(0, firstIncompleteIndex).filter(r => r !== null)
          }
        ) :
        await manager.startSmartAnalysis(
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
      setCanPauseResume(false); // إلغاء إمكانية الإيقاف المؤقت عند انتهاء التحليل
    }
  };

  const startStandardAnalysis = async () => {
    // دالة التحليل العادي (للاحتياط)
    console.log('🚀 بدء التحليل العادي...');
    // التنفيذ يمكن إضافته لاحقاً إذا لزم الأمر
  };

  const stopAutoAnalysis = () => {
    console.log('⏹️ إيقاف التحليل بناءً على طلب المستخدم...');
    
    if (smartAnalysisManager) {
      console.log('⚙️ إيقاف مدير التحليل الذكي...');
      smartAnalysisManager.stop();
    }
    if (sequentialAnalysisManager) {
      console.log('⚙️ إيقاف مدير التحليل العادي...');
      sequentialAnalysisManager.stop();
    }
    
    setIsAutoAnalyzing(false);
    setCanPauseResume(false); // إلغاء إمكانية الإيقاف المؤقت عند الإيقاف
    
    console.log('✅ تم إيقاف التحليل بنجاح');
  };

  const togglePauseResume = () => {
    if (smartAnalysisManager) {
      if (smartAnalysisProgress?.isPaused) {
        console.log('♾️ استئناف التحليل الذكي...');
        smartAnalysisManager.resume();
      } else {
        console.log('⏸️ إيقاف مؤقت للتحليل الذكي...');
        smartAnalysisManager.pause();
      }
    }
    if (sequentialAnalysisManager) {
      if (sequentialProgress?.isPaused) {
        console.log('♾️ استئناف التحليل العادي...');
        sequentialAnalysisManager.resume();
      } else {
        console.log('⏸️ إيقاف مؤقت للتحليل العادي...');
        sequentialAnalysisManager.pause();
      }
    }
  };

  // دالة تحليل مرحلة واحدة
  const handleAnalyzeStage = async (idx: number) => {
    // إذا كانت المرحلة الأخيرة (العريضة النهائية)
    if (idx === CURRENT_STAGES.length - 1) {
      setStageLoading(arr => arr.map((v, i) => i === idx ? true : v));
      setStageErrors(arr => arr.map((v, i) => i === idx ? null : v));
      setStageResults(arr => arr.map((v, i) => i === idx ? null : v));
      setStageShowResult(arr => arr.map((v, i) => i === idx ? false : v));
      if (!apiKey) {
        setStageErrors(arr => arr.map((v, i) => i === idx ? 'يرجى إعداد مفتاح Gemini API من صفحة الإعدادات أولاً.' : v));
        setStageLoading(arr => arr.map((v, i) => i === idx ? false : v));
        return;
      }
      const summaries = stageResults.slice(0, idx).filter(r => !!r);
      if (summaries.length === 0) {
        setStageErrors(arr => arr.map((v, i) => i === idx ? 'يرجى تحليل المراحل أولاً قبل توليد العريضة النهائية.' : v));
        setStageLoading(arr => arr.map((v, i) => i === idx ? false : v));
        return;
      }
      try {
        const modelToUse = /pro|1\.5-pro|2\.0|ultra/i.test(preferredModel) ? 'gemini-1.5-flash' : preferredModel;
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-model': modelToUse },
          body: JSON.stringify({ text: mainText, stageIndex: -1, apiKey, previousSummaries: summaries, finalPetition: true, partyRole: partyRole || undefined }),
        });
        const data = await res.json();
        if (res.ok) {
          setStageResults(arr => arr.map((v, i) => i === idx ? data.analysis : v));
          setTimeout(() => setStageShowResult(arr => arr.map((v, i) => i === idx ? true : v)), 100);
        } else {
          const { code, message } = extractApiError(res, data);
          const mapped = mapApiErrorToMessage(code, message || data.error);
          setStageErrors(arr => arr.map((v, i) => i === idx ? (mapped || 'حدث خطأ أثناء توليد العريضة النهائية') : v));
        }
      } catch {
        setStageErrors(arr => arr.map((v, i) => i === idx ? 'تعذر الاتصال بالخادم' : v));
      } finally {
        setStageLoading(arr => arr.map((v, i) => i === idx ? false : v));
      }
      return;
    }
    setStageLoading(arr => arr.map((v, i) => i === idx ? true : v));
    setStageErrors(arr => arr.map((v, i) => i === idx ? null : v));
    setStageResults(arr => arr.map((v, i) => i === idx ? null : v));
    setStageShowResult(arr => arr.map((v, i) => i === idx ? false : v));
    if (!apiKey) {
      setStageErrors(arr => arr.map((v, i) => i === idx ? 'يرجى إعداد مفتاح Gemini API من صفحة الإعدادات أولاً.' : v));
      setStageLoading(arr => arr.map((v, i) => i === idx ? false : v));
      return;
    }
    const text = mainText;
    if (!text.trim()) {
      setStageErrors(arr => arr.map((v, i) => i === idx ? 'يرجى إدخال تفاصيل القضية.' : v));
      setStageLoading(arr => arr.map((v, i) => i === idx ? false : v));
      return;
    }
    // جمع ملخصات المراحل السابقة (النتائج غير الفارغة فقط)
    let previousSummaries = stageResults.slice(0, idx).filter(r => !!r);
    // حدود الطول (تقريبي: 8000 tokens ≈ 24,000 حرف)
    const MAX_CHARS = 24000;
    let totalLength = previousSummaries.reduce((acc, cur) => acc + (cur?.length || 0), 0);
    // إذا تجاوز الطول، احذف أقدم النتائج حتى لا يتجاوز الحد
    while (totalLength > MAX_CHARS && previousSummaries.length > 1) {
      previousSummaries = previousSummaries.slice(1);
      totalLength = previousSummaries.reduce((acc, cur) => acc + (cur?.length || 0), 0);
    }
    try {
      const modelToUse = /pro|1\.5-pro|2\.0|ultra/i.test(preferredModel) ? 'gemini-1.5-flash' : preferredModel;
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-model': modelToUse },
        body: JSON.stringify({ text, stageIndex: idx, apiKey, previousSummaries, partyRole: partyRole || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setStageResults(arr => arr.map((v, i) => i === idx ? data.analysis : v));
        setTimeout(() => setStageShowResult(arr => arr.map((v, i) => i === idx ? true : v)), 100);
        // حفظ التحليل ضمن نفس القضية إن وُجدت، وإلا إنشاؤها
        const caseName = caseNameInput.trim() ? caseNameInput.trim() : `قضية بدون اسم - ${Date.now()}`;
        const newStage = {
          id: `${idx}-${btoa(unescape(encodeURIComponent(text))).slice(0,8)}-${Date.now()}`,
          stageIndex: idx,
          stage: CURRENT_STAGES[idx],
          input: text,
          output: data.analysis,
          date: new Date().toISOString(),
        };
        const allCases: LegalCase[] = await getAllCases();
        const existing = allCases.find((c: LegalCase) => c.name === caseName);
        if (existing) {
          existing.stages.push(newStage);
          await updateCase(existing);
        } else {
        const newCaseId = `${caseName}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
        await addCase({
          id: newCaseId,
          name: caseName,
          createdAt: newStage.date,
          stages: [newStage],
        });
        }
      } else {
        const { code, message } = extractApiError(res, data);
        const mapped = code === 'RATE_LIMIT_EXCEEDED'
          ? 'لقد تجاوزت الحد المسموح به لعدد الطلبات على خدمة Gemini API. يرجى الانتظار دقيقة ثم إعادة المحاولة.'
          : mapApiErrorToMessage(code, message || data.error);
        setStageErrors(arr => arr.map((v, i) => i === idx ? (mapped || 'حدث خطأ أثناء التحليل') : v));
      }
    } catch {
      setStageErrors(arr => arr.map((v, i) => i === idx ? 'تعذر الاتصال بالخادم' : v));
    } finally {
      setStageLoading(arr => arr.map((v, i) => i === idx ? false : v));
    }
  };
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
                  setPartyRole={(role: string) => setPartyRole(role as PartyRole | '')}
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
                    gridTemplateColumns: isMobile() ? '1fr' : '1fr 1fr',
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
                    {CURRENT_STAGES.slice(0, 8).map((stageName, index) => {
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
                  
                  {CURRENT_STAGES.length > 8 && (
                    <div style={{
                      marginTop: 12,
                      fontSize: 12,
                      color: theme.text,
                      opacity: 0.7,
                      textAlign: 'center'
                    }}>
                      👇 انتقل إلى قسم "عرض جميع المراحل" أدناه لرؤية باقي المراحل ({CURRENT_STAGES.length - 8} مراحل إضافية)
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
                  allStages={CURRENT_STAGES}
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
                  allStages={CURRENT_STAGES}
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
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">📋 النتائج التفصيلية</h3>
                  <StageResults
                    stageResults={stageResults}
                    stageShowResult={stageShowResult}
                    stageErrors={stageErrors}
                    allStages={CURRENT_STAGES}
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