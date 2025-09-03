import { describe, it, expect } from 'vitest';
import { ChatRequestSchema, ChatModelResponseSchema } from '@utils/schemas';

describe('schemas', () => {
  it('validates a correct chat request', () => {
    const parsed = ChatRequestSchema.safeParse({
      message: 'مرحبا',
      apiKey: 'key',
      conversationHistory: [],
      context: { caseType: 'قضية', currentStage: 1, previousAnalysis: '...' },
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects a short message', () => {
    const parsed = ChatRequestSchema.safeParse({ message: 'لا', apiKey: 'k' });
    expect(parsed.success).toBe(false);
  });

  it('validates model response JSON', () => {
    const parsed = ChatModelResponseSchema.safeParse({
      answer: 'إجابة',
      suggestions: ['س1'],
      nextSteps: ['خ1'],
      confidence: 0.8,
    });
    expect(parsed.success).toBe(true);
  });
}); 