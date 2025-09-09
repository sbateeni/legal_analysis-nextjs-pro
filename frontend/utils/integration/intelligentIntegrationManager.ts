/**
 * مدير التكامل الذكي - دمج المراحل الذكية مع النظام الرئيسي
 * Intelligent Integration Manager - Integrates intelligent stages with main system
 */

import { SequentialAnalysisManager, AnalysisStage, AnalysisProgress } from '../sequentialAnalysisManager';
import { intelligentStageAnalysisService, IntelligentStageAnalysis, StageAnalysisRequest } from '../intelligent-stages';

export interface IntegratedAnalysisConfig {
  useIntelligentStages: boolean;
  intelligentStagesList: number[]; // Which stages to use intelligent analysis for
  fallbackToStandard: boolean;
  enableContextSharing: boolean;
  enableRiskAssessment: boolean;
}

export interface ContextData {
  previousStageResults: string[];
  caseType: string;
  complexity: 'low' | 'medium' | 'high';
  riskLevel: number;
  parties: string[];
  jurisdiction: string;
  estimatedDuration: number;
}

export interface IntegratedAnalysisResult extends AnalysisStage {
  intelligentAnalysis?: IntelligentStageAnalysis;
  contextData?: ContextData;
  qualityScore?: number;
  riskAssessment?: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigation: string[];
  };
}

export class IntelligentIntegrationManager {
  private sequentialManager: SequentialAnalysisManager;
  private config: IntegratedAnalysisConfig;
  private contextData: ContextData;

  constructor(
    stages: string[],
    config: IntegratedAnalysisConfig = {
      useIntelligentStages: true,
      intelligentStagesList: [0, 2, 4, 6, 8, 10], // Use intelligent analysis for key stages
      fallbackToStandard: true,
      enableContextSharing: true,
      enableRiskAssessment: true
    }
  ) {
    this.config = config;
    this.contextData = {
      previousStageResults: [],
      caseType: 'عام',
      complexity: 'medium',
      riskLevel: 0.5,
      parties: [],
      jurisdiction: 'فلسطين',
      estimatedDuration: 0
    };

    // إنشاء sequential manager محسن مع دعم المراحل الذكية
    this.sequentialManager = new SequentialAnalysisManager(
      stages,
      {
        baseDelay: 5000,
        maxDelay: 15000,
        maxRetries: 3,
        timeoutPerStage: 90000, // زيادة المهلة للمراحل الذكية
        enableProgressSave: true
      },
      this.onProgressUpdate.bind(this),
      this.onStageComplete.bind(this)
    );
  }

  /**
   * بدء التحليل المتكامل مع المراحل الذكية
   */
  async startIntegratedAnalysis(
    input: string,
    apiKey: string,
    additionalParams: Record<string, any> = {}
  ): Promise<IntegratedAnalysisResult[]> {
    
    // تحديث بيانات السياق
    this.updateContextData(input, additionalParams);

    const results: IntegratedAnalysisResult[] = [];
    
    try {
      // إذا كانت المراحل الذكية مفعلة
      if (this.config.useIntelligentStages) {
        return await this.runIntelligentAnalysis(input, apiKey, additionalParams);
      } else {
        // استخدام النظام العادي فقط
        const standardResults = await this.sequentialManager.startAnalysis(input, apiKey, additionalParams);
        return standardResults.results.map(result => ({
          ...result,
          contextData: this.contextData
        }));
      }
    } catch (error) {
      console.error('خطأ في التحليل المتكامل:', error);
      
      // التراجع للنظام العادي في حالة الخطأ
      if (this.config.fallbackToStandard) {
        const fallbackResults = await this.sequentialManager.startAnalysis(input, apiKey, additionalParams);
        return fallbackResults.results.map(result => ({
          ...result,
          contextData: this.contextData
        }));
      }
      
      throw error;
    }
  }

  /**
   * تشغيل التحليل الذكي المتكامل
   */
  private async runIntelligentAnalysis(
    input: string,
    apiKey: string,
    additionalParams: Record<string, any>
  ): Promise<IntegratedAnalysisResult[]> {
    
    const results: IntegratedAnalysisResult[] = [];
    const stages = this.sequentialManager['stages']; // الوصول للمراحل

    for (let i = 0; i < stages.length; i++) {
      try {
        // تحديد ما إذا كانت هذه المرحلة تحتاج تحليل ذكي
        const useIntelligentForStage = this.config.intelligentStagesList.includes(i);
        
        let stageResult: IntegratedAnalysisResult;

        if (useIntelligentForStage) {
          // استخدام التحليل الذكي
          stageResult = await this.analyzeStageIntelligently(i, input, apiKey, additionalParams);
        } else {
          // استخدام التحليل العادي
          stageResult = await this.analyzeStageStandard(i, input, apiKey, additionalParams);
        }

        // إضافة بيانات السياق وتقييم الجودة
        stageResult.contextData = { ...this.contextData };
        stageResult.qualityScore = await this.assessQuality(stageResult);
        stageResult.riskAssessment = await this.assessRisk(stageResult);

        results.push(stageResult);

        // تحديث السياق بناءً على النتائج
        await this.updateContextFromResult(stageResult);

        // إشعار اكتمال المرحلة
        this.onStageComplete(stageResult);

      } catch (error) {
        console.error(`خطأ في المرحلة ${i + 1}:`, error);
        
        // محاولة التراجع للنظام العادي
        if (this.config.fallbackToStandard) {
          try {
            const fallbackResult = await this.analyzeStageStandard(i, input, apiKey, additionalParams);
            fallbackResult.contextData = { ...this.contextData };
            results.push(fallbackResult);
          } catch (fallbackError) {
            console.error(`فشل في التراجع للنظام العادي للمرحلة ${i + 1}:`, fallbackError);
            // إضافة نتيجة خطأ
            results.push(this.createErrorResult(i, stages[i], error));
          }
        }
      }

      // انتظار بين المراحل
      if (i < stages.length - 1) {
        await this.delay(this.calculateDelay(i, results));
      }
    }

    return results;
  }

  /**
   * تحليل مرحلة باستخدام النظام الذكي
   */
  private async analyzeStageIntelligently(
    stageIndex: number,
    input: string,
    apiKey: string,
    additionalParams: Record<string, any>
  ): Promise<IntegratedAnalysisResult> {
    
    // إعداد طلب التحليل الذكي
    const request: StageAnalysisRequest = {
      caseDescription: input,
      caseType: this.contextData.caseType,
      documents: additionalParams.documents || [],
      parties: this.contextData.parties,
      jurisdiction: this.contextData.jurisdiction,
      previousAnalysis: this.contextData.previousStageResults
    };

    // تحديد أي مرحلة ذكية نستخدم بناءً على الفهرس
    let intelligentAnalysis: IntelligentStageAnalysis;
    
    switch (stageIndex % 6) { // توزيع على 6 مراحل ذكية
      case 0:
        intelligentAnalysis = await intelligentStageAnalysisService.analyzeStage1_InformationGathering(request);
        break;
      case 1:
        intelligentAnalysis = await intelligentStageAnalysisService.analyzeStage2_LegalContextAnalysis(request);
        break;
      case 2:
        intelligentAnalysis = await intelligentStageAnalysisService.analyzeStage3_RiskAnalysis(request);
        break;
      case 3:
        intelligentAnalysis = await intelligentStageAnalysisService.analyzeStage4_DefenseStrategies(request);
        break;
      case 4:
        intelligentAnalysis = await intelligentStageAnalysisService.analyzeStage5_SentimentTrendAnalysis(request);
        break;
      case 5:
        intelligentAnalysis = await intelligentStageAnalysisService.analyzeStage6_FinalRecommendations(request);
        break;
      default:
        intelligentAnalysis = await intelligentStageAnalysisService.analyzeStage1_InformationGathering(request);
    }

    // تحويل النتيجة الذكية لتنسيق النظام الرئيسي
    const stageResult: IntegratedAnalysisResult = {
      id: `intelligent-${Date.now()}-${stageIndex}`,
      stageIndex,
      stage: this.sequentialManager['stages'][stageIndex],
      input,
      output: this.formatIntelligentOutput(intelligentAnalysis),
      date: new Date().toISOString(),
      duration: 0,
      retryCount: 0,
      intelligentAnalysis
    };

    return stageResult;
  }

  /**
   * تحليل مرحلة باستخدام النظام العادي
   */
  private async analyzeStageStandard(
    stageIndex: number,
    input: string,
    apiKey: string,
    additionalParams: Record<string, any>
  ): Promise<IntegratedAnalysisResult> {
    
    // استخدام API العادي
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sequential-analysis': 'true'
      },
      body: JSON.stringify({
        text: input,
        stageIndex,
        apiKey,
        stage: this.sequentialManager['stages'][stageIndex],
        contextData: this.config.enableContextSharing ? this.contextData : undefined,
        ...additionalParams
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();

    return {
      id: `standard-${Date.now()}-${stageIndex}`,
      stageIndex,
      stage: this.sequentialManager['stages'][stageIndex],
      input,
      output: data.analysis || data.output,
      date: new Date().toISOString(),
      duration: 0,
      retryCount: 0
    };
  }

  /**
   * تنسيق نتيجة التحليل الذكي للعرض
   */
  private formatIntelligentOutput(analysis: IntelligentStageAnalysis): string {
    const sections = [
      `## ${analysis.stageName}`,
      '',
      `**الوصف:** ${analysis.description}`,
      '',
      `**نوع القضية:** ${analysis.analysis.caseType}`,
      `**مستوى التعقيد:** ${analysis.analysis.complexity}`,
      `**مستوى الثقة:** ${(analysis.analysis.confidence * 100).toFixed(1)}%`,
      `**احتمالية النجاح:** ${(analysis.analysis.successProbability * 100).toFixed(1)}%`,
      '',
      '### التوصيات:',
      ...analysis.analysis.recommendations.map(rec => `- ${rec}`),
      '',
      '### المخاطر المحددة:',
      ...analysis.analysis.risks.map(risk => `- ${risk}`),
      '',
      '### الوثائق المطلوبة:',
      ...analysis.analysis.requiredDocuments.map(doc => `- ${doc}`),
      '',
      '### رؤى الذكاء الاصطناعي:',
      `- **اتجاه الحكم المتوقع:** ${analysis.aiInsights.judgeSentiment}`,
      `- **التوصيات الاستراتيجية:** ${analysis.aiInsights.strategicRecommendations.join(', ')}`,
      '',
      '### الخطوات التالية:',
      ...analysis.nextSteps.map(step => `- ${step}`)
    ];

    return sections.join('\n');
  }

  /**
   * تقييم جودة النتيجة
   */
  private async assessQuality(result: IntegratedAnalysisResult): Promise<number> {
    let score = 0.5; // النقطة الأساسية

    // تقييم بناءً على طول المحتوى
    if (result.output && result.output.length > 500) score += 0.1;
    if (result.output && result.output.length > 1000) score += 0.1;

    // تقييم بناءً على وجود تحليل ذكي
    if (result.intelligentAnalysis) {
      score += result.intelligentAnalysis.analysis.confidence * 0.3;
    }

    // تقييم بناءً على وجود توصيات
    if (result.output && result.output.includes('التوصيات')) score += 0.1;

    // تقييم بناءً على وجود مخاطر
    if (result.output && result.output.includes('المخاطر')) score += 0.1;

    return Math.min(1.0, score);
  }

  /**
   * تقييم المخاطر
   */
  private async assessRisk(result: IntegratedAnalysisResult): Promise<{
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigation: string[];
  }> {
    
    const factors: string[] = [];
    const mitigation: string[] = [];

    // تحليل المخاطر من النتيجة الذكية
    if (result.intelligentAnalysis) {
      factors.push(...result.intelligentAnalysis.analysis.risks);
      
      if (result.intelligentAnalysis.analysis.successProbability < 0.5) {
        factors.push('احتمالية نجاح منخفضة');
        mitigation.push('مراجعة الاستراتيجية القانونية');
      }

      if (result.intelligentAnalysis.analysis.complexity === 'high') {
        factors.push('تعقيد عالي للقضية');
        mitigation.push('الحصول على استشارة قانونية متخصصة');
      }
    }

    // تحديد مستوى المخاطر
    let level: 'low' | 'medium' | 'high' = 'low';
    if (factors.length > 3) level = 'medium';
    if (factors.length > 6) level = 'high';

    return { level, factors, mitigation };
  }

  /**
   * تحديث السياق بناءً على النتيجة
   */
  private async updateContextFromResult(result: IntegratedAnalysisResult): Promise<void> {
    // إضافة النتيجة للسياق
    this.contextData.previousStageResults.push(result.output);

    // تحديث مستوى المخاطر
    if (result.riskAssessment) {
      const riskLevels = { 'low': 0.3, 'medium': 0.6, 'high': 0.9 };
      this.contextData.riskLevel = Math.max(
        this.contextData.riskLevel,
        riskLevels[result.riskAssessment.level]
      );
    }

    // تحديث التعقيد
    if (result.intelligentAnalysis) {
      this.contextData.complexity = result.intelligentAnalysis.analysis.complexity;
      this.contextData.estimatedDuration += parseInt(result.intelligentAnalysis.analysis.estimatedDuration) || 0;
    }
  }

  /**
   * تحديث بيانات السياق الأولية
   */
  private updateContextData(input: string, additionalParams: Record<string, any>): void {
    this.contextData.caseType = additionalParams.caseType || 'عام';
    this.contextData.parties = additionalParams.parties || [];
    this.contextData.jurisdiction = additionalParams.jurisdiction || 'فلسطين';
    
    // تقدير التعقيد بناءً على طول النص
    if (input.length > 2000) {
      this.contextData.complexity = 'high';
    } else if (input.length > 800) {
      this.contextData.complexity = 'medium';
    } else {
      this.contextData.complexity = 'low';
    }
  }

  /**
   * إنشاء نتيجة خطأ
   */
  private createErrorResult(stageIndex: number, stageName: string, error: any): IntegratedAnalysisResult {
    return {
      id: `error-${Date.now()}-${stageIndex}`,
      stageIndex,
      stage: stageName,
      input: '',
      output: `حدث خطأ في هذه المرحلة: ${error.message || error}`,
      date: new Date().toISOString(),
      duration: 0,
      retryCount: 0,
      qualityScore: 0,
      riskAssessment: {
        level: 'high',
        factors: ['خطأ في التحليل'],
        mitigation: ['إعادة المحاولة', 'مراجعة المدخلات']
      }
    };
  }

  /**
   * حساب التأخير بين المراحل
   */
  private calculateDelay(stageIndex: number, results: IntegratedAnalysisResult[]): number {
    const baseDelay = 5000;
    const maxDelay = 15000;

    // زيادة التأخير للمراحل المعقدة
    const lastResult = results[results.length - 1];
    let complexityMultiplier = 1;

    if (lastResult?.intelligentAnalysis?.analysis.complexity === 'high') {
      complexityMultiplier = 1.5;
    } else if (lastResult?.intelligentAnalysis?.analysis.complexity === 'medium') {
      complexityMultiplier = 1.2;
    }

    return Math.min(maxDelay, baseDelay * complexityMultiplier);
  }

  /**
   * تأخير
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * معالج تحديث التقدم
   */
  private onProgressUpdate(progress: AnalysisProgress): void {
    // يمكن إضافة معالجة إضافية هنا
    console.log('تقدم التحليل المتكامل:', progress);
  }

  /**
   * معالج اكتمال المرحلة
   */
  private onStageComplete(stage: AnalysisStage | IntegratedAnalysisResult): void {
    console.log('اكتملت المرحلة:', stage.stage);
  }

  /**
   * الحصول على إحصائيات التحليل
   */
  getAnalysisStats(results: IntegratedAnalysisResult[]): {
    totalStages: number;
    intelligentStages: number;
    standardStages: number;
    averageQuality: number;
    averageRiskLevel: number;
    estimatedTotalDuration: number;
  } {
    const intelligentStages = results.filter(r => r.intelligentAnalysis).length;
    const averageQuality = results.reduce((sum, r) => sum + (r.qualityScore || 0), 0) / results.length;
    const averageRiskLevel = this.contextData.riskLevel;

    return {
      totalStages: results.length,
      intelligentStages,
      standardStages: results.length - intelligentStages,
      averageQuality,
      averageRiskLevel,
      estimatedTotalDuration: this.contextData.estimatedDuration
    };
  }
}