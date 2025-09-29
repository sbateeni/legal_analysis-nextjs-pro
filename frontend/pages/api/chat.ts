import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { sanitizeText } from '@utils/validation';
import { checkRateLimit } from '@utils/cache';
import stages from '../../stages';
import { ChatModelResponseSchema, ChatRequestSchema, ChatModelResponse } from '@utils/schemas';
import { chatCacheGet, chatCacheSet, makeChatCacheKey } from '@utils/chatCache';
import { isWithinPalestinianJurisdiction, sanitizeAnswer } from '@utils/safety';
import { extractLegalContext, buildLegalContextString, optimizeLegalQuery } from '@utils/legalContextService';
import { callAIService, getRecommendedModel } from '@utils/apiIntegration';
import { getProviderFromModel } from '@utils/aiProvider';
import { getApiKeyForProvider } from '@utils/appSettings';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const STAGE_TITLES: string[] = Object.keys(stages);

// دالة إنشاء prompt للـ chatbot
function buildChatPrompt(
  userMessage: string, 
  conversationHistory: ChatMessage[],
  context?: {
    caseType?: string;
    currentStage?: number;
    previousAnalysis?: string;
  },
  kbSnippets?: Array<{ strategy_title: string; strategy_steps: string[]; legal_basis: Array<{ source: string; article?: string }> }>,
  legalContext?: string
): string {
  const contextInfo = context ? `
السياق الحالي:
- نوع القضية: ${context.caseType || 'غير محدد'}
- المرحلة الحالية: ${context.currentStage || 'لم تبدأ بعد'}
- التحليل السابق: ${context.previousAnalysis ? 'متوفر' : 'غير متوفر'}

${context.previousAnalysis ? `محتوى التحليل السابق للقضية:
${context.previousAnalysis}
` : ''}
` : '';

  const history = conversationHistory.length > 0 ? `
المحادثة السابقة:
${conversationHistory.slice(-5).map(msg => `${msg.role === 'user' ? 'المستخدم' : 'المساعد'}: ${msg.content}`).join('\n')}
` : '';

  const stagesList = STAGE_TITLES.length ? `
منهجية العمل (12 مرحلة فلسطينية):
- ${STAGE_TITLES.join('\n- ')}
` : '';

  const kbSection = (kbSnippets && kbSnippets.length) ? `
معرفة مشتركة ذات صلة (ملخص استراتيجيات قانونية فلسطينية):
${kbSnippets.map((s, i) => `(${i+1}) ${s.strategy_title}
- خطوات مختصرة: ${s.strategy_steps.slice(0,3).join(' | ')}
- أساس قانوني: ${s.legal_basis.map(b=>`${b.source}${b.article?` ${b.article}`:''}`).slice(0,2).join(' ؛ ')}`).join('\n\n')}
` : '';

  const legalContextSection = legalContext ? `
${legalContext}
` : '';

  // نطلب من النموذج إخراج JSON منظم
  const jsonSpec = `
أخرج نتيجتك حصراً بصيغة JSON صالحة وفق المخطط التالي دون أي نص إضافي خارج JSON:
{
  "answer": string,              // إجابة نصية عربية فصحى
  "suggestions": string[],       // حتى 5 اقتراحات قصيرة
  "nextSteps": string[],         // حتى 5 خطوات عملية قصيرة
  "confidence": number           // بين 0 و 1
}
`;

  return `
أنت مساعد قانوني فلسطيني متخصص حصراً بالقوانين والأنظمة الفلسطينية وما يقدمه المستشار القانوني في فلسطين. أي إجابة يجب أن تكون ضمن الإطار القانوني الفلسطيني فقط.

${contextInfo}
${stagesList}
${kbSection}
${legalContextSection}
${history}

${jsonSpec}
رسالة المستخدم: ${userMessage}

ملاحظة مهمة: إذا كان هناك "محتوى التحليل السابق للقضية" أعلاه، فهذا هو الملف القانوني الحالي الذي يجب أن تجيب بناءً عليه. ابحث في هذا المحتوى عن المعلومات المطلوبة قبل تقديم إجابة عامة. إذا لم تجد المعلومات المطلوبة في المحتوى، أخبر المستخدم بذلك بوضوح واطلب منه تقديم هذه المعلومات. إذا كان المحتوى يبدو افتراضياً أو عاماً، أخبر المستخدم أن القضية تحتاج إلى تفاصيل أكثر تحديداً.

تعليمات صارمة:
1. أجب باللغة العربية الفصحى وبلغة مهنية واضحة.
2. التزم حصراً بما هو نافذ ومُطبَّق في القضاء الفلسطيني (التشريعات واللوائح والقرارات القضائية النافذة في فلسطين). لا تذكر قوانين غير مطبّقة في فلسطين.
3. عند الإمكان، اذكر المراجع القانونية الفلسطينية أو النصوص النافذة المعمول بها في فلسطين (اسم القانون، رقم/عنوان المادة، الجهة القضائية أو السنة).
4. اربط الإجابة بمنهجية المراحل الاثنتي عشرة أعلاه: حدد المرحلة/المراحل ذات الصلة صراحة (مثال: "المرحلة الثالثة: تحليل النصوص القانونية").
5. تحقّق من صحة أي معلومة قانونية قبل عرضها؛ إن لم تتوفر معلومة مؤكَّدة فاذكر حدود المعرفة أو اطلب معلومات إضافية بدلاً من التخمين.
6. لا تقدّم معلومات مضللة، وميّز بين الرأي القانوني العام والمتطلبات الإجرائية الرسمية.
7. إذا طلب المستخدم بيانات محددة (مثل أسماء الأطراف أو تواريخ أو مبالغ) وكان النص في "محتوى التحليل السابق للقضية" يحتوي عليها، فاستخرجها بدقة وقدّمها في "answer". إن لم تكن متوفرة، قل بوضوح: "لم أجد هذه المعلومات في ملف القضية الحالي. يرجى تقديم هذه المعلومات لتتمكن من مساعدتك بشكل أفضل."
8. تجنّب التكرار والإنشاء المطوّل غير الضروري. اعرض إجابة مركّزة أولاً ثم اقتراحات وخطوات لاحقاً.
9. عند وجود "محتوى التحليل السابق للقضية"، استخدمه كمرجع أساسي للإجابة. ابحث فيه عن المعلومات المطلوبة قبل تقديم إجابة عامة.
10. إذا كان محتوى القضية يبدو افتراضياً أو عاماً (مثل "سيناريو قضية معقدة") ولا يحتوي على تفاصيل محددة، أخبر المستخدم بذلك واطلب منه تقديم تفاصيل القضية الحقيقية.
11. إخلاء مسؤولية: هذه المعلومات للتثقيف والدعم وليست بديلاً عن استشارة محامٍ مرخّص في فلسطين عند الحاجة.
`;
}

// KB selection (بسيطة)
type KBRecord = {
  id: string;
  topic: string;
  jurisdiction: string;
  strategy_title: string;
  strategy_steps: string[];
  legal_basis: Array<{ source: string; article?: string; note?: string }>;
  tags: string[];
};

function selectRelevantKB(message: string, maxItems = 5): Array<KBRecord> {
  try {
    const kbPath = path.join(process.cwd(), 'data', 'legal_kb.json');
    const raw = fs.readFileSync(kbPath, 'utf8');
    const parsed = JSON.parse(raw) as { records: KBRecord[] };
    const q = message.toLowerCase();
    const scored = parsed.records.map(r => {
      const hay = [r.topic, r.strategy_title, ...(r.tags||[]), ...(r.legal_basis||[]).map(lb => `${lb.source} ${lb.article||''}`)].join(' ').toLowerCase();
      let score = 0;
      q.split(/\s+/).forEach(w => { if (w && hay.includes(w)) score += 1; });
      return { r, score };
    }).sort((a,b)=>b.score-a.score);
    return scored.filter(s=>s.score>0).slice(0, maxItems).map(s=>s.r);
  } catch {
    return [];
  }
}

// دالة استخراج الاقتراحات من الإجابة (احتياطية للفشل في JSON)
function extractSuggestions(response: string): string[] {
  const suggestions: string[] = [];
  const suggestionPatterns = [
    /اقترح\s+(.+?)(?=\n|$)/g,
    /يمكنك\s+(.+?)(?=\n|$)/g,
    /يُنصح\s+(.+?)(?=\n|$)/g,
    /من الأفضل\s+(.+?)(?=\n|$)/g
  ];
  suggestionPatterns.forEach(pattern => {
    const matches = response.match(pattern);
    if (matches) {
      suggestions.push(...matches.map(match => match.replace(/^(اقترح|يمكنك|يُنصح|من الأفضل)\s+/, '')));
    }
  });
  return suggestions.slice(0, 3);
}

// دالة استخراج الخطوات التالية (احتياطية)
function extractNextSteps(response: string): string[] {
  const steps: string[] = [];
  const stepPatterns = [
    /الخطوة\s+\d+[:\s]+(.+?)(?=\n|$)/g,
    /أولاً\s+(.+?)(?=\n|$)/g,
    /ثانياً\s+(.+?)(?=\n|$)/g,
    /ثالثاً\s+(.+?)(?=\n|$)/g
  ];
  stepPatterns.forEach(pattern => {
    const matches = response.match(pattern);
    if (matches) {
      steps.push(...matches.map(match => match.replace(/^(الخطوة\s+\d+[:\s]+|أولاً\s+|ثانياً\s+|ثالثاً\s+)/, '')));
    }
  });
  return steps.slice(0, 3);
}

// دالة حساب مستوى الثقة
function calculateConfidence(response: string): number {
  let confidence = 0.7;
  if (response.includes('قانون') || response.includes('قانوني')) confidence += 0.1;
  if (response.includes('فلسطيني') || response.includes('فلسطين')) confidence += 0.1;
  if (response.includes('محكمة') || response.includes('قضائية')) confidence += 0.1;
  if (response.length > 200) confidence += 0.1;
  return Math.min(confidence, 1.0);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // التحقق من المدخلات بـZod
    const parsed = ChatRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        code: 'VALIDATION_ERROR',
        message: 'طلب غير صالح',
        details: parsed.error.flatten()
      });
    }

    const { message, apiKey, conversationHistory = [], context } = parsed.data;
    const mode = ((req.headers['x-mode'] as string) || 'legal').toLowerCase();

    // تنظيف الرسالة
    const cleanMessage = sanitizeText(message);

    // Cache مفتاح
    const prevHash = (context?.previousAnalysis || '').slice(-256);
    const modelName = (req.headers['x-model'] as string) || 'gemini-1.5-flash';
    const cacheKey = makeChatCacheKey({
      message: cleanMessage,
      caseType: context?.caseType,
      currentStage: context?.currentStage,
      previousAnalysisHash: prevHash,
      modelName,
    });

    const cached = chatCacheGet(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    // Rate limiting مع بديل IP
    const ip = (req.headers['x-real-ip'] as string) || (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const rateKey = apiKey || `ip:${ip}`;
    const rateLimit = checkRateLimit(rateKey);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        code: 'RATE_LIMIT_EXCEEDED',
        message: `تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة بعد ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} ثانية`
      });
    }

    // بناء prompt وطلب JSON
    const kb = mode === 'legal' ? selectRelevantKB(cleanMessage, 5) : [];
    const kbSnippets = kb.map(k => ({ strategy_title: k.strategy_title, strategy_steps: k.strategy_steps, legal_basis: k.legal_basis?.map(b => ({ source: b.source, article: b.article })) || [] }));
    
    // استخراج السياق القانوني من المصادر الرسمية (محسن)
    let legalContext = '';
    if (mode === 'legal') {
      try {
        const optimizedQuery = optimizeLegalQuery(cleanMessage);
        const legalContextResult = await extractLegalContext(
          optimizedQuery, 
          3, 
          context?.previousAnalysis?.slice(0, 500), // استخدام السياق الحالي
          context?.caseType // استخدام نوع القضية
        );
        if (legalContextResult.status === 'success' && legalContextResult.results.length > 0) {
          legalContext = buildLegalContextString(legalContextResult.results);
        }
      } catch (error) {
        console.warn('فشل في استخراج السياق القانوني:', error);
      }
    }
    
    const prompt = mode === 'legal'
      ? buildChatPrompt(cleanMessage, conversationHistory as ChatMessage[], context, kbSnippets, legalContext)
      : `أنت مساعد عام محترف يجيب بإيجاز ووضوح. أجب بالعربية الفصحى، وابتعد عن الإفتاء القانوني المتخصص ما لم يُطلب صراحة.

السؤال:
${cleanMessage}

سياق المحادثة (إن وجد):
${(conversationHistory as ChatMessage[]).slice(-6).map(m => `${m.role}: ${m.content}`).join('\n')}`;

    // Enhanced AI call using provider system
    let rawText: string;
    try {
      const provider = getProviderFromModel(modelName);
      
      // Get appropriate API key for the provider
      let effectiveApiKey = apiKey;
      if (!effectiveApiKey) {
        const providerKey = await getApiKeyForProvider(provider);
        effectiveApiKey = providerKey || '';
      }
      
      if (!effectiveApiKey) {
        return res.status(400).json({
          code: 'API_KEY_MISSING',
          message: `API key not found for provider: ${provider}`
        });
      }

      const aiResponse = await callAIService({
        text: prompt,
        modelId: modelName,
        temperature: 0.7,
        rateLimitKey: effectiveApiKey
      });
      
      rawText = aiResponse.text;
    } catch (error: any) {
      // Fallback to direct Google API call for backwards compatibility
      console.warn('AI service failed, falling back to direct Google API:', error.message);
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      rawText = response.text();
    }

    let modelJson: ChatModelResponse | null = null;
    try {
      const fencedMatch = rawText.match(/```(?:json)?\n([\s\S]*?)\n```/i);
      const jsonPayload = fencedMatch ? fencedMatch[1] : rawText;
      const candidate = JSON.parse(jsonPayload);
      const validated = ChatModelResponseSchema.parse(candidate);
      modelJson = validated;
    } catch {
      modelJson = {
        answer: rawText,
        suggestions: extractSuggestions(rawText),
        nextSteps: extractNextSteps(rawText),
        confidence: calculateConfidence(rawText),
      };
    }

    // حارس اختصاص
    if (!isWithinPalestinianJurisdiction(modelJson.answer)) {
      modelJson.answer = 'أعتذر، هذا السؤال أو جزء من الإجابة يبدو خارج نطاق ما هو نافذ ومطبّق في القضاء الفلسطيني. يرجى إعادة صياغة السؤال ضمن الإطار القانوني الفلسطيني.';
      modelJson.suggestions = [];
      modelJson.nextSteps = [];
      modelJson.confidence = 0.4;
    }

    modelJson.answer = sanitizeAnswer(modelJson.answer);

    const chatResponse = {
      message: modelJson.answer,
      suggestions: modelJson.suggestions || [],
      nextSteps: modelJson.nextSteps || [],
      confidence: typeof modelJson.confidence === 'number' ? modelJson.confidence : calculateConfidence(modelJson.answer),
      timestamp: Date.now()
    };

    // تخزين مؤقت قصير
    chatCacheSet(cacheKey, chatResponse);

    return res.status(200).json(chatResponse);

  } catch (error: unknown) {
    console.error('Error in chat API:', error);
    let message = 'حدث خطأ في معالجة الرسالة';
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    if (errorMessage.includes('API_KEY')) {
      message = 'مفتاح API غير صحيح أو منتهي الصلاحية';
    } else if (errorMessage.includes('quota')) {
      message = 'تم استنفاذ الحد المسموح من طلبات API';
    }
    return res.status(500).json({
      code: 'API_ERROR',
      message,
      details: errorMessage
    });
  }
} 