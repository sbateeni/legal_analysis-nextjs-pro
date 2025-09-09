/**
 * مدير السياق المتقدم - المدير الرئيسي
 * Advanced Context Manager - Main Manager Class
 */

import { 
  ContextualData, 
  StageEvolution, 
  ContextConnection, 
  StageMemoryItem, 
  CriticalFinding, 
  RiskEvolutionItem,
  DecisionPoint
} from './types';

export class AdvancedContextManager {
  private contextData: ContextualData;
  private static instance: AdvancedContextManager;

  private constructor() {
    this.contextData = this.initializeContext();
  }

  public static getInstance(): AdvancedContextManager {
    if (!AdvancedContextManager.instance) {
      AdvancedContextManager.instance = new AdvancedContextManager();
    }
    return AdvancedContextManager.instance;
  }

  /**
   * تهيئة السياق الأولي
   */
  private initializeContext(): ContextualData {
    return {
      caseBasics: {
        title: '',
        type: 'عام',
        parties: [],
        jurisdiction: 'فلسطين',
        dateCreated: new Date().toISOString(),
        priority: 'medium'
      },
      evolutionAnalysis: {
        stageProgression: [],
        keyInsights: [],
        emergingPatterns: [],
        contextualConnections: []
      },
      stageMemory: {
        completedStages: [],
        keyDecisions: [],
        criticalFindings: [],
        riskEvolution: []
      },
      predictions: {
        nextStageRequirements: [],
        anticipatedChallenges: [],
        recommendedPreparations: [],
        successProbabilityTrend: []
      },
      qualityMetrics: {
        consistencyScore: 0.5,
        completenessScore: 0.5,
        relevanceScore: 0.5,
        innovationScore: 0.5
      }
    };
  }

  /**
   * تحديث السياق عند اكتمال مرحلة
   */
  async updateContextFromStageCompletion(
    stageIndex: number,
    stageName: string,
    stageResult: any,
    analysisTime: number
  ): Promise<void> {
    
    // تحليل المحتوى واستخراج النقاط الرئيسية
    const analysis = await this.analyzeStageContent(stageResult.output);

    // إضافة للذاكرة
    const memoryItem: StageMemoryItem = {
      stageIndex,
      stageName,
      summary: analysis.summary,
      keyPoints: analysis.keyPoints,
      decisions: analysis.decisions,
      evidenceCollected: analysis.evidence,
      qualityScore: this.calculateStageQuality(analysis),
      duration: analysisTime,
      timestamp: new Date().toISOString()
    };

    this.contextData.stageMemory.completedStages.push(memoryItem);

    // تحديث التطور التدريجي
    await this.updateEvolutionAnalysis(stageIndex, stageName, analysis);

    // تحديث النقاط الحرجة
    await this.updateCriticalFindings(stageIndex, analysis);

    // تحديث التنبؤات
    await this.updatePredictions(stageIndex, analysis);

    // تحديث مقاييس الجودة
    await this.updateQualityMetrics();

    // تحديث المخاطر
    await this.updateRiskEvolution(stageIndex, analysis);
  }

  /**
   * الحصول على سياق المرحلة التالية
   */
  getContextForNextStage(nextStageIndex: number): {
    relevantFindings: CriticalFinding[];
    suggestedFocus: string[];
    riskConsiderations: string[];
    preparationSteps: string[];
    qualityExpectations: string[];
  } {
    const relevantFindings = this.contextData.stageMemory.criticalFindings
      .filter(finding => finding.importance === 'high' || finding.importance === 'critical')
      .slice(-5);

    const suggestedFocus = this.contextData.predictions.nextStageRequirements.slice(-3);
    
    const riskConsiderations = this.contextData.stageMemory.riskEvolution
      .filter(risk => risk.trend === 'increasing')
      .map(risk => risk.riskType)
      .slice(-3);

    const preparationSteps = this.contextData.predictions.recommendedPreparations.slice(-3);

    const qualityExpectations = [
      `هدف الجودة: ${(this.contextData.qualityMetrics.completenessScore * 100).toFixed(0)}%+`,
      `الحفاظ على الاتساق: ${(this.contextData.qualityMetrics.consistencyScore * 100).toFixed(0)}%+`,
      `تحسين الصلة: ${(this.contextData.qualityMetrics.relevanceScore * 100).toFixed(0)}%+`
    ];

    return {
      relevantFindings,
      suggestedFocus,
      riskConsiderations,
      preparationSteps,
      qualityExpectations
    };
  }

  /**
   * الحصول على تقرير حالة السياق
   */
  getContextReport(): {
    summary: string;
    stagesCompleted: number;
    averageQuality: number;
    keyPatterns: string[];
    majorRisks: string[];
    successTrend: 'improving' | 'declining' | 'stable';
    recommendations: string[];
  } {
    const stagesCompleted = this.contextData.stageMemory.completedStages.length;
    const averageQuality = stagesCompleted > 0 ? 
      this.contextData.stageMemory.completedStages.reduce((sum, stage) => sum + stage.qualityScore, 0) / stagesCompleted : 0;

    const keyPatterns = this.contextData.evolutionAnalysis.emergingPatterns.slice(-3);
    
    const majorRisks = this.contextData.stageMemory.riskEvolution
      .filter(risk => risk.currentLevel > 0.6)
      .map(risk => risk.riskType)
      .slice(-3);

    const successTrend = this.calculateSuccessTrend();

    const recommendations = this.generateRecommendations();

    return {
      summary: this.generateContextSummary(),
      stagesCompleted,
      averageQuality,
      keyPatterns,
      majorRisks,
      successTrend,
      recommendations
    };
  }

  /**
   * إعادة تعيين السياق
   */
  resetContext(): void {
    this.contextData = this.initializeContext();
  }

  /**
   * تصدير بيانات السياق
   */
  exportContextData(): ContextualData {
    return JSON.parse(JSON.stringify(this.contextData));
  }

  /**
   * استيراد بيانات السياق
   */
  importContextData(data: ContextualData): void {
    this.contextData = data;
  }

  // ===== الدوال المساعدة الداخلية =====

  private async analyzeStageContent(output: string): Promise<{
    summary: string;
    keyPoints: string[];
    decisions: string[];
    evidence: string[];
    risks: string[];
    opportunities: string[];
    requirements: string[];
  }> {
    
    const lines = output.split('\n').filter(line => line.trim());
    
    const analysis: {
      summary: string;
      keyPoints: string[];
      decisions: string[];
      evidence: string[];
      risks: string[];
      opportunities: string[];
      requirements: string[];
    } = {
      summary: '',
      keyPoints: [] as string[],
      decisions: [] as string[],
      evidence: [] as string[],
      risks: [] as string[],
      opportunities: [] as string[],
      requirements: [] as string[]
    };

    // استخراج الملخص
    analysis.summary = lines.length > 0 ? 
      lines[0].substring(0, 200) + (lines[0].length > 200 ? '...' : '') : 
      output.substring(0, 200) + (output.length > 200 ? '...' : '');

    // استخراج النقاط الرئيسية
    const keyPointPatterns = [
      /^[\-\*\•]\s*(.+)/,
      /^(\d+[\.\)]\s*.+)/,
      /^(أولاً|ثانياً|ثالثاً|رابعاً|خامساً).*/,
      /^(التوصية|النتيجة|الخلاصة).*/i
    ];

    lines.forEach(line => {
      keyPointPatterns.forEach(pattern => {
        const match = line.match(pattern);
        if (match && match[1]) {
          analysis.keyPoints.push(match[1].trim());
        }
      });
    });

    // استخراج القرارات
    const decisionKeywords = ['قرار', 'اختيار', 'توصية', 'نصح', 'اقتراح'];
    analysis.decisions = lines.filter(line => 
      decisionKeywords.some(keyword => line.includes(keyword))
    ).slice(0, 5);

    // استخراج الأدلة
    const evidenceKeywords = ['دليل', 'برهان', 'إثبات', 'وثيقة', 'مستند'];
    analysis.evidence = lines.filter(line => 
      evidenceKeywords.some(keyword => line.includes(keyword))
    ).slice(0, 5);

    // استخراج المخاطر
    const riskKeywords = ['خطر', 'مخاطرة', 'تهديد', 'عقبة', 'مشكلة'];
    analysis.risks = lines.filter(line => 
      riskKeywords.some(keyword => line.includes(keyword))
    ).slice(0, 5);

    // استخراج الفرص
    const opportunityKeywords = ['فرصة', 'إمكانية', 'ميزة', 'نقطة قوة'];
    analysis.opportunities = lines.filter(line => 
      opportunityKeywords.some(keyword => line.includes(keyword))
    ).slice(0, 5);

    // استخراج المتطلبات
    const requirementKeywords = ['يتطلب', 'يحتاج', 'ضروري', 'لازم', 'مطلوب'];
    analysis.requirements = lines.filter(line => 
      requirementKeywords.some(keyword => line.includes(keyword))
    ).slice(0, 5);

    return analysis;
  }

  private calculateStageQuality(analysis: any): number {
    let quality = 0.5;
    quality += Math.min(0.2, analysis.keyPoints.length * 0.02);
    quality += Math.min(0.2, analysis.evidence.length * 0.04);
    quality += Math.min(0.1, analysis.decisions.length * 0.03);
    return Math.min(1.0, quality);
  }

  private async updateEvolutionAnalysis(stageIndex: number, stageName: string, analysis: any): Promise<void> {
    // تنفيذ مبسط لتحديث تحليل التطور
    const evolution: StageEvolution = {
      stageIndex,
      stageName,
      keyChanges: analysis.keyPoints.slice(0, 3),
      impactOnNextStages: analysis.requirements,
      qualityImprovement: this.calculateQualityImprovement(stageIndex),
      timeStamp: new Date().toISOString()
    };

    this.contextData.evolutionAnalysis.stageProgression.push(evolution);
  }

  private async updateCriticalFindings(stageIndex: number, analysis: any): Promise<void> {
    // تحويل المخاطر لنقاط حرجة
    analysis.risks.forEach((risk: string, index: number) => {
      const finding: CriticalFinding = {
        id: `risk-${stageIndex}-${index}-${Date.now()}`,
        stageIndex,
        type: 'risk',
        description: risk,
        importance: this.assessImportance(risk),
        implications: [risk],
        relatedStages: [stageIndex],
        actionRequired: [`معالجة: ${risk}`],
        timestamp: new Date().toISOString()
      };

      this.contextData.stageMemory.criticalFindings.push(finding);
    });
  }

  private async updatePredictions(stageIndex: number, analysis: any): Promise<void> {
    this.contextData.predictions.nextStageRequirements = [
      ...this.contextData.predictions.nextStageRequirements,
      ...analysis.requirements
    ].slice(-10);

    const currentSuccessProbability = this.calculateSuccessProbability(analysis);
    this.contextData.predictions.successProbabilityTrend.push(currentSuccessProbability);
    
    if (this.contextData.predictions.successProbabilityTrend.length > 20) {
      this.contextData.predictions.successProbabilityTrend = 
        this.contextData.predictions.successProbabilityTrend.slice(-20);
    }
  }

  private async updateQualityMetrics(): Promise<void> {
    const stages = this.contextData.stageMemory.completedStages;
    
    if (stages.length === 0) return;

    this.contextData.qualityMetrics.consistencyScore = this.calculateConsistencyScore(stages);
    this.contextData.qualityMetrics.completenessScore = this.calculateCompletenessScore(stages);
    this.contextData.qualityMetrics.relevanceScore = this.calculateRelevanceScore(stages);
    this.contextData.qualityMetrics.innovationScore = this.calculateInnovationScore(stages);
  }

  private async updateRiskEvolution(stageIndex: number, analysis: any): Promise<void> {
    analysis.risks.forEach((risk: string) => {
      const existingRisk = this.contextData.stageMemory.riskEvolution.find(r => 
        r.riskType.toLowerCase().includes(risk.toLowerCase().substring(0, 20))
      );

      if (existingRisk) {
        const previousLevel = existingRisk.currentLevel;
        existingRisk.currentLevel = this.assessRiskLevel(risk);
        existingRisk.trend = this.determineTrend(previousLevel, existingRisk.currentLevel);
        existingRisk.timestamp = new Date().toISOString();
      } else {
        const newRisk: RiskEvolutionItem = {
          stageIndex,
          riskType: risk,
          initialLevel: this.assessRiskLevel(risk),
          currentLevel: this.assessRiskLevel(risk),
          trend: 'stable',
          mitigationActions: [`معالجة: ${risk}`],
          timestamp: new Date().toISOString()
        };

        this.contextData.stageMemory.riskEvolution.push(newRisk);
      }
    });
  }

  // دوال مساعدة إضافية
  private assessImportance(item: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalKeywords = ['حاسم', 'جوهري', 'أساسي', 'بالغ الأهمية'];
    const highKeywords = ['مهم', 'رئيسي', 'أولوية'];
    const lowerItem = item.toLowerCase();

    if (criticalKeywords.some(keyword => lowerItem.includes(keyword))) return 'critical';
    if (highKeywords.some(keyword => lowerItem.includes(keyword))) return 'high';
    return 'medium';
  }

  private calculateSuccessProbability(analysis: any): number {
    let probability = 0.5;
    probability += analysis.opportunities.length * 0.05;
    probability -= analysis.risks.length * 0.03;
    probability += analysis.evidence.length * 0.02;
    return Math.max(0.1, Math.min(0.9, probability));
  }

  private calculateQualityImprovement(stageIndex: number): number {
    const stages = this.contextData.stageMemory.completedStages;
    if (stages.length < 2) return 0;

    const currentQuality = stages[stages.length - 1]?.qualityScore || 0.5;
    const previousQuality = stages[stages.length - 2]?.qualityScore || 0.5;
    return currentQuality - previousQuality;
  }

  private calculateConsistencyScore(stages: StageMemoryItem[]): number {
    if (stages.length < 2) return 0.5;
    
    // حساب مبسط للاتساق
    const avgQuality = stages.reduce((sum, stage) => sum + stage.qualityScore, 0) / stages.length;
    const qualityVariance = stages.reduce((sum, stage) => sum + Math.pow(stage.qualityScore - avgQuality, 2), 0) / stages.length;
    
    return Math.max(0.1, 1 - qualityVariance);
  }

  private calculateCompletenessScore(stages: StageMemoryItem[]): number {
    const avgKeyPoints = stages.reduce((sum, stage) => sum + stage.keyPoints.length, 0) / stages.length;
    return Math.min(1.0, avgKeyPoints / 5);
  }

  private calculateRelevanceScore(stages: StageMemoryItem[]): number {
    return this.contextData.evolutionAnalysis.contextualConnections.length > 0 ? 
      this.contextData.evolutionAnalysis.contextualConnections.reduce((sum, conn) => sum + conn.strength, 0) / 
      this.contextData.evolutionAnalysis.contextualConnections.length : 0.5;
  }

  private calculateInnovationScore(stages: StageMemoryItem[]): number {
    const patterns = this.contextData.evolutionAnalysis.emergingPatterns.length;
    const criticalFindings = this.contextData.stageMemory.criticalFindings.length;
    
    let innovationScore = 0.3;
    innovationScore += Math.min(0.3, patterns * 0.05);
    innovationScore += Math.min(0.4, criticalFindings * 0.02);
    
    return Math.min(1.0, innovationScore);
  }

  private assessRiskLevel(risk: string): number {
    const highRiskKeywords = ['خطير', 'حاد', 'شديد', 'بالغ'];
    const lowerRisk = risk.toLowerCase();
    
    if (highRiskKeywords.some(keyword => lowerRisk.includes(keyword))) return 0.8;
    return 0.5;
  }

  private determineTrend(previousLevel: number, currentLevel: number): 'increasing' | 'decreasing' | 'stable' {
    const difference = currentLevel - previousLevel;
    if (difference > 0.1) return 'increasing';
    if (difference < -0.1) return 'decreasing';
    return 'stable';
  }

  private calculateSuccessTrend(): 'improving' | 'declining' | 'stable' {
    const trend = this.contextData.predictions.successProbabilityTrend;
    if (trend.length < 3) return 'stable';
    
    const recent = trend.slice(-3);
    const isImproving = recent[2] > recent[0];
    const isDeclining = recent[2] < recent[0];
    
    if (isImproving) return 'improving';
    if (isDeclining) return 'declining';
    return 'stable';
  }

  private generateRecommendations(): string[] {
    const recommendations = [];
    
    if (this.contextData.qualityMetrics.consistencyScore < 0.6) {
      recommendations.push('تحسين الاتساق بين المراحل');
    }
    
    if (this.contextData.qualityMetrics.completenessScore < 0.7) {
      recommendations.push('زيادة التفاصيل في التحليل');
    }
    
    const highRisks = this.contextData.stageMemory.riskEvolution.filter(r => r.currentLevel > 0.7);
    if (highRisks.length > 0) {
      recommendations.push('معالجة المخاطر العالية فوراً');
    }
    
    return recommendations.slice(0, 5);
  }

  private generateContextSummary(): string {
    const stagesCount = this.contextData.stageMemory.completedStages.length;
    const avgQuality = stagesCount > 0 ? 
      this.contextData.stageMemory.completedStages.reduce((sum, stage) => sum + stage.qualityScore, 0) / stagesCount : 0;
    
    return `تم إكمال ${stagesCount} مرحلة بمتوسط جودة ${(avgQuality * 100).toFixed(1)}%`;
  }
}