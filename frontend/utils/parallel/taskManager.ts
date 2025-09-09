/**
 * نظام إدارة المهام المتقدم للمعالجة المتوازية
 * Advanced Task Management System for Parallel Processing
 */

export interface Task {
  id: string;
  name: string;
  description: string;
  stageIndex: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  dependencies: string[]; // task IDs
  estimatedDuration: number; // in milliseconds
  actualDuration?: number;
  startTime?: number;
  endTime?: number;
  progress: number; // 0-100
  assignedWorker?: string;
  resources: {
    cpu: number;
    memory: number;
    network: number;
  };
  retryCount: number;
  maxRetries: number;
  error?: string;
  output?: any;
  metadata: Record<string, any>;
}

export interface TaskGroup {
  id: string;
  name: string;
  tasks: string[]; // task IDs
  canRunInParallel: boolean;
  maxConcurrency: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: number;
  endTime?: number;
  progress: number;
}

export interface TaskSchedule {
  phases: TaskPhase[];
  totalTasks: number;
  estimatedTotalTime: number;
  criticalPath: string[]; // task IDs
  resourceRequirements: {
    totalCpu: number;
    totalMemory: number;
    totalNetwork: number;
  };
}

export interface TaskPhase {
  id: string;
  name: string;
  tasks: string[]; // task IDs that can run in this phase
  dependencies: string[]; // phase IDs that must complete first
  estimatedDuration: number;
  maxConcurrency: number;
  canStartAfter: number; // timestamp
}

export interface TaskExecutionResult {
  taskId: string;
  success: boolean;
  output?: any;
  error?: string;
  duration: number;
  resourcesUsed: {
    cpu: number;
    memory: number;
    network: number;
  };
  retryCount: number;
  finalStatus: Task['status'];
}

export interface TaskMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  runningTasks: number;
  pendingTasks: number;
  averageTaskDuration: number;
  totalExecutionTime: number;
  efficiencyScore: number;
  resourceUtilization: {
    cpu: number;
    memory: number;
    network: number;
  };
  successRate: number;
  retryRate: number;
}

export class AdvancedTaskManager {
  private tasks: Map<string, Task>;
  private taskGroups: Map<string, TaskGroup>;
  private executionResults: Map<string, TaskExecutionResult>;
  private schedule?: TaskSchedule;
  private runningTasks: Set<string>;
  private workers: Map<string, TaskWorker>;
  private resourcePool: ResourcePool;

  constructor() {
    this.tasks = new Map();
    this.taskGroups = new Map();
    this.executionResults = new Map();
    this.runningTasks = new Set();
    this.workers = new Map();
    this.resourcePool = new ResourcePool();
  }

  /**
   * إضافة مهمة جديدة
   */
  addTask(task: Omit<Task, 'id'>): string {
    const taskId = this.generateTaskId();
    const fullTask: Task = {
      ...task,
      id: taskId,
      status: 'pending',
      progress: 0,
      retryCount: 0,
      metadata: task.metadata || {}
    };

    this.tasks.set(taskId, fullTask);
    return taskId;
  }

  /**
   * إضافة مجموعة مهام
   */
  addTaskGroup(group: Omit<TaskGroup, 'id'>): string {
    const groupId = this.generateGroupId();
    const fullGroup: TaskGroup = {
      ...group,
      id: groupId,
      status: 'pending',
      progress: 0
    };

    this.taskGroups.set(groupId, fullGroup);
    return groupId;
  }

  /**
   * إنشاء جدولة المهام
   */
  createSchedule(): TaskSchedule {
    const tasks = Array.from(this.tasks.values());
    const phases = this.createExecutionPhases(tasks);
    const criticalPath = this.findCriticalPath(tasks);
    const resourceRequirements = this.calculateResourceRequirements(tasks);

    this.schedule = {
      phases,
      totalTasks: tasks.length,
      estimatedTotalTime: phases.reduce((sum, phase) => sum + phase.estimatedDuration, 0),
      criticalPath,
      resourceRequirements
    };

    return this.schedule;
  }

  /**
   * إنشاء مراحل التنفيذ
   */
  private createExecutionPhases(tasks: Task[]): TaskPhase[] {
    const phases: TaskPhase[] = [];
    const processed = new Set<string>();
    let phaseId = 0;

    // ترتيب المهام حسب الاعتماديات
    const sortedTasks = this.topologicalSort(tasks);

    while (processed.size < tasks.length) {
      const phase = this.createNextPhase(phaseId++, sortedTasks, processed);
      if (phase.tasks.length > 0) {
        phases.push(phase);
        phase.tasks.forEach(taskId => processed.add(taskId));
      } else {
        break; // تجنب الحلقة اللانهائية
      }
    }

    return phases;
  }

  /**
   * إنشاء المرحلة التالية
   */
  private createNextPhase(phaseId: number, sortedTasks: Task[], processed: Set<string>): TaskPhase {
    const candidateTasks: string[] = [];
    const dependencies: string[] = [];

    for (const task of sortedTasks) {
      if (processed.has(task.id)) continue;

      // تحقق من اكتمال الاعتماديات
      const dependenciesMet = task.dependencies.every(depId => processed.has(depId));
      
      if (dependenciesMet) {
        candidateTasks.push(task.id);
        dependencies.push(...task.dependencies);
      }
    }

    // تحديد أقصى تزامن للمرحلة
    const maxConcurrency = this.calculateOptimalConcurrency(candidateTasks);
    const tasksToExecute = candidateTasks.slice(0, maxConcurrency);

    // حساب المدة المقدرة
    const estimatedDuration = tasksToExecute.length > 0 ?
      Math.max(...tasksToExecute.map(taskId => {
        const task = this.tasks.get(taskId);
        return task ? task.estimatedDuration : 0;
      })) : 0;

    return {
      id: `phase-${phaseId}`,
      name: `المرحلة ${phaseId + 1}`,
      tasks: tasksToExecute,
      dependencies: [...new Set(dependencies)],
      estimatedDuration,
      maxConcurrency,
      canStartAfter: Date.now()
    };
  }

  /**
   * ترتيب طوبولوجي للمهام
   */
  private topologicalSort(tasks: Task[]): Task[] {
    const sorted: Task[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (task: Task) => {
      if (visiting.has(task.id)) {
        throw new Error(`دورة في الاعتماديات عند المهمة ${task.id}`);
      }

      if (!visited.has(task.id)) {
        visiting.add(task.id);

        for (const depId of task.dependencies) {
          const depTask = this.tasks.get(depId);
          if (depTask) {
            visit(depTask);
          }
        }

        visiting.delete(task.id);
        visited.add(task.id);
        sorted.push(task);
      }
    };

    for (const task of tasks) {
      if (!visited.has(task.id)) {
        visit(task);
      }
    }

    return sorted;
  }

  /**
   * العثور على المسار الحرج
   */
  private findCriticalPath(tasks: Task[]): string[] {
    const path: string[] = [];
    const visited = new Set<string>();

    // البدء من المهام التي لا تعتمد على شيء
    const startTasks = tasks.filter(task => task.dependencies.length === 0);

    for (const startTask of startTasks) {
      const currentPath = this.findLongestPath(startTask.id, visited);
      if (currentPath.length > path.length) {
        path.splice(0, path.length, ...currentPath);
      }
    }

    return path;
  }

  /**
   * العثور على أطول مسار من مهمة معينة
   */
  private findLongestPath(taskId: string, visited: Set<string>): string[] {
    if (visited.has(taskId)) return [];

    visited.add(taskId);
    const task = this.tasks.get(taskId);
    if (!task) return [];

    const paths: string[][] = [[taskId]];

    // البحث عن المهام التي تعتمد على هذه المهمة
    const dependentTasks = Array.from(this.tasks.values())
      .filter(t => t.dependencies.includes(taskId));

    for (const dependentTask of dependentTasks) {
      const subPath = this.findLongestPath(dependentTask.id, new Set(visited));
      if (subPath.length > 0) {
        paths.push([taskId, ...subPath]);
      }
    }

    visited.delete(taskId);

    // إرجاع أطول مسار
    return paths.reduce((longest, current) =>
      current.length > longest.length ? current : longest, [taskId]
    );
  }

  /**
   * حساب متطلبات الموارد
   */
  private calculateResourceRequirements(tasks: Task[]): TaskSchedule['resourceRequirements'] {
    return tasks.reduce((total, task) => ({
      totalCpu: total.totalCpu + task.resources.cpu,
      totalMemory: total.totalMemory + task.resources.memory,
      totalNetwork: total.totalNetwork + task.resources.network
    }), { totalCpu: 0, totalMemory: 0, totalNetwork: 0 });
  }

  /**
   * حساب التزامن الأمثل
   */
  private calculateOptimalConcurrency(taskIds: string[]): number {
    const tasks = taskIds.map(id => this.tasks.get(id)).filter(Boolean) as Task[];
    const totalResourceRequirement = tasks.reduce((sum, task) => 
      sum + task.resources.cpu + task.resources.memory + task.resources.network, 0
    );

    const availableResources = this.resourcePool.getAvailableResources();
    const resourceCapacity = availableResources.cpu + availableResources.memory + availableResources.network;

    const maxByResources = Math.floor(resourceCapacity / (totalResourceRequirement / tasks.length));
    const maxByConfiguration = 5; // حد أقصى افتراضي

    return Math.min(Math.max(1, maxByResources), maxByConfiguration, tasks.length);
  }

  /**
   * تنفيذ المهام حسب الجدولة
   */
  async executeSchedule(progressCallback?: (metrics: TaskMetrics) => void): Promise<TaskExecutionResult[]> {
    if (!this.schedule) {
      this.createSchedule();
    }

    const results: TaskExecutionResult[] = [];

    for (const phase of this.schedule!.phases) {
      console.log(`بدء تنفيذ ${phase.name} مع ${phase.tasks.length} مهام`);

      // تنفيذ المهام في هذه المرحلة
      const phaseResults = await this.executePhase(phase);
      results.push(...phaseResults);

      // تحديث التقدم
      if (progressCallback) {
        const metrics = this.calculateMetrics();
        progressCallback(metrics);
      }
    }

    return results;
  }

  /**
   * تنفيذ مرحلة واحدة
   */
  private async executePhase(phase: TaskPhase): Promise<TaskExecutionResult[]> {
    const promises = phase.tasks.map(taskId => this.executeTask(taskId));
    const results = await Promise.allSettled(promises);

    return results.map((result, index) => {
      const taskId = phase.tasks[index];
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          taskId,
          success: false,
          error: result.reason?.message || 'خطأ غير معروف',
          duration: 0,
          resourcesUsed: { cpu: 0, memory: 0, network: 0 },
          retryCount: 0,
          finalStatus: 'failed' as const
        };
      }
    });
  }

  /**
   * تنفيذ مهمة واحدة
   */
  private async executeTask(taskId: string): Promise<TaskExecutionResult> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`المهمة ${taskId} غير موجودة`);
    }

    // تحديث حالة المهمة
    task.status = 'running';
    task.startTime = Date.now();
    this.runningTasks.add(taskId);

    // تخصيص worker
    const worker = this.assignWorker(task);

    try {
      // محاكاة تنفيذ المهمة
      const result = await worker.executeTask(task);

      // تسجيل النتيجة
      task.status = 'completed';
      task.endTime = Date.now();
      task.actualDuration = task.endTime - (task.startTime || 0);
      task.progress = 100;
      task.output = result.output;

      const executionResult: TaskExecutionResult = {
        taskId,
        success: true,
        output: result.output,
        duration: task.actualDuration,
        resourcesUsed: result.resourcesUsed,
        retryCount: task.retryCount,
        finalStatus: 'completed'
      };

      this.executionResults.set(taskId, executionResult);
      return executionResult;

    } catch (error) {
      // معالجة الخطأ
      task.retryCount++;
      
      if (task.retryCount < task.maxRetries) {
        // إعادة المحاولة
        console.log(`إعادة محاولة المهمة ${taskId} (المحاولة ${task.retryCount})`);
        return this.executeTask(taskId);
      } else {
        // فشل نهائي
        task.status = 'failed';
        task.endTime = Date.now();
        task.actualDuration = task.endTime - (task.startTime || 0);
        task.error = error instanceof Error ? error.message : 'خطأ غير معروف';

        const executionResult: TaskExecutionResult = {
          taskId,
          success: false,
          error: task.error,
          duration: task.actualDuration,
          resourcesUsed: { cpu: 0, memory: 0, network: 0 },
          retryCount: task.retryCount,
          finalStatus: 'failed'
        };

        this.executionResults.set(taskId, executionResult);
        return executionResult;
      }
    } finally {
      this.runningTasks.delete(taskId);
      this.releaseWorker(worker);
    }
  }

  /**
   * تخصيص worker للمهمة
   */
  private assignWorker(task: Task): TaskWorker {
    // البحث عن worker متاح
    for (const [workerId, worker] of this.workers) {
      if (worker.isAvailable() && worker.canHandle(task)) {
        worker.assign(task);
        return worker;
      }
    }

    // إنشاء worker جديد إذا لم يوجد متاح
    const workerId = `worker-${this.workers.size + 1}`;
    const worker = new TaskWorker(workerId);
    this.workers.set(workerId, worker);
    worker.assign(task);
    return worker;
  }

  /**
   * تحرير worker
   */
  private releaseWorker(worker: TaskWorker): void {
    worker.release();
  }

  /**
   * حساب المقاييس
   */
  calculateMetrics(): TaskMetrics {
    const allTasks = Array.from(this.tasks.values());
    const completedTasks = allTasks.filter(t => t.status === 'completed');
    const failedTasks = allTasks.filter(t => t.status === 'failed');
    const runningTasks = allTasks.filter(t => t.status === 'running');
    const pendingTasks = allTasks.filter(t => t.status === 'pending');

    const totalRetries = allTasks.reduce((sum, task) => sum + task.retryCount, 0);
    const totalDuration = completedTasks.reduce((sum, task) => sum + (task.actualDuration || 0), 0);
    const averageTaskDuration = completedTasks.length > 0 ? totalDuration / completedTasks.length : 0;

    const resourceUtilization = this.calculateResourceUtilization();
    const efficiencyScore = this.calculateEfficiencyScore();
    const successRate = allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;
    const retryRate = allTasks.length > 0 ? (totalRetries / allTasks.length) * 100 : 0;

    return {
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      failedTasks: failedTasks.length,
      runningTasks: runningTasks.length,
      pendingTasks: pendingTasks.length,
      averageTaskDuration,
      totalExecutionTime: totalDuration,
      efficiencyScore,
      resourceUtilization,
      successRate,
      retryRate
    };
  }

  /**
   * حساب استخدام الموارد
   */
  private calculateResourceUtilization(): TaskMetrics['resourceUtilization'] {
    const runningTasks = Array.from(this.runningTasks).map(id => this.tasks.get(id)).filter(Boolean) as Task[];
    
    const currentUsage = runningTasks.reduce((sum, task) => ({
      cpu: sum.cpu + task.resources.cpu,
      memory: sum.memory + task.resources.memory,
      network: sum.network + task.resources.network
    }), { cpu: 0, memory: 0, network: 0 });

    const maxResources = { cpu: 100, memory: 100, network: 100 }; // نسب مئوية

    return {
      cpu: (currentUsage.cpu / maxResources.cpu) * 100,
      memory: (currentUsage.memory / maxResources.memory) * 100,
      network: (currentUsage.network / maxResources.network) * 100
    };
  }

  /**
   * حساب نقاط الكفاءة
   */
  private calculateEfficiencyScore(): number {
    const allTasks = Array.from(this.tasks.values());
    const completedTasks = allTasks.filter(t => t.status === 'completed');

    if (completedTasks.length === 0) return 0;

    const estimatedTotalTime = allTasks.reduce((sum, task) => sum + task.estimatedDuration, 0);
    const actualTotalTime = completedTasks.reduce((sum, task) => sum + (task.actualDuration || 0), 0);

    if (estimatedTotalTime === 0) return 100;

    const timeEfficiency = Math.max(0, ((estimatedTotalTime - actualTotalTime) / estimatedTotalTime) * 100);
    const successRate = (completedTasks.length / allTasks.length) * 100;

    return (timeEfficiency + successRate) / 2;
  }

  /**
   * توليد معرف مهمة
   */
  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * توليد معرف مجموعة
   */
  private generateGroupId(): string {
    return `group-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * الحصول على معلومات المهمة
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * الحصول على جميع المهام
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * الحصول على الجدولة
   */
  getSchedule(): TaskSchedule | undefined {
    return this.schedule;
  }

  /**
   * إيقاف التنفيذ
   */
  async stop(): Promise<void> {
    // إيقاف جميع المهام الجارية
    for (const taskId of this.runningTasks) {
      const task = this.tasks.get(taskId);
      if (task) {
        task.status = 'cancelled';
      }
    }

    // إيقاف جميع الـ workers
    for (const worker of this.workers.values()) {
      await worker.stop();
    }

    this.runningTasks.clear();
  }
}

/**
 * فئة worker لتنفيذ المهام
 */
class TaskWorker {
  private id: string;
  private currentTask: Task | null = null;
  private isActive = false;

  constructor(id: string) {
    this.id = id;
  }

  isAvailable(): boolean {
    return !this.isActive && !this.currentTask;
  }

  canHandle(task: Task): boolean {
    // يمكن للـ worker التعامل مع أي مهمة حالياً
    // يمكن إضافة منطق أكثر تعقيداً هنا
    return true;
  }

  assign(task: Task): void {
    this.currentTask = task;
    this.isActive = true;
  }

  async executeTask(task: Task): Promise<{ output: any; resourcesUsed: Task['resources'] }> {
    // محاكاة تنفيذ المهمة
    const delay = task.estimatedDuration + (Math.random() - 0.5) * 1000; // تباين ±500ms
    await new Promise(resolve => setTimeout(resolve, Math.max(100, delay)));

    // محاكاة استخدام الموارد
    const resourcesUsed = {
      cpu: task.resources.cpu * (0.8 + Math.random() * 0.4), // 80-120% من المتوقع
      memory: task.resources.memory * (0.9 + Math.random() * 0.2), // 90-110% من المتوقع
      network: task.resources.network * (0.7 + Math.random() * 0.6) // 70-130% من المتوقع
    };

    // محاكاة نتيجة المهمة
    const output = {
      taskId: task.id,
      result: `نتيجة المهمة ${task.name}`,
      timestamp: Date.now(),
      processingDetails: {
        stageIndex: task.stageIndex,
        duration: delay,
        quality: 0.8 + Math.random() * 0.2 // جودة 80-100%
      }
    };

    return { output, resourcesUsed };
  }

  release(): void {
    this.currentTask = null;
    this.isActive = false;
  }

  async stop(): Promise<void> {
    this.isActive = false;
    this.currentTask = null;
  }
}

/**
 * مجموعة الموارد
 */
class ResourcePool {
  private maxResources = {
    cpu: 100,
    memory: 100,
    network: 100
  };

  private currentUsage = {
    cpu: 0,
    memory: 0,
    network: 0
  };

  getAvailableResources(): Task['resources'] {
    return {
      cpu: this.maxResources.cpu - this.currentUsage.cpu,
      memory: this.maxResources.memory - this.currentUsage.memory,
      network: this.maxResources.network - this.currentUsage.network
    };
  }

  allocateResources(resources: Task['resources']): boolean {
    const available = this.getAvailableResources();
    
    if (available.cpu >= resources.cpu && 
        available.memory >= resources.memory && 
        available.network >= resources.network) {
      this.currentUsage.cpu += resources.cpu;
      this.currentUsage.memory += resources.memory;
      this.currentUsage.network += resources.network;
      return true;
    }
    
    return false;
  }

  releaseResources(resources: Task['resources']): void {
    this.currentUsage.cpu = Math.max(0, this.currentUsage.cpu - resources.cpu);
    this.currentUsage.memory = Math.max(0, this.currentUsage.memory - resources.memory);
    this.currentUsage.network = Math.max(0, this.currentUsage.network - resources.network);
  }
}