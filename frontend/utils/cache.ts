import { CachedAnalysis, RateLimitInfo } from '../types/analysis';
import type { NextApiRequest } from 'next';

// Cache للتحليلات
const analysisCache = new Map<string, CachedAnalysis>();

// Cache للـ rate limiting
const rateLimitCache = new Map<string, RateLimitInfo>();

// إعدادات Cache
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 ساعة
const RATE_LIMIT_WINDOW = 60 * 1000; // دقيقة واحدة
const DEFAULT_MAX_REQUESTS_PER_WINDOW = 8; // تقليل الحد الافتراضي لتجنب Rate Limiting
const ENV_MAX_PER_MIN = Number(process.env.RATE_LIMIT_PER_MIN || '') || DEFAULT_MAX_REQUESTS_PER_WINDOW;

// إعدادات جديدة للتحليل المتسلسل
const SEQUENTIAL_ANALYSIS_RATE_LIMIT = 5; // حد أقل للتحليل المتسلسل
const ADAPTIVE_DELAY_MULTIPLIER = 1.5; // مضاعف التأخير التكيفي
const MIN_DELAY_BETWEEN_REQUESTS = 5000; // 5 ثواني كحد أدنى
const MAX_DELAY_BETWEEN_REQUESTS = 20000; // 20 ثانية كحد أقصى

// دالة إنشاء مفتاح Cache
export function createCacheKey(text: string, stageIndex: number, modelName: string = 'gemini-1.5-flash'): string {
  const textHash = text.substring(0, 100).replace(/\s+/g, ''); // أول 100 حرف بدون مسافات
  return `${textHash}_${stageIndex}_${modelName}`;
}

// دالة الحصول على تحليل من Cache
export function getCachedAnalysis(text: string, stageIndex: number, modelName: string = 'gemini-1.5-flash'): string | null {
  const key = createCacheKey(text, stageIndex, modelName);
  const cached = analysisCache.get(key);
  
  if (!cached) return null;
  
  // التحقق من انتهاء صلاحية Cache
  if (Date.now() > cached.expiresAt) {
    analysisCache.delete(key);
    return null;
  }
  
  return cached.analysis;
}

// دالة حفظ تحليل في Cache
export function cacheAnalysis(text: string, stageIndex: number, analysis: string, modelName: string = 'gemini-1.5-flash'): void {
  const key = createCacheKey(text, stageIndex, modelName);
  const now = Date.now();
  
  const cachedAnalysis: CachedAnalysis = {
    text: text.substring(0, 100), // حفظ أول 100 حرف فقط
    stageIndex,
    analysis,
    timestamp: now,
    expiresAt: now + CACHE_EXPIRY_TIME
  };
  
  analysisCache.set(key, cachedAnalysis);
  
  // تنظيف Cache القديم (اختياري)
  if (analysisCache.size > 1000) {
    const oldestKey = analysisCache.keys().next().value;
    if (oldestKey) {
      analysisCache.delete(oldestKey);
    }
  }
}

// دالة التحقق من Rate Limiting
export function checkRateLimit(apiKey: string): { allowed: boolean; remaining: number; resetTime: number } {
  return checkRateLimitForKey(apiKey, ENV_MAX_PER_MIN);
}

// نسخة أدق تسمح بتحديد المفتاح والحد
export function checkRateLimitForKey(
  key: string, 
  maxPerWindow: number = ENV_MAX_PER_MIN,
  isSequentialAnalysis: boolean = false
): { 
  allowed: boolean; 
  remaining: number; 
  resetTime: number;
  suggestedDelay?: number;
  riskLevel?: 'low' | 'medium' | 'high';
} {
  const now = Date.now();
  const rateLimitInfo = rateLimitCache.get(key);
  
  // استخدام حد أقل للتحليل المتسلسل
  const effectiveLimit = isSequentialAnalysis ? SEQUENTIAL_ANALYSIS_RATE_LIMIT : maxPerWindow;
  
  if (!rateLimitInfo) {
    // أول طلب لهذا API Key
    const newRateLimitInfo: RateLimitInfo = {
      apiKey: key,
      requests: [now],
      lastReset: now
    };
    rateLimitCache.set(key, newRateLimitInfo);
    return { 
      allowed: true, 
      remaining: Math.max(0, effectiveLimit - 1), 
      resetTime: now + RATE_LIMIT_WINDOW,
      suggestedDelay: MIN_DELAY_BETWEEN_REQUESTS,
      riskLevel: 'low'
    };
  }
  
  // التحقق من إعادة تعيين النافذة الزمنية
  if (now - rateLimitInfo.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitInfo.requests = [now];
    rateLimitInfo.lastReset = now;
  } else {
    rateLimitInfo.requests.push(now);
  }
  
  // إزالة الطلبات القديمة خارج النافذة الزمنية
  rateLimitInfo.requests = rateLimitInfo.requests.filter(
    requestTime => now - requestTime < RATE_LIMIT_WINDOW
  );
  
  const currentRequests = rateLimitInfo.requests.length;
  const allowed = currentRequests <= effectiveLimit;
  const remaining = Math.max(0, effectiveLimit - currentRequests);
  const resetTime = rateLimitInfo.lastReset + RATE_LIMIT_WINDOW;
  
  // حساب التأخير المقترح والمستوى الخطر
  const usageRatio = currentRequests / effectiveLimit;
  let suggestedDelay = MIN_DELAY_BETWEEN_REQUESTS;
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  
  if (usageRatio > 0.8) {
    riskLevel = 'high';
    suggestedDelay = MAX_DELAY_BETWEEN_REQUESTS;
  } else if (usageRatio > 0.6) {
    riskLevel = 'medium';
    suggestedDelay = Math.floor(MIN_DELAY_BETWEEN_REQUESTS * ADAPTIVE_DELAY_MULTIPLIER);
  }
  
  // زيادة التأخير إذا كان هناك طلبات متكررة قريبة
  const recentRequests = rateLimitInfo.requests.filter(t => now - t < 30000); // آخر 30 ثانية
  if (recentRequests.length > 3) {
    suggestedDelay = Math.min(MAX_DELAY_BETWEEN_REQUESTS, suggestedDelay * 1.5);
    riskLevel = 'high';
  }
  
  return { 
    allowed, 
    remaining, 
    resetTime, 
    suggestedDelay,
    riskLevel
  };
}

// دالة تنظيف Cache القديم
export function cleanupExpiredCache(): void {
  const now = Date.now();
  
  // تنظيف analysis cache
  for (const [key, cached] of analysisCache.entries()) {
    if (now > cached.expiresAt) {
      analysisCache.delete(key);
    }
  }
  
  // تنظيف rate limit cache
  for (const [key, rateLimit] of rateLimitCache.entries()) {
    if (now - rateLimit.lastReset > RATE_LIMIT_WINDOW * 2) {
      rateLimitCache.delete(key);
    }
  }
}

// إبطال كاش التحليل حسب نموذج اختياري
export function invalidateAnalysisCache(modelName?: string): number {
  let removed = 0;
  for (const key of analysisCache.keys()) {
    if (!modelName || key.endsWith(`_${modelName}`)) {
      analysisCache.delete(key);
      removed++;
    }
  }
  return removed;
}

/**
 * الحصول على إحصائيات Rate Limiting للمراقبة
 */
export function getRateLimitStats(key: string): {
  currentRequests: number;
  maxRequests: number;
  resetTime: number;
  windowStart: number;
  usagePercentage: number;
} {
  const rateLimitInfo = rateLimitCache.get(key);
  const now = Date.now();
  
  if (!rateLimitInfo) {
    return {
      currentRequests: 0,
      maxRequests: ENV_MAX_PER_MIN,
      resetTime: now + RATE_LIMIT_WINDOW,
      windowStart: now,
      usagePercentage: 0
    };
  }
  
  const recentRequests = rateLimitInfo.requests.filter(
    requestTime => now - requestTime < RATE_LIMIT_WINDOW
  ).length;
  
  return {
    currentRequests: recentRequests,
    maxRequests: ENV_MAX_PER_MIN,
    resetTime: rateLimitInfo.lastReset + RATE_LIMIT_WINDOW,
    windowStart: rateLimitInfo.lastReset,
    usagePercentage: (recentRequests / ENV_MAX_PER_MIN) * 100
  };
}

// دوال جديدة للتحليل المتسلسل

/**
 * فحص خاص للتحليل المتسلسل مع تحسينات إضافية
 */
export function checkSequentialAnalysisRateLimit(key: string): {
  allowed: boolean;
  suggestedDelay: number;
  riskLevel: 'low' | 'medium' | 'high';
  remaining: number;
  resetTime: number;
} {
  const result = checkRateLimitForKey(key, SEQUENTIAL_ANALYSIS_RATE_LIMIT, true);
  return {
    allowed: result.allowed,
    suggestedDelay: result.suggestedDelay || MIN_DELAY_BETWEEN_REQUESTS,
    riskLevel: result.riskLevel || 'low',
    remaining: result.remaining,
    resetTime: result.resetTime
  };
}

/**
 * حساب التأخير الذكي بناءً على تاريخ الطلبات
 */
export function calculateSmartDelay(key: string, stageIndex: number, totalStages: number): number {
  const rateLimitInfo = rateLimitCache.get(key);
  
  if (!rateLimitInfo || rateLimitInfo.requests.length === 0) {
    return MIN_DELAY_BETWEEN_REQUESTS;
  }
  
  const now = Date.now();
  const recentRequests = rateLimitInfo.requests.filter(t => now - t < RATE_LIMIT_WINDOW);
  
  // حساب المتوسط الزمني بين الطلبات
  let avgInterval = MIN_DELAY_BETWEEN_REQUESTS;
  if (recentRequests.length > 1) {
    const intervals = [];
    for (let i = 1; i < recentRequests.length; i++) {
      intervals.push(recentRequests[i] - recentRequests[i - 1]);
    }
    avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  }
  
  // زيادة التأخير التدريجي مع تقدم المراحل
  const progressFactor = stageIndex / totalStages;
  const progressDelay = MIN_DELAY_BETWEEN_REQUESTS + (progressFactor * MIN_DELAY_BETWEEN_REQUESTS * 0.5);
  
  // التأخير النهائي
  let smartDelay = Math.max(avgInterval * ADAPTIVE_DELAY_MULTIPLIER, progressDelay);
  
  // تطبيق الحدود
  smartDelay = Math.max(MIN_DELAY_BETWEEN_REQUESTS, smartDelay);
  smartDelay = Math.min(MAX_DELAY_BETWEEN_REQUESTS, smartDelay);
  
  return Math.floor(smartDelay);
}

/**
 * تسجيل استخدام API مع معلومات إضافية للتحليل المتسلسل
 */
export function recordSequentialApiUsage(key: string, success: boolean, responseTime: number): void {
  const now = Date.now();
  let rateLimitInfo = rateLimitCache.get(key);
  
  if (!rateLimitInfo) {
    rateLimitInfo = {
      apiKey: key,
      requests: [],
      lastReset: now
    };
  }
  
  // إضافة معلومات الاستخدام (يمكن توسيعها لاحقاً)
  rateLimitInfo.requests.push(now);
  
  // تنظيف الطلبات القديمة
  rateLimitInfo.requests = rateLimitInfo.requests.filter(
    requestTime => now - requestTime < RATE_LIMIT_WINDOW
  );
  
  rateLimitCache.set(key, rateLimitInfo);
}

// تنظيف دوري كل 5 دقائق
setInterval(cleanupExpiredCache, 5 * 60 * 1000); 