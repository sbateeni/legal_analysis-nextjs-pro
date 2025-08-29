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

  // إضافة دالة exec للتنفيذ المباشر للاستعلامات SQL
  async exec(sql: string, params?: any[]): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      if (params && params.length > 0) {
        const stmt = this.db.prepare(sql);
        stmt.bind(params);
        const result = stmt.run();
        stmt.free();
        return result;
      } else {
        return this.db.exec(sql);
      }
    } catch (error) {
      console.error('SQL execution error:', error);
      throw error;
    }
  }

  // إضافة دالة query للاستعلامات التي تعيد نتائج
  async query(sql: string, params?: any[]): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const stmt = this.db.prepare(sql);
      
      // ربط المعاملات إذا كانت موجودة
      if (params && params.length > 0) {
        stmt.bind(params);
      }
      
      const results: any[] = [];
      
      // استخدام step() للحصول على النتائج
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(row);
      }
      
      stmt.free();
      return results;
    } catch (error) {
      console.error('SQL query error:', error);
      throw error;
    }
  }

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
    
    try {
      // Load sql.js init function dynamically only in browser
      const { default: initSqlJs } = await import('sql.js');
      
      // Initialize sql.js and return the SQL object
      const SQL = await initSqlJs({
        // Explicitly set the path to the wasm file
        locateFile: (file: string) => {
          console.log('Attempting to load WASM file:', file);
          // Try multiple possible locations for the wasm file
          return `/sql-wasm.wasm`;
        }
      });
      
      return SQL;
    } catch (error) {
      console.error('Failed to load SQL.js:', error);
      
      // Fallback: try with node_modules path
      try {
        const { default: initSqlJs } = await import('sql.js');
        const SQL = await initSqlJs({
          locateFile: (file: string) => `/node_modules/sql.js/dist/${file}`
        });
        return SQL;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw new Error('SQL.js failed to load in browser context');
      }
    }
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
        userId TEXT NOT NULL,
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
        userId TEXT NOT NULL,
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
        userId TEXT NOT NULL,
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
        userId TEXT NOT NULL,
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
        userId TEXT NOT NULL,
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
        userId TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        UNIQUE(userId, key)
      );

      -- Comments table
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
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
        userId TEXT NOT NULL,
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
      CREATE INDEX IF NOT EXISTS idx_cases_user ON cases(userId);
      CREATE INDEX IF NOT EXISTS idx_cases_type ON cases(caseType);
      CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
      CREATE INDEX IF NOT EXISTS idx_cases_created ON cases(createdAt);
      CREATE INDEX IF NOT EXISTS idx_stages_user ON stages(userId);
      CREATE INDEX IF NOT EXISTS idx_stages_case ON stages(caseId);
      CREATE INDEX IF NOT EXISTS idx_stages_status ON stages(status);
      CREATE INDEX IF NOT EXISTS idx_exports_user ON exports(userId);
      CREATE INDEX IF NOT EXISTS idx_search_user ON search_index(userId);
      CREATE INDEX IF NOT EXISTS idx_search_content ON search_index(content);
      CREATE INDEX IF NOT EXISTS idx_search_type ON search_index(type);
      CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics(userId);
      CREATE INDEX IF NOT EXISTS idx_analytics_action ON analytics(action);
      CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp);
      CREATE INDEX IF NOT EXISTS idx_preferences_user ON user_preferences(userId);
      CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(userId);
      CREATE INDEX IF NOT EXISTS idx_comments_case ON comments(caseId);
      CREATE INDEX IF NOT EXISTS idx_comments_stage ON comments(stageId);
      CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parentId);
      CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(userId);
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
  async createCase(caseData: Omit<CaseRecord, 'id' | 'createdAt' | 'updatedAt'> & { userId: string }): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `case_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO cases (id, userId, name, caseType, partyRole, complexity, createdAt, updatedAt, status, tags, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.bind([
      id, caseData.userId, caseData.name, caseData.caseType, caseData.partyRole, 
      caseData.complexity, now, now, caseData.status || 'active',
      caseData.tags, caseData.description
    ]);
    stmt.run();

    stmt.free();
    return id;
  }

  async getCase(id: string, userId: string): Promise<CaseRecord | null> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM cases WHERE id = ? AND userId = ?');
    stmt.bind([id, userId]);
    const result = stmt.get();
    stmt.free();

    return result ? result as CaseRecord : null;
  }

  async updateCase(id: string, userId: string, updates: Partial<CaseRecord>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const fields = Object.keys(updates).filter(key => key !== 'id');
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = [...fields.map(field => updates[field as keyof CaseRecord]), new Date().toISOString(), id, userId];

    const stmt = this.db.prepare(`UPDATE cases SET ${setClause}, updatedAt = ? WHERE id = ? AND userId = ?`);
    stmt.bind(values);
    stmt.run();
    stmt.free();
  }

  async deleteCase(id: string, userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('DELETE FROM cases WHERE id = ? AND userId = ?');
    stmt.bind([id, userId]);
    stmt.run();
    stmt.free();
  }

  async listCases(userId: string, filters?: {
    caseType?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<CaseRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = 'SELECT * FROM cases WHERE userId = ?';
    const conditions: string[] = [];
    const values: any[] = [userId];

    if (filters?.caseType) {
      conditions.push('caseType = ?');
      values.push(filters.caseType);
    }

    if (filters?.status) {
      conditions.push('status = ?');
      values.push(filters.status);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
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
    stmt.bind(values);
    const results: any[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push(row);
    }
    stmt.free();

    return results as CaseRecord[];
  }

  // Stage operations
  async createStage(stageData: Omit<StageRecord, 'id' | 'createdAt'> & { userId: string }): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `stage_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO stages (id, userId, caseId, stageName, stageIndex, input, output, createdAt, completedAt, status, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.bind([
      id, stageData.userId, stageData.caseId, stageData.stageName, stageData.stageIndex,
      stageData.input, stageData.output, now, stageData.completedAt,
      stageData.status || 'pending', stageData.metadata
    ]);
    stmt.run();

    stmt.free();
    return id;
  }

  async getStagesForCase(caseId: string, userId: string): Promise<StageRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM stages WHERE caseId = ? AND userId = ? ORDER BY stageIndex');
    stmt.bind([caseId, userId]);
    const results: any[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push(row);
    }
    stmt.free();

    return results as StageRecord[];
  }

  // Search functionality
  async searchCases(query: string, userId: string, filters?: {
    caseType?: string;
    status?: string;
    limit?: number;
  }): Promise<CaseRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    let sql = `
      SELECT DISTINCT c.* FROM cases c
      JOIN search_index si ON c.id = si.caseId
      WHERE si.content LIKE ? AND c.userId = ?
    `;

    const values: any[] = [`%${query}%`, userId];

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
    stmt.bind(values);
    const results: any[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push(row);
    }
    stmt.free();

    return results as CaseRecord[];
  }

  // Analytics
  async trackAction(caseId: string, userId: string, action: string, metadata?: any, duration?: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `analytics_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const timestamp = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO analytics (id, userId, caseId, action, timestamp, metadata, duration)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.bind([
      id, userId, caseId, action, timestamp,
      metadata ? JSON.stringify(metadata) : null, duration
    ]);
    stmt.run();

    stmt.free();
  }

  async getAnalytics(userId: string, timeRange?: { start: string; end: string }): Promise<{
    totalCases: number;
    casesByType: Record<string, number>;
    casesByStatus: Record<string, number>;
    averageStagesPerCase: number;
    mostCommonActions: Array<{ action: string; count: number }>;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    // Get basic stats
    const totalCases = this.db.exec(`SELECT COUNT(*) as count FROM cases WHERE userId = '${userId}'`)[0]?.[0] || 0;
    
    // Cases by type
    const casesByType = this.db.exec(`SELECT caseType, COUNT(*) as count FROM cases WHERE userId = '${userId}' GROUP BY caseType`);
    const typeStats: Record<string, number> = {};
    casesByType[0]?.forEach((row: any) => {
      typeStats[row[0]] = row[1];
    });

    // Cases by status
    const casesByStatus = this.db.exec(`SELECT status, COUNT(*) as count FROM cases WHERE userId = '${userId}' GROUP BY status`);
    const statusStats: Record<string, number> = {};
    casesByStatus[0]?.forEach((row: any) => {
      statusStats[row[0]] = row[1];
    });

    // Average stages per case
    const avgStages = this.db.exec(`SELECT AVG(stage_count) as avg FROM (SELECT caseId, COUNT(*) as stage_count FROM stages WHERE userId = '${userId}' GROUP BY caseId)`)[0]?.[0] || 0;

    // Most common actions
    const actions = this.db.exec(`SELECT action, COUNT(*) as count FROM analytics WHERE userId = '${userId}' GROUP BY action ORDER BY count DESC LIMIT 10`);
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

  async listAnalytics(userId: string, caseId?: string, limit: number = 200): Promise<AnalyticsRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    let sql = 'SELECT id, caseId, action, timestamp, metadata, duration FROM analytics WHERE userId = ?';
    const params: any[] = [userId];
    if (caseId) {
      sql += ' AND caseId = ?';
      params.push(caseId);
    }
    sql += ' ORDER BY timestamp DESC';
    if (limit) {
      sql += ' LIMIT ?';
      params.push(limit);
    }
    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    const results: any[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push(row);
    }
    stmt.free();
    return (results || []).map((row: any) => ({
      id: row.id,
      caseId: row.caseId,
      action: row.action,
      timestamp: row.timestamp,
      metadata: row.metadata,
      duration: row.duration,
    })) as AnalyticsRecord[];
  }

  // Export operations
  async createExport(exportData: Omit<ExportRecord, 'id' | 'createdAt'> & { userId: string }): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `export_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const createdAt = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO exports (id, userId, caseId, type, filename, createdAt, fileSize, preferences)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.bind([
      id, exportData.userId, exportData.caseId, exportData.type, exportData.filename,
      createdAt, exportData.fileSize, exportData.preferences
    ]);
    stmt.run();

    stmt.free();
    return id;
  }

  // User preferences
  async setPreference(userId: string, key: string, value: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO user_preferences (id, userId, key, value, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `);

    const id = `pref_${userId}_${key}`;
    stmt.bind([id, userId, key, value, now]);
    stmt.run();
    stmt.free();
  }

  async getPreference(userId: string, key: string): Promise<string | null> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT value FROM user_preferences WHERE userId = ? AND key = ?');
    stmt.bind([userId, key]);
    const result = stmt.get();
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
    const result = this.db.export();
    // Ensure we return a proper Uint8Array
    if (result instanceof Uint8Array) {
      return result;
    }
    // If it's not a Uint8Array, convert it
    return new Uint8Array(result);
  }

  async importDatabase(data: Uint8Array): Promise<void> {
    if (!this.sqlite) throw new Error('SQLite not loaded');

    // Close existing database
    if (this.db) {
      this.db.close();
    }

    // Create new database from imported data
    // Ensure data is properly typed for sql.js
    const dataArray = data instanceof Uint8Array ? data : new Uint8Array(data);
    this.db = new this.sqlite.Database(dataArray);
    
    // Persist to OPFS
    await this.persistToOPFS();
  }

  // Comments CRUD
  async createComment(comment: Omit<CommentRecord, 'id' | 'createdAt' | 'updatedAt'> & { userId: string }): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');
    const id = `comment_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO comments (id, userId, caseId, stageId, author, content, createdAt, updatedAt, parentId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.bind([id, comment.userId, comment.caseId, comment.stageId || null, comment.author, comment.content, now, now, comment.parentId || null]);
    stmt.run();
    stmt.free();
    return id;
  }

  async listComments(caseId: string, userId: string, stageId?: string): Promise<CommentRecord[]> {
    if (!this.db) throw new Error('Database not initialized');
    let sql = 'SELECT * FROM comments WHERE caseId = ? AND userId = ?';
    const params: any[] = [caseId, userId];
    if (stageId) { sql += ' AND stageId = ?'; params.push(stageId); }
    sql += ' ORDER BY createdAt ASC';
    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    const results: any[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push(row);
    }
    stmt.free();
    return results as CommentRecord[];
  }

  async updateComment(id: string, userId: string, updates: Partial<CommentRecord>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const fields = Object.keys(updates).filter(k => !['id','createdAt'].includes(k));
    if (fields.length === 0) return;
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => (updates as any)[f]);
    values.push(new Date().toISOString());
    values.push(id);
    values.push(userId);
    const stmt = this.db.prepare(`UPDATE comments SET ${setClause}, updatedAt = ? WHERE id = ? AND userId = ?`);
    stmt.bind(values);
    stmt.run();
    stmt.free();
  }

  async deleteComment(id: string, userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare('DELETE FROM comments WHERE id = ? AND userId = ?');
    stmt.bind([id, userId]);
    stmt.run();
    stmt.free();
  }

  // Tasks CRUD
  async createTask(task: Omit<TaskRecord, 'id' | 'createdAt' | 'updatedAt'> & { userId: string }): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');
    const id = `task_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO tasks (id, userId, caseId, stageId, title, description, assignee, dueDate, status, priority, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.bind([
      id, task.userId, task.caseId, task.stageId || null, task.title, task.description || null,
      task.assignee || null, task.dueDate || null, task.status || 'open', task.priority || 'medium', now, now
    ]);
    stmt.run();
    stmt.free();
    return id;
  }

  async listTasks(caseId: string, userId: string, filters?: { stageId?: string; status?: TaskRecord['status']; assignee?: string }): Promise<TaskRecord[]> {
    if (!this.db) throw new Error('Database not initialized');
    let sql = 'SELECT * FROM tasks WHERE caseId = ? AND userId = ?';
    const params: any[] = [caseId, userId];
    if (filters?.stageId) { sql += ' AND stageId = ?'; params.push(filters.stageId); }
    if (filters?.status) { sql += ' AND status = ?'; params.push(filters.status); }
    if (filters?.assignee) { sql += ' AND assignee = ?'; params.push(filters.assignee); }
    sql += ' ORDER BY COALESCE(dueDate, createdAt) ASC';
    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    const results: any[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push(row);
    }
    stmt.free();
    return results as TaskRecord[];
  }

  async updateTask(id: string, userId: string, updates: Partial<TaskRecord>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const fields = Object.keys(updates).filter(k => !['id','createdAt'].includes(k));
    if (fields.length === 0) return;
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => (updates as any)[f]);
    values.push(new Date().toISOString());
    values.push(id);
    values.push(userId);
    const stmt = this.db.prepare(`UPDATE tasks SET ${setClause}, updatedAt = ? WHERE id = ? AND userId = ?`);
    stmt.bind(values);
    stmt.run();
    stmt.free();
  }

  async deleteTask(id: string, userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ? AND userId = ?');
    stmt.bind([id, userId]);
    stmt.run();
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


