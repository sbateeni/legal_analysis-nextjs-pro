// أنواع البيانات المشتركة لصفحة الدردشة
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  suggestions?: string[];
  nextSteps?: string[];
  confidence?: number;
  legalSources?: Array<{
    title: string;
    source: string;
    url: string;
    type: string;
  }>;
}

export interface AnalysisStage {
  id: string;
  stageIndex: number;
  stage: string;
  input: string;
  output: string;
  date: string;
}

export interface PredictiveAnalysis {
  caseId: string;
  caseName: string;
  successProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  alternativeStrategies: string[];
  estimatedDuration: string;
  complexityScore: number;
  lastAnalyzed: string;
  legalContext?: {
    relevantLaws: Array<{
      title: string;
      source: string;
      relevanceScore: number;
      type: string;
    }>;
    legalRecommendations: string[];
    riskAssessment: {
      level: 'low' | 'medium' | 'high';
      factors: string[];
      mitigationStrategies: string[];
    };
  };
}

export interface AnalyticsData {
  totalCases: number;
  activeCases: number;
  completedCases: number;
  totalDocuments: number;
  upcomingEvents: number;
  averageCompletionTime: number;
  successRate: number;
  caseTypes: { [key: string]: number };
  monthlyTrends: { [key: string]: number };
  predictiveAnalyses: PredictiveAnalysis[];
  casesByType: Record<string, number>;
  casesByMonth: Record<string, number>;
  averageStagesCompleted: number;
  mostCommonIssues: string[];
  averageCaseLength: number;
  topStages: Array<{ stage: string; count: number }>;
  recentActivity: Array<{ date: string; count: number }>;
  note?: string;
}

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface StrategyPayload {
  strategy_title?: string;
  strategy_steps?: string[];
  legal_basis?: Array<{ source: string; article?: string }>;
  tags?: string[];
}
