// Legal Document interface
export interface LegalDocument {
  id: string;
  title: string;
  type: 'law' | 'regulation' | 'precedent' | 'constitution';
  content: string;
  source: string;
  date: string;
  version: string;
  jurisdiction: string;
  tags: string[];
  references: string[];
}

export interface IntelligentStageAnalysis {
  stageId: string;
  stageName: string;
  description: string;
  analysis: {
    caseType: string;
    complexity: 'low' | 'medium' | 'high';
    confidence: number;
    recommendations: string[];
    risks: string[];
    requiredDocuments: string[];
    legalSources: LegalDocument[];
    estimatedDuration: string;
    successProbability: number;
  };
  aiInsights: {
    judgeSentiment: 'positive' | 'negative' | 'neutral';
    trendAnalysis: string;
    strategicRecommendations: string[];
    internationalComparison: string;
  };
  nextSteps: string[];
  completionStatus: 'pending' | 'in_progress' | 'completed';
}

export interface StageAnalysisRequest {
  caseDescription: string;
  caseType?: string;
  documents?: string[];
  parties?: string[];
  jurisdiction?: string;
  previousAnalysis?: any;
}

export interface LegalContextAnalysis {
  legalSources: LegalDocument[];
  contradictions: string[];
  legalGaps: string[];
  precedents: string[];
  jurisdictionAnalysis: any;
  temporalAnalysis: any;
}

export interface RiskAnalysis {
  risks: string[];
  evidenceStrength: 'weak' | 'moderate' | 'strong';
  timelineAnalysis: any;
  financialImpact: any;
  successProbability: number;
}

export interface DefenseStrategy {
  strategies: string[];
  trends: any;
  evidenceStrategy: any;
  defensePlan: any;
  timelineStrategy: any;
}

export interface SentimentAnalysis {
  judgeSentiment: any;
  socialTrends: any;
  futurePredictions: any;
  temporalAnalysis: any;
  publicOpinion: any;
  mediaSentiment: any;
}

export interface FinalRecommendations {
  comprehensiveRecommendations: string[];
  actionPlan: any;
  finalRiskAssessment: any;
  finalReport: any;
  successMetrics: any;
  implementationStrategy: any;
}
