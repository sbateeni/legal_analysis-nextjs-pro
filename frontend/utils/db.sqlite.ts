// SQLite Database Utility using WASM + OPFS
// Advanced local database for commercial features

// Types for database schema
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
  metadata?: string; // JSON string for additional data
}

export interface ExportRecord {
  id: string;
  caseId: string;
  type: 'pdf' | 'docx' | 'excel';
  filename: string;
  createdAt: string;
  fileSize: number;
  preferences?: string; // JSON string for export settings
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

// Database configuration
const DB_NAME = 'legal_analysis.db';
const DB_VERSION = 1;

class SQLiteDatabase {
  private db: any = null;
  private sqlite: any = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load SQLite WASM
      this.sqlite = await this.loadSQLiteWASM();
      
      // Initialize database
      await this.initializeDatabase();
      
      this.isInitialized = true;
      console.log('SQLite database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SQLite database:', error);
      throw error;
    }
  }

  private async loadSQLiteWASM(): Promise<any> {
    // Dynamic import of sql.js only on client to avoid SSR fs requirement
    if (typeof window === 'undefined') {
      throw new Error('SQLite is only available in the browser context');
    }
    // Use runtime-only dynamic import to avoid bundler static resolution of 'sql.js'
    const dynamicImport = new Function('s', 'return import(s)');
    const sqlWasm = await (dynamicImport as (s: string) => Promise<any>)('sql.js');
    return sqlWasm.default;
  }

  private async initializeDatabase(): Promise<void> {
    if (typeof window === 'undefined') throw new Error('SQLite import only allowed in browser');
    if (!this.sqlite) throw new Error('SQLite not loaded');

    // Create database in memory first, then persist to OPFS
    this.db = new this.sqlite.Database();
    
    // Create tables
    await this.createTables();
    
    // Persist to OPFS
    await this.persistToOPFS();
  }

  private async createTables(): Promise<void> {
    if (typeof window === 'undefined') throw new Error('Not available in SSR');
    if (!this.db) throw new Error('Database not initialized');

    const schema = `
      -- Cases table
      CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        caseType TEXT NOT NULL,
        partyRole TEXT,
        complexity TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        tags TEXT,
        description TEXT
      );

      -- Stages table
      CREATE TABLE IF NOT EXISTS stages (
        id TEXT PRIMARY KEY,
        caseId TEXT NOT NULL,
        stageName TEXT NOT NULL,
        stageIndex INTEGER NOT NULL,
        input TEXT NOT NULL,
        output TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        completedAt TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        metadata TEXT,
        FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE
      );

      -- Exports table
      CREATE TABLE IF NOT EXISTS exports (
        id TEXT PRIMARY KEY,
        caseId TEXT NOT NULL,
        type TEXT NOT NULL,
        filename TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        fileSize INTEGER NOT NULL,
        preferences TEXT,
        FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE
      );

      -- Search index table
      CREATE TABLE IF NOT EXISTS search_index (
        id TEXT PRIMARY KEY,
        caseId TEXT NOT NULL,
        stageId TEXT,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        tags TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE,
        FOREIGN KEY (stageId) REFERENCES stages(id) ON DELETE CASCADE
      );

      -- Analytics table
      CREATE TABLE IF NOT EXISTS analytics (
        id TEXT PRIMARY KEY,
        caseId TEXT NOT NULL,
        action TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        metadata TEXT,
        duration INTEGER,
        FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE
      );

      -- User preferences table
      CREATE TABLE IF NOT EXISTS user_preferences (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      -- Comments table
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        caseId TEXT NOT NULL,
        stageId TEXT,
        author TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        parentId TEXT,
        FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE,
        FOREIGN KEY (stageId) REFERENCES stages(id) ON DELETE CASCADE,
        FOREIGN KEY (parentId) REFERENCES comments(id) ON DELETE SET NULL
      );

      -- Tasks table
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        caseId TEXT NOT NULL,
        stageId TEXT,
        title TEXT NOT NULL,
        description TEXT,
        assignee TEXT,
        dueDate TEXT,
        status TEXT NOT NULL DEFAULT 'open',
        priority TEXT NOT NULL DEFAULT 'medium',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE,
        FOREIGN KEY (stageId) REFERENCES stages(id) ON DELETE CASCADE
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_cases_type ON cases(caseType);
      CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
      CREATE INDEX IF NOT EXISTS idx_cases_created ON cases(createdAt);
      CREATE INDEX IF NOT EXISTS idx_stages_case ON stages(caseId);
      CREATE INDEX IF NOT EXISTS idx_stages_status ON stages(status);
      CREATE INDEX IF NOT EXISTS idx_search_content ON search_index(content);
      CREATE INDEX IF NOT EXISTS idx_search_type ON search_index(type);
      CREATE INDEX IF NOT EXISTS idx_analytics_action ON analytics(action);
      CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp);
      CREATE INDEX IF NOT EXISTS idx_comments_case ON comments(caseId);
      CREATE INDEX IF NOT EXISTS idx_comments_stage ON comments(stageId);
      CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parentId);
      CREATE INDEX IF NOT EXISTS idx_tasks_case ON tasks(caseId);
      CREATE INDEX IF NOT EXISTS idx_tasks_stage ON tasks(stageId);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(dueDate);
    `;

    this.db.exec(schema);
  }

  private async persistToOPFS(): Promise<void> {
    if (!this.db) return;

    try {
      // Get database as Uint8Array
      const data = this.db.export();
      
      // Save to OPFS
      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle(DB_NAME, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(data);
      await writable.close();
      
      console.log('Database persisted to OPFS');
    } catch (error) {
      console.warn('Failed to persist to OPFS, using in-memory only:', error);
    }
  }

  // Case operations
  async createCase(caseData: Omit<CaseRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `case_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO cases (id, name, caseType, partyRole, complexity, createdAt, updatedAt, status, tags, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      id, caseData.name, caseData.caseType, caseData.partyRole, 
      caseData.complexity, now, now, caseData.status || 'active',
      caseData.tags, caseData.description
    ]);

    stmt.free();
    return id;
  }

  async getCase(id: string): Promise<CaseRecord | null> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM cases WHERE id = ?');
    const result = stmt.get([id]);
    stmt.free();

    return result ? result as CaseRecord : null;
  }

  async updateCase(id: string, updates: Partial<CaseRecord>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const fields = Object.keys(updates).filter(key => key !== 'id');
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = [...fields.map(field => updates[field as keyof CaseRecord]), new Date().toISOString(), id];

    const stmt = this.db.prepare(`UPDATE cases SET ${setClause}, updatedAt = ? WHERE id = ?`);
    stmt.run(values);
    stmt.free();
  }

  async deleteCase(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('DELETE FROM cases WHERE id = ?');
    stmt.run([id]);
    stmt.free();
  }

  async listCases(filters?: {
    caseType?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<CaseRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = 'SELECT * FROM cases';
    const conditions: string[] = [];
    const values: any[] = [];

    if (filters?.caseType) {
      conditions.push('caseType = ?');
      values.push(filters.caseType);
    }

    if (filters?.status) {
      conditions.push('status = ?');
      values.push(filters.status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY updatedAt DESC';

    if (filters?.limit) {
      query += ' LIMIT ?';
      values.push(filters.limit);
    }

    if (filters?.offset) {
      query += ' OFFSET ?';
      values.push(filters.offset);
    }

    const stmt = this.db.prepare(query);
    const results = stmt.all(values);
    stmt.free();

    return results as CaseRecord[];
  }

  // Stage operations
  async createStage(stageData: Omit<StageRecord, 'id' | 'createdAt'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `stage_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO stages (id, caseId, stageName, stageIndex, input, output, createdAt, completedAt, status, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      id, stageData.caseId, stageData.stageName, stageData.stageIndex,
      stageData.input, stageData.output, now, stageData.completedAt,
      stageData.status || 'pending', stageData.metadata
    ]);

    stmt.free();
    return id;
  }

  async getStagesForCase(caseId: string): Promise<StageRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM stages WHERE caseId = ? ORDER BY stageIndex');
    const results = stmt.all([caseId]);
    stmt.free();

    return results as StageRecord[];
  }

  // Search functionality
  async searchCases(query: string, filters?: {
    caseType?: string;
    status?: string;
    limit?: number;
  }): Promise<CaseRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    let sql = `
      SELECT DISTINCT c.* FROM cases c
      JOIN search_index si ON c.id = si.caseId
      WHERE si.content LIKE ?
    `;

    const values: any[] = [`%${query}%`];

    if (filters?.caseType) {
      sql += ' AND c.caseType = ?';
      values.push(filters.caseType);
    }

    if (filters?.status) {
      sql += ' AND c.status = ?';
      values.push(filters.status);
    }

    sql += ' ORDER BY c.updatedAt DESC';

    if (filters?.limit) {
      sql += ' LIMIT ?';
      values.push(filters.limit);
    }

    const stmt = this.db.prepare(sql);
    const results = stmt.all(values);
    stmt.free();

    return results as CaseRecord[];
  }

  // Analytics
  async trackAction(caseId: string, action: string, metadata?: any, duration?: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `analytics_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const timestamp = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO analytics (id, caseId, action, timestamp, metadata, duration)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      id, caseId, action, timestamp,
      metadata ? JSON.stringify(metadata) : null, duration
    ]);

    stmt.free();
  }

  async getAnalytics(timeRange?: { start: string; end: string }): Promise<{
    totalCases: number;
    casesByType: Record<string, number>;
    casesByStatus: Record<string, number>;
    averageStagesPerCase: number;
    mostCommonActions: Array<{ action: string; count: number }>;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    // Get basic stats
    const totalCases = this.db.exec('SELECT COUNT(*) as count FROM cases')[0]?.[0] || 0;
    
    // Cases by type
    const casesByType = this.db.exec('SELECT caseType, COUNT(*) as count FROM cases GROUP BY caseType');
    const typeStats: Record<string, number> = {};
    casesByType[0]?.forEach((row: any) => {
      typeStats[row[0]] = row[1];
    });

    // Cases by status
    const casesByStatus = this.db.exec('SELECT status, COUNT(*) as count FROM cases GROUP BY status');
    const statusStats: Record<string, number> = {};
    casesByStatus[0]?.forEach((row: any) => {
      statusStats[row[0]] = row[1];
    });

    // Average stages per case
    const avgStages = this.db.exec('SELECT AVG(stage_count) as avg FROM (SELECT caseId, COUNT(*) as stage_count FROM stages GROUP BY caseId)')[0]?.[0] || 0;

    // Most common actions
    const actions = this.db.exec('SELECT action, COUNT(*) as count FROM analytics GROUP BY action ORDER BY count DESC LIMIT 10');
    const actionStats: Array<{ action: string; count: number }> = [];
    actions[0]?.forEach((row: any) => {
      actionStats.push({ action: row[0], count: row[1] });
    });

    return {
      totalCases,
      casesByType: typeStats,
      casesByStatus: statusStats,
      averageStagesPerCase: Math.round(avgStages * 100) / 100,
      mostCommonActions: actionStats
    };
  }

  // Export operations
  async createExport(exportData: Omit<ExportRecord, 'id' | 'createdAt'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `export_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const createdAt = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO exports (id, caseId, type, filename, createdAt, fileSize, preferences)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      id, exportData.caseId, exportData.type, exportData.filename,
      createdAt, exportData.fileSize, exportData.preferences
    ]);

    stmt.free();
    return id;
  }

  // User preferences
  async setPreference(key: string, value: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO user_preferences (id, key, value, updatedAt)
      VALUES (?, ?, ?, ?)
    `);

    const id = `pref_${key}`;
    stmt.run([id, key, value, now]);
    stmt.free();
  }

  async getPreference(key: string): Promise<string | null> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT value FROM user_preferences WHERE key = ?');
    const result = stmt.get([key]);
    stmt.free();

    return result ? result.value : null;
  }

  // Database maintenance
  async compact(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    this.db.exec('VACUUM');
    await this.persistToOPFS();
  }

  async exportDatabase(): Promise<Uint8Array> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.export();
  }

  async importDatabase(data: Uint8Array): Promise<void> {
    if (!this.sqlite) throw new Error('SQLite not loaded');

    // Close existing database
    if (this.db) {
      this.db.close();
    }

    // Create new database from imported data
    this.db = new this.sqlite.Database(data);
    
    // Persist to OPFS
    await this.persistToOPFS();
  }

  // Comments CRUD
  async createComment(comment: Omit<CommentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');
    const id = `comment_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO comments (id, caseId, stageId, author, content, createdAt, updatedAt, parentId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run([id, comment.caseId, comment.stageId || null, comment.author, comment.content, now, now, comment.parentId || null]);
    stmt.free();
    return id;
  }

  async listComments(caseId: string, stageId?: string): Promise<CommentRecord[]> {
    if (!this.db) throw new Error('Database not initialized');
    let sql = 'SELECT * FROM comments WHERE caseId = ?';
    const params: any[] = [caseId];
    if (stageId) { sql += ' AND stageId = ?'; params.push(stageId); }
    sql += ' ORDER BY createdAt ASC';
    const stmt = this.db.prepare(sql);
    const results = stmt.all(params);
    stmt.free();
    return results as CommentRecord[];
  }

  async updateComment(id: string, updates: Partial<CommentRecord>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const fields = Object.keys(updates).filter(k => !['id','createdAt'].includes(k));
    if (fields.length === 0) return;
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => (updates as any)[f]);
    values.push(new Date().toISOString());
    values.push(id);
    const stmt = this.db.prepare(`UPDATE comments SET ${setClause}, updatedAt = ? WHERE id = ?`);
    stmt.run(values);
    stmt.free();
  }

  async deleteComment(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare('DELETE FROM comments WHERE id = ?');
    stmt.run([id]);
    stmt.free();
  }

  // Tasks CRUD
  async createTask(task: Omit<TaskRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');
    const id = `task_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO tasks (id, caseId, stageId, title, description, assignee, dueDate, status, priority, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run([
      id, task.caseId, task.stageId || null, task.title, task.description || null,
      task.assignee || null, task.dueDate || null, task.status || 'open', task.priority || 'medium', now, now
    ]);
    stmt.free();
    return id;
  }

  async listTasks(caseId: string, filters?: { stageId?: string; status?: TaskRecord['status']; assignee?: string }): Promise<TaskRecord[]> {
    if (!this.db) throw new Error('Database not initialized');
    let sql = 'SELECT * FROM tasks WHERE caseId = ?';
    const params: any[] = [caseId];
    if (filters?.stageId) { sql += ' AND stageId = ?'; params.push(filters.stageId); }
    if (filters?.status) { sql += ' AND status = ?'; params.push(filters.status); }
    if (filters?.assignee) { sql += ' AND assignee = ?'; params.push(filters.assignee); }
    sql += ' ORDER BY COALESCE(dueDate, createdAt) ASC';
    const stmt = this.db.prepare(sql);
    const results = stmt.all(params);
    stmt.free();
    return results as TaskRecord[];
  }

  async updateTask(id: string, updates: Partial<TaskRecord>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const fields = Object.keys(updates).filter(k => !['id','createdAt'].includes(k));
    if (fields.length === 0) return;
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => (updates as any)[f]);
    values.push(new Date().toISOString());
    values.push(id);
    const stmt = this.db.prepare(`UPDATE tasks SET ${setClause}, updatedAt = ? WHERE id = ?`);
    stmt.run(values);
    stmt.free();
  }

  async deleteTask(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?');
    stmt.run([id]);
    stmt.free();
  }

  // Cleanup
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.isInitialized = false;
  }
}

// Singleton instance
export const sqliteDB = new SQLiteDatabase();


