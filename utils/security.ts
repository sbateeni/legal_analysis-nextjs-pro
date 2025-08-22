import CryptoJS from 'crypto-js';

// إعدادات الأمان
const SECURITY_CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 دقيقة
  MAX_LOGIN_ATTEMPTS: 5,
  PASSWORD_MIN_LENGTH: 8,
  ENCRYPTION_KEY: process.env.NEXT_PUBLIC_ENCRYPTION_SECRET || 'default-secret-key',
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 ساعة
};

// دالة تشفير البيانات
export function encryptData(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, SECURITY_CONFIG.ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('فشل في تشفير البيانات');
  }
}

// دالة فك تشفير البيانات
export function decryptData(encryptedData: string): any {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECURITY_CONFIG.ENCRYPTION_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('فشل في فك تشفير البيانات');
  }
}

// دالة إنشاء token آمن
export function generateSecureToken(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  const data = `${timestamp}-${random}-${navigator.userAgent}`;
  return CryptoJS.SHA256(data).toString();
}

// دالة التحقق من صحة token
export function validateToken(token: string): boolean {
  try {
    // التحقق من تنسيق token
    if (!token || token.length < 64) return false;
    
    // التحقق من عدم انتهاء الصلاحية
    const tokenData = decryptData(token);
    if (!tokenData || !tokenData.expiry) return false;
    
    return Date.now() < tokenData.expiry;
  } catch {
    return false;
  }
}

// دالة إنشاء كلمة مرور قوية
export function generateStrongPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return password;
}

// دالة التحقق من قوة كلمة المرور
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // التحقق من الطول
  if (password.length >= SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
    score += 2;
  } else {
    feedback.push(`كلمة المرور يجب أن تكون ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} أحرف على الأقل`);
  }

  // التحقق من وجود أحرف كبيرة
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('يجب أن تحتوي على حرف كبير واحد على الأقل');
  }

  // التحقق من وجود أحرف صغيرة
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('يجب أن تحتوي على حرف صغير واحد على الأقل');
  }

  // التحقق من وجود أرقام
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('يجب أن تحتوي على رقم واحد على الأقل');
  }

  // التحقق من وجود رموز خاصة
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('يجب أن تحتوي على رمز خاص واحد على الأقل');
  }

  return {
    isValid: score >= 4,
    score,
    feedback
  };
}

// دالة تنظيف المدخلات
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // إزالة علامات HTML
    .replace(/javascript:/gi, '') // إزالة JavaScript
    .replace(/on\w+=/gi, '') // إزالة event handlers
    .substring(0, 1000); // تحديد الطول الأقصى
}

// دالة التحقق من XSS
export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

// دالة التحقق من SQL Injection
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/gi,
    /(\b(OR|AND)\b\s+['"]\w+['"]\s*=\s*['"]\w+['"])/gi,
    /(--|\/\*|\*\/)/g,
    /(\b(WAITFOR|DELAY)\b)/gi
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

// دالة مراقبة محاولات تسجيل الدخول
class LoginAttemptTracker {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();

  recordAttempt(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier) || { count: 0, lastAttempt: 0 };

    // إعادة تعيين العداد إذا مر وقت كافي
    if (now - attempt.lastAttempt > 15 * 60 * 1000) { // 15 دقيقة
      attempt.count = 0;
    }

    attempt.count++;
    attempt.lastAttempt = now;
    this.attempts.set(identifier, attempt);

    return attempt.count <= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS;
  }

  isBlocked(identifier: string): boolean {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return false;

    const now = Date.now();
    if (now - attempt.lastAttempt > 15 * 60 * 1000) {
      this.attempts.delete(identifier);
      return false;
    }

    return attempt.count > SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS;
  }

  resetAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

export const loginTracker = new LoginAttemptTracker();

// دالة إنشاء session آمن
export function createSecureSession(userData: any): string {
  const sessionData = {
    user: userData,
    created: Date.now(),
    expiry: Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT,
    token: generateSecureToken()
  };

  return encryptData(sessionData);
}

// دالة التحقق من صحة session
export function validateSession(sessionToken: string): any {
  try {
    const sessionData = decryptData(sessionToken);
    
    if (!sessionData || !sessionData.expiry) {
      return null;
    }

    if (Date.now() > sessionData.expiry) {
      return null;
    }

    return sessionData.user;
  } catch {
    return null;
  }
}

// دالة تسجيل الأحداث الأمنية
export function logSecurityEvent(event: string, details: any = {}): void {
  const securityLog = {
    event,
    details,
    timestamp: Date.now(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    ip: 'unknown' // في التطبيق الحقيقي، سيتم الحصول على IP من الخادم
  };

  console.warn('Security Event:', securityLog);
  
  // حفظ في localStorage للتدقيق
  try {
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    logs.push(securityLog);
    
    // الاحتفاظ بآخر 100 حدث فقط
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    
    localStorage.setItem('security_logs', JSON.stringify(logs));
  } catch (error) {
    console.error('Error logging security event:', error);
  }
}

// دالة تنظيف البيانات الحساسة
export function clearSensitiveData(): void {
  try {
    // حذف البيانات الحساسة من localStorage
    const sensitiveKeys = [
      'security_logs',
      'user_session',
      'api_key',
      'offline_data'
    ];

    sensitiveKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // حذف cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=');
      document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  } catch (error) {
    console.error('Error clearing sensitive data:', error);
  }
} 