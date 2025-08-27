type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_API_KEY'
  | 'RATE_LIMIT_EXCEEDED'
  | 'API_ERROR'
  | 'STAGE_NOT_FOUND'
  | 'ANALYTICS_ERROR';

export function mapApiErrorToMessage(code?: ApiErrorCode, fallback?: string): string {
  switch (code) {
    case 'VALIDATION_ERROR':
      return 'البيانات غير مكتملة أو غير صحيحة. يرجى المراجعة والمحاولة مجدداً.';
    case 'INVALID_API_KEY':
      return 'مفتاح API غير صالح. تحقق من الإعدادات.';
    case 'RATE_LIMIT_EXCEEDED':
      return 'تم تجاوز الحد المسموح من الطلبات. يرجى الانتظار قليلاً ثم المحاولة.';
    case 'STAGE_NOT_FOUND':
      return 'المرحلة المطلوبة غير موجودة.';
    case 'ANALYTICS_ERROR':
      return 'تعذر معالجة بيانات التحليلات حالياً.';
    case 'API_ERROR':
      return 'حدث خطأ في الاتصال بالخدمة. حاول لاحقاً.';
    default:
      return fallback || 'حدث خطأ غير متوقع.';
  }
}

export function extractApiError(resp: Response, data: any): { code?: ApiErrorCode; message: string } {
  const code = (data && (data.code as ApiErrorCode)) || undefined;
  const msg = (data && (data.message as string)) || resp.statusText || 'خطأ غير معروف';
  return { code, message: msg };
}

