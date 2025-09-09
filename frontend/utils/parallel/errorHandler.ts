/**
 * أدوات معالجة الأخطاء والاستعادة للمعالجة المتوازية
 * Error Handling and Recovery Utilities for Parallel Processing
 */

import { StageExecutionResult, ParallelExecutionProgress } from './types';

export interface ErrorContext {
  stageIndex: number;
  stageName: string;
  attempt: number;
  timestamp: number;
  errorType: 'network' | 'api' | 'timeout' | 'parsing' | 'unknown';
  errorMessage: string;
  stackTrace?: string;
  requestData?: any;
  responseData?: any;
}

export interface RecoveryStrategy {
  id: string;
  name: string;
  description: string;
  canHandle: (error: ErrorContext) => boolean;
  recover: (error: ErrorContext) => Promise<RecoveryResult>;
  priority: number; // أولوية التطبيق (أعلى رقم = أولوية أعلى)
}

export interface RecoveryResult {
  success: boolean;
  message: string;
  retryRecommended: boolean;
  delayBeforeRetry?: number; // بالملي ثانية
  alternativeAction?: string;
  preventFutureErrors?: string[];
}

export interface ErrorPattern {
  pattern: RegExp | string;
  category: string;
  frequency: number;
  lastOccurrence: number;
  suggestedFix: string;
}

export class ParallelErrorHandler {
  private errorHistory: ErrorContext[];
  private recoveryStrategies: RecoveryStrategy[];
  private errorPatterns: Map<string, ErrorPattern>;
  private maxHistorySize: number;

  constructor(maxHistorySize: number = 100) {
    this.errorHistory = [];
    this.recoveryStrategies = [];
    this.errorPatterns = new Map();
    this.maxHistorySize = maxHistorySize;
    
    this.initializeDefaultStrategies();
  }

  /**
   * تهيئة استراتيجيات الاستعادة الافتراضية
   */
  private initializeDefaultStrategies(): void {
    // استراتيجية أخطاء الشبكة
    this.addRecoveryStrategy({
      id: 'network-retry',
      name: 'إعادة المحاولة للشبكة',
      description: 'إعادة المحاولة مع تأخير متزايد لأخطاء الشبكة',
      priority: 80,
      canHandle: (error) => error.errorType === 'network',
      recover: async (error) => {
        const delay = Math.min(30000, 1000 * Math.pow(2, error.attempt)); // تأخير متزايد حتى 30 ثانية
        
        return {
          success: true,
          message: `سيتم إعادة المحاولة بعد ${delay / 1000} ثانية بسبب خطأ الشبكة`,
          retryRecommended: true,
          delayBeforeRetry: delay,
          preventFutureErrors: ['تحقق من اتصال الإنترنت', 'استخدم VPN إذا كان متاحاً']
        };
      }
    });

    // استراتيجية أخطاء API
    this.addRecoveryStrategy({
      id: 'api-quota',
      name: 'معالجة حصة API',
      description: 'التعامل مع أخطاء تجاوز حصة API',
      priority: 90,
      canHandle: (error) => 
        error.errorType === 'api' && 
        (error.errorMessage.includes('quota') || error.errorMessage.includes('rate limit')),
      recover: async (error) => {
        return {
          success: true,
          message: 'تم تجاوز حصة API. سيتم الانتظار لمدة دقيقة واحدة',
          retryRecommended: true,
          delayBeforeRetry: 60000, // دقيقة واحدة
          alternativeAction: 'استخدم مفتاح API مختلف إذا كان متاحاً',
          preventFutureErrors: ['راقب استخدام API', 'استخدم مفاتيح متعددة']
        };
      }
    });

    // استراتيجية انتهاء المهلة الزمنية
    this.addRecoveryStrategy({
      id: 'timeout-extend',
      name: 'تمديد المهلة الزمنية',
      description: 'تمديد المهلة الزمنية للمراحل البطيئة',
      priority: 70,
      canHandle: (error) => error.errorType === 'timeout',
      recover: async (error) => {
        return {
          success: true,
          message: 'انتهت المهلة الزمنية. سيتم تمديد الوقت وإعادة المحاولة',
          retryRecommended: true,
          delayBeforeRetry: 2000,
          preventFutureErrors: ['زيادة المهلة الزمنية للمراحل المعقدة']
        };
      }
    });

    // استراتيجية أخطاء التحليل
    this.addRecoveryStrategy({
      id: 'parsing-alternative',
      name: 'استخدام طريقة تحليل بديلة',
      description: 'تجربة طريقة تحليل مختلفة عند فشل التحليل',
      priority: 75,
      canHandle: (error) => error.errorType === 'parsing',
      recover: async (error) => {
        return {
          success: true,
          message: 'فشل في تحليل النتيجة. سيتم تجربة طريقة بديلة',
          retryRecommended: true,
          delayBeforeRetry: 1000,
          alternativeAction: 'استخدام مفسر JSON أكثر تساهلاً',
          preventFutureErrors: ['تحسين تنسيق البيانات المرسلة']
        };
      }
    });

    // استراتيجية الأخطاء العامة
    this.addRecoveryStrategy({
      id: 'generic-retry',
      name: 'إعادة محاولة عامة',
      description: 'إعادة محاولة بسيطة للأخطاء غير المصنفة',
      priority: 50,
      canHandle: () => true, // تتعامل مع جميع الأخطاء كحل أخير
      recover: async (error) => {
        if (error.attempt >= 3) {
          return {
            success: false,
            message: 'فشل بعد عدة محاولات. سيتم تخطي هذه المرحلة',
            retryRecommended: false,
            alternativeAction: 'تخطي المرحلة والانتقال للتالية'
          };
        }

        return {
          success: true,
          message: `إعادة المحاولة رقم ${error.attempt + 1}`,
          retryRecommended: true,
          delayBeforeRetry: 3000
        };
      }
    });
  }

  /**
   * تسجيل خطأ جديد
   */
  recordError(
    stageIndex: number,
    stageName: string,
    error: Error | string,
    attempt: number = 1,
    additionalContext?: any
  ): ErrorContext {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stackTrace = error instanceof Error ? error.stack : undefined;
    
    const errorContext: ErrorContext = {
      stageIndex,
      stageName,
      attempt,
      timestamp: Date.now(),
      errorType: this.categorizeError(errorMessage),
      errorMessage,
      stackTrace,
      ...additionalContext
    };

    this.errorHistory.push(errorContext);
    this.limitHistorySize();
    this.updateErrorPatterns(errorContext);

    return errorContext;
  }

  /**
   * تصنيف نوع الخطأ
   */
  private categorizeError(errorMessage: string): ErrorContext['errorType'] {
    const message = errorMessage.toLowerCase();
    
    if (message.includes('network') || message.includes('connection') || 
        message.includes('fetch') || message.includes('cors')) {
      return 'network';
    }
    
    if (message.includes('api') || message.includes('quota') || 
        message.includes('rate limit') || message.includes('unauthorized')) {
      return 'api';
    }
    
    if (message.includes('timeout') || message.includes('انتهت المهلة')) {
      return 'timeout';
    }
    
    if (message.includes('json') || message.includes('parse') || 
        message.includes('syntax') || message.includes('تحليل')) {
      return 'parsing';
    }
    
    return 'unknown';
  }

  /**
   * محاولة استعادة من خطأ
   */
  async attemptRecovery(errorContext: ErrorContext): Promise<RecoveryResult> {
    // ترتيب الاستراتيجيات حسب الأولوية
    const applicableStrategies = this.recoveryStrategies
      .filter(strategy => strategy.canHandle(errorContext))
      .sort((a, b) => b.priority - a.priority);

    if (applicableStrategies.length === 0) {
      return {
        success: false,
        message: 'لا توجد استراتيجية استعادة مناسبة',
        retryRecommended: false
      };
    }

    // تجربة أول استراتيجية مناسبة
    const strategy = applicableStrategies[0];
    
    try {
      const result = await strategy.recover(errorContext);
      
      console.log(`استراتيجية الاستعادة "${strategy.name}": ${result.message}`);
      
      return result;
    } catch (recoveryError) {
      console.error('فشل في تطبيق استراتيجية الاستعادة:', recoveryError);
      
      return {
        success: false,
        message: 'فشل في تطبيق استراتيجية الاستعادة',
        retryRecommended: false
      };
    }
  }

  /**
   * إضافة استراتيجية استعادة مخصصة
   */
  addRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.recoveryStrategies.push(strategy);
  }

  /**
   * تحديث أنماط الأخطاء
   */
  private updateErrorPatterns(errorContext: ErrorContext): void {
    const key = `${errorContext.errorType}:${errorContext.errorMessage.substring(0, 50)}`;
    
    const existing = this.errorPatterns.get(key);
    if (existing) {
      existing.frequency++;
      existing.lastOccurrence = errorContext.timestamp;
    } else {
      this.errorPatterns.set(key, {
        pattern: errorContext.errorMessage,
        category: errorContext.errorType,
        frequency: 1,
        lastOccurrence: errorContext.timestamp,
        suggestedFix: this.generateSuggestedFix(errorContext)
      });
    }
  }

  /**
   * إنشاء اقتراح إصلاح
   */
  private generateSuggestedFix(errorContext: ErrorContext): string {
    switch (errorContext.errorType) {
      case 'network':
        return 'تحقق من اتصال الإنترنت وإعدادات الشبكة';
      case 'api':
        return 'تحقق من مفتاح API وحدود الاستخدام';
      case 'timeout':
        return 'زيادة المهلة الزمنية أو تقليل حجم البيانات';
      case 'parsing':
        return 'تحقق من تنسيق البيانات المرسلة والمستقبلة';
      default:
        return 'مراجعة السجلات للحصول على تفاصيل أكثر';
    }
  }

  /**
   * تحليل الأخطاء والحصول على إحصائيات
   */
  analyzeErrors(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsByStage: Record<number, number>;
    commonPatterns: ErrorPattern[];
    recommendations: string[];
    recurrentErrors: ErrorContext[];
  } {
    const totalErrors = this.errorHistory.length;
    
    const errorsByType = this.errorHistory.reduce((acc, error) => {
      acc[error.errorType] = (acc[error.errorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const errorsByStage = this.errorHistory.reduce((acc, error) => {
      acc[error.stageIndex] = (acc[error.stageIndex] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const commonPatterns = Array.from(this.errorPatterns.values())
      .filter(pattern => pattern.frequency > 1)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    const recommendations = this.generateRecommendations(errorsByType, commonPatterns);
    
    const recurrentErrors = this.errorHistory.filter(error => {
      const similarErrors = this.errorHistory.filter(e => 
        e.errorType === error.errorType && 
        e.stageIndex === error.stageIndex
      );
      return similarErrors.length > 1;
    });

    return {
      totalErrors,
      errorsByType,
      errorsByStage,
      commonPatterns,
      recommendations,
      recurrentErrors
    };
  }

  /**
   * إنشاء توصيات بناءً على تحليل الأخطاء
   */
  private generateRecommendations(
    errorsByType: Record<string, number>, 
    commonPatterns: ErrorPattern[]
  ): string[] {
    const recommendations: string[] = [];

    // توصيات بناءً على نوع الخطأ
    if (errorsByType.network > 0) {
      recommendations.push('تحسين مرونة الشبكة وإضافة إعادة المحاولة التلقائية');
    }
    
    if (errorsByType.api > 0) {
      recommendations.push('مراقبة استخدام API وتنفيذ نظام حصص ذكي');
    }
    
    if (errorsByType.timeout > 0) {
      recommendations.push('زيادة المهل الزمنية أو تحسين أداء المعالجة');
    }
    
    if (errorsByType.parsing > 0) {
      recommendations.push('تحسين التحقق من صحة البيانات وتنسيقها');
    }

    // توصيات بناءً على الأنماط الشائعة
    for (const pattern of commonPatterns) {
      if (pattern.frequency > 3) {
        recommendations.push(`معالجة مخصصة للخطأ المتكرر: ${pattern.suggestedFix}`);
      }
    }

    return recommendations;
  }

  /**
   * الحصول على ملخص الأخطاء لمرحلة معينة
   */
  getStageErrorSummary(stageIndex: number): {
    errorCount: number;
    lastError?: ErrorContext;
    commonErrorType?: string;
    averageRecoveryTime: number;
  } {
    const stageErrors = this.errorHistory.filter(e => e.stageIndex === stageIndex);
    
    if (stageErrors.length === 0) {
      return {
        errorCount: 0,
        averageRecoveryTime: 0
      };
    }

    const lastError = stageErrors[stageErrors.length - 1];
    
    const errorTypeCounts = stageErrors.reduce((acc, error) => {
      acc[error.errorType] = (acc[error.errorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const commonErrorType = Object.entries(errorTypeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    const recoveryTimes = stageErrors
      .filter(e => e.attempt > 1)
      .map(e => e.timestamp - (stageErrors.find(prev => 
        prev.stageIndex === e.stageIndex && prev.attempt === e.attempt - 1
      )?.timestamp || 0))
      .filter(time => time > 0);

    const averageRecoveryTime = recoveryTimes.length > 0 
      ? recoveryTimes.reduce((sum, time) => sum + time, 0) / recoveryTimes.length 
      : 0;

    return {
      errorCount: stageErrors.length,
      lastError,
      commonErrorType,
      averageRecoveryTime
    };
  }

  /**
   * تصدير سجل الأخطاء
   */
  exportErrorLog(): {
    timestamp: number;
    errors: ErrorContext[];
    patterns: ErrorPattern[];
    analysis: any;
  } {
    return {
      timestamp: Date.now(),
      errors: [...this.errorHistory],
      patterns: Array.from(this.errorPatterns.values()),
      analysis: this.analyzeErrors()
    };
  }

  /**
   * محدود حجم سجل الأخطاء
   */
  private limitHistorySize(): void {
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * مسح سجل الأخطاء
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
    this.errorPatterns.clear();
  }

  /**
   * الحصول على أخطاء الفترة الأخيرة
   */
  getRecentErrors(timeWindowMs: number = 300000): ErrorContext[] { // آخر 5 دقائق افتراضياً
    const cutoffTime = Date.now() - timeWindowMs;
    return this.errorHistory.filter(error => error.timestamp > cutoffTime);
  }
}