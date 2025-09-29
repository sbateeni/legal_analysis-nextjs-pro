import type { NextApiRequest, NextApiResponse } from 'next';
import { sanitizeText, validateAnalysisRequest } from '@utils/validation';
import { checkRateLimitForKey, getCachedAnalysis, cacheAnalysis } from '@utils/cache';
import { 
  buildEnhancedPrompt, 
  buildFinalPetitionPrompt,
  determineComplexity,
  determineCaseType 
} from '@utils/prompts';
import { callAIService, AIProviderError, getRecommendedModel } from '@utils/apiIntegration';
import { getProviderFromModel, getModelConfig } from '@utils/aiProvider';
import { getApiKeyForProvider } from '@utils/appSettings';
import stages from '../../stages';
import { AnalysisRequest, AnalysisError, AnalysisContext, AnalysisResponse } from '../../types/analysis';

// تعريف مراحل التحليل القانوني (12 مرحلة)
const STAGES = Object.keys(stages);
const DEFAULT_MAX_REQUESTS_PER_WINDOW = 8; // الحد الافتراضي للطلبات

// Enhanced AI call function using the new provider system
async function callAIWithProvider(
  prompt: string, 
  modelId: string, 
  apiKey?: string,
  temperature?: number,
  maxTokens?: number
): Promise<string> {
  try {
    const provider = getProviderFromModel(modelId);
    const modelConfig = getModelConfig(modelId);
    
    if (!modelConfig) {
      throw new Error(`Model ${modelId} not supported`);
    }

    // Get API key from settings if not provided
    let effectiveApiKey = apiKey;
    if (!effectiveApiKey) {
      effectiveApiKey = await getApiKeyForProvider(provider);
    }
    
    if (!effectiveApiKey) {
      throw new Error(`API key not found for provider: ${provider}`);
    }

    const response = await callAIService({
      text: prompt,
      modelId,
      temperature: temperature || 0.7,
      maxTokens: maxTokens || modelConfig.maxTokens || 4000,
      rateLimitKey: effectiveApiKey
    });

    return response.text;
  } catch (error) {
    if (error instanceof AIProviderError) {
      // Convert provider errors to user-friendly Arabic messages
      switch (error.code) {
        case 'INVALID_API_KEY':
          throw new Error('مفتاح API غير صحيح أو منتهي الصلاحية');
        case 'RATE_LIMIT_EXCEEDED':
          throw new Error('تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً');
        case 'QUOTA_EXCEEDED':
          throw new Error('تم استنفاذ الحد المسموح من طلبات API');
        case 'MODEL_NOT_FOUND':
        case 'MODEL_NOT_AVAILABLE':
          throw new Error('النموذج المطلوب غير متوفر حالياً');
        case 'INSUFFICIENT_CREDITS':
          throw new Error('رصيد API غير كافي');
        default:
          throw new Error(error.message);
      }
    }
    throw error;
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
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(405).json({ error: 'Method not allowed', message: 'Method not allowed' });
  }

  try {
    // تنظيف وتحقق من المدخلات
  const { text, stageIndex, apiKey, previousSummaries, finalPetition, partyRole } = req.body;
  const preferredModel = (req.headers['x-model'] as string) || 'gemini-1.5-flash';
  const budget = ((req.headers['x-budget'] as string) || 'medium').toLowerCase() as 'low' | 'medium' | 'high';
  const summaryStyle = ((req.headers['x-summary-style'] as string) || 'bullets').toLowerCase() as 'bullets' | 'brief' | 'legalese';
    
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
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(400).json({ ...validationError, error: validationError.message });
    }

    // التحقق من Rate Limiting باستخدام النظام المحسن
    // Rate limit: استخدم apiKey، وإن لم يوجد فاستعمل IP كبديل
    const ip = (req.headers['x-real-ip'] as string) || (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const rateKey = request.apiKey || `ip:${ip}`;
    
    // فحص خاص للتحليل المتسلسل
    const isSequential = req.headers['x-sequential-analysis'] === 'true';
    const effectiveLimit = isSequential ? 5 : DEFAULT_MAX_REQUESTS_PER_WINDOW; // حد أقل للتحليل المتسلسل
    const rateLimit = checkRateLimitForKey(rateKey, effectiveLimit, isSequential);
    
    if (!rateLimit.allowed) {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(429).json({
        code: 'RATE_LIMIT_EXCEEDED',
        message: `تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة بعد ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} ثانية`,
        error: `تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة بعد ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} ثانية`,
        details: {
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime,
          suggestedDelay: rateLimit.suggestedDelay,
          riskLevel: rateLimit.riskLevel
        }
      });
    }

  // معالجة طلب العريضة النهائية
    if (request.finalPetition && request.stageIndex === -1) {
      if (!request.previousSummaries || request.previousSummaries.length === 0) {
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
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
        // Use best available model for final petition
        const bestModel = getRecommendedModel('complex', 'high');
        const analysis = await callAIWithProvider(petitionPrompt, bestModel, request.apiKey);
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.status(200).json({ 
          stage: 'العريضة النهائية', 
          analysis,
          timestamp: Date.now(),
          context
        });
    } catch (error: unknown) {
        const analysisError = handleError(error);
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.status(500).json({ code: analysisError.code, message: analysisError.message, error: analysisError.message, details: analysisError.details });
      }
    }

    // معالجة التحليل العادي لكل مرحلة
    if (request.stageIndex < 0 || request.stageIndex >= STAGES.length) {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(400).json({ 
        code: 'VALIDATION_ERROR',
        message: 'رقم المرحلة غير صحيح',
        error: 'رقم المرحلة غير صحيح'
      });
    }

    const stageName = STAGES[request.stageIndex];
    const stageDetails = stages[stageName];

    if (!stageDetails) {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(400).json({ 
        code: 'STAGE_NOT_FOUND',
        message: 'المرحلة غير موجودة',
        error: 'المرحلة غير موجودة'
      });
    }

    // التحقق من Cache
    const cachedAnalysis = getCachedAnalysis(request.text, request.stageIndex, preferredModel);
    if (cachedAnalysis) {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
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
      // اختيار النموذج تكيفياً حسب التعقيد والميزانية
      const stageComplexity = stageDetails.complexity || determineComplexity(request.text);
      let modelForStage = preferredModel || 'gemini-1.5-flash';
      
      // Enhanced model selection based on budget and complexity
      if (budget === 'low') {
        modelForStage = getRecommendedModel('simple', 'low');
      } else if (budget === 'high') {
        const complexity = stageComplexity === 'advanced' ? 'complex' : 'medium';
        modelForStage = getRecommendedModel(complexity, 'high');
      } else {
        // medium budget
        const complexity = stageComplexity === 'advanced' ? 'complex' : 'medium';
        modelForStage = getRecommendedModel(complexity, 'low');
      }
      
      // إذا كان النص طويلاً جداً، نقسمه إلى أجزاء ونحلل كل جزء على حدة ثم ندمج النتائج
      const MAX_CHUNK = 6000; // أحرف تقريبية لكل جزء
      let analysis: string;
      if (request.text.length > MAX_CHUNK * 1.2) {
        const chunks: string[] = [];
        for (let i = 0; i < request.text.length; i += MAX_CHUNK) {
          chunks.push(request.text.slice(i, i + MAX_CHUNK));
        }
        const chunkResults: string[] = [];
        for (let i = 0; i < chunks.length; i++) {
          const chunkPrompt = buildEnhancedPrompt(stageDetails, chunks[i], trimmedSummaries, context);
          const r = await callAIWithProvider(chunkPrompt, modelForStage, request.apiKey);
          chunkResults.push(`(جزء ${i + 1}/${chunks.length})\n${r}`);
        }
        analysis = chunkResults.join('\n\n');
      } else {
        analysis = await callAIWithProvider(prompt, modelForStage, request.apiKey);
      }
      
      // حفظ في Cache
      cacheAnalysis(request.text, request.stageIndex, analysis, modelForStage);

      // توليد ملخص تلقائي مع أنماط مختلفة عند طول الاستجابة
      let summary: string | undefined;
      if (analysis.length > 2000) {
        try {
          let summaryPrompt = '';
          const snippet = analysis.slice(0, 8000);
          if (summaryStyle === 'bullets') {
            summaryPrompt = `لخّص النص التالي في نقاط موجزة وواضحة (5-7 نقاط)، مع لغة عربية بسيطة ودقة قانونية:\n\n${snippet}`;
          } else if (summaryStyle === 'brief') {
            summaryPrompt = `قدّم خلاصة قصيرة لا تتجاوز 4 جمل بالنثر العربي الفصيح، تحافظ على الجوهر القانوني دون تفصيل:\n\n${snippet}`;
          } else {
            // legalese
            summaryPrompt = `صُغ خلاصة قانونية رسمية بلهجة مذكّرات فلسطينية موجزة (3-5 جمل) مع إحالات مقتضبة حينما تتوفر:\n\n${snippet}`;
          }
          summary = await callAIWithProvider(summaryPrompt, modelForStage, request.apiKey);
        } catch {}
      }

      const response: AnalysisResponse = {
        stage: stageName,
        analysis,
        timestamp: Date.now(),
        stageIndex: request.stageIndex,
        ...(summary ? { summary } as any : {})
      };

      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(200).json(response);
    } catch (error: unknown) {
      const analysisError = handleError(error);
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(500).json({ code: analysisError.code, message: analysisError.message, error: analysisError.message, details: analysisError.details });
    }

  } catch (error: unknown) {
    console.error('Error in analyze API:', error);
    const analysisError = handleError(error);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(500).json({ code: analysisError.code, message: analysisError.message, error: analysisError.message, details: analysisError.details });
  }
} 