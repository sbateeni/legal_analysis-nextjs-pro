import { describe, it, expect } from 'vitest';
import { chatCacheGet, chatCacheSet, makeChatCacheKey } from '@utils/chatCache';

describe('chatCache', () => {
  it('should set and get cache', async () => {
    const key = makeChatCacheKey('user', 'model', 'message');
    await chatCacheSet(key, { text: 'hello' });
    const res = await chatCacheGet(key);
    expect(res?.text).toBe('hello');
  });
}); 