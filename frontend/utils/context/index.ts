/**
 * فهرس السياق المتقدم
 * Advanced Context Index - Exports all context-related modules
 */

// تصدير الأنواع الأساسية
export * from './types';

// تصدير المدير الرئيسي
export { AdvancedContextManager } from './advancedContextManager';

// استيراد المدير
import { AdvancedContextManager } from './advancedContextManager';

// دوال مساعدة مباشرة دون استيراد من contextUtils
export function createContextInstance(): AdvancedContextManager {
  return AdvancedContextManager.getInstance();
}

export function getGlobalContext(): AdvancedContextManager {
  return AdvancedContextManager.getInstance();
}

// مثيل عام للسياق المتقدم
export const globalContextManager = AdvancedContextManager.getInstance();