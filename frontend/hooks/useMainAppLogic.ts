import { useState, useEffect, useMemo } from 'react';
import { saveApiKey, loadApiKey, addCase, getAllCases, updateCase, LegalCase } from '@utils/db';
import { buildSpecializedStages } from '../types/caseTypes';
import stagesDef from '../stages';
import type { StageDetails } from '../types/analysis';
import { 
  SequentialAnalysisManager, 
  DEFAULT_LEGAL_STAGES,
  AnalysisProgress,
  AnalysisStage as SequentialAnalysisStage
} from '../utils/sequentialAnalysisManager';
import { SmartSequentialAnalysisManager, ROBUST_ANALYSIS_CONFIG, PATIENT_ANALYSIS_CONFIG } from '../utils/smartSequentialAnalysis';
import { detectCaseType, analyzeCaseComplexity } from '../utils/caseTypeDetection';
import { generateCustomStages } from '../utils/customStages';
import { mapApiErrorToMessage, extractApiError } from '@utils/errors';

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

type PartyRole = 'المشتكي' | 'المشتكى عليه' | 'المدعي' | 'المدعى عليه';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const useMainAppLogic = (theme: any, isMobile: () => boolean) => {
  // الحالة الأساسية
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'stages' | 'results'>('input');
  const [currentPhase, setCurrentPhase] = useState<'essential' | 'intermediate' | 'advanced' | 'complete'>('essential');
  
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
  
  // نظام الكشف التلقائي - البدء بـ "عام" لضمان عرض المراحل الأساسية فقط عند عدم اختيار نوع محدد
  const [selectedCaseTypes, setSelectedCaseTypes] = useState<string[]>(['عام']);
  const [caseComplexity, setCaseComplexity] = useState<any>(null);
  const [customStages, setCustomStages] = useState<any[]>([]);
  const [showCustomStages, setShowCustomStages] = useState(false);
  const [oldSystemDetection] = useState<string>('أحوال شخصية');
  
  // تحديد المراحل عند تغيير نوع القضية - باستخدام useMemo للأداء
  const CURRENT_STAGES = useMemo(() => {
    const baseStages = STAGES; // المراحل الأساسية (12 مرحلة)
    const finalStage = FINAL_STAGE; // المرحلة الأخيرة
    
    console.log('🔍 فحص أنواع القضايا المختارة:', selectedCaseTypes);
    
    // إذا لم يتم اختيار أي نوع أو كان "عام" فقط، أعرض المراحل الأساسية فقط
    if (!selectedCaseTypes || selectedCaseTypes.length === 0 || 
        (selectedCaseTypes.length === 1 && selectedCaseTypes[0] === 'عام')) {
      console.log('✅ عرض المراحل الأساسية فقط (13 مرحلة) - الأنواع:', selectedCaseTypes);
      return [...baseStages, finalStage];
    }
    
    // تفيلتر الأنواع لاستبعاد "عام" عند وجود أنواع أخرى
    const filteredTypes = selectedCaseTypes.filter(type => type !== 'عام');
    
    if (filteredTypes.length === 0) {
      console.log('✅ عرض المراحل الأساسية فقط - لا توجد أنواع مخصصة');
      return [...baseStages, finalStage];
    }
    
    // إنشاء المراحل المخصصة بناءً على نوع القضية المختار
    try {
      const customStagesForCase = generateCustomStages(filteredTypes);
      const relevantCustomStages = customStagesForCase
        .filter(stage => stage.isRequired || filteredTypes.some(type => stage.caseTypes.includes(type)))
        .slice(0, 6); // حد أقصى 6 مراحل مخصصة لتجنب الإرهاق
      
      // دمج المراحل: الأساسية + المخصصة + النهائية
      const combinedStages = [
        ...baseStages, // المراحل الأساسية (12 مرحلة)
        ...relevantCustomStages.map(stage => stage.name), // المراحل المخصصة (حتى 6 مراحل)
        finalStage // المرحلة الأخيرة
      ];
      
      console.log(`🎯 تم إنشاء ${combinedStages.length} مرحلة لأنواع القضايا: ${filteredTypes.join('، ')} (منها ${relevantCustomStages.length} مراحل مخصصة)`);
      return combinedStages;
    } catch (error) {
      console.error('خطأ في إنشاء المراحل المخصصة:', error);
      console.log('☠️ العودة للمراحل الأساسية بسبب خطأ');
      return [...baseStages, finalStage]; // العودة للمراحل الأساسية في حالة الخطأ
    }
  }, [selectedCaseTypes]);
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
      // المراحل المتقدمة الإضافية الـ4:
      'المرحلة الثالثة عشرة: تحليل المخاطر القانونية',
      'المرحلة الرابعة عشرة: استراتيجية الدفاع/الادعاء',
      'المرحضة الخامسة عشرة: خطة التنفيذ العملي',
      'المرحلة السادسة عشرة: تحليل التكلفة والوقت',
      finalStage // العريضة النهائية
    ];
    
    console.log(`📁 النظام الثابت: ${first12BasicStages.length} مرحلة أساسية + 4 مراحل متقدمة + 1 عريضة = ${fixedStages.length} مرحلة إجمالي`);
    console.log(`🔍 المراحل الأساسية الـ 12:`, first12BasicStages);
    console.log(`🔍 قائمة المراحل الثابتة النهائية:`, fixedStages);
    return fixedStages;
  };
  
  // دمج المراحل الأساسية مع مراحل التخصص المختارة
  const ALL_POSSIBLE_STAGES = useMemo(() => {
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

  const CURRENT_STAGES_FINAL = ALL_POSSIBLE_STAGES.slice(0, unlockedStages);
  
  // نتائج المراحل
  const [stageResults, setStageResults] = useState<(string|null)[]>(() => Array(CURRENT_STAGES_FINAL.length).fill(null));
  
  // دالة تحويل البيانات للمكون المحسن
  const getEnhancedStageData = () => {
    const totalStages = CURRENT_STAGES_FINAL.length;
    const completedStages = stageResults.filter(result => result !== null && result !== '').length;
    const failedStages = stageErrors.filter(error => error !== null).length;
    const totalTime = 0; // يمكن حساب الوقت الفعلي لاحقاً
    
    const stages = CURRENT_STAGES_FINAL.map((stageName, index) => {
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
  const [stageLoading, setStageLoading] = useState<boolean[]>(() => Array(CURRENT_STAGES_FINAL.length).fill(false));
  const [stageErrors, setStageErrors] = useState<(string|null)[]>(() => Array(CURRENT_STAGES_FINAL.length).fill(null));
  const [stageShowResult, setStageShowResult] = useState<boolean[]>(() => Array(CURRENT_STAGES_FINAL.length).fill(false));
  
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
    const currentStagesLength = CURRENT_STAGES_FINAL.length;
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
  }, [unlockedStages, CURRENT_STAGES_FINAL.length]);

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
  }, [caseNameInput, selectedCaseTypes, CURRENT_STAGES_FINAL.length]);

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
    const currentStagesLength = CURRENT_STAGES_FINAL.length;
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
  }, [unlockedStages, CURRENT_STAGES_FINAL.length]);

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
        const loadedResults = Array(CURRENT_STAGES_FINAL.length).fill(null);
        const loadedShowResults = Array(CURRENT_STAGES_FINAL.length).fill(false);
        
        sortedStages.forEach(stage => {
          if (stage.stageIndex < CURRENT_STAGES_FINAL.length) {
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
        stage: CURRENT_STAGES_FINAL[stageIndex],
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
    const totalCount = CURRENT_STAGES_FINAL.length;
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
      CURRENT_STAGES_FINAL, // استخدام المراحل المحدثة بناءً على نوع القضية
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
    if (idx === CURRENT_STAGES_FINAL.length - 1) {
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
          stage: CURRENT_STAGES_FINAL[idx],
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

  return {
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
  };
};