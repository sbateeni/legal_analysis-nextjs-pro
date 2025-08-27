import { CachedAnalysis, RateLimitInfo } from '../types/analysis';

// Cache للتحليلات
const analysisCache = new Map<string, CachedAnalysis>();

// Cache للـ rate limiting
const rateLimitCache = new Map<string, RateLimitInfo>();

// إعدادات Cache
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 ساعة
const RATE_LIMIT_WINDOW = 60 * 1000; // دقيقة واحدة
const MAX_REQUESTS_PER_WINDOW = 10; // 10 طلبات في الدقيقة

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
  const now = Date.now();
  const rateLimitInfo = rateLimitCache.get(apiKey);
  
  if (!rateLimitInfo) {
    // أول طلب لهذا API Key
    const newRateLimitInfo: RateLimitInfo = {
      apiKey,
      requests: [now],
      lastReset: now
    };
    rateLimitCache.set(apiKey, newRateLimitInfo);
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetTime: now + RATE_LIMIT_WINDOW };
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
  const allowed = currentRequests <= MAX_REQUESTS_PER_WINDOW;
  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - currentRequests);
  const resetTime = rateLimitInfo.lastReset + RATE_LIMIT_WINDOW;
  
  return { allowed, remaining, resetTime };
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

// تنظيف دوري كل 5 دقائق
setInterval(cleanupExpiredCache, 5 * 60 * 1000); 