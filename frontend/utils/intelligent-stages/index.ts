// Export types
export * from './types';

// Export stage analysis functions
export { analyzeStage1_InformationGathering } from './stages/stage1-information-gathering';
export { analyzeStage2_LegalContextAnalysis } from './stages/stage2-legal-context-analysis';
export { analyzeStage3_RiskAnalysis } from './stages/stage3-risk-analysis';
export { analyzeStage4_DefenseStrategies } from './stages/stage4-defense-strategies';
export { analyzeStage5_SentimentTrendAnalysis } from './stages/stage5-sentiment-trends';
export { analyzeStage6_FinalRecommendations } from './stages/stage6-final-recommendations';

// Export helper functions
export * from './helpers/case-type-detection';
export * from './helpers/legal-sources';
export * from './helpers/risk-assessment';
export * from './helpers/sentiment-analysis';
export * from './helpers/report-generation';

// Main service class
import { IntelligentStageAnalysis, StageAnalysisRequest } from './types';
import { analyzeStage1_InformationGathering } from './stages/stage1-information-gathering';
import { analyzeStage2_LegalContextAnalysis } from './stages/stage2-legal-context-analysis';
import { analyzeStage3_RiskAnalysis } from './stages/stage3-risk-analysis';
import { analyzeStage4_DefenseStrategies } from './stages/stage4-defense-strategies';
import { analyzeStage5_SentimentTrendAnalysis } from './stages/stage5-sentiment-trends';
import { analyzeStage6_FinalRecommendations } from './stages/stage6-final-recommendations';

export class IntelligentStageAnalysisService {
  private static instance: IntelligentStageAnalysisService;

  public static getInstance(): IntelligentStageAnalysisService {
    if (!IntelligentStageAnalysisService.instance) {
      IntelligentStageAnalysisService.instance = new IntelligentStageAnalysisService();
    }
    return IntelligentStageAnalysisService.instance;
  }

  // Stage 1: Information Gathering
  async analyzeStage1_InformationGathering(request: StageAnalysisRequest): Promise<IntelligentStageAnalysis> {
    return analyzeStage1_InformationGathering(request);
  }

  // Stage 2: Legal Context Analysis
  async analyzeStage2_LegalContextAnalysis(request: StageAnalysisRequest): Promise<IntelligentStageAnalysis> {
    return analyzeStage2_LegalContextAnalysis(request);
  }

  // Stage 3: Risk Analysis
  async analyzeStage3_RiskAnalysis(request: StageAnalysisRequest): Promise<IntelligentStageAnalysis> {
    return analyzeStage3_RiskAnalysis(request);
  }

  // Stage 4: Defense Strategies
  async analyzeStage4_DefenseStrategies(request: StageAnalysisRequest): Promise<IntelligentStageAnalysis> {
    return analyzeStage4_DefenseStrategies(request);
  }

  // Stage 5: Sentiment Trend Analysis
  async analyzeStage5_SentimentTrendAnalysis(request: StageAnalysisRequest): Promise<IntelligentStageAnalysis> {
    return analyzeStage5_SentimentTrendAnalysis(request);
  }

  // Stage 6: Final Recommendations
  async analyzeStage6_FinalRecommendations(request: StageAnalysisRequest): Promise<IntelligentStageAnalysis> {
    return analyzeStage6_FinalRecommendations(request);
  }
}

// Export singleton instance
export const intelligentStageAnalysisService = IntelligentStageAnalysisService.getInstance();
