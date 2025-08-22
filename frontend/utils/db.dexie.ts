import Dexie, { Table } from 'dexie';

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
  content: string;
  createdAt: string;
  updatedAt: string;
}

class LegalDB extends Dexie {
  cases!: Table<LegalCase, string>;
  templates!: Table<LegalTemplate, string>;

  constructor() {
    super('legal_db');
    this.version(1).stores({
      cases: 'id, name, createdAt',
      templates: 'id, name, updatedAt'
    });
  }
}

export const db = new LegalDB();

// Cases CRUD
export async function getAllCases(): Promise<LegalCase[]> {
  return await db.cases.orderBy('createdAt').reverse().toArray();
}

export async function saveAllCases(cases: LegalCase[]): Promise<void> {
  await db.cases.clear();
  await db.cases.bulkAdd(cases);
}

export async function addCase(newCase: LegalCase): Promise<void> {
  await db.cases.add(newCase);
}

export async function updateCase(updatedCase: LegalCase): Promise<void> {
  await db.cases.put(updatedCase);
}

export async function deleteCase(caseId: string): Promise<void> {
  await db.cases.delete(caseId);
}

export async function getCaseById(caseId: string): Promise<LegalCase | undefined> {
  return await db.cases.get(caseId);
}

// Templates CRUD
export async function getAllTemplates(): Promise<LegalTemplate[]> {
  return await db.templates.orderBy('updatedAt').reverse().toArray();
}

export async function saveAllTemplates(templates: LegalTemplate[]): Promise<void> {
  await db.templates.clear();
  await db.templates.bulkAdd(templates);
}

export async function addTemplate(t: LegalTemplate): Promise<void> {
  await db.templates.add(t);
}

export async function updateTemplate(t: LegalTemplate): Promise<void> {
  await db.templates.put(t);
}

export async function deleteTemplate(id: string): Promise<void> {
  await db.templates.delete(id);
} 