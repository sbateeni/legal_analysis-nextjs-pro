/**
 * خدمة التحديث اليدوي للمصادر القانونية
 * نظام مراقبة وتحديث يدوي للقوانين والأحكام الفلسطينية باستخدام Gemini AIد منك ايضا تعديل التواريخ من هجري الى ميلادي
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

  constructor() {
    this.initializeSources();
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
   * استدعاء Gemini API لتحليل المحتوى القانوني
   */
  private async callGeminiAPI(content: string, prompt: string): Promise<string> {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `${prompt}\n\nالمحتوى:\n${content}`,
          model: 'gemini-1.5-flash'
        }),
      });

      if (!response.ok) {
        throw new Error('فشل في استدعاء Gemini API');
      }

      const result = await response.json();
      return result.result || 'لم يتم الحصول على نتيجة';
    } catch (error) {
      console.error('خطأ في استدعاء Gemini API:', error);
      return 'خطأ في التحليل';
    }
  }

  /**
   * فحص التحديثات من المصادر الحقيقية
   */
  private async checkForUpdates(): Promise<void> {
    console.log('🔍 فحص التحديثات القانونية من المصادر الرسمية...');
    
    for (const source of this.sources) {
      if (!source.isActive) continue;

      try {
        await this.checkRealSourceUpdates(source);
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
   * فحص تحديثات مصدر حقيقي
   */
  private async checkRealSourceUpdates(source: LegalSource): Promise<void> {
    try {
      console.log(`🔍 فحص مصدر: ${source.name}`);
      
      // محاولة جلب البيانات من المصدر الحقيقي
      const response = await fetch(source.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        // إضافة timeout
        signal: AbortSignal.timeout(10000) // 10 ثواني
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const htmlContent = await response.text();
      
      // استخدام Gemini لتحليل المحتوى
      const analysisPrompt = `قم بتحليل هذا المحتوى القانوني من ${source.name} وحدد:
1. هل هناك تحديثات جديدة؟
2. ما نوع التحديثات (قوانين جديدة، تعديلات، إلغاءات)؟
3. ما أهميتها (منخفضة، متوسطة، عالية، حرجة)؟
4. اكتب ملخصاً مختصراً للتحديثات

أجب بصيغة JSON:
{
  "hasUpdates": true/false,
  "updates": [
    {
      "type": "new/modified/repealed",
      "title": "عنوان التحديث",
      "importance": "low/medium/high/critical",
      "summary": "ملخص التحديث"
    }
  ]
}`;

      const geminiResponse = await this.callGeminiAPI(htmlContent, analysisPrompt);
      
      try {
        const analysis = JSON.parse(geminiResponse);
        
        if (analysis.hasUpdates && analysis.updates) {
          for (const updateData of analysis.updates) {
            const update: LegalUpdate = {
              id: `update_${Date.now()}_${Math.random()}`,
              sourceId: source.id,
              title: updateData.title,
              content: await this.callGeminiAPI(htmlContent, `اكتب محتوى مفصلاً عن: ${updateData.title}`),
              type: updateData.type,
              date: new Date(),
              url: source.url,
              importance: updateData.importance,
              summary: updateData.summary
            };

            this.addUpdate(update);
            this.createNotification({
              type: this.getNotificationType(update.type),
              title: `تحديث في ${source.name}`,
              message: update.summary,
              priority: update.importance,
              actionUrl: update.url
            });
          }
        }
      } catch (parseError) {
        console.error('خطأ في تحليل استجابة Gemini:', parseError);
        // إنشاء تحديث عام في حالة فشل التحليل
        this.createGeneralUpdate(source, htmlContent);
      }

    } catch (error) {
      console.error(`خطأ في جلب البيانات من ${source.name}:`, error);
      throw error;
    }

    // تحديث وقت آخر فحص
    source.lastUpdate = new Date();
  }

  /**
   * إنشاء تحديث عام عند فشل التحليل المفصل
   */
  private async createGeneralUpdate(source: LegalSource, content: string): Promise<void> {
    const summary = await this.callGeminiAPI(
      content, 
      `اكتب ملخصاً مختصراً (3-4 جمل) عن آخر التحديثات في ${source.name}`
    );

    const update: LegalUpdate = {
      id: `update_${Date.now()}_${Math.random()}`,
      sourceId: source.id,
      title: `تحديث في ${source.name}`,
      content: summary,
      type: 'new',
      date: new Date(),
      url: source.url,
      importance: 'medium',
      summary: summary.substring(0, 200) + '...'
    };

    this.addUpdate(update);
    this.createNotification({
      type: 'new_law',
      title: `تحديث في ${source.name}`,
      message: summary.substring(0, 100) + '...',
      priority: 'medium',
      actionUrl: source.url
    });
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
   * تحديث يدوي للمصادر باستخدام Gemini AI
   */
  public async manualUpdate(): Promise<void> {
    console.log('🔄 بدء التحديث اليدوي باستخدام Gemini AI...');
    
    try {
      await this.checkForUpdates();
      console.log('✅ تم التحديث اليدوي بنجاح');
      
      // إنشاء إشعار نجاح التحديث
      this.createNotification({
        type: 'system_update',
        title: 'تم التحديث بنجاح',
        message: `تم فحص ${this.sources.filter(s => s.isActive).length} مصدر قانوني باستخدام Gemini AI`,
        priority: 'medium'
      });
      
    } catch (error) {
      console.error('❌ فشل في التحديث اليدوي:', error);
      
      // إنشاء إشعار فشل التحديث
      this.createNotification({
        type: 'system_update',
        title: 'فشل في التحديث',
        message: 'حدث خطأ أثناء فحص المصادر القانونية',
        priority: 'high'
      });
      
      throw error;
    }
  }
}

// إنشاء مثيل واحد من الخدمة
export const legalUpdateService = new LegalUpdateService();
