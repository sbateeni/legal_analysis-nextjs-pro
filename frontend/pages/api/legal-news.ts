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
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini:', error);
    throw new Error('فشل في الاتصال بـ Gemini API');
  }
}

function buildPrompt(sourceText: string): string {
  return [
    'أنت مساعد مختص يرصد الأخبار القانونية الفلسطينية فقط خلال آخر 24 ساعة من النص التالي.',
    'المصادر التالية مأخوذة من مواقع فلسطينية رسمية. استخرج فقط: قرارات بقانون، قوانين جديدة، تعديلات على قوانين، نشرات في الجريدة الرسمية، تعليمات أو بلاغات تنظيمية.',
    'التزم بما يلي:',
    '- لا تذكر الأخبار السياسية/الأمنية أو المقالات العامة.',
    '- إن لم تتوفر أي تحديثات قانونية خلال آخر 24 ساعة، أجب: لا توجد تحديثات قانونية خلال 24 ساعة الماضية.',
    '- قدّم الناتج في نقاط موجزة: العنوان | الجهة المُصدِرة | التاريخ | لمحة سريعة.',
    '- ركّز أولاً على العناصر التي يظهر فيها تاريخ حديث خلال آخر 48 ساعة إن وُجد.',
    '',
    'نص المصادر (مختصر):',
    sourceText,
  ].join('\n');
}

// مصادر فلسطينية رسمية يُحتمل أن تنشر تحديثات قانونية
const OFFICIAL_SOURCES: Array<{ label: string; url: string }> = [
  { label: 'بوابة قانون (التشريعات الفلسطينية)', url: 'http://www.qanon.ps/index.php' },
  { label: 'مجلس الوزراء الفلسطيني', url: 'https://www.palestinecabinet.gov.ps' },
  { label: 'وزارة العدل الفلسطينية', url: 'https://www.moj.pna.ps' },
  { label: 'الوقائع الفلسطينية (الجريدة الرسمية) - إن وُجدت روابط', url: 'https://info.wafa.ps' }
];

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('انتهت مهلة الاتصال بالمصدر')), ms);
    promise
      .then((value) => { clearTimeout(id); resolve(value); })
      .catch((err) => { clearTimeout(id); reject(err); });
  });
}

function extractReadableText(html: string): string {
  // سحب نصوص أساسية بسيطة من الروابط والعناوين
  const anchors = Array.from(html.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi))
    .map(m => m[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[^;]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim())
    .filter(Boolean)
    .slice(0, 120);
  const headings = Array.from(html.matchAll(/<(h1|h2|h3)[^>]*>([\s\S]*?)<\/\1>/gi))
    .map(m => m[2]
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[^;]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim())
    .filter(Boolean)
    .slice(0, 40);
  const combined = [...headings, ...anchors].join('\n');
  return combined.slice(0, 8000);
}

async function fetchOneSource(url: string): Promise<string> {
  const res = await withTimeout(fetch(url, {
    method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  }), 7000);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  return extractReadableText(html);
}

async function fetchSourceText(): Promise<string> {
  const results = await Promise.allSettled(
    OFFICIAL_SOURCES.map(async (src) => {
      try {
        const text = await fetchOneSource(src.url);
        if (!text) return '';
        return `المصدر: ${src.label} (${src.url})\n${text}`;
      } catch (err) {
        console.warn('Source failed:', src.url, err);
        return '';
      }
    })
  );
  const texts = results
    .map(r => r.status === 'fulfilled' ? r.value : '')
    .filter(Boolean);
  const joined = texts.join('\n\n').trim();
  return joined || 'لا يمكن الوصول للمصادر حالياً. يرجى المحاولة لاحقاً.';
}

// ————————————————————————————————
// ترجيح العناصر ذات التواريخ الحديثة
// ————————————————————————————————
const AR_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

function isRecentDateToken(token: string, now: Date, maxDays: number): boolean {
  // أنماط شائعة: 2025-08-28 | 28-08-2025 | 28/08/2025 | 28/8/2025
  const ymd = token.match(/(20\d{2})[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])/);
  const dmy = token.match(/(0?[1-9]|[12]\d|3[01])[-/](0?[1-9]|1[0-2])[-/](20\d{2})/);
  let d: Date | null = null;
  if (ymd) {
    const y = Number(ymd[1]);
    const m = Number(ymd[2]) - 1;
    const da = Number(ymd[3]);
    d = new Date(y, m, da);
  } else if (dmy) {
    const da = Number(dmy[1]);
    const m = Number(dmy[2]) - 1;
    const y = Number(dmy[3]);
    d = new Date(y, m, da);
  } else {
    // صيغة عربية تقريبية: 28 أغسطس 2025
    const ar = token.match(/(0?[1-9]|[12]\d|3[01])\s+([\u0621-\u064A]+)\s+(20\d{2})/);
    if (ar) {
      const da = Number(ar[1]);
      const monthName = ar[2];
      const y = Number(ar[3]);
      const mi = AR_MONTHS.indexOf(monthName);
      if (mi >= 0) d = new Date(y, mi, da);
    }
  }
  if (!d || isNaN(d.getTime())) return false;
  const diffMs = now.getTime() - d.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= maxDays;
}

function prioritizeRecent(text: string, maxDays: number): string {
  const now = new Date();
  const lines = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
  if (lines.length === 0) return text;
  const recent: string[] = [];
  const rest: string[] = [];
  for (const line of lines) {
    const hasRecent = line.split(/\s+/).some(tok => isRecentDateToken(tok, now, maxDays));
    if (hasRecent) recent.push(line);
    else rest.push(line);
  }
  if (recent.length === 0) return text; // لا يوجد ما يُرجّح
  const merged = [...recent, '', ...rest].join('\n');
  return merged.slice(0, 12000);
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
    // إذا لم يكن هناك كاش أو تم إجبار التحديث، قم بالتوليد الآن

    // Fetch source and generate new content
    const sourceRaw = await fetchSourceText();
    const daysParam = Number((req.query.days as string) || '2');
    const maxDays = Number.isFinite(daysParam) && daysParam > 0 && daysParam <= 7 ? Math.floor(daysParam) : 2;
    const sourceText = prioritizeRecent(sourceRaw, maxDays);
    const prompt = buildPrompt(sourceText);
    const content = await callGemini(prompt, apiKey, modelName);

    // Cache the result
    const now = Date.now();
    newsCacheByModel.set(modelName, {
      content,
      updatedAt: now,
      expiresAt: now + ONE_DAY_MS,
    });

    const response: NewsResponse = {
      updatedAt: now,
      model: modelName,
      content,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in legal-news API:', error);
    
    // إرجاع رسالة خطأ مناسبة
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}


