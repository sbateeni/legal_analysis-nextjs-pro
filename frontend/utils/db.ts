import { set, get, del } from 'idb-keyval';

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
}

export interface LegalTemplate {
  id: string;
  name: string;
  content: string; // يحتوي نص القالب مع متغيرات {{caseName}} {{stageSummaries}}
  createdAt: string;
  updatedAt: string;
}

// مفاتيح التخزين
const CASES_KEY = 'legal_cases';
const API_KEY = 'gemini_api_key';
const TEMPLATES_KEY = 'legal_templates';

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