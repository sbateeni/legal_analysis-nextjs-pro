import { describe, it, expect } from 'vitest';
import { isWithinPalestinianJurisdiction, sanitizeAnswer } from '../utils/safety';

describe('safety utils', () => {
  it('allows neutral Palestinian-context answers', () => {
    expect(isWithinPalestinianJurisdiction('تحليل قانوني فلسطيني ضمن القضاء الفلسطيني')).toBe(true);
  });

  it('blocks obvious foreign-law references out of scope', () => {
    expect(isWithinPalestinianJurisdiction('وفقاً للقانون المصري المادة 10')).toBe(false);
  });

  it('does not block when mentioning Jordanian law in the context of Palestine explicitly', () => {
    expect(isWithinPalestinianJurisdiction('وفقاً للقانون الأردني النافذ في فلسطين')).toBe(true);
  });

  it('sanitizeAnswer trims whitespace', () => {
    expect(sanitizeAnswer('  نص  ')).toBe('نص');
  });
}); 