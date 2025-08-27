import { get as idbGet, set as idbSet } from 'idb-keyval';

export type AppSettings = {
  preferredModel?: 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-2.0-flash';
  rateLimitPerMin?: number;
};

const KEY = 'app_settings_v1';

export async function loadAppSettings(): Promise<AppSettings> {
  try {
    return (await idbGet(KEY)) || { preferredModel: 'gemini-1.5-flash', rateLimitPerMin: 10 };
  } catch {
    return { preferredModel: 'gemini-1.5-flash', rateLimitPerMin: 10 };
  }
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  await idbSet(KEY, settings);
}


