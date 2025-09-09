import type { AppProps } from "next/app";
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import '../styles/globals.css';
import '../styles/responsive.css';
import { ThemeProvider } from '../contexts/ThemeContext';
import Layout from '../components/Layout';
import type { NextWebVitalsMetric } from 'next/app';
import { recordWebVital } from '@utils/metrics';
// تم حذف نظام المصادقة لجعل الموقع عاماً

export function reportWebVitals(metric: NextWebVitalsMetric) {
  recordWebVital(metric);
}

export default function App({ Component, pageProps }: AppProps) {
  const [updateReady, setUpdateReady] = useState(false);
  const waitingSWRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    // تم حذف تهيئة نظام المصادقة

    // لا تسجّل Service Worker أثناء التطوير لتجنب تعارض Fast Refresh
    if (process.env.NODE_ENV !== 'production') {
      try {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister().catch(()=>{})));
        }
        if (typeof caches !== 'undefined') {
          caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
        }
      } catch {}
      return;
    }

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // تتبّع وجود تفاعل لتحديد ما إذا كان هذا تشغيلًا جديدًا أم أثناء العمل
      const markInteracted = () => {
        try { sessionStorage.setItem('hasInteracted', '1'); } catch {}
        window.removeEventListener('pointerdown', markInteracted);
        window.removeEventListener('keydown', markInteracted);
      };
      window.addEventListener('pointerdown', markInteracted, { once: true });
      window.addEventListener('keydown', markInteracted, { once: true });

      const swUrl = '/sw.js';
      navigator.serviceWorker.register(swUrl).then(async (registration) => {
        // رصد وجود نسخة جاهزة (waiting)
        const hasInteracted = (() => { try { return sessionStorage.getItem('hasInteracted') === '1'; } catch { return false; } })();
        const isFreshLoad = !hasInteracted && performance.now() < 5000;
        if (registration.waiting) {
          waitingSWRef.current = registration.waiting;
          if (isFreshLoad) {
            // تحديث تلقائي عند التشغيل فقط
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            const onControllerChange = () => {
              navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
              window.location.reload();
            };
            navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
          } else {
            setUpdateReady(true);
          }
        }
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // نسخة جديدة أصبحت جاهزة وتنتظر التفعيل
              waitingSWRef.current = registration.waiting || newWorker as unknown as ServiceWorker;
              const fresh = !hasInteracted && performance.now() < 5000;
              if (fresh) {
                // تحديث تلقائي عند التشغيل فقط
                (waitingSWRef.current || newWorker as unknown as ServiceWorker).postMessage({ type: 'SKIP_WAITING' });
                const onControllerChange = () => {
                  navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
                  window.location.reload();
                };
                navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
              } else {
                setUpdateReady(true);
              }
            }
          });
        });

        // لا نقوم بإعادة التحميل تلقائياً
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // تحكم SW تغير؛ نترك الصفحة كما هي ما لم يختَر المستخدم التحديث الآن
        });

        // فحص دوري لوجود تحديثات كل 30 دقيقة
        setInterval(() => {
          registration.update().catch(() => {});
        }, 30 * 60 * 1000);
      }).catch(() => {
        // ignore
      });
    }
  }, []);

  // تطبيق التحديث الآن: تفعيل SW الجديد ثم إعادة التحميل فوراً
  const applyUpdateNow = () => {
    const sw = waitingSWRef.current;
    if (!sw) return;
    sw.postMessage({ type: 'SKIP_WAITING' });
    // عند انتقال التحكم إلى SW الجديد، أعد التحميل
    const onControllerChange = () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    setUpdateReady(false);
  };

  // تطبيق التحديث عند الخمول/الخلفية: انتظر حتى تصبح الصفحة مخفية
  // تطبيق النسخة الجديدة عند الفتح القادم: لا نفعل شيئاً الآن، فقط نخفي التنبيه
  const applyNextOpen = () => {
    setUpdateReady(false);
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="التحليل القانوني" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512x512.png" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <style dangerouslySetInnerHTML={{
        __html: `
        /* دعم المناطق الآمنة للهواتف الذكية */
        * {
          box-sizing: border-box;
        }
        
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
          /* دعم المناطق الآمنة في الهواتف الحديثة */
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }
        
        /* تحسين التمرير على الأجهزة المحمولة */
        body {
          -webkit-overflow-scrolling: touch;
          touch-action: manipulation;
        }
        
        /* منع التكبير عند النقر على الإدخالات */
        input, textarea, select {
          font-size: 16px !important;
          -webkit-appearance: none;
          border-radius: 0;
        }
        
        /* تحسين أداء التطبيق */
        * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        /* السماح بالتحديد للنصوص والإدخالات */
        input, textarea, [contenteditable] {
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }
        
        /* أنيميشن زر التثبيت */
        @keyframes pulse {
          0% {
            box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 40px rgba(0,0,0,0.15), 0 0 0 0px rgba(99, 102, 241, 0.7);
          }
          70% {
            box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 40px rgba(0,0,0,0.15), 0 0 0 8px rgba(99, 102, 241, 0);
          }
          100% {
            box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 40px rgba(0,0,0,0.15), 0 0 0 0px rgba(99, 102, 241, 0);
          }
        }
        
        /* دعم متقدم للهواتف القابلة للطي */
        @supports (padding: max(0px)) {
          body {
            padding-top: max(env(safe-area-inset-top), 0px);
            padding-bottom: max(env(safe-area-inset-bottom), 0px);
            padding-left: max(env(safe-area-inset-left), 0px);
            padding-right: max(env(safe-area-inset-right), 0px);
          }
        }
        `
      }} />
      <a href="#main-content" className="skip-link" style={{
        position: 'absolute',
        top: '-40px',
        left: '6px',
        background: '#000',
        color: '#fff',
        padding: '8px',
        textDecoration: 'none',
        borderRadius: '4px',
        zIndex: 10000,
        fontSize: '14px',
        fontWeight: 'bold'
      }} onFocus={(e) => e.currentTarget.style.top = '6px'} onBlur={(e) => e.currentTarget.style.top = '-40px'}>تخطي إلى المحتوى</a>
      <ThemeProvider>
        <Layout>
          <main id="main-content">
            <Component {...pageProps} />
          </main>
          {updateReady && (
            <div style={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 10000,
              background: '#111827',
              color: 'white',
              padding: '12px 16px',
              borderRadius: 12,
              boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              maxWidth: 320,
              fontFamily: 'Tajawal, Arial, sans-serif'
            }}>
              <div style={{ fontWeight: 800 }}>تحديث متاح</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>هناك نسخة جديدة من التطبيق. يمكنك التحديث الآن أو سيُطبّق عند تشغيل التطبيق لاحقاً.</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={applyUpdateNow} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontWeight: 700 }}>تحديث الآن</button>
                <button onClick={applyNextOpen} style={{ background: '#374151', color: 'white', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontWeight: 700 }}>عند الفتح القادم</button>
              </div>
            </div>
          )}
        </Layout>
      </ThemeProvider>
    </>
  );
} 