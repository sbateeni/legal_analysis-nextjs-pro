import { NextApiRequest, NextApiResponse } from 'next';
import { legalUpdateService } from '../../../utils/legalUpdateService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      message: 'طريقة غير مسموحة'
    });
  }

  try {
    const stats = legalUpdateService.getUpdateStats();
    const recentUpdates = legalUpdateService.getUpdates(10);
    const unreadNotifications = legalUpdateService.getUnreadNotifications();

    res.status(200).json({
      status: 'success',
      data: {
        stats,
        recentUpdates,
        unreadNotifications,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('خطأ في API حالة التحديثات:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في الخادم'
    });
  }
}
