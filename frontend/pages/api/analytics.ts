import type { NextApiRequest, NextApiResponse } from 'next';

// ملاحظة: IndexedDB لا يعمل في Server-Side API routes
// جميع الواجهات والدوال المعلقة ستكون مفيدة عند تطوير نظام تخزين للخادم

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ملاحظة: IndexedDB لا يعمل في Server-Side API routes
    // نعيد بيانات فارغة حتى يتم تطوير حل بديل
    console.log('Analytics API - IndexedDB not available in server-side, returning empty data');
    
    return res.status(200).json({
      totalCases: 0,
      casesByType: {},
      casesByMonth: {},
      averageStagesCompleted: 0,
      mostCommonIssues: [],
      successRate: 0,
      averageCaseLength: 0,
      topStages: [],
      recentActivity: [],
      note: 'البيانات محفوظة محلياً في المتصفح. التحليلات ستكون متوفرة عند تطوير نظام تخزين للخادم.'
    });

  } catch (error: unknown) {
    console.error('Error in analytics API:', error);
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    return res.status(500).json({
      code: 'ANALYTICS_ERROR',
      message: 'حدث خطأ في تحليل البيانات',
      details: errorMessage
    });
  }
} 