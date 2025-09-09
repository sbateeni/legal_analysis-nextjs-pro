/**
 * مدير السياق المتقدم - الجزء الأول
 * Advanced Context Manager - Part 1: Core Types and Data Structures
 */

export interface ContextualData {
  // بيانات القضية الأساسية
  caseBasics: {
    title: string;
    type: string;
    parties: string[];
    jurisdiction: string;
    dateCreated: string;
    priority: 'low' | 'medium' | 'high';
  };

  // تحليل التطور التدريجي
  evolutionAnalysis: {
    stageProgression: StageEvolution[];
    keyInsights: string[];
    emergingPatterns: string[];
    contextualConnections: ContextConnection[];
  };

  // ذاكرة المراحل السابقة
  stageMemory: {
    completedStages: StageMemoryItem[];
    keyDecisions: DecisionPoint[];
    criticalFindings: CriticalFinding[];
    riskEvolution: RiskEvolutionItem[];
  };

  // التنبؤات والاتجاهات
  predictions: {
    nextStageRequirements: string[];
    anticipatedChallenges: string[];
    recommendedPreparations: string[];
    successProbabilityTrend: number[];
  };

  // الجودة والتحسين
  qualityMetrics: {
    consistencyScore: number;
    completenessScore: number;
    relevanceScore: number;
    innovationScore: number;
  };
}

export interface StageEvolution {
  stageIndex: number;
  stageName: string;
  keyChanges: string[];
  impactOnNextStages: string[];
  qualityImprovement: number;
  timeStamp: string;
}

export interface ContextConnection {
  fromStage: number;
  toStage: number;
  connectionType: 'direct' | 'indirect' | 'supporting' | 'contradictory';
  strength: number;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface StageMemoryItem {
  stageIndex: number;
  stageName: string;
  summary: string;
  keyPoints: string[];
  decisions: string[];
  evidenceCollected: string[];
  qualityScore: number;
  duration: number;
  timestamp: string;
}

export interface DecisionPoint {
  id: string;
  stageIndex: number;
  description: string;
  options: string[];
  chosenOption: string;
  reasoning: string;
  confidence: number;
  impact: string[];
  timestamp: string;
}

export interface CriticalFinding {
  id: string;
  stageIndex: number;
  type: 'evidence' | 'legal_precedent' | 'risk' | 'opportunity' | 'requirement';
  description: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  implications: string[];
  relatedStages: number[];
  actionRequired: string[];
  timestamp: string;
}

export interface RiskEvolutionItem {
  stageIndex: number;
  riskType: string;
  initialLevel: number;
  currentLevel: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  mitigationActions: string[];
  timestamp: string;
}