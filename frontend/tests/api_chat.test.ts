import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../pages/api/chat';

let mockAnswerJSON = JSON.stringify({ answer: 'إجابة ضمن فلسطين', suggestions: ['اقتراح'], nextSteps: ['خطوة'], confidence: 0.9 });

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        generateContent: async (_prompt: string) => ({
          response: { text: () => mockAnswerJSON },
        }),
      } as any;
    }
  },
}));

function createMockRes() {
  const res: Partial<NextApiResponse> & { _status?: number; _json?: any } = {};
  res.status = (code: number) => {
    res._status = code; return res as NextApiResponse;
  };
  res.json = (data: any) => { res._json = data; return res as any; };
  return res as NextApiResponse & { _status?: number; _json?: any };
}

describe('api/chat handler', () => {
  beforeEach(() => {
    mockAnswerJSON = JSON.stringify({ answer: 'إجابة ضمن فلسطين', suggestions: ['اقتراح'], nextSteps: ['خطوة'], confidence: 0.9 });
  });

  it('returns structured fields from model JSON', async () => {
    const req = { method: 'POST', body: { message: 'مرحبا', apiKey: 't' } } as unknown as NextApiRequest;
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._json).toMatchObject({ message: 'إجابة ضمن فلسطين', suggestions: ['اقتراح'], nextSteps: ['خطوة'] });
  });

  it('applies safety guard on foreign-law content', async () => {
    mockAnswerJSON = JSON.stringify({ answer: 'وفقاً للقانون المصري', suggestions: [], nextSteps: [], confidence: 0.9 });
    const req = { method: 'POST', body: { message: 'اختبار', apiKey: 'x' } } as unknown as NextApiRequest;
    const res = createMockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(String(res._json.message)).toMatch(/خارج نطاق/);
  });
}); 