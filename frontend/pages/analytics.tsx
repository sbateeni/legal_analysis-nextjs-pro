import React, { useState, useEffect, useCallback } from 'react';
import { isMobile } from '@utils/crypto';
import { useTheme } from '../contexts/ThemeContext';
import { getAllCases, getAllEvents, getAllDocuments } from '@utils/db';
import Link from 'next/link';
// تم حذف AuthGuard لجعل الموقع عاماً

// تعريف نوع BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface AnalysisStage {
  id: string;
  stageIndex: number;
  stage: string;
  input: string;
  output: string;
  date: string;
}

interface LegalCase {
  id: string;
  name: string;
  createdAt: string;
  stages: AnalysisStage[];
  tags?: string[];
  status?: 'active' | 'completed' | 'archived';
  priority?: 'low' | 'medium' | 'high';
  caseType?: string;
  clientName?: string;
  courtName?: string;
  nextHearing?: string;
  notes?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'hearing' | 'deadline' | 'meeting' | 'reminder';
  caseId?: string;
  caseName?: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  completed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface LegalDocument {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'docx' | 'jpg' | 'jpeg' | 'png' | 'txt' | 'other';
  size: number;
  caseId?: string;
  caseName?: string;
  description?: string;
  category: 'contract' | 'evidence' | 'correspondence' | 'legal_opinion' | 'court_document' | 'other';
  uploadedAt: string;
  lastModified: string;
  tags?: string[];
  isPublic: boolean;
  filePath?: string;
  mimeType?: string;
}

interface PredictiveAnalysis {
  caseId: string;
  caseName: string;
  successProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  alternativeStrategies: string[];
  estimatedDuration: string;
  complexityScore: number;
  lastAnalyzed: string;
}

interface AnalyticsData {
  totalCases: number;
  activeCases: number;
  completedCases: number;
  totalDocuments: number;
  upcomingEvents: number;
  averageCompletionTime: number;
  successRate: number;
  caseTypes: { [key: string]: number };
  monthlyTrends: { [key: string]: number };
  predictiveAnalyses: PredictiveAnalysis[];
  casesByType: Record<string, number>;
  casesByMonth: Record<string, number>;
  averageStagesCompleted: number;
  mostCommonIssues: string[];
  averageCaseLength: number;
  topStages: Array<{ stage: string; count: number }>;
  recentActivity: Array<{ date: string; count: number }>;
  note?: string;
}

// دالة تحديد نوع القضية
function determineCaseType(text: string): string {
  if (!text || typeof text !== 'string') return 'قضية مدنية عامة';
  
  if (/ميراث|ورثة|إرث/i.test(text)) return 'قضية ميراث';
  if (/طلاق|زواج|أحوال شخصية/i.test(text)) return 'قضية أحوال شخصية';
  if (/عقد|تجاري|شركة|عمل/i.test(text)) return 'قضية تجارية';
  if (/عقوبة|جريمة|جنحة/i.test(text)) return 'قضية جنائية';
  if (/أرض|عقار|ملكية/i.test(text)) return 'قضية عقارية';
  if (/عمل|موظف|راتب/i.test(text)) return 'قضية عمل';
  return 'قضية مدنية عامة';
}

// دالة حساب طول النص
function calculateTextLength(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// دالة التحليل التنبؤي
function generatePredictiveAnalyses(cases: LegalCase[]): PredictiveAnalysis[] {
  return cases.map(caseItem => {
    const stagesCompleted = caseItem.stages.length;
    const totalStages = 12;
    const completionRate = stagesCompleted / totalStages;

    // حساب احتمالية النجاح بناءً على عدة عوامل
    let successProbability = 0;
    
    // عامل التقدم
    successProbability += completionRate * 30;
    
    // عامل الأولوية
    switch (caseItem.priority) {
      case 'high':
        successProbability += 20;
        break;
      case 'medium':
        successProbability += 15;
        break;
      case 'low':
        successProbability += 10;
        break;
    }

    // عامل نوع القضية
    if (caseItem.caseType?.includes('تجاري')) {
      successProbability += 15;
    } else if (caseItem.caseType?.includes('جنائي')) {
      successProbability += 10;
    } else if (caseItem.caseType?.includes('مدني')) {
      successProbability += 12;
    }

    // عامل الوقت المنقضي
    const daysSinceCreation = (new Date().getTime() - new Date(caseItem.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 30) {
      successProbability += 15;
    } else if (daysSinceCreation < 90) {
      successProbability += 10;
    } else {
      successProbability += 5;
    }

    // تحديد مستوى المخاطر
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (successProbability < 40) {
      riskLevel = 'high';
    } else if (successProbability < 70) {
      riskLevel = 'medium';
    }

    // تحديد نقاط القوة والضعف
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (completionRate > 0.5) {
      strengths.push('تقدم جيد في المراحل');
    } else {
      weaknesses.push('تقدم بطيء في المراحل');
    }

    if (caseItem.priority === 'high') {
      strengths.push('أولوية عالية');
    }

    if (daysSinceCreation > 90) {
      weaknesses.push('مدة طويلة بدون تقدم');
    }

    if (caseItem.stages.length === 0) {
      weaknesses.push('لم يتم البدء في التحليل');
    } else {
      strengths.push('تم البدء في التحليل');
    }

    // اقتراحات استراتيجية
    const recommendations: string[] = [];
    if (completionRate < 0.3) {
      recommendations.push('تسريع وتيرة التحليل');
      recommendations.push('مراجعة المراحل المكتملة');
    }
    if (caseItem.priority === 'low') {
      recommendations.push('رفع مستوى الأولوية');
    }
    if (daysSinceCreation > 60) {
      recommendations.push('مراجعة شاملة للقضية');
    }

    // استراتيجيات بديلة
    const alternativeStrategies: string[] = [
      'التركيز على النقاط القانونية القوية',
      'البحث عن سوابق قضائية مشابهة',
      'تحضير خطة بديلة للمرافعة',
      'التشاور مع خبراء في المجال'
    ];

    // تقدير المدة
    const estimatedDuration = completionRate > 0.5 
      ? `${Math.ceil((1 - completionRate) * 30)} يوم`
      : `${Math.ceil((1 - completionRate) * 60)} يوم`;

    // درجة التعقيد
    const complexityScore = Math.min(100, 
      (1 - completionRate) * 50 + 
      (caseItem.priority === 'high' ? 20 : caseItem.priority === 'medium' ? 10 : 5) +
      (daysSinceCreation > 90 ? 15 : 0)
    );

    return {
      caseId: caseItem.id,
      caseName: caseItem.name,
      successProbability: Math.min(100, Math.max(0, successProbability)),
      riskLevel,
      strengths,
      weaknesses,
      recommendations,
      alternativeStrategies,
      estimatedDuration,
      complexityScore,
      lastAnalyzed: new Date().toISOString()
    };
  });
}

// دالة تحليل البيانات
function analyzeCases(cases: LegalCase[], isSingleCase: boolean = false): AnalyticsData {
  if (!cases || cases.length === 0) {
    return {
      totalCases: 0,
      activeCases: 0,
      completedCases: 0,
      totalDocuments: 0,
      upcomingEvents: 0,
      averageCompletionTime: 0,
      successRate: 0,
      caseTypes: {},
      monthlyTrends: {},
      predictiveAnalyses: [],
      casesByType: {},
      casesByMonth: {},
      averageStagesCompleted: 0,
      mostCommonIssues: [],
      averageCaseLength: 0,
      topStages: [],
      recentActivity: [],
      note: isSingleCase 
        ? 'القضية المختارة لا تحتوي على بيانات كافية للتحليل.'
        : 'لم يتم إنشاء أي قضايا بعد. ابدأ بإنشاء قضية جديدة من الصفحة الرئيسية لرؤية التحليلات والإحصائيات.'
    };
  }

  // تحليل أنواع القضايا
  const casesByType: Record<string, number> = {};
  const casesByMonth: Record<string, number> = {};
  const stageCounts: Record<string, number> = {};
  let totalStages = 0;
  let totalLength = 0;
  let completedCases = 0;

  cases.forEach(caseItem => {
    try {
      // التحقق من صحة القضية
      if (!caseItem || typeof caseItem !== 'object') return;
      
      // نوع القضية
      const inputText = caseItem.stages?.[0]?.input || caseItem.name || '';
      const caseType = determineCaseType(inputText);
      casesByType[caseType] = (casesByType[caseType] || 0) + 1;

      // الشهر
      if (caseItem.createdAt) {
        try {
          const date = new Date(caseItem.createdAt);
          if (!isNaN(date.getTime())) {
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            casesByMonth[monthKey] = (casesByMonth[monthKey] || 0) + 1;
          }
        } catch (dateError) {
          console.warn('Invalid date for case:', caseItem.id, dateError);
        }
      }

      // المراحل
      if (Array.isArray(caseItem.stages)) {
        caseItem.stages.forEach(stage => {
          if (stage && stage.stage && stage.input) {
            stageCounts[stage.stage] = (stageCounts[stage.stage] || 0) + 1;
            totalStages++;
            totalLength += calculateTextLength(stage.input);
          }
        });
      }

      // القضايا المكتملة (التي لها 12 مرحلة أو أكثر)
      if (Array.isArray(caseItem.stages) && caseItem.stages.length >= 12) {
        completedCases++;
      }
    } catch (caseError) {
      console.warn('Error processing case:', caseItem?.id, caseError);
    }
  });

  // ترتيب المراحل الأكثر استخداماً
  const topStages = Object.entries(stageCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([stage, count]) => ({ stage, count }));

  // النشاط الأخير (آخر 6 أشهر)
  const recentActivity: Array<{ date: string; count: number }> = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    recentActivity.push({
      date: monthKey,
      count: casesByMonth[monthKey] || 0
    });
  }

  // حساب الإحصائيات
  const totalCases = cases.length;
  const averageStagesCompleted = totalCases > 0 ? Math.round((totalStages / totalCases) * 100 / 12) : 0;
  const successRate = totalCases > 0 ? Math.round((completedCases / totalCases) * 100) : 0;
  const averageCaseLength = totalCases > 0 ? Math.round(totalLength / totalCases) : 0;

  // المشاكل الشائعة (محاكاة)
  const mostCommonIssues = [
    'عدم اكتمال الوثائق المطلوبة',
    'عدم تحديد الأطراف بدقة',
    'عدم ذكر المراجع القانونية',
    'عدم تحديد الإطار الزمني للنزاع'
  ];

  // حساب البيانات الجديدة
  const activeCases = cases.filter(c => c.status === 'active').length;
  const completedCasesCount = cases.filter(c => c.status === 'completed').length;
  
  // التحليل التنبؤي
  const predictiveAnalyses = generatePredictiveAnalyses(cases);

  return {
    totalCases,
    activeCases,
    completedCases: completedCasesCount,
    totalDocuments: 0, // سيتم تحديثه لاحقاً
    upcomingEvents: 0, // سيتم تحديثه لاحقاً
    averageCompletionTime: 0, // سيتم تحديثه لاحقاً
    successRate,
    caseTypes: casesByType,
    monthlyTrends: casesByMonth,
    predictiveAnalyses,
    casesByType,
    casesByMonth,
    averageStagesCompleted,
    mostCommonIssues,
    averageCaseLength,
    topStages,
    recentActivity
  };
}

export default function AnalyticsPage() {
  return <AnalyticsPageContent />;
}

function AnalyticsPageContent() {
  const { theme } = useTheme();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCase, setSelectedCase] = useState<string>('all'); // 'all' أو ID القضية
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // معالجة تثبيت التطبيق كتطبيق أيقونة
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // التحقق من وجود التطبيق مثبت
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // عرض نافذة التثبيت
    deferredPrompt.prompt();

    // انتظار اختيار المستخدم
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('تم قبول تثبيت التطبيق');
      setShowInstallButton(false);
    } else {
      console.log('تم رفض تثبيت التطبيق');
    }

    setDeferredPrompt(null);
  };

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(''); // مسح الأخطاء السابقة
      
      const allCases = await getAllCases();
      setCases(allCases);
      
      // تحليل البيانات حسب الاختيار
      let casesToAnalyze = allCases;
      const isSingleCase = selectedCase !== 'all';
      if (isSingleCase) {
        casesToAnalyze = allCases.filter(c => c.id === selectedCase);
      }
      
      const analyticsData = analyzeCases(casesToAnalyze, isSingleCase);
      setAnalytics(analyticsData);
      
    } catch (err: unknown) {
      console.error('Analytics fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedCase]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // دالة تغيير القضية المختارة
  const handleCaseChange = (caseId: string) => {
    setSelectedCase(caseId);
  };

  const formatDate = (dateString: string) => {
    const [year, month] = dateString.split('-');
    const monthNames = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.background, color: theme.text, fontFamily: 'Tajawal, Arial, sans-serif' }}>
      {/* زر تحميل التطبيق - فقط على الهاتف */}
      {mounted && isMobile() && showInstallButton && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 1000,
          background: theme.accent,
          color: 'white',
          padding: '12px 20px',
          borderRadius: '25px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transition: 'all 0.3s ease',
          border: 'none',
          outline: 'none'
        }}
        onClick={handleInstallClick}
        onTouchStart={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)';
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        >
          📱 تثبيت التطبيق
        </div>
      )}

      {/* Header */}
      <header style={{ background: theme.accent2, color: 'white', padding: isMobile() ? '1rem' : '1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ flex: 1 }}></div>
          <div>
            <h1 style={{ margin: 0 }}>
              📊 التحليلات والإحصائيات
            </h1>
            <p className="muted" style={{ margin: '0.5rem 0 0 0' }}>
              {selectedCase === 'all' ? 'نظرة شاملة على جميع القضايا' : 'تحليل قضية محددة'}
            </p>
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <button 
              onClick={fetchAnalytics}
              disabled={loading}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {loading ? '⏳' : '🔄'} تحديث
            </button>
          </div>
        </div>
      </header>

      {/* قائمة اختيار القضايا */}
      {cases.length > 0 && (
        <div style={{ 
          background: theme.card, 
          padding: '1rem', 
          borderBottom: `1px solid ${theme.border}`,
          boxShadow: `0 2px 4px ${theme.shadow}`
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 600, color: theme.accent2, fontSize: '0.9rem' }}>
              اختر القضية:
            </label>
            <select 
              value={selectedCase}
              onChange={(e) => handleCaseChange(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                border: `1px solid ${theme.border}`,
                borderRadius: '0.5rem',
                background: theme.card,
                color: theme.text,
                fontSize: '0.9rem',
                minWidth: '200px'
              }}
            >
              <option value="all">📊 جميع القضايا (إحصائيات عامة)</option>
              {cases.map(caseItem => (
                <option key={caseItem.id} value={caseItem.id}>
                  📋 {caseItem.name} ({caseItem.stages.length} مرحلة)
                </option>
              ))}
            </select>
            {selectedCase !== 'all' && (
              <button 
                onClick={() => handleCaseChange('all')}
                style={{
                  background: theme.accent,
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                🔄 العودة للعامة
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container" style={{ padding: isMobile() ? '1rem' : '2rem' }}>
        {loading && (
          <div className="text-center muted" style={{ padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h3>جاري تحليل البيانات...</h3>
          </div>
        )}

        {error && (
          <div className="card-panel" style={{ padding: '1.5rem', background: '#fef2f2', borderColor: '#fecaca', color: '#dc2626', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
            <h3 style={{ margin: '0 0 1rem 0', color: '#dc2626' }}>حدث خطأ في تحليل البيانات</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: '#dc2626' }}>{error}</p>
            <button 
              onClick={fetchAnalytics}
              disabled={loading}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem'
              }}
            >
              {loading ? '⏳' : '🔄'} إعادة المحاولة
            </button>
          </div>
        )}

        {analytics && analytics.totalCases === 0 && analytics.note && (
          <div className="card-panel" style={{ background: '#fef3c7', borderColor: '#fbbf24', textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ color: '#92400e', marginBottom: '1rem' }}>لا توجد بيانات للتحليل حالياً</h3>
            <p style={{ color: '#92400e', marginBottom: '1.5rem' }}>
              {analytics.note}
            </p>
                          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/" className="btn btn-info" style={{ background: theme.accent2, color: 'white', textDecoration: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem' }}>
                  🏠 الذهاب للصفحة الرئيسية
                </Link>
                <Link href="/chat" className="btn btn-info" style={{ background: theme.accent, color: 'white', textDecoration: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem' }}>
                  🤖 بدء محادثة جديدة
                </Link>
              </div>
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fef3c7', borderRadius: '0.5rem', border: '1px solid #f59e0b' }}>
              <h4 style={{ color: '#92400e', margin: '0 0 0.5rem 0' }}>💡 ما يمكنك رؤيته في التحليلات:</h4>
              <ul style={{ color: '#92400e', textAlign: 'right', margin: 0, paddingRight: '1rem' }}>
                <li>إجمالي عدد القضايا المحللة</li>
                <li>أنواع القضايا الأكثر شيوعاً</li>
                <li>معدل النجاح في إكمال التحليل</li>
                <li>المراحل الأكثر استخداماً</li>
                <li>النشاط الشهري</li>
                <li>المشاكل الشائعة في القضايا</li>
              </ul>
            </div>
          </div>
        )}

        {analytics && analytics.totalCases > 0 && (
          <>
            {/* ملخص سريع */}
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: 'white', 
              padding: '1.5rem', 
              borderRadius: '1rem', 
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>
              {selectedCase === 'all' ? '📈 ملخص سريع' : '📋 تفاصيل القضية'}
            </h2>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile() ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analytics.totalCases}</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                    {selectedCase === 'all' ? 'إجمالي القضايا' : 'عدد المراحل'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analytics.successRate}%</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                    {selectedCase === 'all' ? 'معدل النجاح' : 'نسبة الإنجاز'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analytics.averageStagesCompleted}%</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>متوسط الإنجاز</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analytics.averageCaseLength}</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>متوسط الطول (كلمة)</div>
                </div>
              </div>
            </div>

            {/* التحليل التنبؤي */}
            {analytics.predictiveAnalyses && analytics.predictiveAnalyses.length > 0 && (
              <div style={{
                background: theme.card,
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: `0 1px 3px ${theme.shadow}`,
                marginBottom: '1.5rem'
              }}>
                <h2 style={{
                  color: theme.text,
                  margin: '0 0 1rem 0',
                  fontSize: '1.25rem',
                  fontWeight: 'bold'
                }}>
                  🔮 التحليل التنبؤي للقضايا
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1rem'
                }}>
                  {analytics.predictiveAnalyses.slice(0, 6).map((analysis) => (
                    <div key={analysis.caseId} style={{
                      background: theme.resultBg,
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${theme.border}`,
                      transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            color: theme.text,
                            margin: '0 0 0.5rem 0',
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                          }}>
                            {analysis.caseName}
                          </h3>
                          <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                            marginBottom: '0.5rem'
                          }}>
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              color: '#fff',
                              background: analysis.successProbability >= 70 ? '#10b981' : 
                                         analysis.successProbability >= 40 ? '#f59e0b' : '#ef4444'
                            }}>
                              {analysis.successProbability.toFixed(0)}% نجاح
                            </span>
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              color: '#fff',
                              background: analysis.riskLevel === 'low' ? '#10b981' : 
                                         analysis.riskLevel === 'medium' ? '#f59e0b' : '#ef4444'
                            }}>
                              مخاطر {analysis.riskLevel === 'low' ? 'منخفضة' : 
                                     analysis.riskLevel === 'medium' ? 'متوسطة' : 'عالية'}
                            </span>
                          </div>
                        </div>
                        <Link href={`/cases/${analysis.caseId}`}>
                          <button style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            border: 'none',
                            background: theme.accent,
                            color: '#fff',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}>
                            عرض
                          </button>
                        </Link>
                      </div>

                      {/* Progress Bar */}
                      <div style={{
                        width: '100%',
                        height: '0.5rem',
                        background: theme.border,
                        borderRadius: '0.25rem',
                        marginBottom: '0.75rem',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${analysis.successProbability}%`,
                          height: '100%',
                          background: analysis.successProbability >= 70 ? '#10b981' : 
                                     analysis.successProbability >= 40 ? '#f59e0b' : '#ef4444',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>

                      {/* Recommendations */}
                      <div style={{
                        background: theme.card,
                        padding: '0.75rem',
                        borderRadius: '0.375rem',
                        border: `1px solid ${theme.border}`
                      }}>
                        <h4 style={{
                          color: theme.text,
                          margin: '0 0 0.5rem 0',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          التوصيات
                        </h4>
                        <ul style={{
                          color: theme.text,
                          margin: '0',
                          padding: '0 0 0 1rem',
                          fontSize: '0.75rem',
                          opacity: 0.8
                        }}>
                          {analysis.recommendations.slice(0, 2).map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Additional Info */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '0.75rem',
                        fontSize: '0.7rem',
                        color: theme.text,
                        opacity: 0.6
                      }}>
                        <span>المدة: {analysis.estimatedDuration}</span>
                        <span>التعقيد: {analysis.complexityScore.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* الإحصائيات الأساسية */}
              <div className="grid-auto">
                <div style={{
                  background: theme.card,
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  boxShadow: `0 1px 3px ${theme.shadow}`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: theme.text }}>إجمالي القضايا</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.accent2 }}>
                    {analytics.totalCases}
                  </div>
                </div>

                <div style={{
                  background: theme.card,
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  boxShadow: `0 1px 3px ${theme.shadow}`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: theme.text }}>معدل النجاح</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                    {analytics.successRate}%
                  </div>
                </div>

                <div style={{
                  background: theme.card,
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  boxShadow: `0 1px 3px ${theme.shadow}`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: theme.text }}>متوسط الإنجاز</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                    {analytics.averageStagesCompleted}%
                  </div>
                </div>

                <div style={{
                  background: theme.card,
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  boxShadow: `0 1px 3px ${theme.shadow}`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: theme.text }}>متوسط الطول</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.accent }}>
                    {analytics.averageCaseLength} كلمة
                  </div>
                </div>
              </div>

              {/* أنواع القضايا - تظهر فقط في الإحصائيات العامة */}
              {selectedCase === 'all' && (
                <div className="card-panel" style={{ background: theme.card }}>
                  <h2 style={{ margin: '0 0 1rem 0', color: theme.text }}>أنواع القضايا</h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile() ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem'
                  }}>
                    {Object.entries(analytics.casesByType).map(([type, count]) => (
                      <div key={type} style={{
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: '0.5rem',
                        textAlign: 'center'
                      }}>
                                              <div style={{ fontWeight: 'bold', color: theme.text, marginBottom: '0.25rem' }}>
                        {type}
                      </div>
                        <div style={{ fontSize: '1.5rem', color: theme.accent2, fontWeight: 'bold' }}>
                          {count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* النشاط الأخير - تظهر فقط في الإحصائيات العامة */}
              {selectedCase === 'all' && (
                <div className="card-panel" style={{ background: theme.card }}>
                  <h2 style={{ margin: '0 0 1rem 0', color: theme.text }}>النشاط الأخير</h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile() ? '1fr' : 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '0.5rem'
                  }}>
                    {analytics.recentActivity.map(({ date, count }) => (
                      <div key={date} style={{
                        padding: '0.75rem',
                        background: count > 0 ? theme.resultBg : theme.card,
                        borderRadius: '0.5rem',
                        textAlign: 'center',
                        border: `1px solid ${theme.border}`
                      }}>
                        <div style={{ fontSize: '0.9rem', color: theme.text, opacity: 0.7, marginBottom: '0.25rem' }}>
                          {formatDate(date)}
                        </div>
                        <div style={{ 
                          fontSize: '1.25rem', 
                          fontWeight: 'bold',
                          color: count > 0 ? theme.accent2 : theme.text
                        }}>
                          {count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* المراحل الأكثر استخداماً */}
              <div className="card-panel" style={{ background: theme.card }}>
                <h2 style={{ margin: '0 0 1rem 0', color: theme.text }}>
                  {selectedCase === 'all' ? 'المراحل الأكثر استخداماً' : 'مراحل القضية'}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {analytics.topStages.map(({ stage, count }) => (
                    <div key={stage} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: theme.resultBg,
                      borderRadius: '0.5rem',
                      border: `1px solid ${theme.border}`
                    }}>
                      <span style={{ fontWeight: '500', color: theme.text }}>{stage}</span>
                      <span style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: 'bold',
                        color: theme.accent2
                      }}>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* المشاكل الشائعة */}
              {analytics.mostCommonIssues.length > 0 && (
                <div className="card-panel" style={{ background: theme.card }}>
                  <h2 style={{ margin: '0 0 1rem 0', color: theme.text }}>المشاكل الشائعة</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {analytics.mostCommonIssues.map((issue, index) => (
                      <div key={index} style={{
                        padding: '0.75rem',
                        background: '#fef3c7',
                        borderRadius: '0.5rem',
                        borderLeft: '4px solid #f59e0b'
                      }}>
                        <span style={{ color: '#92400e' }}>{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
} 