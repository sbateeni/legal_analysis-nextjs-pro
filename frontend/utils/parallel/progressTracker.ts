/**
 * متتبع التقدم والمراقب المتقدم للمعالجة المتوازية
 * Advanced Progress Tracker and Monitor for Parallel Processing
 */

import { ParallelExecutionProgress, StageExecutionResult } from './types';

export interface ProgressMetrics {
  startTime: number;
  currentTime: number;
  elapsedTime: number;
  estimatedTotalTime: number;
  remainingTime: number;
  averageStageTime: number;
  efficiency: number;
  throughput: number; // مراحل لكل دقيقة
  successRate: number;
}

export interface DetailedProgress extends ParallelExecutionProgress {
  metrics: ProgressMetrics;
  stageDetails: Map<number, StageProgressDetail>;
  trends: ProgressTrends;
  alerts: ProgressAlert[];
}

export interface StageProgressDetail {
  stageIndex: number;
  stageName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: number;
  estimatedEndTime?: number;
  actualEndTime?: number;
  progressPercentage: number;
  subTasks: SubTaskProgress[];
  alerts: string[];
}

export interface SubTaskProgress {
  taskName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  estimatedDuration: number;
}

export interface ProgressTrends {
  stageCompletionRate: number[]; // معدل إكمال المراحل في الوقت
  averageStageTime: number[]; // متوسط وقت المراحل
  efficiencyTrend: number[]; // اتجاه الكفاءة
  errorRate: number[]; // معدل الأخطاء
  lastUpdated: number;
}

export interface ProgressAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  stageIndex?: number;
  timestamp: number;
  dismissed: boolean;
}

export class AdvancedProgressTracker {
  private startTime: number;
  private stageDetails: Map<number, StageProgressDetail>;
  private progressHistory: ParallelExecutionProgress[];
  private metricsHistory: ProgressMetrics[];
  private alerts: ProgressAlert[];
  private trends: ProgressTrends;
  private totalStages: number;

  constructor(totalStages: number) {
    this.totalStages = totalStages;
    this.startTime = Date.now();
    this.stageDetails = new Map();
    this.progressHistory = [];
    this.metricsHistory = [];
    this.alerts = [];
    this.trends = {
      stageCompletionRate: [],
      averageStageTime: [],
      efficiencyTrend: [],
      errorRate: [],
      lastUpdated: Date.now()
    };

    this.initializeStageDetails();
  }

  /**
   * تهيئة تفاصيل المراحل
   */
  private initializeStageDetails(): void {
    for (let i = 0; i < this.totalStages; i++) {
      this.stageDetails.set(i, {
        stageIndex: i,
        stageName: `المرحلة ${i + 1}`,
        status: 'pending',
        progressPercentage: 0,
        subTasks: [],
        alerts: []
      });
    }
  }

  /**
   * تحديث التقدم العام
   */
  updateProgress(progress: ParallelExecutionProgress): DetailedProgress {
    // تحديث تفاصيل المراحل
    this.updateStageStatuses(progress);

    // حساب المقاييس
    const metrics = this.calculateMetrics(progress);

    // تحديث الاتجاهات
    this.updateTrends(progress, metrics);

    // إنشاء التنبيهات
    this.generateAlerts(progress, metrics);

    // حفظ في التاريخ
    this.progressHistory.push(progress);
    this.metricsHistory.push(metrics);

    // الحفاظ على حجم محدود للتاريخ
    if (this.progressHistory.length > 100) {
      this.progressHistory.shift();
      this.metricsHistory.shift();
    }

    return {
      ...progress,
      metrics,
      stageDetails: this.stageDetails,
      trends: this.trends,
      alerts: this.alerts.filter(alert => !alert.dismissed)
    };
  }

  /**
   * تحديث حالات المراحل
   */
  private updateStageStatuses(progress: ParallelExecutionProgress): void {
    const currentTime = Date.now();

    // تحديث المراحل الجارية
    for (const stageIndex of progress.runningStages) {
      const detail = this.stageDetails.get(stageIndex);
      if (detail) {
        detail.status = 'running';
        if (!detail.startTime) {
          detail.startTime = currentTime;
        }
        detail.progressPercentage = this.estimateStageProgress(stageIndex, currentTime);
      }
    }

    // تحديث المراحل المكتملة
    for (const stageIndex of progress.completedStages) {
      const detail = this.stageDetails.get(stageIndex);
      if (detail && detail.status !== 'completed') {
        detail.status = 'completed';
        detail.actualEndTime = currentTime;
        detail.progressPercentage = 100;
      }
    }

    // تحديث المراحل الفاشلة
    for (const stageIndex of progress.failedStages) {
      const detail = this.stageDetails.get(stageIndex);
      if (detail) {
        detail.status = 'failed';
        detail.actualEndTime = currentTime;
      }
    }
  }

  /**
   * تقدير تقدم المرحلة
   */
  private estimateStageProgress(stageIndex: number, currentTime: number): number {
    const detail = this.stageDetails.get(stageIndex);
    if (!detail || !detail.startTime) return 0;

    const elapsedTime = currentTime - detail.startTime;
    const estimatedDuration = detail.estimatedEndTime ? 
      detail.estimatedEndTime - detail.startTime : 60000; // افتراضي دقيقة واحدة

    const progress = Math.min(95, (elapsedTime / estimatedDuration) * 100);
    return Math.round(progress);
  }

  /**
   * حساب المقاييس التفصيلية
   */
  private calculateMetrics(progress: ParallelExecutionProgress): ProgressMetrics {
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.startTime;
    
    const completedStages = progress.completedStages.length;
    const failedStages = progress.failedStages.length;
    const totalProcessedStages = completedStages + failedStages;
    
    const averageStageTime = totalProcessedStages > 0 ? 
      elapsedTime / totalProcessedStages : 0;

    const estimatedTotalTime = this.totalStages * averageStageTime;
    const remainingTime = estimatedTotalTime - elapsedTime;

    const throughput = elapsedTime > 0 ? 
      (totalProcessedStages / (elapsedTime / 60000)) : 0; // مراحل لكل دقيقة

    const successRate = totalProcessedStages > 0 ? 
      (completedStages / totalProcessedStages) * 100 : 0;

    const efficiency = this.calculateEfficiency(progress, elapsedTime);

    return {
      startTime: this.startTime,
      currentTime,
      elapsedTime,
      estimatedTotalTime,
      remainingTime: Math.max(0, remainingTime),
      averageStageTime,
      efficiency,
      throughput,
      successRate
    };
  }

  /**
   * حساب الكفاءة
   */
  private calculateEfficiency(progress: ParallelExecutionProgress, elapsedTime: number): number {
    const idealParallelTime = (this.totalStages / 3) * 60000; // افتراض 3 مراحل متوازية، دقيقة لكل مرحلة
    const actualProgress = progress.progress / 100;
    const expectedProgress = Math.min(1, elapsedTime / idealParallelTime);
    
    return expectedProgress > 0 ? Math.min(100, (actualProgress / expectedProgress) * 100) : 0;
  }

  /**
   * تحديث الاتجاهات
   */
  private updateTrends(progress: ParallelExecutionProgress, metrics: ProgressMetrics): void {
    const maxHistoryLength = 20;

    // معدل إكمال المراحل
    this.trends.stageCompletionRate.push(progress.completedStages.length);
    if (this.trends.stageCompletionRate.length > maxHistoryLength) {
      this.trends.stageCompletionRate.shift();
    }

    // متوسط وقت المراحل
    this.trends.averageStageTime.push(metrics.averageStageTime);
    if (this.trends.averageStageTime.length > maxHistoryLength) {
      this.trends.averageStageTime.shift();
    }

    // اتجاه الكفاءة
    this.trends.efficiencyTrend.push(metrics.efficiency);
    if (this.trends.efficiencyTrend.length > maxHistoryLength) {
      this.trends.efficiencyTrend.shift();
    }

    // معدل الأخطاء
    const errorRate = (progress.failedStages.length / (progress.completedStages.length + progress.failedStages.length)) * 100;
    this.trends.errorRate.push(isNaN(errorRate) ? 0 : errorRate);
    if (this.trends.errorRate.length > maxHistoryLength) {
      this.trends.errorRate.shift();
    }

    this.trends.lastUpdated = Date.now();
  }

  /**
   * إنشاء التنبيهات
   */
  private generateAlerts(progress: ParallelExecutionProgress, metrics: ProgressMetrics): void {
    const currentTime = Date.now();

    // تنبيه انخفاض الكفاءة
    if (metrics.efficiency < 50 && progress.completedStages.length > 2) {
      this.addAlert({
        id: `efficiency-low-${currentTime}`,
        type: 'warning',
        title: 'كفاءة منخفضة',
        message: `كفاءة المعالجة انخفضت إلى ${metrics.efficiency.toFixed(1)}%`,
        timestamp: currentTime,
        dismissed: false
      });
    }

    // تنبيه معدل أخطاء مرتفع
    if (metrics.successRate < 80 && progress.failedStages.length > 1) {
      this.addAlert({
        id: `error-rate-high-${currentTime}`,
        type: 'error',
        title: 'معدل أخطاء مرتفع',
        message: `معدل النجاح انخفض إلى ${metrics.successRate.toFixed(1)}%`,
        timestamp: currentTime,
        dismissed: false
      });
    }

    // تنبيه تجاوز الوقت المقدر
    if (metrics.remainingTime < 0 && progress.progress < 90) {
      this.addAlert({
        id: `time-overrun-${currentTime}`,
        type: 'warning',
        title: 'تجاوز الوقت المقدر',
        message: 'العملية تستغرق وقتاً أكثر من المتوقع',
        timestamp: currentTime,
        dismissed: false
      });
    }

    // تنبيه اكتمال المراحل
    if (progress.completedStages.length > 0 && progress.completedStages.length % 3 === 0) {
      this.addAlert({
        id: `milestone-${progress.completedStages.length}`,
        type: 'success',
        title: 'إنجاز مرحلة',
        message: `تم إكمال ${progress.completedStages.length} مراحل بنجاح`,
        timestamp: currentTime,
        dismissed: false
      });
    }
  }

  /**
   * إضافة تنبيه
   */
  private addAlert(alert: ProgressAlert): void {
    // تجنب التنبيهات المكررة
    const exists = this.alerts.some(existing => 
      existing.type === alert.type && 
      existing.title === alert.title && 
      !existing.dismissed &&
      (Date.now() - existing.timestamp) < 30000 // خلال 30 ثانية
    );

    if (!exists) {
      this.alerts.push(alert);
      
      // الحفاظ على حد أقصى للتنبيهات
      if (this.alerts.length > 50) {
        this.alerts.shift();
      }
    }
  }

  /**
   * رفض تنبيه
   */
  dismissAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.dismissed = true;
    }
  }

  /**
   * تحديث تفاصيل مرحلة
   */
  updateStageDetail(stageIndex: number, updates: Partial<StageProgressDetail>): void {
    const existing = this.stageDetails.get(stageIndex);
    if (existing) {
      this.stageDetails.set(stageIndex, { ...existing, ...updates });
    }
  }

  /**
   * إضافة مهمة فرعية لمرحلة
   */
  addSubTask(stageIndex: number, subTask: SubTaskProgress): void {
    const detail = this.stageDetails.get(stageIndex);
    if (detail) {
      detail.subTasks.push(subTask);
    }
  }

  /**
   * تحديث مهمة فرعية
   */
  updateSubTask(stageIndex: number, taskName: string, updates: Partial<SubTaskProgress>): void {
    const detail = this.stageDetails.get(stageIndex);
    if (detail) {
      const subTask = detail.subTasks.find(task => task.taskName === taskName);
      if (subTask) {
        Object.assign(subTask, updates);
      }
    }
  }

  /**
   * الحصول على ملخص التقدم
   */
  getProgressSummary(): {
    overallProgress: number;
    efficiency: number;
    eta: string;
    health: 'excellent' | 'good' | 'warning' | 'critical';
    activeAlerts: number;
  } {
    const latestMetrics = this.metricsHistory[this.metricsHistory.length - 1];
    const latestProgress = this.progressHistory[this.progressHistory.length - 1];
    
    if (!latestMetrics || !latestProgress) {
      return {
        overallProgress: 0,
        efficiency: 0,
        eta: 'غير محدد',
        health: 'good',
        activeAlerts: 0
      };
    }

    const health = this.calculateHealth(latestMetrics, latestProgress);
    const eta = this.formatETA(latestMetrics.remainingTime);
    const activeAlerts = this.alerts.filter(alert => !alert.dismissed).length;

    return {
      overallProgress: latestProgress.progress,
      efficiency: latestMetrics.efficiency,
      eta,
      health,
      activeAlerts
    };
  }

  /**
   * حساب صحة النظام
   */
  private calculateHealth(metrics: ProgressMetrics, progress: ParallelExecutionProgress): 'excellent' | 'good' | 'warning' | 'critical' {
    const efficiency = metrics.efficiency;
    const successRate = metrics.successRate;
    const hasActiveAlerts = this.alerts.some(alert => !alert.dismissed && alert.type === 'error');

    if (hasActiveAlerts || successRate < 70) {
      return 'critical';
    }
    
    if (efficiency < 60 || successRate < 85) {
      return 'warning';
    }
    
    if (efficiency > 80 && successRate > 95) {
      return 'excellent';
    }
    
    return 'good';
  }

  /**
   * تنسيق الوقت المتبقي
   */
  private formatETA(remainingTime: number): string {
    if (remainingTime <= 0) return 'منتهي';
    
    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes} دقيقة ${seconds} ثانية`;
    }
    
    return `${seconds} ثانية`;
  }

  /**
   * تصدير بيانات التقدم
   */
  exportProgressData(): {
    summary: any;
    history: ParallelExecutionProgress[];
    metrics: ProgressMetrics[];
    trends: ProgressTrends;
    alerts: ProgressAlert[];
  } {
    return {
      summary: this.getProgressSummary(),
      history: [...this.progressHistory],
      metrics: [...this.metricsHistory],
      trends: { ...this.trends },
      alerts: [...this.alerts]
    };
  }

  /**
   * إعادة تعيين المتتبع
   */
  reset(): void {
    this.startTime = Date.now();
    this.stageDetails.clear();
    this.progressHistory = [];
    this.metricsHistory = [];
    this.alerts = [];
    this.trends = {
      stageCompletionRate: [],
      averageStageTime: [],
      efficiencyTrend: [],
      errorRate: [],
      lastUpdated: Date.now()
    };
    this.initializeStageDetails();
  }
}