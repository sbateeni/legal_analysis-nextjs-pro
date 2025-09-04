import { NextApiRequest, NextApiResponse } from 'next';
import { legalUpdateService } from '../../../utils/legalUpdateService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // الحصول على الإشعارات
    try {
      const { limit = 50, unreadOnly = false } = req.query;
      
      const notifications = unreadOnly === 'true' 
        ? legalUpdateService.getUnreadNotifications()
        : legalUpdateService.getNotifications(Number(limit));

      res.status(200).json({
        status: 'success',
        data: {
          notifications,
          total: notifications.length,
          unread: legalUpdateService.getUnreadNotifications().length
        }
      });

    } catch (error) {
      console.error('خطأ في الحصول على الإشعارات:', error);
      res.status(500).json({
        status: 'error',
        message: 'خطأ في الخادم'
      });
    }
  } 
  else if (req.method === 'POST') {
    // تحديد إشعار كمقروء
    try {
      const { notificationId, action } = req.body;

      if (action === 'mark_read' && notificationId) {
        legalUpdateService.markNotificationAsRead(notificationId);
        
        res.status(200).json({
          status: 'success',
          message: 'تم تحديد الإشعار كمقروء'
        });
      } else {
        res.status(400).json({
          status: 'error',
          message: 'بيانات غير صحيحة'
        });
      }

    } catch (error) {
      console.error('خطأ في تحديث الإشعار:', error);
      res.status(500).json({
        status: 'error',
        message: 'خطأ في الخادم'
      });
    }
  }
  else {
    res.status(405).json({
      status: 'error',
      message: 'طريقة غير مسموحة'
    });
  }
}
