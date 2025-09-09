/**
 * مدير الموارد الديناميكي للمعالجة المتوازية
 * Dynamic Resource Manager for Parallel Processing
 */

import { ParallelExecutionProgress, StageExecutionResult } from './types';

export interface ResourceMetrics {
  cpuUsage: number; // نسبة مئوية
  memoryUsage: number; // نسبة مئوية
  networkLatency: number; // ملي ثانية
  apiQuota: number; // الطلبات المتبقية
  concurrentRequests: number;
  maxConcurrentRequests: number;
}

export interface ResourceLimits {
  maxCpuUsage: number;
  maxMemoryUsage: number;
  maxNetworkLatency: number;
  minApiQuota: number;
  maxConcurrentRequests: number;
}

export interface ResourceOptimizationSuggestion {
  type: 'increase_concurrency' | 'decrease_concurrency' | 'pause_execution' | 'retry_failed' | 'optimize_stages';
  reason: string;
  impact: 'low' | 'medium' | 'high';
  recommendation: string;
  expectedImprovement: number; // نسبة مئوية
}

export interface ResourceAllocation {
  stageIndex: number;
  priority: number;
  resourceWeight: number;
  estimatedResourceUsage: {
    cpu: number;
    memory: number;
    network: number;
  };
}

export class DynamicResourceManager {
  private currentMetrics: ResourceMetrics;
  private resourceLimits: ResourceLimits;
  private allocationHistory: ResourceAllocation[][];
  private optimizationHistory: ResourceOptimizationSuggestion[];
  private performanceBaseline: Map<number, number>; // stage index -> baseline time

  constructor(limits?: Partial<ResourceLimits>) {
    this.resourceLimits = {
      maxCpuUsage: 80,
      maxMemoryUsage: 75,
      maxNetworkLatency: 5000,
      minApiQuota: 10,
      maxConcurrentRequests: 3,
      ...limits
    };

    this.currentMetrics = {
      cpuUsage: 0,
      memoryUsage: 0,
      networkLatency: 0,
      apiQuota: 1000,
      concurrentRequests: 0,
      maxConcurrentRequests: this.resourceLimits.maxConcurrentRequests
    };

    this.allocationHistory = [];
    this.optimizationHistory = [];
    this.performanceBaseline = new Map();
  }

  /**
   * تحديث مقاييس الموارد
   */
  updateMetrics(metrics: Partial<ResourceMetrics>): void {
    this.currentMetrics = { ...this.currentMetrics, ...metrics };
  }

  /**
   * تحليل الموارد وإعطاء توصيات
   */
  analyzeResources(progress: ParallelExecutionProgress, stageResults: StageExecutionResult[]): ResourceOptimizationSuggestion[] {
    const suggestions: ResourceOptimizationSuggestion[] = [];

    // تحليل استخدام الموارد الحالي
    const resourceStress = this.calculateResourceStress();
    
    // تحليل الأداء
    const performanceAnalysis = this.analyzePerformance(stageResults);

    // توصيات بناءً على ضغط الموارد
    if (resourceStress.cpu > 0.8) {
      suggestions.push({
        type: 'decrease_concurrency',
        reason: 'استخدام المعالج مرتفع',
        impact: 'medium',
        recommendation: 'تقليل عدد المراحل المتوازية لتخفيف الضغط على المعالج',
        expectedImprovement: 15
      });
    }

    if (resourceStress.memory > 0.8) {
      suggestions.push({
        type: 'decrease_concurrency',
        reason: 'استخدام الذاكرة مرتفع',
        impact: 'high',
        recommendation: 'تقليل التزامن لتوفير الذاكرة',
        expectedImprovement: 20
      });
    }

    if (resourceStress.network > 0.7) {
      suggestions.push({
        type: 'pause_execution',
        reason: 'زمن استجابة الشبكة مرتفع',
        impact: 'high',
        recommendation: 'إيقاف مؤقت حتى تحسن أداء الشبكة',
        expectedImprovement: 25
      });
    }

    // توصيات بناءً على أداء API
    if (this.currentMetrics.apiQuota < this.resourceLimits.minApiQuota) {
      suggestions.push({
        type: 'pause_execution',
        reason: 'حصة API منخفضة',
        impact: 'high',
        recommendation: 'انتظار تجديد حصة API',
        expectedImprovement: 0
      });
    }

    // توصيات للتحسين
    if (resourceStress.overall < 0.5 && progress.failedStages.length === 0) {
      suggestions.push({
        type: 'increase_concurrency',
        reason: 'الموارد متاحة',
        impact: 'medium',
        recommendation: 'زيادة عدد المراحل المتوازية لتحسين السرعة',
        expectedImprovement: 30
      });
    }

    // توصيات لإعادة المحاولة
    if (progress.failedStages.length > 0 && resourceStress.overall < 0.6) {
      suggestions.push({
        type: 'retry_failed',
        reason: 'وجود مراحل فاشلة والموارد متاحة',
        impact: 'medium',
        recommendation: 'إعادة محاولة المراحل الفاشلة',
        expectedImprovement: 10
      });
    }

    // حفظ التوصيات في التاريخ
    this.optimizationHistory.push(...suggestions);
    this.limitHistorySize();

    return suggestions;
  }

  /**
   * حساب ضغط الموارد
   */
  private calculateResourceStress(): {
    cpu: number;
    memory: number;
    network: number;
    api: number;
    overall: number;
  } {
    const cpu = this.currentMetrics.cpuUsage / 100;
    const memory = this.currentMetrics.memoryUsage / 100;
    const network = Math.min(1, this.currentMetrics.networkLatency / this.resourceLimits.maxNetworkLatency);
    const api = Math.max(0, 1 - (this.currentMetrics.apiQuota / 100));

    const overall = (cpu + memory + network + api) / 4;

    return { cpu, memory, network, api, overall };
  }

  /**
   * تحليل الأداء
   */
  private analyzePerformance(stageResults: StageExecutionResult[]): {
    averageTime: number;
    performanceVariation: number;
    slowStages: number[];
    fastStages: number[];
  } {
    const completedStages = stageResults.filter(r => r.status === 'completed' && r.duration);
    
    if (completedStages.length === 0) {
      return {
        averageTime: 0,
        performanceVariation: 0,
        slowStages: [],
        fastStages: []
      };
    }

    const times = completedStages.map(s => s.duration!);
    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    
    // حساب التباين
    const variance = times.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / times.length;
    const performanceVariation = Math.sqrt(variance) / averageTime;

    // تحديد المراحل البطيئة والسريعة
    const slowThreshold = averageTime * 1.5;
    const fastThreshold = averageTime * 0.7;

    const slowStages = completedStages
      .filter(s => s.duration! > slowThreshold)
      .map(s => s.stageIndex);

    const fastStages = completedStages
      .filter(s => s.duration! < fastThreshold)
      .map(s => s.stageIndex);

    return {
      averageTime,
      performanceVariation,
      slowStages,
      fastStages
    };
  }

  /**
   * تخصيص الموارد الديناميكي
   */
  allocateResources(pendingStages: number[], currentLoad: number): ResourceAllocation[] {
    const allocations: ResourceAllocation[] = [];
    const availableResourceWeight = Math.max(0, 1 - currentLoad);

    // ترتيب المراحل حسب الأولوية
    const prioritizedStages = this.prioritizeStages(pendingStages);

    let remainingWeight = availableResourceWeight;
    
    for (const stageIndex of prioritizedStages) {
      if (remainingWeight <= 0) break;

      const priority = this.calculateStagePriority(stageIndex);
      const estimatedUsage = this.estimateResourceUsage(stageIndex);
      const resourceWeight = Math.min(remainingWeight, estimatedUsage.cpu + estimatedUsage.memory + estimatedUsage.network) / 3;

      if (resourceWeight > 0.1) { // حد أدنى للتخصيص
        allocations.push({
          stageIndex,
          priority,
          resourceWeight,
          estimatedResourceUsage: estimatedUsage
        });

        remainingWeight -= resourceWeight;
      }
    }

    // حفظ في التاريخ
    this.allocationHistory.push(allocations);
    this.limitHistorySize();

    return allocations;
  }

  /**
   * ترتيب المراحل حسب الأولوية
   */
  private prioritizeStages(stageIndices: number[]): number[] {
    return stageIndices.sort((a, b) => {
      const priorityA = this.calculateStagePriority(a);
      const priorityB = this.calculateStagePriority(b);
      return priorityB - priorityA; // ترتيب تنازلي
    });
  }

  /**
   * حساب أولوية المرحلة
   */
  private calculateStagePriority(stageIndex: number): number {
    let priority = 50; // أولوية أساسية

    // المراحل الأولى لها أولوية أعلى
    if (stageIndex < 3) priority += 20;
    
    // المراحل الحرجة
    if (stageIndex === 0 || stageIndex === 1) priority += 30;

    // إذا كانت المرحلة فشلت سابقاً، قلل الأولوية قليلاً
    const baseline = this.performanceBaseline.get(stageIndex);
    if (baseline && baseline > 120000) { // أكثر من دقيقتين
      priority -= 10;
    }

    return priority;
  }

  /**
   * تقدير استخدام الموارد للمرحلة
   */
  private estimateResourceUsage(stageIndex: number): {
    cpu: number;
    memory: number;
    network: number;
  } {
    // قيم افتراضية بناءً على نوع المرحلة
    let cpu = 0.3;
    let memory = 0.2;
    let network = 0.4;

    // تعديل بناءً على التاريخ السابق
    const baseline = this.performanceBaseline.get(stageIndex);
    if (baseline) {
      if (baseline > 90000) { // أكثر من دقيقة ونصف
        cpu += 0.2;
        memory += 0.1;
      }
    }

    // المراحل المتقدمة تحتاج موارد أكثر
    if (stageIndex > 8) {
      cpu += 0.1;
      memory += 0.1;
      network += 0.1;
    }

    return {
      cpu: Math.min(1, cpu),
      memory: Math.min(1, memory),
      network: Math.min(1, network)
    };
  }

  /**
   * تحديث خط الأساس للأداء
   */
  updatePerformanceBaseline(stageIndex: number, duration: number): void {
    const existing = this.performanceBaseline.get(stageIndex);
    
    if (existing) {
      // متوسط مُحدث
      const newBaseline = (existing + duration) / 2;
      this.performanceBaseline.set(stageIndex, newBaseline);
    } else {
      this.performanceBaseline.set(stageIndex, duration);
    }
  }

  /**
   * تحسين التزامن بناءً على الموارد
   */
  optimizeConcurrency(currentConcurrency: number, progress: ParallelExecutionProgress): number {
    const resourceStress = this.calculateResourceStress();
    let optimalConcurrency = currentConcurrency;

    // تقليل التزامن إذا كانت الموارد محملة
    if (resourceStress.overall > 0.8) {
      optimalConcurrency = Math.max(1, Math.floor(currentConcurrency * 0.7));
    } else if (resourceStress.overall > 0.6) {
      optimalConcurrency = Math.max(1, Math.floor(currentConcurrency * 0.85));
    }

    // زيادة التزامن إذا كانت الموارد متاحة
    else if (resourceStress.overall < 0.4 && progress.failedStages.length === 0) {
      optimalConcurrency = Math.min(
        this.resourceLimits.maxConcurrentRequests,
        Math.ceil(currentConcurrency * 1.3)
      );
    }

    return optimalConcurrency;
  }

  /**
   * مراقبة صحة النظام
   */
  getSystemHealth(): {
    status: 'healthy' | 'warning' | 'critical';
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const stress = this.calculateResourceStress();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // تحديد المشاكل
    if (stress.cpu > 0.9) {
      issues.push('استخدام المعالج مرتفع جداً');
      recommendations.push('تقليل عدد المراحل المتوازية');
    }

    if (stress.memory > 0.9) {
      issues.push('استخدام الذاكرة مرتفع جداً');
      recommendations.push('إعادة تشغيل النظام أو تقليل الحمولة');
    }

    if (stress.network > 0.8) {
      issues.push('أداء الشبكة ضعيف');
      recommendations.push('تحقق من اتصال الإنترنت');
    }

    if (this.currentMetrics.apiQuota < 5) {
      issues.push('حصة API منخفضة جداً');
      recommendations.push('انتظار تجديد الحصة أو استخدام مفتاح آخر');
    }

    // حساب النقاط
    const score = Math.round((1 - stress.overall) * 100);
    
    // تحديد الحالة
    let status: 'healthy' | 'warning' | 'critical';
    if (score > 80) {
      status = 'healthy';
    } else if (score > 60) {
      status = 'warning';
    } else {
      status = 'critical';
    }

    return { status, score, issues, recommendations };
  }

  /**
   * تحديد الحد الأدنى لحجم التاريخ
   */
  private limitHistorySize(): void {
    const maxSize = 100;
    
    if (this.allocationHistory.length > maxSize) {
      this.allocationHistory = this.allocationHistory.slice(-maxSize);
    }
    
    if (this.optimizationHistory.length > maxSize) {
      this.optimizationHistory = this.optimizationHistory.slice(-maxSize);
    }
  }

  /**
   * الحصول على إحصائيات الموارد
   */
  getResourceStats(): {
    currentMetrics: ResourceMetrics;
    averageStress: number;
    peakUsage: {
      cpu: number;
      memory: number;
      network: number;
    };
    optimizationCount: number;
    performanceBaseline: Record<number, number>;
  } {
    const recentAllocations = this.allocationHistory.slice(-10);
    const averageStress = recentAllocations.length > 0 ? 
      recentAllocations.reduce((sum, allocations) => {
        const totalWeight = allocations.reduce((s, a) => s + a.resourceWeight, 0);
        return sum + totalWeight;
      }, 0) / recentAllocations.length : 0;

    return {
      currentMetrics: { ...this.currentMetrics },
      averageStress,
      peakUsage: {
        cpu: Math.max(...this.allocationHistory.map(a => 
          a.reduce((max, alloc) => Math.max(max, alloc.estimatedResourceUsage.cpu), 0)
        ), 0),
        memory: Math.max(...this.allocationHistory.map(a => 
          a.reduce((max, alloc) => Math.max(max, alloc.estimatedResourceUsage.memory), 0)
        ), 0),
        network: Math.max(...this.allocationHistory.map(a => 
          a.reduce((max, alloc) => Math.max(max, alloc.estimatedResourceUsage.network), 0)
        ), 0)
      },
      optimizationCount: this.optimizationHistory.length,
      performanceBaseline: Object.fromEntries(this.performanceBaseline)
    };
  }

  /**
   * إعادة تعيين المدير
   */
  reset(): void {
    this.currentMetrics = {
      cpuUsage: 0,
      memoryUsage: 0,
      networkLatency: 0,
      apiQuota: 1000,
      concurrentRequests: 0,
      maxConcurrentRequests: this.resourceLimits.maxConcurrentRequests
    };
    
    this.allocationHistory = [];
    this.optimizationHistory = [];
    this.performanceBaseline.clear();
  }
}