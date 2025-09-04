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

// قائمة المواقع القانونية المستهدفة
const LEGAL_SOURCES = {
  muqtafi: {
    name: 'المقتفي - منظومة القضاء والتشريع',
    base_url: 'http://muqtafi.birzeit.edu/pg/',
    search_endpoint: 'http://muqtafi.birzeit.edu/pg/',
    type: 'gazette' as const
  },
  maqam_legislation: {
    name: 'مقام - التشريعات',
    base_url: 'https://maqam.najah.edu/legislation/',
    search_endpoint: 'https://maqam.najah.edu/legislation/',
    type: 'legislation' as const
  },
  maqam_judgments: {
    name: 'مقام - الأحكام القضائية',
    base_url: 'https://maqam.najah.edu/judgments/',
    search_endpoint: 'https://maqam.najah.edu/judgments/',
    type: 'judgment' as const
  },
  maqam_gap: {
    name: 'مقام - قاعدة المعرفة',
    base_url: 'https://maqam.najah.edu/gap/',
    search_endpoint: 'https://maqam.najah.edu/gap/',
    type: 'research' as const
  }
};

// دالة البحث في موقع المقتفي
async function searchMuqtafi(query: string): Promise<SearchResult[]> {
  try {
    // محاكاة البحث في المقتفي - يمكن تطويرها لاحقاً لاستخدام API حقيقي
    const results: SearchResult[] = [];
    
    // إضافة نتائج وهمية بناءً على الاستعلام
    if (query.includes('عقوبات') || query.includes('جريمة')) {
      results.push({
        title: 'قانون العقوبات رقم (16) لسنة 1960م',
        content: 'القانون الأساسي للعقوبات في فلسطين. يتضمن جميع الجرائم والعقوبات المقررة لها، وهو المرجع الأساسي في القانون الجنائي الفلسطيني.',
        url: 'http://muqtafi.birzeit.edu/pg/',
        source: 'المقتفي - منظومة القضاء والتشريع',
        relevance_score: 0.95,
        type: 'legislation'
      });
    }
    
    if (query.includes('عمل') || query.includes('عامل')) {
      results.push({
        title: 'قانون العمل الفلسطيني',
        content: 'القانون المنظم لعلاقات العمل وحقوق العمال وأصحاب العمل. يتضمن أحكام عقود العمل والأجور والإجازات والحقوق العمالية.',
        url: 'http://muqtafi.birzeit.edu/pg/',
        source: 'المقتفي - منظومة القضاء والتشريع',
        relevance_score: 0.90,
        type: 'legislation'
      });
    }
    
    return results;
  } catch (error) {
    console.error('خطأ في البحث في المقتفي:', error);
    return [];
  }
}

// دالة البحث في موقع مقام - التشريعات
async function searchMaqamLegislation(query: string): Promise<SearchResult[]> {
  try {
    const results: SearchResult[] = [];
    
    // محاكاة البحث في تشريعات مقام
    if (query.includes('دستور') || query.includes('دستوري')) {
      results.push({
        title: 'قرار رقم (73) لسنة 2025م - لجنة صياغة الدستور',
        content: 'قرار رئاسي بشأن تسمية أعضاء لجنة صياغة الدستور المؤقت للانتقال من السلطة إلى الدولة. يندرج تحت القانون الدستوري واللجان.',
        url: 'https://maqam.najah.edu/legislation/',
        source: 'مقام - التشريعات',
        relevance_score: 0.95,
        type: 'legislation'
      });
    }
    
    if (query.includes('منافسة') || query.includes('تجاري')) {
      results.push({
        title: 'قرار بقانون رقم (11) لسنة 2025م - قانون المنافسة',
        content: 'قرار بقانون بشأن المنافسة. يندرج تحت القانون التجاري والمنافسة، وهو ساري النفاذ في الضفة الغربية وغزة.',
        url: 'https://maqam.najah.edu/legislation/',
        source: 'مقام - التشريعات',
        relevance_score: 0.90,
        type: 'legislation'
      });
    }
    
    if (query.includes('استملاك') || query.includes('أرض')) {
      results.push({
        title: 'قرار رقم (69) لسنة 2025م - استملاك أراضي رام الله',
        content: 'قرار رئاسي بشأن المصادقة على قرار مجلس الوزراء بالاستملاك مع الحيازة الفورية لقطع أراض في محافظة رام الله والبيرة للمنفعة العامة.',
        url: 'https://maqam.najah.edu/legislation/',
        source: 'مقام - التشريعات',
        relevance_score: 0.85,
        type: 'legislation'
      });
    }
    
    return results;
  } catch (error) {
    console.error('خطأ في البحث في تشريعات مقام:', error);
    return [];
  }
}

// دالة البحث في موقع مقام - الأحكام القضائية
async function searchMaqamJudgments(query: string): Promise<SearchResult[]> {
  try {
    const results: SearchResult[] = [];
    
    // محاكاة البحث في أحكام مقام
    if (query.includes('نقض') || query.includes('طعن')) {
      results.push({
        title: 'القضية رقم 139/2025 - محكمة النقض',
        content: 'حكم صادر عن محكمة النقض الفلسطينية في طعون جزائية بتاريخ 2025-08-25. يتضمن مبادئ قانونية مهمة في القانون الجنائي.',
        url: 'https://maqam.najah.edu/judgments/',
        source: 'مقام - الأحكام القضائية',
        relevance_score: 0.90,
        type: 'judgment'
      });
    }
    
    if (query.includes('دستوري') || query.includes('دستورية')) {
      results.push({
        title: 'القضية رقم 1/2025 - المحكمة الدستورية العليا',
        content: 'حكم صادر عن المحكمة الدستورية العليا الفلسطينية في تنازع تنفيذ بتاريخ 2025-06-01. يتضمن مبادئ دستورية مهمة.',
        url: 'https://maqam.najah.edu/judgments/',
        source: 'مقام - الأحكام القضائية',
        relevance_score: 0.95,
        type: 'judgment'
      });
    }
    
    return results;
  } catch (error) {
    console.error('خطأ في البحث في أحكام مقام:', error);
    return [];
  }
}

// دالة البحث في موقع مقام - قاعدة المعرفة
async function searchMaqamGap(query: string): Promise<SearchResult[]> {
  try {
    const results: SearchResult[] = [];
    
    // محاكاة البحث في قاعدة المعرفة
    if (query.includes('بحث') || query.includes('دراسة')) {
      results.push({
        title: 'القيم الثقافية في إعلانات شركات التأمين',
        content: 'دراسة تحليلية مقارنة لإعلانات مواقع التواصل الاجتماعي. بحث أكاديمي في القانون التجاري والتأمين.',
        url: 'https://maqam.najah.edu/blog/articles/',
        source: 'مقام - قاعدة المعرفة',
        relevance_score: 0.85,
        type: 'research'
      });
    }
    
    if (query.includes('أسرة') || query.includes('مرأة')) {
      results.push({
        title: 'قوانين حماية الأسرة والمساواة بين الجنسين',
        content: 'دراسة في تقاطع النظام الاجتماعي والثقافي مع التشريعات. بحث في قوانين حماية الأسرة في فلسطين والمساواة بين الجنسين.',
        url: 'https://maqam.najah.edu/blog/articles/',
        source: 'مقام - قاعدة المعرفة',
        relevance_score: 0.90,
        type: 'research'
      });
    }
    
    return results;
  } catch (error) {
    console.error('خطأ في البحث في قاعدة المعرفة:', error);
    return [];
  }
}

// الدالة الرئيسية للبحث القانوني
async function performLegalSearch(query: string): Promise<LegalSearchResponse> {
  const startTime = Date.now();
  const allResults: SearchResult[] = [];
  const sourcesSearched: string[] = [];
  
  try {
    // البحث في جميع المصادر بالتوازي
    const searchPromises = [
      searchMuqtafi(query).then(results => {
        sourcesSearched.push('المقتفي');
        return results;
      }),
      searchMaqamLegislation(query).then(results => {
        sourcesSearched.push('مقام - التشريعات');
        return results;
      }),
      searchMaqamJudgments(query).then(results => {
        sourcesSearched.push('مقام - الأحكام');
        return results;
      }),
      searchMaqamGap(query).then(results => {
        sourcesSearched.push('مقام - قاعدة المعرفة');
        return results;
      })
    ];
    
    const searchResults = await Promise.all(searchPromises);
    
    // دمج النتائج
    searchResults.forEach(results => {
      allResults.push(...results);
    });
    
    // ترتيب النتائج حسب درجة الصلة
    allResults.sort((a, b) => b.relevance_score - a.relevance_score);
    
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
