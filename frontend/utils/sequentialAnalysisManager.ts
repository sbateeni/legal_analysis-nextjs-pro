/**
 * نظام إدارة التحليل المتسلسل المحسن
 * يحل مشكلة Rate Limiting مع Gemini API ويضمن التحليل المتسلسل الناجح
 */

export interface AnalysisStage {
  id: string;
  stageIndex: number;
  stage: string;
  input: string;
  output: string;
  date: string;
  duration?: number; // مدة التحليل بالمللي ثانية
  retryCount?: number; // عدد المحاولات
}

export interface SequentialAnalysisConfig {
  baseDelay: number; // فترة الانتظار الأساسية (بالمللي ثانية) - افتراضي 5000
  maxDelay: number; // أقصى فترة انتظار - افتراضي 15000
  maxRetries: number; // أقصى عدد محاولات لكل مرحلة - افتراضي 3
  timeoutPerStage: number; // مهلة زمنية لكل مرحلة - افتراضي 60000
  enableProgressSave: boolean; // حفظ التقدم تلقائياً - افتراضي true
}

export interface AnalysisProgress {
  currentStage: number;
  totalStages: number;
  completedStages: number;
  failedStages: number;
  progress: number; // نسبة مئوية
  isRunning: boolean;
  isPaused: boolean;
  estimatedTimeRemaining?: number; // بالمللي ثانية
  lastError?: string;
}

export interface AnalysisResult {
  success: boolean;
  results: AnalysisStage[];
  errors: Array<{ stageIndex: number; error: string; retryCount: number }>;
  totalDuration: number;
  summary: {
    completed: number;
    failed: number;
    skipped: number;
    totalTime: string;
  };
}

export class SequentialAnalysisManager {
  private config: SequentialAnalysisConfig;
  private stages: string[];
  private results: AnalysisStage[] = [];
  private errors: Array<{ stageIndex: number; error: string; retryCount: number }> = [];
  private currentStageIndex: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private startTime: number = 0;
  private shouldStop: boolean = false;
  private progressCallback?: (progress: AnalysisProgress) => void;
  private stageCompleteCallback?: (stage: AnalysisStage) => void;

  constructor(
    stages: string[],
    config: Partial<SequentialAnalysisConfig> = {},
    progressCallback?: (progress: AnalysisProgress) => void,
    stageCompleteCallback?: (stage: AnalysisStage) => void
  ) {
    this.stages = stages;
    this.config = {
      baseDelay: 5000, // 5 ثواني
      maxDelay: 15000, // 15 ثانية
      maxRetries: 3,
      timeoutPerStage: 60000, // دقيقة
      enableProgressSave: true,
      ...config
    };
    this.progressCallback = progressCallback;
    this.stageCompleteCallback = stageCompleteCallback;
  }

  /**
   * بدء التحليل المتسلسل
   */
  async startAnalysis(
    input: string,
    apiKey: string,
    additionalParams: Record<string, any> = {}
  ): Promise<AnalysisResult> {
    if (this.isRunning) {
      throw new Error('التحليل قيد التشغيل بالفعل');
    }

    this.isRunning = true;
    this.isPaused = false;
    this.shouldStop = false;
    this.startTime = Date.now();
    this.currentStageIndex = 0;
    this.results = [];
    this.errors = [];

    try {
      for (let i = this.currentStageIndex; i < this.stages.length; i++) {
        if (this.shouldStop) {
          break;
        }

        // انتظار إذا كان النظام متوقف مؤقتاً
        while (this.isPaused && !this.shouldStop) {
          await this.delay(1000);
        }

        if (this.shouldStop) {
          break;
        }

        this.currentStageIndex = i;
        await this.analyzeStageWithRetry(i, input, apiKey, additionalParams);

        // فترة انتظار بين المراحل (ديناميكية حسب النجاح/الفشل)
        if (i < this.stages.length - 1) {
          const delayTime = this.calculateDelay(i);
          await this.delay(delayTime);
        }

        // تحديث التقدم
        this.updateProgress();
      }

      const result: AnalysisResult = {
        success: this.errors.length === 0,
        results: this.results,
        errors: this.errors,
        totalDuration: Date.now() - this.startTime,
        summary: {
          completed: this.results.length,
          failed: this.errors.length,
          skipped: this.stages.length - this.results.length - this.errors.length,
          totalTime: this.formatDuration(Date.now() - this.startTime)
        }
      };

      return result;
    } finally {
      this.isRunning = false;
      this.isPaused = false;
    }
  }

  /**
   * تحليل مرحلة واحدة مع إعادة المحاولة
   */
  private async analyzeStageWithRetry(
    stageIndex: number,
    input: string,
    apiKey: string,
    additionalParams: Record<string, any>
  ): Promise<void> {
    const stageName = this.stages[stageIndex];
    let retryCount = 0;
    let lastError: string = '';

    while (retryCount < this.config.maxRetries) {
      if (this.shouldStop) return;

      try {
        const stageStartTime = Date.now();
        
        // استدعاء API مع مهلة زمنية
        const result = await Promise.race([
          this.callAnalysisAPI(stageName, input, apiKey, stageIndex, additionalParams),
          this.timeout(this.config.timeoutPerStage)
        ]);

        const stageDuration = Date.now() - stageStartTime;

        // إنشاء نتيجة المرحلة
        const stageResult: AnalysisStage = {
          id: `sequential-${Date.now()}-${stageIndex}`,
          stageIndex,
          stage: stageName,
          input,
          output: result.output || result.analysis || 'تم تحليل هذه المرحلة بنجاح',
          date: new Date().toISOString(),
          duration: stageDuration,
          retryCount
        };

        this.results.push(stageResult);
        
        // استدعاء callback إذا كان متاحاً
        if (this.stageCompleteCallback) {
          this.stageCompleteCallback(stageResult);
        }

        return; // نجح التحليل
      } catch (error) {
        retryCount++;
        lastError = error instanceof Error ? error.message : 'خطأ غير معروف';
        
        console.error(`خطأ في المرحلة ${stageIndex + 1} (المحاولة ${retryCount}):`, lastError);

        // إذا كان خطأ rate limiting، انتظر أكثر
        if (lastError.includes('429') || lastError.includes('rate') || lastError.includes('quota')) {
          const rateLimitDelay = Math.min(this.config.maxDelay, this.config.baseDelay * Math.pow(2, retryCount));
          console.log(`انتظار ${rateLimitDelay / 1000} ثانية بسبب Rate Limiting...`);
          await this.delay(rateLimitDelay);
        } else if (retryCount < this.config.maxRetries) {
          // انتظار قصير للمحاولة التالية
          await this.delay(2000 * retryCount);
        }
      }
    }

    // فشل في جميع المحاولات
    this.errors.push({
      stageIndex,
      error: lastError,
      retryCount: retryCount - 1
    });

    // إضافة مرحلة فاشلة للنتائج
    const errorStage: AnalysisStage = {
      id: `sequential-error-${Date.now()}-${stageIndex}`,
      stageIndex,
      stage: stageName,
      input,
      output: `فشل في تحليل هذه المرحلة بعد ${this.config.maxRetries} محاولات. آخر خطأ: ${lastError}`,
      date: new Date().toISOString(),
      retryCount: retryCount - 1
    };

    this.results.push(errorStage);
  }

  /**
   * استدعاء API للتحليل
   */
  private async callAnalysisAPI(
    stage: string,
    input: string,
    apiKey: string,
    stageIndex: number,
    additionalParams: Record<string, any>
  ): Promise<any> {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: input,
        stageIndex,
        apiKey,
        stage,
        ...additionalParams
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  /**
   * حساب فترة الانتظار الديناميكية
   */
  private calculateDelay(stageIndex: number): number {
    // زيادة فترة الانتظار تدريجياً مع تقدم المراحل
    const progressFactor = (stageIndex + 1) / this.stages.length;
    const dynamicDelay = this.config.baseDelay + (this.config.maxDelay - this.config.baseDelay) * progressFactor * 0.3;
    
    // زيادة الانتظار إذا كان هناك أخطاء حديثة
    const recentErrors = this.errors.filter(e => e.stageIndex >= stageIndex - 2).length;
    const errorPenalty = recentErrors * 2000; // ثانيتان إضافيتان لكل خطأ حديث

    return Math.min(this.config.maxDelay, dynamicDelay + errorPenalty);
  }

  /**
   * تحديث معلومات التقدم
   */
  private updateProgress(): void {
    if (!this.progressCallback) return;

    const completedStages = this.results.length;
    const progress = Math.round((completedStages / this.stages.length) * 100);
    const estimatedTimeRemaining = this.calculateEstimatedTimeRemaining();

    const progressInfo: AnalysisProgress = {
      currentStage: this.currentStageIndex,
      totalStages: this.stages.length,
      completedStages,
      failedStages: this.errors.length,
      progress,
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      estimatedTimeRemaining,
      lastError: this.errors.length > 0 ? this.errors[this.errors.length - 1].error : undefined
    };

    this.progressCallback(progressInfo);
  }

  /**
   * حساب الوقت المتبقي المتوقع
   */
  private calculateEstimatedTimeRemaining(): number {
    if (this.results.length === 0) return 0;

    const elapsedTime = Date.now() - this.startTime;
    const averageTimePerStage = elapsedTime / this.results.length;
    const remainingStages = this.stages.length - this.results.length;

    return remainingStages * averageTimePerStage;
  }

  /**
   * تأخير (انتظار)
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * مهلة زمنية للعمليات
   */
  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error('انتهت المهلة الزمنية للمرحلة')), ms)
    );
  }

  /**
   * تنسيق مدة الوقت
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}س ${minutes % 60}د ${seconds % 60}ث`;
    } else if (minutes > 0) {
      return `${minutes}د ${seconds % 60}ث`;
    } else {
      return `${seconds}ث`;
    }
  }

  /**
   * إيقاف التحليل
   */
  stop(): void {
    this.shouldStop = true;
    this.isRunning = false;
    this.isPaused = false;
  }

  /**
   * إيقاف مؤقت للتحليل
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * استئناف التحليل
   */
  resume(): void {
    this.isPaused = false;
  }

  /**
   * الحصول على حالة التحليل الحالية
   */
  getStatus(): {
    isRunning: boolean;
    isPaused: boolean;
    currentStage: number;
    totalStages: number;
    completedStages: number;
    failedStages: number;
  } {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      currentStage: this.currentStageIndex,
      totalStages: this.stages.length,
      completedStages: this.results.length,
      failedStages: this.errors.length
    };
  }

  /**
   * استئناف التحليل من مرحلة معينة
   */
  async resumeFromStage(
    stageIndex: number,
    input: string,
    apiKey: string,
    additionalParams: Record<string, any> = {}
  ): Promise<AnalysisResult> {
    if (stageIndex < 0 || stageIndex >= this.stages.length) {
      throw new Error('رقم المرحلة غير صحيح');
    }

    this.currentStageIndex = stageIndex;
    return this.startAnalysis(input, apiKey, additionalParams);
  }
}

/**
 * دالة مساعدة لإنشاء مدير التحليل المتسلسل
 */
export function createSequentialAnalysisManager(
  stages: string[],
  config?: Partial<SequentialAnalysisConfig>,
  progressCallback?: (progress: AnalysisProgress) => void,
  stageCompleteCallback?: (stage: AnalysisStage) => void
): SequentialAnalysisManager {
  return new SequentialAnalysisManager(stages, config, progressCallback, stageCompleteCallback);
}

/**
 * المراحل الافتراضية للتحليل القانوني
 */
export const DEFAULT_LEGAL_STAGES = [
  'تحليل الوقائع الأساسية',
  'تحديد الأطراف القانونية', 
  'تحليل النزاع القانوني',
  'البحث عن القوانين المنطبقة',
  'تحليل السوابق القضائية',
  'تحديد الأدلة القانونية',
  'تحليل القوة القانونية',
  'تحديد نقاط الضعف',
  'صياغة الاستراتيجية القانونية',
  'تحليل المخاطر القانونية',
  'إعداد خطة المرافعة',
  'تقييم احتمالية النجاح'
];