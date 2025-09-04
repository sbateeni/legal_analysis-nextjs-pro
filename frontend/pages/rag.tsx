import { useState, useEffect } from 'react';
import Head from 'next/head';

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

interface SiteStatus {
  name: string;
  url: string;
  status: 'online' | 'offline' | 'error';
  response_time: number;
  last_checked: string;
  error_message?: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  sites: SiteStatus[];
  total_sites: number;
  online_sites: number;
  offline_sites: number;
  check_time: number;
}

export default function RAGPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [systemStatus, setSystemStatus] = useState<HealthResponse | null>(null);
  const [searchTime, setSearchTime] = useState(0);
  const [sourcesSearched, setSourcesSearched] = useState<string[]>([]);

  // فحص حالة النظام القانوني
  const checkSystemStatus = async () => {
    try {
      const response = await fetch('/api/legal-search/health');
      const data: HealthResponse = await response.json();
      
      setSystemStatus(data);
        setError('');
    } catch (err) {
      setError('لا يمكن الاتصال بالنظام القانوني');
      setSystemStatus(null);
    }
  };

  // البحث في القوانين
  const searchLaws = async () => {
    if (!searchQuery.trim()) {
      setError('يرجى إدخال استعلام للبحث');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/legal-search/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, max_results: 10 })
      });

      const data: LegalSearchResponse = await response.json();
      
      if (data.status === 'success') {
        setSearchResults(data.results);
        setSearchTime(data.search_time);
        setSourcesSearched(data.sources_searched);
        setError('');
      } else {
        setError(data.error || 'خطأ في البحث');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالنظام القانوني');
    } finally {
      setLoading(false);
    }
  };

  // فحص الحالة عند تحميل الصفحة
  useEffect(() => {
    checkSystemStatus();
  }, []);

  return (
    <>
      <Head>
        <title>نظام البحث القانوني الذكي - نظام التحليل القانوني</title>
        <meta name="description" content="نظام البحث الذكي في القوانين والأحكام الفلسطينية من المصادر الرسمية" />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </Head>

      <div className="container mx-auto p-6 max-w-7xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            🏛️ نظام البحث القانوني الذكي
          </h1>
          
          <p className="text-center text-gray-600 mb-8">
            نظام البحث الذكي في القوانين والأحكام الفلسطينية من المصادر الرسمية - المقتفي ومقام
          </p>

          {/* حالة النظام القانوني */}
          <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">🌐 حالة المصادر القانونية</h3>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${
                    systemStatus?.status === 'healthy' ? 'bg-green-500 animate-pulse' : 
                    systemStatus?.status === 'degraded' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500 animate-pulse'
                  }`}></div>
                  <span className="text-base font-medium">
                    {systemStatus?.status === 'healthy' ? '✅ جميع المصادر متاحة' : 
                     systemStatus?.status === 'degraded' ? '⚠️ بعض المصادر غير متاحة' : 
                     systemStatus?.status === 'unhealthy' ? '❌ المصادر غير متاحة' : '🔄 جاري الفحص...'}
                  </span>
                  {systemStatus && (
                    <span className="text-sm bg-white px-3 py-1 rounded-full font-semibold text-gray-600 border border-gray-200">
                      {systemStatus.online_sites}/{systemStatus.total_sites} مصدر متاح
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={checkSystemStatus}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgb(13, 148, 136)',
                  color: 'rgb(255, 255, 255)',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🔄 فحص الحالة
              </button>
            </div>
            
            {/* تفاصيل المصادر */}
            {systemStatus && systemStatus.sites.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                {systemStatus.sites.map((site, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className={`w-3 h-3 rounded-full ${
                      site.status === 'online' ? 'bg-green-500' : 
                      site.status === 'error' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700 truncate flex-1">{site.name}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                      {site.response_time}ms
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* البحث */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">🔍 البحث في القوانين</h2>
            
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
              <input
                type="text"
                placeholder="🔍 البحث في القوانين الفلسطينية..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgb(153, 246, 228)',
                  background: 'rgb(240, 253, 250)',
                  color: 'rgb(19, 78, 74)',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onKeyPress={(e) => e.key === 'Enter' && searchLaws()}
              />
              </div>
              <button
                type="button"
                onClick={searchLaws}
                disabled={loading || systemStatus?.status !== 'healthy'}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: loading || systemStatus?.status !== 'healthy' ? 'rgb(156, 163, 175)' : 'rgb(13, 148, 136)',
                  color: 'rgb(255, 255, 255)',
                  fontSize: '16px',
                  cursor: loading || systemStatus?.status !== 'healthy' ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: loading || systemStatus?.status !== 'healthy' ? 0.6 : 1
                }}
              >
                {loading ? (
                  <>
                    <div style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginLeft: '8px' }}></div>
                    جاري البحث...
                  </>
                ) : (
                  <>🔍 بحث ذكي</>
                )}
              </button>
            </div>

            {/* معلومات البحث */}
            {searchTime > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-blue-700 font-medium">وقت البحث: <span className="font-bold">{searchTime}ms</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-700 font-medium">المصادر: </span>
                    <div className="flex gap-1">
                      {sourcesSearched.map((source, index) => (
                        <span key={index} className="px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-600 border border-gray-200">
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
            </div>
            )}
          </div>

          {/* رسائل الخطأ */}
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">⚠️</span>
                </div>
                <div>
                  <strong className="font-semibold">خطأ:</strong> {error}
                </div>
              </div>
            </div>
          )}

          {/* نتائج البحث */}
          {searchResults.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-700">
                نتائج البحث ({searchResults.length} نتيجة)
              </h3>
              
              <div className="grid gap-6">
                {searchResults.map((result, index) => (
                  <div key={index} className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-xl text-gray-800 leading-tight">{result.title}</h4>
                      <div className="flex gap-3">
                        <span className={`text-sm px-3 py-2 rounded-full font-semibold ${
                          result.type === 'legislation' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' :
                          result.type === 'judgment' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200' :
                          result.type === 'gazette' ? 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-200' :
                          'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-200'
                        }`}>
                          {result.type === 'legislation' ? '📜 تشريع' :
                           result.type === 'judgment' ? '⚖️ حكم قضائي' :
                           result.type === 'gazette' ? '📰 جريدة رسمية' : '🔬 بحث'}
                        </span>
                        <span className="text-sm bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-2 rounded-full font-medium border border-gray-300">
                          {result.source}
                      </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed text-base">
                      {result.content}
                    </p>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600">
                          درجة الصلة: <span className="text-green-600 font-bold">{(result.relevance_score * 100).toFixed(1)}%</span>
                        </span>
                      </div>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'rgb(13, 148, 136)',
                          color: 'rgb(255, 255, 255)',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          textDecoration: 'none',
                          display: 'inline-block'
                        }}
                      >
                        🔗 عرض المصدر الأصلي
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* أمثلة للاختبار */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-bold mb-3 text-gray-700">💡 أمثلة للاختبار</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                'قانون العقوبات رقم 16 لسنة 1960',
                'حقوق العمال في فلسطين',
                'قانون المنافسة الجديد',
                'الأحكام القضائية الحديثة',
                'قوانين حماية الأسرة',
                'الاعتقال الإداري والمعايير الدولية',
                'قرارات المحكمة الدستورية',
                'قانون العمل الفلسطيني'
              ].map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSearchQuery(example)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '2px solid rgb(13, 148, 136)',
                    background: 'transparent',
                    color: 'rgb(13, 148, 136)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    margin: '4px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgb(13, 148, 136)';
                    e.currentTarget.style.color = 'rgb(255, 255, 255)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgb(13, 148, 136)';
                  }}
                >
                  💡 {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
