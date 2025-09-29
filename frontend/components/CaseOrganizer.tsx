import React, { useState } from 'react';

interface CaseOrganizerProps {
  originalText: string;
  onOrganized: (organizedText: string) => void;
  onCancel: () => void;
  isVisible: boolean;
  apiKey?: string;
}

export const CaseOrganizer: React.FC<CaseOrganizerProps> = ({
  originalText,
  onOrganized,
  onCancel,
  isVisible,
  apiKey
}) => {
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [organizedText, setOrganizedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const organizeCase = async () => {
    if (!apiKey) {
      setError('يرجى إدخال مفتاح Gemini API أولاً');
      return;
    }

    setIsOrganizing(true);
    setError(null);

    try {
      const response = await fetch('/api/organize-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: originalText,
          apiKey: apiKey
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOrganizedText(data.organizedText);
      } else {
        setError(data.message || 'حدث خطأ أثناء تنظيم القضية');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخدمة');
    } finally {
      setIsOrganizing(false);
    }
  };

  const handleApply = () => {
    onOrganized(organizedText);
  };

  const handleCancel = () => {
    setOrganizedText('');
    setError(null);
    onCancel();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            🔧 منظم القضايا القانونية
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            ترتيب وتنظيم تفاصيل القضية بصياغة قانونية محترفة
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Original Text */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              📄 النص الأصلي
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border max-h-40 overflow-y-auto">
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {originalText}
              </p>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {originalText.length} حرف
            </div>
          </div>

          {/* Organized Text */}
          {organizedText && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                ✨ النص المنظم
              </h3>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 max-h-60 overflow-y-auto">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {organizedText}
                </p>
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                {organizedText.length} حرف - تم التنظيم بنجاح
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Features */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              🎯 ما سيقوم به المنظم:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-blue-500">📋</span>
                <div>
                  <div className="font-medium text-blue-800 dark:text-blue-200">ترتيب المعلومات</div>
                  <div className="text-sm text-blue-600 dark:text-blue-300">تنظيم الحقائق والأحداث ترتيباً زمنياً ومنطقياً</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-green-500">⚖️</span>
                <div>
                  <div className="font-medium text-green-800 dark:text-green-200">صياغة قانونية</div>
                  <div className="text-sm text-green-600 dark:text-green-300">استخدام المصطلحات والمفاهيم القانونية الصحيحة</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span className="text-purple-500">🔍</span>
                <div>
                  <div className="font-medium text-purple-800 dark:text-purple-200">تحديد الأطراف</div>
                  <div className="text-sm text-purple-600 dark:text-purple-300">وضوح هوية الأطراف وصفاتهم القانونية</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <span className="text-orange-500">📅</span>
                <div>
                  <div className="font-medium text-orange-800 dark:text-orange-200">ترتيب زمني</div>
                  <div className="text-sm text-orange-600 dark:text-orange-300">تنظيم الأحداث حسب التسلسل الزمني</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isOrganizing ? 'جاري التنظيم...' : 'سيتم الحفاظ على جميع المعلومات الأصلية'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              إلغاء
            </button>
            {!organizedText ? (
              <button
                onClick={organizeCase}
                disabled={isOrganizing}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {isOrganizing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري التنظيم...
                  </>
                ) : (
                  <>
                    🔧 تنظيم القضية
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleApply}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                ✅ تطبيق التنظيم
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseOrganizer;
