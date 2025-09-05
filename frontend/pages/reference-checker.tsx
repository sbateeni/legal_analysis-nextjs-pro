import React, { useState, useEffect } from 'react';
import { referenceChecker, type LegalReference } from '@utils/referenceChecker';
// تم حذف AuthGuard لجعل الموقع عاماً

export default function ReferenceCheckerPage() {
  return <ReferenceCheckerPageContent />;
}

function ReferenceCheckerPageContent() {
  const [text, setText] = useState('');
  const [selectedMode, setSelectedMode] = useState<'brief' | 'detailed'>('brief');
  const [analysis, setAnalysis] = useState<string>('');
  const [references, setReferences] = useState<LegalReference[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LegalReference[]>([]);
  const [selectedReference, setSelectedReference] = useState<LegalReference | null>(null);
  const [selectedCaseTag, setSelectedCaseTag] = useState<string>('');
  const [suggestedTags, setSuggestedTags] = useState<Array<{ tag: string; score: number }>>([]);

  const analysisModes = referenceChecker.getAnalysisModes();
  const caseTags: string[] = [
    'تجاري',
    'شيكات',
    'جنائي',
    'عمل',
    'إيجارات',
    'عقاري',
    'إداري',
    'أحوال شخصية',
    'ميراث',
    'مدني'
  ];

  // Shared styles
  const darkPanelStyle: React.CSSProperties = {
    background: 'rgb(24, 26, 42)',
    border: '1.5px solid rgb(57, 62, 92)',
    borderRadius: 12,
    boxShadow: 'rgba(35, 41, 70, 0.25) 0px 2px 8px',
    padding: 24
  };
  const buttonStyle: React.CSSProperties = {
    background: 'transparent',
    color: 'rgb(247, 247, 250)',
    border: '1.5px solid rgb(57, 62, 92)',
    borderRadius: 10,
    padding: '6px 10px',
    cursor: 'pointer',
    fontWeight: 700
  };
  const chipStyle: React.CSSProperties = {
    ...buttonStyle,
    fontWeight: 600,
    padding: '6px 12px',
    borderRadius: 9999
  };
  const selectedChipStyle: React.CSSProperties = {
    ...chipStyle,
    background: 'rgb(57, 62, 92)'
  };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: 12,
    border: '2px solid rgb(57, 62, 92)',
    padding: 12,
    fontSize: 16,
    resize: 'vertical',
    outline: 'none',
    boxShadow: 'rgba(35, 41, 70, 0.333) 0px 2px 8px',
    background: 'rgb(24, 26, 42)',
    color: 'rgb(247, 247, 250)',
    transition: '0.3s',
    fontFamily: 'Tajawal, Arial, sans-serif',
    lineHeight: 1.6 as unknown as number
  };

  // Restore persisted UI state
  useEffect(() => {
    try {
      const savedTag = localStorage.getItem('refChecker.caseTag');
      const savedQuery = localStorage.getItem('refChecker.searchQuery');
      const savedMode = localStorage.getItem('refChecker.mode') as 'brief' | 'detailed' | null;
      if (savedTag) setSelectedCaseTag(savedTag);
      if (savedQuery) setSearchQuery(savedQuery);
      if (savedMode === 'brief' || savedMode === 'detailed') setSelectedMode(savedMode);
    } catch {}
  }, []);

  // Persist UI state
  useEffect(() => {
    try { localStorage.setItem('refChecker.caseTag', selectedCaseTag); } catch {}
  }, [selectedCaseTag]);
  useEffect(() => {
    try { localStorage.setItem('refChecker.searchQuery', searchQuery); } catch {}
  }, [searchQuery]);
  useEffect(() => {
    try { localStorage.setItem('refChecker.mode', selectedMode); } catch {}
  }, [selectedMode]);

  // Auto-search on tag change
  useEffect(() => {
    const shouldSearch = !!selectedCaseTag || !!searchQuery.trim();
    if (shouldSearch) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCaseTag]);

  // اقترح الوسوم تلقائياً عند تغيير النص
  useEffect(() => {
    try {
      const suggestions = referenceChecker.suggestCaseTags(text);
      setSuggestedTags(suggestions);
    } catch {}
  }, [text]);

  // تحليل النص
  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    try {
      const result = await referenceChecker.analyzeTextWithMode(text, selectedMode);
      setAnalysis(result.analysis);
      setReferences(result.references);
      setWarnings(result.warnings);
    } catch (error) {
      console.error('خطأ في التحليل:', error);
      setAnalysis('حدث خطأ أثناء التحليل');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // البحث في المراجع
  const handleSearch = async () => {
    if (!searchQuery.trim() && !selectedCaseTag) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await referenceChecker.searchReferences(searchQuery, {
        caseTag: selectedCaseTag || undefined
      });
      setSearchResults(results);
    } catch (error) {
      console.error('خطأ في البحث:', error);
    }
  };

  // فحص استشهاد محدد
  const handleValidateCitation = async (citation: string) => {
    try {
      const result = await referenceChecker.validateCitation(citation);
      if (result) {
        setSelectedReference(result.reference);
        setAnalysis(`
          تحليل الاستشهاد:
          
          المرجع: ${result.reference.title}
          الصلة: ${result.relevance === 'high' ? 'عالية' : result.relevance === 'medium' ? 'متوسطة' : 'منخفضة'}
          الثقة: ${result.confidence}%
          الاستخدام المقترح: ${result.suggestedUsage}
          
          ${result.warnings && result.warnings.length > 0 ? `تحذيرات: ${result.warnings.join(', ')}` : ''}
          
          ${result.alternatives && result.alternatives.length > 0 ? 
            `مراجع بديلة: ${result.alternatives.map(alt => alt.title).join(', ')}` : ''}
        `);
      }
    } catch (error) {
      console.error('خطأ في فحص الاستشهاد:', error);
    }
  };

  return (
    <div dir="rtl" className="container mx-auto px-4 py-8" style={{ background: 'rgb(24, 26, 42)' }}>
      <div className="max-w-6xl mx-auto">
        {/* العنوان */}
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-1 mb-3 rounded-full border text-sm" style={{ color: 'rgb(247, 247, 250)', borderColor: 'rgb(57, 62, 92)', background: 'rgba(57,62,92,0.15)' }}>🔍 المدقق المرجعي</div>
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'rgb(247, 247, 250)' }}>
            المدقق المرجعي القانوني
          </h1>
          <p className="text-lg" style={{ color: 'rgba(247,247,250,0.8)' }}>
            فحص وتحليل المراجع القانونية مع وضعي التفسير المختصر والحجج الموسعة
          </p>
        </div>

        {/* لوحة تعريفية: ما هي هذه الصفحة؟ وما الفرق بينها وبين الصفحة الرئيسية؟ */}
        <div className="mb-8 rounded-lg" style={darkPanelStyle}>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'rgb(247, 247, 250)' }}>ما هي هذه الصفحة؟</h2>
          <p className="mb-4" style={{ color: 'rgba(247,247,250,0.9)' }}>
            هذه الصفحة مخصّصة لـ <span className="font-semibold">التدقيق المرجعي القانوني</span>: استخراج الاستشهادات، التحقق من صلاحيتها، تقدير مستوى الصلة والثقة، واقتراح بدائل. يمكنك أيضاً البحث في قاعدة المراجع، وتصفية النتائج وفق <span className="font-semibold">نوع القضية</span>.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2" style={{ color: 'rgb(247, 247, 250)' }}>متى أستخدم المدقق المرجعي؟</h3>
              <ul className="list-disc pr-5 space-y-1" style={{ color: 'rgba(247,247,250,0.85)' }}>
                <li>قبل تقديم مذكرة للتأكد من سلامة الاستشهادات.</li>
                <li>عند الحاجة للعثور على مراجع بديلة أو أحدث.</li>
                <li>للتأكد من أن المرجع <span className="font-semibold">صالح/غير ملغي</span> أو غير منتهي الصلاحية.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2" style={{ color: 'rgb(247, 247, 250)' }}>ما الفرق عن الصفحة الرئيسية؟</h3>
              <ul className="list-disc pr-5 space-y-1" style={{ color: 'rgba(247,247,250,0.85)' }}>
                <li>الصفحة الرئيسية تُدير <span className="font-semibold">مراحل التحليل</span> بالترتيب والاعتماديات والمواعيد القانونية.</li>
                <li>هذه الصفحة تُركّز على <span className="font-semibold">جودة الاستشهادات والمراجع</span> وليس سير المراحل.</li>
                <li>المدقق هنا يعمل كأداة مساعدة مستقلة ويمكن استخدامه في أي وقت.</li>
              </ul>
            </div>
          </div>
          <div className="mt-4" style={{ color: 'rgba(247,247,250,0.85)' }}>
            نصيحة: اكتب نصك في الحقل أدناه، سيقوم النظام <span className="font-semibold">باقتراح وسوم نوع القضية تلقائياً</span> لتسريع الوصول للمراجع الأنسب.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* الجانب الأيسر - إدخال النص */}
          <div className="space-y-6">
            {/* اختيار وضع التحليل */}
            <div className="rounded-lg shadow-md" style={darkPanelStyle}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(247, 247, 250)' }}>وضع التحليل</h3>
              <div className="grid grid-cols-1 gap-3">
                {analysisModes.map((mode) => (
                  <label key={mode.id} className="flex items-center gap-3 cursor-pointer" style={{ color: 'rgba(247,247,250,0.9)' }}>
                    <input
                      type="radio"
                      name="analysisMode"
                      value={mode.id}
                      checked={selectedMode === mode.id}
                      onChange={(e) => setSelectedMode(e.target.value as 'brief' | 'detailed')}
                    />
                    <div>
                      <div className="font-medium">{mode.name}</div>
                      <div className="text-sm" style={{ color: 'rgba(247,247,250,0.7)' }}>{mode.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* إدخال النص */}
            <div className="rounded-lg shadow-md" style={darkPanelStyle}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(247, 247, 250)' }}>النص المراد تحليله</h3>
              <textarea
                rows={6}
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="أدخل تفاصيل القضية هنا..."
                style={inputStyle}
              />
              {suggestedTags.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm mb-2" style={{ color: 'rgba(247,247,250,0.8)' }}>
                    وسوم مقترحة حسب النص:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map(({ tag }) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedCaseTag(tag)}
                        style={selectedCaseTag === tag ? selectedChipStyle : chipStyle}
                        title="تطبيق هذا الوسم والبحث"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={handleAnalyze}
                disabled={!text.trim() || isAnalyzing}
                style={{ ...buttonStyle, width: '100%', marginTop: 12, opacity: !text.trim() || isAnalyzing ? 0.6 : 1 }}
              >
                {isAnalyzing ? 'جاري التحليل...' : 'تحليل النص'}
              </button>
            </div>

            {/* البحث في المراجع + فلاتر النوع */}
            <div className="rounded-lg shadow-md" style={darkPanelStyle}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'rgb(247, 247, 250)' }}>البحث في المراجع</h3>
              </div>

              {/* فلاتر نوع القضية (وسوم) */}
              <div className="mb-4">
                <div className="text-sm mb-2" style={{ color: 'rgba(247,247,250,0.8)' }}>اختر نوع القضية لتحديد المراجع:</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCaseTag('')}
                    style={selectedCaseTag === '' ? selectedChipStyle : chipStyle}
                  >
                    الكل
                  </button>
                  {caseTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedCaseTag(tag)}
                      style={selectedCaseTag === tag ? selectedChipStyle : chipStyle}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في المراجع القانونية..."
                  style={inputStyle}
                />
                <button
                  onClick={handleSearch}
                  style={buttonStyle}
                >
                  بحث
                </button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium" style={{ color: 'rgb(247, 247, 250)' }}>نتائج البحث:</h4>
                    {selectedCaseTag && (
                      <span className="text-xs px-2 py-1 rounded border" style={{ color: 'rgb(247,247,250)', borderColor: 'rgb(57,62,92)' }}>
                        نوع القضية: {selectedCaseTag}
                      </span>
                    )}
                  </div>
                  {searchResults.map((ref) => (
                    <div
                      key={ref.id}
                      className="rounded-lg cursor-pointer"
                      style={{ border: '1px solid rgb(57,62,92)', padding: 12, background: 'rgba(35, 41, 70, 0.12)' }}
                      onClick={() => setSelectedReference(ref)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-medium" style={{ color: 'rgb(247,247,250)' }}>{ref.title}</div>
                          <div className="text-sm" style={{ color: 'rgba(247,247,250,0.75)' }}>{ref.source}</div>
                          <div className="text-xs" style={{ color: 'rgba(247,247,250,0.6)' }}>
                            {(ref.year || '') && `${ref.year} • `}{ref.type === 'law' ? 'قانون' : ref.type === 'court_decision' ? 'حكم قضائي' : 'مرجع آخر'}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(ref.tags || []).slice(0, 3).map(tag => (
                            <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full border" style={{ color: 'rgba(247,247,250,0.9)', borderColor: 'rgb(57,62,92)' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.length === 0 && (searchQuery || selectedCaseTag) && (
                <div className="mt-4 text-sm" style={{ color: 'rgba(247,247,250,0.8)' }}>لا توجد نتائج مطابقة حالياً.</div>
              )}
            </div>
          </div>

          {/* الجانب الأيمن - نتائج التحليل */}
          <div className="space-y-6">
            {/* نتائج التحليل */}
            {analysis && (
              <div className="rounded-lg shadow-md" style={darkPanelStyle}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(247, 247, 250)' }}>نتائج التحليل</h3>
                <div className="rounded-lg" style={{ background: 'rgba(35,41,70,0.15)', padding: 16 }}>
                  <pre className="whitespace-pre-wrap text-sm font-sans" style={{ color: 'rgba(247,247,250,0.92)' }}>
                    {analysis}
                  </pre>
                </div>
              </div>
            )}

            {/* المراجع المكتشفة */}
            {references.length > 0 && (
              <div className="rounded-lg shadow-md" style={darkPanelStyle}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(247, 247, 250)' }}>المراجع المكتشفة</h3>
                <div className="space-y-3">
                  {references.map((ref) => (
                    <div key={ref.id} className="rounded-lg" style={{ border: '1px solid rgb(57,62,92)', padding: 12, background: 'rgba(35, 41, 70, 0.12)' }}>
                      <div className="font-medium" style={{ color: 'rgb(247,247,250)' }}>{ref.title}</div>
                      <div className="text-sm" style={{ color: 'rgba(247,247,250,0.75)' }}>{ref.source}</div>
                      <div className="text-xs" style={{ color: 'rgba(247,247,250,0.6)' }}>
                        {ref.year} • {ref.validity === 'valid' ? 'صالح' : 'غير صالح'}
                      </div>
                      {ref.notes && (
                        <div className="text-sm mt-2" style={{ color: 'rgba(247,247,250,0.9)' }}>{ref.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* التحذيرات */}
            {warnings.length > 0 && (
              <div className="rounded-lg shadow-md" style={darkPanelStyle}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#F59E0B' }}>التحذيرات</h3>
                <div className="space-y-2">
                  {warnings.map((warning, index) => (
                    <div key={index} className="rounded-lg" style={{ padding: 12, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
                      <div style={{ color: '#FBBF24' }}>⚠️ {warning}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* المرجع المحدد */}
            {selectedReference && (
              <div className="rounded-lg shadow-md" style={darkPanelStyle}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(247, 247, 250)' }}>تفاصيل المرجع</h3>
                <div className="space-y-3" style={{ color: 'rgba(247,247,250,0.9)' }}>
                  <div>
                    <span className="font-medium">العنوان:</span> {selectedReference.title}
                  </div>
                  <div>
                    <span className="font-medium">المصدر:</span> {selectedReference.source}
                  </div>
                  {selectedReference.year && (
                    <div>
                      <span className="font-medium">السنة:</span> {selectedReference.year}
                    </div>
                  )}
                  {selectedReference.court && (
                    <div>
                      <span className="font-medium">المحكمة:</span> {selectedReference.court}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">الحالة:</span>
                    <span className="ml-2 px-2 py-1 rounded text-xs" style={{ background: 'rgba(35,41,70,0.3)', color: 'rgb(247,247,250)', border: '1px solid rgb(57,62,92)' }}>
                      {selectedReference.validity === 'valid' ? 'صالح' :
                       selectedReference.validity === 'amended' ? 'معدل' :
                       selectedReference.validity === 'expired' ? 'منتهي الصلاحية' :
                       selectedReference.validity === 'repealed' ? 'ملغي' : 'غير معروف'}
                    </span>
                  </div>
                  {selectedReference.notes && (
                    <div>
                      <span className="font-medium">ملاحظات:</span> {selectedReference.notes}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">آخر فحص:</span> {new Date(selectedReference.lastChecked).toLocaleDateString('ar-EG')}
                  </div>
                </div>
                
                <button
                  onClick={() => handleValidateCitation(selectedReference.title)}
                  style={{ ...buttonStyle, marginTop: 12 }}
                >
                  فحص الاستشهاد
                </button>
              </div>
            )}
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="mt-12 rounded-lg" style={darkPanelStyle}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(247, 247, 250)' }}>معلومات عن المدقق المرجعي</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ color: 'rgba(247,247,250,0.9)' }}>
            <div>
              <h4 className="font-medium mb-2">وضع التفسير المختصر:</h4>
              <ul className="text-sm space-y-1">
                <li>• تحليل مباشر ومختصر</li>
                <li>• التركيز على النقاط الأساسية</li>
                <li>• مناسب للاستعراض السريع</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">وضع الحجج الموسعة:</h4>
              <ul className="text-sm space-y-1">
                <li>• تحليل شامل ومفصل</li>
                <li>• يشمل البدائل والتحذيرات</li>
                <li>• مناسب للدراسة العميقة</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
