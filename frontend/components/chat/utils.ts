import { LegalCase, PredictiveAnalysis, AnalyticsData } from './types';

// دالة تحديد نوع القضية (محسنة وذكية)
export function determineCaseType(text: string): string {
  if (!text || typeof text !== 'string') return 'قضية مدنية عامة';
  
  const lowerText = text.toLowerCase();
  
  // قضايا جنائية (أولوية عالية)
  const criminalKeywords = [
    'جريمة', 'عقوبة', 'سجن', 'غرامة', 'جنحة', 'جناية', 'جنائي',
    'سرقة', 'قتل', 'ضرب', 'احتيال', 'تزوير', 'رشوة', 'اختلاس',
    'إرهاب', 'تهريب', 'مخدرات', 'سلاح', 'اعتداء', 'تحرش', 'اغتصاب',
    'قتل عمد', 'قتل خطأ', 'إيذاء', 'تهديد', 'ابتزاز', 'نصب'
  ];
  
  if (criminalKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'قضية جنائية';
  }
  
  // قضايا أحوال شخصية (أولوية عالية)
  const personalStatusKeywords = [
    'زواج', 'طلاق', 'نفقة', 'حضانة', 'ميراث', 'وصية', 'أحوال شخصية',
    'عائلة', 'أطفال', 'زوجة', 'زوج', 'أب', 'أم', 'ابن', 'ابنة',
    'مهر', 'عدة', 'خلع', 'فسخ', 'إرجاع', 'حضانة', 'زيارة', 'نفقة أطفال'
  ];
  
  if (personalStatusKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'قضية أحوال شخصية';
  }
  
  // قضايا تجارية
  const commercialKeywords = [
    'شركة', 'تجارة', 'سوق', 'استثمار', 'بنك', 'مال', 'أسهم', 'سندات',
    'تأمين', 'بورصة', 'سند', 'سند تجاري', 'كمبيالة', 'سفتجة', 'شيك',
    'تسويق', 'بيع', 'شراء', 'مؤسسة', 'مشروع', 'استيراد', 'تصدير'
  ];
  
  if (commercialKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'قضية تجارية';
  }
  
  // قضايا عمالية
  const laborKeywords = [
    'عامل', 'عمل', 'راتب', 'إجازة', 'ساعات عمل', 'أجر', 'فصل', 'استقالة',
    'عقد عمل', 'مكافأة', 'بدل', 'ساعات إضافية', 'إجازة مرضية', 'إجازة سنوية',
    'نقابة', 'إضراب', 'تظاهر', 'حقوق العمال', 'قانون العمل'
  ];
  
  if (laborKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'قضية عمالية';
  }
  
  // قضايا إدارية
  const administrativeKeywords = [
    'موظف', 'راتب', 'تقاعد', 'إدارة', 'قرار إداري', 'ترقية', 'فصل', 'تعيين',
    'خدمة مدنية', 'وزارة', 'دائرة', 'بلدية', 'محافظة', 'حكومة', 'موظف حكومي',
    'إجازة', 'ترقية', 'نقل', 'ندب', 'إعارة', 'استقالة', 'فصل تأديبي'
  ];
  
  if (administrativeKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'قضية إدارية';
  }
  
  // قضايا مدنية
  const civilKeywords = [
    'عقد', 'تعويض', 'ضرر', 'مسؤولية', 'تعاقد', 'التزام', 'بيع', 'شراء',
    'إيجار', 'ملكية', 'عقار', 'أرض', 'بناء', 'مقاولة', 'خدمة', 'تعهد',
    'ضمان', 'كفالة', 'رهن', 'حجز', 'تنفيذ', 'إجراءات مدنية'
  ];
  
  if (civilKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'قضية مدنية';
  }
  
  // قضايا دستورية
  const constitutionalKeywords = [
    'دستور', 'دستوري', 'حقوق', 'حريات', 'مواطنة', 'انتخابات', 'برلمان',
    'مجلس', 'رئيس', 'وزير', 'حكومة', 'دولة', 'سيادة', 'قانون أساسي'
  ];
  
  if (constitutionalKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'قضية دستورية';
  }
  
  // قضايا ضريبية
  const taxKeywords = [
    'ضريبة', 'ضرائب', 'ضريبة دخل', 'ضريبة مبيعات', 'ضريبة قيمة مضافة',
    'إقرار ضريبي', 'مصلحة الضرائب', 'تجنب ضريبي', 'تهرب ضريبي'
  ];
  
  if (taxKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'قضية ضريبية';
  }
  
  // قضايا عقارية
  const realEstateKeywords = [
    'عقار', 'أرض', 'بناء', 'سكن', 'شقة', 'فيلا', 'مكتب', 'محل',
    'ملكية', 'تسجيل', 'طابو', 'سند', 'عقد بيع', 'عقد إيجار'
  ];
  
  if (realEstateKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'قضية عقارية';
  }
  
  return 'قضية مدنية عامة';
}

// دالة حساب طول النص
export function calculateTextLength(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// دالة التحليل التنبؤي
export function generatePredictiveAnalyses(cases: LegalCase[]): PredictiveAnalysis[] {
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
export function analyzeCases(cases: LegalCase[], isSingleCase: boolean = false): AnalyticsData {
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
