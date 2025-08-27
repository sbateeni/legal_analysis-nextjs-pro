import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  AnalysisRequest, 
  AnalysisResponse, 
  AnalysisError, 
  AnalysisContext 
} from '../../types/analysis';
import { validateAnalysisRequest, sanitizeText } from '../../utils/validation';
import { getCachedAnalysis, cacheAnalysis, checkRateLimit } from '../../utils/cache';
import { 
  buildEnhancedPrompt, 
  buildFinalPetitionPrompt,
  determineComplexity,
  determineCaseType 
} from '../../utils/prompts';
import stages from '../../stages';

// تعريف مراحل التحليل القانوني (12 مرحلة)
const STAGES = Object.keys(stages);

// دالة استدعاء Gemini API
async function callGeminiAPI(prompt: string, apiKey: string, modelName?: string): Promise<string> {
  if (!apiKey) throw new Error('يرجى إدخال مفتاح Gemini API الخاص بك.');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const name = modelName || (globalThis as { __PREFERRED_MODEL__?: string }).__PREFERRED_MODEL__ || 'gemini-1.5-flash';
  const model = genAI.getGenerativeModel({ model: name });
  
  try {
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    if (errorMessage.includes('API_KEY')) {
      throw new Error('مفتاح API غير صحيح أو منتهي الصلاحية');
    }
    if (errorMessage.includes('quota')) {
      throw new Error('تم استنفاذ الحد المسموح من طلبات API');
    }
    throw new Error(`خطأ في API: ${errorMessage}`);
  }
}

// حدود الطول (تقريبي: 8000 tokens ≈ 24,000 حرف)
const MAX_CHARS = 24000;

function trimSummaries(summaries: string[]): string[] {
  let totalLength = summaries.reduce((acc, cur) => acc + (cur?.length || 0), 0);
  let trimmed = [...summaries];
  while (totalLength > MAX_CHARS && trimmed.length > 1) {
    trimmed = trimmed.slice(1);
    totalLength = trimmed.reduce((acc, cur) => acc + (cur?.length || 0), 0);
  }
  return trimmed;
}

// دالة معالجة الخطأ
function handleError(error: unknown): AnalysisError {
  if (error && typeof error === 'object' && 'code' in error) {
    return error as AnalysisError;
  }
  
  const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
  return {
    code: 'API_ERROR',
    message,
    details: error
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', message: 'Method not allowed' });
  }

  try {
    // تنظيف وتحقق من المدخلات
  const { text, stageIndex, apiKey, previousSummaries, finalPetition, partyRole } = req.body;
  const preferredModel = (req.headers['x-model'] as string) || 'gemini-1.5-flash';
    
    const request: AnalysisRequest = {
      text: sanitizeText(text || ''),
      stageIndex: Number(stageIndex),
      apiKey: apiKey?.trim() || '',
      previousSummaries: previousSummaries || [],
      finalPetition: Boolean(finalPetition),
      partyRole
    };

    // التحقق من صحة المدخلات
    const validationError = validateAnalysisRequest(request);
    if (validationError) {
      return res.status(400).json({ ...validationError, error: validationError.message });
    }

    // التحقق من Rate Limiting
    const rateLimit = checkRateLimit(request.apiKey);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        code: 'RATE_LIMIT_EXCEEDED',
        message: `تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة بعد ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} ثانية`,
        error: `تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة بعد ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} ثانية`,
        details: {
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime
        }
      });
  }

  // معالجة طلب العريضة النهائية
    if (request.finalPetition && request.stageIndex === -1) {
      if (!request.previousSummaries || request.previousSummaries.length === 0) {
        return res.status(400).json({ 
          code: 'VALIDATION_ERROR',
          message: 'يرجى تحليل المراحل أولاً قبل إنشاء العريضة النهائية.',
          error: 'يرجى تحليل المراحل أولاً قبل إنشاء العريضة النهائية.'
        });
      }

    // تقطيع الملخصات إذا تجاوزت الحد
      const trimmedSummaries = trimSummaries(request.previousSummaries);
      
      // تحديد سياق القضية
      const context: AnalysisContext = {
        caseType: determineCaseType(request.text),
        complexity: determineComplexity(request.text),
        jurisdiction: 'فلسطيني',
        language: 'العربية',
        partyRole: request.partyRole
      };

      // بناء prompt للعريضة النهائية
      const petitionPrompt = buildFinalPetitionPrompt(request.text, trimmedSummaries, context);

      try {
        const analysis = await callGeminiAPI(petitionPrompt, request.apiKey, preferredModel);
        return res.status(200).json({ 
          stage: 'العريضة النهائية', 
          analysis,
          timestamp: Date.now(),
          context
        });
    } catch (error: unknown) {
        const analysisError = handleError(error);
        return res.status(500).json({ code: analysisError.code, message: analysisError.message, error: analysisError.message, details: analysisError.details });
      }
    }

    // معالجة التحليل العادي لكل مرحلة
    if (request.stageIndex < 0 || request.stageIndex >= STAGES.length) {
      return res.status(400).json({ 
        code: 'VALIDATION_ERROR',
        message: 'رقم المرحلة غير صحيح',
        error: 'رقم المرحلة غير صحيح'
      });
    }

    const stageName = STAGES[request.stageIndex];
    const stageDetails = stages[stageName];

    if (!stageDetails) {
      return res.status(400).json({ 
        code: 'STAGE_NOT_FOUND',
        message: 'المرحلة غير موجودة',
        error: 'المرحلة غير موجودة'
      });
    }

    // التحقق من Cache
    const cachedAnalysis = getCachedAnalysis(request.text, request.stageIndex, preferredModel);
    if (cachedAnalysis) {
      return res.status(200).json({ 
        stage: stageName, 
        analysis: cachedAnalysis,
        timestamp: Date.now(),
        cached: true
      });
    }

  // تقطيع الملخصات إذا تجاوزت الحد
    const trimmedSummaries = trimSummaries(request.previousSummaries || []);

    // تحديد سياق القضية
    const context: AnalysisContext = {
      caseType: determineCaseType(request.text),
      complexity: determineComplexity(request.text),
      jurisdiction: 'فلسطيني',
      language: 'العربية',
      partyRole: request.partyRole
    };

    // بناء prompt محسن
    const prompt = buildEnhancedPrompt(stageDetails, request.text, trimmedSummaries, context);

    try {
      const analysis = await callGeminiAPI(prompt, request.apiKey, preferredModel);
      
      // حفظ في Cache
      cacheAnalysis(request.text, request.stageIndex, analysis, preferredModel);

      const response: AnalysisResponse = {
        stage: stageName,
        analysis,
        timestamp: Date.now(),
        stageIndex: request.stageIndex
      };

      return res.status(200).json(response);
    } catch (error: unknown) {
      const analysisError = handleError(error);
      return res.status(500).json({ code: analysisError.code, message: analysisError.message, error: analysisError.message, details: analysisError.details });
    }

  } catch (error: unknown) {
    console.error('Error in analyze API:', error);
    const analysisError = handleError(error);
    return res.status(500).json({ code: analysisError.code, message: analysisError.message, error: analysisError.message, details: analysisError.details });
  }
} 