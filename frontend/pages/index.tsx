import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { mapApiErrorToMessage, extractApiError } from '@utils/errors';
import { saveApiKey, loadApiKey, addCase, getAllCases, updateCase, LegalCase } from '@utils/db';
import { isMobile } from '@utils/crypto';
import { useTheme } from '../contexts/ThemeContext';
import LandingPage from '../components/LandingPage';

// تمت إزالة بطاقات المقالات
import { exportResultsToPDF, exportResultsToDocx } from '@utils/export';
import { loadExportPreferences } from '@utils/exportSettings';
import { Button } from '../components/UI';
// تمت إزالة الودجت المدمج للمدقق المرجعي من الواجهة الرئيسية بناءً على طلب المستخدم
import CollabPanel from '../components/CollabPanel';
// تم حذف استيراد أنواع المدقق المرجعي لعدم الحاجة هنا
import stagesDef from '../stages';
import type { StageDetails } from '../types/analysis';
// تم حذف نظام المصادقة لجعل الموقع عاماً


// تعريف نوع BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// تحميل المراحل ديناميكياً من تعريف `stages` مع ترتيب ثابت حسب order
const STAGES = Object.keys(stagesDef).sort((a, b) => {
  const da = (stagesDef as Record<string, StageDetails>)[a]?.order ?? 9999;
  const db = (stagesDef as Record<string, StageDetails>)[b]?.order ?? 9999;
  return da - db;
});

const FINAL_STAGE = 'المرحلة الثالثة عشرة: العريضة القانونية النهائية';
const ALL_STAGES = [...STAGES, FINAL_STAGE];

type PartyRole = 'المشتكي' | 'المشتكى عليه' | 'المدعي' | 'المدعى عليه';

export default function Home() {
  const [showLandingPage, setShowLandingPage] = useState(true);
  
  // Check if user has visited before
  useEffect(() => {
    try {
      const hasVisited = localStorage.getItem('hasVisited');
      if (hasVisited) {
        setShowLandingPage(false);
      }
    } catch (error) {
      // إذا فشل الوصول إلى localStorage، نعرض الصفحة الأولى
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
  const [apiKey, setApiKey] = useState('');
  const [caseNameInput, setCaseNameInput] = useState('');
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'stages' | 'results'>('input');
  const [mounted, setMounted] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const prevApiKey = useRef("");


  // لكل مرحلة: نص، نتيجة، تحميل، خطأ، إظهار نتيجة
  const [mainText, setMainText] = useState('');
  const [stageResults, setStageResults] = useState<(string|null)[]>(() => Array(ALL_STAGES.length).fill(null));
  const [stageLoading, setStageLoading] = useState<boolean[]>(() => Array(ALL_STAGES.length).fill(false));
  const [stageErrors, setStageErrors] = useState<(string|null)[]>(() => Array(ALL_STAGES.length).fill(null));
  const [stageShowResult, setStageShowResult] = useState<boolean[]>(() => Array(ALL_STAGES.length).fill(false));
  const [partyRole, setPartyRole] = useState<PartyRole | ''>('');
  const [preferredModel, setPreferredModel] = useState<string>('gemini-1.5-flash');
  const [caseType, setCaseType] = useState<string>('عام');
  const [stageGating, setStageGating] = useState<boolean>(true);
  const [showDeadlines, setShowDeadlines] = useState<boolean>(true);
  // تمت إزالة إشعارات المراجع المكتشفة من الصفحة الرئيسية
  const [selectedStageForCollab, setSelectedStageForCollab] = useState<string | null>(null);
  const collabRef = useRef<HTMLDivElement | null>(null);
  // تم حذف حالة المستخدم الحالي

  // متغيرات التحليل التلقائي
  const [isAutoAnalyzing, setIsAutoAnalyzing] = useState(false);
  const [currentAnalyzingStage, setCurrentAnalyzingStage] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisError, setAnalysisError] = useState('');

  useEffect(() => {
    setMounted(true);
    
    // استرجاع نوع القضية من التخزين المحلي
    try {
      const savedCaseType = localStorage.getItem('selected_case_type');
      if (savedCaseType) setCaseType(savedCaseType);
    } catch {}


    // تحميل مفتاح API من قاعدة البيانات عند بدء التشغيل
    loadApiKey().then(val => {
      if (val) setApiKey(val);
    });
    // تحميل نموذج مفضّل + تفضيلات لوحة التحكم من SQLite
    (async () => {
      const [{ loadAppSettings }, { dbBridge }] = await Promise.all([
        import('@utils/appSettings'),
        import('@utils/db.bridge')
      ]);
      const s = await loadAppSettings();
      setPreferredModel(s.preferredModel || 'gemini-1.5-flash');
      try {
        await dbBridge.init();
        const [p1,p2,p3,p4] = await Promise.all([
          dbBridge.getPreference('default_case_type'),
          dbBridge.getPreference('default_party_role'),
          dbBridge.getPreference('stage_gating_enabled'),
          dbBridge.getPreference('show_deadlines_enabled'),
        ]);
        if (p1) setCaseType(p1);
        if (p2) setPartyRole((p2 as PartyRole) || '');
        if (p3) setStageGating(p3 === '1');
        if (p4) setShowDeadlines(p4 === '1');
      } catch {}
    })();

    // معالجة تثبيت التطبيق كتطبيق أيقونة
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // التحقق من وجود التطبيق مثبت
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false);
    }

    // مراقبة حجم الشاشة

    // تم حذف تحميل بيانات المستخدم
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // ابدأ مباشرة على تبويب مراحل التحليل إذا أتينا من CTA
  useEffect(() => {
    try {
      const start = localStorage.getItem('start_on_stages');
      if (start === '1') {
        setActiveTab('stages');
        localStorage.removeItem('start_on_stages');
      }
    } catch {}
  }, []);

  // حفظ نوع القضية محلياً
  useEffect(() => {
    try { localStorage.setItem('selected_case_type', caseType); } catch {}
  }, [caseType]);

  useEffect(() => {
    // حفظ مفتاح API في قاعدة البيانات عند تغييره
    if (apiKey) saveApiKey(apiKey);
  }, [apiKey]);

  // حفظ apiKey في Blob Storage عند تغييره
  useEffect(() => {
    if (apiKey && apiKey !== prevApiKey.current) {
      prevApiKey.current = apiKey;
    }
  }, [apiKey]);

  // دالة تثبيت التطبيق
  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
        setDeferredPrompt(null);
      }
    }
  };



  // دالة بدء قضية جديدة
  const handleNewCase = () => {
    // مسح جميع البيانات الحالية
    setMainText('');
    setCaseNameInput('');
    setStageResults(Array(ALL_STAGES.length).fill(null));
    setStageLoading(Array(ALL_STAGES.length).fill(false));
    setStageErrors(Array(ALL_STAGES.length).fill(null));
    setStageShowResult(Array(ALL_STAGES.length).fill(false));
    setPartyRole('');
    setActiveTab('input');
  };

  // دالة تحليل مرحلة واحدة
  const handleAnalyzeStage = async (idx: number) => {
    // إذا كانت المرحلة الأخيرة (العريضة النهائية)
    if (idx === ALL_STAGES.length - 1) {
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
          stage: ALL_STAGES[idx],
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

  // دالة تحديد نوع القضية الذكية
  const determineSmartCaseType = (text: string): string => {
    if (!text || typeof text !== 'string') return 'عام';
    
    const lowerText = text.toLowerCase();
    
    // قضايا جنائية (أولوية عالية)
    const criminalKeywords = [
      'جريمة', 'عقوبة', 'سجن', 'غرامة', 'جنحة', 'جناية', 'جنائي',
      'سرقة', 'قتل', 'ضرب', 'احتيال', 'تزوير', 'رشوة', 'اختلاس',
      'إرهاب', 'تهريب', 'مخدرات', 'سلاح', 'اعتداء', 'تحرش', 'اغتصاب'
    ];
    
    if (criminalKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'جنائية';
    }
    
    // قضايا أحوال شخصية (أولوية عالية)
    const personalStatusKeywords = [
      'زواج', 'طلاق', 'نفقة', 'حضانة', 'ميراث', 'وصية', 'أحوال شخصية',
      'عائلة', 'أطفال', 'زوجة', 'زوج', 'أب', 'أم', 'ابن', 'ابنة'
    ];
    
    if (personalStatusKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'أحوال شخصية';
    }
    
    // قضايا تجارية
    const commercialKeywords = [
      'شركة', 'تجارة', 'سوق', 'استثمار', 'بنك', 'مال', 'أسهم', 'سندات',
      'تأمين', 'بورصة', 'سند تجاري', 'كمبيالة', 'شيك'
    ];
    
    if (commercialKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'تجارية';
    }
    
    // قضايا عمالية
    const laborKeywords = [
      'عامل', 'عمل', 'راتب', 'إجازة', 'ساعات عمل', 'أجر', 'فصل', 'استقالة',
      'عقد عمل', 'مكافأة', 'بدل', 'نقابة', 'إضراب'
    ];
    
    if (laborKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'عمالية';
    }
    
    // قضايا إدارية
    const administrativeKeywords = [
      'موظف', 'راتب', 'تقاعد', 'إدارة', 'قرار إداري', 'ترقية', 'فصل', 'تعيين',
      'خدمة مدنية', 'وزارة', 'دائرة', 'بلدية', 'حكومة'
    ];
    
    if (administrativeKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'إدارية';
    }
    
    // قضايا مدنية
    const civilKeywords = [
      'عقد', 'تعويض', 'ضرر', 'مسؤولية', 'تعاقد', 'التزام', 'بيع', 'شراء',
      'إيجار', 'ملكية', 'عقار', 'أرض', 'بناء', 'مقاولة'
    ];
    
    if (civilKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'مدنية';
    }
    
    return 'عام';
  };

  // دالة التحليل التلقائي لجميع المراحل
  const startAutoAnalysis = async () => {
    if (!mainText.trim()) {
      setAnalysisError('يرجى إدخال تفاصيل القضية أولاً');
      return;
    }

    if (!apiKey) {
      setAnalysisError('يرجى إعداد مفتاح Gemini API من صفحة الإعدادات أولاً');
      return;
    }

    // تحديد نوع القضية الذكي
    const smartCaseType = determineSmartCaseType(mainText);
    console.log('نوع القضية المكتشف:', smartCaseType);

    setIsAutoAnalyzing(true);
    setAnalysisError('');
    setCurrentAnalyzingStage(0);
    setAnalysisProgress(0);

    try {
      const totalStages = ALL_STAGES.length;
      const results: (string | null)[] = [...stageResults];

      for (let i = 0; i < totalStages; i++) {
        setCurrentAnalyzingStage(i);
        setAnalysisProgress(Math.round(((i + 1) / totalStages) * 100));

        try {
          // تحديث حالة التحميل للمرحلة الحالية
          setStageLoading(arr => arr.map((v, idx) => idx === i ? true : v));
          setStageErrors(arr => arr.map((v, idx) => idx === i ? null : v));

          // جمع ملخصات المراحل السابقة
          let previousSummaries = results.slice(0, i).filter(r => !!r);
          const MAX_CHARS = 24000;
          let totalLength = previousSummaries.reduce((acc, cur) => acc + (cur?.length || 0), 0);
          while (totalLength > MAX_CHARS && previousSummaries.length > 1) {
            previousSummaries = previousSummaries.slice(1);
            totalLength = previousSummaries.reduce((acc, cur) => acc + (cur?.length || 0), 0);
          }

          // استدعاء API للتحليل
          const modelToUse = /pro|1\.5-pro|2\.0|ultra/i.test(preferredModel) ? 'gemini-1.5-flash' : preferredModel;
          const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-model': modelToUse },
            body: JSON.stringify({ 
              text: mainText, 
              stageIndex: i, 
              apiKey, 
              previousSummaries,
              partyRole: partyRole || undefined 
            })
          });

          if (res.ok) {
            const data = await res.json();
            results[i] = data.analysis;
            setStageResults([...results]);
            setStageShowResult(arr => arr.map((v, idx) => idx === i ? true : v));
          } else {
            const data = await res.json();
            const { code, message } = extractApiError(res, data);
            const mapped = mapApiErrorToMessage(code, message || data.error);
            setStageErrors(arr => arr.map((v, idx) => idx === i ? (mapped || 'حدث خطأ أثناء التحليل') : v));
          }

        } catch (stageError) {
          console.error(`خطأ في المرحلة ${i + 1}:`, stageError);
          setStageErrors(arr => arr.map((v, idx) => idx === i ? 'خطأ في الاتصال بالخادم' : v));
        } finally {
          setStageLoading(arr => arr.map((v, idx) => idx === i ? false : v));
        }

        // انتظار قصير بين المراحل لتجنب تجاوز حدود التوكينز
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.error('خطأ في التحليل التلقائي:', error);
      setAnalysisError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsAutoAnalyzing(false);
      setCurrentAnalyzingStage(0);
      setAnalysisProgress(0);
    }
  };

  const stopAutoAnalysis = () => {
    setIsAutoAnalyzing(false);
    setCurrentAnalyzingStage(0);
    setAnalysisProgress(0);
  };

  if (!mounted) {
    return null; // تجنب hydration mismatch
  }

  return (
    <>


      <div style={{
        fontFamily: 'Tajawal, Arial, sans-serif',
        direction: 'rtl',
        minHeight: '100vh',
        background: theme.background,
        color: theme.text,
        padding: 0,
        margin: 0,
        marginLeft: '0',
        transition: 'all 0.3s ease',
      }}>
        <main style={{
          maxWidth: 800,
          width: '100%',
          margin: '0 auto',
          padding: isMobile() ? '1rem 0.5rem' : '2rem 1rem',
        }}>
          {/* تم حذف قسم الأخبار القانونية الفلسطينية */}

          {/* قسم المقالات التعريفية محذوف بناءً على طلب المستخدم */}
          {/* تنبيه إعداد المفتاح عند الحاجة */}
          {!apiKey && (
            <div style={{
              background: '#fffbe6',
              color: '#b7791f',
              border: '1px solid #f6ad55',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 16,
              boxShadow: '0 1px 6px #b7791f22',
              fontWeight: 700,
              textAlign: 'center'
            }}>
              لم يتم إعداد مفتاح Gemini API بعد. انتقل إلى <Link href="/settings" style={{color: theme.accent, textDecoration:'underline'}}>الإعدادات</Link> لإعداده.
            </div>
          )}

          {/* رسالة ترحيب للمستخدمين */}
          {/* رسالة ترحيب عامة */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: '1px solid #667eea',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 16,
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            <div style={{fontSize: '18px', marginBottom: '8px'}}>
              🎉 مرحباً بك في منصة التحليل القانوني الذكية!
            </div>
            <div style={{fontSize: '14px', opacity: 0.9}}>
              منصة مجانية للتحليل القانوني المدعوم بالذكاء الاصطناعي
            </div>
          </div>

          {/* شريط إجراءات الصفحة */}
          <div style={{display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', marginBottom:16}}>
              <button
                onClick={handleNewCase}
                style={{
                  background: 'rgba(99, 102, 241, 0.1)', color: theme.accent2, border: `1px solid ${theme.accent2}`, borderRadius: 8,
                  padding: isSmallScreen ? '8px 16px' : '6px 14px', fontWeight: 700, fontSize: isSmallScreen ? 14 : 16,
                  cursor: 'pointer', boxShadow: `0 1px 4px ${theme.shadow}`, letterSpacing: 1, transition: 'all 0.2s',
                  width: 'auto',
                }}
              >
                🆕 قضية جديدة
              </button>
              <Link
                href="/chat"
                style={{
                  background: 'transparent', color: theme.accent2, border: `1px solid ${theme.accent2}`, borderRadius: 8,
                  padding: isSmallScreen ? '8px 16px' : '6px 14px', fontWeight: 700, fontSize: isSmallScreen ? 14 : 16,
                  textDecoration: 'none', boxShadow: `0 1px 4px ${theme.shadow}`, letterSpacing: 1, transition: 'all 0.2s',
                  width: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6
                }}
                title="فتح المحادثة الذكية"
              >
                💬 المحادثة
              </Link>
              <Link
                href="/rag"
                style={{
                  background: 'transparent', color: theme.accent2, border: `1px solid ${theme.accent2}`, borderRadius: 8,
                  padding: isSmallScreen ? '8px 16px' : '6px 14px', fontWeight: 700, fontSize: isSmallScreen ? 14 : 16,
                  textDecoration: 'none', boxShadow: `0 1px 4px ${theme.shadow}`, letterSpacing: 1, transition: 'all 0.2s',
                  width: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6
                }}
                title="الانتقال إلى نظام RAG"
              >
                🏛️ نظام RAG
              </Link>
              <Link
                href="/advanced-search"
                style={{
                  background: 'transparent', color: theme.accent2, border: `1px solid ${theme.accent2}`, borderRadius: 8,
                  padding: isSmallScreen ? '8px 16px' : '6px 14px', fontWeight: 700, fontSize: isSmallScreen ? 14 : 16,
                  textDecoration: 'none', boxShadow: `0 1px 4px ${theme.shadow}`, letterSpacing: 1, transition: 'all 0.2s',
                  width: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6
                }}
                title="الانتقال إلى البحث المتقدم"
              >
                🔍 البحث المتقدم
              </Link>
              <Link
                href="/legal-updates"
                style={{
                  background: 'transparent', color: theme.accent2, border: `1px solid ${theme.accent2}`, borderRadius: 8,
                  padding: isSmallScreen ? '8px 16px' : '6px 14px', fontWeight: 700, fontSize: isSmallScreen ? 14 : 16,
                  textDecoration: 'none', boxShadow: `0 1px 4px ${theme.shadow}`, letterSpacing: 1, transition: 'all 0.2s',
                  width: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6
                }}
                title="الانتقال إلى التحديثات القانونية"
              >
                📰 التحديثات القانونية
              </Link>
              <button
                onClick={() => { try { localStorage.removeItem('hasVisited'); } catch {} window.location.href = '/'; }}
                style={{
                  background: 'transparent', color: theme.text, border: `1px solid ${theme.input}`, borderRadius: 8,
                  padding: isSmallScreen ? '8px 16px' : '6px 14px', fontWeight: 700, fontSize: isSmallScreen ? 14 : 16,
                  cursor: 'pointer', boxShadow: `0 1px 4px ${theme.shadow}`, letterSpacing: 1, transition: 'all 0.2s',
                  width: 'auto',
                }}
                title="العودة لشاشة الترحيب"
              >
                🏠 العودة لشاشة الترحيب
              </button>
              {showInstallPrompt && (
                <button
                  onClick={handleInstallApp}
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)', color: '#0f766e', border: '1px solid #99f6e4', borderRadius: 8,
                    padding: isSmallScreen ? '8px 16px' : '6px 14px', fontWeight: 700, fontSize: isSmallScreen ? 14 : 16,
                    cursor: 'pointer', boxShadow: '0 1px 4px #0002', letterSpacing: 1, transition: 'all 0.2s',
                    width: 'auto'
                  }}
                >
                  📱 تثبيت التطبيق
                </button>
              )}
            </div>

          {/* اختيار نوع القضية لتفعيل التفرع */}
          <div style={{
            background: theme.card,
            borderRadius: 12,
            boxShadow: `0 2px 10px ${theme.shadow}`,
            padding: 12,
            marginBottom: 16,
            border: `1px solid ${theme.border}`
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              <span style={{fontWeight:700, color: theme.accent2}}>نوع القضية:</span>
              {['عام','ميراث','أحوال شخصية','تجاري','جنائي','عمل','عقاري','إداري','إيجارات'].map(t => (
                <button key={t}
                  onClick={() => setCaseType(t)}
                  style={{
                    background: caseType === t ? theme.accent : 'transparent',
                    color: caseType === t ? '#fff' : theme.text,
                    border: `1.5px solid ${theme.input}`,
                    borderRadius: 10,
                    padding: '6px 10px',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >{t}</button>
              ))}
            </div>
          </div>

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
          </div>

          {/* محتوى التبويبات */}
          {activeTab === 'input' && (
            <>
              {/* مربع نص واحد لتفاصيل القضية */}
              <div style={{
                background: theme.card,
                borderRadius: 14,
                boxShadow: `0 2px 12px ${theme.shadow}`,
                padding: isMobile() ? 16 : 24,
                marginBottom: 24,
                border: `1.5px solid ${theme.border}`,
              }}>
                {/* مربع إدخال اسم القضية في رأس مربع التفاصيل */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
                    <span style={{fontSize:20}}>📛</span>
                    <label style={{ fontWeight: 700, color: theme.accent2, fontSize: 16 }}>اسم القضية:</label>
                  </div>
                  <input
                        type="text"
                        value={caseNameInput}
                        onChange={e => setCaseNameInput(e.target.value)}
                        placeholder="أدخل اسم القضية (مثال: قضية إيجار 2024)"
                        style={{ 
                          width: '100%', 
                          borderRadius: 12, 
                          border: `2px solid ${theme.input}`, 
                          padding: isMobile() ? 12 : 16, 
                          fontSize: isMobile() ? 16 : 18, 
                          marginBottom: 0, 
                          outline: 'none', 
                          boxShadow: `0 2px 8px ${theme.shadow}`, 
                          background: darkMode ? '#181a2a' : '#fff', 
                          color: theme.text, 
                          transition: 'all 0.3s ease',
                          fontFamily: 'Tajawal, Arial, sans-serif'
                        }}
                        required
                      />
                    </div>
                    
                    <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
                      <span style={{fontSize:20}}>👥</span>
                      <label style={{ fontWeight: 700, color: theme.accent, fontSize: 16 }}>صفة المستخدم في الدعوى:</label>
                    </div>
                    
                    <div style={{
                      background: theme.resultBg,
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 16,
                      border: `1px solid ${theme.input}`,
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: theme.text
                    }}>
                      <div style={{fontWeight: 700, color: theme.accent2, marginBottom: 8}}>📋 ملاحظة:</div>
                      <div style={{marginBottom: 8}}><strong>المشتكي:</strong> <span style={{color: '#dc2626', fontWeight: 600}}>جزائية (جنائية)</span> - صاحب الشكوى ضد شخص ارتكب جريمة</div>
                      <div style={{marginBottom: 8}}><strong>المشتكى عليه:</strong> <span style={{color: '#dc2626', fontWeight: 600}}>جزائية (جنائية)</span> - الشخص المتهم بارتكاب الجريمة في مرحلة التحقيق</div>
                      <div style={{marginBottom: 8}}><strong>المدعي:</strong> <span style={{color: '#059669', fontWeight: 600}}>مدنية</span> - من يرفع دعوى للمطالبة بحق مادي أو معنوي</div>
                      <div style={{marginBottom: 8}}><strong>المدعى عليه:</strong> <span style={{color: '#059669', fontWeight: 600}}>مدنية</span> - الطرف المخاصم الذي تُرفع عليه الدعوى</div>
                      <div style={{fontSize: 13, opacity: 0.8, fontStyle: 'italic', marginTop: 12, paddingTop: 12, borderTop: `1px solid ${theme.border}`}}>اختر صفتك ليتخصص التحليل والعريضة وفق مصلحتك في الدعوى</div>
                    </div>
                    
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom: 16 }}>
                      {(['المشتكي','المشتكى عليه','المدعي','المدعى عليه'] as PartyRole[]).map(role => (
                        <button key={role}
                          onClick={() => setPartyRole(role === partyRole ? '' : role)}
                          style={{
                            background: role === partyRole ? theme.accent : 'transparent',
                            color: role === partyRole ? '#fff' : theme.text,
                            border: `2px solid ${theme.input}`,
                            borderRadius: 10,
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontWeight: 700
                          }}
                        >{role}</button>
                      ))}
                    </div>
                    
                    <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
                      <span style={{fontSize:20}}>📄</span>
                      <label style={{ fontWeight: 700, color: theme.accent, fontSize: 16 }}>تفاصيل القضية:</label>
                    </div>
                    
                    <textarea
                      value={mainText}
                      onChange={e => setMainText(e.target.value)}
                      rows={6}
                      style={{ 
                        width: '100%', 
                        borderRadius: 12, 
                        border: `2px solid ${theme.input}`, 
                        padding: isMobile() ? 12 : 16, 
                        fontSize: isMobile() ? 16 : 18, 
                        marginBottom: 0, 
                        resize: 'vertical', 
                        outline: 'none', 
                        boxShadow: `0 2px 8px ${theme.shadow}`, 
                        background: darkMode ? '#181a2a' : '#fff', 
                        color: theme.text, 
                        transition: 'all 0.3s ease',
                        fontFamily: 'Tajawal, Arial, sans-serif',
                        lineHeight: 1.6
                      }}
                      placeholder="أدخل تفاصيل القضية هنا..."
                      required
                    />
                  </div>

                  {/* زر البدء السريع */}
                  <div style={{
                    background: `linear-gradient(135deg, ${theme.accent2} 0%, ${theme.accent} 100%)`,
                    borderRadius: 16,
                    padding: isMobile() ? 20 : 28,
                    textAlign: 'center',
                    boxShadow: `0 4px 20px ${theme.accent}33`,
                    border: `1px solid ${theme.accent}`,
                  }}>
                    <div style={{fontSize: isMobile() ? 20 : 24, fontWeight: 800, color: '#fff', marginBottom: 12}}>
                      🚀 جاهز للبدء؟
                    </div>
                    <div style={{fontSize: isMobile() ? 14 : 16, color: 'rgba(255,255,255,0.9)', marginBottom: 20, lineHeight: 1.6}}>
                      بعد إدخال البيانات، انتقل إلى تبويب &quot;مراحل التحليل&quot; لبدء العملية
                    </div>
                    <button
                      onClick={() => setActiveTab('stages')}
                      style={{
                        background: 'rgba(255,255,255,0.2)', 
                        color: '#fff', 
                        border: '2px solid rgba(255,255,255,0.3)', 
                        borderRadius: 12, 
                        padding: isMobile() ? '12px 24px' : '16px 32px', 
                        fontSize: isMobile() ? 16 : 18, 
                        fontWeight: 700, 
                        cursor: 'pointer', 
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      ⚖️ الانتقال لمراحل التحليل
                    </button>
                  </div>
                </>
              )}

              {/* محتوى التبويب الثاني: مراحل التحليل */}
              {activeTab === 'stages' && (
                <>
                  {/* زر التحليل التلقائي */}
                  <div style={{
                    background: theme.card,
                    borderRadius: 16,
                    boxShadow: `0 4px 20px ${theme.shadow}`,
                    padding: isMobile() ? 16 : 24,
                    marginBottom: 24,
                    border: `1.5px solid ${theme.border}`,
                    textAlign: 'center'
                  }}>
                    <h2 style={{
                      color: theme.text,
                      margin: '0 0 16px 0',
                      fontSize: isMobile() ? 18 : 22,
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}>
                      <span style={{fontSize: isMobile() ? 24 : 28}}>🚀</span>
                      تحليل تلقائي لجميع المراحل
                    </h2>
                    
                    <p style={{
                      color: theme.text,
                      margin: '0 0 20px 0',
                      fontSize: 14,
                      opacity: 0.8
                    }}>
                      اضغط على الزر أدناه لتحليل جميع المراحل الـ 16 تلقائياً مع مراعاة حدود التوكينز
                    </p>

                    {/* عرض نوع القضية المكتشف */}
                    {mainText.trim() && (
                      <div style={{
                        background: theme.resultBg,
                        padding: 12,
                        borderRadius: 8,
                        border: `1px solid ${theme.border}`,
                        marginBottom: 16,
                        textAlign: 'center'
                      }}>
                        <div style={{
                          fontSize: 12,
                          color: theme.text,
                          opacity: 0.7,
                          marginBottom: 4
                        }}>
                          نوع القضية المكتشف:
                        </div>
                        <div style={{
                          fontSize: 16,
                          fontWeight: 'bold',
                          color: theme.accent
                        }}>
                          {determineSmartCaseType(mainText)}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {!isAutoAnalyzing ? (
                        <button
                          onClick={startAutoAnalysis}
                          disabled={!mainText.trim() || !apiKey}
                          style={{
                            padding: '16px 32px',
                            borderRadius: 12,
                            border: 'none',
                            background: (!mainText.trim() || !apiKey) ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #34d399)',
                            color: '#fff',
                            fontSize: 16,
                            cursor: (!mainText.trim() || !apiKey) ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          🚀 بدء التحليل التلقائي
                        </button>
                      ) : (
                        <button
                          onClick={stopAutoAnalysis}
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

                    {/* مؤشر التقدم */}
                    {isAutoAnalyzing && (
                      <div style={{
                        background: theme.resultBg,
                        padding: 20,
                        borderRadius: 12,
                        border: `2px solid ${theme.accent}`,
                        marginTop: 20,
                        textAlign: 'center'
                      }}>
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
                            borderTop: '3px solid #10b981',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                          <h3 style={{
                            color: theme.text,
                            margin: 0,
                            fontSize: 18,
                            fontWeight: 'bold'
                          }}>
                            جاري التحليل التلقائي...
                          </h3>
                        </div>
                        
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
                            background: 'linear-gradient(90deg, #10b981, #34d399)',
                            transition: 'width 0.5s ease',
                            borderRadius: 6
                          }} />
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: 14,
                          color: theme.text
                        }}>
                          <span>المرحلة {currentAnalyzingStage + 1} من {ALL_STAGES.length}</span>
                          <span>{analysisProgress}%</span>
                        </div>
                      </div>
                    )}

                    {/* رسالة الخطأ */}
                    {analysisError && (
                      <div style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        padding: 16,
                        borderRadius: 8,
                        marginTop: 16
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          justifyContent: 'center'
                        }}>
                          <span>❌</span>
                          <strong>خطأ في التحليل التلقائي:</strong>
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontSize: 14 }}>
                          {analysisError}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* عرض جميع المراحل */}
                  {ALL_STAGES
                    .filter((stageName) => {
                      const details = (stagesDef as Record<string, StageDetails>)[stageName];
                      const applicable: string[] | undefined = details?.applicableTo;
                      if (!applicable || applicable.includes('عام')) return true;
                      return applicable.includes(caseType);
                    })
                    .map((stage) => {
                      const absoluteIdx = ALL_STAGES.indexOf(stage);
                      const details = (stagesDef as Record<string, StageDetails>)[stage];
                      const prereqNames = (details?.prerequisites as string[]) || [];
                      const unmetPrereqs = prereqNames.filter((name) => {
                        const idx = ALL_STAGES.indexOf(name);
                        return idx >= 0 ? !stageResults[idx] : false;
                      });
                      const prerequisitesMet = unmetPrereqs.length === 0;
                      return (
                    <div key={stage} style={{
                      background: theme.card,
                      borderRadius: 16,
                      boxShadow: `0 4px 20px ${theme.shadow}`,
                      padding: isMobile() ? 16 : 24,
                      marginBottom: 24,
                      border: `1.5px solid ${theme.border}`,
                      transition: 'all 0.3s ease',
                    }}>
                      <div style={{ 
                        fontWeight: 800, 
                        color: theme.accent, 
                        fontSize: isMobile() ? 16 : 18, 
                        marginBottom: 16,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}>
                        <span style={{fontSize: isMobile() ? 20 : 24}}>⚖️</span>
                        {stage}
                        <button
                          onClick={() => { setSelectedStageForCollab(stage); setTimeout(() => collabRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0); }}
                          style={{ marginInlineStart: 'auto', background: 'transparent', color: theme.text, border: `1.5px solid ${theme.input}`, borderRadius: 10, padding: '4px 8px', fontSize: 12, fontWeight: 700, cursor:'pointer' }}
                          title="فتح لوحة التعاون لهذه المرحلة"
                        >
                          🤝 تعاون لهذه المرحلة
                        </button>
                        {((stagesDef as Record<string, StageDetails>)[stage]?.optional) && (
                          <span style={{
                            marginInlineStart: 8,
                            background: '#f59e0b',
                            color: '#fff',
                            borderRadius: 8,
                            padding: '2px 8px',
                            fontSize: 12
                          }}>اختيارية</span>
                        )}
                      </div>
                      {showDeadlines && ((stagesDef as Record<string, StageDetails>)[stage]?.deadlines?.length) ? (
                        <div style={{
                          background: '#fff7ed',
                          border: '1px solid #fdba74',
                          color: '#9a3412',
                          borderRadius: 8,
                          padding: 10,
                          marginBottom: 12,
                          fontSize: 13
                        }}>
                          <div style={{ fontWeight: 700, marginBottom: 6 }}>⏰ مواعيد قانونية:</div>
                          <ul style={{ margin: 0, paddingInlineStart: 18 }}>
                            {((stagesDef as Record<string, StageDetails>)[stage].deadlines as string[]).map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {stageGating && !prerequisitesMet && unmetPrereqs.length > 0 && (
                        <div style={{
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#991b1b',
                          borderRadius: 8,
                          padding: 10,
                          marginBottom: 12,
                          fontSize: 13
                        }}>
                          <div style={{ fontWeight: 700, marginBottom: 6 }}>🔒 هذه المرحلة مقفلة لوجود اعتماديات غير مكتملة:</div>
                          <ul style={{ margin: 0, paddingInlineStart: 18 }}>
                            {unmetPrereqs.map((p, i) => (<li key={i}>{p}</li>))}
                          </ul>
                        </div>
                      )}
                      
                      {/* ملخص التحليل السابق */}
                      {absoluteIdx > 0 && stageResults[absoluteIdx-1] && (
                        <div style={{
                          background: theme.resultBg,
                          borderRadius: 12,
                          boxShadow: `0 2px 8px ${theme.shadow}`,
                          padding: 16,
                          marginBottom: 16,
                          border: `1px solid ${theme.input}`,
                          color: theme.text,
                          fontSize: 15,
                          opacity: 0.95,
                        }}>
                          <div style={{fontWeight: 700, color: theme.accent2, marginBottom: 8}}>📋 ملخص المرحلة السابقة:</div>
                          <div style={{ whiteSpace: 'pre-line', marginTop: 4, lineHeight: 1.6 }}>{stageResults[absoluteIdx-1]}</div>
                        </div>
                      )}
                      
                      {/* إذا كانت المرحلة الأخيرة، غير نص الزر */}
                      <button
                        type="button"
                        disabled={stageLoading[absoluteIdx] || (stageGating && !prerequisitesMet)}
                        onClick={() => (!stageGating || prerequisitesMet) && handleAnalyzeStage(absoluteIdx)}
                        style={{ 
                          width: '100%', 
                          background: `linear-gradient(135deg, ${theme.accent2} 0%, ${theme.accent} 100%)`, 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: 12, 
                          padding: isMobile() ? '14px 0' : '18px 0', 
                          fontSize: isMobile() ? 16 : 18, 
                          fontWeight: 800, 
                          cursor: (stageLoading[absoluteIdx] || (stageGating && !prerequisitesMet)) ? 'not-allowed' : 'pointer', 
                          marginTop: 8, 
                          boxShadow: `0 4px 16px ${theme.accent}33`, 
                          letterSpacing: 1, 
                          transition: 'all 0.3s ease', 
                          position:'relative',
                          transform: (stageLoading[absoluteIdx] || (stageGating && !prerequisitesMet)) ? 'scale(0.98)' : 'scale(1)',
                        }}
                        title={stageGating && !prerequisitesMet && unmetPrereqs.length > 0 ? `مطلوب إكمال: ${unmetPrereqs.join('، ')}` : undefined}
                      >
                        {stageLoading[absoluteIdx] ? (
                          <span style={{display:'inline-flex', alignItems:'center', gap:8}}>
                            <span className="spinner" style={{display:'inline-block', width:20, height:20, border:'3px solid #fff', borderTop:`3px solid ${theme.accent2}`, borderRadius:'50%', animation:'spin 1s linear infinite', verticalAlign:'middle'}}></span>
                            {absoluteIdx === ALL_STAGES.length - 1 ? '⏳ جاري توليد العريضة النهائية...' : '⏳ جاري التحليل...'}
                          </span>
                        ) : (
                          absoluteIdx === ALL_STAGES.length - 1 ? '📜 توليد العريضة القانونية النهائية' : `📜 تحليل ${stage}`
                        )}
                      </button>
                      
                      {stageErrors[absoluteIdx] && (
                        <div style={{ 
                          color: theme.errorText, 
                          background: theme.errorBg, 
                          borderRadius: 12, 
                          padding: 16, 
                          marginTop: 16, 
                          textAlign: 'center', 
                          fontWeight: 700, 
                          fontSize: 15, 
                          boxShadow: `0 2px 8px ${theme.errorText}22`,
                          border: `1px solid ${theme.errorText}33`
                        }}>
                          ❌ {stageErrors[absoluteIdx]}
                        </div>
                      )}
                      
                      {stageResults[absoluteIdx] && (
                        <div style={{
                          background: theme.resultBg,
                          borderRadius: 16,
                          boxShadow: `0 4px 20px ${theme.shadow}`,
                          padding: 20,
                          marginTop: 20,
                          border: `1.5px solid ${theme.input}`,
                          color: theme.text,
                          opacity: stageShowResult[absoluteIdx] ? 1 : 0,
                          transform: stageShowResult[absoluteIdx] ? 'translateY(0)' : 'translateY(30px)',
                          transition: 'all 0.7s ease',
                        }}>
                          <h3 style={{ color: theme.accent, marginBottom: 12, fontSize: 18, fontWeight: 800, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>🔍</span>
                            نتيجة التحليل
                          </h3>
                          <div style={{ whiteSpace: 'pre-line', fontSize: 16, lineHeight: 1.8 }}>{stageResults[absoluteIdx]}</div>
                        </div>
                      )}
                    </div>
                  );
                  })}
                  {/* لوحة التعاون: تظهر أسفل قائمة المراحل */}
                  <div ref={collabRef} style={{ marginTop: 24 }}>
                    <CollabPanel caseName={caseNameInput} caseType={caseType} theme={theme} darkMode={darkMode} stageName={selectedStageForCollab || undefined} />
                  </div>
                </>
              )}

              {/* محتوى التبويب الثالث: النتائج */}
              {activeTab === 'results' && (
                <div className="card-ui" style={{ background: theme.card, padding: isMobile() ? 20 : 32, borderColor: theme.border }}>
                  <div className="section-title" style={{ marginBottom: 16 }}>📊 ملخص النتائج</div>

                  {/* أزرار التصدير */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    <Button
                      onClick={async () => {
                        const prefs = await loadExportPreferences();
                        const stages = stageResults
                          .map((content, idx) => {
                            if (!content) return null;
                            const sName = ALL_STAGES[idx];
                            const deadlines = (stagesDef as Record<string, StageDetails>)[sName]?.deadlines;
                            return { title: sName, content, deadlines };
                          })
                          .filter(Boolean) as { title: string; content: string }[];
                        if (stages.length === 0) return;
                        exportResultsToPDF(stages, { caseName: caseNameInput || 'قضية', partyRole: partyRole || undefined }, prefs);
                      }}
                      variant="danger"
                    >
                      ⬇️ تصدير PDF
                    </Button>
                    <Button
                      onClick={async () => {
                        const prefs = await loadExportPreferences();
                        const stages = stageResults
                          .map((content, idx) => {
                            if (!content) return null;
                            const sName = ALL_STAGES[idx];
                            const deadlines = (stagesDef as Record<string, StageDetails>)[sName]?.deadlines;
                            return { title: sName, content, deadlines };
                          })
                          .filter(Boolean) as { title: string; content: string }[];
                        if (stages.length === 0) return;
                        exportResultsToDocx(stages, { caseName: caseNameInput || 'قضية', partyRole: partyRole || undefined }, prefs);
                      }}
                      variant="info"
                    >
                      ⬇️ تصدير Docx
                    </Button>
                    <Link href="/exports" className="btn btn-success" style={{ textDecoration: 'none' }}>
                      📚 سجل التصدير
                    </Link>
                  </div>
                  
                  {/* عرض إحصائيات سريعة */}
                  <div className="stats-grid" style={{ marginBottom: 24 }}>
                    <div style={{
                      background: theme.resultBg,
                      borderRadius: 12,
                      padding: 16,
                      border: `1px solid ${theme.border}`,
                      textAlign: 'center',
                    }}>
                      <div style={{fontSize: 24, fontWeight: 800, color: theme.accent}}>
                        {stageResults.filter(r => !!r).length}
                      </div>
                      <div style={{fontSize: 14, color: theme.text}}>مرحلة مكتملة</div>
                    </div>
                    <div style={{
                      background: theme.resultBg,
                      borderRadius: 12,
                      padding: 16,
                      border: `1px solid ${theme.border}`,
                      textAlign: 'center',
                    }}>
                      <div style={{fontSize: 24, fontWeight: 800, color: theme.accent2}}>
                        {ALL_STAGES.length - stageResults.filter(r => !!r).length}
                      </div>
                      <div style={{fontSize: 14, color: theme.text}}>مرحلة متبقية</div>
                    </div>
                    <div style={{
                      background: theme.resultBg,
                      borderRadius: 12,
                      padding: 16,
                      border: `1px solid ${theme.border}`,
                      textAlign: 'center',
                    }}>
                      <div style={{fontSize: 24, fontWeight: 800, color: theme.accent}}>
                        {Math.round((stageResults.filter(r => !!r).length / ALL_STAGES.length) * 100)}%
                      </div>
                      <div style={{fontSize: 14, color: theme.text}}>نسبة الإنجاز</div>
                    </div>
                  </div>

                  {/* عرض النتائج الفعلية */}
                  {stageResults.some(r => !!r) ? (
                    <>
                      <div style={{fontSize: isMobile() ? 16 : 18, color: theme.text, marginBottom: 24, lineHeight: 1.6, textAlign: 'center'}}>
                        نتائج المراحل المكتملة
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile() ? '1fr' : 'repeat(2, 1fr)',
                        gap: 16,
                      }}>
                        {stageResults.map((result, idx) => result && (
                          <div key={idx} style={{
                            background: theme.resultBg,
                            borderRadius: 12,
                            padding: 16,
                            border: `1px solid ${theme.border}`,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                          }}
                          onClick={() => { setActiveTab('stages'); setSelectedStageForCollab(ALL_STAGES[idx]); setTimeout(() => collabRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0); }}
                          title="انقر للانتقال إلى مراحل التحليل"
                          >
                            <div style={{fontWeight: 700, color: theme.accent2, marginBottom: 8, fontSize: 14}}>
                              {ALL_STAGES[idx]}
                            </div>
                            <div style={{fontSize: 13, color: theme.text, lineHeight: 1.5}}>
                              {result.substring(0, 120)}...
                            </div>
                            <div style={{
                              fontSize: 11,
                              color: theme.accent,
                              marginTop: 8,
                              textAlign: 'center',
                              fontWeight: 600
                            }}>
                              انقر لعرض النتيجة كاملة
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{
                      background: theme.resultBg,
                      borderRadius: 12,
                      padding: 32,
                      border: `1px solid ${theme.border}`,
                      textAlign: 'center',
                      color: theme.text,
                    }}>
                      <div style={{fontSize: 48, marginBottom: 16}}>📝</div>
                      <div style={{fontSize: 18, fontWeight: 700, marginBottom: 12}}>لا توجد نتائج بعد</div>
                      <div style={{fontSize: 14, opacity: 0.8, marginBottom: 20}}>
                        ابدأ بتحليل المراحل في تبويب &quot;مراحل التحليل&quot; لرؤية النتائج هنا
                      </div>
                      <button
                        onClick={() => setActiveTab('stages')}
                        style={{
                          background: theme.accent,
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '12px 24px',
                          fontSize: 16,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        الانتقال لمراحل التحليل
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* تمت إزالة المدقق المرجعي المدمج من الصفحة الرئيسية */}
        </main>
        
        {/* تمت إزالة الفوتر التحذيري من الصفحة الرئيسية بناءً على طلب المستخدم */}
      </div>

      {/* تمت إزالة إشعارات المراجع من الصفحة الرئيسية */}
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
      `}</style>
    </>
  );
} 