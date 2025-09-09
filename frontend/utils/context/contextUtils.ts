/**
 * أدوات السياق المساعدة
 * Context Utilities - Helper functions for context management
 */

import { AdvancedContextManager } from './advancedContextManager';

/**
 * إنشاء مثيل جديد من مدير السياق
 */
export function createContextInstance(): AdvancedContextManager {
  return AdvancedContextManager.getInstance();
}

/**
 * الحصول على المثيل العام من مدير السياق
 */
export function getGlobalContext(): AdvancedContextManager {
  return AdvancedContextManager.getInstance();
}

/**
 * تنظيف وإعادة تعيين السياق العام
 */
export function resetGlobalContext(): void {
  const contextManager = AdvancedContextManager.getInstance();
  contextManager.resetContext();
}

/**
 * إنشاء معرف فريد للنقاط الحرجة
 */
export function generateFindingId(stageIndex: number, type: string): string {
  return `${type}-${stageIndex}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * تنسيق الوقت للطوابع الزمنية
 */
export function formatTimestamp(date?: Date): string {
  return (date || new Date()).toISOString();
}

/**
 * تقييم مستوى المخاطر من النص
 */
export function assessRiskLevel(riskText: string): number {
  const criticalKeywords = ['خطير جداً', 'حاسم', 'حرج', 'فوري'];
  const highKeywords = ['خطير', 'مهم', 'عاجل'];
  const mediumKeywords = ['متوسط', 'محتمل', 'ممكن'];
  
  const lowerText = riskText.toLowerCase();
  
  if (criticalKeywords.some(keyword => lowerText.includes(keyword))) {
    return 0.9;
  } else if (highKeywords.some(keyword => lowerText.includes(keyword))) {
    return 0.7;
  } else if (mediumKeywords.some(keyword => lowerText.includes(keyword))) {
    return 0.5;
  } else {
    return 0.3;
  }
}

/**
 * تحديد اتجاه التغيير
 */
export function determineTrend(previous: number, current: number): 'increasing' | 'decreasing' | 'stable' {
  const threshold = 0.1;
  const difference = current - previous;
  
  if (Math.abs(difference) < threshold) {
    return 'stable';
  } else if (difference > 0) {
    return 'increasing';
  } else {
    return 'decreasing';
  }
}

/**
 * استخراج الكلمات المفتاحية من النص
 */
export function extractKeywords(text: string, maxKeywords: number = 5): string[] {
  const stopWords = new Set(['في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي']);
  
  const words = text
    .toLowerCase()
    .replace(/[^\u0621-\u06FA\u0750-\u077F\s]/g, '') // Arabic characters only
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  
  // Count word frequency
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });
  
  // Sort by frequency and return top keywords
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * حساب درجة التشابه بين نصين
 */
export function calculateSimilarity(text1: string, text2: string): number {
  const keywords1 = new Set(extractKeywords(text1, 10));
  const keywords2 = new Set(extractKeywords(text2, 10));
  
  const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
  const union = new Set([...keywords1, ...keywords2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * تصدير بيانات السياق إلى JSON
 */
export function exportContextToJSON(contextManager: AdvancedContextManager): string {
  try {
    const contextData = contextManager.exportContextData();
    return JSON.stringify(contextData, null, 2);
  } catch (error) {
    console.error('Error exporting context:', error);
    return '{}';
  }
}

/**
 * إنشاء ملخص سريع للسياق
 */
export function generateQuickSummary(contextManager: AdvancedContextManager): string {
  const report = contextManager.getContextReport();
  
  return `ملخص سريع: ${report.stagesCompleted} مراحل مكتملة، ` +
         `جودة متوسطة ${(report.averageQuality * 100).toFixed(0)}%، ` +
         `اتجاه النجاح: ${report.successTrend === 'improving' ? 'محسن' : 
                        report.successTrend === 'declining' ? 'متراجع' : 'مستقر'}`;
}