import type { NextWebVitalsMetric } from 'next/app';

const METRICS_STORAGE_KEY = 'legal_metrics_vitals';
const MAX_SAMPLES = 100;

function readStoredMetrics(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(METRICS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredMetrics(samples: any[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(samples.slice(-MAX_SAMPLES)));
  } catch {
    // ignore write errors
  }
}

export function recordWebVital(metric: NextWebVitalsMetric): void {
  const samples = readStoredMetrics();
  samples.push({
    name: metric.name,
    value: metric.value,
    id: metric.id,
    label: metric.label,
    startTime: metric.startTime,
  });
  writeStoredMetrics(samples);

  if (process.env.NODE_ENV !== 'production') {
    try {
      // eslint-disable-next-line no-console
      console.debug('[WebVital]', metric.name, Math.round(metric.value * 100) / 100, metric.id);
    } catch {}
  }
}

export function getStoredWebVitals(): any[] {
  return readStoredMetrics();
}

export function clearStoredWebVitals(): void {
  writeStoredMetrics([]);
} 