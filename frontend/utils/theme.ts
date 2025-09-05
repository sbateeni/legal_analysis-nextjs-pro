export type Theme = {
  background: string;
  card: string;
  border: string;
  input: string;
  text: string;
  accent: string;
  accent2: string;
  resultBg: string;
  errorBg: string;
  errorText: string;
  shadow: string;
  textSecondary?: string;
  textMuted?: string;
  textBright?: string;
};

export type ColorScheme = 'green' | 'blue' | 'purple' | 'orange' | 'pink' | 'teal';

// السمة الخضراء
export const greenTheme: Theme = {
  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
  card: '#f0fdf4',
  border: '#bbf7d0',
  input: '#bbf7d0',
  text: '#222',
  accent: '#16a34a',
  accent2: '#22c55e',
  resultBg: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
  errorBg: '#fff0f0',
  errorText: '#e53e3e',
  shadow: '#16a34a22',
};

// السمة الزرقاء
export const blueTheme: Theme = {
  background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
  card: '#eff6ff',
  border: '#bfdbfe',
  input: '#bfdbfe',
  text: '#1e293b',
  accent: '#2563eb',
  accent2: '#3b82f6',
  resultBg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
  errorBg: '#fff0f0',
  errorText: '#e53e3e',
  shadow: '#2563eb22',
};

// السمة البنفسجية
export const purpleTheme: Theme = {
  background: 'linear-gradient(135deg, #faf5ff 0%, #f8fafc 100%)',
  card: '#faf5ff',
  border: '#ddd6fe',
  input: '#ddd6fe',
  text: '#1e1b4b',
  accent: '#7c3aed',
  accent2: '#8b5cf6',
  resultBg: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)',
  errorBg: '#fff0f0',
  errorText: '#e53e3e',
  shadow: '#7c3aed22',
};

// السمة البرتقالية
export const orangeTheme: Theme = {
  background: 'linear-gradient(135deg, #fff7ed 0%, #fefce8 100%)',
  card: '#fff7ed',
  border: '#fed7aa',
  input: '#fed7aa',
  text: '#451a03',
  accent: '#ea580c',
  accent2: '#f97316',
  resultBg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
  errorBg: '#fff0f0',
  errorText: '#e53e3e',
  shadow: '#ea580c22',
};

// السمة الوردية
export const pinkTheme: Theme = {
  background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
  card: '#fdf2f8',
  border: '#fbcfe8',
  input: '#fbcfe8',
  text: '#831843',
  accent: '#be185d',
  accent2: '#ec4899',
  resultBg: 'linear-gradient(135deg, #fdf2f8 0%, #f9a8d4 100%)',
  errorBg: '#fff0f0',
  errorText: '#e53e3e',
  shadow: '#be185d22',
};

// السمة التركوازية
export const tealTheme: Theme = {
  background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%)',
  card: '#f0fdfa',
  border: '#99f6e4',
  input: '#99f6e4',
  text: '#134e4a',
  accent: '#0d9488',
  accent2: '#14b8a6',
  resultBg: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
  errorBg: '#fff0f0',
  errorText: '#e53e3e',
  shadow: '#0d948822',
};

// الألوان الليلية لكل سمة
export const greenDarkTheme: Theme = {
  background: 'linear-gradient(135deg, #0a5f4a 0%, #064e3b 50%, #022c22 100%)',
  card: '#0a5f4a',
  border: '#10b981',
  input: '#065f46',
  text: '#f0fdf4',
  accent: '#10b981',
  accent2: '#34d399',
  resultBg: 'linear-gradient(135deg, #0a5f4a 0%, #065f46 100%)',
  errorBg: '#3a1a1a',
  errorText: '#ff6b6b',
  shadow: '#10b98133',
  textSecondary: '#d1fae5',
  textMuted: '#a7f3d0',
  textBright: '#ffffff',
};

export const blueDarkTheme: Theme = {
  background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #0f172a 100%)',
  card: '#1e40af',
  border: '#3b82f6',
  input: '#1e3a8a',
  text: '#f8fafc',
  accent: '#3b82f6',
  accent2: '#60a5fa',
  resultBg: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
  errorBg: '#3a1a1a',
  errorText: '#ff6b6b',
  shadow: '#3b82f633',
  textSecondary: '#e0e7ff',
  textMuted: '#c7d2fe',
  textBright: '#ffffff',
};

export const purpleDarkTheme: Theme = {
  background: 'linear-gradient(135deg, #7c3aed 0%, #581c87 50%, #1e1b4b 100%)',
  card: '#7c3aed',
  border: '#8b5cf6',
  input: '#581c87',
  text: '#faf5ff',
  accent: '#8b5cf6',
  accent2: '#a78bfa',
  resultBg: 'linear-gradient(135deg, #7c3aed 0%, #581c87 100%)',
  errorBg: '#3a1a1a',
  errorText: '#ff6b6b',
  shadow: '#8b5cf633',
  textSecondary: '#ede9fe',
  textMuted: '#ddd6fe',
  textBright: '#ffffff',
};

export const orangeDarkTheme: Theme = {
  background: 'linear-gradient(135deg, #ea580c 0%, #7c2d12 50%, #451a03 100%)',
  card: '#ea580c',
  border: '#f97316',
  input: '#7c2d12',
  text: '#fff7ed',
  accent: '#f97316',
  accent2: '#fb923c',
  resultBg: 'linear-gradient(135deg, #ea580c 0%, #7c2d12 100%)',
  errorBg: '#3a1a1a',
  errorText: '#ff6b6b',
  shadow: '#f9731633',
  textSecondary: '#fed7aa',
  textMuted: '#fdba74',
  textBright: '#ffffff',
};

export const pinkDarkTheme: Theme = {
  background: 'linear-gradient(135deg, #be185d 0%, #831843 50%, #500724 100%)',
  card: '#be185d',
  border: '#ec4899',
  input: '#831843',
  text: '#fdf2f8',
  accent: '#ec4899',
  accent2: '#f472b6',
  resultBg: 'linear-gradient(135deg, #be185d 0%, #831843 100%)',
  errorBg: '#3a1a1a',
  errorText: '#ff6b6b',
  shadow: '#ec489933',
  textSecondary: '#fce7f3',
  textMuted: '#fbcfe8',
  textBright: '#ffffff',
};

export const tealDarkTheme: Theme = {
  background: 'linear-gradient(135deg, #0d9488 0%, #134e4a 50%, #042f2e 100%)',
  card: '#0d9488',
  border: '#14b8a6',
  input: '#134e4a',
  text: '#f0fdfa',
  accent: '#14b8a6',
  accent2: '#2dd4bf',
  resultBg: 'linear-gradient(135deg, #0d9488 0%, #134e4a 100%)',
  errorBg: '#3a1a1a',
  errorText: '#ff6b6b',
  shadow: '#14b8a633',
  textSecondary: '#ccfbf1',
  textMuted: '#99f6e4',
  textBright: '#ffffff',
};

// الحصول على السمة حسب اللون والوضع
export function getThemeByColor(colorScheme: ColorScheme, isDark: boolean): Theme {
  if (isDark) {
    switch (colorScheme) {
      case 'green': return greenDarkTheme;
      case 'blue': return blueDarkTheme;
      case 'purple': return purpleDarkTheme;
      case 'orange': return orangeDarkTheme;
      case 'pink': return pinkDarkTheme;
      case 'teal': return tealDarkTheme;
      default: return greenDarkTheme;
    }
  } else {
    switch (colorScheme) {
      case 'green': return greenTheme;
      case 'blue': return blueTheme;
      case 'purple': return purpleTheme;
      case 'orange': return orangeTheme;
      case 'pink': return pinkTheme;
      case 'teal': return tealTheme;
      default: return greenTheme;
    }
  }
}

// الألوان القديمة للتوافق
export const lightTheme = greenTheme;
export const darkTheme = greenDarkTheme; 