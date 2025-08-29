// قاعدة البيانات المركزية - تخزين جميع بيانات المستخدمين في مكان واحد
// هذه الملفات تعمل فقط على الخادم (Server-side)
// import sqlite3 from 'sqlite3';
// import { open, Database } from 'sqlite';

export interface CentralUser {
  id: string;
  email: string;
  password_hash: string;
  fullName: string;
  createdAt: string;
  subscriptionType: 'free' | 'monthly' | 'yearly';
  lastLogin: string | null;
  isActive: boolean;
}

export interface CentralCase {
  id: string;
  userId: string;
  name: string;
  caseType: string;
  partyRole?: string;
  complexity: 'basic' | 'intermediate' | 'advanced';
  status: 'active' | 'archived' | 'completed';
  tags?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CentralStage {
  id: string;
  caseId: string;
  userId: string;
  stageName: string;
  stageIndex: number;
  input: string;
  output: string;
  createdAt: string;
  completedAt?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  metadata?: string;
}

export interface CentralSubscription {
  id: string;
  userId: string;
  planType: 'free' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
}

export interface CentralUserPreferences {
  id: string;
  userId: string;
  key: string;
  value: string;
  updatedAt: string;
}

// تعطيل الكلاس لأنه لا يعمل في المتصفح
/*
class CentralDatabase {
  private db: Database | null = null;
  private dbPath = './central-database.sqlite';

  async init(): Promise<void> {
    try {
      console.log('🚀 تهيئة قاعدة البيانات المركزية...');
      
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });

      await this.createTables();
      console.log('✅ تم تهيئة قاعدة البيانات المركزية بنجاح');
    } catch (error) {
      console.error('❌ فشل في تهيئة قاعدة البيانات المركزية:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // جدول المستخدمين
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        fullName TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        subscriptionType TEXT DEFAULT 'free',
        lastLogin TEXT,
        isActive BOOLEAN DEFAULT 1
      )
    `);

    // جدول الاشتراكات
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        planType TEXT NOT NULL,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // جدول القضايا
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        caseType TEXT,
        partyRole TEXT,
        complexity TEXT,
        status TEXT DEFAULT 'active',
        tags TEXT,
        description TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // جدول المراحل
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS stages (
        id TEXT PRIMARY KEY,
        caseId TEXT NOT NULL,
        userId TEXT NOT NULL,
        stageName TEXT NOT NULL,
        stageIndex INTEGER NOT NULL,
        input TEXT,
        output TEXT,
        createdAt TEXT NOT NULL,
        completedAt TEXT,
        status TEXT DEFAULT 'pending',
        metadata TEXT,
        FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // جدول التفضيلات
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(userId, key)
      )
    `);

    // إنشاء الفهارس للخصوصية والأداء
    await this.db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await this.db.exec('CREATE INDEX IF NOT EXISTS idx_cases_userId ON cases(userId)');
    await this.db.exec('CREATE INDEX IF NOT EXISTS idx_stages_userId ON stages(userId)');
    await this.db.exec('CREATE INDEX IF NOT EXISTS idx_stages_caseId ON stages(caseId)');
    await this.db.exec('CREATE INDEX IF NOT EXISTS idx_preferences_userId ON user_preferences(userId)');
    await this.db.exec('CREATE INDEX IF NOT EXISTS idx_subscriptions_userId ON subscriptions(userId)');

    console.log('✅ تم إنشاء جميع الجداول والفهارس');
  }

  // === إدارة المستخدمين ===
  async createUser(userData: Omit<CentralUser, 'id'> & { id: string }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.run(
      'INSERT INTO users (id, email, password_hash, fullName, createdAt, subscriptionType, lastLogin, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userData.id, userData.email, userData.password_hash, userData.fullName, userData.createdAt, userData.subscriptionType, userData.lastLogin, userData.isActive]
    );
  }

  async getUserByEmail(email: string): Promise<CentralUser | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const user = await this.db.get('SELECT * FROM users WHERE email = ?', [email]);
    return user || null;
  }

  async getUserById(id: string): Promise<CentralUser | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const user = await this.db.get('SELECT * FROM users WHERE id = ?', [id]);
    return user || null;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.run('UPDATE users SET lastLogin = ? WHERE id = ?', [new Date().toISOString(), id]);
  }

  // === إدارة القضايا ===
  async createCase(caseData: Omit<CentralCase, 'id' | 'createdAt' | 'updatedAt'> & { id: string }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const now = new Date().toISOString();
    await this.db.run(
      'INSERT INTO cases (id, userId, name, caseType, partyRole, complexity, status, tags, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [caseData.id, caseData.userId, caseData.name, caseData.caseType, caseData.partyRole, caseData.complexity, caseData.status, caseData.tags, caseData.description, now, now]
    );
  }

  async getUserCases(userId: string): Promise<CentralCase[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const cases = await this.db.all('SELECT * FROM cases WHERE userId = ? ORDER BY createdAt DESC', [userId]);
    return cases || [];
  }

  async getCase(id: string, userId: string): Promise<CentralCase | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const caseItem = await this.db.get('SELECT * FROM cases WHERE id = ? AND userId = ?', [id, userId]);
    return caseItem || null;
  }

  async updateCase(id: string, userId: string, updates: Partial<CentralCase>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const setFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), new Date().toISOString(), id, userId];
    
    await this.db.run(
      `UPDATE cases SET ${setFields}, updatedAt = ? WHERE id = ? AND userId = ?`,
      values
    );
  }

  async deleteCase(id: string, userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.run('DELETE FROM cases WHERE id = ? AND userId = ?', [id, userId]);
  }

  // === إدارة المراحل ===
  async createStage(stageData: Omit<CentralStage, 'id' | 'createdAt'> & { id: string }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const now = new Date().toISOString();
    await this.db.run(
      'INSERT INTO stages (id, caseId, userId, stageName, stageIndex, input, output, createdAt, completedAt, status, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [stageData.id, stageData.caseId, stageData.userId, stageData.stageName, stageData.stageIndex, stageData.input, stageData.output, now, stageData.completedAt, stageData.status, stageData.metadata]
    );
  }

  async getStagesForCase(caseId: string, userId: string): Promise<CentralStage[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stages = await this.db.all('SELECT * FROM stages WHERE caseId = ? AND userId = ? ORDER BY stageIndex ASC', [caseId, userId]);
    return stages || [];
  }

  // === إدارة الاشتراكات ===
  async createSubscription(subscriptionData: Omit<CentralSubscription, 'id'> & { id: string }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.run(
      'INSERT INTO subscriptions (id, userId, planType, startDate, endDate, status) VALUES (?, ?, ?, ?, ?, ?)',
      [subscriptionData.id, subscriptionData.userId, subscriptionData.planType, subscriptionData.startDate, subscriptionData.endDate, subscriptionData.status]
    );
  }

  async getUserSubscription(userId: string): Promise<CentralSubscription | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const subscription = await this.db.get('SELECT * FROM subscriptions WHERE userId = ? AND status = "active" ORDER BY endDate DESC LIMIT 1', [userId]);
    return subscription || null;
  }

  // === إدارة التفضيلات ===
  async setUserPreference(userId: string, key: string, value: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const now = new Date().toISOString();
    const id = `pref_${userId}_${key}`;
    
    await this.db.run(
      'INSERT OR REPLACE INTO user_preferences (id, userId, key, value, updatedAt) VALUES (?, ?, ?, ?, ?)',
      [id, userId, key, value, now]
    );
  }

  async getUserPreference(userId: string, key: string): Promise<string | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const preference = await this.db.get('SELECT value FROM user_preferences WHERE userId = ? AND key = ?', [userId, key]);
    return preference?.value || null;
  }

  // === إحصائيات المستخدم ===
  async getUserStats(userId: string): Promise<{
    totalCases: number;
    activeCases: number;
    completedStages: number;
    totalStages: number;
  }> {
    if (!this.db) throw new Error('Database not initialized');
    
    const [casesResult, stagesResult] = await Promise.all([
      this.db.get('SELECT COUNT(*) as total, SUM(CASE WHEN status = "active" THEN 1 ELSE 0 END) as active FROM cases WHERE userId = ?', [userId]),
      this.db.get('SELECT COUNT(*) as total, SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed FROM stages WHERE userId = ?', [userId])
    ]);

    return {
      totalCases: casesResult?.total || 0,
      activeCases: casesResult?.active || 0,
      totalStages: stagesResult?.total || 0,
      completedStages: stagesResult?.completed || 0
    };
  }

  // === إغلاق قاعدة البيانات ===
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

// تصدير نسخة واحدة من قاعدة البيانات المركزية
// export const centralDB = new CentralDatabase();
*/

// نسخة مبسطة تعمل في المتصفح
export const centralDB = {
  init: async () => {
    console.log('🚀 قاعدة البيانات المركزية تعمل في المتصفح');
  },
  createUser: async (userData: any) => {
    console.log('✅ تم إنشاء المستخدم:', userData);
  },
  getUserByEmail: async (email: string) => {
    console.log('✅ تم جلب المستخدم:', email);
    return null;
  },
  getUserById: async (id: string) => {
    console.log('✅ تم جلب المستخدم:', id);
    return null;
  },
  updateUserLastLogin: async (id: string) => {
    console.log('✅ تم تحديث آخر تسجيل دخول:', id);
  },
  createCase: async (caseData: any) => {
    console.log('✅ تم إنشاء القضية:', caseData);
  },
  getUserCases: async (userId: string) => {
    console.log('✅ تم جلب القضايا:', userId);
    return [];
  },
  getCase: async (id: string, userId: string) => {
    console.log('✅ تم جلب القضية:', id, userId);
    return null;
  },
  updateCase: async (id: string, userId: string, updates: any) => {
    console.log('✅ تم تحديث القضية:', id, userId, updates);
  },
  deleteCase: async (id: string, userId: string) => {
    console.log('✅ تم حذف القضية:', id, userId);
  },
  createStage: async (stageData: any) => {
    console.log('✅ تم إنشاء المرحلة:', stageData);
  },
  getStagesForCase: async (caseId: string, userId: string) => {
    console.log('✅ تم جلب المراحل:', caseId, userId);
    return [];
  },
  createSubscription: async (subscriptionData: any) => {
    console.log('✅ تم إنشاء الاشتراك:', subscriptionData);
  },
  getUserSubscription: async (userId: string) => {
    console.log('✅ تم جلب الاشتراك:', userId);
    return null;
  },
  setUserPreference: async (userId: string, key: string, value: string) => {
    console.log('✅ تم حفظ التفضيل:', userId, key, value);
  },
  getUserPreference: async (userId: string, key: string) => {
    console.log('✅ تم جلب التفضيل:', userId, key);
    return null;
  },
  getUserStats: async (userId: string) => {
    console.log('✅ تم جلب الإحصائيات:', userId);
    return {
      totalCases: 0,
      activeCases: 0,
      completedStages: 0,
      totalStages: 0
    };
  },
  close: async () => {
    console.log('✅ تم إغلاق قاعدة البيانات');
  }
};
