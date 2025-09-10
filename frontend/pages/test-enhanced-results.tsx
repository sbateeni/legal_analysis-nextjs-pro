import React, { useState } from 'react';
import EnhancedStageResults from '../components/EnhancedStageResults';

export default function TestEnhancedResults() {
  const [testData, setTestData] = useState({
    stages: [
      {
        id: 1,
        name: 'المرحلة الأولى: تحديد المشكلة القانونية',
        status: 'completed' as const,
        timeSpent: 3,
        textLength: 1250
      },
      {
        id: 2,
        name: 'المرحلة الثانية: جمع المعلومات والوثائق',
        status: 'completed' as const,
        timeSpent: 2,
        textLength: 980
      },
      {
        id: 3,
        name: 'المرحلة الثالثة: تحليل النصوص القانونية',
        status: 'failed' as const,
        error: 'خطأ في الاتصال بالخدمة'
      },
      {
        id: 4,
        name: 'المرحلة الرابعة: تحديد القواعد القانونية المنطبقة',
        status: 'pending' as const,
        requiresApiKey: true
      },
      {
        id: 5,
        name: 'المرحلة الخامسة: تحليل السوابق القضائية',
        status: 'pending' as const,
        requiresApiKey: true
      },
      {
        id: 6,
        name: 'المرحلة السادسة: تحليل الفقه القانوني',
        status: 'pending' as const,
        requiresApiKey: true
      },
      {
        id: 7,
        name: 'المرحلة السابعة: تحليل الظروف الواقعية',
        status: 'pending' as const,
        requiresApiKey: true
      },
      {
        id: 8,
        name: 'المرحلة الثامنة: تحديد الحلول القانونية الممكنة',
        status: 'pending' as const,
        requiresApiKey: true
      },
      {
        id: 9,
        name: 'المرحلة التاسعة: تقييم الحلول القانونية',
        status: 'pending' as const,
        requiresApiKey: true
      },
      {
        id: 10,
        name: 'المرحلة العاشرة: اختيار الحل الأمثل',
        status: 'pending' as const,
        requiresApiKey: true
      },
      {
        id: 11,
        name: 'المرحلة الحادية عشرة: صياغة الحل القانوني',
        status: 'pending' as const,
        requiresApiKey: true
      },
      {
        id: 12,
        name: 'المرحلة الثانية عشرة: تقديم التوصيات',
        status: 'pending' as const,
        requiresApiKey: true
      },
      {
        id: 13,
        name: 'المرحلة الثالثة عشرة: تحليل المخاطر القانونية',
        status: 'pending' as const,
        requiresApiKey: true
      },
      {
        id: 14,
        name: 'المرحلة الرابعة عشرة: استراتيجية الدفاع/الادعاء',
        status: 'pending' as const,
        requiresApiKey: true
      },
      {
        id: 15,
        name: 'المرحلة الخامسة عشرة: خطة التنفيذ العملي',
        status: 'pending' as const,
        requiresApiKey: true
      },
      {
        id: 16,
        name: 'المرحلة السادسة عشرة: تحليل التكلفة والوقت',
        status: 'pending' as const,
        requiresApiKey: true
      },
      {
        id: 17,
        name: 'المرحلة السابعة عشرة: العريضة القانونية النهائية',
        status: 'pending' as const,
        requiresApiKey: true
      }
    ],
    totalStages: 17,
    completedStages: 2,
    failedStages: 1,
    totalTime: 5
  });

  const simulateProgress = () => {
    setTestData(prev => ({
      ...prev,
      stages: prev.stages.map((stage, index) => {
        if (index === 3) {
      return {
        ...stage,
        status: 'completed' as const,
        timeSpent: 4,
        textLength: 1100,
        error: undefined,
        requiresApiKey: undefined
      };
        }
        return stage;
      }),
      completedStages: 3,
      failedStages: 0,
      totalTime: 9
    }));
  };

  const resetData = () => {
    setTestData({
      stages: [
        {
          id: 1,
          name: 'المرحلة الأولى: تحديد المشكلة القانونية',
          status: 'pending' as const,
          requiresApiKey: true
        },
        {
          id: 2,
          name: 'المرحلة الثانية: جمع المعلومات والوثائق',
          status: 'pending' as const,
          requiresApiKey: true
        },
        {
          id: 3,
          name: 'المرحلة الثالثة: تحليل النصوص القانونية',
          status: 'pending' as const,
          requiresApiKey: true
        },
        {
          id: 4,
          name: 'المرحلة الرابعة: تحديد القواعد القانونية المنطبقة',
          status: 'pending' as const,
          requiresApiKey: true
        },
        {
          id: 5,
          name: 'المرحلة الخامسة: تحليل السوابق القضائية',
          status: 'pending' as const,
          requiresApiKey: true
        },
        {
          id: 6,
          name: 'المرحلة السادسة: تحليل الفقه القانوني',
          status: 'pending' as const,
          requiresApiKey: true
        },
        {
          id: 7,
          name: 'المرحلة السابعة: تحليل الظروف الواقعية',
          status: 'pending' as const,
          requiresApiKey: true
        },
        {
          id: 8,
          name: 'المرحلة الثامنة: تحديد الحلول القانونية الممكنة',
          status: 'pending' as const,
          requiresApiKey: true
        },
        {
          id: 9,
          name: 'المرحلة التاسعة: تقييم الحلول القانونية',
          status: 'pending' as const,
          requiresApiKey: true
        },
        {
          id: 10,
          name: 'المرحلة العاشرة: اختيار الحل الأمثل',
          status: 'pending' as const,
          requiresApiKey: true
        },
        {
          id: 11,
          name: 'المرحلة الحادية عشرة: صياغة الحل القانوني',
          status: 'pending' as const,
          requiresApiKey: true
        },
        {
          id: 12,
          name: 'المرحلة الثانية عشرة: تقديم التوصيات',
          status: 'pending' as const,
          requiresApiKey: true
        },
        {
          id: 13,
          name: 'المرحلة الثالثة عشرة: تحليل المخاطر القانونية',
          status: 'pending' as const,
          requiresApiKey: true
        },
        {
          id: 14,
          name: 'المرحلة الرابعة عشرة: استراتيجية الدفاع/الادعاء',
          status: 'pending' as const,
          requiresApiKey: true
        },
        {
          id: 15,
          name: 'المرحلة الخامسة عشرة: خطة التنفيذ العملي',
          status: 'pending' as const,
          requiresApiKey: true
        },
        {
          id: 16,
          name: 'المرحلة السادسة عشرة: تحليل التكلفة والوقت',
          status: 'pending' as const,
          requiresApiKey: true
        },
        {
          id: 17,
          name: 'المرحلة السابعة عشرة: العريضة القانونية النهائية',
          status: 'pending' as const,
          requiresApiKey: true
        }
      ],
      totalStages: 17,
      completedStages: 0,
      failedStages: 0,
      totalTime: 0
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            🎨 اختبار عرض المراحل المحسن
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            صفحة تجريبية لاختبار التصميم الجديد لعرض نتائج المراحل القانونية
          </p>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={simulateProgress}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🚀 محاكاة التقدم
            </button>
            <button
              onClick={resetData}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🔄 إعادة تعيين
            </button>
          </div>
        </div>

        <EnhancedStageResults
          stages={testData.stages}
          totalStages={testData.totalStages}
          completedStages={testData.completedStages}
          failedStages={testData.failedStages}
          totalTime={testData.totalTime}
        />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            📊 إحصائيات الاختبار
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{testData.totalStages}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">إجمالي المراحل</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{testData.completedStages}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">مكتملة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{testData.failedStages}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">فاشلة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {testData.totalStages - testData.completedStages - testData.failedStages}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">متبقية</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
