import { NextApiRequest, NextApiResponse } from 'next';
import { legalUpdateService } from '../../../utils/legalUpdateService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      message: 'طريقة غير مسموحة'
    });
  }

  try {
    console.log('🔄 بدء التحديث اليدوي للمصادر القانونية...');
    
    await legalUpdateService.manualUpdate();
    
    const stats = legalUpdateService.getUpdateStats();
    const recentUpdates = legalUpdateService.getUpdates(5);

    res.status(200).json({
      status: 'success',
      message: 'تم التحديث بنجاح',
      data: {
        stats,
        recentUpdates,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('خطأ في التحديث اليدوي:', error);
    res.status(500).json({
      status: 'error',
      message: 'فشل في التحديث'
    });
  }
}
