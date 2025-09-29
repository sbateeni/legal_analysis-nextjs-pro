import { get as idbGet, set as idbSet } from 'idb-keyval';
import { AIProvider } from './aiProvider';

export type APIKeys = {
  google?: string;
  openrouter?: string;
};

export type AppSettings = {
  preferredModel?: string; // Now supports any model ID from aiProvider
  preferredProvider?: AIProvider;
  rateLimitPerMin?: number;
  apiKeys?: APIKeys;
};

const KEY = 'app_settings_v1';

export async function loadAppSettings(): Promise<AppSettings> {
  try {
    return (await idbGet(KEY)) || { 
      preferredModel: 'gemini-1.5-flash', 
      preferredProvider: 'google',
      rateLimitPerMin: 10,
      apiKeys: {}
    };
  } catch {
    return { 
      preferredModel: 'gemini-1.5-flash', 
      preferredProvider: 'google',
      rateLimitPerMin: 10,
      apiKeys: {}
    };
  }
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  await idbSet(KEY, settings);
}

/**
 * Helper functions for managing API keys
 */
export async function saveApiKeyForProvider(provider: AIProvider, apiKey: string): Promise<void> {
  const settings = await loadAppSettings();
  if (!settings.apiKeys) settings.apiKeys = {};
  settings.apiKeys[provider] = apiKey;
  await saveAppSettings(settings);
}

export async function getApiKeyForProvider(provider: AIProvider): Promise<string | undefined> {
  const settings = await loadAppSettings();
  return settings.apiKeys?.[provider];
}

export async function removeApiKeyForProvider(provider: AIProvider): Promise<void> {
  const settings = await loadAppSettings();
  if (settings.apiKeys) {
    delete settings.apiKeys[provider];
    await saveAppSettings(settings);
  }
}


