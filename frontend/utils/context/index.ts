/**
 * فهرس السياق المتقدم
 * Advanced Context Index - Exports all context-related modules
 */

// تصدير الأنواع الأساسية
export * from './types';

// تصدير المدير الرئيسي
export { AdvancedContextManager } from './advancedContextManager';

// تصدير مساعدات وأدوات إضافية
export { createContextInstance, getGlobalContext } from './contextUtils';

// إنشاء مثيل عام للاستخدام
import { AdvancedContextManager } from './advancedContextManager';

// مثيل عام للسياق المتقدم
export const globalContextManager = AdvancedContextManager.getInstance();