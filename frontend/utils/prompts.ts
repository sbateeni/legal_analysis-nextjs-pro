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

  const jurisdictionHints = stage.jurisdictionHints && stage.jurisdictionHints.length > 0 ? `
تلميحات اختصاص فلسطينية (استخدمها فقط إن لم تتوفر تفاصيل كافية في النص):
${stage.jurisdictionHints.map(h => `• ${h}`).join('\n')}
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
${jurisdictionHints}

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
11. لا تُخرج أي معلومات غير أكيدة أو تخمينية؛ إن لم تتوفر معلومة فاذكر عدم توفرها صراحةً
12. إن ذُكرت قوانين غير نافذة في فلسطين، بيّن ذلك بوضوح وتجنب الاعتماد عليها

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
  if (/ميراث|ورثة|إرث/i.test(text)) return 'ميراث';
  if (/طلاق|زواج|أحوال شخصية|حضانة|نفقة|مؤخر|شقاق|نزاع/i.test(text)) return 'أحوال شخصية';
  if (/عقد|تجاري|شركة|كمبيالة|شيك|مصرف/i.test(text)) return 'تجاري';
  if (/عقوبة|جريمة|جنحة|جزائي|جزائية/i.test(text)) return 'جنائي';
  if (/أرض|عقار|ملكية|حيازة|إخلاء/i.test(text)) return 'عقاري';
  if (/عمل|موظف|راتب|فصل|أجور|نقابة/i.test(text)) return 'عمل';
  if (/إداري|قرار إداري|إلغاء قرار|جهة إدارية/i.test(text)) return 'إداري';
  if (/إيجار|بدل إيجار|مأجور|مستأجر/i.test(text)) return 'إيجارات';
  return 'قضية مدنية عامة';
}

// قوالب Prompt معيارية فلسطينية (Week1)
export const PalestinianPromptTemplates = {
  factualExtraction: (text: string) => `أنت باحث قانوني فلسطيني. استخرج من النص التالي الوقائع الجوهرية فقط بصيغة نقاط موجزة:
- الأطراف والأسماء (إن وجدت)
- التواريخ المهمة والأحداث
- المطالب/الطلبات القانونية
- المستندات أو الأدلة المذكورة
- المحكمة/الجهة إن ذُكرت
\nالنص:\n${text}\n\nأخرج النتيجة بنقاط قصيرة دون تحليل أو رأي قانوني.`,

  legalBasisPS: (topic: string) => `أنت خبير في القوانين النافذة في فلسطين. أعطني النصوص القانونية الفلسطينية ذات الصلة بالموضوع التالي:
"${topic}"
اذكر: اسم القانون/النظام، رقم المادة، وملخص سطرين لكيفية الارتباط. إن لم توجد مادة نافذة، قل ذلك صراحة ولا تذكر قوانين غير مطبقة في فلسطين.`,

  pleadingSkeleton: (context: string) => `كوّن هيكل عريضة قانونية فلسطينية جاهزة للتعبئة، يتضمن: (الجهة القضائية المختصة، بيانات الأطراف، الوقائع بإيجاز، الأساس القانوني الفلسطيني مع الإشارة للمادة، الطلبات الختامية، التاريخ والتوقيع). اجعل الصياغة رسمية ومختصرة.
\nسياق مختصر:\n${context}`,
}; 