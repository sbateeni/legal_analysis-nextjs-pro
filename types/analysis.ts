// Types for Legal Analysis System
export type PartyRole = 'المشتكي' | 'المشتكى عليه' | 'المدعي' | 'المدعى عليه';

export interface StageDetails {
  stageName: string;
  description: string;
  key_points: string[];
  questions: string[];
  examples?: string[];
  legalReferences?: string[];
  complexity?: 'basic' | 'intermediate' | 'advanced';
}

export interface StageDetailsMap {
  [key: string]: StageDetails;
}

export interface AnalysisRequest {
  text: string;
  stageIndex: number;
  apiKey: string;
  previousSummaries?: string[];
  finalPetition?: boolean;
  caseType?: string;
  complexity?: string;
  partyRole?: PartyRole;
}

export interface AnalysisResponse {
  stage: string;
  analysis: string;
  timestamp?: number;
  stageIndex?: number;
}

export interface AnalysisError {
  code: 'INVALID_API_KEY' | 'TEXT_TOO_LONG' | 'STAGE_NOT_FOUND' | 'API_ERROR' | 'VALIDATION_ERROR';
  message: string;
  details?: any;
}

export interface AnalysisContext {
  caseType: string;
  complexity: string;
  jurisdiction: string;
  language: string;
  partyRole?: PartyRole;
}

export interface CachedAnalysis {
  text: string;
  stageIndex: number;
  analysis: string;
  timestamp: number;
  expiresAt: number;
}

export interface RateLimitInfo {
  apiKey: string;
  requests: number[];
  lastReset: number;
}

// Analytics Types
export interface AnalysisStage {
  stageName: string;
  result: string | null;
  timestamp?: number;
}

export interface CaseAnalysis {
  id: string;
  name: string;
  createdAt: string;
  stages: AnalysisStage[];
  caseType: string;
  complexity: string;
  wordCount: number;
  completionRate: number;
}

export interface AnalyticsData {
  totalCases: number;
  casesByType: Record<string, number>;
  casesByMonth: Record<string, number>;
  averageStagesCompleted: number;
  mostCommonIssues: string[];
  successRate: number;
  averageCaseLength: number;
  topStages: Array<{ stage: string; count: number }>;
  recentActivity: Array<{ date: string; count: number }>;
} 