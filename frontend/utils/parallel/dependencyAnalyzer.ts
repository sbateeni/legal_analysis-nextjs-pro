/**
 * محلل الاعتماد بين المراحل
 * Stage Dependency Analyzer - Main Analysis Engine
 */

import { StageDependency, DependencyGraph, ParallelGroup } from './types';

export class StageDependencyAnalyzer {
  private stages: string[];
  private stageDefinitions: Record<string, any>;

  constructor(stages: string[], stageDefinitions?: Record<string, any>) {
    this.stages = stages;
    this.stageDefinitions = stageDefinitions || {};
  }

  /**
   * تحليل الاعتماد بين جميع المراحل
   */
  analyzeAllDependencies(): DependencyGraph {
    const stageDependencies = this.stages.map((stageName, index) => 
      this.analyzeStageDependency(index, stageName)
    );

    const parallelGroups = this.identifyParallelGroups(stageDependencies);
    const criticalPath = this.findCriticalPath(stageDependencies);
    const totalEstimatedTime = this.calculateTotalTime(stageDependencies);
    const parallelEstimatedTime = this.calculateParallelTime(parallelGroups);
    const efficiencyGain = ((totalEstimatedTime - parallelEstimatedTime) / totalEstimatedTime) * 100;

    return {
      stages: stageDependencies,
      parallelGroups,
      criticalPath,
      totalEstimatedTime,
      parallelEstimatedTime,
      efficiencyGain
    };
  }

  /**
   * تحليل اعتماد مرحلة واحدة
   */
  private analyzeStageDependency(stageIndex: number, stageName: string): StageDependency {
    const dependencies = this.findDependencies(stageIndex, stageName);
    const dependents = this.findDependents(stageIndex);
    const complexity = this.assessComplexity(stageName);
    const estimatedDuration = this.estimateDuration(stageName, complexity);
    const priority = this.assessPriority(stageName, dependencies.length);
    const canRunInParallel = dependencies.length === 0 || this.canRunConcurrently(stageIndex);

    return {
      stageIndex,
      stageName,
      dependencies,
      dependents,
      dependencyType: dependencies.length > 0 ? 'required' : 'optional',
      canRunInParallel,
      complexity,
      estimatedDuration,
      priority
    };
  }

  /**
   * البحث عن اعتماديات المرحلة
   */
  private findDependencies(stageIndex: number, stageName: string): number[] {
    const dependencies: number[] = [];
    
    // اعتماديات مباشرة محددة مسبقاً
    const predefinedDeps = this.getPredefinedDependencies(stageName);
    dependencies.push(...predefinedDeps);

    // اعتماديات ضمنية بناءً على طبيعة المرحلة
    const implicitDeps = this.findImplicitDependencies(stageIndex, stageName);
    dependencies.push(...implicitDeps);

    // إزالة التكرارات وترتيب
    return [...new Set(dependencies)].filter(dep => dep < stageIndex).sort();
  }

  /**
   * الحصول على الاعتماديات المحددة مسبقاً
   */
  private getPredefinedDependencies(stageName: string): number[] {
    const dependencyMap: Record<string, string[]> = {
      'تحديد الأطراف القانونية': ['تحليل الوقائع الأساسية'],
      'تحليل النزاع القانوني': ['تحديد الأطراف القانونية'],
      'البحث عن القوانين المنطبقة': ['تحليل النزاع القانوني'],
      'تحليل السوابق القضائية': ['البحث عن القوانين المنطبقة'],
      'تحديد الأدلة القانونية': ['تحليل السوابق القضائية'],
      'تحليل القوة القانونية': ['تحديد الأدلة القانونية'],
      'تحديد نقاط الضعف': ['تحليل القوة القانونية'],
      'صياغة الاستراتيجية القانونية': ['تحديد نقاط الضعف'],
      'تحليل المخاطر القانونية': ['صياغة الاستراتيجية القانونية'],
      'إعداد خطة المرافعة': ['تحليل المخاطر القانونية'],
      'تقييم احتمالية النجاح': ['إعداد خطة المرافعة']
    };

    const requiredStageNames = dependencyMap[stageName] || [];
    return requiredStageNames.map(name => this.stages.indexOf(name)).filter(index => index >= 0);
  }

  /**
   * البحث عن الاعتماديات الضمنية
   */
  private findImplicitDependencies(stageIndex: number, stageName: string): number[] {
    const dependencies: number[] = [];

    // القواعد الضمنية للاعتماد
    const implicitRules = [
      // المراحل التحليلية تعتمد على مراحل جمع المعلومات
      {
        condition: (name: string) => name.includes('تحليل'),
        dependsOn: (name: string) => name.includes('تحديد') || name.includes('البحث')
      },
      
      // مراحل الاستراتيجية تعتمد على مراحل التحليل
      {
        condition: (name: string) => name.includes('استراتيجية') || name.includes('خطة'),
        dependsOn: (name: string) => name.includes('تحليل')
      },

      // المراحل النهائية تعتمد على جميع المراحل السابقة
      {
        condition: (name: string) => name.includes('تقييم') || name.includes('نهائي'),
        dependsOn: () => true
      }
    ];

    for (let i = 0; i < stageIndex; i++) {
      const prevStageName = this.stages[i];
      
      for (const rule of implicitRules) {
        if (rule.condition(stageName) && rule.dependsOn(prevStageName)) {
          dependencies.push(i);
          break;
        }
      }
    }

    return dependencies;
  }

  /**
   * البحث عن المراحل التي تعتمد على هذه المرحلة
   */
  private findDependents(stageIndex: number): number[] {
    const dependents: number[] = [];
    
    for (let i = stageIndex + 1; i < this.stages.length; i++) {
      const futureDeps = this.findDependencies(i, this.stages[i]);
      if (futureDeps.includes(stageIndex)) {
        dependents.push(i);
      }
    }

    return dependents;
  }

  /**
   * تقييم تعقيد المرحلة
   */
  private assessComplexity(stageName: string): 'low' | 'medium' | 'high' {
    const complexityKeywords = {
      high: ['تحليل السوابق', 'الاستراتيجية', 'المخاطر', 'تقييم'],
      medium: ['تحليل', 'البحث', 'تحديد'],
      low: ['الوقائع', 'الأطراف']
    };

    for (const [level, keywords] of Object.entries(complexityKeywords)) {
      if (keywords.some(keyword => stageName.includes(keyword))) {
        return level as 'low' | 'medium' | 'high';
      }
    }

    return 'medium';
  }

  /**
   * تقدير مدة المرحلة
   */
  private estimateDuration(stageName: string, complexity: 'low' | 'medium' | 'high'): number {
    const baseDurations = {
      low: 30,    // 30 ثانية
      medium: 60, // دقيقة واحدة
      high: 120   // دقيقتان
    };

    let duration = baseDurations[complexity];

    // تعديلات خاصة بناءً على نوع المرحلة
    if (stageName.includes('البحث') || stageName.includes('السوابق')) {
      duration *= 1.5;
    }
    
    if (stageName.includes('استراتيجية') || stageName.includes('خطة')) {
      duration *= 1.3;
    }

    if (stageName.includes('تقييم') || stageName.includes('احتمالية')) {
      duration *= 1.4;
    }

    return Math.round(duration);
  }

  /**
   * تقييم أولوية المرحلة
   */
  private assessPriority(stageName: string, dependencyCount: number): 'low' | 'medium' | 'high' | 'critical' {
    // المراحل الأساسية لها أولوية عالية
    const criticalStages = ['تحليل الوقائع', 'تحديد الأطراف', 'النزاع القانوني'];
    const highPriorityStages = ['البحث عن القوانين', 'تحليل السوابق', 'الاستراتيجية'];

    if (criticalStages.some(stage => stageName.includes(stage))) {
      return 'critical';
    }

    if (highPriorityStages.some(stage => stageName.includes(stage))) {
      return 'high';
    }

    // المراحل التي لديها اعتماديات كثيرة لها أولوية أقل
    if (dependencyCount > 3) {
      return 'low';
    }

    return 'medium';
  }

  /**
   * تحديد ما إذا كانت المرحلة يمكن تشغيلها بالتوازي
   */
  private canRunConcurrently(stageIndex: number): boolean {
    const stageName = this.stages[stageIndex];
    
    // المراحل المستقلة يمكن تشغيلها بالتوازي
    const independentStages = [
      'تحليل الوقائع الأساسية',
      'البحث عن القوانين المنطبقة',
      'تحليل السوابق القضائية'
    ];

    // المراحل التي تتطلب نتائج متسلسلة
    const sequentialStages = [
      'تقييم احتمالية النجاح',
      'المرحلة الثالثة عشرة'
    ];

    if (independentStages.some(stage => stageName.includes(stage))) {
      return true;
    }

    if (sequentialStages.some(stage => stageName.includes(stage))) {
      return false;
    }

    // القرار الافتراضي بناءً على الاعتماديات
    const dependencies = this.findDependencies(stageIndex, stageName);
    return dependencies.length <= 1;
  }

  /**
   * تحديد مجموعات المعالجة المتوازية
   */
  private identifyParallelGroups(stageDependencies: StageDependency[]): ParallelGroup[] {
    const groups: ParallelGroup[] = [];
    let groupId = 0;

    // تجميع المراحل حسب مستوى الاعتماد
    const levelGroups = this.groupByDependencyLevel(stageDependencies);

    for (const [level, stagesInLevel] of levelGroups) {
      const parallelStages = stagesInLevel.filter(stage => stage.canRunInParallel);
      
      if (parallelStages.length > 1) {
        // إنشاء مجموعات فرعية للمراحل المتوازية
        const subGroups = this.createSubGroups(parallelStages);
        
        for (const subGroup of subGroups) {
          groups.push({
            groupId: groupId++,
            stages: subGroup.map(s => s.stageIndex),
            estimatedDuration: Math.max(...subGroup.map(s => s.estimatedDuration)),
            maxConcurrency: Math.min(subGroup.length, 3), // حد أقصى 3 مراحل متوازية
            prerequisites: this.getGroupPrerequisites(subGroup, stageDependencies)
          });
        }
      }
    }

    return groups;
  }

  /**
   * تجميع المراحل حسب مستوى الاعتماد
   */
  private groupByDependencyLevel(stageDependencies: StageDependency[]): Map<number, StageDependency[]> {
    const levelGroups = new Map<number, StageDependency[]>();

    for (const stage of stageDependencies) {
      const level = stage.dependencies.length;
      
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      
      levelGroups.get(level)!.push(stage);
    }

    return levelGroups;
  }

  /**
   * إنشاء مجموعات فرعية للمراحل المتوازية
   */
  private createSubGroups(stages: StageDependency[]): StageDependency[][] {
    const subGroups: StageDependency[][] = [];
    const processed = new Set<number>();

    for (const stage of stages) {
      if (processed.has(stage.stageIndex)) continue;

      const subGroup = [stage];
      processed.add(stage.stageIndex);

      // البحث عن مراحل يمكن تجميعها معاً
      for (const otherStage of stages) {
        if (processed.has(otherStage.stageIndex)) continue;
        
        if (this.canGroupTogether(stage, otherStage)) {
          subGroup.push(otherStage);
          processed.add(otherStage.stageIndex);
        }
      }

      if (subGroup.length > 0) {
        subGroups.push(subGroup);
      }
    }

    return subGroups;
  }

  /**
   * تحديد ما إذا كان يمكن تجميع مرحلتين معاً
   */
  private canGroupTogether(stage1: StageDependency, stage2: StageDependency): boolean {
    // نفس مستوى الأولوية
    if (stage1.priority !== stage2.priority) return false;
    
    // تعقيد مشابه
    const complexityOrder = { low: 1, medium: 2, high: 3 };
    const complexityDiff = Math.abs(complexityOrder[stage1.complexity] - complexityOrder[stage2.complexity]);
    if (complexityDiff > 1) return false;
    
    // لا تعتمد إحداهما على الأخرى
    if (stage1.dependencies.includes(stage2.stageIndex) || 
        stage2.dependencies.includes(stage1.stageIndex)) {
      return false;
    }

    return true;
  }

  /**
   * الحصول على متطلبات المجموعة
   */
  private getGroupPrerequisites(group: StageDependency[], allStages: StageDependency[]): number[] {
    const prerequisites = new Set<number>();

    for (const stage of group) {
      for (const dep of stage.dependencies) {
        prerequisites.add(dep);
      }
    }

    return [...prerequisites].sort();
  }

  /**
   * البحث عن المسار الحرج
   */
  private findCriticalPath(stageDependencies: StageDependency[]): number[] {
    const path: number[] = [];
    const visited = new Set<number>();

    // البدء من المراحل التي لا تعتمد على شيء
    const startStages = stageDependencies.filter(s => s.dependencies.length === 0);
    
    for (const startStage of startStages) {
      const currentPath = this.findLongestPath(startStage.stageIndex, stageDependencies, visited);
      if (currentPath.length > path.length) {
        path.splice(0, path.length, ...currentPath);
      }
    }

    return path;
  }

  /**
   * البحث عن أطول مسار من مرحلة معينة
   */
  private findLongestPath(stageIndex: number, stages: StageDependency[], visited: Set<number>): number[] {
    if (visited.has(stageIndex)) return [];
    
    visited.add(stageIndex);
    const stage = stages[stageIndex];
    const paths: number[][] = [[stageIndex]];

    for (const dependentIndex of stage.dependents) {
      const subPath = this.findLongestPath(dependentIndex, stages, new Set(visited));
      if (subPath.length > 0) {
        paths.push([stageIndex, ...subPath]);
      }
    }

    visited.delete(stageIndex);
    
    // إرجاع أطول مسار
    return paths.reduce((longest, current) => 
      current.length > longest.length ? current : longest, [stageIndex]
    );
  }

  /**
   * حساب الوقت الإجمالي (متسلسل)
   */
  private calculateTotalTime(stageDependencies: StageDependency[]): number {
    return stageDependencies.reduce((total, stage) => total + stage.estimatedDuration, 0);
  }

  /**
   * حساب الوقت المقدر مع المعالجة المتوازية
   */
  private calculateParallelTime(parallelGroups: ParallelGroup[]): number {
    let totalTime = 0;
    
    // حساب الوقت لكل مجموعة متوازية
    for (const group of parallelGroups) {
      totalTime += group.estimatedDuration;
    }

    return totalTime;
  }

  /**
   * تحديث إعدادات المجموعة المتوازية
   */
  updateParallelGroup(groupId: number, updates: Partial<ParallelGroup>, groups: ParallelGroup[]): ParallelGroup[] {
    return groups.map(group => 
      group.groupId === groupId ? { ...group, ...updates } : group
    );
  }

  /**
   * الحصول على إحصائيات التحليل
   */
  getAnalysisStats(dependencyGraph: DependencyGraph): {
    totalStages: number;
    parallelizableStages: number;
    serialStages: number;
    timeEfficiency: number;
    complexityDistribution: Record<string, number>;
    priorityDistribution: Record<string, number>;
  } {
    const stages = dependencyGraph.stages;
    const parallelizableStages = stages.filter(s => s.canRunInParallel).length;
    
    const complexityDistribution = stages.reduce((acc, stage) => {
      acc[stage.complexity] = (acc[stage.complexity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityDistribution = stages.reduce((acc, stage) => {
      acc[stage.priority] = (acc[stage.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalStages: stages.length,
      parallelizableStages,
      serialStages: stages.length - parallelizableStages,
      timeEfficiency: dependencyGraph.efficiencyGain,
      complexityDistribution,
      priorityDistribution
    };
  }
}