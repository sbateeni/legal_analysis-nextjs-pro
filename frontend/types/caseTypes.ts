// تعريف تكوين ربط التخصصات بالمراحل
// Case type → default and optional specialized stages

export interface CaseTypeConfig {
  id: string;
  label: string;
  keywords?: string[];
  inheritsFrom?: string; // لاستخدامه مع الأنواع المخصصة لاحقاً
  defaultStages: string[]; // مراحل تخصصية تُضاف دائماً عند اختيار النوع
  optionalStages?: string[]; // مراحل يمكن إضافتها في الوضع المتقدم
}

export const CASE_TYPE_CONFIG: Record<string, CaseTypeConfig> = {
  'عام': {
    id: 'general',
    label: 'عام',
    defaultStages: []
  },
  'مدني': {
    id: 'civil',
    label: 'مدني',
    keywords: ['تعويض', 'مسؤولية', 'عقد', 'فسخ', 'دعوى مدنية'],
    defaultStages: [
      'مرحلة تخصصية: توصيف العلاقة القانونية المدنية',
      'مرحلة تخصصية: شروط المسؤولية المدنية وإثبات الضرر'
    ],
    optionalStages: [
      'مرحلة تخصصية: بطلان/فسخ/تعويض في العقود',
      'مرحلة تخصصية: تقدير التعويض ومعاييره'
    ]
  },
  'جنائي': {
    id: 'criminal',
    label: 'جنائي',
    keywords: ['جناية', 'جنحة', 'دعوى جزائية', 'ادعاء عام'],
    defaultStages: [
      'مرحلة تخصصية: تكييف الجريمة وتحديد الأركان',
      'مرحلة تخصصية: سلامة الإجراءات وأثر البطلان'
    ],
    optionalStages: [
      'مرحلة تخصصية: ظروف مشددة ومخففة',
      'مرحلة تخصصية: تقدير العقوبة والبدائل'
    ]
  },
  'تجاري': {
    id: 'commercial',
    label: 'تجاري',
    keywords: ['شركة', 'أوراق تجارية', 'تحكيم', 'سجل تجاري'],
    defaultStages: [
      'مرحلة تخصصية: الطبيعة التجارية للعمل والعقد',
      'مرحلة تخصصية: الإثبات التجاري والدفاتر'
    ],
    optionalStages: [
      'مرحلة تخصصية: التحكيم التجاري ومتطلباته',
      'مرحلة تخصصية: مسؤولية الشركاء والإدارة'
    ]
  },
  'أحوال شخصية': {
    id: 'family',
    label: 'أحوال شخصية',
    keywords: ['نفقة', 'حضانة', 'طلاق', 'ولاية'],
    defaultStages: [
      'مرحلة تخصصية: الولاية والنفقة والحضانة',
      'مرحلة تخصصية: شروط الزواج والطلاق وآثارهما'
    ],
    optionalStages: [
      'مرحلة تخصصية: تقدير النفقة ومعاييرها',
      'مرحلة تخصصية: تنظيم الزيارة والاستضافة'
    ]
  },
  'عمالي': {
    id: 'labor',
    label: 'عمالي',
    keywords: ['أجور', 'فصل تعسفي', 'إصابات عمل'],
    defaultStages: [
      'مرحلة تخصصية: علاقة العمل والأجر والبدلات',
      'مرحلة تخصصية: إنهاء الخدمة والتعويضات'
    ],
    optionalStages: [
      'مرحلة تخصصية: إصابات العمل والمسؤولية',
      'مرحلة تخصصية: ساعات العمل والإجازات'
    ]
  },
  'إداري': {
    id: 'administrative',
    label: 'إداري',
    keywords: ['قرار إداري', 'دعوى إلغاء', 'اختصاص'],
    defaultStages: [
      'مرحلة تخصصية: ركن القرار الإداري وعيوبه',
      'مرحلة تخصصية: مواعيد الطعن والاختصاص'
    ],
    optionalStages: [
      'مرحلة تخصصية: أثر وقف التنفيذ',
      'مرحلة تخصصية: التعويض عن القرارات'
    ]
  },
  'عقاري': {
    id: 'realestate',
    label: 'عقاري',
    keywords: ['ملكية', 'حدود', 'تسجيل', 'ارتفاق'],
    defaultStages: [
      'مرحلة تخصصية: إثبات الملكية والتسجيل',
      'مرحلة تخصصية: الحدود والارتفاق والنزاعات'
    ],
    optionalStages: [
      'مرحلة تخصصية: نزع الملكية للمنفعة العامة',
      'مرحلة تخصصية: الإيجار العقاري والمنازعات'
    ]
  },
  'ضريبي': {
    id: 'tax',
    label: 'ضريبي',
    keywords: ['ضريبة', 'وعاء', 'طعن', 'غرامة'],
    defaultStages: [
      'مرحلة تخصصية: تقدير الوعاء الضريبي والالتزام',
      'مرحلة تخصصية: إجراءات الفحص والطعن'
    ],
    optionalStages: [
      'مرحلة تخصصية: الإعفاءات والتحفيزات',
      'مرحلة تخصصية: الجزاءات والغرامات'
    ]
  },
  'دستوري': {
    id: 'constitutional',
    label: 'دستوري',
    keywords: ['عدم الدستورية', 'منازعات السلطة'],
    defaultStages: [
      'مرحلة تخصصية: شبهة عدم الدستورية وأثرها',
      'مرحلة تخصصية: شروط الدفع بعدم الدستورية'
    ],
    optionalStages: [
      'مرحلة تخصصية: الرقابة اللاحقة والسابقة',
      'مرحلة تخصصية: تعارض القوانين والسلم التشريعي'
    ]
  },
  'بيئي': {
    id: 'environmental',
    label: 'بيئي',
    keywords: ['تلوث', 'ترخيص', 'أثر بيئي'],
    defaultStages: [
      'مرحلة تخصصية: المخالفات البيئية والترخيص',
      'مرحلة تخصصية: التعويض عن الضرر البيئي'
    ],
    optionalStages: [
      'مرحلة تخصصية: تقييم الأثر البيئي',
      'مرحلة تخصصية: المسؤولية المشتركة'
    ]
  }
};

export function buildSpecializedStages(selectedTypes: string[], includeOptionals: boolean = false): string[] {
  const unique = new Set<string>();
  for (const t of selectedTypes) {
    const cfg = CASE_TYPE_CONFIG[t];
    if (!cfg) continue;
    cfg.defaultStages.forEach(s => unique.add(s));
    if (includeOptionals) {
      (cfg.optionalStages || []).forEach(s => unique.add(s));
    }
  }
  return Array.from(unique);
}


