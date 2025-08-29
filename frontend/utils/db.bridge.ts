// Database Bridge Utility
// Integrates existing Dexie database with new SQLite database
// Provides unified interface for both databases

import { sqliteDB, type CaseRecord, type StageRecord, type ExportRecord, type CommentRecord, type TaskRecord } from './db.sqlite';
import { addCase, getAllCases, updateCase, type LegalCase } from './db.dexie';

interface UnifiedCase {
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
  // Legacy Dexie fields
  stages?: any[];
}

interface UnifiedStage {
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

class DatabaseBridge {
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize SQLite database
      await sqliteDB.init();
      
      // Migrate existing data from Dexie to SQLite
      await this.migrateExistingData();
      
      this.isInitialized = true;
      console.log('Database bridge initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database bridge:', error);
      throw error;
    }
  }

  private async migrateExistingData(): Promise<void> {
    try {
      // Get all existing cases from Dexie
      const existingCases = await getAllCases();
      
      if (existingCases.length === 0) {
        console.log('No existing data to migrate');
        return;
      }

      console.log(`Migrating ${existingCases.length} existing cases to SQLite...`);

      for (const legacyCase of existingCases) {
        // Create case in SQLite
        const caseId = await sqliteDB.createCase({
          name: legacyCase.name,
          caseType: this.determineCaseType(legacyCase.stages),
          complexity: this.determineComplexity(legacyCase.stages),
          status: 'active',
          description: `Migrated from legacy database - ${legacyCase.name}`,
          tags: 'migrated,legacy'
        });

        // Migrate stages
        if (legacyCase.stages && legacyCase.stages.length > 0) {
          for (const stage of legacyCase.stages) {
            await sqliteDB.createStage({
              caseId,
              stageName: stage.stage,
              stageIndex: stage.stageIndex || 0,
              input: stage.input || '',
              output: stage.output || '',
              completedAt: stage.date,
              status: 'completed',
              metadata: JSON.stringify({
                migrated: true,
                originalId: stage.id,
                originalDate: stage.date
              })
            });
          }
        }

        // Track migration action
        await sqliteDB.trackAction(caseId, 'migration', {
          source: 'dexie',
          originalId: legacyCase.id,
          stagesCount: legacyCase.stages?.length || 0
        });
      }

      console.log('Data migration completed successfully');
    } catch (error) {
      console.error('Data migration failed:', error);
      // Continue without migration - SQLite will start fresh
    }
  }

  private determineCaseType(stages?: any[]): string {
    if (!stages || stages.length === 0) return 'عام';
    
    // Analyze stage content to determine case type
    const content = stages.map(s => s.input + ' ' + s.output).join(' ').toLowerCase();
    
    if (/ميراث|ورثة|إرث/i.test(content)) return 'ميراث';
    if (/طلاق|زواج|أحوال شخصية|حضانة|نفقة|مؤخر|شقاق|نزاع/i.test(content)) return 'أحوال شخصية';
    if (/عقد|تجاري|شركة|كمبيالة|شيك|مصرف/i.test(content)) return 'تجاري';
    if (/عقوبة|جريمة|جنحة|جزائي|جزائية/i.test(content)) return 'جنائي';
    if (/أرض|عقار|ملكية|حيازة|إخلاء/i.test(content)) return 'عقاري';
    if (/عمل|موظف|راتب|فصل|أجور|نقابة/i.test(content)) return 'عمل';
    if (/إداري|قرار إداري|إلغاء قرار|جهة إدارية/i.test(content)) return 'إداري';
    if (/إيجار|بدل إيجار|مأجور|مستأجر/i.test(content)) return 'إيجارات';
    
    return 'عام';
  }

  private determineComplexity(stages?: any[]): 'basic' | 'intermediate' | 'advanced' {
    if (!stages || stages.length === 0) return 'basic';
    
    const totalContent = stages.reduce((acc, s) => acc + (s.input?.length || 0) + (s.output?.length || 0), 0);
    const hasLegalTerms = /قانون|محكمة|عقوبة|حقوق|التزام|عقد|ميراث|طلاق|نزاع/i.test(
      stages.map(s => s.input + ' ' + s.output).join(' ')
    );
    
    if (totalContent > 10000 || stages.length > 8) return 'advanced';
    if (totalContent > 5000 || stages.length > 4 || hasLegalTerms) return 'intermediate';
    return 'basic';
  }

  // Unified case operations
  async createCase(caseData: Omit<UnifiedCase, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await this.ensureInitialized();

    // Create in SQLite (primary database)
    const caseId = await sqliteDB.createCase(caseData);

    // Also create in Dexie for backward compatibility
    try {
      await addCase({
        id: caseId,
        name: caseData.name,
        createdAt: new Date().toISOString(),
        stages: []
      });
    } catch (error) {
      console.warn('Failed to create case in Dexie:', error);
    }

    // Track action
    await sqliteDB.trackAction(caseId, 'case_created', {
      caseType: caseData.caseType,
      complexity: caseData.complexity
    });

    return caseId;
  }

  async getCase(id: string): Promise<UnifiedCase | null> {
    await this.ensureInitialized();
    return await sqliteDB.getCase(id);
  }

  async updateCase(id: string, updates: Partial<UnifiedCase>): Promise<void> {
    await this.ensureInitialized();
    
    await sqliteDB.updateCase(id, updates);
    
    // Track action
    await sqliteDB.trackAction(id, 'case_updated', {
      updatedFields: Object.keys(updates)
    });
  }

  async deleteCase(id: string): Promise<void> {
    await this.ensureInitialized();
    
    await sqliteDB.deleteCase(id);
    
    // Track action
    await sqliteDB.trackAction(id, 'case_deleted', {
      timestamp: new Date().toISOString()
    });
  }

  async listCases(filters?: {
    caseType?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<UnifiedCase[]> {
    await this.ensureInitialized();
    return await sqliteDB.listCases(filters);
  }

  // Unified stage operations
  async createStage(stageData: Omit<UnifiedStage, 'id' | 'createdAt'>): Promise<string> {
    await this.ensureInitialized();
    
    const stageId = await sqliteDB.createStage(stageData);
    
    // Track action
    await sqliteDB.trackAction(stageData.caseId, 'stage_created', {
      stageName: stageData.stageName,
      stageIndex: stageData.stageIndex
    });

    return stageId;
  }

  async getStagesForCase(caseId: string): Promise<UnifiedStage[]> {
    await this.ensureInitialized();
    return await sqliteDB.getStagesForCase(caseId);
  }

  // Search functionality
  async searchCases(query: string, filters?: {
    caseType?: string;
    status?: string;
    limit?: number;
  }): Promise<UnifiedCase[]> {
    await this.ensureInitialized();
    return await sqliteDB.searchCases(query, filters);
  }

  // Analytics
  async getAnalytics(timeRange?: { start: string; end: string }) {
    await this.ensureInitialized();
    return await sqliteDB.getAnalytics(timeRange);
  }

  async trackAction(caseId: string, action: string, metadata?: any, duration?: number): Promise<void> {
    await this.ensureInitialized();
    await sqliteDB.trackAction(caseId, action, metadata, duration);
  }

  // Export operations
  async createExport(exportData: Omit<ExportRecord, 'id' | 'createdAt'>): Promise<string> {
    await this.ensureInitialized();
    return await sqliteDB.createExport(exportData);
  }

  // User preferences
  async setPreference(key: string, value: string): Promise<void> {
    await this.ensureInitialized();
    await sqliteDB.setPreference(key, value);
  }

  async getPreference(key: string): Promise<string | null> {
    await this.ensureInitialized();
    return await sqliteDB.getPreference(key);
  }

  // Comments
  async createComment(comment: Omit<CommentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await this.ensureInitialized();
    const id = await sqliteDB.createComment(comment);
    await sqliteDB.trackAction(comment.caseId, 'comment_created', { stageId: comment.stageId });
    return id;
  }

  async listComments(caseId: string, stageId?: string): Promise<CommentRecord[]> {
    await this.ensureInitialized();
    return await sqliteDB.listComments(caseId, stageId);
  }

  async updateComment(id: string, updates: Partial<CommentRecord>): Promise<void> {
    await this.ensureInitialized();
    await sqliteDB.updateComment(id, updates);
  }

  async deleteComment(id: string, meta: { caseId: string }): Promise<void> {
    await this.ensureInitialized();
    await sqliteDB.deleteComment(id);
    await sqliteDB.trackAction(meta.caseId, 'comment_deleted', { id });
  }

  // Tasks
  async createTask(task: Omit<TaskRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await this.ensureInitialized();
    const id = await sqliteDB.createTask(task);
    await sqliteDB.trackAction(task.caseId, 'task_created', { stageId: task.stageId, priority: task.priority, dueDate: task.dueDate });
    return id;
  }

  async listTasks(caseId: string, filters?: { stageId?: string; status?: TaskRecord['status']; assignee?: string }): Promise<TaskRecord[]> {
    await this.ensureInitialized();
    return await sqliteDB.listTasks(caseId, filters);
  }

  async updateTask(id: string, updates: Partial<TaskRecord>, meta: { caseId: string }): Promise<void> {
    await this.ensureInitialized();
    await sqliteDB.updateTask(id, updates);
    await sqliteDB.trackAction(meta.caseId, 'task_updated', { id, updates });
  }

  async deleteTask(id: string, meta: { caseId: string }): Promise<void> {
    await this.ensureInitialized();
    await sqliteDB.deleteTask(id);
    await sqliteDB.trackAction(meta.caseId, 'task_deleted', { id });
  }

  // Database maintenance
  async compact(): Promise<void> {
    await this.ensureInitialized();
    await sqliteDB.compact();
  }

  async exportDatabase(): Promise<Uint8Array> {
    await this.ensureInitialized();
    return await sqliteDB.exportDatabase();
  }

  async importDatabase(data: Uint8Array): Promise<void> {
    await this.ensureInitialized();
    await sqliteDB.importDatabase(data);
  }

  // Utility methods
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }
  }

  // Migration status
  async getMigrationStatus(): Promise<{
    isMigrated: boolean;
    totalCases: number;
    lastMigration?: string;
  }> {
    await this.ensureInitialized();
    
    const analytics = await sqliteDB.getAnalytics();
    const migrationActions = await this.getMigrationActions();
    
    return {
      isMigrated: migrationActions.length > 0,
      totalCases: analytics.totalCases,
      lastMigration: migrationActions[0]?.timestamp
    };
  }

  private async getMigrationActions(): Promise<Array<{ timestamp: string }>> {
    // This would need to be implemented in the SQLite database
    // For now, return empty array
    return [];
  }

  // Cleanup
  async close(): Promise<void> {
    if (this.isInitialized) {
      await sqliteDB.close();
      this.isInitialized = false;
    }
  }
}

// Singleton instance
export const dbBridge = new DatabaseBridge();

// Export types
export type { UnifiedCase, UnifiedStage };
