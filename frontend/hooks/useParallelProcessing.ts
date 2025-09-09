/**
 * خطاف React للمعالجة المتوازية الذكية
 * React Hook for Intelligent Parallel Processing
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  IntelligentParallelSystem,
  IntelligentParallelSystemConfig,
  DetailedProgress,
  StageExecutionResult,
  ParallelExecutionProgress
} from '../utils/parallel';

export interface UseParallelProcessingOptions {
  stages: string[];
  config?: Partial<IntelligentParallelSystemConfig>;
  autoStart?: boolean;
  onProgress?: (progress: DetailedProgress) => void;
  onComplete?: (results: StageExecutionResult[]) => void;
  onError?: (error: Error) => void;
}

export interface ParallelProcessingState {
  isRunning: boolean;
  isPaused: boolean;
  progress: DetailedProgress | null;
  results: StageExecutionResult[];
  error: Error | null;
  efficiency: number;
  recommendations: string[];
  systemStats: any;
}

export interface ParallelProcessingActions {
  start: (input: string, apiKey: string, additionalParams?: Record<string, any>) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<void>;
  dismissAlert: (alertId: string) => void;
  getSystemReport: () => any;
  reset: () => void;
}

/**
 * خطاف المعالجة المتوازية الذكية
 */
export function useParallelProcessing(
  options: UseParallelProcessingOptions
): [ParallelProcessingState, ParallelProcessingActions] {
  
  const {
    stages,
    config = {},
    autoStart = false,
    onProgress,
    onComplete,
    onError
  } = options;

  // الحالة
  const [state, setState] = useState<ParallelProcessingState>({
    isRunning: false,
    isPaused: false,
    progress: null,
    results: [],
    error: null,
    efficiency: 0,
    recommendations: [],
    systemStats: null
  });

  // المراجع
  const parallelSystemRef = useRef<IntelligentParallelSystem | null>(null);
  const lastInputRef = useRef<{
    input: string;
    apiKey: string;
    params: Record<string, any>;
  } | null>(null);

  // تهيئة النظام
  useEffect(() => {
    if (stages && stages.length > 0) {
      parallelSystemRef.current = new IntelligentParallelSystem(stages, config);
      
      // تحديث الإحصائيات الأولية
      setState(prev => ({
        ...prev,
        systemStats: parallelSystemRef.current?.getSystemStats()
      }));
    }

    return () => {
      if (parallelSystemRef.current) {
        parallelSystemRef.current.stop();
      }
    };
  }, [stages, JSON.stringify(config)]);

  // معالج التقدم الداخلي
  const handleProgressUpdate = useCallback((progress: DetailedProgress) => {
    setState(prev => ({
      ...prev,
      progress,
      efficiency: progress.efficiency,
      systemStats: parallelSystemRef.current?.getSystemStats()
    }));

    if (onProgress) {
      onProgress(progress);
    }
  }, [onProgress]);

  // بدء المعالجة
  const start = useCallback(async (
    input: string, 
    apiKey: string, 
    additionalParams: Record<string, any> = {}
  ) => {
    if (!parallelSystemRef.current) {
      const error = new Error('نظام المعالجة المتوازية غير مهيأ');
      setState(prev => ({ ...prev, error }));
      if (onError) onError(error);
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        isRunning: true,
        isPaused: false,
        error: null,
        results: [],
        progress: null
      }));

      // حفظ المعاملات للاستئناف لاحقاً
      lastInputRef.current = { input, apiKey, params: additionalParams };

      // إعداد callback للتقدم
      const originalConfig = { ...config };
      if (!originalConfig.processing) originalConfig.processing = {};
      
      // بدء المعالجة
      const result = await parallelSystemRef.current.startIntelligentProcessing(
        input,
        apiKey,
        additionalParams
      );

      setState(prev => ({
        ...prev,
        isRunning: false,
        results: result.results,
        efficiency: result.efficiency,
        recommendations: result.recommendations,
        progress: result.summary
      }));

      if (onComplete) {
        onComplete(result.results);
      }

    } catch (error) {
      const err = error instanceof Error ? error : new Error('خطأ غير معروف');
      setState(prev => ({
        ...prev,
        isRunning: false,
        error: err
      }));

      if (onError) {
        onError(err);
      }
    }
  }, [config, onComplete, onError]);

  // إيقاف مؤقت
  const pause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: true,
      isRunning: false
    }));
    
    // يمكن إضافة منطق إيقاف مؤقت للنظام هنا
    console.log('تم إيقاف المعالجة مؤقتاً');
  }, []);

  // استئناف
  const resume = useCallback(async () => {
    if (!lastInputRef.current) {
      console.warn('لا توجد بيانات محفوظة للاستئناف');
      return;
    }

    setState(prev => ({
      ...prev,
      isPaused: false,
      isRunning: true,
      error: null
    }));

    // إعادة بدء المعالجة من حيث توقفت
    try {
      await start(
        lastInputRef.current.input,
        lastInputRef.current.apiKey,
        lastInputRef.current.params
      );
    } catch (error) {
      console.error('خطأ في استئناف المعالجة:', error);
    }
  }, [start]);

  // إيقاف
  const stop = useCallback(async () => {
    if (parallelSystemRef.current) {
      await parallelSystemRef.current.stop();
    }

    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false
    }));

    lastInputRef.current = null;
  }, []);

  // رفض التنبيه
  const dismissAlert = useCallback((alertId: string) => {
    setState(prev => {
      if (!prev.progress) return prev;

      const updatedAlerts = prev.progress.alerts.map(alert =>
        alert.id === alertId ? { ...alert, dismissed: true } : alert
      );

      return {
        ...prev,
        progress: {
          ...prev.progress,
          alerts: updatedAlerts
        }
      };
    });
  }, []);

  // الحصول على تقرير النظام
  const getSystemReport = useCallback(() => {
    if (!parallelSystemRef.current) return null;
    return parallelSystemRef.current.exportSystemReport();
  }, []);

  // إعادة تعيين
  const reset = useCallback(() => {
    setState({
      isRunning: false,
      isPaused: false,
      progress: null,
      results: [],
      error: null,
      efficiency: 0,
      recommendations: [],
      systemStats: parallelSystemRef.current?.getSystemStats() || null
    });

    lastInputRef.current = null;
  }, []);

  // البدء التلقائي (إذا كان مفعلاً)
  useEffect(() => {
    if (autoStart && stages.length > 0 && !state.isRunning && lastInputRef.current) {
      start(
        lastInputRef.current.input,
        lastInputRef.current.apiKey,
        lastInputRef.current.params
      );
    }
  }, [autoStart, stages, state.isRunning, start]);

  // تحديث الإحصائيات دورياً
  useEffect(() => {
    if (!state.isRunning) return;

    const interval = setInterval(() => {
      if (parallelSystemRef.current) {
        setState(prev => ({
          ...prev,
          systemStats: parallelSystemRef.current!.getSystemStats()
        }));
      }
    }, 5000); // كل 5 ثوانٍ

    return () => clearInterval(interval);
  }, [state.isRunning]);

  const actions: ParallelProcessingActions = {
    start,
    pause,
    resume,
    stop,
    dismissAlert,
    getSystemReport,
    reset
  };

  return [state, actions];
}

/**
 * خطاف مبسط للمعالجة المتوازية
 */
export function useSimpleParallelProcessing(stages: string[]) {
  const [state, actions] = useParallelProcessing({ stages });

  const startProcessing = useCallback(async (
    input: string,
    apiKey: string
  ) => {
    await actions.start(input, apiKey);
  }, [actions]);

  return {
    isRunning: state.isRunning,
    progress: state.progress?.progress || 0,
    efficiency: state.efficiency,
    error: state.error,
    results: state.results,
    start: startProcessing,
    stop: actions.stop,
    reset: actions.reset
  };
}

/**
 * خطاف لمراقبة الموارد
 */
export function useResourceMonitoring() {
  const [metrics, setMetrics] = useState<{
    cpu: number;
    memory: number;
    network: number;
    health: 'healthy' | 'warning' | 'critical';
  }>({
    cpu: 0,
    memory: 0,
    network: 0,
    health: 'healthy'
  });

  useEffect(() => {
    // محاكاة مراقبة الموارد
    const interval = setInterval(() => {
      const cpu = Math.random() * 100;
      const memory = Math.random() * 100;
      const network = 50 + Math.random() * 100;

      let health: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (cpu > 80 || memory > 80) {
        health = 'critical';
      } else if (cpu > 60 || memory > 60) {
        health = 'warning';
      }

      setMetrics({ cpu, memory, network, health });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
}

/**
 * خطاف للتحليلات والإحصائيات
 */
export function useParallelAnalytics(stages: string[]) {
  const [analytics, setAnalytics] = useState<{
    totalRuns: number;
    averageEfficiency: number;
    commonFailures: string[];
    bestPerformingStages: number[];
    recommendations: string[];
  }>({
    totalRuns: 0,
    averageEfficiency: 0,
    commonFailures: [],
    bestPerformingStages: [],
    recommendations: []
  });

  // يمكن توسيع هذا لحفظ البيانات في localStorage أو قاعدة البيانات
  const recordRun = useCallback((results: StageExecutionResult[], efficiency: number) => {
    setAnalytics(prev => {
      const newTotalRuns = prev.totalRuns + 1;
      const newAverageEfficiency = ((prev.averageEfficiency * prev.totalRuns) + efficiency) / newTotalRuns;
      
      const failures = results.filter(r => r.status === 'failed').map(r => r.error || 'خطأ غير محدد');
      const newCommonFailures = [...new Set([...prev.commonFailures, ...failures])].slice(0, 5);

      const successfulStages = results
        .filter(r => r.status === 'completed' && r.duration && r.duration < 60000)
        .map(r => r.stageIndex);
      
      return {
        totalRuns: newTotalRuns,
        averageEfficiency: newAverageEfficiency,
        commonFailures: newCommonFailures,
        bestPerformingStages: successfulStages.slice(0, 3),
        recommendations: [
          `متوسط الكفاءة: ${newAverageEfficiency.toFixed(1)}%`,
          `إجمالي التشغيلات: ${newTotalRuns}`,
          newCommonFailures.length > 0 ? `أكثر الأخطاء شيوعاً: ${newCommonFailures[0]}` : 'لا توجد أخطاء شائعة'
        ]
      };
    });
  }, []);

  return { analytics, recordRun };
}