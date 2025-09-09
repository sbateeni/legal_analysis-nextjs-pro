/**
 * محلل الاعتماد بين المراحل
 * Stage Dependency Analyzer - Core Types and Interfaces
 */

export interface StageDependency {
  stageIndex: number;
  stageName: string;
  dependencies: number[]; // فهارس المراحل التي تعتمد عليها
  dependents: number[]; // فهارس المراحل التي تعتمد عليها
  dependencyType: 'required' | 'optional' | 'recommended';
  canRunInParallel: boolean;
  parallelGroup?: number; // مجموعة المعالجة المتوازية
  complexity: 'low' | 'medium' | 'high';
  estimatedDuration: number; // بالثواني
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ParallelGroup {
  groupId: number;
  stages: number[]; // فهارس المراحل في هذه المجموعة
  estimatedDuration: number;
  maxConcurrency: number; // أقصى عدد مراحل يمكن تشغيلها معاً
  prerequisites: number[]; // المراحل التي يجب إكمالها قبل هذه المجموعة
}

export interface DependencyGraph {
  stages: StageDependency[];
  parallelGroups: ParallelGroup[];
  criticalPath: number[]; // المسار الحرج (أطول مسار)
  totalEstimatedTime: number;
  parallelEstimatedTime: number; // الوقت المقدر مع المعالجة المتوازية
  efficiencyGain: number; // نسبة التحسن في الوقت
}

export interface ParallelExecutionPlan {
  phases: ParallelExecutionPhase[];
  totalPhases: number;
  estimatedTotalTime: number;
  maxConcurrency: number;
}

export interface ParallelExecutionPhase {
  phaseId: number;
  stagesToExecute: number[];
  estimatedDuration: number;
  canStartAfter: number[]; // فهارس المراحل التي يجب إكمالها أولاً
  priority: 'low' | 'medium' | 'high';
}

export interface StageExecutionResult {
  stageIndex: number;
  stageName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: number;
  endTime?: number;
  duration?: number;
  output?: string;
  error?: string;
  parallelGroup?: number;
  phaseId?: number;
}

export interface ParallelExecutionProgress {
  currentPhase: number;
  totalPhases: number;
  runningStages: number[];
  completedStages: number[];
  failedStages: number[];
  progress: number; // نسبة مئوية
  estimatedTimeRemaining: number;
  activeThreads: number;
  efficiency: number; // مدى كفاءة المعالجة المتوازية
}