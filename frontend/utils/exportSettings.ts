import { get as idbGet, set as idbSet } from 'idb-keyval';

export type ExportPreferences = {
  headerText?: string;
  footerText?: string;
  includeStages?: boolean;
  includeInputs?: boolean;
  includeOutputs?: boolean;
  marginPt?: number; // PDF margin in points
  logoDataUrl?: string; // base64 data URL
};

const KEY = 'export_preferences_v1';

export async function loadExportPreferences(): Promise<ExportPreferences> {
  try {
    const prefs = await idbGet(KEY);
    return (prefs as ExportPreferences) || { includeStages: true, includeInputs: false, includeOutputs: true, marginPt: 48 };
  } catch {
    return { includeStages: true, includeInputs: false, includeOutputs: true, marginPt: 48 };
  }
}

export async function saveExportPreferences(prefs: ExportPreferences): Promise<void> {
  await idbSet(KEY, prefs);
}


