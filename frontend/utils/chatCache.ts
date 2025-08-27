type CacheValue = {
  value: any;
  expiresAt: number;
};

const CACHE_TTL_MS = 30 * 1000; // 30s short-lived
const MAX_ENTRIES = 500;

const map = new Map<string, CacheValue>();

export function makeChatCacheKey(params: {
  message: string;
  caseType?: string;
  currentStage?: number;
  previousAnalysisHash?: string;
  modelName?: string;
}): string {
  const base = `${params.message.slice(0, 400)}|${params.caseType ?? ''}|${params.currentStage ?? ''}|${params.modelName ?? ''}`;
  const prevHash = params.previousAnalysisHash ?? '';
  return base + '|' + prevHash.slice(-64);
}

export function chatCacheGet(key: string): any | null {
  const hit = map.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    map.delete(key);
    return null;
  }
  return hit.value;
}

export function chatCacheSet(key: string, value: any): void {
  map.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  if (map.size > MAX_ENTRIES) {
    const oldest = map.keys().next().value;
    if (oldest) map.delete(oldest);
  }
} 