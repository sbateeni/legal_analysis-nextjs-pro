import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface OrganizeCaseRequest {
  text: string;
  apiKey: string;
}

interface OrganizeCaseResponse {
  organizedText: string;
  originalLength: number;
  organizedLength: number;
  improvements: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { text, apiKey }: OrganizeCaseRequest = req.body;

    // التحقق من المدخلات
    if (!text || typeof text !== 'string') {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(400).json({ message: 'النص مطلوب' });
    }

    if (!apiKey || typeof apiKey !== 'string') {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(400).json({ message: 'مفتاح API مطلوب' });
    }

    if (text.length < 10) {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(400).json({ message: 'النص قصير جداً للتنظيم' });
    }

    if (text.length > 50000) {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(400).json({ message: 'النص طويل جداً للتنظيم' });
    }

    // استدعاء Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
أنت خبير قانوني فلسطيني محترف مع خبرة 20+ سنة في المحاكم الفلسطينية. مهمتك هي تنظيم وترتيب تفاصيل القضية المقدمة بصياغة قانونية محترفة.

المهمة:
قم بتنظيم النص التالي مع الحفاظ على جميع المعلومات الأصلية دون إضافة أو حذف أي معلومة، ولكن مع:

1. ترتيب المعلومات ترتيباً منطقياً وزمنياً
2. استخدام المصطلحات القانونية الصحيحة
3. تحديد الأطراف وصفاتهم القانونية بوضوح
4. تنظيم الأحداث حسب التسلسل الزمني
5. صياغة الجمل بطريقة قانونية محترفة
6. إضافة عناوين فرعية مناسبة للتنظيم
7. توضيح العلاقات القانونية بين الأطراف
8. ترتيب الأدلة والمستندات المذكورة

النص المراد تنظيمه:
${text}

تعليمات مهمة:
- احتفظ بجميع المعلومات الأصلية دون إضافة أو حذف
- استخدم المصطلحات القانونية الفلسطينية الصحيحة
- رتب المعلومات ترتيباً منطقياً
- استخدم عناوين فرعية للتنظيم
- اكتب بصياغة قانونية محترفة
- تأكد من وضوح هوية الأطراف
- رتب الأحداث زمنياً

قم بإرجاع النص المنظم فقط دون أي تعليقات إضافية.
`;

    const result = await model.generateContent(prompt);
    const organizedText = result.response.text();

    // حساب الإحصائيات
    const originalLength = text.length;
    const organizedLength = organizedText.length;
    
    const improvements = [
      'تم ترتيب المعلومات ترتيباً منطقياً',
      'استخدام المصطلحات القانونية الصحيحة',
      'تحديد الأطراف وصفاتهم بوضوح',
      'تنظيم الأحداث حسب التسلسل الزمني',
      'صياغة قانونية محترفة'
    ];

    const response: OrganizeCaseResponse = {
      organizedText,
      originalLength,
      organizedLength,
      improvements
    };

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).json(response);

  } catch (error: unknown) {
    console.error('Error in organize-case API:', error);
    
    let errorMessage = 'حدث خطأ أثناء تنظيم القضية';
    
    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as Error).message;
      if (message.includes('API_KEY_INVALID')) {
        errorMessage = 'مفتاح API غير صحيح';
      } else if (message.includes('QUOTA_EXCEEDED')) {
        errorMessage = 'تم تجاوز الحد المسموح من الطلبات';
      } else if (message.includes('SAFETY')) {
        errorMessage = 'المحتوى لا يلبي معايير السلامة';
      }
    }

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(500).json({ message: errorMessage });
  }
}
