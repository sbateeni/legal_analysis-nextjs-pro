import type { AppProps } from "next/app";
import Head from 'next/head';
import { useEffect } from 'react';
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
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const swUrl = '/sw.js';
      navigator.serviceWorker.register(swUrl).then(async (registration) => {
        // الاستماع للتحديثات
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // يوجد نسخة جديدة، استبدل وتحديث الصفحة
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            }
          });
        });

        // عندما تصبح النسخة الجديدة مفعّلة، أعد تحميل الصفحة مرة واحدة
        let refreshed = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshed) return;
          refreshed = true;
          window.location.reload();
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
        </Layout>
      </ThemeProvider>
    </>
  );
} 