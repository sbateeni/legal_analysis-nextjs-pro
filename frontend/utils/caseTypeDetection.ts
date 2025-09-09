/**
 * نظام الكشف التلقائي لنوع القضية
 * Automatic Case Type Detection System
 */

export interface CaseTypeDetectionResult {
  suggestedType: string;
  confidence: number;
  reasons: string[];
  alternativeTypes: Array<{
    type: string;
    confidence: number;
    reason: string;
  }>;
}

export interface CaseTypeKeywords {
  [key: string]: {
    primary: string[];
    secondary: string[];
    context: string[];
  };
}

// قاموس الكلمات المفتاحية لكل نوع قضية
const CASE_TYPE_KEYWORDS: CaseTypeKeywords = {
  'مدني': {
    primary: ['عقد', 'التزام', 'دين', 'ضمان', 'كفالة', 'إيجار', 'بيع', 'شراء'],
    secondary: ['مدني', 'تعاقد', 'اتفاق', 'مسؤولية مدنية', 'تعويض مدني'],
    context: ['طرفين', 'اتفاقية', 'التزامات', 'حقوق مدنية']
  },
  'جنائي': {
    primary: ['جريمة', 'سرقة', 'قتل', 'اعتداء', 'احتيال', 'تزوير', 'رشوة', 'فساد'],
    secondary: ['جنائي', 'جناية', 'جنحة', 'مخالفة', 'عقوبة', 'حبس', 'غرامة'],
    context: ['متهم', 'مجرم', 'ضحية', 'شاهد', 'تحقيق', 'نيابة']
  },
  'تجاري': {
    primary: ['شركة', 'تجارة', 'استثمار', 'أسهم', 'بنك', 'قرض', 'ربح', 'خسارة'],
    secondary: ['تجاري', 'اقتصادي', 'مالي', 'محاسبي', 'ضريبي'],
    context: ['شراكة', 'مؤسسة', 'رأس مال', 'أرباح', 'أعمال']
  },
  'أحوال شخصية': {
    primary: ['زواج', 'طلاق', 'نفقة', 'حضانة', 'ميراث', 'وصية', 'نسب', 'زوجة', 'زوج', 'أحوال شخصية', 'أحوال', 'شخصية'],
    secondary: ['أسرة', 'زوجية', 'أطفال', 'والدين', 'أقارب', 'عائلة', 'شرعي', 'إسلامي', 'مسيحي', 'عقد زواج', 'دعوى طلاق', 'نفقة زوجة', 'حضانة أطفال'],
    context: ['عائلة', 'قرابة', 'أبناء', 'زوج', 'زوجة', 'وراثة', 'تركة', 'أحوال', 'عائلي', 'أسري', 'زواج وطلاق', 'شؤون عائلية']
  },
  'عمالي': {
    primary: ['عمل', 'وظيفة', 'راتب', 'أجر', 'فصل', 'استقالة', 'إجازة'],
    secondary: ['عامل', 'موظف', 'صاحب عمل', 'شركة', 'مؤسسة'],
    context: ['عمالة', 'توظيف', 'حقوق العمال', 'قانون العمل']
  },
  'إداري': {
    primary: ['حكومة', 'وزارة', 'بلدية', 'ترخيص', 'قرار إداري', 'موظف عام'],
    secondary: ['إدارة', 'حكومي', 'رسمي', 'دولة', 'سلطة'],
    context: ['إجراءات', 'معاملة', 'خدمات حكومية', 'قطاع عام']
  },
  'عقاري': {
    primary: ['أرض', 'بيت', 'عقار', 'ملكية', 'إيجار', 'بناء', 'تطوير'],
    secondary: ['عقاري', 'سكني', 'تجاري', 'استثماري'],
    context: ['مساحة', 'موقع', 'حدود', 'جيران', 'تسجيل']
  },
  'ضريبي': {
    primary: ['ضريبة', 'رسوم', 'جمارك', 'ضريبة دخل', 'ضريبة مبيعات'],
    secondary: ['مالي', 'محاسبي', 'إقرار ضريبي'],
    context: ['دافع الضرائب', 'سلطة الضرائب', 'إعفاء ضريبي']
  },
  'دستوري': {
    primary: ['دستور', 'حقوق أساسية', 'حريات', 'انتخابات', 'برلمان'],
    secondary: ['دستوري', 'سياسي', 'قانون أساسي'],
    context: ['حكم', 'سلطة', 'فصل السلطات', 'رقابة دستورية']
  },
  'بيئي': {
    primary: ['بيئة', 'تلوث', 'نفايات', 'مياه', 'هواء', 'طبيعة'],
    secondary: ['بيئي', 'طبيعي', 'إيكولوجي', 'استدامة'],
    context: ['حماية البيئة', 'موارد طبيعية', 'تأثير بيئي']
  }
};

/**
 * كشف نوع القضية تلقائياً من النص
 */
export function detectCaseType(text: string): CaseTypeDetectionResult {
  const cleanText = text.toLowerCase().trim();
  const words = cleanText.split(/\s+/);
  
  const typeScores: { [key: string]: number } = {};
  const typeReasons: { [key: string]: string[] } = {};
  
  // تهيئة النقاط
  Object.keys(CASE_TYPE_KEYWORDS).forEach(type => {
    typeScores[type] = 0;
    typeReasons[type] = [];
  });

  // حساب النقاط لكل نوع
  Object.entries(CASE_TYPE_KEYWORDS).forEach(([type, keywords]) => {
    let score = 0;
    const reasons: string[] = [];

    // الكلمات الأساسية (وزن 3)
    keywords.primary.forEach(keyword => {
      const count = countOccurrences(cleanText, keyword);
      if (count > 0) {
        score += count * 3;
        reasons.push(`كلمة أساسية: "${keyword}" (${count} مرة)`);
      }
    });

    // الكلمات الثانوية (وزن 2)
    keywords.secondary.forEach(keyword => {
      const count = countOccurrences(cleanText, keyword);
      if (count > 0) {
        score += count * 2;
        reasons.push(`كلمة ثانوية: "${keyword}" (${count} مرة)`);
      }
    });

    // كلمات السياق (وزن 1)
    keywords.context.forEach(keyword => {
      const count = countOccurrences(cleanText, keyword);
      if (count > 0) {
        score += count * 1;
        reasons.push(`كلمة سياق: "${keyword}" (${count} مرة)`);
      }
    });

    typeScores[type] = score;
    typeReasons[type] = reasons;
  });

  // ترتيب الأنواع حسب النقاط
  const sortedTypes = Object.entries(typeScores)
    .sort(([, a], [, b]) => b - a)
    .filter(([, score]) => score > 0);

  // إذا لم يتم العثور على أي تطابق
  if (sortedTypes.length === 0) {
    return {
      suggestedType: 'عام',
      confidence: 0,
      reasons: ['لم يتم العثور على مؤشرات واضحة لنوع القضية'],
      alternativeTypes: []
    };
  }

  const [topType, topScore] = sortedTypes[0];
  const totalScore = Object.values(typeScores).reduce((sum, score) => sum + score, 0);
  const confidence = Math.min(95, Math.round((topScore / Math.max(totalScore, 1)) * 100));

  // الأنواع البديلة
  const alternativeTypes = sortedTypes.slice(1, 4).map(([type, score]) => ({
    type,
    confidence: Math.round((score / Math.max(totalScore, 1)) * 100),
    reason: typeReasons[type][0] || 'تطابق جزئي'
  }));

  return {
    suggestedType: topType,
    confidence,
    reasons: typeReasons[topType],
    alternativeTypes
  };
}

/**
 * عد مرات الظهور للكلمة في النص
 */
function countOccurrences(text: string, keyword: string): number {
  const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

/**
 * اقتراح أنواع إضافية بناءً على السياق
 */
export function suggestAdditionalTypes(text: string, currentType: string): string[] {
  const detection = detectCaseType(text);
  const suggestions: string[] = [];

  // إضافة الأنواع البديلة عالية الثقة
  detection.alternativeTypes.forEach(alt => {
    if (alt.confidence > 20 && alt.type !== currentType) {
      suggestions.push(alt.type);
    }
  });

  // اقتراحات ذكية بناءً على النوع الحالي
  const smartSuggestions: { [key: string]: string[] } = {
    'مدني': ['تجاري', 'عقاري'],
    'تجاري': ['مدني', 'ضريبي'],
    'جنائي': ['إداري'],
    'أحوال شخصية': ['مدني'],
    'عمالي': ['تجاري', 'إداري'],
    'إداري': ['دستوري'],
    'عقاري': ['مدني', 'تجاري'],
    'ضريبي': ['تجاري', 'إداري'],
    'بيئي': ['إداري', 'جنائي']
  };

  if (smartSuggestions[currentType]) {
    smartSuggestions[currentType].forEach(suggestion => {
      if (!suggestions.includes(suggestion)) {
        suggestions.push(suggestion);
      }
    });
  }

  return suggestions.slice(0, 3); // أقصى 3 اقتراحات
}

/**
 * تحليل تعقيد القضية
 */
export function analyzeCaseComplexity(text: string, types: string[]): {
  complexity: 'بسيط' | 'متوسط' | 'معقد' | 'معقد جداً';
  factors: string[];
  estimatedDuration: string;
} {
  const complexityFactors: string[] = [];
  let complexityScore = 0;

  // عدد الأنواع
  if (types.length > 1) {
    complexityScore += types.length * 2;
    complexityFactors.push(`قضية متعددة الأنواع (${types.length} أنواع)`);
  }

  // طول النص
  const wordCount = text.split(/\s+/).length;
  if (wordCount > 500) {
    complexityScore += 3;
    complexityFactors.push('نص مفصل وطويل');
  } else if (wordCount > 200) {
    complexityScore += 1;
    complexityFactors.push('نص متوسط الطول');
  }

  // كلمات تدل على التعقيد
  const complexityKeywords = [
    'متعدد الأطراف', 'معقد', 'متشابك', 'متداخل', 'صعب',
    'عدة جوانب', 'قوانين متعددة', 'اختصاصات مختلفة'
  ];

  complexityKeywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword)) {
      complexityScore += 2;
      complexityFactors.push(`عامل تعقيد: ${keyword}`);
    }
  });

  // تحديد مستوى التعقيد
  let complexity: 'بسيط' | 'متوسط' | 'معقد' | 'معقد جداً';
  let estimatedDuration: string;

  if (complexityScore <= 2) {
    complexity = 'بسيط';
    estimatedDuration = '1-2 ساعات';
  } else if (complexityScore <= 5) {
    complexity = 'متوسط';
    estimatedDuration = '3-5 ساعات';
  } else if (complexityScore <= 8) {
    complexity = 'معقد';
    estimatedDuration = '6-10 ساعات';
  } else {
    complexity = 'معقد جداً';
    estimatedDuration = 'أكثر من 10 ساعات';
  }

  return {
    complexity,
    factors: complexityFactors,
    estimatedDuration
  };
}

/**
 * مقارنة نتائج الكشف مع النظام القديم
 */
export function compareWithOldSystem(text: string, oldDetectedType: string): {
  newDetection: CaseTypeDetectionResult;
  isMatch: boolean;
  recommendation: string;
  accuracy: 'old_better' | 'new_better' | 'similar';
} {
  const newDetection = detectCaseType(text);
  const isMatch = newDetection.suggestedType === oldDetectedType;
  
  let recommendation: string;
  let accuracy: 'old_better' | 'new_better' | 'similar';
  
  if (isMatch) {
    recommendation = 'كلا النظامين متفقان - النتيجة موثوقة';
    accuracy = 'similar';
  } else {
    // تحليل دقة الكشف
    const newConfidence = newDetection.confidence;
    const hasOldTypeInAlternatives = newDetection.alternativeTypes.some(alt => alt.type === oldDetectedType);
    
    if (newConfidence > 70 && !hasOldTypeInAlternatives) {
      recommendation = `النظام الجديد أكثر دقة - ثقة عالية (${newConfidence}%)`;
      accuracy = 'new_better';
    } else if (hasOldTypeInAlternatives) {
      const altConfidence = newDetection.alternativeTypes.find(alt => alt.type === oldDetectedType)?.confidence || 0;
      if (newConfidence - altConfidence < 20) {
        recommendation = 'كلا النظامين صحيح - يُنصح بالجمع بين النوعين';
        accuracy = 'similar';
      } else {
        recommendation = `النظام الجديد أكثر دقة (${newConfidence}% مقابل ${altConfidence}%)`;
        accuracy = 'new_better';
      }
    } else {
      recommendation = 'يُنصح بمراجعة النص - قد يحتوي على أنواع متعددة';
      accuracy = 'old_better';
    }
  }
  
  return {
    newDetection,
    isMatch,
    recommendation,
    accuracy
  };
}

/**
 * اقتراح مراحل مخصصة بناءً على نوع القضية
 */
export function suggestCustomStages(types: string[]): string[] {
  const stageMap: { [key: string]: string[] } = {
    'مدني': [
      'تحليل العقد أو الاتفاقية',
      'تحديد الالتزامات والحقوق',
      'تقييم المسؤولية المدنية'
    ],
    'جنائي': [
      'تحليل الأدلة الجنائية',
      'دراسة ظروف الجريمة',
      'تقييم العقوبة المتوقعة'
    ],
    'تجاري': [
      'تحليل الوضع المالي',
      'دراسة القوانين التجارية',
      'تقييم المخاطر التجارية'
    ],
    'أحوال شخصية': [
      'تحليل الوضع العائلي',
      'دراسة حقوق الأطفال',
      'تقييم النفقة والحضانة'
    ],
    'عمالي': [
      'تحليل عقد العمل',
      'دراسة حقوق العامل',
      'تقييم التعويضات'
    ]
  };

  const customStages = new Set<string>();

  types.forEach(type => {
    if (stageMap[type]) {
      stageMap[type].forEach(stage => customStages.add(stage));
    }
  });

  return Array.from(customStages);
}