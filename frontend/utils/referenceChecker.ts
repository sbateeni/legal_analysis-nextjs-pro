// Reference Checker Utility
// Validates legal citations and provides analysis modes
// Part of the quality and compliance system

interface LegalReference {
  id: string;
  type: 'law' | 'court_decision' | 'legal_opinion' | 'doctrine' | 'international_treaty';
  title: string;
  source: string;
  year?: number;
  article?: string;
  paragraph?: string;
  court?: string;
  judge?: string;
  validity: 'valid' | 'expired' | 'amended' | 'repealed' | 'unknown';
  lastChecked: string;
  url?: string;
  notes?: string;
  tags?: string[]; // تصنيف حسب نوع القضية
}

interface CitationAnalysis {
  reference: LegalReference;
  relevance: 'high' | 'medium' | 'low';
  confidence: number; // 0-100
  suggestedUsage: string;
  alternatives?: LegalReference[];
  warnings?: string[];
}

interface AnalysisMode {
  id: 'brief' | 'detailed';
  name: string;
  description: string;
  maxLength: number;
  includeDetails: boolean;
  includeAlternatives: boolean;
  includeWarnings: boolean;
}

export class ReferenceChecker {
  private references: Map<string, LegalReference> = new Map();
  private knownCaseTags: string[] = [
    'تجاري','شيكات','جنائي','عمل','إيجارات','عقاري','إداري','أحوال شخصية','ميراث','مدني'
  ];
  private analysisModes: AnalysisMode[] = [
    {
      id: 'brief',
      name: 'التفسير المختصر',
      description: 'تحليل مختصر ومباشر للمرجع القانوني',
      maxLength: 200,
      includeDetails: false,
      includeAlternatives: false,
      includeWarnings: true
    },
    {
      id: 'detailed',
      name: 'الحجج الموسعة',
      description: 'تحليل مفصل شامل مع بدائل وتحذيرات',
      maxLength: 800,
      includeDetails: true,
      includeAlternatives: true,
      includeWarnings: true
    }
  ];

  constructor() {
    this.initializeReferences();
  }

  private initializeReferences(): void {
    // قوانين أساسية (عام)
    this.addInitialReference({
      id: 'civil_code',
      type: 'law',
      title: 'القانون المدني',
      source: 'قانون رقم 131 لسنة 1948',
      year: 1948,
      validity: 'valid',
      lastChecked: new Date().toISOString(),
      notes: 'القانون الأساسي للمعاملات المدنية',
      tags: ['عام','مدني']
    });

    this.addInitialReference({
      id: 'commercial_code',
      type: 'law',
      title: 'القانون التجاري',
      source: 'قانون رقم 17 لسنة 1999',
      year: 1999,
      validity: 'valid',
      lastChecked: new Date().toISOString(),
      notes: 'ينظم المعاملات التجارية',
      tags: ['تجاري']
    });

    this.addInitialReference({
      id: 'personal_status',
      type: 'law',
      title: 'قانون الأحوال الشخصية',
      source: 'قانون رقم 25 لسنة 1920',
      year: 1920,
      validity: 'valid',
      lastChecked: new Date().toISOString(),
      notes: 'ينظم أحوال الزواج والطلاق والميراث',
      tags: ['أحوال شخصية','ميراث']
    });

    // أحكام قضائية مهمة
    this.addInitialReference({
      id: 'cassation_2020_1',
      type: 'court_decision',
      title: 'حكم محكمة النقض',
      source: 'طعن رقم 1234 لسنة 2020',
      year: 2020,
      court: 'محكمة النقض',
      validity: 'valid',
      lastChecked: new Date().toISOString(),
      notes: 'حكم في مسائل الميراث',
      tags: ['ميراث']
    });

    this.addInitialReference({
      id: 'constitutional_2019_1',
      type: 'court_decision',
      title: 'حكم المحكمة الدستورية العليا',
      source: 'دعوى دستورية رقم 56 لسنة 2019',
      year: 2019,
      court: 'المحكمة الدستورية العليا',
      validity: 'valid',
      lastChecked: new Date().toISOString(),
      notes: 'حكم في دستورية قانون الإيجار',
      tags: ['إيجارات','عقاري']
    });

    // ——— مراجع متخصصة وفق نوع القضية ———
    // تجاري
    this.addInitialReference({
      id: 'cheque_law',
      type: 'law',
      title: 'الشيك كورقة تجارية',
      source: 'القانون التجاري - باب الأوراق التجارية',
      validity: 'valid',
      lastChecked: new Date().toISOString(),
      notes: 'أحكام التقادم والرجوع والساحب والمسحوب عليه',
      tags: ['تجاري','شيكات']
    });

    // جنائي
    this.addInitialReference({
      id: 'criminal_procedure',
      type: 'law',
      title: 'قانون الإجراءات الجزائية',
      source: 'قانون الإجراءات الجزائية',
      validity: 'valid',
      lastChecked: new Date().toISOString(),
      notes: 'ضوابط القبض، التفتيش، البطلان، الأدلة',
      tags: ['جنائي']
    });

    // عمل
    this.addInitialReference({
      id: 'labor_law',
      type: 'law',
      title: 'قانون العمل',
      source: 'قانون العمل',
      validity: 'valid',
      lastChecked: new Date().toISOString(),
      notes: 'الأجور، الإجازات، الفصل التعسفي',
      tags: ['عمل']
    });

    // عقاري/إيجارات
    this.addInitialReference({
      id: 'lease_law',
      type: 'law',
      title: 'قانون الإيجارات',
      source: 'قانون الإيجارات',
      validity: 'valid',
      lastChecked: new Date().toISOString(),
      notes: 'أسباب الإخلاء، البدلات، التنبيه والإجراءات',
      tags: ['إيجارات','عقاري']
    });

    // إداري
    this.addInitialReference({
      id: 'admin_justice',
      type: 'law',
      title: 'مبادئ القضاء الإداري',
      source: 'مبادئ المشروعية والاختصاص ووقف التنفيذ',
      validity: 'valid',
      lastChecked: new Date().toISOString(),
      notes: 'المصلحة، الميعاد، المشروعية الشكلية والموضوعية',
      tags: ['إداري']
    });
  }

  private addInitialReference(reference: LegalReference): void {
    this.references.set(reference.id, reference);
  }

  // البحث في المراجع
  async searchReferences(query: string, filters?: {
    type?: string;
    year?: number;
    court?: string;
    caseTag?: string; // فلترة حسب نوع القضية
  }): Promise<LegalReference[]> {
    const results: LegalReference[] = [];
    const queryLower = query.toLowerCase();

    for (const reference of this.references.values()) {
      let matches = false;

      // البحث في العنوان والمصدر
      if (reference.title.toLowerCase().includes(queryLower) ||
          reference.source.toLowerCase().includes(queryLower) ||
          reference.notes?.toLowerCase().includes(queryLower)) {
        matches = true;
      }

      // تطبيق الفلاتر
      if (filters?.type && reference.type !== filters.type) {
        matches = false;
      }
      if (filters?.year && reference.year !== filters.year) {
        matches = false;
      }
      if (filters?.court && reference.court !== filters.court) {
        matches = false;
      }
      if (filters?.caseTag && !(reference.tags || []).includes(filters.caseTag)) {
        matches = false;
      }

      if (matches) {
        results.push(reference);
      }
    }

    return results.sort((a, b) => (b.year || 0) - (a.year || 0));
  }

  // فحص الاستشهاد
  async validateCitation(citation: string): Promise<CitationAnalysis | null> {
    // تحليل النص للعثور على مراجع
    const extractedReferences = this.extractReferencesFromText(citation);
    
    if (extractedReferences.length === 0) {
      return null;
    }

    // استخدام أول مرجع تم العثور عليه
    const reference = extractedReferences[0];
    
    return {
      reference,
      relevance: this.calculateRelevance(reference, citation),
      confidence: this.calculateConfidence(reference, citation),
      suggestedUsage: this.generateSuggestedUsage(reference, citation),
      alternatives: this.findAlternatives(reference),
      warnings: this.generateWarnings(reference)
    };
  }

  // استخراج المراجع من النص
  private extractReferencesFromText(text: string): LegalReference[] {
    const found: LegalReference[] = [];
    const textLower = text.toLowerCase();

    // البحث عن مراجع في النص
    for (const reference of this.references.values()) {
      if (textLower.includes(reference.title.toLowerCase()) ||
          textLower.includes(reference.source.toLowerCase())) {
        found.push(reference);
      }
    }

    return found;
  }

  // حساب الصلة
  private calculateRelevance(reference: LegalReference, context: string): 'high' | 'medium' | 'low' {
    const contextLower = context.toLowerCase();
    let score = 0;

    // البحث عن كلمات مفتاحية
    const keywords = this.getKeywordsForReference(reference);
    for (const keyword of keywords) {
      if (contextLower.includes(keyword.toLowerCase())) {
        score += 2;
      }
    }

    // البحث عن سياق قانوني
    const legalTerms = ['قانون', 'مادة', 'حكم', 'محكمة', 'قرار', 'طعن'];
    for (const term of legalTerms) {
      if (contextLower.includes(term)) {
        score += 1;
      }
    }

    if (score >= 5) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  // حساب الثقة
  private calculateConfidence(reference: LegalReference, context: string): number {
    let confidence = 70; // أساسي

    // زيادة الثقة بناءً على صحة المرجع
    if (reference.validity === 'valid') confidence += 20;
    else if (reference.validity === 'amended') confidence += 10;
    else if (reference.validity === 'expired') confidence -= 30;

    // زيادة الثقة بناءً على حداثة المرجع
    if (reference.year && reference.year >= 2010) confidence += 10;
    else if (reference.year && reference.year >= 2000) confidence += 5;

    // تقليل الثقة إذا كان المرجع قديماً جداً
    if (reference.year && reference.year < 1980) confidence -= 20;

    return Math.max(0, Math.min(100, confidence));
  }

  // الحصول على الكلمات المفتاحية للمرجع
  private getKeywordsForReference(reference: LegalReference): string[] {
    const keywords: string[] = [];

    switch (reference.type) {
      case 'law':
        keywords.push('قانون', 'مادة', 'نص', 'حكم');
        break;
      case 'court_decision':
        keywords.push('حكم', 'محكمة', 'قرار', 'طعن');
        break;
      case 'legal_opinion':
        keywords.push('رأي', 'استشارة', 'فتوى');
        break;
      case 'doctrine':
        keywords.push('فقه', 'رأي فقهي', 'مذهب');
        break;
    }

    // إضافة كلمات من العنوان
    if (reference.title.includes('مدني')) keywords.push('مدني', 'عقود', 'مسؤولية');
    if (reference.title.includes('تجاري')) keywords.push('تجاري', 'شركات', 'أوراق مالية');
    if (reference.title.includes('أحوال شخصية')) keywords.push('زواج', 'طلاق', 'ميراث');

    return keywords;
  }

  // توليد الاستخدام المقترح
  private generateSuggestedUsage(reference: LegalReference, context: string): string {
    let usage = `يمكن الاستشهاد بـ${reference.title}`;
    
    if (reference.article) {
      usage += ` المادة ${reference.article}`;
    }
    
    if (reference.paragraph) {
      usage += ` الفقرة ${reference.paragraph}`;
    }
    
    usage += ` في هذا السياق.`;

    return usage;
  }

  // البحث عن بدائل
  private findAlternatives(reference: LegalReference): LegalReference[] {
    const alternatives: LegalReference[] = [];
    
    for (const otherRef of this.references.values()) {
      if (otherRef.id === reference.id) continue;
      
      if (otherRef.type === reference.type && 
          otherRef.validity === 'valid' &&
          otherRef.year && reference.year &&
          Math.abs(otherRef.year - reference.year) <= 10) {
        alternatives.push(otherRef);
      }
    }

    return alternatives.slice(0, 3); // أقصى 3 بدائل
  }

  // توليد التحذيرات
  private generateWarnings(reference: LegalReference): string[] {
    const warnings: string[] = [];

    if (reference.validity === 'expired') {
      warnings.push('هذا المرجع منتهي الصلاحية ولا يمكن الاستشهاد به');
    } else if (reference.validity === 'amended') {
      warnings.push('هذا المرجع تم تعديله - تحقق من النسخة الحالية');
    } else if (reference.validity === 'repealed') {
      warnings.push('هذا المرجع تم إلغاؤه');
    }

    if (reference.year && reference.year < 1980) {
      warnings.push('هذا المرجع قديم - قد يكون هناك تشريعات أحدث');
    }

    return warnings;
  }

  // تحليل النص مع وضع محدد
  async analyzeTextWithMode(text: string, modeId: 'brief' | 'detailed'): Promise<{
    analysis: string;
    references: LegalReference[];
    warnings: string[];
    mode: AnalysisMode;
  }> {
    const mode = this.analysisModes.find(m => m.id === modeId);
    if (!mode) {
      throw new Error('وضع التحليل غير موجود');
    }

    // فحص المراجع في النص
    const references = this.extractReferencesFromText(text);
    const warnings: string[] = [];
    
    // تحليل كل مرجع
    let analysis = '';
    
    if (mode.includeDetails) {
      analysis += `تم العثور على ${references.length} مرجع قانوني:\n\n`;
    }

    for (const reference of references) {
      const citationAnalysis = await this.validateCitation(text);
      
      if (citationAnalysis) {
        if (mode.includeDetails) {
          analysis += `• ${reference.title} (${reference.source})\n`;
          analysis += `  الصلة: ${this.getRelevanceText(citationAnalysis.relevance)}\n`;
          analysis += `  الثقة: ${citationAnalysis.confidence}%\n`;
          
          if (citationAnalysis.warnings && mode.includeWarnings) {
            analysis += `  تحذيرات: ${citationAnalysis.warnings.join(', ')}\n`;
          }
          
          analysis += `  الاستخدام المقترح: ${citationAnalysis.suggestedUsage}\n\n`;
        } else {
          analysis += `${reference.title}: ${citationAnalysis.suggestedUsage}\n`;
        }

        // إضافة التحذيرات
        if (mode.includeWarnings) {
          warnings.push(...(citationAnalysis.warnings || []));
        }
      }
    }

    // إضافة بدائل إذا كان الوضع مفصل
    if (mode.includeAlternatives && references.length > 0) {
      const alternatives = this.findAlternatives(references[0]);
      if (alternatives.length > 0) {
        analysis += `\nمراجع بديلة:\n`;
        for (const alt of alternatives) {
          analysis += `• ${alt.title} (${alt.source})\n`;
        }
      }
    }

    // تقصير التحليل إذا تجاوز الحد الأقصى
    if (analysis.length > mode.maxLength) {
      analysis = analysis.substring(0, mode.maxLength - 3) + '...';
    }

    return {
      analysis,
      references,
      warnings,
      mode
    };
  }

  // الحصول على نص الصلة
  private getRelevanceText(relevance: 'high' | 'medium' | 'low'): string {
    switch (relevance) {
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
    }
  }

  // الحصول على أوضاع التحليل
  getAnalysisModes(): AnalysisMode[] {
    return [...this.analysisModes];
  }

  // إرجاع الوسوم المعروفة
  public getKnownCaseTags(): string[] {
    return [...this.knownCaseTags];
  }

  // اقتراح وسوم نوع القضية من النص
  public suggestCaseTags(text: string): Array<{ tag: string; score: number }> {
    const t = (text || '').toLowerCase();
    if (!t.trim()) return [];

    const tagToKeywords: Record<string, string[]> = {
      'تجاري': ['تجاري','شركة','شركات','تاجر','تجارة','أوراق تجارية','سجل تجاري'],
      'شيكات': ['شيك','شيكات','ساحب','مسحوب عليه','رجوع','بدون رصيد'],
      'جنائي': ['جنحة','جناية','متهم','نيابة','إجراءات جزائية','قبض','تفتيش','عقوبة'],
      'عمل': ['عامل','صاحب عمل','فصل','تعسفي','أجر','رواتب','عقد عمل','إجازة'],
      'إيجارات': ['إيجار','إيجارات','مستأجر','مؤجر','بدل','إخلاء','تنبيه'],
      'عقاري': ['ملكية','حيازة','عقار','عقاري','قسمة','فرز','تسجيل'],
      'إداري': ['قرار إداري','مشروعية','اختصاص','ديوان','وقف تنفيذ','طعون إدارية'],
      'أحوال شخصية': ['طلاق','زواج','نفقة','حضانة','ولاية','وصاية','متعة'],
      'ميراث': ['ميراث','تركة','حصر الورثة','قسمة التركة','مواريث'],
      'مدني': ['مدني','تعويض','مسؤولية','عقد','التزام','فسخ']
    };

    const scores: Record<string, number> = {};
    for (const tag of this.knownCaseTags) {
      const kws = tagToKeywords[tag] || [];
      let score = 0;
      for (const kw of kws) {
        if (t.includes(kw.toLowerCase())) score += 2;
      }
      // تعزيز إن ظهر اسم الوسم نفسه
      if (t.includes(tag.toLowerCase())) score += 3;
      // تعزيز بسيط إذا وُجدت مراجع تحمل نفس الوسم
      for (const ref of this.references.values()) {
        if ((ref.tags || []).includes(tag)) {
          const title = `${ref.title} ${ref.source} ${ref.notes || ''}`.toLowerCase();
          if (t.includes(ref.title.toLowerCase()) || t.includes(title)) score += 1;
        }
      }
      if (score > 0) scores[tag] = score;
    }

    return Object.entries(scores)
      .map(([tag, score]) => ({ tag, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  // إضافة مرجع جديد
  public async addReference(reference: Omit<LegalReference, 'id' | 'lastChecked'>): Promise<string> {
    const id = `ref_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const newReference: LegalReference = {
      ...reference,
      id,
      lastChecked: new Date().toISOString()
    };

    this.references.set(id, newReference);
    return id;
  }

  // تحديث مرجع موجود
  public async updateReference(id: string, updates: Partial<LegalReference>): Promise<void> {
    const reference = this.references.get(id);
    if (!reference) {
      throw new Error('المرجع غير موجود');
    }

    const updatedReference: LegalReference = {
      ...reference,
      ...updates,
      lastChecked: new Date().toISOString()
    };

    this.references.set(id, updatedReference);
  }

  // حذف مرجع
  public async deleteReference(id: string): Promise<void> {
    this.references.delete(id);
  }

  // تصدير جميع المراجع
  public exportReferences(): LegalReference[] {
    return Array.from(this.references.values());
  }

  // استيراد مراجع
  public importReferences(references: LegalReference[]): void {
    for (const reference of references) {
      this.references.set(reference.id, reference);
    }
  }
}

// Singleton instance
export const referenceChecker = new ReferenceChecker();

// Export types
export type { LegalReference, CitationAnalysis, AnalysisMode };
