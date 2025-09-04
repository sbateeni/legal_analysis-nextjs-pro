/**
 * خدمة السياق القانوني الفلسطيني
 * تستخدم المصادر الرسمية (المقتفي ومقام) لاستخراج السياق القانوني
 */

interface LegalContextResult {
  title: string;
  content: string;
  url: string;
  source: string;
  relevance_score: number;
  type: 'legislation' | 'judgment' | 'gazette' | 'research';
}

interface LegalContextResponse {
  status: 'success' | 'error';
  results: LegalContextResult[];
  total_results: number;
  search_time: number;
  sources_searched: string[];
  error?: string;
}

/**
 * استخراج السياق القانوني من المصادر الرسمية (محسن)
 */
export async function extractLegalContext(
  query: string,
  maxResults: number = 5,
  context?: string,
  caseType?: string
): Promise<LegalContextResponse> {
  try {
    // استخدام البحث المتقدم الجديد
    const response = await fetch('/api/advanced-search/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: query.trim(),
        context,
        caseType,
        jurisdiction: 'PS',
        searchType: 'mixed',
        maxResults,
        filters: {
          confidenceLevel: 'high' // التركيز على النتائج عالية الثقة
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // تحويل البيانات إلى التنسيق المطلوب
    const convertedResults: LegalContextResult[] = data.results.map((result: any) => ({
      title: result.title,
      content: result.content,
      url: result.url,
      source: result.source,
      relevance_score: result.final_score,
      type: result.type
    }));

    return {
      status: data.status,
      results: convertedResults,
      total_results: data.total_results,
      search_time: data.search_time,
      sources_searched: data.search_metadata?.sources_searched || [],
      error: data.error
    };
  } catch (error) {
    console.error('خطأ في استخراج السياق القانوني:', error);
    return {
      status: 'error',
      results: [],
      total_results: 0,
      search_time: 0,
      sources_searched: [],
      error: error instanceof Error ? error.message : 'خطأ غير معروف'
    };
  }
}

/**
 * بناء سياق قانوني منسق للاستخدام في المحادثة أو التحليل
 */
export function buildLegalContextString(results: LegalContextResult[]): string {
  if (!results || results.length === 0) {
    return '';
  }

  const contextParts = results.map((result, index) => {
    return `[${index + 1}] ${result.title}
المصدر: ${result.source}
النوع: ${getTypeLabel(result.type)}
المحتوى: ${result.content.slice(0, 500)}${result.content.length > 500 ? '...' : ''}
الرابط: ${result.url}
درجة الصلة: ${(result.relevance_score * 100).toFixed(1)}%`;
  });

  return `السياق القانوني من المصادر الرسمية الفلسطينية:
${contextParts.join('\n\n')}`;
}

/**
 * الحصول على تسمية النوع بالعربية
 */
function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'legislation': 'تشريع',
    'judgment': 'حكم قضائي',
    'gazette': 'جريدة رسمية',
    'research': 'بحث أكاديمي'
  };
  return labels[type] || type;
}

/**
 * استخراج المراجع القانونية من النتائج
 */
export function extractLegalReferences(results: LegalContextResult[]): string[] {
  const references: string[] = [];
  
  results.forEach(result => {
    if (result.type === 'legislation' || result.type === 'judgment') {
      references.push(`${result.title} - ${result.source}`);
    }
  });
  
  return references;
}

/**
 * فحص صحة المصادر القانونية
 */
export async function checkLegalSourcesHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  online_sources: number;
  total_sources: number;
}> {
  try {
    const response = await fetch('/api/legal-search/health');
    const data = await response.json();
    
    return {
      status: data.status,
      online_sources: data.online_sites,
      total_sources: data.total_sites
    };
  } catch (error) {
    console.error('خطأ في فحص صحة المصادر:', error);
    return {
      status: 'unhealthy',
      online_sources: 0,
      total_sources: 4
    };
  }
}

/**
 * تحسين الاستعلام للبحث القانوني
 */
export function optimizeLegalQuery(originalQuery: string): string {
  // إضافة مصطلحات قانونية فلسطينية شائعة
  const palestinianTerms = [
    'فلسطين',
    'قانون فلسطيني',
    'تشريع فلسطيني',
    'قضاء فلسطيني'
  ];
  
  // إزالة الكلمات غير المهمة
  const stopWords = ['ما', 'هو', 'كيف', 'متى', 'أين', 'لماذا'];
  const words = originalQuery.split(' ').filter(word => 
    !stopWords.includes(word.toLowerCase())
  );
  
  // إضافة المصطلحات الفلسطينية إذا لم تكن موجودة
  const hasPalestinianContext = palestinianTerms.some(term => 
    originalQuery.toLowerCase().includes(term.toLowerCase())
  );
  
  if (!hasPalestinianContext) {
    words.push('فلسطين');
  }
  
  return words.join(' ');
}
