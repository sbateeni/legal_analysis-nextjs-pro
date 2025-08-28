import type { AppProps } from "next/app";
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import '../styles/globals.css';
import '../styles/responsive.css';
import { ThemeProvider } from '../contexts/ThemeContext';
import Layout from '../components/Layout';
import type { NextWebVitalsMetric } from 'next/app';
import { recordWebVital } from '../utils/metrics';

export function reportWebVitals(metric: NextWebVitalsMetric) {
  recordWebVital(metric);
}

export default function App({ Component, pageProps }: AppProps) {
  const [updateReady, setUpdateReady] = useState(false);
  const waitingSWRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
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
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <a href="#main-content" className="skip-link">تخطي إلى المحتوى</a>
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