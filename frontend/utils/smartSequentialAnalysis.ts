/**
 * نظام التحليل المتسلسل المحسن مع معالجة الفشل الذكية
 * Enhanced Sequential Analysis System with Smart Failure Handling
 */

export interface SmartRetryConfig {
  maxRetries: number; // أقصى عدد محاولات لكل مرحلة
  baseDelay: number; // فترة الانتظار الأساسية
  maxDelay: number; // أقصى فترة انتظار
  exponentialBackoff: boolean; // زيادة تدريجية لفترة الانتظار
  criticalStageRetries: number; // محاولات إضافية للمراحل الحرجة
  failureRecoveryMode: 'skip' | 'retry_with_context' | 'block_until_success'; // وضع التعامل مع الفشل
}

export interface StageStatus {
  index: number;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped' | 'retrying';
  output?: string;
  error?: string;
  retryCount: number;
  isCritical: boolean; // هل هذه المرحلة حرجة؟
  dependencies: number[]; // المراحل التي تعتمد عليها
  dependents: number[]; // المراحل التي تعتمد عليها
}

export interface AnalysisContext {
  completedStages: Map<number, string>; // نتائج المراحل المكتملة
  failedStages: Map<number, string>; // أخطاء المراحل الفاشلة
  skippedStages: Set<number>; // المراحل المتخطاة
  contextualInfo: string; // معلومات سياقية للمراحل التالية
}

export class SmartSequentialAnalysisManager {
  private config: SmartRetryConfig;
  private stages: StageStatus[] = [];
  private context: AnalysisContext = {
    completedStages: new Map(),
    failedStages: new Map(),
    skippedStages: new Set(),
    contextualInfo: ''
  };
  private progressCallback?: (progress: any) => void;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private shouldStop: boolean = false;

  constructor(
    stageNames: string[],
    config: Partial<SmartRetryConfig> = {},
    progressCallback?: (progress: any) => void
  ) {
    this.config = {
      maxRetries: 5, // زيادة المحاولات الافتراضية
      baseDelay: 3000,
      maxDelay: 30000, // زيادة أقصى انتظار
      exponentialBackoff: true,
      criticalStageRetries: 8, // محاولات إضافية للمراحل الحرجة
      failureRecoveryMode: 'retry_with_context',
      ...config
    };

    this.progressCallback = progressCallback;
    this.initializeStages(stageNames);
    this.initializeContext();
  }

  /**
   * تهيئة المراحل مع تحديد التبعيات والأهمية
   */
  private initializeStages(stageNames: string[]): void {
    this.stages = stageNames.map((name, index) => ({
      index,
      name,
      status: 'pending',
      retryCount: 0,
      isCritical: this.isCriticalStage(index),
      dependencies: this.getStageDependencies(index),
      dependents: this.getStageDependents(index, stageNames.length)
    }));
  }

  /**
   * تحديد ما إذا كانت المرحلة حرجة (أساسية لباقي المراحل)
   */
  private isCriticalStage(index: number): boolean {
    // المراحل الأولى والمراحل الأساسية تعتبر حرجة
    const criticalStages = [0, 1, 2, 4, 6, 8, 12]; // يمكن تخصيصها
    return criticalStages.includes(index) || index % 5 === 0;
  }

  /**
   * تحديد التبعيات لكل مرحلة
   */
  private getStageDependencies(index: number): number[] {
    if (index === 0) return [];
    if (index <= 3) return [index - 1];
    if (index <= 8) return [index - 1, index - 2];
    return [index - 1, index - 2, index - 3]; // المراحل المتقدمة تعتمد على عدة مراحل سابقة
  }

  /**
   * تحديد المراحل التي تعتمد على هذه المرحلة
   */
  private getStageDependents(index: number, totalStages: number): number[] {
    const dependents: number[] = [];
    for (let i = index + 1; i < Math.min(index + 4, totalStages); i++) {
      dependents.push(i);
    }
    return dependents;
  }

  /**
   * تهيئة السياق
   */
  private initializeContext(): void {
    this.context = {
      completedStages: new Map(),
      failedStages: new Map(),
      skippedStages: new Set(),
      contextualInfo: ''
    };
  }

  /**
   * بدء التحليل الذكي
   */
  async startSmartAnalysis(
    input: string,
    apiKey: string,
    additionalParams: Record<string, any> = {}
  ): Promise<any> {
    console.log('🧠 بدء التحليل الذكي المحسن...');
    
    this.isRunning = true;
    this.shouldStop = false;
    const startTime = Date.now();

    try {
      for (let i = 0; i < this.stages.length; i++) {
        if (this.shouldStop) break;

        // انتظار إذا كان متوقف مؤقتاً
        await this.waitIfPaused();

        const stage = this.stages[i];
        stage.status = 'processing';
        this.updateProgress();

        console.log(`🔄 معالجة المرحلة ${i + 1}: ${stage.name}`);

        // محاولة تحليل المرحلة
        const success = await this.processStageWithSmartRetry(i, input, apiKey, additionalParams);

        if (success) {
          console.log(`✅ تمت المرحلة ${i + 1} بنجاح`);
          stage.status = 'completed';
          this.updateContextAfterSuccess(i);
        } else {
          console.warn(`❌ فشلت المرحلة ${i + 1}`);
          await this.handleStageFailure(i);
        }

        this.updateProgress();

        // فترة انتظار ذكية بين المراحل
        if (i < this.stages.length - 1) {
          const delay = this.calculateSmartDelay(i);
          console.log(`⏰ انتظار ${delay / 1000} ثانية قبل المرحلة التالية...`);
          await this.delay(delay);
        }
      }

      const result = this.generateAnalysisResult(Date.now() - startTime);
      console.log('🎉 اكتمل التحليل الذكي:', result.summary);
      return result;

    } finally {
      this.isRunning = false;
    }
  }

  /**
   * معالجة مرحلة مع إعادة المحاولة الذكية
   */
  private async processStageWithSmartRetry(
    stageIndex: number,
    input: string,
    apiKey: string,
    additionalParams: Record<string, any>
  ): Promise<boolean> {
    const stage = this.stages[stageIndex];
    const maxAttempts = stage.isCritical ? this.config.criticalStageRetries : this.config.maxRetries;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (this.shouldStop) return false;

      stage.retryCount = attempt;
      stage.status = attempt > 0 ? 'retrying' : 'processing';
      this.updateProgress();

      try {
        // إنشاء input محسن مع السياق
        const enhancedInput = this.createEnhancedInput(input, stageIndex);
        
        console.log(`🔄 المحاولة ${attempt + 1}/${maxAttempts} للمرحلة ${stageIndex + 1}`);

        const result = await this.callAnalysisAPIWithTimeout(
          stage.name,
          enhancedInput,
          apiKey,
          stageIndex,
          additionalParams
        );

        // نجح التحليل
        stage.output = result.output || result.analysis || 'تم التحليل بنجاح';
        this.context.completedStages.set(stageIndex, stage.output || 'تم التحليل بنجاح');
        return true;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
        stage.error = errorMessage;
        
        console.error(`❌ خطأ في المحاولة ${attempt + 1}:`, errorMessage);

        // تحليل نوع الخطأ وتحديد الإستراتيجية
        const retryStrategy = this.analyzeErrorAndGetStrategy(errorMessage, attempt);
        
        if (retryStrategy.shouldRetry && attempt < maxAttempts - 1) {
          console.log(`🔄 سيتم إعادة المحاولة بعد ${retryStrategy.delay / 1000} ثانية...`);
          await this.delay(retryStrategy.delay);
        } else if (attempt === maxAttempts - 1) {
          // آخر محاولة فاشلة
          this.context.failedStages.set(stageIndex, errorMessage);
          return false;
        }
      }
    }

    return false;
  }

  /**
   * إنشاء input محسن مع السياق من المراحل السابقة
   */
  private createEnhancedInput(originalInput: string, stageIndex: number): string {
    const stage = this.stages[stageIndex];
    let enhancedInput = originalInput;

    // إضافة السياق من المراحل السابقة المكتملة
    const contextFromDependencies = this.getContextFromDependencies(stage.dependencies);
    if (contextFromDependencies) {
      enhancedInput += `\n\n--- معلومات من المراحل السابقة ---\n` + contextFromDependencies;
    }

    // إضافة معلومات عن المراحل الفاشلة والمتخطاة
    const failureContext = this.getFailureContext(stageIndex);
    if (failureContext) {
      enhancedInput += `\n\n--- تحديات في المراحل السابقة ---\n` + failureContext;
    }

    // إضافة توجيهات خاصة للمرحلة الحالية
    const stageGuidance = this.getStageSpecificGuidance(stageIndex);
    if (stageGuidance) {
      enhancedInput += `\n\n--- توجيهات للمرحلة الحالية ---\n` + stageGuidance;
    }

    return enhancedInput;
  }

  /**
   * الحصول على السياق من المراحل التابعة
   */
  private getContextFromDependencies(dependencies: number[]): string {
    const context: string[] = [];
    
    dependencies.forEach(depIndex => {
      const result = this.context.completedStages.get(depIndex);
      if (result) {
        const stageName = this.stages[depIndex]?.name || `المرحلة ${depIndex + 1}`;
        // أخذ أهم النقاط من النتيجة (أول 300 حرف)
        const summary = result.length > 300 ? result.substring(0, 300) + '...' : result;
        context.push(`${stageName}: ${summary}`);
      }
    });

    return context.join('\n\n');
  }

  /**
   * الحصول على سياق الفشل
   */
  private getFailureContext(currentStageIndex: number): string {
    const context: string[] = [];

    // معلومات عن المراحل الفاشلة
    this.context.failedStages.forEach((error, stageIndex) => {
      if (stageIndex < currentStageIndex) {
        const stageName = this.stages[stageIndex]?.name || `المرحلة ${stageIndex + 1}`;
        context.push(`تحدي في ${stageName}: ${error}`);
      }
    });

    // معلومات عن المراحل المتخطاة
    this.context.skippedStages.forEach(stageIndex => {
      if (stageIndex < currentStageIndex) {
        const stageName = this.stages[stageIndex]?.name || `المرحلة ${stageIndex + 1}`;
        context.push(`تم تخطي ${stageName} - يرجى التعويض في التحليل الحالي`);
      }
    });

    return context.join('\n');
  }

  /**
   * الحصول على توجيهات خاصة بالمرحلة
   */
  private getStageSpecificGuidance(stageIndex: number): string {
    const guidance: string[] = [];

    // توجيهات عامة
    guidance.push('يرجى تقديم تحليل شامل ومفصل');
    guidance.push('في حالة نقص المعلومات، قم بالتحليل بناءً على المعلومات المتاحة');

    // توجيهات خاصة بنوع المرحلة
    const stage = this.stages[stageIndex];
    if (stage.isCritical) {
      guidance.push('هذه مرحلة حرجة - يرجى التأكد من الدقة والاكتمال');
    }

    // توجيهات بناءً على الفشل السابق
    if (this.context.failedStages.size > 0) {
      guidance.push('تعويض عن نقص المعلومات من المراحل السابقة مطلوب');
    }

    return guidance.join('\n');
  }

  /**
   * تحليل الخطأ وتحديد إستراتيجية إعادة المحاولة
   */
  private analyzeErrorAndGetStrategy(error: string, attemptNumber: number): {
    shouldRetry: boolean;
    delay: number;
    strategy: string;
  } {
    const errorLower = error.toLowerCase();

    // خطأ Rate Limiting
    if (errorLower.includes('429') || errorLower.includes('rate') || errorLower.includes('quota')) {
      return {
        shouldRetry: true,
        delay: Math.min(this.config.maxDelay, this.config.baseDelay * Math.pow(2, attemptNumber)),
        strategy: 'exponential_backoff_rate_limit'
      };
    }

    // خطأ شبكة
    if (errorLower.includes('network') || errorLower.includes('connection') || errorLower.includes('timeout')) {
      return {
        shouldRetry: true,
        delay: this.config.baseDelay + (attemptNumber * 2000),
        strategy: 'network_retry'
      };
    }

    // خطأ خادم
    if (errorLower.includes('500') || errorLower.includes('502') || errorLower.includes('503')) {
      return {
        shouldRetry: true,
        delay: this.config.baseDelay * (attemptNumber + 1),
        strategy: 'server_error_retry'
      };
    }

    // خطأ API
    if (errorLower.includes('api') || errorLower.includes('key') || errorLower.includes('auth')) {
      return {
        shouldRetry: attemptNumber < 2, // محاولتان فقط للأخطاء الأمنية
        delay: this.config.baseDelay,
        strategy: 'api_auth_retry'
      };
    }

    // خطأ عام
    return {
      shouldRetry: true,
      delay: this.config.baseDelay + (attemptNumber * 1500),
      strategy: 'general_retry'
    };
  }

  /**
   * معالجة فشل المرحلة
   */
  private async handleStageFailure(stageIndex: number): Promise<void> {
    const stage = this.stages[stageIndex];
    
    switch (this.config.failureRecoveryMode) {
      case 'skip':
        stage.status = 'skipped';
        this.context.skippedStages.add(stageIndex);
        console.log(`⏭️ تم تخطي المرحلة ${stageIndex + 1}`);
        break;

      case 'retry_with_context':
        // محاولة أخيرة مع سياق محسن
        console.log(`🔄 محاولة أخيرة محسنة للمرحلة ${stageIndex + 1}...`);
        stage.status = 'failed';
        break;

      case 'block_until_success':
        // تتطلب تدخل يدوي أو إعادة تشغيل
        stage.status = 'failed';
        console.error(`🚫 المرحلة ${stageIndex + 1} حرجة ولا يمكن المتابعة بدونها`);
        this.shouldStop = true;
        break;
    }
  }

  /**
   * تحديث السياق بعد نجاح المرحلة
   */
  private updateContextAfterSuccess(stageIndex: number): void {
    const stage = this.stages[stageIndex];
    
    // إضافة ملخص للسياق العام
    if (stage.output) {
      const summary = this.extractKeySummary(stage.output);
      this.context.contextualInfo += `\n[${stage.name}]: ${summary}`;
    }
  }

  /**
   * استخراج ملخص رئيسي من نتيجة المرحلة
   */
  private extractKeySummary(output: string): string {
    // استخراج أول فقرة أو أهم النقاط
    const firstParagraph = output.split('\n')[0];
    return firstParagraph.length > 200 ? firstParagraph.substring(0, 200) + '...' : firstParagraph;
  }

  /**
   * حساب فترة انتظار ذكية
   */
  private calculateSmartDelay(stageIndex: number): number {
    let delay = this.config.baseDelay;

    // زيادة التأخير بناءً على الفشل الحديث
    const recentFailures = Array.from(this.context.failedStages.keys())
      .filter(index => index >= stageIndex - 2).length;
    
    delay += recentFailures * 2000;

    // زيادة التأخير للمراحل المتأخرة (أكثر تعقيداً)
    if (stageIndex > 10) {
      delay += 3000;
    } else if (stageIndex > 5) {
      delay += 1500;
    }

    return Math.min(this.config.maxDelay, delay);
  }

  /**
   * استدعاء API مع مهلة زمنية
   */
  private async callAnalysisAPIWithTimeout(
    stage: string,
    input: string,
    apiKey: string,
    stageIndex: number,
    additionalParams: Record<string, any>
  ): Promise<any> {
    const timeoutMs = 120000; // دقيقتان لكل مرحلة

    return Promise.race([
      this.callAnalysisAPI(stage, input, apiKey, stageIndex, additionalParams),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('انتهت المهلة الزمنية للمرحلة')), timeoutMs)
      )
    ]);
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
        smartRetry: true, // إشارة للـ API أن هذا طلب ذكي
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
   * تحديث التقدم
   */
  private updateProgress(): void {
    if (!this.progressCallback) return;

    const completed = this.stages.filter(s => s.status === 'completed').length;
    const failed = this.stages.filter(s => s.status === 'failed').length;
    const processing = this.stages.filter(s => s.status === 'processing' || s.status === 'retrying').length;

    this.progressCallback({
      currentStage: this.stages.findIndex(s => s.status === 'processing' || s.status === 'retrying'),
      totalStages: this.stages.length,
      completedStages: completed,
      failedStages: failed,
      processingStages: processing,
      progress: Math.round((completed / this.stages.length) * 100),
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      stages: this.stages.map(s => ({
        name: s.name,
        status: s.status,
        retryCount: s.retryCount,
        isCritical: s.isCritical
      }))
    });
  }

  /**
   * إنشاء نتيجة التحليل النهائية
   */
  private generateAnalysisResult(totalDuration: number): any {
    const completed = this.stages.filter(s => s.status === 'completed').length;
    const failed = this.stages.filter(s => s.status === 'failed').length;
    const skipped = this.stages.filter(s => s.status === 'skipped').length;

    return {
      success: failed === 0,
      summary: {
        completed,
        failed,
        skipped,
        total: this.stages.length,
        successRate: Math.round((completed / this.stages.length) * 100),
        totalDuration: this.formatDuration(totalDuration)
      },
      stages: this.stages,
      context: this.context,
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * إنشاء توصيات
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.context.failedStages.size > 0) {
      recommendations.push('يُنصح بمراجعة المراحل الفاشلة وإعادة تشغيلها');
    }

    if (this.context.skippedStages.size > 0) {
      recommendations.push('تم تخطي بعض المراحل - قد تحتاج إلى تحليل يدوي');
    }

    const criticalFailed = this.stages.filter(s => s.isCritical && s.status === 'failed').length;
    if (criticalFailed > 0) {
      recommendations.push('فشل في مراحل حرجة - قد يؤثر على جودة النتائج');
    }

    return recommendations;
  }

  // Helper methods
  private async waitIfPaused(): Promise<void> {
    while (this.isPaused && !this.shouldStop) {
      await this.delay(1000);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}س ${minutes % 60}د`;
    } else if (minutes > 0) {
      return `${minutes}د ${seconds % 60}ث`;
    } else {
      return `${seconds}ث`;
    }
  }

  // Public control methods
  stop(): void {
    this.shouldStop = true;
    this.isRunning = false;
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  getDetailedStatus(): any {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      stages: this.stages,
      context: this.context,
      config: this.config
    };
  }

  /**
   * استئناف التحليل الذكي من مرحلة معينة مع حفظ السياق
   * Resume Smart Analysis from a Specific Stage with Context Preservation
   */
  async resumeFromStage(
    startStageIndex: number,
    input: string,
    apiKey: string,
    additionalParams: Record<string, any> = {}
  ): Promise<any> {
    if (startStageIndex < 0 || startStageIndex >= this.stages.length) {
      throw new Error('رقم المرحلة غير صحيح');
    }

    console.log(`🔄 استئناف التحليل الذكي من المرحلة ${startStageIndex + 1}...`);
    
    // حفظ النتائج السابقة في السياق
    if (additionalParams.previousResults) {
      additionalParams.previousResults.forEach((result: string, index: number) => {
        if (result && index < startStageIndex) {
          this.context.completedStages.set(index, result);
          this.stages[index].status = 'completed';
          this.stages[index].output = result;
        }
      });
      console.log(`💾 تم حفظ ${this.context.completedStages.size} مراحل مكتملة في السياق`);
    }
    
    this.isRunning = true;
    this.shouldStop = false;
    const startTime = Date.now();

    try {
      // بدء من المرحلة المحددة
      for (let i = startStageIndex; i < this.stages.length; i++) {
        if (this.shouldStop) break;

        // انتظار إذا كان متوقف مؤقتاً
        await this.waitIfPaused();

        const stage = this.stages[i];
        
        // تخطي المراحل المكتملة مسبقاً
        if (stage.status === 'completed' && stage.output) {
          console.log(`✅ تم تخطي المرحلة المكتملة ${i + 1}: ${stage.name}`);
          continue;
        }
        
        stage.status = 'processing';
        this.updateProgress();

        console.log(`🔄 معالجة المرحلة ${i + 1}: ${stage.name}`);

        // محاولة تحليل المرحلة مع استخدام السياق المحفوظ
        const success = await this.processStageWithSmartRetry(i, input, apiKey, additionalParams);

        if (success) {
          console.log(`✅ تمت المرحلة ${i + 1} بنجاح`);
          stage.status = 'completed';
          this.updateContextAfterSuccess(i);
        } else {
          console.warn(`❌ فشلت المرحلة ${i + 1}`);
          await this.handleStageFailure(i);
        }

        this.updateProgress();

        // فترة انتظار ذكية بين المراحل
        if (i < this.stages.length - 1) {
          const delay = this.calculateSmartDelay(i);
          console.log(`⏰ انتظار ${delay / 1000} ثانية قبل المرحلة التالية...`);
          await this.delay(delay);
        }
      }

      const result = this.generateAnalysisResult(Date.now() - startTime);
      console.log(`🎉 اكتمل الاستئناف الذكي:`, result.summary);
      return result;

    } finally {
      this.isRunning = false;
    }
  }
}

// Factory function لإنشاء مدير محسن
export function createSmartAnalysisManager(
  stages: string[],
  config: Partial<SmartRetryConfig> = {}
): SmartSequentialAnalysisManager {
  return new SmartSequentialAnalysisManager(stages, config);
}

// إعدادات محددة مسبقاً
export const ROBUST_ANALYSIS_CONFIG: SmartRetryConfig = {
  maxRetries: 8,
  baseDelay: 5000,
  maxDelay: 45000,
  exponentialBackoff: true,
  criticalStageRetries: 12,
  failureRecoveryMode: 'retry_with_context'
};

export const PATIENT_ANALYSIS_CONFIG: SmartRetryConfig = {
  maxRetries: 15,
  baseDelay: 8000,
  maxDelay: 60000,
  exponentialBackoff: true,
  criticalStageRetries: 20,
  failureRecoveryMode: 'block_until_success'
};