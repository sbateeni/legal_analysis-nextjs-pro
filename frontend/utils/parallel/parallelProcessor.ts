/**
 * محرك المعالجة المتوازية - الجزء الأول
 * Parallel Processing Engine - Core Manager
 */

import { 
  DependencyGraph, 
  ParallelExecutionPlan, 
  ParallelExecutionPhase, 
  StageExecutionResult,
  ParallelExecutionProgress
} from './types';
import { StageDependencyAnalyzer } from './dependencyAnalyzer';

export interface ParallelProcessingConfig {
  maxConcurrentStages: number; // أقصى عدد مراحل متوازية
  enableDynamicScaling: boolean; // تمكين التحجيم الديناميكي
  failureHandling: 'abort' | 'continue' | 'retry'; // معالجة الأخطاء
  retryAttempts: number; // عدد محاولات الإعادة
  timeoutPerStage: number; // المهلة الزمنية لكل مرحلة
  enableProgressTracking: boolean; // تتبع التقدم
  enableEfficiencyMonitoring: boolean; // مراقبة الكفاءة
}

export class ParallelProcessingEngine {
  private config: ParallelProcessingConfig;
  private dependencyAnalyzer: StageDependencyAnalyzer;
  private executionResults: Map<number, StageExecutionResult>;
  private activeExecutions: Map<number, Promise<any>>;
  private progressCallback?: (progress: ParallelExecutionProgress) => void;

  constructor(
    stages: string[],
    config: Partial<ParallelProcessingConfig> = {},
    progressCallback?: (progress: ParallelExecutionProgress) => void
  ) {
    this.config = {
      maxConcurrentStages: 3,
      enableDynamicScaling: true,
      failureHandling: 'continue',
      retryAttempts: 2,
      timeoutPerStage: 120000, // دقيقتان
      enableProgressTracking: true,
      enableEfficiencyMonitoring: true,
      ...config
    };

    this.dependencyAnalyzer = new StageDependencyAnalyzer(stages);
    this.executionResults = new Map();
    this.activeExecutions = new Map();
    this.progressCallback = progressCallback;
  }

  /**
   * تشغيل المعالجة المتوازية
   */
  async executeParallel(
    input: string,
    apiKey: string,
    additionalParams: Record<string, any> = {}
  ): Promise<StageExecutionResult[]> {
    
    // تحليل الاعتماديات وإنشاء خطة التنفيذ
    const dependencyGraph = this.dependencyAnalyzer.analyzeAllDependencies();
    const executionPlan = this.createExecutionPlan(dependencyGraph);

    console.log('خطة التنفيذ المتوازي:', executionPlan);

    // تهيئة نتائج التنفيذ
    this.initializeExecutionResults(dependencyGraph.stages.length);

    try {
      // تنفيذ المراحل حسب الخطة
      await this.executePhases(executionPlan, input, apiKey, additionalParams);

      // جمع النتائج النهائية
      const results = this.collectResults();
      
      // إرسال تقرير الكفاءة
      if (this.config.enableEfficiencyMonitoring) {
        this.reportEfficiency(dependencyGraph, results);
      }

      return results;

    } catch (error) {
      console.error('خطأ في المعالجة المتوازية:', error);
      throw error;
    }
  }

  /**
   * إنشاء خطة التنفيذ المتوازي
   */
  private createExecutionPlan(dependencyGraph: DependencyGraph): ParallelExecutionPlan {
    const phases: ParallelExecutionPhase[] = [];
    const processed = new Set<number>();
    let phaseId = 0;

    // ترتيب المراحل حسب الاعتماديات
    const sortedStages = this.topologicalSort(dependencyGraph.stages);
    
    while (processed.size < dependencyGraph.stages.length) {
      const phase = this.createNextPhase(phaseId++, sortedStages, processed, dependencyGraph);
      
      if (phase.stagesToExecute.length > 0) {
        phases.push(phase);
        phase.stagesToExecute.forEach(stageIndex => processed.add(stageIndex));
      } else {
        break; // تجنب الحلقة اللانهائية
      }
    }

    const totalEstimatedTime = phases.reduce((total, phase) => total + phase.estimatedDuration, 0);

    return {
      phases,
      totalPhases: phases.length,
      estimatedTotalTime: totalEstimatedTime,
      maxConcurrency: this.config.maxConcurrentStages
    };
  }

  /**
   * ترتيب طوبولوجي للمراحل
   */
  private topologicalSort(stages: any[]): number[] {
    const sorted: number[] = [];
    const visited = new Set<number>();
    const visiting = new Set<number>();

    const visit = (stageIndex: number) => {
      if (visiting.has(stageIndex)) {
        throw new Error(`دورة في الاعتماديات عند المرحلة ${stageIndex}`);
      }
      
      if (!visited.has(stageIndex)) {
        visiting.add(stageIndex);
        
        const stage = stages[stageIndex];
        for (const dep of stage.dependencies) {
          visit(dep);
        }
        
        visiting.delete(stageIndex);
        visited.add(stageIndex);
        sorted.push(stageIndex);
      }
    };

    for (let i = 0; i < stages.length; i++) {
      if (!visited.has(i)) {
        visit(i);
      }
    }

    return sorted;
  }

  /**
   * إنشاء المرحلة التالية في خطة التنفيذ
   */
  private createNextPhase(
    phaseId: number,
    sortedStages: number[],
    processed: Set<number>,
    dependencyGraph: DependencyGraph
  ): ParallelExecutionPhase {
    
    const candidateStages: number[] = [];
    const canStartAfter: number[] = [];

    // البحث عن المراحل التي يمكن تشغيلها
    for (const stageIndex of sortedStages) {
      if (processed.has(stageIndex)) continue;

      const stage = dependencyGraph.stages[stageIndex];
      const dependenciesMet = stage.dependencies.every(dep => processed.has(dep));

      if (dependenciesMet) {
        candidateStages.push(stageIndex);
        canStartAfter.push(...stage.dependencies);
      }
    }

    // تحديد أقصى عدد مراحل يمكن تشغيلها معاً
    const maxConcurrent = this.calculateDynamicConcurrency(candidateStages, dependencyGraph);
    const stagesToExecute = candidateStages.slice(0, maxConcurrent);

    // حساب المدة المقدرة للمرحلة
    const estimatedDuration = stagesToExecute.length > 0 ? 
      Math.max(...stagesToExecute.map(i => dependencyGraph.stages[i].estimatedDuration)) : 0;

    // تحديد الأولوية
    const priority = this.calculatePhasePriority(stagesToExecute, dependencyGraph);

    return {
      phaseId,
      stagesToExecute,
      estimatedDuration,
      canStartAfter: [...new Set(canStartAfter)],
      priority
    };
  }

  /**
   * حساب التزامن الديناميكي
   */
  private calculateDynamicConcurrency(candidateStages: number[], dependencyGraph: DependencyGraph): number {
    if (!this.config.enableDynamicScaling) {
      return Math.min(candidateStages.length, this.config.maxConcurrentStages);
    }

    // تحليل تعقيد المراحل المرشحة
    const complexities = candidateStages.map(i => dependencyGraph.stages[i].complexity);
    const highComplexityCount = complexities.filter(c => c === 'high').length;
    const mediumComplexityCount = complexities.filter(c => c === 'medium').length;

    // تقليل التزامن للمراحل المعقدة
    let maxConcurrent = this.config.maxConcurrentStages;
    
    if (highComplexityCount > 0) {
      maxConcurrent = Math.min(maxConcurrent, 2); // حد أقصى 2 للمراحل المعقدة
    } else if (mediumComplexityCount > 2) {
      maxConcurrent = Math.min(maxConcurrent, 3); // حد أقصى 3 للمراحل متوسطة التعقيد
    }

    return Math.min(candidateStages.length, maxConcurrent);
  }

  /**
   * حساب أولوية المرحلة
   */
  private calculatePhasePriority(stagesToExecute: number[], dependencyGraph: DependencyGraph): 'low' | 'medium' | 'high' {
    if (stagesToExecute.length === 0) return 'low';

    const priorities = stagesToExecute.map(i => dependencyGraph.stages[i].priority);
    const hasCritical = priorities.includes('critical');
    const hasHigh = priorities.includes('high');
    const hasMedium = priorities.includes('medium');

    if (hasCritical) return 'high';
    if (hasHigh) return 'high';
    if (hasMedium) return 'medium';
    return 'low';
  }

  /**
   * تهيئة نتائج التنفيذ
   */
  private initializeExecutionResults(stageCount: number): void {
    this.executionResults.clear();
    this.activeExecutions.clear();

    for (let i = 0; i < stageCount; i++) {
      this.executionResults.set(i, {
        stageIndex: i,
        stageName: '', // سيتم تعبئته لاحقاً
        status: 'pending'
      });
    }
  }

  /**
   * تنفيذ المراحل حسب الخطة
   */
  private async executePhases(
    plan: ParallelExecutionPlan,
    input: string,
    apiKey: string,
    additionalParams: Record<string, any>
  ): Promise<void> {
    
    for (const phase of plan.phases) {
      console.log(`بدء تنفيذ المرحلة ${phase.phaseId} مع ${phase.stagesToExecute.length} مراحل متوازية`);

      // تنفيذ المراحل في هذه المرحلة بالتوازي
      await this.executePhaseStages(phase, input, apiKey, additionalParams);

      // تحديث التقدم
      if (this.config.enableProgressTracking && this.progressCallback) {
        const progress = this.calculateProgress(plan);
        this.progressCallback(progress);
      }

      console.log(`اكتملت المرحلة ${phase.phaseId}`);
    }
  }

  /**
   * تنفيذ مراحل في مرحلة واحدة
   */
  private async executePhaseStages(
    phase: ParallelExecutionPhase,
    input: string,
    apiKey: string,
    additionalParams: Record<string, any>
  ): Promise<void> {
    
    const promises = phase.stagesToExecute.map(stageIndex => 
      this.executeStage(stageIndex, input, apiKey, additionalParams)
    );

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.error(`خطأ في تنفيذ المرحلة ${phase.phaseId}:`, error);
      
      if (this.config.failureHandling === 'abort') {
        throw error;
      }
      // للخيارات الأخرى، نواصل التنفيذ
    }
  }

  /**
   * تنفيذ مرحلة واحدة
   */
  private async executeStage(
    stageIndex: number,
    input: string,
    apiKey: string,
    additionalParams: Record<string, any>
  ): Promise<void> {
    
    const result = this.executionResults.get(stageIndex)!;
    result.status = 'running';
    result.startTime = Date.now();

    try {
      // إنشاء Promise للتنفيذ مع timeout
      const executionPromise = this.performStageExecution(stageIndex, input, apiKey, additionalParams);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('انتهت المهلة الزمنية')), this.config.timeoutPerStage)
      );

      this.activeExecutions.set(stageIndex, executionPromise);

      // تشغيل مع timeout
      const output = await Promise.race([executionPromise, timeoutPromise]) as string;

      result.status = 'completed';
      result.output = output;
      result.endTime = Date.now();
      result.duration = result.endTime - (result.startTime || 0);

    } catch (error) {
      result.status = 'failed';
      result.error = error instanceof Error ? error.message : 'خطأ غير معروف';
      result.endTime = Date.now();
      result.duration = result.endTime - (result.startTime || 0);

      console.error(`فشل في تنفيذ المرحلة ${stageIndex}:`, error);

      // إعادة المحاولة إذا كان مطلوباً
      if (this.config.failureHandling === 'retry' && this.config.retryAttempts > 0) {
        await this.retryStage(stageIndex, input, apiKey, additionalParams);
      }
    } finally {
      this.activeExecutions.delete(stageIndex);
    }
  }

  /**
   * تنفيذ المرحلة الفعلي
   */
  private async performStageExecution(
    stageIndex: number,
    input: string,
    apiKey: string,
    additionalParams: Record<string, any>
  ): Promise<string> {
    
    // استدعاء API للتحليل
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-parallel-execution': 'true',
        'x-stage-index': stageIndex.toString()
      },
      body: JSON.stringify({
        text: input,
        stageIndex,
        apiKey,
        ...additionalParams
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.analysis || data.output || 'تم تحليل هذه المرحلة بنجاح';
  }

  /**
   * إعادة المحاولة للمرحلة
   */
  private async retryStage(
    stageIndex: number,
    input: string,
    apiKey: string,
    additionalParams: Record<string, any>
  ): Promise<void> {
    
    console.log(`إعادة محاولة المرحلة ${stageIndex}...`);

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        // انتظار قبل الإعادة
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));

        const output = await this.performStageExecution(stageIndex, input, apiKey, additionalParams);
        
        const result = this.executionResults.get(stageIndex)!;
        result.status = 'completed';
        result.output = output;
        result.error = undefined;

        console.log(`نجحت إعادة المحاولة ${attempt} للمرحلة ${stageIndex}`);
        return;

      } catch (error) {
        console.error(`فشلت إعادة المحاولة ${attempt} للمرحلة ${stageIndex}:`, error);
        
        if (attempt === this.config.retryAttempts) {
          const result = this.executionResults.get(stageIndex)!;
          result.error = `فشل بعد ${this.config.retryAttempts} محاولات: ${error}`;
        }
      }
    }
  }

  /**
   * حساب التقدم
   */
  private calculateProgress(plan: ParallelExecutionPlan): ParallelExecutionProgress {
    const allResults = Array.from(this.executionResults.values());
    const completedStages = allResults.filter(r => r.status === 'completed').map(r => r.stageIndex);
    const failedStages = allResults.filter(r => r.status === 'failed').map(r => r.stageIndex);
    const runningStages = allResults.filter(r => r.status === 'running').map(r => r.stageIndex);

    const progress = (completedStages.length / allResults.length) * 100;
    const currentPhase = this.getCurrentPhase(plan, completedStages.length);
    
    const estimatedTimeRemaining = this.calculateRemainingTime(plan, completedStages.length);
    const efficiency = this.calculateEfficiency();

    return {
      currentPhase,
      totalPhases: plan.totalPhases,
      runningStages,
      completedStages,
      failedStages,
      progress,
      estimatedTimeRemaining,
      activeThreads: this.activeExecutions.size,
      efficiency
    };
  }

  /**
   * الحصول على المرحلة الحالية
   */
  private getCurrentPhase(plan: ParallelExecutionPlan, completedCount: number): number {
    let processedStages = 0;
    
    for (let i = 0; i < plan.phases.length; i++) {
      processedStages += plan.phases[i].stagesToExecute.length;
      if (processedStages > completedCount) {
        return i;
      }
    }
    
    return plan.phases.length - 1;
  }

  /**
   * حساب الوقت المتبقي
   */
  private calculateRemainingTime(plan: ParallelExecutionPlan, completedCount: number): number {
    const remainingStages = plan.phases.reduce((total, phase) => total + phase.stagesToExecute.length, 0) - completedCount;
    const averageStageTime = 60; // ثانية واحدة كمتوسط
    
    return remainingStages * averageStageTime;
  }

  /**
   * حساب الكفاءة
   */
  private calculateEfficiency(): number {
    const results = Array.from(this.executionResults.values());
    const completed = results.filter(r => r.status === 'completed');
    
    if (completed.length === 0) return 0;

    const totalTime = completed.reduce((sum, r) => sum + (r.duration || 0), 0);
    const averageTime = totalTime / completed.length;
    const expectedTime = 60000; // دقيقة واحدة كمتوقع

    return Math.max(0, Math.min(100, ((expectedTime - averageTime) / expectedTime) * 100));
  }

  /**
   * جمع النتائج النهائية
   */
  private collectResults(): StageExecutionResult[] {
    return Array.from(this.executionResults.values()).sort((a, b) => a.stageIndex - b.stageIndex);
  }

  /**
   * تقرير الكفاءة
   */
  private reportEfficiency(dependencyGraph: DependencyGraph, results: StageExecutionResult[]): void {
    const stats = this.dependencyAnalyzer.getAnalysisStats(dependencyGraph);
    const actualTime = results.reduce((sum, r) => sum + (r.duration || 0), 0);
    const expectedSequentialTime = dependencyGraph.totalEstimatedTime * 1000; // تحويل لملي ثانية

    const timeEfficiency = ((expectedSequentialTime - actualTime) / expectedSequentialTime) * 100;
    const successRate = (results.filter(r => r.status === 'completed').length / results.length) * 100;

    console.log('تقرير كفاءة المعالجة المتوازية:', {
      timeEfficiency: `${timeEfficiency.toFixed(1)}%`,
      successRate: `${successRate.toFixed(1)}%`,
      actualTime: `${(actualTime / 1000).toFixed(1)} ثانية`,
      expectedTime: `${(expectedSequentialTime / 1000).toFixed(1)} ثانية`,
      parallelizableStages: stats.parallelizableStages,
      totalStages: stats.totalStages
    });
  }

  /**
   * إيقاف التنفيذ
   */
  async stopExecution(): Promise<void> {
    console.log('إيقاف المعالجة المتوازية...');
    
    // إيقاف جميع العمليات النشطة
    for (const [stageIndex, promise] of this.activeExecutions) {
      try {
        // محاولة إلغاء العملية (في حالة دعم AbortController)
        const result = this.executionResults.get(stageIndex);
        if (result && result.status === 'running') {
          result.status = 'failed';
          result.error = 'تم إيقاف التنفيذ من قبل المستخدم';
        }
      } catch (error) {
        console.error(`خطأ في إيقاف المرحلة ${stageIndex}:`, error);
      }
    }

    this.activeExecutions.clear();
  }

  /**
   * الحصول على حالة التنفيذ الحالية
   */
  getExecutionStatus(): {
    isRunning: boolean;
    activeStages: number;
    completedStages: number;
    failedStages: number;
    efficiency: number;
  } {
    const results = Array.from(this.executionResults.values());
    const completed = results.filter(r => r.status === 'completed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const running = this.activeExecutions.size;

    return {
      isRunning: running > 0,
      activeStages: running,
      completedStages: completed,
      failedStages: failed,
      efficiency: this.calculateEfficiency()
    };
  }
}