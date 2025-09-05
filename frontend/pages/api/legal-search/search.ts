import { NextApiRequest, NextApiResponse } from 'next';

interface SearchResult {
  title: string;
  content: string;
  url: string;
  source: string;
  relevance_score: number;
  type: 'legislation' | 'judgment' | 'gazette' | 'research';
}

interface LegalSearchResponse {
  status: 'success' | 'error';
  results: SearchResult[];
  total_results: number;
  search_time: number;
  sources_searched: string[];
  error?: string;
}

// مصادر Maqam العامة (قائمة حديثة بدون اعتماد على نموذج البحث الداخلي)
const MAQAM_SOURCES = {
  legislation: {
    name: 'مقام - التشريعات',
    url: 'https://maqam.najah.edu/legislation/',
    type: 'legislation' as const,
  },
  judgments: {
    name: 'مقام - الأحكام القضائية',
    url: 'https://maqam.najah.edu/judgments/',
    type: 'judgment' as const,
  },
  gap: {
    name: 'مقام - قاعدة المعرفة',
    url: 'https://maqam.najah.edu/gap/',
    type: 'research' as const,
  },
};

// جلب عناصر عامة من صفحة Maqam (بدون اعتماد على البحث/تسجيل الدخول)
async function fetchMaqamList(source: keyof typeof MAQAM_SOURCES): Promise<SearchResult[]> {
  const cfg = MAQAM_SOURCES[source];
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(cfg.url, { method: 'GET', signal: controller.signal, headers: { 'User-Agent': 'Legal-Analysis/1.0' } });
    clearTimeout(id);
    const html = await res.text();

    // استخراج بسيط لبطاقات "آخر التشريعات/الأحكام/الأبحاث"
    // نعتمد على أن الصفحة تعرض قائمة بالعناوين وروابطها في العناصر <a>
    const items: SearchResult[] = [];
    const linkRegex = /<a\s+href=\"([^\"]+)\"[^>]*>([^<]{4,200})<\/a>/gmi;
    let match: RegExpExecArray | null;
    const seen = new Set<string>();
    while ((match = linkRegex.exec(html)) && items.length < 20) {
      const href = match[1];
      const text = match[2].replace(/\s+/g, ' ').trim();
      if (!href || !text) continue;
      // تجاهل روابط التنقل/الصفحات
      if (/^\s*[«←→»]$/.test(text)) continue;
      if (/^(الرئيسية|أقسام الموقع|حول الموقع|تسجيل الدخول|الاشتراك|اتصل بنا)$/i.test(text)) continue;
      const url = href.startsWith('http') ? href : new URL(href, cfg.url).toString();
      if (seen.has(url)) continue;
      seen.add(url);
      items.push({
        title: text,
        content: '',
        url,
        source: cfg.name,
        relevance_score: 0.5,
        type: cfg.type,
      });
    }
    return items;
  } catch (e) {
    clearTimeout(id);
    console.warn('فشل جلب صفحة Maqam:', source, e);
    return [];
  }
}

async function searchMaqamLegislation(): Promise<SearchResult[]> {
  return fetchMaqamList('legislation');
}

async function searchMaqamJudgments(): Promise<SearchResult[]> {
  return fetchMaqamList('judgments');
}

async function searchMaqamGap(): Promise<SearchResult[]> {
  return fetchMaqamList('gap');
}

// الدالة الرئيسية للبحث القانوني
async function performLegalSearch(query: string): Promise<LegalSearchResponse> {
  const startTime = Date.now();
  const allResults: SearchResult[] = [];
  const sourcesSearched: string[] = [];
  
  try {
    // جلب عناصر عامة حديثة من Maqam (بدون تخزين دائم)
    const searchPromises = [
      searchMaqamLegislation().then(r => { sourcesSearched.push('مقام - التشريعات'); return r; }),
      searchMaqamJudgments().then(r => { sourcesSearched.push('مقام - الأحكام'); return r; }),
      searchMaqamGap().then(r => { sourcesSearched.push('مقام - قاعدة المعرفة'); return r; }),
    ];
    
    const searchResults = await Promise.all(searchPromises);
    
    // دمج النتائج
    searchResults.forEach(results => {
      allResults.push(...results);
    });
    
    // ترتيب النتائج: نفضل التطابق النصي البسيط إذا وُجد مع الاستعلام، وإلا الدرجة الافتراضية
    const q = (query || '').trim();
    if (q) {
      allResults.sort((a, b) => {
        const am = a.title.includes(q) ? 1 : 0;
        const bm = b.title.includes(q) ? 1 : 0;
        if (am !== bm) return bm - am;
        return b.relevance_score - a.relevance_score;
      });
    } else {
      allResults.sort((a, b) => b.relevance_score - a.relevance_score);
    }
    
    const searchTime = Date.now() - startTime;
    
    return {
      status: 'success',
      results: allResults,
      total_results: allResults.length,
      search_time: searchTime,
      sources_searched: sourcesSearched
    };
    
  } catch (error) {
    console.error('خطأ في البحث القانوني:', error);
    return {
      status: 'error',
      results: [],
      total_results: 0,
      search_time: Date.now() - startTime,
      sources_searched: sourcesSearched,
      error: 'حدث خطأ أثناء البحث في المصادر القانونية'
    };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<LegalSearchResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      results: [],
      total_results: 0,
      search_time: 0,
      sources_searched: [],
      error: 'طريقة غير مسموحة'
    });
  }
  
  try {
    const { query, max_results = 10 } = req.body;
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        results: [],
        total_results: 0,
        search_time: 0,
        sources_searched: [],
        error: 'يرجى إدخال استعلام بحث صحيح'
      });
    }
    
    const searchResponse = await performLegalSearch(query.trim());
    
    // تحديد عدد النتائج المطلوبة
    if (max_results && max_results > 0) {
      searchResponse.results = searchResponse.results.slice(0, max_results);
    }
    
    res.status(200).json(searchResponse);
    
  } catch (error) {
    console.error('خطأ في API البحث القانوني:', error);
    res.status(500).json({
      status: 'error',
      results: [],
      total_results: 0,
      search_time: 0,
      sources_searched: [],
      error: 'خطأ داخلي في الخادم'
    });
  }
}
