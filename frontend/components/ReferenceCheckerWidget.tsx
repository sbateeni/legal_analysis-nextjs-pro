import React, { useState } from 'react';
import Link from 'next/link';
import { referenceChecker, type LegalReference } from '../utils/referenceChecker';

interface ReferenceCheckerWidgetProps {
  onReferenceFound?: (reference: LegalReference) => void;
  compact?: boolean;
}

export default function ReferenceCheckerWidget({ onReferenceFound, compact = false }: ReferenceCheckerWidgetProps) {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');
  const [references, setReferences] = useState<LegalReference[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  // تحليل سريع للنص
  const handleQuickAnalyze = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    try {
      const result = await referenceChecker.analyzeTextWithMode(text, 'brief');
      setAnalysis(result.analysis);
      setReferences(result.references);
      setWarnings(result.warnings);
      
      // إشعار بالمراجع المكتشفة
      if (result.references.length > 0 && onReferenceFound) {
        onReferenceFound(result.references[0]);
      }
    } catch (error) {
      console.error('خطأ في التحليل السريع:', error);
      setAnalysis('حدث خطأ أثناء التحليل');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (compact) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">🔍 فحص سريع للمراجع</h3>
        
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="أدخل نص قانوني للفحص السريع..."
            className="w-full h-24 p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          
          <button
            onClick={handleQuickAnalyze}
            disabled={!text.trim() || isAnalyzing}
            className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isAnalyzing ? 'جاري الفحص...' : 'فحص سريع'}
          </button>
        </div>

        {/* النتائج المختصرة */}
        {analysis && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-800 font-medium mb-2">نتائج الفحص:</div>
            <div className="text-xs text-blue-700 leading-relaxed">
              {analysis}
            </div>
          </div>
        )}

        {/* التحذيرات */}
        {warnings.length > 0 && (
          <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-sm text-orange-800 font-medium mb-2">⚠️ تحذيرات:</div>
            <div className="text-xs text-orange-700 space-y-1">
              {warnings.map((warning, index) => (
                <div key={index}>• {warning}</div>
              ))}
            </div>
          </div>
        )}

        {/* رابط للمدقق الكامل */}
        <div className="mt-3 text-center">
          <Link
            href="/reference-checker"
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            فتح المدقق المرجعي الكامل →
          </Link>
        </div>
      </div>
    );
  }

  // النسخة الكاملة
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">🔍 المدقق المرجعي القانوني</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            النص المراد فحصه:
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="أدخل النص القانوني هنا للفحص..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={handleQuickAnalyze}
          disabled={!text.trim() || isAnalyzing}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isAnalyzing ? 'جاري الفحص...' : 'فحص المراجع'}
        </button>
      </div>

      {/* النتائج */}
      {analysis && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-800 mb-2">نتائج الفحص:</h4>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {analysis}
            </div>
          </div>

          {/* المراجع المكتشفة */}
          {references.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">المراجع المكتشفة:</h4>
              <div className="space-y-2">
                {references.map((ref) => (
                  <div key={ref.id} className="p-2 bg-white rounded border border-green-200">
                    <div className="font-medium text-sm">{ref.title}</div>
                    <div className="text-xs text-gray-600">{ref.source}</div>
                    <div className="text-xs text-gray-500">
                      {ref.year} • {ref.validity === 'valid' ? 'صالح' : 'غير صالح'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* التحذيرات */}
          {warnings.length > 0 && (
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-medium text-orange-800 mb-2">⚠️ تحذيرات:</h4>
              <div className="space-y-1">
                {warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-orange-700">• {warning}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

                    {/* رابط للمدقق الكامل */}
              <div className="mt-6 text-center">
                <Link
                  href="/reference-checker"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  فتح المدقق المرجعي الكامل مع خيارات متقدمة
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
    </div>
  );
}
