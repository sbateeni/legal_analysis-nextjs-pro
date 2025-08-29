import React, { useState } from 'react';
import Head from 'next/head';
import { testPrivacySystem, cleanupTestData } from '../utils/test-privacy';

export default function TestPrivacyPage() {
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    user1Cases?: number;
    user2Cases?: number;
    privacyVerified?: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const result = await testPrivacySystem();
      setTestResult(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير معروف';
      setTestResult({
        success: false,
        message: errorMessage,
        privacyVerified: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cleanup = async () => {
    setIsCleaning(true);
    
    try {
      await cleanupTestData();
      setTestResult(null);
      alert('تم تنظيف البيانات التجريبية بنجاح');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير معروف';
      alert('فشل في تنظيف البيانات التجريبية: ' + errorMessage);
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <>
      <Head>
        <title>اختبار نظام الخصوصية - منصة التحليل القانوني</title>
        <meta name="description" content="اختبار نظام الخصوصية والأمان" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-8 border border-gray-700">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">🧪 اختبار نظام الخصوصية</h1>
              <p className="text-gray-300 text-lg">
                اختبار للتأكد من أن كل مستخدم يرى فقط بياناته ولا يمكنه الوصول لبيانات الآخرين
              </p>
            </div>

            <div className="space-y-6">
              {/* أزرار الاختبار */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={runTest}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium rounded-lg shadow-lg hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      جاري الاختبار...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🚀</span>
                      تشغيل اختبار الخصوصية
                    </>
                  )}
                </button>

                <button
                  onClick={cleanup}
                  disabled={isCleaning}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium rounded-lg shadow-lg hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCleaning ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      جاري التنظيف...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🧹</span>
                      تنظيف البيانات التجريبية
                    </>
                  )}
                </button>
              </div>

              {/* نتائج الاختبار */}
              {testResult && (
                <div className={`rounded-lg p-6 border ${
                  testResult.success 
                    ? 'bg-green-900/50 border-green-500' 
                    : 'bg-red-900/50 border-red-500'
                }`}>
                  <div className="text-center">
                    <h3 className={`text-xl font-bold mb-4 ${
                      testResult.success ? 'text-green-200' : 'text-red-200'
                    }`}>
                      {testResult.success ? '✅ نجح الاختبار!' : '❌ فشل الاختبار'}
                    </h3>
                    
                    <p className={`text-lg mb-4 ${
                      testResult.success ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {testResult.message}
                    </p>

                    {testResult.success && (
                      <div className="bg-green-800/30 rounded-lg p-4">
                        <h4 className="text-green-200 font-bold mb-2">تفاصيل النتائج:</h4>
                        <ul className="text-green-300 space-y-1 text-right">
                          <li>• عدد قضايا المستخدم الأول: {testResult.user1Cases}</li>
                          <li>• عدد قضايا المستخدم الثاني: {testResult.user2Cases}</li>
                          <li>• الخصوصية محققة: {testResult.privacyVerified ? 'نعم' : 'لا'}</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* معلومات عن الاختبار */}
              <div className="bg-gradient-to-br from-blue-800/30 to-purple-800/30 rounded-lg p-6 border border-blue-500/30">
                <h3 className="text-xl font-bold text-white mb-4">📋 ما يتم اختباره:</h3>
                <ul className="text-gray-300 space-y-2 text-right">
                  <li>• إنشاء مستخدمين تجريبيين منفصلين</li>
                  <li>• إنشاء قضايا مختلفة لكل مستخدم</li>
                  <li>• التأكد من أن كل مستخدم يرى فقط قضاياه</li>
                  <li>• اختبار عدم إمكانية الوصول لبيانات الآخرين</li>
                  <li>• اختبار البحث والتصفية حسب المستخدم</li>
                  <li>• اختبار التفضيلات الخاصة بكل مستخدم</li>
                </ul>
              </div>

              {/* ملاحظات مهمة */}
              <div className="bg-gradient-to-br from-yellow-800/30 to-orange-800/30 rounded-lg p-6 border border-yellow-500/30">
                <h3 className="text-xl font-bold text-white mb-4">⚠️ ملاحظات مهمة:</h3>
                <ul className="text-gray-300 space-y-2 text-right">
                  <li>• هذا الاختبار ينشئ بيانات تجريبية مؤقتة</li>
                  <li>• استخدم زر &quot;تنظيف البيانات التجريبية&quot; لحذف البيانات التجريبية</li>
                  <li>• لا تقم بتشغيل هذا الاختبار في بيئة الإنتاج</li>
                  <li>• الاختبار يتحقق من جميع جوانب الخصوصية والأمان</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
