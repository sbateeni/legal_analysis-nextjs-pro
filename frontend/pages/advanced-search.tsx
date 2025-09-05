import React, { useState, useEffect } from 'react';
import { isMobile } from '@utils/crypto';
import { useTheme } from '../contexts/ThemeContext';
import { AdvancedSearchService } from '@utils/advancedSearchService';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  summary: string;
  url: string;
  source: string;
  type: 'legislation' | 'judgment' | 'gazette' | 'research' | 'international';
  relevance_score: number;
  semantic_score: number;
  context_score: number;
  final_score: number;
  keywords: string[];
  legal_references: string[];
  date: string;
  jurisdiction: string;
  confidence_level: 'high' | 'medium' | 'low';
}

interface SearchResponse {
  status: 'success' | 'error';
  results: SearchResult[];
  total_results: number;
  search_time: number;
  query_analysis: {
    original_query: string;
    processed_query: string;
    extracted_keywords: string[];
    legal_terms: string[];
    context_indicators: string[];
  };
  search_metadata: {
    sources_searched: string[];
    search_strategy: string;
    filters_applied: string[];
    max_results_requested: number;
    results_returned: number;
  };
  error?: string;
}

export default function AdvancedSearchPage() {
  return <AdvancedSearchPageContent />;
}

function AdvancedSearchPageContent() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [context, setContext] = useState('');
  const [caseType, setCaseType] = useState('');
  const [jurisdiction, setJurisdiction] = useState<'PS' | 'international' | 'academic'>('PS');
  const [searchType, setSearchType] = useState<'full_text' | 'summary' | 'references' | 'mixed'>('mixed');
  const [maxResults, setMaxResults] = useState(10);
  
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTime, setSearchTime] = useState(0);
  const [queryAnalysis, setQueryAnalysis] = useState<any>(null);
  const [searchMetadata, setSearchMetadata] = useState<any>(null);
  
  // مرشحات إضافية
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    sources: [] as string[],
    types: [] as string[],
    confidenceLevel: '' as '' | 'high' | 'medium' | 'low'
  });
  const [showFilters, setShowFilters] = useState(false);

  // البحث المتقدم
  const performAdvancedSearch = async () => {
    if (!searchQuery.trim()) {
      setError('يرجى إدخال استعلام للبحث');
      return;
    }

    setLoading(true);
    setError('');
    setSearchResults([]);

    try {
      const response = await fetch('/api/advanced-search/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          context,
          caseType,
          jurisdiction,
          searchType,
          maxResults,
          filters: Object.keys(filters).length > 0 ? filters : undefined
        })
      });

      const data: SearchResponse = await response.json();

      if (data.status === 'success') {
        setSearchResults(data.results);
        setSearchTime(data.search_time);
        setQueryAnalysis(data.query_analysis);
        setSearchMetadata(data.search_metadata);
        setError('');
      } else {
        setError(data.error || 'خطأ في البحث');
        setSearchResults([]);
      }
    } catch (err) {
      setError('خطأ في الاتصال بالنظام');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // البحث عند الضغط على Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      performAdvancedSearch();
    }
  };

  // الحصول على لون مستوى الثقة
  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // الحصول على أيقونة النوع
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'legislation': return '📜';
      case 'judgment': return '⚖️';
      case 'gazette': return '📰';
      case 'research': return '🔬';
      case 'international': return '🌍';
      default: return '📄';
    }
  };

  // الحصول على تسمية النوع
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'legislation': return 'تشريع';
      case 'judgment': return 'حكم قضائي';
      case 'gazette': return 'جريدة رسمية';
      case 'research': return 'بحث أكاديمي';
      case 'international': return 'مصدر دولي';
      default: return 'مستند';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.background,
      color: theme.text,
      fontFamily: 'Tajawal, Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: isMobile() ? '1rem' : '2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: isMobile() ? '1.5rem' : '2rem' }}>
            🔍 البحث القانوني المتقدم
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: isMobile() ? '0.9rem' : '1rem' }}>
            نظام البحث الذكي في القوانين والأحكام الفلسطينية مع فهم السياق القانوني
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile() ? '1rem' : '2rem' }}>
        {/* Search Form */}
        <div style={{
          background: theme.card,
          padding: isMobile() ? '1rem' : '1.5rem',
          borderRadius: '0.75rem',
          boxShadow: `0 1px 3px ${theme.shadow}`,
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: '0 0 1rem 0', color: theme.text }}>🔍 البحث المتقدم</h2>
          
          {/* الاستعلام الرئيسي */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: theme.accent2 }}>
              الاستعلام القانوني:
            </label>
            <textarea
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب استعلامك القانوني هنا... (مثال: قانون العقوبات الفلسطيني، أحكام الطلاق، حقوق العمال)"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${theme.border}`,
                borderRadius: '0.5rem',
                fontSize: '1rem',
                resize: 'vertical',
                minHeight: '100px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* السياق */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: theme.accent2 }}>
              السياق (اختياري):
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="سياق القضية أو الاستشارة القانونية"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${theme.border}`,
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* خيارات البحث */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile() ? '1fr' : 'repeat(2, 1fr)',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: theme.accent2 }}>
                نوع القضية:
              </label>
              <select
                value={caseType}
                onChange={(e) => setCaseType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontFamily: 'inherit'
                }}
              >
                <option value="">جميع الأنواع</option>
                <option value="جنائي">جنائي</option>
                <option value="مدني">مدني</option>
                <option value="تجاري">تجاري</option>
                <option value="أحوال شخصية">أحوال شخصية</option>
                <option value="إداري">إداري</option>
                <option value="دستوري">دستوري</option>
                <option value="عمل">عمل</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: theme.accent2 }}>
                الاختصاص:
              </label>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontFamily: 'inherit'
                }}
              >
                <option value="PS">فلسطيني</option>
                <option value="international">دولي</option>
                <option value="academic">أكاديمي</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: theme.accent2 }}>
                نوع البحث:
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontFamily: 'inherit'
                }}
              >
                <option value="mixed">مختلط</option>
                <option value="full_text">نص كامل</option>
                <option value="summary">ملخصات</option>
                <option value="references">مراجع</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: theme.accent2 }}>
                عدد النتائج:
              </label>
              <select
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontFamily: 'inherit'
                }}
              >
                <option value={5}>5 نتائج</option>
                <option value={10}>10 نتائج</option>
                <option value={20}>20 نتيجة</option>
                <option value={50}>50 نتيجة</option>
              </select>
            </div>
          </div>

          {/* مرشحات إضافية */}
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '0.5rem 1rem',
                border: `1px solid ${theme.border}`,
                borderRadius: '0.5rem',
                background: 'transparent',
                color: theme.text,
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              {showFilters ? 'إخفاء المرشحات' : 'إظهار المرشحات المتقدمة'}
            </button>

            {showFilters && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: '0.5rem',
                border: `1px solid ${theme.border}`
              }}>
                <h4 style={{ margin: '0 0 1rem 0', color: theme.text }}>مرشحات متقدمة</h4>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile() ? '1fr' : 'repeat(2, 1fr)',
                  gap: '1rem'
                }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: theme.accent2 }}>
                      النطاق الزمني:
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="date"
                        value={filters.dateRange.start}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, start: e.target.value }
                        }))}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '0.25rem',
                          fontSize: '0.9rem'
                        }}
                      />
                      <input
                        type="date"
                        value={filters.dateRange.end}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, end: e.target.value }
                        }))}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '0.25rem',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: theme.accent2 }}>
                      مستوى الثقة:
                    </label>
                    <select
                      value={filters.confidenceLevel}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        confidenceLevel: e.target.value as any
                      }))}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: `1px solid ${theme.border}`,
                        borderRadius: '0.25rem',
                        fontSize: '0.9rem'
                      }}
                    >
                      <option value="">جميع المستويات</option>
                      <option value="high">عالية</option>
                      <option value="medium">متوسطة</option>
                      <option value="low">منخفضة</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* زر البحث */}
          <button
            onClick={performAdvancedSearch}
            disabled={loading || !searchQuery.trim()}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '0.5rem',
              background: loading || !searchQuery.trim() ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading || !searchQuery.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !searchQuery.trim() ? 0.6 : 1
            }}
          >
            {loading ? (
              <>
                <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginLeft: '8px' }}></span>
                جاري البحث...
              </>
            ) : (
              '🔍 بحث متقدم'
            )}
          </button>
        </div>

        {/* معلومات البحث */}
        {queryAnalysis && searchMetadata && (
          <div style={{
            background: theme.card,
            padding: isMobile() ? '1rem' : '1.5rem',
            borderRadius: '0.75rem',
            boxShadow: `0 1px 3px ${theme.shadow}`,
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: theme.text }}>📊 تحليل الاستعلام</h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile() ? '1fr' : 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: theme.accent2, fontSize: '0.9rem' }}>الكلمات المفتاحية:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {queryAnalysis.extracted_keywords.map((keyword: string, index: number) => (
                    <span key={index} style={{
                      padding: '0.25rem 0.5rem',
                      background: '#e0e7ff',
                      color: '#3730a3',
                      borderRadius: '0.25rem',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: theme.accent2, fontSize: '0.9rem' }}>المصطلحات القانونية:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {queryAnalysis.legal_terms.map((term: string, index: number) => (
                    <span key={index} style={{
                      padding: '0.25rem 0.5rem',
                      background: '#dcfce7',
                      color: '#166534',
                      borderRadius: '0.25rem',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: '#f8fafc',
              borderRadius: '0.5rem',
              border: `1px solid ${theme.border}`
            }}>
              <div>
                <span style={{ color: theme.text, fontWeight: '600' }}>استراتيجية البحث: </span>
                <span style={{ color: theme.accent2 }}>{searchMetadata.search_strategy}</span>
              </div>
              <div>
                <span style={{ color: theme.text, fontWeight: '600' }}>وقت البحث: </span>
                <span style={{ color: theme.accent2 }}>{searchTime}ms</span>
              </div>
            </div>
          </div>
        )}

        {/* رسائل الخطأ */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>❌</div>
            <strong>خطأ:</strong> {error}
          </div>
        )}

        {/* نتائج البحث */}
        {searchResults.length > 0 && (
          <div style={{
            background: theme.card,
            padding: isMobile() ? '1rem' : '1.5rem',
            borderRadius: '0.75rem',
            boxShadow: `0 1px 3px ${theme.shadow}`
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: theme.text }}>
              نتائج البحث ({searchResults.length} نتيجة)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {searchResults.map((result, index) => (
                <div key={result.id} style={{
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '0.5rem',
                  border: `1px solid ${theme.border}`,
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem'
                  }}>
                    <h4 style={{
                      margin: 0,
                      color: theme.text,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      flex: 1
                    }}>
                      {getTypeIcon(result.type)} {result.title}
                    </h4>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: 'white',
                        background: getConfidenceColor(result.confidence_level)
                      }}>
                        {result.confidence_level === 'high' ? 'عالية' : 
                         result.confidence_level === 'medium' ? 'متوسطة' : 'منخفضة'}
                      </span>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: '#374151',
                        background: '#e5e7eb'
                      }}>
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                  </div>

                  <p style={{
                    color: theme.text,
                    margin: '0 0 0.75rem 0',
                    lineHeight: 1.6
                  }}>
                    {result.content}
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'white',
                    borderRadius: '0.375rem',
                    border: `1px solid ${theme.border}`
                  }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>المصدر: </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: theme.text }}>{result.source}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>التاريخ: </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: theme.text }}>
                          {new Date(result.date).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>الدرجة: </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: theme.accent2 }}>
                          {(result.final_score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        border: 'none',
                        background: theme.accent,
                        color: 'white',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        textDecoration: 'none'
                      }}
                    >
                      🔗 عرض المصدر
                    </a>
                  </div>

                  {/* المراجع القانونية */}
                  {result.legal_references.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0', color: theme.accent2, fontSize: '0.9rem' }}>
                        المراجع القانونية:
                      </h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {result.legal_references.map((ref, refIndex) => (
                          <span key={refIndex} style={{
                            padding: '0.25rem 0.5rem',
                            background: '#fef3c7',
                            color: '#92400e',
                            borderRadius: '0.25rem',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            {ref}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
