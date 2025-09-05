import { NextApiRequest, NextApiResponse } from 'next';

type MaqamKind = 'legislation' | 'judgments' | 'gap';

const MAQAM_CFG: Record<MaqamKind, { url: string; name: string; type: string }> = {
  legislation: { url: 'https://maqam.najah.edu/legislation/', name: 'مقام - التشريعات', type: 'legislation' },
  judgments: { url: 'https://maqam.najah.edu/judgments/', name: 'مقام - الأحكام القضائية', type: 'judgment' },
  gap: { url: 'https://maqam.najah.edu/gap/', name: 'مقام - قاعدة المعرفة', type: 'research' },
};

async function fetchMaqam(kind: MaqamKind) {
  const cfg = MAQAM_CFG[kind];
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(cfg.url, { method: 'GET', signal: controller.signal, headers: { 'User-Agent': 'Legal-Analysis/1.0' } as any });
    clearTimeout(id);
    const html = await res.text();
    const items: { title: string; url: string; source: string; type: string }[] = [];
    const linkRegex = /<a\s+href=\"([^\"]+)\"[^>]*>([^<]{4,200})<\/a>/gmi;
    const seen = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = linkRegex.exec(html)) && items.length < 30) {
      const href = match[1];
      const text = match[2].replace(/\s+/g, ' ').trim();
      if (!href || !text) continue;
      if (/^\s*[«←→»]$/.test(text)) continue;
      if (/^(الرئيسية|أقسام الموقع|حول الموقع|تسجيل الدخول|الاشتراك|اتصل بنا)$/i.test(text)) continue;
      const absUrl = href.startsWith('http') ? href : new URL(href, cfg.url).toString();
      if (seen.has(absUrl)) continue;
      seen.add(absUrl);
      items.push({ title: text, url: absUrl, source: cfg.name, type: cfg.type });
    }
    return items;
  } catch (e) {
    clearTimeout(id);
    console.warn('RAG Maqam fetch failed:', kind, e);
    return [];
  }
}

async function maybeSummarizeWithGemini(title: string): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) return '';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const prompt = `لخّص بإيجاز شديد (سطر واحد) الموضوع التالي بصياغة عربية قانونية رسمية: ${title}`;
    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.();
    return typeof text === 'string' ? text.slice(0, 220) : '';
  } catch {
    return '';
  }
}

// البحث في القوانين
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, top_k = 5 } = req.body;
    
    if (!query || !query.trim()) {
      return res.status(400).json({ 
        status: 'error',
        error: 'الاستعلام مطلوب' 
      });
    }

    // جلب حي من Maqam (تشريعات/أحكام/أبحاث)
    const [leg, judg, gap] = await Promise.all([
      fetchMaqam('legislation'),
      fetchMaqam('judgments'),
      fetchMaqam('gap'),
    ]);

    let items = [...leg, ...judg, ...gap];
    const q = query.trim();
    if (q) items = items.filter(x => x.title.includes(q));

    // بناء نتائج RAG بالشكل الحالي مع مقتطف ملخّص عند التوفر
    const limited = items.slice(0, Math.max(1, Math.min(+top_k || 5, 20)));
    const results = [] as any[];
    for (const it of limited) {
      const excerpt = await maybeSummarizeWithGemini(it.title);
      results.push({
        title: it.title,
        excerpt: excerpt || '',
        source_url: it.url,
        similarity_score: 0.5,
        document_type: it.type,
        jurisdiction: 'PS',
        document_id: it.url,
      });
    }

    res.json({ status: 'success', query, results, total_found: results.length });
  } catch (error) {
    console.error('RAG Search Error:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'خطأ في البحث في القوانين',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    });
  }
}
