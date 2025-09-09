/**
 * نظام المراحل المخصصة والمدمجة
 * Custom and Integrated Stages System
 */

import { suggestCustomStages } from '../utils/caseTypeDetection';

export interface CustomStage {
  id: string;
  name: string;
  description: string;
  type: 'default' | 'custom' | 'suggested';
  caseTypes: string[];
  order: number;
  isRequired: boolean;
  estimatedDuration?: string;
  prerequisites?: string[];
}

export interface StageTemplate {
  name: string;
  description: string;
  applicableTo: string[];
  estimatedDuration: string;
  isCore: boolean;
}

// قوالب المراحل المخصصة لكل نوع قضية
const STAGE_TEMPLATES: { [key: string]: StageTemplate[] } = {
  'مدني': [
    {
      name: 'تحليل العقد أو الاتفاقية المدنية',
      description: 'فحص تفصيلي للعقد أو الاتفاقية محل النزاع',
      applicableTo: ['مدني'],
      estimatedDuration: '30-45 دقيقة',
      isCore: true
    },
    {
      name: 'تحديد الالتزامات والحقوق المدنية',
      description: 'تحديد التزامات وحقوق كل طرف في النزاع',
      applicableTo: ['مدني'],
      estimatedDuration: '20-30 دقيقة',
      isCore: true
    },
    {
      name: 'تقييم المسؤولية المدنية',
      description: 'تحليل مدى مسؤولية الأطراف والأضرار الناتجة',
      applicableTo: ['مدني'],
      estimatedDuration: '25-35 دقيقة',
      isCore: true
    },
    {
      name: 'حساب التعويضات المدنية',
      description: 'تقدير قيمة التعويضات المستحقة',
      applicableTo: ['مدني'],
      estimatedDuration: '15-25 دقيقة',
      isCore: false
    }
  ],
  'جنائي': [
    {
      name: 'تحليل الأدلة الجنائية',
      description: 'فحص وتقييم الأدلة المتوفرة في القضية',
      applicableTo: ['جنائي'],
      estimatedDuration: '45-60 دقيقة',
      isCore: true
    },
    {
      name: 'دراسة ظروف الجريمة',
      description: 'تحليل الظروف المحيطة بارتكاب الجريمة',
      applicableTo: ['جنائي'],
      estimatedDuration: '30-40 دقيقة',
      isCore: true
    },
    {
      name: 'تقييم العقوبة المتوقعة',
      description: 'تحديد العقوبة المناسبة وفقاً للقانون',
      applicableTo: ['جنائي'],
      estimatedDuration: '20-30 دقيقة',
      isCore: true
    },
    {
      name: 'تحليل الظروف المخففة والمشددة',
      description: 'دراسة العوامل التي تؤثر على العقوبة',
      applicableTo: ['جنائي'],
      estimatedDuration: '15-25 دقيقة',
      isCore: false
    }
  ],
  'تجاري': [
    {
      name: 'تحليل الوضع المالي للشركة',
      description: 'فحص الوضع المالي والحسابات',
      applicableTo: ['تجاري'],
      estimatedDuration: '40-50 دقيقة',
      isCore: true
    },
    {
      name: 'دراسة القوانين التجارية المطبقة',
      description: 'تحليل القوانين التجارية ذات الصلة',
      applicableTo: ['تجاري'],
      estimatedDuration: '30-40 دقيقة',
      isCore: true
    },
    {
      name: 'تقييم المخاطر التجارية',
      description: 'تحديد المخاطر المالية والقانونية',
      applicableTo: ['تجاري'],
      estimatedDuration: '25-35 دقيقة',
      isCore: true
    },
    {
      name: 'تحليل عقود الشراكة',
      description: 'فحص عقود الشراكة والاستثمار',
      applicableTo: ['تجاري'],
      estimatedDuration: '35-45 دقيقة',
      isCore: false
    }
  ],
  'أحوال شخصية': [
    {
      name: 'تحليل الوضع العائلي',
      description: 'فحص ظروف الأسرة والعلاقات',
      applicableTo: ['أحوال شخصية'],
      estimatedDuration: '25-35 دقيقة',
      isCore: true
    },
    {
      name: 'دراسة حقوق الأطفال',
      description: 'تحليل حقوق ومصالح الأطفال',
      applicableTo: ['أحوال شخصية'],
      estimatedDuration: '20-30 دقيقة',
      isCore: true
    },
    {
      name: 'تقييم النفقة والحضانة',
      description: 'تحديد النفقة وترتيبات الحضانة',
      applicableTo: ['أحوال شخصية'],
      estimatedDuration: '30-40 دقيقة',
      isCore: true
    },
    {
      name: 'تحليل الإرث والوصية',
      description: 'دراسة قضايا الميراث والوصايا',
      applicableTo: ['أحوال شخصية'],
      estimatedDuration: '25-35 دقيقة',
      isCore: false
    }
  ],
  'عمالي': [
    {
      name: 'تحليل عقد العمل',
      description: 'فحص تفاصيل وشروط عقد العمل',
      applicableTo: ['عمالي'],
      estimatedDuration: '25-35 دقيقة',
      isCore: true
    },
    {
      name: 'دراسة حقوق العامل',
      description: 'تحليل حقوق العامل وفقاً للقانون',
      applicableTo: ['عمالي'],
      estimatedDuration: '20-30 دقيقة',
      isCore: true
    },
    {
      name: 'تقييم التعويضات العمالية',
      description: 'حساب التعويضات والمستحقات',
      applicableTo: ['عمالي'],
      estimatedDuration: '15-25 دقيقة',
      isCore: true
    },
    {
      name: 'تحليل ظروف العمل',
      description: 'دراسة بيئة العمل وشروط السلامة',
      applicableTo: ['عمالي'],
      estimatedDuration: '20-30 دقيقة',
      isCore: false
    }
  ],
  'إداري': [
    {
      name: 'تحليل القرار الإداري',
      description: 'فحص مشروعية القرار الإداري',
      applicableTo: ['إداري'],
      estimatedDuration: '30-40 دقيقة',
      isCore: true
    },
    {
      name: 'دراسة الإجراءات الإدارية',
      description: 'تحليل سلامة الإجراءات المتبعة',
      applicableTo: ['إداري'],
      estimatedDuration: '25-35 دقيقة',
      isCore: true
    },
    {
      name: 'تقييم التعويض الإداري',
      description: 'تحديد التعويض عن الضرر الإداري',
      applicableTo: ['إداري'],
      estimatedDuration: '20-30 دقيقة',
      isCore: false
    }
  ]
};

/**
 * إنشاء مراحل مخصصة بناءً على أنواع القضايا المختارة
 */
export function generateCustomStages(caseTypes: string[]): CustomStage[] {
  const customStages: CustomStage[] = [];
  let order = 1000; // بدء من رقم عالي للمراحل المخصصة

  // إضافة المراحل الأساسية لكل نوع
  caseTypes.forEach(caseType => {
    if (STAGE_TEMPLATES[caseType]) {
      STAGE_TEMPLATES[caseType].forEach(template => {
        // التحقق من عدم وجود مرحلة مشابهة
        const existingStage = customStages.find(stage => 
          stage.name.includes(template.name) || template.name.includes(stage.name)
        );

        if (!existingStage) {
          customStages.push({
            id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: template.name,
            description: template.description,
            type: 'suggested',
            caseTypes: [caseType],
            order: order++,
            isRequired: template.isCore,
            estimatedDuration: template.estimatedDuration
          });
        } else {
          // إضافة نوع القضية للمرحلة الموجودة
          if (!existingStage.caseTypes.includes(caseType)) {
            existingStage.caseTypes.push(caseType);
          }
        }
      });
    }
  });

  // ترتيب المراحل حسب الأهمية
  return customStages.sort((a, b) => {
    // المراحل المطلوبة أولاً
    if (a.isRequired && !b.isRequired) return -1;
    if (!a.isRequired && b.isRequired) return 1;
    
    // ثم حسب عدد أنواع القضايا (المراحل المشتركة أولاً)
    if (a.caseTypes.length !== b.caseTypes.length) {
      return b.caseTypes.length - a.caseTypes.length;
    }
    
    return a.order - b.order;
  });
}

/**
 * دمج المراحل المخصصة مع المراحل الافتراضية
 */
export function integrateCustomStages(
  defaultStages: string[],
  customStages: CustomStage[],
  caseTypes: string[]
): {
  integrated: Array<{
    name: string;
    type: 'default' | 'custom';
    order: number;
    isRequired: boolean;
    description?: string;
    estimatedDuration?: string;
  }>;
  insertionPoints: { [key: string]: number };
} {
  const integrated: Array<{
    name: string;
    type: 'default' | 'custom';
    order: number;
    isRequired: boolean;
    description?: string;
    estimatedDuration?: string;
  }> = [];

  // إضافة المراحل الافتراضية
  defaultStages.forEach((stage, index) => {
    integrated.push({
      name: stage,
      type: 'default',
      order: index,
      isRequired: true
    });
  });

  // تحديد نقاط الإدراج للمراحل المخصصة
  const insertionPoints: { [key: string]: number } = {
    'early': Math.floor(defaultStages.length * 0.2), // 20% من البداية
    'middle': Math.floor(defaultStages.length * 0.5), // منتصف المراحل
    'late': Math.floor(defaultStages.length * 0.8), // 80% من المراحل
    'end': defaultStages.length // في النهاية
  };

  // إضافة المراحل المخصصة في النقاط المناسبة
  customStages.forEach(customStage => {
    let insertionPoint = insertionPoints['middle']; // النقطة الافتراضية

    // تحديد النقطة المناسبة بناءً على نوع المرحلة
    if (customStage.name.includes('تحليل') || customStage.name.includes('فحص')) {
      insertionPoint = insertionPoints['early'];
    } else if (customStage.name.includes('تقييم') || customStage.name.includes('حساب')) {
      insertionPoint = insertionPoints['late'];
    } else if (customStage.name.includes('استراتيجية') || customStage.name.includes('خطة')) {
      insertionPoint = insertionPoints['end'];
    }

    // إدراج المرحلة في النقطة المحددة
    integrated.splice(insertionPoint, 0, {
      name: customStage.name,
      type: 'custom',
      order: customStage.order,
      isRequired: customStage.isRequired,
      description: customStage.description,
      estimatedDuration: customStage.estimatedDuration
    });
  });

  return { integrated, insertionPoints };
}

/**
 * تخصيص المراحل بناءً على تعقيد القضية
 */
export function customizeStagesByComplexity(
  stages: CustomStage[],
  complexity: 'بسيط' | 'متوسط' | 'معقد' | 'معقد جداً'
): CustomStage[] {
  const complexityMultipliers = {
    'بسيط': 0.8,
    'متوسط': 1.0,
    'معقد': 1.3,
    'معقد جداً': 1.6
  };

  const multiplier = complexityMultipliers[complexity];

  return stages.map(stage => {
    // تعديل المدة المقدرة
    if (stage.estimatedDuration) {
      const [min, max] = stage.estimatedDuration.match(/\d+/g)?.map(Number) || [30, 40];
      const newMin = Math.round(min * multiplier);
      const newMax = Math.round(max * multiplier);
      stage.estimatedDuration = `${newMin}-${newMax} دقيقة`;
    }

    // إضافة مراحل إضافية للقضايا المعقدة
    if (complexity === 'معقد' || complexity === 'معقد جداً') {
      stage.isRequired = true; // جعل جميع المراحل مطلوبة للقضايا المعقدة
    }

    return stage;
  });
}

/**
 * اقتراح مراحل إضافية بناءً على التحليل
 */
export function suggestAdditionalStages(
  text: string,
  currentStages: string[],
  caseTypes: string[]
): CustomStage[] {
  const suggestions: CustomStage[] = [];
  const textLower = text.toLowerCase();

  // اقتراحات بناءً على الكلمات المفتاحية
  const keywordSuggestions: { [key: string]: Partial<CustomStage> } = {
    'خبير': {
      name: 'استشارة خبير متخصص',
      description: 'الحصول على رأي خبير في الموضوع',
      estimatedDuration: '60-90 دقيقة'
    },
    'شاهد': {
      name: 'تحليل شهادات الشهود',
      description: 'فحص وتقييم شهادات الشهود',
      estimatedDuration: '30-45 دقيقة'
    },
    'وثيقة': {
      name: 'تحليل الوثائق الإضافية',
      description: 'فحص الوثائق والمستندات المرفقة',
      estimatedDuration: '45-60 دقيقة'
    },
    'تعويض': {
      name: 'تقدير التعويضات المفصل',
      description: 'حساب دقيق للتعويضات والأضرار',
      estimatedDuration: '30-45 دقيقة'
    },
    'استئناف': {
      name: 'إعداد استراتيجية الاستئناف',
      description: 'تحضير خطة للطعن في الحكم',
      estimatedDuration: '45-60 دقيقة'
    }
  };

  Object.entries(keywordSuggestions).forEach(([keyword, suggestion]) => {
    if (textLower.includes(keyword) && !currentStages.some(stage => stage.includes(suggestion.name!))) {
      suggestions.push({
        id: `suggested-${Date.now()}-${keyword}`,
        name: suggestion.name!,
        description: suggestion.description!,
        type: 'suggested',
        caseTypes: caseTypes,
        order: 2000 + suggestions.length,
        isRequired: false,
        estimatedDuration: suggestion.estimatedDuration
      });
    }
  });

  return suggestions;
}

/**
 * إنشاء تقرير المراحل المخصصة
 */
export function generateStagesReport(
  originalStages: string[],
  customStages: CustomStage[],
  caseTypes: string[]
): {
  summary: string;
  addedStages: number;
  totalEstimatedTime: string;
  typeBreakdown: { [key: string]: number };
  recommendations: string[];
} {
  const addedStages = customStages.length;
  
  // حساب الوقت المقدر الإجمالي
  let totalMinutes = 0;
  customStages.forEach(stage => {
    if (stage.estimatedDuration) {
      const match = stage.estimatedDuration.match(/(\d+)-(\d+)/);
      if (match) {
        const avg = (parseInt(match[1]) + parseInt(match[2])) / 2;
        totalMinutes += avg;
      }
    }
  });

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const totalEstimatedTime = hours > 0 ? `${hours} ساعة و ${minutes} دقيقة` : `${minutes} دقيقة`;

  // توزيع حسب النوع
  const typeBreakdown: { [key: string]: number } = {};
  caseTypes.forEach(type => {
    typeBreakdown[type] = customStages.filter(stage => stage.caseTypes.includes(type)).length;
  });

  // التوصيات
  const recommendations: string[] = [];
  
  if (addedStages > 5) {
    recommendations.push('يُنصح بتقسيم المراحل إلى جلسات متعددة');
  }
  
  if (totalMinutes > 240) {
    recommendations.push('القضية معقدة وتتطلب وقتاً كافياً للتحليل');
  }
  
  if (caseTypes.length > 2) {
    recommendations.push('القضية متعددة الأنواع - يُنصح بالتركيز على النوع الرئيسي أولاً');
  }

  const summary = `تم إضافة ${addedStages} مرحلة مخصصة للقضية من نوع: ${caseTypes.join('، ')}`;

  return {
    summary,
    addedStages,
    totalEstimatedTime,
    typeBreakdown,
    recommendations
  };
}