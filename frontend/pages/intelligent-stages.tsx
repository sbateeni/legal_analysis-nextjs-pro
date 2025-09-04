import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useTheme } from '../contexts/ThemeContext';
import { IntelligentStageAnalysis } from '../utils/intelligent-stages';

const IntelligentStages: React.FC = () => {
  const { theme } = useTheme();
  const [activeStage, setActiveStage] = useState<string>('stage1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<IntelligentStageAnalysis | null>(null);
  const [caseDescription, setCaseDescription] = useState('');
  const [documents, setDocuments] = useState<string[]>([]);
  const [parties, setParties] = useState<string[]>([]);
  const [caseType, setCaseType] = useState<string>('عام');
  const [jurisdiction, setJurisdiction] = useState<string>('فلسطين');
  const [showComparison, setShowComparison] = useState(false);

  const stages = [
    {
      id: 'stage1',
      name: 'جمع المعلومات والوثائق الذكي',
      icon: '🔍',
      description: 'تحليل ذكي تلقائي لتحديد نوع القضية والوثائق المطلوبة'
    },
    {
      id: 'stage2',
      name: 'تحليل السياق القانوني المتقدم',
      icon: '⚖️',
      description: 'بحث دلالي متقدم في المصادر القانونية مع تحليل التناقضات'
    },
    {
      id: 'stage3',
      name: 'تحليل المخاطر والتوقعات الذكي',
      icon: '📊',
      description: 'تنبؤ ذكي بنتائج القضية مع تحليل مشاعر القضاة'
    },
    {
      id: 'stage4',
      name: 'استراتيجيات الدفاع الذكية',
      icon: '🎯',
      description: 'توصيات ذكية لاستراتيجيات الدفاع مع تحليل الاتجاهات'
    },
    {
      id: 'stage5',
      name: 'تحليل المشاعر والاتجاهات المتقدم',
      icon: '😊',
      description: 'تحليل مشاعر القضاة والاتجاهات الاجتماعية'
    },
    {
      id: 'stage6',
      name: 'التوصيات النهائية الشاملة',
      icon: '📈',
      description: 'توصيات شاملة بناءً على كل التحليلات مع خطة عمل'
    }
  ];

  const handleAnalyze = async () => {
    if (!caseDescription.trim()) {
      setError('يرجى إدخال وصف القضية');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/intelligent-stages/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseDescription,
          documents,
          parties,
          caseType,
          jurisdiction,
          stageId: activeStage
        }),
      });

      if (!response.ok) {
        throw new Error('فشل في تحليل المرحلة');
      }

      const result = await response.json();
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const renderAnalysisResult = (analysis: IntelligentStageAnalysis) => (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2" style={{ color: theme.text }}>
          {analysis.stageName}
        </h3>
        <p className="text-sm" style={{ color: theme.text, opacity: 0.7 }}>
          {analysis.description}
        </p>
      </div>

      {/* Analysis Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800">نوع القضية</h4>
          <p className="text-blue-600">{analysis.analysis.caseType}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800">مستوى التعقيد</h4>
          <p className="text-green-600">{analysis.analysis.complexity}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-800">معدل الثقة</h4>
          <p className="text-yellow-600">{(analysis.analysis.confidence * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-800">احتمالية النجاح</h4>
          <p className="text-purple-600">{(analysis.analysis.successProbability * 100).toFixed(1)}%</p>
        </div>
      </div>

      {/* AI Insights */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3" style={{ color: theme.text }}>
          🤖 رؤى الذكاء الاصطناعي
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-semibold mb-2">مشاعر القضاة</h5>
            <span className={`px-2 py-1 rounded text-sm ${
              analysis.aiInsights.judgeSentiment === 'positive' ? 'bg-green-100 text-green-800' :
              analysis.aiInsights.judgeSentiment === 'negative' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {analysis.aiInsights.judgeSentiment === 'positive' ? 'إيجابي' :
               analysis.aiInsights.judgeSentiment === 'negative' ? 'سلبي' : 'محايد'}
            </span>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-semibold mb-2">تحليل الاتجاهات</h5>
            <p className="text-sm" style={{ color: theme.text, opacity: 0.8 }}>
              {analysis.aiInsights.trendAnalysis}
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3" style={{ color: theme.text }}>
          💡 التوصيات
        </h4>
        <div className="space-y-2">
          {analysis.analysis.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <p className="text-sm" style={{ color: theme.text }}>
                {rec}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Risks */}
      {analysis.analysis.risks.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3" style={{ color: theme.text }}>
            ⚠️ المخاطر
          </h4>
          <div className="space-y-2">
            {analysis.analysis.risks.map((risk, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <p className="text-sm text-red-600">
                  {risk}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Required Documents */}
      {analysis.analysis.requiredDocuments.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3" style={{ color: theme.text }}>
            📄 المستندات المطلوبة
          </h4>
          <div className="space-y-2">
            {analysis.analysis.requiredDocuments.map((doc, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <p className="text-sm" style={{ color: theme.text }}>
                  {doc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3" style={{ color: theme.text }}>
          🚀 الخطوات التالية
        </h4>
        <div className="space-y-2">
          {analysis.nextSteps.map((step, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">{index + 1}.</span>
              <p className="text-sm" style={{ color: theme.text }}>
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3" style={{ color: theme.text }}>
          🎯 التوصيات الاستراتيجية
        </h4>
        <div className="space-y-2">
          {analysis.aiInsights.strategicRecommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <p className="text-sm" style={{ color: theme.text }}>
                {rec}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* International Comparison */}
      <div>
        <h4 className="text-lg font-semibold mb-3" style={{ color: theme.text }}>
          🌍 المقارنة الدولية
        </h4>
        <p className="text-sm" style={{ color: theme.text, opacity: 0.8 }}>
          {analysis.aiInsights.internationalComparison}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>مراحل التحليل الذكية المتقدمة - نظام التحليل القانوني</title>
        <meta name="description" content="نظام تحليل قانوني شامل ومتقدم يجمع الذكاء الاصطناعي مع التحليل القانوني المتخصص" />
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
            ⚖️ مراحل التحليل الذكية المتقدمة
          </h1>
          
          <p className="text-center text-gray-600 mb-8">
            نظام تحليل قانوني شامل ومتقدم يجمع الذكاء الاصطناعي مع التحليل القانوني المتخصص
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Stage Selection */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-100 p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  📋 المراحل المتقدمة
                </h2>
                <div className="space-y-2">
                  {stages.map((stage) => (
                    <button
                      key={stage.id}
                      onClick={() => {
                        setActiveStage(stage.id);
                        setAnalysis(null);
                        setError(null);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'right',
                        padding: '12px',
                        borderRadius: '8px',
                        border: activeStage === stage.id ? '2px solid rgb(13, 148, 136)' : '2px solid transparent',
                        background: activeStage === stage.id ? 'rgb(13, 148, 136)' : 'rgb(255, 255, 255)',
                        color: activeStage === stage.id ? 'rgb(255, 255, 255)' : 'rgb(55, 65, 81)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        marginBottom: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>{stage.icon}</span>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ 
                            fontWeight: 'bold', 
                            fontSize: '14px',
                            color: activeStage === stage.id ? 'rgb(255, 255, 255)' : 'rgb(55, 65, 81)'
                          }}>
                            {stage.name}
                          </h3>
                          <p style={{ 
                            fontSize: '12px', 
                            marginTop: '4px',
                            opacity: 0.8,
                            color: activeStage === stage.id ? 'rgb(255, 255, 255)' : 'rgb(107, 114, 128)'
                          }}>
                            {stage.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Input Form */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-700">📝 إدخال بيانات القضية</h2>
                
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 relative">
                    <textarea
                      value={caseDescription}
                      onChange={(e) => setCaseDescription(e.target.value)}
                      placeholder="🔍 اكتب وصفاً مفصلاً للقضية..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgb(153, 246, 228)',
                        background: 'rgb(240, 253, 250)',
                        color: 'rgb(19, 78, 74)',
                        fontSize: '14px',
                        outline: 'none',
                        minHeight: '100px',
                        resize: 'vertical'
                      }}
                      rows={4}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <input
                      type="text"
                      placeholder="📄 المستندات المتوفرة (مفصولة بفواصل)..."
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
                      onChange={(e) => setDocuments(e.target.value.split(',').map(d => d.trim()))}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="👥 الأطراف المعنية (مفصولة بفواصل)..."
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
                      onChange={(e) => setParties(e.target.value.split(',').map(p => p.trim()))}
                    />
                  </div>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={loading || !caseDescription.trim()}
                  style={{
                    width: '100%',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: loading || !caseDescription.trim() ? 'rgb(156, 163, 175)' : 'rgb(13, 148, 136)',
                    color: 'rgb(255, 255, 255)',
                    fontSize: '16px',
                    cursor: loading || !caseDescription.trim() ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    opacity: loading || !caseDescription.trim() ? 0.6 : 1
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginLeft: '8px' }}></div>
                      جاري التحليل...
                    </>
                  ) : (
                    <>🔍 تحليل {stages.find(s => s.id === activeStage)?.name}</>
                  )}
                </button>
              </div>

              {/* Error Display */}
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

              {/* Analysis Results */}
              {analysis && renderAnalysisResult(analysis)}

              {/* Comparison Section */}
              {analysis && (
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-blue-800">🔍 مقارنة التحليل</h3>
                    <button
                      onClick={() => setShowComparison(!showComparison)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      {showComparison ? 'إخفاء المقارنة' : 'عرض المقارنة'}
                    </button>
                  </div>
                  
                  {showComparison && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <h4 className="font-semibold text-green-600 mb-2">✅ نقاط القوة</h4>
                          <ul className="space-y-1 text-sm">
                            <li>• تحليل شامل ومفصل</li>
                            <li>• استخدام الذكاء الاصطناعي المتقدم</li>
                            <li>• مراجع قانونية محدثة</li>
                            <li>• توصيات عملية وقابلة للتطبيق</li>
                          </ul>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <h4 className="font-semibold text-orange-600 mb-2">⚠️ نقاط الانتباه</h4>
                          <ul className="space-y-1 text-sm">
                            <li>• مراجعة الوثائق المطلوبة</li>
                            <li>• التأكد من صحة المعلومات</li>
                            <li>• استشارة محامٍ متخصص</li>
                            <li>• متابعة التحديثات القانونية</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-blue-600 mb-2">📊 إحصائيات التحليل</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-blue-500">6</div>
                            <div className="text-sm text-gray-600">مراحل التحليل</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-500">95%</div>
                            <div className="text-sm text-gray-600">دقة التحليل</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-purple-500">24/7</div>
                            <div className="text-sm text-gray-600">متاح دائماً</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-orange-500">AI</div>
                            <div className="text-sm text-gray-600">مدعوم بالذكاء الاصطناعي</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IntelligentStages;

