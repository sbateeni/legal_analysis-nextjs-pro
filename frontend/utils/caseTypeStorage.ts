// حفظ واستعادة إعدادات نوع القضية
// Case Type Settings Storage

export interface CaseTypeSettings {
  selectedTypes: string[];
  mode: 'basic' | 'advanced';
  includeOptionals: boolean;
  customTypes: string[];
  lastUpdated: string;
}

const STORAGE_KEY = 'legal_analysis_case_type_settings';

export function saveCaseTypeSettings(settings: Partial<CaseTypeSettings>): void {
  try {
    const existing = loadCaseTypeSettings();
    const updated: CaseTypeSettings = {
      ...existing,
      ...settings,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    console.log('💾 تم حفظ إعدادات نوع القضية:', updated);
  } catch (error) {
    console.error('❌ خطأ في حفظ إعدادات نوع القضية:', error);
  }
}

export function loadCaseTypeSettings(): CaseTypeSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('📂 تم تحميل إعدادات نوع القضية:', parsed);
      return parsed;
    }
  } catch (error) {
    console.error('❌ خطأ في تحميل إعدادات نوع القضية:', error);
  }
  
  // إعدادات افتراضية
  return {
    selectedTypes: ['عام'],
    mode: 'basic',
    includeOptionals: false,
    customTypes: [],
    lastUpdated: new Date().toISOString()
  };
}

export function clearCaseTypeSettings(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ تم مسح إعدادات نوع القضية');
  } catch (error) {
    console.error('❌ خطأ في مسح إعدادات نوع القضية:', error);
  }
}

export function getLastSavedDate(): string | null {
  try {
    const settings = loadCaseTypeSettings();
    return settings.lastUpdated;
  } catch {
    return null;
  }
}

// دالة مساعدة للتحقق من صحة الإعدادات
export function validateCaseTypeSettings(settings: any): settings is CaseTypeSettings {
  return (
    settings &&
    Array.isArray(settings.selectedTypes) &&
    typeof settings.mode === 'string' &&
    ['basic', 'advanced'].includes(settings.mode) &&
    typeof settings.includeOptionals === 'boolean' &&
    Array.isArray(settings.customTypes) &&
    typeof settings.lastUpdated === 'string'
  );
}
