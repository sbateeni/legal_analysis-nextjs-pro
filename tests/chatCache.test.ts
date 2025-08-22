import { describe, it, expect } from 'vitest';
import { chatCacheGet, chatCacheSet, makeChatCacheKey } from '../utils/chatCache';

describe('chat cache', () => {
  it('stores and retrieves values', () => {
    const key = makeChatCacheKey({ message: 'سؤال', caseType: 'مدني', currentStage: 2, previousAnalysisHash: 'abc' });
    chatCacheSet(key, { ok: true });
    expect(chatCacheGet(key)).toEqual({ ok: true });
  });

  it('returns null for missing keys', () => {
    expect(chatCacheGet('missing')).toBeNull();
  });
}); 