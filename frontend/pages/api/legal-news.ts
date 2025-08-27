import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

type NewsResponse = {
  updatedAt: number;
  model: string;
  content: string;
};

// In-memory 24h cache per model
const newsCacheByModel = new Map<string, { content: string; updatedAt: number; expiresAt: number }>();
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function shouldUseCache(model: string): boolean {
  const entry = newsCacheByModel.get(model);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    newsCacheByModel.delete(model);
    return false;
  }
  return true;
}

async function callGemini(prompt: string, apiKey: string, modelName: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

function buildPrompt(sourceText: string): string {
  return [
    'أنت مساعد مختص يرصد الأخبار القانونية الفلسطينية فقط خلال آخر 24 ساعة من النص التالي.',
    'المصدر التالي مأخوذ من موقع رسمي فلسطيني. استخرج فقط: قرارات بقانون، قوانين جديدة، تعديلات على قوانين، نشرات في الجريدة الرسمية، تعليمات أو بلاغات تنظيمية.',
    'التزم بما يلي:',
    '- لا تذكر الأخبار السياسية/الأمنية أو المقالات العامة.',
    '- إن لم تتوفر أي تحديثات قانونية خلال آخر 24 ساعة، أجب: لا توجد تحديثات قانونية خلال 24 ساعة الماضية.',
    '- قدّم الناتج في نقاط موجزة: العنوان | الجهة المُصدِرة | التاريخ | لمحة سريعة.',
    '',
    'نص المصدر (مختصر):',
    sourceText,
  ].join('\n');
}

async function fetchSourceText(): Promise<string> {
  // جلب الصفحة الرئيسية للمصدر
  const url = 'http://www.qanon.ps/index.php';
  const res = await fetch(url, { method: 'GET' });
  const html = await res.text();
  // استخراج نصوص الروابط والعناوين بشكل بسيط
  const matches = Array.from(html.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi))
    .map(m => m[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[^;]+;/g, ' ')
      .trim())
    .filter(Boolean)
    .slice(0, 200);
  // ضم أول 200 عنصر لتقليل الحجم
  return matches.join('\n').slice(0, 8000);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const apiKey = (req.headers['x-api-key'] as string) || (req.query.apiKey as string) || '';
    const modelName = (req.headers['x-model'] as string) || (req.query.model as string) || 'gemini-1.5-flash';
    const force = String(req.query.force || '').toLowerCase() === '1';

    if (!apiKey) {
      res.status(400).json({ error: 'يرجى تزويد مفتاح Gemini API عبر x-api-key أو apiKey' });
      return;
    }

    // Serve from cache when valid and not forced
    if (!force && shouldUseCache(modelName)) {
      const cached = newsCacheByModel.get(modelName)!;
      const response: NewsResponse = {
        updatedAt: cached.updatedAt,
        model: modelName,
        content: cached.content,
      };
      res.status(200).json(response);
      return;
    }
    // إذا لم يكن هناك كاش ولا يوجد طلب إجباري للتحديث، لا نقوم بالتوليد
    if (!force && !shouldUseCache(modelName)) {
      res.status(204).end();
      return;
    }

    // Fetch source and generate new content
    const sourceText = await fetchSourceText();
    const prompt = buildPrompt(sourceText);
    const content = await callGemini(prompt, apiKey, modelName);

    // Cache for 24 hours
    newsCacheByModel.set(modelName, {
      content,
      updatedAt: Date.now(),
      expiresAt: Date.now() + ONE_DAY_MS,
    });

    const response: NewsResponse = {
      updatedAt: Date.now(),
      model: modelName,
      content,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    res.status(500).json({ error: message });
  }
}


