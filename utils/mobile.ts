// ميزات متقدمة للجوال

// دالة التحقق من دعم الكاميرا
export function isCameraSupported(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      resolve(false);
      return;
    }

    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const hasCamera = devices.some(device => device.kind === 'videoinput');
        resolve(hasCamera);
      })
      .catch(() => resolve(false));
  });
}

// دالة التقاط صورة من الكاميرا
export function captureImage(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      reject(new Error('الكاميرا غير مدعومة'));
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        video.srcObject = stream;
        video.play();

        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          ctx?.drawImage(video, 0, 0);
          const imageData = canvas.toDataURL('image/jpeg', 0.8);
          
          // إيقاف الكاميرا
          stream.getTracks().forEach(track => track.stop());
          
          resolve(imageData);
        };
      })
      .catch(reject);
  });
}

// دالة التحقق من دعم التسجيل الصوتي
export function isAudioSupported(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      resolve(false);
      return;
    }

    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const hasMicrophone = devices.some(device => device.kind === 'audioinput');
        resolve(hasMicrophone);
      })
      .catch(() => resolve(false));
  });
}

// دالة التسجيل الصوتي
export function startAudioRecording(): Promise<MediaRecorder> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      reject(new Error('التسجيل الصوتي غير مدعوم'));
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const recorder = new MediaRecorder(stream);
        resolve(recorder);
      })
      .catch(reject);
  });
}

// دالة تحويل الصوت إلى نص (محاكاة)
export function speechToText(audioBlob: Blob): Promise<string> {
  return new Promise((resolve) => {
    // محاكاة تحويل الصوت إلى نص
    // في التطبيق الحقيقي، يمكن استخدام Web Speech API أو خدمات خارجية
    setTimeout(() => {
      resolve('نص محول من الصوت (محاكاة)');
    }, 2000);
  });
}

// دالة إرسال إشعار
export function sendNotification(title: string, options?: NotificationOptions): void {
  if (typeof Notification === 'undefined') {
    console.warn('الإشعارات غير مدعومة');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, options);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, options);
      }
    });
  }
}

// دالة حفظ البيانات محلياً
export function saveOfflineData(key: string, data: any): void {
  try {
    localStorage.setItem(`offline_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error saving offline data:', error);
  }
}

// دالة تحميل البيانات المحفوظة
export function loadOfflineData(key: string): any | null {
  try {
    const saved = localStorage.getItem(`offline_${key}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      // التحقق من صلاحية البيانات (24 ساعة)
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return parsed.data;
      }
    }
    return null;
  } catch (error) {
    console.error('Error loading offline data:', error);
    return null;
  }
}

// دالة مزامنة البيانات عند عودة الاتصال
export function syncOfflineData(): Promise<void> {
  return new Promise((resolve) => {
    // محاكاة مزامنة البيانات
    setTimeout(() => {
      console.log('تمت مزامنة البيانات المحفوظة');
      resolve();
    }, 1000);
  });
}

// دالة التحقق من حالة الاتصال
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

// دالة مراقبة حالة الاتصال
export function onConnectionChange(callback: (online: boolean) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// دالة تحسين الأداء للجوال
export function optimizeForMobile(): void {
  if (typeof window === 'undefined') return;

  // تقليل استخدام الذاكرة
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    if (process.env.NODE_ENV === 'development') {
      originalConsoleLog(...args);
    }
  };

  // تحسين التمرير
  let ticking = false;
  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        // تحسين التمرير هنا
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
}

// دالة إضافة اختصارات للشاشة الرئيسية
export function addToHomeScreen(): void {
  if (typeof window === 'undefined') return;

  // إظهار رسالة للمستخدم
  const message = `
    لإضافة التطبيق للشاشة الرئيسية:
    
    على Android/Chrome:
    - اضغط على القائمة (⋮)
    - اختر "إضافة للشاشة الرئيسية"
    
    على iOS/Safari:
    - اضغط على زر المشاركة
    - اختر "إضافة للشاشة الرئيسية"
  `;

  alert(message);
}

// دالة تحسين التحميل للجوال
export function lazyLoadImages(): void {
  if (typeof window === 'undefined') return;

  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || '';
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
} 