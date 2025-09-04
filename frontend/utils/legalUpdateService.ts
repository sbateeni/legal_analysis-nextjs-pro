/**
 * خدمة التحديث التلقائي للمصادر القانونية
 * نظام مراقبة وتحديث تلقائي للقوانين والأحكام الفلسطينية
 */

export interface LegalSource {
  id: string;
  name: string;
  url: string;
  type: 'legislation' | 'judgment' | 'gazette' | 'research';
  lastUpdate: Date;
  updateFrequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  priority: number;
}

export interface LegalUpdate {
  id: string;
  sourceId: string;
  title: string;
  content: string;
  type: 'new' | 'modified' | 'repealed';
  date: Date;
  url: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  affectedLaws?: string[];
  summary: string;
}

export interface UpdateNotification {
  id: string;
  type: 'new_law' | 'law_modified' | 'law_repealed' | 'system_update';
  title: string;
  message: string;
  date: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
}

export class LegalUpdateService {
  private sources: LegalSource[] = [];
  private updates: LegalUpdate[] = [];
  private notifications: UpdateNotification[] = [];
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeSources();
    this.startAutoUpdate();
  }

  /**
   * تهيئة المصادر القانونية
   */
  private initializeSources(): void {
    this.sources = [
      {
        id: 'muqtafi',
        name: 'المقتفي - منظومة القضاء والتشريع الفلسطيني',
        url: 'https://muqtafi.birzeit.edu',
        type: 'legislation',
        lastUpdate: new Date(),
        updateFrequency: 'daily',
        isActive: true,
        priority: 1
      },
      {
        id: 'maqam',
        name: 'مقام - التشريعات والأحكام القضائية',
        url: 'https://maqam.ps',
        type: 'judgment',
        lastUpdate: new Date(),
        updateFrequency: 'daily',
        isActive: true,
        priority: 2
      },
      {
        id: 'gazette',
        name: 'الجريدة الرسمية الفلسطينية',
        url: 'https://gazette.ps',
        type: 'gazette',
        lastUpdate: new Date(),
        updateFrequency: 'weekly',
        isActive: true,
        priority: 3
      },
      {
        id: 'research',
        name: 'مركز الأبحاث القانونية',
        url: 'https://legal-research.ps',
        type: 'research',
        lastUpdate: new Date(),
        updateFrequency: 'monthly',
        isActive: true,
        priority: 4
      }
    ];
  }

  /**
   * بدء التحديث التلقائي
   */
  private startAutoUpdate(): void {
    // تحديث كل ساعة
    this.updateInterval = setInterval(() => {
      this.checkForUpdates();
    }, 60 * 60 * 1000);

    // تحديث فوري عند البدء
    this.checkForUpdates();
  }

  /**
   * فحص التحديثات
   */
  private async checkForUpdates(): Promise<void> {
    console.log('🔍 فحص التحديثات القانونية...');
    
    for (const source of this.sources) {
      if (!source.isActive) continue;

      try {
        await this.checkSourceUpdates(source);
      } catch (error) {
        console.error(`خطأ في فحص مصدر ${source.name}:`, error);
        this.createNotification({
          type: 'system_update',
          title: 'خطأ في المصدر',
          message: `فشل في فحص مصدر ${source.name}`,
          priority: 'medium'
        });
      }
    }
  }

  /**
   * فحص تحديثات مصدر محدد
   */
  private async checkSourceUpdates(source: LegalSource): Promise<void> {
    // محاكاة فحص التحديثات
    const hasUpdates = Math.random() > 0.7; // 30% احتمال وجود تحديثات

    if (hasUpdates) {
      const newUpdates = this.generateMockUpdates(source);
      
      for (const update of newUpdates) {
        this.addUpdate(update);
        this.createNotification({
          type: this.getNotificationType(update.type),
          title: `تحديث في ${source.name}`,
          message: update.summary,
          priority: update.importance,
          actionUrl: update.url
        });
      }

      // تحديث وقت آخر تحديث
      source.lastUpdate = new Date();
    }
  }

  /**
   * إنشاء تحديثات وهمية للاختبار
   */
  private generateMockUpdates(source: LegalSource): LegalUpdate[] {
    const updateTypes: Array<'new' | 'modified' | 'repealed'> = ['new', 'modified', 'repealed'];
    const importanceLevels: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
    
    const numUpdates = Math.floor(Math.random() * 3) + 1; // 1-3 تحديثات
    const updates: LegalUpdate[] = [];

    for (let i = 0; i < numUpdates; i++) {
      const type = updateTypes[Math.floor(Math.random() * updateTypes.length)];
      const importance = importanceLevels[Math.floor(Math.random() * importanceLevels.length)];
      
      updates.push({
        id: `update_${Date.now()}_${i}`,
        sourceId: source.id,
        title: this.generateUpdateTitle(type, source.type),
        content: this.generateUpdateContent(type),
        type,
        date: new Date(),
        url: `${source.url}/update/${Date.now()}`,
        importance,
        affectedLaws: this.generateAffectedLaws(),
        summary: this.generateUpdateSummary(type, importance)
      });
    }

    return updates;
  }

  /**
   * إنشاء عنوان التحديث
   */
  private generateUpdateTitle(type: string, sourceType: string): string {
    const titles = {
      new: {
        legislation: 'قانون جديد: قانون حماية البيانات الشخصية',
        judgment: 'حكم جديد: قضية الملكية الفكرية',
        gazette: 'إعلان جديد: تعديلات على قانون العمل',
        research: 'بحث جديد: التحول الرقمي في القضاء'
      },
      modified: {
        legislation: 'تعديل على قانون العقوبات الفلسطيني',
        judgment: 'تعديل حكم: قضية التعويضات',
        gazette: 'تعديل إعلان: لوائح البناء',
        research: 'تحديث بحث: الإجراءات القضائية'
      },
      repealed: {
        legislation: 'إلغاء قانون: قانون الضرائب القديم',
        judgment: 'إلغاء حكم: قضية منتهية الصلاحية',
        gazette: 'إلغاء إعلان: قرارات قديمة',
        research: 'إلغاء بحث: دراسة منتهية الصلاحية'
      }
    };

    return titles[type as keyof typeof titles]?.[sourceType as keyof typeof titles.new] || 'تحديث قانوني';
  }

  /**
   * إنشاء محتوى التحديث
   */
  private generateUpdateContent(type: string): string {
    const contents = {
      new: 'تم إصدار قانون جديد يهدف إلى حماية حقوق المواطنين وتحسين الخدمات القانونية. يتضمن القانون أحكاماً جديدة حول...',
      modified: 'تم تعديل القانون المذكور ليتوافق مع التطورات الحديثة والمتطلبات الجديدة. التعديلات تشمل...',
      repealed: 'تم إلغاء هذا القانون لعدم مواكبته للتطورات الحديثة. سيتم استبداله بقانون جديد قريباً...'
    };

    return contents[type as keyof typeof contents] || 'تحديث في المحتوى القانوني';
  }

  /**
   * إنشاء القوانين المتأثرة
   */
  private generateAffectedLaws(): string[] {
    const laws = [
      'قانون العقوبات الفلسطيني',
      'قانون الإجراءات المدنية',
      'قانون العمل الفلسطيني',
      'قانون الملكية الفكرية',
      'قانون حماية المستهلك'
    ];

    const numAffected = Math.floor(Math.random() * 3) + 1;
    return laws.slice(0, numAffected);
  }

  /**
   * إنشاء ملخص التحديث
   */
  private generateUpdateSummary(type: string, importance: string): string {
    const summaries = {
      new: `تم إضافة ${importance === 'critical' ? 'قانون مهم جداً' : 'تحديث قانوني جديد'} يتطلب مراجعة فورية`,
      modified: `تم تعديل ${importance === 'critical' ? 'قانون حساس' : 'قانون موجود'} قد يؤثر على القضايا الحالية`,
      repealed: `تم إلغاء ${importance === 'critical' ? 'قانون أساسي' : 'قانون'} قد يؤثر على المراجع القانونية`
    };

    return summaries[type as keyof typeof summaries] || 'تحديث في النظام القانوني';
  }

  /**
   * الحصول على نوع الإشعار
   */
  private getNotificationType(updateType: string): UpdateNotification['type'] {
    const typeMap: Record<string, UpdateNotification['type']> = {
      new: 'new_law',
      modified: 'law_modified',
      repealed: 'law_repealed'
    };

    return typeMap[updateType] || 'system_update';
  }

  /**
   * إضافة تحديث جديد
   */
  private addUpdate(update: LegalUpdate): void {
    this.updates.unshift(update); // إضافة في المقدمة
    
    // الاحتفاظ بآخر 1000 تحديث فقط
    if (this.updates.length > 1000) {
      this.updates = this.updates.slice(0, 1000);
    }
  }

  /**
   * إنشاء إشعار جديد
   */
  private createNotification(notification: Omit<UpdateNotification, 'id' | 'date' | 'isRead'>): void {
    const newNotification: UpdateNotification = {
      ...notification,
      id: `notification_${Date.now()}`,
      date: new Date(),
      isRead: false
    };

    this.notifications.unshift(newNotification);
    
    // الاحتفاظ بآخر 500 إشعار فقط
    if (this.notifications.length > 500) {
      this.notifications = this.notifications.slice(0, 500);
    }
  }

  /**
   * الحصول على جميع التحديثات
   */
  public getUpdates(limit: number = 50): LegalUpdate[] {
    return this.updates.slice(0, limit);
  }

  /**
   * الحصول على التحديثات غير المقروءة
   */
  public getUnreadNotifications(): UpdateNotification[] {
    return this.notifications.filter(n => !n.isRead);
  }

  /**
   * الحصول على جميع الإشعارات
   */
  public getNotifications(limit: number = 50): UpdateNotification[] {
    return this.notifications.slice(0, limit);
  }

  /**
   * تحديد إشعار كمقروء
   */
  public markNotificationAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  /**
   * الحصول على إحصائيات التحديثات
   */
  public getUpdateStats(): {
    totalUpdates: number;
    unreadNotifications: number;
    lastUpdate: Date | null;
    activeSources: number;
  } {
    return {
      totalUpdates: this.updates.length,
      unreadNotifications: this.getUnreadNotifications().length,
      lastUpdate: this.updates.length > 0 ? this.updates[0].date : null,
      activeSources: this.sources.filter(s => s.isActive).length
    };
  }

  /**
   * إيقاف التحديث التلقائي
   */
  public stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * إعادة تشغيل التحديث التلقائي
   */
  public restartAutoUpdate(): void {
    this.stopAutoUpdate();
    this.startAutoUpdate();
  }

  /**
   * تحديث يدوي للمصادر
   */
  public async manualUpdate(): Promise<void> {
    console.log('🔄 بدء التحديث اليدوي...');
    await this.checkForUpdates();
    console.log('✅ تم التحديث اليدوي بنجاح');
  }
}

// إنشاء مثيل واحد من الخدمة
export const legalUpdateService = new LegalUpdateService();
