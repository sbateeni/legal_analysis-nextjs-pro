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
  applicableTo?: string[]; // أنواع القضايا التي تنطبق عليها المرحلة (إن وجدت)
  order?: number; // ترتيب المرحلة ضمن مسار النوع
  optional?: boolean; // هل المرحلة اختيارية
  prerequisites?: string[]; // مراحل يجب إكمالها مسبقاً
  deadlines?: string[]; // مواعيد قانونية/سقوط مهمة
  jurisdictionHints?: string[]; // تلميحات اختصاص/مواد فلسطينية مختصرة لتعزيز الدقة عند نقص المعطيات
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
  details?: unknown;
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
  id: string;
  stageIndex: number;
  stage: string;
  input: string;
  output: string;
  date: string;
}

export interface LegalCase {
  id: string;
  name: string;
  createdAt: string;
  stages: AnalysisStage[];
  tags?: string[];
  status?: 'active' | 'completed' | 'archived';
  priority?: 'low' | 'medium' | 'high';
  caseType?: string;
  clientName?: string;
  courtName?: string;
  nextHearing?: string;
  notes?: string;
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

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'hearing' | 'deadline' | 'meeting' | 'reminder';
  caseId?: string;
  caseName?: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  completed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalendarSettings {
  defaultView: 'month' | 'week' | 'day';
  showWeekends: boolean;
  workingHours: {
    start: string;
    end: string;
  };
  notifications: {
    enabled: boolean;
    beforeMinutes: number[];
  };
}

// Document Types
export interface LegalDocument {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'docx' | 'jpg' | 'jpeg' | 'png' | 'txt' | 'other';
  size: number;
  caseId?: string;
  caseName?: string;
  description?: string;
  category: 'contract' | 'evidence' | 'correspondence' | 'legal_opinion' | 'court_document' | 'other';
  uploadedAt: string;
  lastModified: string;
  tags?: string[];
  isPublic: boolean;
  filePath?: string;
  mimeType?: string;
}

export interface DocumentSettings {
  maxFileSize: number; // in bytes
  allowedTypes: string[];
  storageLocation: 'local' | 'cloud';
  autoBackup: boolean;
  compressionEnabled: boolean;
}

// أنواع البيانات للتعاون والمراجعة
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'lawyer' | 'assistant' | 'reviewer';
  avatar?: string;
  isOnline: boolean;
  lastActive: string;
}

export interface CollaborationInvite {
  id: string;
  caseId: string;
  caseName: string;
  invitedBy: string;
  invitedTo: string;
  role: 'viewer' | 'editor' | 'reviewer';
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  expiresAt: string;
}

export interface CaseComment {
  id: string;
  caseId: string;
  authorId: string;
  authorName: string;
  content: string;
  type: 'comment' | 'suggestion' | 'question' | 'approval';
  priority: 'low' | 'medium' | 'high';
  isPrivate: boolean;
  stageId?: string;
  documentId?: string;
  createdAt: string;
  updatedAt: string;
  isResolved: boolean;
  replies?: CaseComment[];
}

export interface CaseReview {
  id: string;
  caseId: string;
  reviewerId: string;
  reviewerName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'needs_revision';
  feedback: string;
  suggestions: string[];
  rating: number;
  createdAt: string;
  completedAt?: string;
}

export interface CollaborationSettings {
  allowComments: boolean;
  allowReviews: boolean;
  requireApproval: boolean;
  autoNotify: boolean;
  defaultRole: 'viewer' | 'editor' | 'reviewer';
} 