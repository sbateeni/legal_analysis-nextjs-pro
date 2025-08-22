export function isWithinPalestinianJurisdiction(text: string): boolean {
  const normalized = text.replace(/\s+/g, ' ').trim();

  const foreignPhrases = [
    'القانون المصري', 'للقانون المصري',
    'القانون السعودي', 'للقانون السعودي',
    'القانون الأمريكي', 'للقانون الأمريكي',
    'القانون الأوروبي', 'للقانون الأوروبي',
    'القانون الفرنسي', 'للقانون الفرنسي',
    'US law', 'EU law',
  ];

  for (const phrase of foreignPhrases) {
    if (normalized.includes(phrase)) return false;
  }

  // Jordanian law exception: allow only if explicitly operative in Palestine
  const jordanMentions = ['القانون الأردني', 'للقانون الأردني'];
  const hasJordan = jordanMentions.some(p => normalized.includes(p));
  const jordanOperative = normalized.includes('الأردني النافذ في فلسطين');
  if (hasJordan && !jordanOperative) return false;

  return true;
}

export function sanitizeAnswer(text: string): string {
  return text.trim();
} 