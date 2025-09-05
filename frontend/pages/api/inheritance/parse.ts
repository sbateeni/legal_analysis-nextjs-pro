import type { NextApiRequest, NextApiResponse } from 'next';

// يقرأ تفاصيل نصية ويُحاول استخراج مدخلات الحاسبة باستخدام Gemini إن توفر المفتاح
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', error: 'Method not allowed' });
  }

  try {
    const { details } = req.body || {};
    if (!details || typeof details !== 'string' || details.trim().length < 3) {
      return res.status(200).json({ status: 'success', inputs: {} });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      // سقوط احتياطي: استخراج بسيط بالأرقام والكلمات المفتاحية
      const extracted = naiveExtract(details);
      return res.status(200).json({ status: 'success', inputs: extracted, note: 'fallback' });
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const prompt = `أنت مساعد لتحليل نصوص المواريث بالعربية. أعطِ JSON فقط بالصيغة التالية دون أي شرح:
{
  "estateAmount": number,
  "husband": boolean,
  "wives": number,
  "father": boolean,
  "mother": boolean,
  "sons": number,
  "daughters": number
}
حلّل النص التالي واستخرج القيم مع افتراض صفر عند الغموض، واعتبر الكلمات الدالة (زوج، زوجة/زوجات، أب، أم، ابن/أبناء، بنت/بنات، مبلغ التركة). النص:
"""
${details}
"""`;
    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() || '{}';
    let parsed: any = {};
    try { parsed = JSON.parse(text); } catch {}

    // تنظيف القيم
    const cleaned = sanitize(parsed);
    return res.status(200).json({ status: 'success', inputs: cleaned });
  } catch (error) {
    return res.status(200).json({ status: 'success', inputs: {} });
  }
}

function digits(s: string): number {
  const m = (s.match(/[0-9]+([\.,][0-9]+)?/g) || [])[0];
  if (!m) return 0;
  return parseFloat(m.replace(',', '.')) || 0;
}

function naiveExtract(text: string) {
  const t = text.toLowerCase();
  return sanitize({
    estateAmount: digits(t),
    husband: /\bزوج\b/.test(t),
    wives: /(زوجات|زوجة)/.test(t) ? digits(t) || 1 : 0,
    father: /(أب|والد)/.test(t),
    mother: /(أم|والدة)/.test(t),
    sons: /(ابن|أبناء)/.test(t) ? Math.max(1, digits(t)) : 0,
    daughters: /(بنت|بنات)/.test(t) ? Math.max(1, digits(t)) : 0,
  });
}

function sanitize(x: any) {
  return {
    estateAmount: clampNum(x.estateAmount),
    husband: !!x.husband && !x.wives,
    wives: clampInt(x.wives),
    father: !!x.father,
    mother: !!x.mother,
    sons: clampInt(x.sons),
    daughters: clampInt(x.daughters),
  };
}

function clampNum(n: any): number { const v = parseFloat(n); return isFinite(v) && v > 0 ? v : 0; }
function clampInt(n: any): number { const v = parseInt(n); return isFinite(v) && v > 0 ? v : 0; }


