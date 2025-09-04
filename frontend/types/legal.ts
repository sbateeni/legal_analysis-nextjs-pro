export interface LegalDocument {
  id: string;
  title: string;
  content: string;
  type: 'law' | 'regulation' | 'decision' | 'amendment';
  date: string;
  source: string;
  version: string;
  jurisdiction: string;
  tags: string[];
  references: string[];
}

export interface LegalContext {
  relevantLaws: LegalDocument[];
  relatedCases: LegalDocument[];
  jurisdiction: string;
  caseType: string;
}

export type AISpecialization = 'general' | 'commercial' | 'family' | 'criminal' | 'administrative';

export interface LegalAnalysis {
  id: string;
  lawId: string;
  analysisType: 'impact' | 'contradictions' | 'trends' | 'comprehensive';
  summary: string;
  details: any;
  confidence: number;
  timestamp: string;
  recommendations: string[];
}

export interface ImpactAnalysis {
  modifiedLaw: LegalDocument;
  affectedLaws: LegalDocument[];
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  impactAreas: string[];
  recommendations: string[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    description: string;
    mitigationStrategies: string[];
  };
}

export interface ContradictionAnalysis {
  contradictions: Array<{
    law1: LegalDocument;
    law2: LegalDocument;
    contradictionType: 'direct' | 'indirect' | 'procedural';
    description: string;
    severity: 'low' | 'medium' | 'high';
    resolution: string;
  }>;
  summary: string;
  recommendations: string[];
}

export interface TrendAnalysis {
  timeRange: { start: string; end: string };
  trends: Array<{
    category: string;
    direction: 'increasing' | 'decreasing' | 'stable';
    percentage: number;
    description: string;
  }>;
  predictions: Array<{
    category: string;
    prediction: string;
    confidence: number;
    timeframe: string;
  }>;
  insights: string[];
}

export interface PredictiveAnalysis {
  id: string;
  caseType: string;
  factors: string[];
  prediction: {
    outcome: string;
    confidence: number;
    reasoning: string;
  };
  legalContext: {
    relevantLaws: LegalDocument[];
    precedents: any[];
    recommendations: string[];
  };
  timestamp: string;
}

export interface ComparativeAnalysis {
  law1: LegalDocument;
  law2: LegalDocument;
  comparisonCriteria: string[];
  similarities: string[];
  differences: string[];
  recommendations: string[];
  bestPractices: string[];
}
