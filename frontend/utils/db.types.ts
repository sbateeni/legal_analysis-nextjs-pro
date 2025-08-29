export interface CaseRecord {
  id: string;
  name: string;
  caseType: string;
  partyRole?: string;
  complexity: 'basic' | 'intermediate' | 'advanced';
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived' | 'completed';
  tags?: string;
  description?: string;
}

export interface StageRecord {
  id: string;
  caseId: string;
  stageName: string;
  stageIndex: number;
  input: string;
  output: string;
  createdAt: string;
  completedAt?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  metadata?: string;
}

export interface ExportRecord {
  id: string;
  caseId: string;
  type: 'pdf' | 'docx' | 'excel';
  filename: string;
  createdAt: string;
  fileSize: number;
  preferences?: string;
}

export interface SearchIndex {
  id: string;
  caseId: string;
  stageId?: string;
  content: string;
  type: 'case' | 'stage' | 'input' | 'output';
  tags: string;
  createdAt: string;
}

export interface AnalyticsRecord {
  id: string;
  caseId: string;
  action: string;
  timestamp: string;
  metadata?: string;
  duration?: number;
}

export interface UserPreferences {
  id: string;
  key: string;
  value: string;
  updatedAt: string;
}

export interface CommentRecord {
  id: string;
  caseId: string;
  stageId?: string;
  author: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
}

export interface TaskRecord {
  id: string;
  caseId: string;
  stageId?: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  status: 'open' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}


