import * as FileSystem from 'expo-file-system/legacy';
import { FILE_PATHS, ensureContextDir, readJSON, safeWriteJSON } from './fileSystem';
import type { Profile } from './types';

const PROFILE_SEED: Profile = {
  personal: {
    age: 26,
    height_cm: 162,
    weight_kg: 71.0,
    weight_history: [
      {
        date: '2026-03-13',
        weight_kg: 71.0,
      },
    ],
    target_weight_kg: 66,
    living_situation: 'PG',
    wake_time: '07:30',
    sleep_time: '00:30',
    name: 'User',
  },
  fitness: {
    goal: 'fat loss with muscle retention',
    gym_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    gym_time: '09:00',
    activity_level: 'moderately_active',
  },
  notification_times: {
    morning_brief: '08:00',
    evening_checkin: '21:00',
    scheduler_recompute: '22:00',
  },
};

async function ensureFileExists(path: string, seedData: object): Promise<void> {
  await ensureContextDir();
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    await safeWriteJSON(path, seedData);
  }
}

export async function readProfile(): Promise<Profile> {
  await ensureFileExists(FILE_PATHS.profile, PROFILE_SEED);
  return readJSON<Profile>(FILE_PATHS.profile);
}

export async function updateField(dotPath: string, value: any): Promise<void> {
  const profile = await readProfile();
  const segments = dotPath.split('.');
  let current: any = profile;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const key = segments[i];
    if (current[key] === undefined) {
      current[key] = {};
    }
    current = current[key];
  }
  current[segments[segments.length - 1]] = value;
  await safeWriteJSON(FILE_PATHS.profile, profile);
}

export async function writeProfile(data: Profile): Promise<void> {
  await ensureContextDir();
  await safeWriteJSON(FILE_PATHS.profile, data);
}


