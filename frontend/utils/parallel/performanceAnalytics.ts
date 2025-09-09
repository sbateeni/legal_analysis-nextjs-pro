/**
 * نظام تحليل الأداء المتقدم
 * Advanced Performance Analytics System
 */

import { StageExecutionResult, ParallelExecutionProgress } from './types';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'percentage' | 'count' | 'ratio';
  timestamp: number;
  category: 'speed' | 'efficiency' | 'reliability' | 'resource';
  stageIndex?: number;
  trend?: 'improving' | 'degrading' | 'stable';
}

export interface AnalyticsReport {
  reportId: string;
  generatedAt: number;
  timeRange: { start: number; end: number };
  summary: {
    totalStages: number;
    completedStages: number;
    failedStages: number;
    averageTime: number;
    totalTime: number;
    efficiencyScore: number;
    reliabilityScore: number;
  };
  metrics: PerformanceMetric[];
  insights: string[];
  recommendations: string[];
  trends: {
    performance: 'improving' | 'degrading' | 'stable';
    reliability: 'improving' | 'degrading' | 'stable';
    efficiency: 'improving' | 'degrading' | 'stable';
  };
}

export interface BenchmarkResult {
  benchmarkId: string;
  testName: string;
  timestamp: number;
  stages: number;
  sequentialTime: number;
  parallelTime: number;
  speedup: number;
  efficiency: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    network: number;
  };
}

export interface PerformanceTarget {
  metric: string;
  target: number;
  current: number;
  achieved: boolean;
  improvement: number;
}

export class PerformanceAnalytics {
  private metrics: PerformanceMetric[];
  private reports: AnalyticsReport[];
  private benchmarks: BenchmarkResult[];
  private targets: PerformanceTarget[];
  private sessionStartTime: number;

  constructor() {
    this.metrics = [];
    this.reports = [];
    this.benchmarks = [];
    this.targets = this.initializeDefaultTargets();
    this.sessionStartTime = Date.now();
  }

  /**
   * تهيئة الأهداف الافتراضية للأداء
   */
  private initializeDefaultTargets(): PerformanceTarget[] {
    return [
      {
        metric: 'averageStageTime',
        target: 60000, // دقيقة واحدة
        current: 0,
        achieved: false,
        improvement: 0
      },
      {
        metric: 'parallelEfficiency',
        target: 70, // 70% كفاءة
        current: 0,
        achieved: false,
        improvement: 0
      },
      {
        metric: 'successRate',
        target: 95, // 95% نجاح
        current: 0,
        achieved: false,
        improvement: 0
      },
      {
        metric: 'resourceUtilization',
        target: 80, // 80% استخدام موارد
        current: 0,
        achieved: false,
        improvement: 0
      }
    ];
  }

  /**
   * تسجيل مقياس أداء جديد
   */
  recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now()
    };

    this.metrics.push(fullMetric);
    this.calculateTrend(fullMetric);
    this.updateTargets(fullMetric);

    // الحفاظ على حد أقصى للمقاييس المحفوظة
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-5000);
    }
  }

  /**
   * حساب اتجاه المقياس
   */
  private calculateTrend(newMetric: PerformanceMetric): void {
    const recentMetrics = this.metrics
      .filter(m => 
        m.name === newMetric.name && 
        m.timestamp > Date.now() - 300000 // آخر 5 دقائق
      )
      .slice(-10); // آخر 10 قيم

    if (recentMetrics.length < 3) {
      newMetric.trend = 'stable';
      return;
    }

    const values = recentMetrics.map(m => m.value);
    const trend = this.calculateLinearTrend(values);

    if (trend > 0.1) {
      newMetric.trend = 'improving';
    } else if (trend < -0.1) {
      newMetric.trend = 'degrading';
    } else {
      newMetric.trend = 'stable';
    }
  }

  /**
   * حساب الاتجاه الخطي
   */
  private calculateLinearTrend(values: number[]): number {
    const n = values.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = values;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  /**
   * تحديث الأهداف بناءً على المقاييس الجديدة
   */
  private updateTargets(metric: PerformanceMetric): void {
    this.targets.forEach(target => {
      if (this.isMetricRelevantToTarget(metric, target)) {
        const oldCurrent = target.current;
        target.current = this.calculateCurrentTargetValue(target);
        target.achieved = target.current >= target.target;
        target.improvement = target.current - oldCurrent;
      }
    });
  }

  /**
   * التحقق من صلة المقياس بالهدف
   */
  private isMetricRelevantToTarget(metric: PerformanceMetric, target: PerformanceTarget): boolean {
    const relevanceMap: Record<string, string[]> = {
      'averageStageTime': ['stage_duration', 'execution_time'],
      'parallelEfficiency': ['efficiency_score', 'speedup_ratio'],
      'successRate': ['success_rate', 'completion_rate'],
      'resourceUtilization': ['cpu_usage', 'memory_usage', 'resource_efficiency']
    };

    return relevanceMap[target.metric]?.includes(metric.name) || false;
  }

  /**
   * حساب القيمة الحالية للهدف
   */
  private calculateCurrentTargetValue(target: PerformanceTarget): number {
    const relevantMetrics = this.getRelevantMetrics(target.metric);
    
    if (relevantMetrics.length === 0) return 0;

    // حساب المتوسط للمقاييس الحديثة
    const recentMetrics = relevantMetrics
      .filter(m => m.timestamp > Date.now() - 300000) // آخر 5 دقائق
      .slice(-20); // آخر 20 قيمة

    if (recentMetrics.length === 0) return target.current;

    return recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length;
  }

  /**
   * الحصول على المقاييس ذات الصلة
   */
  private getRelevantMetrics(targetMetric: string): PerformanceMetric[] {
    const relevanceMap: Record<string, string[]> = {
      'averageStageTime': ['stage_duration', 'execution_time'],
      'parallelEfficiency': ['efficiency_score', 'speedup_ratio'],
      'successRate': ['success_rate', 'completion_rate'],
      'resourceUtilization': ['cpu_usage', 'memory_usage', 'resource_efficiency']
    };

    const relevantNames = relevanceMap[targetMetric] || [];
    return this.metrics.filter(m => relevantNames.includes(m.name));
  }

  /**
   * تحليل نتائج التنفيذ وتسجيل المقاييس
   */
  analyzeExecution(
    results: StageExecutionResult[],
    progress: ParallelExecutionProgress,
    totalTime: number
  ): void {
    this.recordExecutionMetrics(results, progress, totalTime);
    this.recordEfficiencyMetrics(results, progress);
    this.recordReliabilityMetrics(results);
    this.recordResourceMetrics(progress);
  }

  /**
   * تسجيل مقاييس التنفيذ
   */
  private recordExecutionMetrics(
    results: StageExecutionResult[],
    progress: ParallelExecutionProgress,
    totalTime: number
  ): void {
    const completedStages = results.filter(r => r.status === 'completed');
    const averageTime = completedStages.length > 0 
      ? completedStages.reduce((sum, r) => sum + (r.duration || 0), 0) / completedStages.length
      : 0;

    this.recordMetric({
      name: 'total_execution_time',
      value: totalTime,
      unit: 'ms',
      category: 'speed'
    });

    this.recordMetric({
      name: 'average_stage_time',
      value: averageTime,
      unit: 'ms',
      category: 'speed'
    });

    this.recordMetric({
      name: 'completion_rate',
      value: (progress.completedStages.length / results.length) * 100,
      unit: 'percentage',
      category: 'reliability'
    });
  }

  /**
   * تسجيل مقاييس الكفاءة
   */
  private recordEfficiencyMetrics(
    results: StageExecutionResult[],
    progress: ParallelExecutionProgress
  ): void {
    const efficiency = progress.efficiency || 0;
    
    this.recordMetric({
      name: 'parallel_efficiency',
      value: efficiency,
      unit: 'percentage',
      category: 'efficiency'
    });

    // حساب معدل الاستفادة من التوازي
    const parallelUtilization = (progress.activeThreads / 3) * 100; // افتراض حد أقصى 3 خيوط
    
    this.recordMetric({
      name: 'parallel_utilization',
      value: parallelUtilization,
      unit: 'percentage',
      category: 'efficiency'
    });

    // حساب نسبة التسارع
    const sequentialTime = results.reduce((sum, r) => sum + (r.duration || 0), 0);
    const parallelTime = Math.max(...results.map(r => r.duration || 0));
    const speedup = sequentialTime > 0 ? sequentialTime / parallelTime : 1;

    this.recordMetric({
      name: 'speedup_ratio',
      value: speedup,
      unit: 'ratio',
      category: 'efficiency'
    });
  }

  /**
   * تسجيل مقاييس الموثوقية
   */
  private recordReliabilityMetrics(results: StageExecutionResult[]): void {
    const totalStages = results.length;
    const successfulStages = results.filter(r => r.status === 'completed').length;
    const failedStages = results.filter(r => r.status === 'failed').length;

    this.recordMetric({
      name: 'success_rate',
      value: (successfulStages / totalStages) * 100,
      unit: 'percentage',
      category: 'reliability'
    });

    this.recordMetric({
      name: 'failure_rate',
      value: (failedStages / totalStages) * 100,
      unit: 'percentage',
      category: 'reliability'
    });

    // حساب مؤشر الاستقرار
    const stageVariance = this.calculateStageTimeVariance(results);
    this.recordMetric({
      name: 'time_stability',
      value: Math.max(0, 100 - stageVariance),
      unit: 'percentage',
      category: 'reliability'
    });
  }

  /**
   * حساب تباين أوقات المراحل
   */
  private calculateStageTimeVariance(results: StageExecutionResult[]): number {
    const durations = results
      .filter(r => r.status === 'completed' && r.duration)
      .map(r => r.duration!);

    if (durations.length < 2) return 0;

    const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length;
    
    return (Math.sqrt(variance) / mean) * 100; // معامل التغير كنسبة مئوية
  }

  /**
   * تسجيل مقاييس الموارد
   */
  private recordResourceMetrics(progress: ParallelExecutionProgress): void {
    // تسجيل استخدام الخيوط النشطة
    this.recordMetric({
      name: 'active_threads',
      value: progress.activeThreads,
      unit: 'count',
      category: 'resource'
    });

    // تقدير استخدام الموارد (يحتاج لبيانات فعلية من مدير الموارد)
    this.recordMetric({
      name: 'estimated_cpu_usage',
      value: progress.activeThreads * 25, // تقدير 25% لكل خيط
      unit: 'percentage',
      category: 'resource'
    });
  }

  /**
   * إنشاء تقرير تحليل شامل
   */
  generateAnalyticsReport(timeRange?: { start: number; end: number }): AnalyticsReport {
    const reportId = `report_${Date.now()}`;
    const now = Date.now();
    const range = timeRange || { 
      start: this.sessionStartTime, 
      end: now 
    };

    const relevantMetrics = this.metrics.filter(
      m => m.timestamp >= range.start && m.timestamp <= range.end
    );

    const summary = this.generateSummary(relevantMetrics);
    const insights = this.generateInsights(relevantMetrics);
    const recommendations = this.generateRecommendations(relevantMetrics);
    const trends = this.analyzeTrends(relevantMetrics);

    const report: AnalyticsReport = {
      reportId,
      generatedAt: now,
      timeRange: range,
      summary,
      metrics: relevantMetrics,
      insights,
      recommendations,
      trends
    };

    this.reports.push(report);
    
    // الحفاظ على آخر 50 تقرير فقط
    if (this.reports.length > 50) {
      this.reports = this.reports.slice(-25);
    }

    return report;
  }

  /**
   * إنشاء ملخص التقرير
   */
  private generateSummary(metrics: PerformanceMetric[]): AnalyticsReport['summary'] {
    const executionMetrics = metrics.filter(m => m.category === 'speed');
    const reliabilityMetrics = metrics.filter(m => m.category === 'reliability');
    const efficiencyMetrics = metrics.filter(m => m.category === 'efficiency');

    const averageTime = this.calculateAverageValue(
      executionMetrics.filter(m => m.name === 'average_stage_time')
    );

    const totalTime = this.calculateSumValue(
      executionMetrics.filter(m => m.name === 'total_execution_time')
    );

    const successRate = this.calculateAverageValue(
      reliabilityMetrics.filter(m => m.name === 'success_rate')
    );

    const efficiency = this.calculateAverageValue(
      efficiencyMetrics.filter(m => m.name === 'parallel_efficiency')
    );

    return {
      totalStages: this.getLatestValue(metrics, 'total_stages') || 0,
      completedStages: this.getLatestValue(metrics, 'completed_stages') || 0,
      failedStages: this.getLatestValue(metrics, 'failed_stages') || 0,
      averageTime: Math.round(averageTime),
      totalTime: Math.round(totalTime),
      efficiencyScore: Math.round(efficiency),
      reliabilityScore: Math.round(successRate)
    };
  }

  /**
   * حساب متوسط القيم
   */
  private calculateAverageValue(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
  }

  /**
   * حساب مجموع القيم
   */
  private calculateSumValue(metrics: PerformanceMetric[]): number {
    return metrics.reduce((sum, m) => sum + m.value, 0);
  }

  /**
   * الحصول على آخر قيمة لمقياس معين
   */
  private getLatestValue(metrics: PerformanceMetric[], metricName: string): number | null {
    const relevantMetrics = metrics
      .filter(m => m.name === metricName)
      .sort((a, b) => b.timestamp - a.timestamp);

    return relevantMetrics.length > 0 ? relevantMetrics[0].value : null;
  }

  /**
   * إنشاء رؤى من البيانات
   */
  private generateInsights(metrics: PerformanceMetric[]): string[] {
    const insights: string[] = [];

    // تحليل الكفاءة
    const efficiencyMetrics = metrics.filter(m => m.name === 'parallel_efficiency');
    if (efficiencyMetrics.length > 0) {
      const avgEfficiency = this.calculateAverageValue(efficiencyMetrics);
      if (avgEfficiency > 80) {
        insights.push('🎉 النظام المتوازي يعمل بكفاءة ممتازة');
      } else if (avgEfficiency > 60) {
        insights.push('✅ النظام المتوازي يعمل بكفاءة جيدة');
      } else {
        insights.push('⚠️ كفاءة النظام المتوازي تحتاج لتحسين');
      }
    }

    // تحليل الموثوقية
    const successMetrics = metrics.filter(m => m.name === 'success_rate');
    if (successMetrics.length > 0) {
      const avgSuccess = this.calculateAverageValue(successMetrics);
      if (avgSuccess > 95) {
        insights.push('💪 معدل نجاح ممتاز في التنفيذ');
      } else if (avgSuccess > 85) {
        insights.push('👍 معدل نجاح جيد في التنفيذ');
      } else {
        insights.push('🔧 معدل النجاح يحتاج لتحسين');
      }
    }

    // تحليل الاتجاهات
    const improvingMetrics = metrics.filter(m => m.trend === 'improving');
    const degradingMetrics = metrics.filter(m => m.trend === 'degrading');

    if (improvingMetrics.length > degradingMetrics.length) {
      insights.push('📈 الأداء العام في تحسن مستمر');
    } else if (degradingMetrics.length > improvingMetrics.length) {
      insights.push('📉 هناك تراجع في بعض مؤشرات الأداء');
    }

    return insights;
  }

  /**
   * إنشاء توصيات للتحسين
   */
  private generateRecommendations(metrics: PerformanceMetric[]): string[] {
    const recommendations: string[] = [];

    // توصيات الكفاءة
    const efficiency = this.calculateAverageValue(
      metrics.filter(m => m.name === 'parallel_efficiency')
    );

    if (efficiency < 60) {
      recommendations.push('🔧 زيادة عدد المراحل المتوازية لتحسين الكفاءة');
      recommendations.push('⚡ مراجعة اعتماديات المراحل لإمكانية المزيد من التوازي');
    }

    // توصيات الموثوقية
    const successRate = this.calculateAverageValue(
      metrics.filter(m => m.name === 'success_rate')
    );

    if (successRate < 90) {
      recommendations.push('🛡️ تحسين معالجة الأخطاء وآليات الإعادة');
      recommendations.push('📊 مراجعة المراحل الفاشلة وتحليل أسباب الفشل');
    }

    // توصيات الموارد
    const avgThreads = this.calculateAverageValue(
      metrics.filter(m => m.name === 'active_threads')
    );

    if (avgThreads < 2) {
      recommendations.push('🚀 زيادة استخدام الخيوط المتوازية للاستفادة الأمثل');
    }

    // تحقق من الأهداف غير المحققة
    this.targets.forEach(target => {
      if (!target.achieved) {
        recommendations.push(
          `🎯 العمل على تحقيق هدف ${target.metric}: الحالي ${target.current.toFixed(1)} والمطلوب ${target.target}`
        );
      }
    });

    return recommendations;
  }

  /**
   * تحليل الاتجاهات العامة
   */
  private analyzeTrends(metrics: PerformanceMetric[]): AnalyticsReport['trends'] {
    const performanceMetrics = metrics.filter(m => 
      m.category === 'speed' || m.category === 'efficiency'
    );
    const reliabilityMetrics = metrics.filter(m => m.category === 'reliability');
    const efficiencyMetrics = metrics.filter(m => m.category === 'efficiency');

    return {
      performance: this.calculateOverallTrend(performanceMetrics),
      reliability: this.calculateOverallTrend(reliabilityMetrics),
      efficiency: this.calculateOverallTrend(efficiencyMetrics)
    };
  }

  /**
   * حساب الاتجاه العام
   */
  private calculateOverallTrend(metrics: PerformanceMetric[]): 'improving' | 'degrading' | 'stable' {
    if (metrics.length === 0) return 'stable';

    const trendCounts = {
      improving: metrics.filter(m => m.trend === 'improving').length,
      degrading: metrics.filter(m => m.trend === 'degrading').length,
      stable: metrics.filter(m => m.trend === 'stable').length
    };

    if (trendCounts.improving > trendCounts.degrading) {
      return 'improving';
    } else if (trendCounts.degrading > trendCounts.improving) {
      return 'degrading';
    } else {
      return 'stable';
    }
  }

  /**
   * تشغيل اختبار مرجعي
   */
  async runBenchmark(
    testName: string,
    stages: string[],
    testData: string
  ): Promise<BenchmarkResult> {
    const benchmarkId = `benchmark_${Date.now()}`;
    const startTime = Date.now();

    // محاكاة الأداء المتسلسل
    const sequentialTime = stages.length * 60000; // دقيقة لكل مرحلة

    // محاكاة الأداء المتوازي (افتراض 3 مراحل متوازية)
    const parallelTime = Math.ceil(stages.length / 3) * 60000;

    const speedup = sequentialTime / parallelTime;
    const efficiency = speedup / 3; // 3 خيوط متوازية

    const result: BenchmarkResult = {
      benchmarkId,
      testName,
      timestamp: startTime,
      stages: stages.length,
      sequentialTime,
      parallelTime,
      speedup,
      efficiency,
      resourceUsage: {
        cpu: 60, // تقدير
        memory: 40,
        network: 30
      }
    };

    this.benchmarks.push(result);

    // تسجيل نتائج الاختبار كمقاييس
    this.recordMetric({
      name: 'benchmark_speedup',
      value: speedup,
      unit: 'ratio',
      category: 'efficiency'
    });

    this.recordMetric({
      name: 'benchmark_efficiency',
      value: efficiency * 100,
      unit: 'percentage',
      category: 'efficiency'
    });

    return result;
  }

  /**
   * الحصول على الأهداف الحالية
   */
  getPerformanceTargets(): PerformanceTarget[] {
    return [...this.targets];
  }

  /**
   * تحديث هدف معين
   */
  updateTarget(metricName: string, newTarget: number): void {
    const target = this.targets.find(t => t.metric === metricName);
    if (target) {
      target.target = newTarget;
      target.achieved = target.current >= newTarget;
    }
  }

  /**
   * الحصول على ملخص الأداء السريع
   */
  getQuickSummary(): {
    overallScore: number;
    efficiency: number;
    reliability: number;
    speed: number;
    recommendations: string[];
  } {
    const recentMetrics = this.metrics.filter(
      m => m.timestamp > Date.now() - 300000 // آخر 5 دقائق
    );

    const efficiency = this.calculateAverageValue(
      recentMetrics.filter(m => m.name === 'parallel_efficiency')
    );

    const reliability = this.calculateAverageValue(
      recentMetrics.filter(m => m.name === 'success_rate')
    );

    const speed = this.calculateSpeedScore(recentMetrics);
    const overallScore = (efficiency + reliability + speed) / 3;

    const recommendations = this.generateRecommendations(recentMetrics).slice(0, 3);

    return {
      overallScore: Math.round(overallScore),
      efficiency: Math.round(efficiency),
      reliability: Math.round(reliability),
      speed: Math.round(speed),
      recommendations
    };
  }

  /**
   * حساب نقاط السرعة
   */
  private calculateSpeedScore(metrics: PerformanceMetric[]): number {
    const avgTime = this.calculateAverageValue(
      metrics.filter(m => m.name === 'average_stage_time')
    );

    if (avgTime === 0) return 100;

    // تحويل الوقت إلى نقاط (60 ثانية = 100 نقطة، 120 ثانية = 50 نقطة)
    const targetTime = 60000; // دقيقة واحدة
    const score = Math.max(0, Math.min(100, ((2 * targetTime - avgTime) / targetTime) * 100));
    
    return score;
  }

  /**
   * تصدير جميع البيانات
   */
  exportAllData(): {
    metrics: PerformanceMetric[];
    reports: AnalyticsReport[];
    benchmarks: BenchmarkResult[];
    targets: PerformanceTarget[];
    summary: any;
  } {
    return {
      metrics: [...this.metrics],
      reports: [...this.reports],
      benchmarks: [...this.benchmarks],
      targets: [...this.targets],
      summary: this.getQuickSummary()
    };
  }

  /**
   * مسح جميع البيانات
   */
  clearAllData(): void {
    this.metrics = [];
    this.reports = [];
    this.benchmarks = [];
    this.sessionStartTime = Date.now();
  }
}