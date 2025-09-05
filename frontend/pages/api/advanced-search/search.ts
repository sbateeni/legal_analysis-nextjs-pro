import { NextApiRequest, NextApiResponse } from 'next';
import { AdvancedSearchService, AdvancedQueryProcessor } from '../../../utils/advancedSearchService';

interface AdvancedSearchRequest {
  query: string;
  context?: string;
  caseType?: string;
  jurisdiction?: 'PS' | 'international' | 'academic';
  searchType?: 'full_text' | 'summary' | 'references' | 'mixed';
  maxResults?: number;
  filters?: {
    dateRange?: {
      start: string;
      end: string;
    };
    sources?: string[];
    types?: string[];
    confidenceLevel?: 'high' | 'medium' | 'low';
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      results: [],
      total_results: 0,
      search_time: 0,
      query_analysis: {
        original_query: '',
        processed_query: '',
        extracted_keywords: [],
        legal_terms: [],
        context_indicators: []
      },
      search_metadata: {
        sources_searched: [],
        search_strategy: 'failed',
        filters_applied: []
      },
      error: 'طريقة غير مسموحة'
    });
  }

  try {
    const {
      query,
      context,
      caseType,
      jurisdiction = 'PS',
      searchType = 'mixed',
      maxResults = 10,
      filters
    }: AdvancedSearchRequest = req.body;

    // التحقق من صحة المدخلات
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        results: [],
        total_results: 0,
        search_time: 0,
        query_analysis: {
          original_query: query || '',
          processed_query: '',
          extracted_keywords: [],
          legal_terms: [],
          context_indicators: []
        },
        search_metadata: {
          sources_searched: [],
          search_strategy: 'failed',
          filters_applied: []
        },
        error: 'يرجى إدخال استعلام بحث صحيح'
      });
    }

    // التحقق من طول الاستعلام
    if (query.length > 1000) {
      return res.status(400).json({
        status: 'error',
        results: [],
        total_results: 0,
        search_time: 0,
        query_analysis: {
          original_query: query,
          processed_query: '',
          extracted_keywords: [],
          legal_terms: [],
          context_indicators: []
        },
        search_metadata: {
          sources_searched: [],
          search_strategy: 'failed',
          filters_applied: []
        },
        error: 'الاستعلام طويل جداً. الحد الأقصى 1000 حرف'
      });
    }

    // التحقق من عدد النتائج المطلوبة
    const validMaxResults = Math.min(Math.max(1, maxResults || 10), 50);

    // إعداد كائن البحث
    const searchQuery = {
      text: query.trim(),
      context,
      caseType,
      jurisdiction,
      searchType
    };

    // تنفيذ البحث المتقدم
    const searchResponse = await AdvancedSearchService.performAdvancedSearch(
      searchQuery,
      validMaxResults
    );

    // تطبيق المرشحات الإضافية إذا كانت موجودة
    if (filters && searchResponse.status === 'success') {
      let filteredResults = searchResponse.results;

      // تصفية حسب النوع
      if (filters.types && filters.types.length > 0) {
        filteredResults = filteredResults.filter(result => 
          filters.types!.includes(result.type)
        );
      }

      // تصفية حسب المصادر
      if (filters.sources && filters.sources.length > 0) {
        filteredResults = filteredResults.filter(result => 
          filters.sources!.some(source => result.source.includes(source))
        );
      }

      // تصفية حسب مستوى الثقة
      if (filters.confidenceLevel) {
        filteredResults = filteredResults.filter(result => 
          result.confidence_level === filters.confidenceLevel
        );
      }

      // تصفية حسب النطاق الزمني
      if (filters.dateRange) {
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        
        filteredResults = filteredResults.filter(result => {
          const resultDate = new Date(result.date);
          return resultDate >= startDate && resultDate <= endDate;
        });
      }

      searchResponse.results = filteredResults;
      searchResponse.total_results = filteredResults.length;
    }

    // إضافة معلومات إضافية للاستجابة
    const enhancedResponse = {
      ...searchResponse,
      search_metadata: {
        ...searchResponse.search_metadata,
        filters_applied: [
          ...searchResponse.search_metadata.filters_applied,
          ...(filters ? Object.keys(filters).map(key => `${key}: ${JSON.stringify(filters[key as keyof typeof filters])}`) : [])
        ],
        max_results_requested: validMaxResults,
        results_returned: searchResponse.results.length
      }
    };

    // أعِد دائماً JSON مع 200 لتجنب فشل response.json() على الواجهة
    // يتضمن ذلك حالة النتائج الفارغة
    res.status(200).json(enhancedResponse);

  } catch (error) {
    console.error('خطأ في API البحث المتقدم:', error);
    
    res.status(500).json({
      status: 'error',
      results: [],
      total_results: 0,
      search_time: 0,
      query_analysis: {
        original_query: req.body?.query || '',
        processed_query: '',
        extracted_keywords: [],
        legal_terms: [],
        context_indicators: []
      },
      search_metadata: {
        sources_searched: [],
        search_strategy: 'failed',
        filters_applied: []
      },
      error: error instanceof Error ? error.message : 'خطأ داخلي في الخادم'
    });
  }
}
