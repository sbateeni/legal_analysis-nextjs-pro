import { StageDetails, AnalysisContext } from '../types/analysis';

// دالة بناء prompt محسن لكل مرحلة
export function buildEnhancedPrompt(
  stage: StageDetails, 
  text: string, 
  previousSummaries?: string[],
  context?: AnalysisContext
): string {
  const contextInfo = context ? `
السياق القانوني:
- نوع القضية: ${context.caseType || 'غير محدد'}
- مستوى التعقيد: ${context.complexity || 'متوسط'}
- الاختصاص: ${context.jurisdiction || 'فلسطيني'}
- اللغة: ${context.language || 'العربية'}
${context.partyRole ? `- صفة المستخدم في الدعوى: ${context.partyRole}` : ''}
` : '';

  const previousText = previousSummaries && previousSummaries.length > 0 ? `
ملخص المراحل السابقة (يجب أن يُبنى التحليل الحالي عليها بشكل تراكمي ومتسلسل):
${previousSummaries.map((s, i) => `- المرحلة ${i + 1}: ${s.substring(0, 200)}...`).join('\n')}
` : '';

  const examplesSection = stage.examples && stage.examples.length > 0 ? `
أمثلة على التحليل المطلوب:
${stage.examples.map(ex => `• ${ex}`).join('\n')}
` : '';

  const referencesSection = stage.legalReferences && stage.legalReferences.length > 0 ? `
المراجع القانونية ذات الصلة:
${stage.legalReferences.map(ref => `• ${ref}`).join('\n')}
` : '';

  return `
أنت خبير قانوني فلسطيني محترف مع خبرة 20+ سنة في المحاكم الفلسطينية. التزم حصراً بما هو نافذ ومطبّق في القضاء الفلسطيني؛ اذكر المرجع القانوني (اسم القانون/رقم المادة) عندما يكون ممكناً.

المهمة: ${stage.description}

${contextInfo}

تفاصيل القضية الأساسية:
${text}

${previousText}

النقاط الرئيسية للتحليل في هذه المرحلة:
${stage.key_points.map((p) => '• ' + p).join('\n')}

الأسئلة الرئيسية للإجابة في هذه المرحلة:
${stage.questions.map((q) => '- ' + q).join('\n')}

${examplesSection}

${referencesSection}

تعليمات هامة:
1. ركز على تحليل هذه المرحلة المحددة فقط
2. ابدأ تحليلك من حيث انتهت المراحل السابقة
3. لا تعيد تحليل النص الأصلي من البداية
4. اربط تحليلك بالمراحل السابقة بشكل منطقي ومتسلسل
5. قدم تحليلاً جديداً ومتخصصاً لهذه المرحلة
6. تجنب التكرار مع المراحل السابقة
7. استخدم المعلومات من المراحل السابقة كأساس للتحليل الحالي
8. تحقق من صحة المعلومات القانونية وتجنب أي لغط أو أخطاء
9. استخدم لغة قانونية رسمية ومناسبة
10. قدم تحليلاً عملياً وقابلاً للتطبيق

إن كانت صفة المستخدم محددة (${context?.partyRole ?? 'غير محددة'}): وجّه التحليل لصالح هذه الجهة، وبيّن الحجج والإجراءات العملية لكسب الدعوى من منظورها، مع مراعاة الأصول والإجراءات.

تحليل ${stage.stageName}:
`;
}

// دالة بناء prompt للعريضة النهائية
export function buildFinalPetitionPrompt(
  text: string, 
  summaries: string[],
  context?: AnalysisContext
): string {
  const contextInfo = context ? `
السياق القانوني:
- نوع القضية: ${context.caseType || 'غير محدد'}
- الاختصاص: ${context.jurisdiction || 'فلسطيني'}
${context.partyRole ? `- صفة المستخدم في الدعوى: ${context.partyRole}` : ''}
` : '';

  return `
أنت محامٍ فلسطيني محترف مع خبرة 20+ سنة في المحاكم الفلسطينية. بناءً على التحليلات القانونية التالية، قم بصياغة عريضة قانونية نهائية رسمية وجاهزة للتقديم للمحكمة المختصة، ملتزماً حصراً بما هو نافذ ومطبّق في القضاء الفلسطيني، مع الإشارة للمراجع القانونية ذات الصلة.

${contextInfo}

تفاصيل القضية الأساسية:
${text}

التحليلات القانونية السابقة:
${summaries.map((s, i) => `المرحلة ${i + 1}: ${s.substring(0, 300)}...`).join('\n\n')}

تعليمات صياغة العريضة:
1. ابدأ بمقدمة رسمية تذكر المحكمة المختصة والأطراف
2. اعرض الوقائع الأساسية بشكل موجز ومتسلسل
3. استخدم التحليلات السابقة كأساس للحجج القانونية
4. استشهد بالنصوص القانونية الفلسطينية أو النصوص النافذة المعمول بها في فلسطين عند الاقتضاء
5. قدم طلباتك للمحكمة بشكل واضح ومهني
6. تجنب التكرار مع التحليلات السابقة
7. ركز على صياغة وثيقة قانونية رسمية
8. استخدم لغة قانونية رسمية ومناسبة للمحكمة
9. تأكد من اكتمال جميع العناصر القانونية المطلوبة
10. انهي العريضة بالتوقيع والتاريخ

إن كانت صفة المستخدم محددة (${context?.partyRole ?? 'غير محددة'}): اجعل الصياغة متسقة مع طلبات هذه الجهة (مثلاً طلب الحكم وفق مصلحة المدعي/المشتكي أو رد الدعوى عن المدعى عليه/المشتكى عليه) مع سلامة الشكل والإجراءات.

صياغة العريضة القانونية:
`;
}

// دالة تحديد مستوى التعقيد
export function determineComplexity(text: string): 'basic' | 'intermediate' | 'advanced' {
  const wordCount = text.split(/\s+/).length;
  const hasLegalTerms = /قانون|محكمة|عقوبة|حقوق|التزام|عقد|ميراث|طلاق|نزاع/i.test(text);
  const hasTechnicalTerms = /إجراءات|استئناف|طعن|تنفيذ|تحكيم|وساطة/i.test(text);
  
  if (wordCount > 500 || hasTechnicalTerms) return 'advanced';
  if (wordCount > 200 || hasLegalTerms) return 'intermediate';
  return 'basic';
}

// دالة تحديد نوع القضية
export function determineCaseType(text: string): string {
  if (/ميراث|ورثة|إرث/i.test(text)) return 'قضية ميراث';
  if (/طلاق|زواج|أحوال شخصية/i.test(text)) return 'قضية أحوال شخصية';
  if (/عقد|تجاري|شركة|عمل/i.test(text)) return 'قضية تجارية';
  if (/عقوبة|جريمة|جنحة/i.test(text)) return 'قضية جنائية';
  if (/أرض|عقار|ملكية/i.test(text)) return 'قضية عقارية';
  if (/عمل|موظف|راتب/i.test(text)) return 'قضية عمل';
  return 'قضية مدنية عامة';
} 