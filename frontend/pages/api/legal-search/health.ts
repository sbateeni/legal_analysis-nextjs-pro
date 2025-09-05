import { NextApiRequest, NextApiResponse } from 'next';

interface SiteStatus {
  name: string;
  url: string;
  status: 'online' | 'offline' | 'error';
  response_time: number;
  last_checked: string;
  error_message?: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  sites: SiteStatus[];
  total_sites: number;
  online_sites: number;
  offline_sites: number;
  check_time: number;
}

// قائمة المواقع القانونية للفحص
const LEGAL_SITES = [
  {
    name: 'المقتفي - منظومة القضاء والتشريع',
    url: 'http://muqtafi.birzeit.edu/pg/',
    timeout: 10000
  },
  {
    name: 'مقام - التشريعات',
    url: 'https://maqam.najah.edu/legislation/',
    timeout: 10000
  },
  {
    name: 'مقام - الأحكام القضائية',
    url: 'https://maqam.najah.edu/judgments/',
    timeout: 10000
  },
  {
    name: 'مقام - قاعدة المعرفة',
    url: 'https://maqam.najah.edu/gap/',
    timeout: 10000
  }
];

// دالة فحص حالة موقع واحد
async function checkSiteHealth(site: typeof LEGAL_SITES[0]): Promise<SiteStatus> {
  const startTime = Date.now();
  
  try {
    // إنشاء AbortController للتحكم في المهلة الزمنية
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), site.timeout);
    
    const response = await fetch(site.url, {
      method: 'GET', // بعض المواقع القديمة لا تتعامل جيداً مع HEAD
      signal: controller.signal,
      headers: {
        'User-Agent': 'Legal-Analysis-System/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    if (response.status >= 200 && response.status < 400) {
      return {
        name: site.name,
        url: site.url,
        status: 'online',
        response_time: responseTime,
        last_checked: new Date().toISOString()
      };
    } else {
      return {
        name: site.name,
        url: site.url,
        status: 'error',
        response_time: responseTime,
        last_checked: new Date().toISOString(),
        error_message: `HTTP ${response.status}: ${response.statusText}`
      };
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    let errorMessage = 'خطأ غير معروف';
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'انتهت المهلة الزمنية';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'خطأ في الاتصال';
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      name: site.name,
      url: site.url,
      status: 'offline',
      response_time: responseTime,
      last_checked: new Date().toISOString(),
      error_message: errorMessage
    };
  }
}

// الدالة الرئيسية لفحص صحة جميع المواقع
async function checkAllSitesHealth(): Promise<HealthResponse> {
  const startTime = Date.now();
  
  try {
    // فحص جميع المواقع بالتوازي
    const healthPromises = LEGAL_SITES.map(site => checkSiteHealth(site));
    const siteStatuses = await Promise.all(healthPromises);
    
    const onlineSites = siteStatuses.filter(site => site.status === 'online').length;
    const offlineSites = siteStatuses.filter(site => site.status === 'offline').length;
    const errorSites = siteStatuses.filter(site => site.status === 'error').length;
    
    // تحديد الحالة العامة للنظام
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (onlineSites === LEGAL_SITES.length) {
      overallStatus = 'healthy';
    } else if (onlineSites >= LEGAL_SITES.length / 2) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'unhealthy';
    }
    
    const checkTime = Date.now() - startTime;
    
    return {
      status: overallStatus,
      sites: siteStatuses,
      total_sites: LEGAL_SITES.length,
      online_sites: onlineSites,
      offline_sites: offlineSites + errorSites,
      check_time: checkTime
    };
    
  } catch (error) {
    console.error('خطأ في فحص صحة المواقع:', error);
    return {
      status: 'unhealthy',
      sites: [],
      total_sites: LEGAL_SITES.length,
      online_sites: 0,
      offline_sites: LEGAL_SITES.length,
      check_time: Date.now() - startTime
    };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<HealthResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'unhealthy',
      sites: [],
      total_sites: 0,
      online_sites: 0,
      offline_sites: 0,
      check_time: 0
    });
  }
  
  try {
    const healthResponse = await checkAllSitesHealth();
    
    // تحديد رمز الاستجابة المناسب
    let statusCode = 200;
    if (healthResponse.status === 'degraded') {
      statusCode = 207; // Multi-Status
    } else if (healthResponse.status === 'unhealthy') {
      statusCode = 503; // Service Unavailable
    }
    
    res.status(statusCode).json(healthResponse);
    
  } catch (error) {
    console.error('خطأ في API فحص الصحة:', error);
    res.status(500).json({
      status: 'unhealthy',
      sites: [],
      total_sites: LEGAL_SITES.length,
      online_sites: 0,
      offline_sites: LEGAL_SITES.length,
      check_time: 0
    });
  }
}
