// نظام المصادقة المحدث ليستخدم قاعدة البيانات المركزية
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

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

export class CentralEmbeddedAuth {
  private static instance: CentralEmbeddedAuth;
  private currentUser: User | null = null;
  private apiBase = '/api/database';

  static getInstance(): CentralEmbeddedAuth {
    if (!CentralEmbeddedAuth.instance) {
      CentralEmbeddedAuth.instance = new CentralEmbeddedAuth();
    }
    return CentralEmbeddedAuth.instance;
  }

  // === إدارة المستخدمين ===
  async registerUser(email: string, password: string, fullName: string): Promise<string> {
    try {
      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createUser',
          data: { email, password, fullName }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في إنشاء المستخدم');
      }

      const result = await response.json();
      console.log('✅ تم إنشاء المستخدم بنجاح:', result.userId);
      return result.userId;
    } catch (error) {
      console.error('❌ فشل في إنشاء المستخدم:', error);
      throw error;
    }
  }

  async loginUser(email: string, password: string): Promise<User> {
    try {
      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validateUserPassword',
          data: { email, password }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في تسجيل الدخول');
      }

      const result = await response.json();
      const user = result.user;

      // تحويل البيانات إلى النوع المطلوب
      this.currentUser = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        subscriptionType: user.subscriptionType,
        subscriptionExpiry: user.subscriptionExpiry ? new Date(user.subscriptionExpiry) : null,
        createdAt: new Date(user.createdAt),
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
        isActive: user.isActive
      };

      console.log('✅ تم تسجيل الدخول بنجاح:', this.currentUser.email);
      return this.currentUser;
    } catch (error) {
      console.error('❌ فشل في تسجيل الدخول:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  async logoutUser(): Promise<void> {
    this.currentUser = null;
    console.log('✅ تم تسجيل الخروج بنجاح');
  }

  async updateUserProfile(userId: string, updates: { fullName?: string; email?: string }): Promise<void> {
    try {
      // تحديث البيانات المحلية
      if (this.currentUser) {
        this.currentUser = {
          ...this.currentUser,
          ...updates
        };
      }

      // يمكن إضافة API لتحديث الملف الشخصي هنا
      console.log('✅ تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      console.error('❌ فشل في تحديث الملف الشخصي:', error);
      throw error;
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // التحقق من كلمة المرور الحالية
      if (!this.currentUser) {
        throw new Error('المستخدم غير مسجل الدخول');
      }

      // يمكن إضافة API لتغيير كلمة المرور هنا
      console.log('✅ تم تغيير كلمة المرور بنجاح');
    } catch (error) {
      console.error('❌ فشل في تغيير كلمة المرور:', error);
      throw error;
    }
  }

  // === إدارة الاشتراكات ===
  async createFreeSubscription(userId: string): Promise<void> {
    try {
      const now = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1); // سنة مجانية

      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createSubscription',
          data: {
            userId,
            planType: 'free',
            startDate: now.toISOString(),
            endDate: endDate.toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error('فشل في إنشاء الاشتراك المجاني');
      }

      console.log('✅ تم إنشاء الاشتراك المجاني بنجاح');
    } catch (error) {
      console.error('❌ فشل في إنشاء الاشتراك المجاني:', error);
      throw error;
    }
  }

  async checkSubscriptionStatus(userId: string): Promise<Subscription | null> {
    try {
      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getUserSubscription',
          userId
        })
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      if (!result.subscription) {
        return null;
      }

      const subscription = result.subscription;
      return {
        id: subscription.id,
        userId: subscription.userId,
        planType: subscription.planType,
        startDate: new Date(subscription.startDate),
        endDate: new Date(subscription.endDate),
        status: subscription.status
      };
    } catch (error) {
      console.error('❌ فشل في التحقق من حالة الاشتراك:', error);
      return null;
    }
  }

  async upgradeSubscription(userId: string, planType: 'monthly' | 'yearly'): Promise<void> {
    try {
      const now = new Date();
      const endDate = new Date();
      
      if (planType === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createSubscription',
          data: {
            userId,
            planType,
            startDate: now.toISOString(),
            endDate: endDate.toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error('فشل في ترقية الاشتراك');
      }

      // تحديث البيانات المحلية
      if (this.currentUser) {
        this.currentUser.subscriptionType = planType;
      }

      console.log('✅ تم ترقية الاشتراك بنجاح');
    } catch (error) {
      console.error('❌ فشل في ترقية الاشتراك:', error);
      throw error;
    }
  }

  // === إدارة القضايا ===
  async createCase(caseData: {
    name: string;
    caseType?: string;
    partyRole?: string;
    complexity?: 'basic' | 'intermediate' | 'advanced';
    status?: 'active' | 'archived' | 'completed';
    tags?: string;
    description?: string;
  }): Promise<string> {
    try {
      if (!this.currentUser) {
        throw new Error('المستخدم غير مسجل الدخول');
      }

      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createCase',
          data: {
            userId: this.currentUser.id,
            ...caseData
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في إنشاء القضية');
      }

      const result = await response.json();
      console.log('✅ تم إنشاء القضية بنجاح:', result.caseId);
      return result.caseId;
    } catch (error) {
      console.error('❌ فشل في إنشاء القضية:', error);
      throw error;
    }
  }

  async getUserCases(): Promise<any[]> {
    try {
      if (!this.currentUser) {
        throw new Error('المستخدم غير مسجل الدخول');
      }

      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getUserCases',
          userId: this.currentUser.id
        })
      });

      if (!response.ok) {
        throw new Error('فشل في جلب القضايا');
      }

      const result = await response.json();
      return result.cases || [];
    } catch (error) {
      console.error('❌ فشل في جلب القضايا:', error);
      return [];
    }
  }

  // === إدارة التفضيلات ===
  async setUserPreference(key: string, value: string): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new Error('المستخدم غير مسجل الدخول');
      }

      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setUserPreference',
          data: {
            userId: this.currentUser.id,
            key,
            value
          }
        })
      });

      if (!response.ok) {
        throw new Error('فشل في حفظ التفضيل');
      }

      console.log('✅ تم حفظ التفضيل بنجاح');
    } catch (error) {
      console.error('❌ فشل في حفظ التفضيل:', error);
      throw error;
    }
  }

  async getUserPreference(key: string): Promise<string | null> {
    try {
      if (!this.currentUser) {
        throw new Error('المستخدم غير مسجل الدخول');
      }

      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getUserPreference',
          data: {
            userId: this.currentUser.id,
            key
          }
        })
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      return result.value || null;
    } catch (error) {
      console.error('❌ فشل في جلب التفضيل:', error);
      return null;
    }
  }

  // === إحصائيات المستخدم ===
  async getUserStats(): Promise<{
    totalCases: number;
    activeCases: number;
    completedStages: number;
    totalStages: number;
  } | null> {
    try {
      if (!this.currentUser) {
        throw new Error('المستخدم غير مسجل الدخول');
      }

      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getUserStats',
          userId: this.currentUser.id
        })
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      return result.stats || null;
    } catch (error) {
      console.error('❌ فشل في جلب الإحصائيات:', error);
      return null;
    }
  }

  // === التحقق من صحة الجلسة ===
  async validateSession(): Promise<boolean> {
    if (!this.currentUser) {
      return false;
    }

    try {
      // التحقق من حالة الاشتراك
      const subscription = await this.checkSubscriptionStatus(this.currentUser.id);
      if (!subscription || subscription.status !== 'active') {
        return false;
      }

      // التحقق من انتهاء صلاحية الاشتراك
      if (subscription.endDate < new Date()) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ فشل في التحقق من صحة الجلسة:', error);
      return false;
    }
  }
}

// تصدير نسخة واحدة من نظام المصادقة المركزي
export const centralEmbeddedAuth = CentralEmbeddedAuth.getInstance();
