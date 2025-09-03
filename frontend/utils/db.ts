import { set, get, del } from 'idb-keyval';
import type { TeamMember, CollaborationInvite, CaseComment, CaseReview, CollaborationSettings } from '../types/analysis';

// أنواع البيانات
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

export interface LegalTemplate {
  id: string;
  name: string;
  content: string; // يحتوي نص القالب مع متغيرات {{caseName}} {{stageSummaries}}
  createdAt: string;
  updatedAt: string;
}

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

// مفاتيح التخزين
const CASES_KEY = 'legal_cases';
const API_KEY = 'gemini_api_key';
const TEMPLATES_KEY = 'legal_templates';
const EVENTS_KEY = 'calendar_events';
const CALENDAR_SETTINGS_KEY = 'calendar_settings';
const DOCUMENTS_KEY = 'legal_documents';
const DOCUMENT_SETTINGS_KEY = 'document_settings';

// دوال مفتاح API
export async function saveApiKey(apiKey: string) {
  await set(API_KEY, apiKey);
}

export async function loadApiKey(): Promise<string> {
  return (await get(API_KEY)) || '';
}

// دوال CRUD للقضايا
export async function getAllCases(): Promise<LegalCase[]> {
  return (await get(CASES_KEY)) || [];
}

export async function saveAllCases(cases: LegalCase[]) {
  await set(CASES_KEY, cases);
}

export async function addCase(newCase: LegalCase): Promise<void> {
  const cases = await getAllCases();
  cases.unshift(newCase);
  await saveAllCases(cases);
}

export async function updateCase(updatedCase: LegalCase): Promise<void> {
  let cases = await getAllCases();
  cases = cases.map(c => c.id === updatedCase.id ? updatedCase : c);
  await saveAllCases(cases);
}

export async function deleteCase(caseId: string): Promise<void> {
  let cases = await getAllCases();
  cases = cases.filter(c => c.id !== caseId);
  await saveAllCases(cases);
}

export async function getCaseById(caseId: string): Promise<LegalCase | undefined> {
  const cases = await getAllCases();
  return cases.find(c => c.id === caseId);
}

// دوال إدارة المراحل داخل قضية
export async function addStageToCase(caseId: string, stage: AnalysisStage): Promise<void> {
  const cases = await getAllCases();
  const idx = cases.findIndex(c => c.id === caseId);
  if (idx === -1) return;
  cases[idx].stages.push(stage);
  await saveAllCases(cases);
}

export async function updateStageInCase(caseId: string, stage: AnalysisStage): Promise<void> {
  const cases = await getAllCases();
  const idx = cases.findIndex(c => c.id === caseId);
  if (idx === -1) return;
  cases[idx].stages = cases[idx].stages.map(s => s.id === stage.id ? stage : s);
  await saveAllCases(cases);
}

export async function deleteStageFromCase(caseId: string, stageId: string): Promise<void> {
  const cases = await getAllCases();
  const idx = cases.findIndex(c => c.id === caseId);
  if (idx === -1) return;
  cases[idx].stages = cases[idx].stages.filter(s => s.id !== stageId);
  await saveAllCases(cases);
}

// دالة حذف جميع القضايا
export async function clearAllCases() {
  await del(CASES_KEY);
}

// قوالب قانونية - CRUD
export async function getAllTemplates(): Promise<LegalTemplate[]> {
  return (await get(TEMPLATES_KEY)) || [];
}

export async function saveAllTemplates(templates: LegalTemplate[]): Promise<void> {
  await set(TEMPLATES_KEY, templates);
}

export async function addTemplate(t: LegalTemplate): Promise<void> {
  const list = await getAllTemplates();
  list.unshift(t);
  await saveAllTemplates(list);
}

export async function updateTemplate(t: LegalTemplate): Promise<void> {
  let list = await getAllTemplates();
  list = list.map(x => x.id === t.id ? t : x);
  await saveAllTemplates(list);
}

export async function deleteTemplate(id: string): Promise<void> {
  let list = await getAllTemplates();
  list = list.filter(x => x.id !== id);
  await saveAllTemplates(list);
}

// دوال إدارة المواعيد - CRUD
export async function getAllEvents(): Promise<CalendarEvent[]> {
  return (await get(EVENTS_KEY)) || [];
}

export async function saveAllEvents(events: CalendarEvent[]): Promise<void> {
  await set(EVENTS_KEY, events);
}

export async function addEvent(event: CalendarEvent): Promise<void> {
  const events = await getAllEvents();
  events.unshift(event);
  await saveAllEvents(events);
}

export async function updateEvent(updatedEvent: CalendarEvent): Promise<void> {
  let events = await getAllEvents();
  events = events.map(e => e.id === updatedEvent.id ? updatedEvent : e);
  await saveAllEvents(events);
}

export async function deleteEvent(eventId: string): Promise<void> {
  let events = await getAllEvents();
  events = events.filter(e => e.id !== eventId);
  await saveAllEvents(events);
}

export async function getEventById(eventId: string): Promise<CalendarEvent | undefined> {
  const events = await getAllEvents();
  return events.find(e => e.id === eventId);
}

export async function getEventsByDate(date: string): Promise<CalendarEvent[]> {
  const events = await getAllEvents();
  return events.filter(e => e.date === date);
}

export async function getEventsByCase(caseId: string): Promise<CalendarEvent[]> {
  const events = await getAllEvents();
  return events.filter(e => e.caseId === caseId);
}

export async function getUpcomingEvents(days: number = 7): Promise<CalendarEvent[]> {
  const events = await getAllEvents();
  const today = new Date();
  const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= today && eventDate <= futureDate;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// دوال إعدادات التقويم
export async function getCalendarSettings(): Promise<CalendarSettings> {
  const settings = await get(CALENDAR_SETTINGS_KEY);
  return settings || {
    defaultView: 'month',
    showWeekends: true,
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    notifications: {
      enabled: true,
      beforeMinutes: [60, 30, 15]
    }
  };
}

export async function saveCalendarSettings(settings: CalendarSettings): Promise<void> {
  await set(CALENDAR_SETTINGS_KEY, settings);
}

// دوال إدارة المستندات - CRUD
export async function getAllDocuments(): Promise<LegalDocument[]> {
  return (await get(DOCUMENTS_KEY)) || [];
}

export async function saveAllDocuments(documents: LegalDocument[]): Promise<void> {
  await set(DOCUMENTS_KEY, documents);
}

export async function addDocument(document: LegalDocument): Promise<void> {
  const documents = await getAllDocuments();
  documents.unshift(document);
  await saveAllDocuments(documents);
}

export async function updateDocument(updatedDocument: LegalDocument): Promise<void> {
  let documents = await getAllDocuments();
  documents = documents.map(d => d.id === updatedDocument.id ? updatedDocument : d);
  await saveAllDocuments(documents);
}

export async function deleteDocument(documentId: string): Promise<void> {
  let documents = await getAllDocuments();
  documents = documents.filter(d => d.id !== documentId);
  await saveAllDocuments(documents);
}

export async function getDocumentById(documentId: string): Promise<LegalDocument | undefined> {
  const documents = await getAllDocuments();
  return documents.find(d => d.id === documentId);
}

export async function getDocumentsByCase(caseId: string): Promise<LegalDocument[]> {
  const documents = await getAllDocuments();
  return documents.filter(d => d.caseId === caseId);
}

export async function getDocumentsByCategory(category: string): Promise<LegalDocument[]> {
  const documents = await getAllDocuments();
  return documents.filter(d => d.category === category);
}

export async function searchDocuments(query: string): Promise<LegalDocument[]> {
  const documents = await getAllDocuments();
  const lowercaseQuery = query.toLowerCase();
  return documents.filter(d => 
    d.name.toLowerCase().includes(lowercaseQuery) ||
    d.description?.toLowerCase().includes(lowercaseQuery) ||
    d.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

// دوال إعدادات المستندات
export async function getDocumentSettings(): Promise<DocumentSettings> {
  const settings = await get(DOCUMENT_SETTINGS_KEY);
  return settings || {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt'],
    storageLocation: 'local',
    autoBackup: false,
    compressionEnabled: true
  };
}

export async function saveDocumentSettings(settings: DocumentSettings): Promise<void> {
  await set(DOCUMENT_SETTINGS_KEY, settings);
}

// Collaboration Keys
export const TEAM_MEMBERS_KEY = 'teamMembers';
export const COLLABORATION_INVITES_KEY = 'collaborationInvites';
export const CASE_COMMENTS_KEY = 'caseComments';
export const CASE_REVIEWS_KEY = 'caseReviews';
export const COLLABORATION_SETTINGS_KEY = 'collaborationSettings';

// Team Members CRUD
export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const members = await get(TEAM_MEMBERS_KEY);
  return members || [];
}

export async function addTeamMember(member: TeamMember): Promise<void> {
  const members = await getAllTeamMembers();
  members.push(member);
  await set(TEAM_MEMBERS_KEY, members);
}

export async function updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<void> {
  const members = await getAllTeamMembers();
  const index = members.findIndex(m => m.id === id);
  if (index !== -1) {
    members[index] = { ...members[index], ...updates };
    await set(TEAM_MEMBERS_KEY, members);
  }
}

export async function deleteTeamMember(id: string): Promise<void> {
  const members = await getAllTeamMembers();
  const filtered = members.filter(m => m.id !== id);
  await set(TEAM_MEMBERS_KEY, filtered);
}

// Collaboration Invites CRUD
export async function getAllInvites(): Promise<CollaborationInvite[]> {
  const invites = await get(COLLABORATION_INVITES_KEY);
  return invites || [];
}

export async function addInvite(invite: CollaborationInvite): Promise<void> {
  const invites = await getAllInvites();
  invites.push(invite);
  await set(COLLABORATION_INVITES_KEY, invites);
}

export async function updateInvite(id: string, updates: Partial<CollaborationInvite>): Promise<void> {
  const invites = await getAllInvites();
  const index = invites.findIndex(i => i.id === id);
  if (index !== -1) {
    invites[index] = { ...invites[index], ...updates };
    await set(COLLABORATION_INVITES_KEY, invites);
  }
}

export async function deleteInvite(id: string): Promise<void> {
  const invites = await getAllInvites();
  const filtered = invites.filter(i => i.id !== id);
  await set(COLLABORATION_INVITES_KEY, filtered);
}

// Case Comments CRUD
export async function getAllComments(): Promise<CaseComment[]> {
  const comments = await get(CASE_COMMENTS_KEY);
  return comments || [];
}

export async function getCommentsByCase(caseId: string): Promise<CaseComment[]> {
  const comments = await getAllComments();
  return comments.filter(c => c.caseId === caseId);
}

export async function addComment(comment: CaseComment): Promise<void> {
  const comments = await getAllComments();
  comments.push(comment);
  await set(CASE_COMMENTS_KEY, comments);
}

export async function updateComment(id: string, updates: Partial<CaseComment>): Promise<void> {
  const comments = await getAllComments();
  const index = comments.findIndex(c => c.id === id);
  if (index !== -1) {
    comments[index] = { ...comments[index], ...updates };
    await set(CASE_COMMENTS_KEY, comments);
  }
}

export async function deleteComment(id: string): Promise<void> {
  const comments = await getAllComments();
  const filtered = comments.filter(c => c.id !== id);
  await set(CASE_COMMENTS_KEY, filtered);
}

// Case Reviews CRUD
export async function getAllReviews(): Promise<CaseReview[]> {
  const reviews = await get(CASE_REVIEWS_KEY);
  return reviews || [];
}

export async function getReviewsByCase(caseId: string): Promise<CaseReview[]> {
  const reviews = await getAllReviews();
  return reviews.filter(r => r.caseId === caseId);
}

export async function addReview(review: CaseReview): Promise<void> {
  const reviews = await getAllReviews();
  reviews.push(review);
  await set(CASE_REVIEWS_KEY, reviews);
}

export async function updateReview(id: string, updates: Partial<CaseReview>): Promise<void> {
  const reviews = await getAllReviews();
  const index = reviews.findIndex(r => r.id === id);
  if (index !== -1) {
    reviews[index] = { ...reviews[index], ...updates };
    await set(CASE_REVIEWS_KEY, reviews);
  }
}

export async function deleteReview(id: string): Promise<void> {
  const reviews = await getAllReviews();
  const filtered = reviews.filter(r => r.id !== id);
  await set(CASE_REVIEWS_KEY, filtered);
}

// Collaboration Settings
export async function getCollaborationSettings(): Promise<CollaborationSettings> {
  const settings = await get(COLLABORATION_SETTINGS_KEY);
  return settings || {
    allowComments: true,
    allowReviews: true,
    requireApproval: false,
    autoNotify: true,
    defaultRole: 'viewer'
  };
}

export async function updateCollaborationSettings(settings: CollaborationSettings): Promise<void> {
  await set(COLLABORATION_SETTINGS_KEY, settings);
} 