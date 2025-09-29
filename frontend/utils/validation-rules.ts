import { AnalysisRequest, PartyRole } from '../types/analysis';

// قواعد التحقق الخاصة بكل تخصص
export interface SpecializedValidationRule {
  caseType: string;
  requiredFields: string[];
  optionalFields: string[];
  textPatterns: RegExp[];
  minTextLength: number;
  maxTextLength: number;
  customValidation?: (request: AnalysisRequest) => string | null;
}

// قواعد التحقق للتخصصات المختلفة
export const SPECIALIZED_VALIDATION_RULES: SpecializedValidationRule[] = [
  // ميراث
  {
    caseType: 'ميراث',
    requiredFields: ['text', 'apiKey', 'stageIndex'],
    optionalFields: ['previousSummaries', 'finalPetition', 'caseType', 'complexity', 'partyRole'],
    textPatterns: [
      /ميراث|ورثة|إرث|تركة|أنصبة|فروض|عصبة/i,
      /وفاة|متوفى|راحل|رحل/i,
      /أولاد|بنات|أبناء|بنات|أخوة|أخوات/i
    ],
    minTextLength: 20,
    maxTextLength: 15000,
    customValidation: (request: AnalysisRequest) => {
      const text = request.text.toLowerCase();
      
      // التحقق من وجود معلومات أساسية عن الميراث
      if (!/ميراث|ورثة|إرث|تركة/i.test(text)) {
        return 'يجب أن يحتوي النص على معلومات عن الميراث أو الورثة';
      }
      
      // التحقق من وجود معلومات عن المتوفى
      if (!/وفاة|متوفى|راحل|رحل/i.test(text)) {
        return 'يجب أن يحتوي النص على معلومات عن المتوفى';
      }
      
      // التحقق من وجود معلومات عن الورثة
      if (!/أولاد|بنات|أبناء|بنات|أخوة|أخوات|والد|والدة|جد|جدة/i.test(text)) {
        return 'يجب أن يحتوي النص على معلومات عن الورثة أو أفراد العائلة';
      }
      
      return null;
    }
  },
  
  // أحوال شخصية
  {
    caseType: 'أحوال شخصية',
    requiredFields: ['text', 'apiKey', 'stageIndex'],
    optionalFields: ['previousSummaries', 'finalPetition', 'caseType', 'complexity', 'partyRole'],
    textPatterns: [
      /طلاق|زواج|أحوال شخصية|حضانة|نفقة|مؤخر|شقاق|نزاع/i,
      /زوج|زوجة|أطفال|أولاد|بنات/i,
      /عقد|عقد زواج|كتاب|مؤخر|مهر/i
    ],
    minTextLength: 25,
    maxTextLength: 12000,
    customValidation: (request: AnalysisRequest) => {
      const text = request.text.toLowerCase();
      
      // التحقق من وجود معلومات عن العلاقة الزوجية
      if (!/زوج|زوجة|زواج|طلاق/i.test(text)) {
        return 'يجب أن يحتوي النص على معلومات عن العلاقة الزوجية';
      }
      
      // التحقق من وجود معلومات عن الأطفال (إن وجدوا)
      if (!/أطفال|أولاد|بنات|حضانة|نفقة/i.test(text)) {
        return 'يجب أن يحتوي النص على معلومات عن الأطفال أو الحضانة أو النفقة';
      }
      
      return null;
    }
  },
  
  // تجاري
  {
    caseType: 'تجاري',
    requiredFields: ['text', 'apiKey', 'stageIndex'],
    optionalFields: ['previousSummaries', 'finalPetition', 'caseType', 'complexity', 'partyRole'],
    textPatterns: [
      /عقد|تجاري|شركة|كمبيالة|شيك|مصرف/i,
      /بيع|شراء|تأجير|إيجار|خدمات/i,
      /دفع|أقساط|ضمان|تأمين/i
    ],
    minTextLength: 30,
    maxTextLength: 20000,
    customValidation: (request: AnalysisRequest) => {
      const text = request.text.toLowerCase();
      
      // التحقق من وجود معلومات عن العقد التجاري
      if (!/عقد|تجاري|شركة|بيع|شراء/i.test(text)) {
        return 'يجب أن يحتوي النص على معلومات عن العقد التجاري أو المعاملة التجارية';
      }
      
      // التحقق من وجود معلومات عن الأطراف
      if (!/طرف|أطراف|بائع|مشتري|مؤجر|مستأجر/i.test(text)) {
        return 'يجب أن يحتوي النص على معلومات عن الأطراف في المعاملة التجارية';
      }
      
      return null;
    }
  },
  
  // جنائي
  {
    caseType: 'جنائي',
    requiredFields: ['text', 'apiKey', 'stageIndex'],
    optionalFields: ['previousSummaries', 'finalPetition', 'caseType', 'complexity', 'partyRole'],
    textPatterns: [
      /جريمة|جنائي|عقوبة|سجن|غرامة/i,
      /ضبط|تفتيش|استجواب|تحقيق/i,
      /شاهد|شهادة|دليل|إثبات/i
    ],
    minTextLength: 35,
    maxTextLength: 18000,
    customValidation: (request: AnalysisRequest) => {
      const text = request.text.toLowerCase();
      
      // التحقق من وجود معلومات عن الجريمة
      if (!/جريمة|جنائي|عقوبة|ضبط|تفتيش/i.test(text)) {
        return 'يجب أن يحتوي النص على معلومات عن الجريمة أو الإجراءات الجنائية';
      }
      
      // التحقق من وجود معلومات عن الأدلة
      if (!/شاهد|شهادة|دليل|إثبات|ضبط|تفتيش/i.test(text)) {
        return 'يجب أن يحتوي النص على معلومات عن الأدلة أو الشهود';
      }
      
      return null;
    }
  },
  
  // عمل
  {
    caseType: 'عمل',
    requiredFields: ['text', 'apiKey', 'stageIndex'],
    optionalFields: ['previousSummaries', 'finalPetition', 'caseType', 'complexity', 'partyRole'],
    textPatterns: [
      /عمل|عامل|موظف|راتب|أجر|إجازة/i,
      /فصل|استقالة|تعسفي|تعويض/i,
      /عقد عمل|مكافأة|نهاية خدمة/i
    ],
    minTextLength: 25,
    maxTextLength: 10000,
    customValidation: (request: AnalysisRequest) => {
      const text = request.text.toLowerCase();
      
      // التحقق من وجود معلومات عن العلاقة العمالية
      if (!/عمل|عامل|موظف|راتب|أجر/i.test(text)) {
        return 'يجب أن يحتوي النص على معلومات عن العلاقة العمالية أو الأجور';
      }
      
      // التحقق من وجود معلومات عن المشكلة العمالية
      if (!/فصل|استقالة|تعسفي|تعويض|إجازة/i.test(text)) {
        return 'يجب أن يحتوي النص على معلومات عن المشكلة العمالية (فصل، استقالة، تعويض، إلخ)';
      }
      
      return null;
    }
  },
  
  // عقاري
  {
    caseType: 'عقاري',
    requiredFields: ['text', 'apiKey', 'stageIndex'],
    optionalFields: ['previousSummaries', 'finalPetition', 'caseType', 'complexity', 'partyRole'],
    textPatterns: [
      /عقار|أرض|بيت|شقة|ملكية|حيازة/i,
      /إيجار|إخلاء|بدل|إيجاري/i,
      /عقد|عقد إيجار|عقد بيع/i
    ],
    minTextLength: 30,
    maxTextLength: 15000,
    customValidation: (request: AnalysisRequest) => {
      const text = request.text.toLowerCase();
      
      // التحقق من وجود معلومات عن العقار
      if (!/عقار|أرض|بيت|شقة|ملكية|حيازة/i.test(text)) {
        return 'يجب أن يحتوي النص على معلومات عن العقار أو الملكية';
      }
      
      // التحقق من وجود معلومات عن النزاع العقاري
      if (!/إيجار|إخلاء|بدل|نزاع|خلاف/i.test(text)) {
        return 'يجب أن يحتوي النص على معلومات عن النزاع العقاري أو الإيجاري';
      }
      
      return null;
    }
  },
  
  // إداري
  {
    caseType: 'إداري',
    requiredFields: ['text', 'apiKey', 'stageIndex'],
    optionalFields: ['previousSummaries', 'finalPetition', 'caseType', 'complexity', 'partyRole'],
    textPatterns: [
      /إداري|قرار|جهة|مؤسسة|وزارة/i,
      /طعن|إلغاء|وقف تنفيذ/i,
      /مصلحة|ضرر|خطر/i
    ],
    minTextLength: 35,
    maxTextLength: 12000,
    customValidation: (request: AnalysisRequest) => {
      const text = request.text.toLowerCase();
      
      // التحقق من وجود معلومات عن القرار الإداري
      if (!/إداري|قرار|جهة|مؤسسة|وزارة/i.test(text)) {
        return 'يجب أن يحتوي النص على معلومات عن القرار الإداري أو الجهة الإدارية';
      }
      
      // التحقق من وجود معلومات عن الطعن
      if (!/طعن|إلغاء|وقف تنفيذ|مصلحة/i.test(text)) {
        return 'يجب أن يحتوي النص على معلومات عن الطعن أو المصلحة في الطعن';
      }
      
      return null;
    }
  },
  
  // إيجارات
  {
    caseType: 'إيجارات',
    requiredFields: ['text', 'apiKey', 'stageIndex'],
    optionalFields: ['previousSummaries', 'finalPetition', 'caseType', 'complexity', 'partyRole'],
    textPatterns: [
      /إيجار|إيجاري|عقد إيجار|مؤجر|مستأجر/i,
      /بدل|إخلاء|تنبيه|فسخ/i,
      /عقار|أرض|بيت|شقة/i
    ],
    minTextLength: 25,
    maxTextLength: 10000,
    customValidation: (request: AnalysisRequest) => {
      const text = request.text.toLowerCase();
      
      // التحقق من وجود معلومات عن عقد الإيجار
      if (!/إيجار|إيجاري|عقد إيجار|مؤجر|مستأجر/i.test(text)) {
        return 'يجب أن يحتوي النص على معلومات عن عقد الإيجار أو العلاقة الإيجارية';
      }
      
      // التحقق من وجود معلومات عن البدل أو الإخلاء
      if (!/بدل|إخلاء|تنبيه|فسخ/i.test(text)) {
        return 'يجب أن يحتوي النص على معلومات عن البدل أو الإخلاء أو التنبيه';
      }
      
      return null;
    }
  }
];

// دالة الحصول على قواعد التحقق للتخصص المحدد
export function getValidationRulesForCaseType(caseType: string): SpecializedValidationRule | null {
  return SPECIALIZED_VALIDATION_RULES.find(rule => rule.caseType === caseType) || null;
}

// دالة التحقق من النص حسب التخصص
export function validateTextForCaseType(text: string, caseType: string): string | null {
  const rules = getValidationRulesForCaseType(caseType);
  if (!rules) return null;
  
  // التحقق من الطول
  if (text.length < rules.minTextLength) {
    return `النص قصير جداً للتخصص "${caseType}". الحد الأدنى ${rules.minTextLength} حرف`;
  }
  
  if (text.length > rules.maxTextLength) {
    return `النص طويل جداً للتخصص "${caseType}". الحد الأقصى ${rules.maxTextLength} حرف`;
  }
  
  // التحقق من الأنماط
  const hasValidPattern = rules.textPatterns.some(pattern => pattern.test(text));
  if (!hasValidPattern) {
    return `النص لا يحتوي على معلومات مناسبة للتخصص "${caseType}"`;
  }
  
  return null;
}

// دالة التحقق الشاملة حسب التخصص
export function validateRequestForCaseType(request: AnalysisRequest): string | null {
  const rules = getValidationRulesForCaseType(request.caseType || 'عام');
  if (!rules) return null;
  
  // التحقق من الحقول المطلوبة
  for (const field of rules.requiredFields) {
    if (!(field in request) || !request[field as keyof AnalysisRequest]) {
      return `الحقل "${field}" مطلوب للتخصص "${request.caseType}"`;
    }
  }
  
  // التحقق من النص
  const textValidation = validateTextForCaseType(request.text, request.caseType || 'عام');
  if (textValidation) return textValidation;
  
  // التحقق المخصص
  if (rules.customValidation) {
    return rules.customValidation(request);
  }
  
  return null;
}

// دالة التحقق من صحة نوع القضية
export function isValidCaseType(caseType: string): boolean {
  return SPECIALIZED_VALIDATION_RULES.some(rule => rule.caseType === caseType);
}

// دالة الحصول على جميع أنواع القضايا المدعومة
export function getSupportedCaseTypes(): string[] {
  return SPECIALIZED_VALIDATION_RULES.map(rule => rule.caseType);
}

// دالة التحقق من صحة صفة الطرف للتخصص
export function isValidPartyRoleForCaseType(partyRole: PartyRole, caseType: string): boolean {
  const validRoles: { [key: string]: PartyRole[] } = {
    'ميراث': ['المشتكي', 'المشتكى عليه'],
    'أحوال شخصية': ['المشتكي', 'المشتكى عليه'],
    'تجاري': ['المشتكي', 'المشتكى عليه', 'المدعي', 'المدعى عليه'],
    'جنائي': ['المشتكي', 'المشتكى عليه'],
    'عمل': ['المشتكي', 'المشتكى عليه'],
    'عقاري': ['المشتكي', 'المشتكى عليه', 'المدعي', 'المدعى عليه'],
    'إداري': ['المشتكي', 'المشتكى عليه'],
    'إيجارات': ['المشتكي', 'المشتكى عليه', 'المدعي', 'المدعى عليه']
  };
  
  const allowedRoles = validRoles[caseType] || ['المشتكي', 'المشتكى عليه', 'المدعي', 'المدعى عليه'];
  return allowedRoles.includes(partyRole);
}
