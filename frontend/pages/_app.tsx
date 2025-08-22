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
      navigator.serviceWorker.register(swUrl).catch(() => {
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