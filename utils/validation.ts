import { AnalysisRequest, AnalysisError, PartyRole } from '../types/analysis';

// حدود التحقق
const MIN_TEXT_LENGTH = 10;
const MAX_TEXT_LENGTH = 10000;
const MAX_API_KEY_LENGTH = 100;

// دالة التحقق من المدخلات
export function validateAnalysisRequest(request: AnalysisRequest): AnalysisError | null {
  // التحقق من النص
  if (!request.text || typeof request.text !== 'string') {
    return {
      code: 'VALIDATION_ERROR',
      message: 'يجب إدخال نص صحيح للتحليل',
      details: { field: 'text' }
    };
  }

  if (request.text.length < MIN_TEXT_LENGTH) {
    return {
      code: 'VALIDATION_ERROR',
      message: `النص قصير جداً. الحد الأدنى ${MIN_TEXT_LENGTH} حرف`,
      details: { field: 'text', minLength: MIN_TEXT_LENGTH, actualLength: request.text.length }
    };
  }

  if (request.text.length > MAX_TEXT_LENGTH) {
    return {
      code: 'TEXT_TOO_LONG',
      message: `النص طويل جداً. الحد الأقصى ${MAX_TEXT_LENGTH} حرف`,
      details: { field: 'text', maxLength: MAX_TEXT_LENGTH, actualLength: request.text.length }
    };
  }

  // التحقق من API Key
  if (!request.apiKey || typeof request.apiKey !== 'string') {
    return {
      code: 'INVALID_API_KEY',
      message: 'يجب إدخال مفتاح API صحيح',
      details: { field: 'apiKey' }
    };
  }

  if (request.apiKey.length > MAX_API_KEY_LENGTH) {
    return {
      code: 'INVALID_API_KEY',
      message: 'مفتاح API غير صحيح',
      details: { field: 'apiKey', maxLength: MAX_API_KEY_LENGTH }
    };
  }

  // التحقق من stageIndex
  const stageIndexIsFinal = request.finalPetition === true && request.stageIndex === -1;
  if (!stageIndexIsFinal) {
    if (typeof request.stageIndex !== 'number' || request.stageIndex < 0 || request.stageIndex > 11) {
      return {
        code: 'VALIDATION_ERROR',
        message: 'رقم المرحلة غير صحيح. يجب أن يكون بين 0 و 11',
        details: { field: 'stageIndex', validRange: [0, 11], actualValue: request.stageIndex }
      };
    }
  }

  // التحقق من previousSummaries
  if (request.previousSummaries && !Array.isArray(request.previousSummaries)) {
    return {
      code: 'VALIDATION_ERROR',
      message: 'الملخصات السابقة يجب أن تكون مصفوفة',
      details: { field: 'previousSummaries' }
    };
  }

  // partyRole اختياري لكن إن وجد يجب أن يكون من القائمة
  if (request.partyRole && !(['المشتكي','المشتكى عليه','المدعي','المدعى عليه'] as PartyRole[]).includes(request.partyRole)) {
    return {
      code: 'VALIDATION_ERROR',
      message: 'صفة الطرف غير صحيحة',
      details: { field: 'partyRole' }
    };
  }

  return null; // لا توجد أخطاء
}

// دالة تنظيف النص
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ') // إزالة المسافات المتعددة
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\w\.,!?;:()\[\]{}""''-]/g, ''); // السماح بالعربية والإنجليزية والأرقام والرموز الأساسية
}

// دالة التحقق من صحة API Key
export function isValidApiKey(apiKey: string): boolean {
  return Boolean(apiKey && 
         typeof apiKey === 'string' && 
         apiKey.length > 0 && 
         apiKey.length <= MAX_API_KEY_LENGTH &&
         /^[A-Za-z0-9_-]+$/.test(apiKey)); // التحقق من التنسيق الأساسي
} 