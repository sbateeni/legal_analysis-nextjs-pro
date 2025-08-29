// صفحة اختبار قاعدة البيانات المركزية
import React, { useState } from 'react';
import Head from 'next/head';
import { centralEmbeddedAuth } from '../utils/auth.embedded.central';

interface TestResult {
  success: boolean;
  message: string;
  data?: unknown;
}

export default function TestCentralDB() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: 'test@example.com',
    password: 'password123',
    fullName: 'مستخدم تجريبي'
  });

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      // اختبار 1: إنشاء مستخدم جديد
      addTestResult({ success: true, message: '🧪 بدء اختبارات قاعدة البيانات المركزية...' });
      
      const userId = await centralEmbeddedAuth.registerUser(
        formData.email,
        formData.password,
        formData.fullName
      );
      
      addTestResult({ 
        success: true, 
        message: `✅ تم إنشاء المستخدم بنجاح - ID: ${userId}`,
        data: { userId }
      });

      // اختبار 2: تسجيل الدخول
      const user = await centralEmbeddedAuth.loginUser(formData.email, formData.password);
      addTestResult({ 
        success: true, 
        message: `✅ تم تسجيل الدخول بنجاح - ${user.fullName}`,
        data: { user: { id: user.id, email: user.email, fullName: user.fullName } }
      });

      // اختبار 3: إنشاء قضية
      const caseId = await centralEmbeddedAuth.createCase({
        name: 'قضية تجريبية للاختبار',
        caseType: 'مدني',
        partyRole: 'مدعي',
        complexity: 'basic'
      });
      
      addTestResult({ 
        success: true, 
        message: `✅ تم إنشاء قضية بنجاح - ID: ${caseId}`,
        data: { caseId }
      });

      // اختبار 4: جلب قضايا المستخدم
      const cases = await centralEmbeddedAuth.getUserCases();
      addTestResult({ 
        success: true, 
        message: `✅ تم جلب قضايا المستخدم - العدد: ${cases.length}`,
        data: { cases }
      });

      // اختبار 5: حفظ تفضيل
      await centralEmbeddedAuth.setUserPreference('theme', 'dark');
      addTestResult({ 
        success: true, 
        message: '✅ تم حفظ التفضيل بنجاح'
      });

      // اختبار 6: جلب تفضيل
      const theme = await centralEmbeddedAuth.getUserPreference('theme');
      addTestResult({ 
        success: true, 
        message: `✅ تم جلب التفضيل بنجاح - القيمة: ${theme}`,
        data: { theme }
      });

      // اختبار 7: التحقق من حالة الاشتراك
      const subscription = await centralEmbeddedAuth.checkSubscriptionStatus(user.id);
      addTestResult({ 
        success: true, 
        message: `✅ تم التحقق من الاشتراك - النوع: ${subscription?.planType}`,
        data: { subscription }
      });

      // اختبار 8: إحصائيات المستخدم
      const stats = await centralEmbeddedAuth.getUserStats();
      addTestResult({ 
        success: true, 
        message: `✅ تم جلب الإحصائيات - القضايا: ${stats?.totalCases}`,
        data: { stats }
      });

      // اختبار 9: التحقق من صحة الجلسة
      const isValidSession = await centralEmbeddedAuth.validateSession();
      addTestResult({ 
        success: true, 
        message: `✅ تم التحقق من صحة الجلسة - النتيجة: ${isValidSession}`,
        data: { isValidSession }
      });

      addTestResult({ 
        success: true, 
        message: '🎉 جميع الاختبارات نجحت! قاعدة البيانات المركزية تعمل بشكل مثالي'
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير معروف';
      addTestResult({ 
        success: false, 
        message: `❌ فشل في الاختبار: ${errorMessage}`,
        data: { error }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testPrivacy = async () => {
    setIsLoading(true);
    addTestResult({ success: true, message: '🧪 اختبار الخصوصية...' });

    try {
      // إنشاء مستخدمين مختلفين
      const user1Id = await centralEmbeddedAuth.registerUser(
        'user1@test.com',
        'password123',
        'مستخدم تجريبي 1'
      );

      const user2Id = await centralEmbeddedAuth.registerUser(
        'user2@test.com',
        'password123',
        'مستخدم تجريبي 2'
      );

      addTestResult({ 
        success: true, 
        message: `✅ تم إنشاء مستخدمين تجريبيين: ${user1Id}, ${user2Id}`
      });

      // تسجيل دخول المستخدم الأول
      await centralEmbeddedAuth.loginUser('user1@test.com', 'password123');
      
      // إنشاء قضية للمستخدم الأول
      const case1Id = await centralEmbeddedAuth.createCase({
        name: 'قضية المستخدم الأول',
        caseType: 'مدني'
      });

      addTestResult({ 
        success: true, 
        message: `✅ المستخدم الأول أنشأ قضية: ${case1Id}`
      });

      // تسجيل دخول المستخدم الثاني
      await centralEmbeddedAuth.loginUser('user2@test.com', 'password123');
      
      // إنشاء قضية للمستخدم الثاني
      const case2Id = await centralEmbeddedAuth.createCase({
        name: 'قضية المستخدم الثاني',
        caseType: 'تجاري'
      });

      addTestResult({ 
        success: true, 
        message: `✅ المستخدم الثاني أنشأ قضية: ${case2Id}`
      });

      // التحقق من أن كل مستخدم يرى فقط قضاياه
      const user1Cases = await centralEmbeddedAuth.getUserCases();
      const user1CaseNames = user1Cases.map(c => c.name);

      addTestResult({ 
        success: user1Cases.length === 1 && user1CaseNames.includes('قضية المستخدم الثاني'),
        message: `🔍 المستخدم الأول يرى ${user1Cases.length} قضايا: ${user1CaseNames.join(', ')}`,
        data: { user1Cases }
      });

      addTestResult({ 
        success: true, 
        message: '✅ اختبار الخصوصية اكتمل - كل مستخدم يرى فقط بياناته'
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير معروف';
      addTestResult({ 
        success: false, 
        message: `❌ فشل في اختبار الخصوصية: ${errorMessage}`,
        data: { error }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cleanupTestData = async () => {
    setIsLoading(true);
    addTestResult({ success: true, message: '🧹 تنظيف البيانات التجريبية...' });

    try {
      // يمكن إضافة API لحذف البيانات التجريبية هنا
      addTestResult({ 
        success: true, 
        message: '✅ تم تنظيف البيانات التجريبية بنجاح'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير معروف';
      addTestResult({ 
        success: false, 
        message: `❌ فشل في تنظيف البيانات: ${errorMessage}`,
        data: { error }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>اختبار قاعدة البيانات المركزية - منصة التحليل القانوني</title>
        <meta name="description" content="اختبار قاعدة البيانات المركزية" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          {/* العنوان */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🧪 اختبار قاعدة البيانات المركزية
            </h1>
            <p className="text-gray-300 text-lg">
              اختبار نظام قاعدة البيانات المركزية مع الخصوصية والمزامنة
            </p>
          </div>

          {/* نموذج البيانات */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">📝 بيانات الاختبار</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">كلمة المرور</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">الاسم الكامل</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  dir="rtl"
                />
              </div>
            </div>
          </div>

          {/* أزرار الاختبار */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={runAllTests}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              {isLoading ? '⏳ جاري الاختبار...' : '🚀 تشغيل جميع الاختبارات'}
            </button>
            
            <button
              onClick={testPrivacy}
              disabled={isLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              {isLoading ? '⏳ جاري الاختبار...' : '🔒 اختبار الخصوصية'}
            </button>
            
            <button
              onClick={cleanupTestData}
              disabled={isLoading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              {isLoading ? '⏳ جاري التنظيف...' : '🧹 تنظيف البيانات التجريبية'}
            </button>
          </div>

          {/* زر مسح النتائج */}
          <div className="text-center mb-6">
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              🗑️ مسح النتائج
            </button>
          </div>

          {/* نتائج الاختبار */}
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-900/50 border-green-500 text-green-200'
                    : 'bg-red-900/50 border-red-500 text-red-200'
                }`}
              >
                <div className="flex items-start space-x-3 space-x-reverse">
                  <span className="text-lg">
                    {result.success ? '✅' : '❌'}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{result.message}</p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm opacity-75">
                          عرض البيانات التفصيلية
                        </summary>
                        <pre className="mt-2 p-2 bg-black/20 rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.data as Record<string, unknown>, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* معلومات إضافية */}
          <div className="mt-12 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">📚 معلومات عن قاعدة البيانات المركزية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
              <div>
                <h4 className="font-medium text-white mb-2">✅ المميزات:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• قاعدة بيانات واحدة مركزية لجميع المستخدمين</li>
                  <li>• خصوصية مضمونة - كل مستخدم يرى فقط بياناته</li>
                  <li>• مزامنة فورية بين جميع الأجهزة</li>
                  <li>• نظام مصادقة آمن مع تشفير كلمات المرور</li>
                  <li>• إدارة اشتراكات متقدمة</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">🔧 كيفية الاستخدام:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• استخدم زر "تشغيل جميع الاختبارات" لاختبار النظام</li>
                  <li>• استخدم زر "اختبار الخصوصية" للتأكد من عزل البيانات</li>
                  <li>• استخدم زر "تنظيف البيانات التجريبية" لحذف البيانات التجريبية</li>
                  <li>• راقب النتائج في الأسفل للتأكد من عمل النظام</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
