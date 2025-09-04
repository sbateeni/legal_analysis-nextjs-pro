export function determineCaseType(description: string): string {
  const keywords = {
    'تجاري': ['عقد', 'تجاري', 'شركة', 'بيع', 'شراء', 'تجارة'],
    'مدني': ['ضرر', 'تعويض', 'مسؤولية', 'إهمال'],
    'جنائي': ['جريمة', 'عقوبة', 'سجن', 'غرامة', 'جنائي'],
    'أحوال شخصية': ['طلاق', 'زواج', 'حضانة', 'نفقة', 'أحوال شخصية'],
    'عمل': ['عمل', 'موظف', 'راتب', 'إجازة', 'فصل'],
    'إداري': ['إداري', 'قرار', 'طعن', 'إلغاء']
  };

  const lowerDescription = description.toLowerCase();
  
  for (const [caseType, keywordsList] of Object.entries(keywords)) {
    if (keywordsList.some(keyword => lowerDescription.includes(keyword))) {
      return caseType;
    }
  }
  
  return 'عام';
}

export function assessComplexity(description: string, caseType: string): 'low' | 'medium' | 'high' {
  let complexity = 0;
  
  if (description.length > 200) complexity += 2;
  else if (description.length > 100) complexity += 1;
  
  if (caseType === 'جنائي' || caseType === 'إداري') complexity += 2;
  else if (caseType === 'تجاري' || caseType === 'أحوال شخصية') complexity += 1;
  
  if (complexity >= 3) return 'high';
  if (complexity >= 2) return 'medium';
  return 'low';
}

export function calculateConfidence(description: string): number {
  let confidence = 0.7; // نقطة البداية
  
  if (description.length > 100) confidence += 0.1;
  if (description.includes('واضح') || description.includes('محدد')) confidence += 0.1;
  
  return Math.max(0.1, Math.min(0.95, confidence));
}

export function estimateDuration(complexity: string): string {
  const durations = {
    'low': '1-2 أيام',
    'medium': '2-4 أيام',
    'high': '3-6 أيام'
  };
  
  return durations[complexity as keyof typeof durations] || '2-3 أيام';
}

export function calculateSuccessProbability(caseType: string, complexity: string): number {
  let probability = 0.7; // نقطة البداية
  
  // تعديل حسب نوع القضية
  const caseTypeAdjustments = {
    'تجاري': 0.1,
    'مدني': 0.05,
    'جنائي': -0.1,
    'أحوال شخصية': 0.15,
    'عمل': 0.0,
    'إداري': -0.05
  };
  
  probability += caseTypeAdjustments[caseType as keyof typeof caseTypeAdjustments] || 0;
  
  // تعديل حسب التعقيد
  if (complexity === 'low') probability += 0.1;
  else if (complexity === 'high') probability -= 0.1;
  
  return Math.max(0.1, Math.min(0.95, probability));
}
