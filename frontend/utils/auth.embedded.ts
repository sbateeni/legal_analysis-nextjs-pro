import bcrypt from 'bcryptjs';
import { sqliteDB } from './db.sqlite';

export interface User {
  id: string;
  email: string;
  fullName: string;
  subscriptionType: 'free' | 'monthly' | 'yearly';
  subscriptionExpiry: Date | null;
  createdAt: Date;
  lastLogin: Date | null;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planType: 'free' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled';
}

export class EmbeddedAuth {
  private static instance: EmbeddedAuth;
  private currentUser: User | null = null;

  static getInstance(): EmbeddedAuth {
    if (!EmbeddedAuth.instance) {
      EmbeddedAuth.instance = new EmbeddedAuth();
    }
    return EmbeddedAuth.instance;
  }

  async init(): Promise<void> {
    try {
      await sqliteDB.init();
      await this.createAuthTables();
      console.log('Embedded authentication system initialized');
    } catch (error) {
      console.error('Failed to initialize auth system:', error);
      throw error;
    }
  }

  private async createAuthTables(): Promise<void> {
    // جدول المستخدمين
    await sqliteDB.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        subscription_type TEXT DEFAULT 'free',
        subscription_expiry DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        is_active BOOLEAN DEFAULT 1
      )
    `);

    // جدول الاشتراكات
    await sqliteDB.exec(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        plan_type TEXT NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        status TEXT DEFAULT 'active',
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // جدول القضايا (محدث)
    await sqliteDB.exec(`
      CREATE TABLE IF NOT EXISTS user_cases (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        case_type TEXT,
        party_role TEXT,
        complexity TEXT,
        data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);
  }

  async registerUser(email: string, password: string, fullName: string): Promise<string> {
    try {
      // التحقق من عدم وجود المستخدم
      const existingUsers = await sqliteDB.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers && existingUsers.length > 0) {
        throw new Error('المستخدم موجود بالفعل');
      }

      // إنشاء معرف فريد
      const userId = this.generateId();
      
      // تشفير كلمة المرور
      const passwordHash = await bcrypt.hash(password, 12);
      
      // إنشاء المستخدم
      await sqliteDB.exec(
        'INSERT INTO users (id, email, password_hash, full_name, subscription_type) VALUES (?, ?, ?, ?, ?)',
        [userId, email, passwordHash, fullName, 'free']
      );

      // إنشاء اشتراك مجاني
      await this.createFreeSubscription(userId);

      console.log('User registered successfully:', userId);
      return userId;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async loginUser(email: string, password: string): Promise<User> {
    try {
      // البحث عن المستخدم
      const users = await sqliteDB.query(
        'SELECT * FROM users WHERE email = ? AND is_active = 1',
        [email]
      );

      if (!users || users.length === 0) {
        throw new Error('بيانات الدخول غير صحيحة');
      }

      const user = users[0];
      
      // التحقق من كلمة المرور
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('بيانات الدخول غير صحيحة');
      }

      // تحديث آخر تسجيل دخول
      await sqliteDB.exec(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );

      // تحويل البيانات إلى كائن User
      const userObj: User = {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        subscriptionType: user.subscription_type,
        subscriptionExpiry: user.subscription_expiry ? new Date(user.subscription_expiry) : null,
        createdAt: new Date(user.created_at),
        lastLogin: new Date(),
        isActive: user.is_active === 1
      };

      this.currentUser = userObj;
      console.log('User logged in successfully:', user.id);
      return userObj;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logoutUser(): Promise<void> {
    this.currentUser = null;
    console.log('User logged out');
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];

      if (updates.fullName !== undefined) {
        updateFields.push('full_name = ?');
        values.push(updates.fullName);
      }

      if (updates.email !== undefined) {
        updateFields.push('email = ?');
        values.push(updates.email);
      }

      if (updateFields.length === 0) {
        return;
      }

      values.push(userId);
      await sqliteDB.exec(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );

      console.log('User profile updated successfully');
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // التحقق من كلمة المرور الحالية
      const users = await sqliteDB.query(
        'SELECT password_hash FROM users WHERE id = ?',
        [userId]
      );

      if (!users || users.length === 0) {
        throw new Error('المستخدم غير موجود');
      }

      const isValidPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
      if (!isValidPassword) {
        throw new Error('كلمة المرور الحالية غير صحيحة');
      }

      // تشفير كلمة المرور الجديدة
      const newPasswordHash = await bcrypt.hash(newPassword, 12);
      
      // تحديث كلمة المرور
      await sqliteDB.exec(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [newPasswordHash, userId]
      );

      console.log('Password changed successfully');
    } catch (error) {
      console.error('Password change failed:', error);
      throw error;
    }
  }

  private async createFreeSubscription(userId: string): Promise<void> {
    const subscriptionId = this.generateId();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 100); // اشتراك مجاني دائم

    await sqliteDB.exec(
      'INSERT INTO subscriptions (id, user_id, plan_type, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [subscriptionId, userId, 'free', startDate.toISOString(), endDate.toISOString(), 'active']
    );
  }

  async checkSubscriptionStatus(userId: string): Promise<Subscription | null> {
    try {
      const subscriptions = await sqliteDB.query(
        'SELECT * FROM subscriptions WHERE user_id = ? AND status = "active" AND end_date > ? ORDER BY end_date DESC LIMIT 1',
        [userId, new Date().toISOString()]
      );

      if (!subscriptions || subscriptions.length === 0) {
        return null;
      }

      const sub = subscriptions[0];
      return {
        id: sub.id,
        userId: sub.user_id,
        planType: sub.plan_type,
        startDate: new Date(sub.start_date),
        endDate: new Date(sub.end_date),
        status: sub.status
      };
    } catch (error) {
      console.error('Failed to check subscription:', error);
      return null;
    }
  }

  async upgradeSubscription(userId: string, planType: 'monthly' | 'yearly'): Promise<void> {
    try {
      // إلغاء الاشتراك الحالي
      await sqliteDB.exec(
        'UPDATE subscriptions SET status = "cancelled" WHERE user_id = ? AND status = "active"',
        [userId]
      );

      // إنشاء اشتراك جديد
      const subscriptionId = this.generateId();
      const startDate = new Date();
      const endDate = new Date();

      if (planType === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      await sqliteDB.exec(
        'INSERT INTO subscriptions (id, user_id, plan_type, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?)',
        [subscriptionId, userId, planType, startDate.toISOString(), endDate.toISOString(), 'active']
      );

      // تحديث نوع الاشتراك في جدول المستخدمين
      await sqliteDB.exec(
        'UPDATE users SET subscription_type = ?, subscription_expiry = ? WHERE id = ?',
        [planType, endDate.toISOString(), userId]
      );

      console.log('Subscription upgraded successfully');
    } catch (error) {
      console.error('Subscription upgrade failed:', error);
      throw error;
    }
  }

  private generateId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async validateSession(): Promise<boolean> {
    if (!this.currentUser) {
      return false;
    }

    // التحقق من صلاحية الاشتراك
    const subscription = await this.checkSubscriptionStatus(this.currentUser.id);
    if (!subscription) {
      this.currentUser.subscriptionType = 'free';
      return true; // المستخدم المجاني يمكنه الاستمرار
    }

    return true;
  }
}

export const embeddedAuth = EmbeddedAuth.getInstance();
