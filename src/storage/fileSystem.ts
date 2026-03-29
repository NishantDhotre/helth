import * as FileSystem from 'expo-file-system';

const BASE_DIR = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';

export const CONTEXT_DIR = BASE_DIR + 'context/';

export const FILE_PATHS = {
  profile: CONTEXT_DIR + 'profile.json',
  mealsContext: CONTEXT_DIR + 'meals_context.json',
  nutritionLog: CONTEXT_DIR + 'nutrition_log.json',
  selfcareContext: CONTEXT_DIR + 'selfcare_context.json',
  selfcareInventory: CONTEXT_DIR + 'selfcare_inventory.json',
  selfcareLog: CONTEXT_DIR + 'selfcare_log.json',
  overallContext: CONTEXT_DIR + 'overall_context.json',
  pendingSuggestions: CONTEXT_DIR + 'pending_suggestions.json',
};

export async function ensureContextDir(): Promise<void> {
  if (!FileSystem.documentDirectory && !FileSystem.cacheDirectory) {
    throw new Error('FileSystem runtime not ready. documentDirectory and cacheDirectory are both null.');
  }

  const info = await FileSystem.getInfoAsync(CONTEXT_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(CONTEXT_DIR, { intermediates: true });
  }
}

export async function safeWriteJSON(path: string, data: object): Promise<void> {
  const tmp = path + '.tmp';
  await FileSystem.writeAsStringAsync(tmp, JSON.stringify(data, null, 2));
  await FileSystem.moveAsync({ from: tmp, to: path });
}

export async function readJSON<T>(path: string): Promise<T> {
  const content = await FileSystem.readAsStringAsync(path);
  return JSON.parse(content) as T;
}

