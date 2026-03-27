import { FILE_PATHS, ensureContextDir, readJSON, safeWriteJSON } from './fileSystem';
import type { SelfCareLog, SelfCareLogDay, SelfCareRoutineStatus } from './types';
import { readProfile } from './profile';

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function getTodayInfo() {
  const now = new Date();
  const weekday = now.toLocaleDateString('en-GB', { weekday: 'long' }).toLowerCase();
  const date = formatDate(now);
  return { date, weekday };
}

async function createSeedLog(): Promise<SelfCareLog> {
  const { date, weekday } = getTodayInfo();
  const profile = await readProfile().catch(() => null);
  const gymDays = profile?.fitness.gym_days ?? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayType: SelfCareLogDay['day_type'] = gymDays.includes(weekday) ? 'gym' : 'rest';

  return {
    days: [
      {
        date,
        day_type: dayType,
        skincare_morning: null,
        skincare_evening: null,
        actives_used: [],
        beard_done: false,
        shaved: false,
        notes: null,
      },
    ],
  };
}

async function ensureFileExists(): Promise<void> {
  await ensureContextDir();
  try {
    await readJSON<SelfCareLog>(FILE_PATHS.selfcareLog);
  } catch {
    const seed = await createSeedLog();
    await safeWriteJSON(FILE_PATHS.selfcareLog, seed);
  }
}

export async function readSelfCareLog(): Promise<SelfCareLog> {
  await ensureFileExists();
  return readJSON<SelfCareLog>(FILE_PATHS.selfcareLog);
}

export async function writeSelfCareLog(data: SelfCareLog): Promise<void> {
  await ensureContextDir();
  await safeWriteJSON(FILE_PATHS.selfcareLog, data);
}

function findTodayIndex(log: SelfCareLog, today: string): number {
  return log.days.findIndex((d) => d.date === today);
}

export async function rollLog(): Promise<void> {
  await ensureFileExists();
  const log = await readSelfCareLog();
  const { date, weekday } = getTodayInfo();

  const existingIndex = findTodayIndex(log, date);
  if (existingIndex !== -1) {
    return;
  }

  const profile = await readProfile().catch(() => null);
  const gymDays = profile?.fitness.gym_days ?? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayType: SelfCareLogDay['day_type'] = gymDays.includes(weekday) ? 'gym' : 'rest';

  const newDay: SelfCareLogDay = {
    date,
    day_type: dayType,
    skincare_morning: null,
    skincare_evening: null,
    actives_used: [],
    beard_done: false,
    shaved: false,
    notes: null,
  };

  const updatedDays = [...log.days, newDay];
  if (updatedDays.length > 7) {
    updatedDays.shift();
  }

  await safeWriteJSON(FILE_PATHS.selfcareLog, { days: updatedDays });
}

async function ensureTodayAndGet(): Promise<{ log: SelfCareLog; idx: number }> {
  await rollLog();
  const log = await readSelfCareLog();
  const { date } = getTodayInfo();
  const idx = findTodayIndex(log, date);
  return { log, idx };
}

export async function updateTodaySkincareMorning(status: SelfCareRoutineStatus): Promise<void> {
  const { log, idx } = await ensureTodayAndGet();
  if (idx === -1) return;
  log.days[idx].skincare_morning = status;
  await safeWriteJSON(FILE_PATHS.selfcareLog, log);
}

export async function updateTodaySkincareEvening(status: SelfCareRoutineStatus): Promise<void> {
  const { log, idx } = await ensureTodayAndGet();
  if (idx === -1) return;
  log.days[idx].skincare_evening = status;
  await safeWriteJSON(FILE_PATHS.selfcareLog, log);
}

export async function addActivesUsed(actives: string[]): Promise<void> {
  const { log, idx } = await ensureTodayAndGet();
  if (idx === -1) return;
  const existing = new Set(log.days[idx].actives_used);
  for (const a of actives) existing.add(a);
  log.days[idx].actives_used = Array.from(existing);
  await safeWriteJSON(FILE_PATHS.selfcareLog, log);
}

export async function setBeardDone(done: boolean): Promise<void> {
  const { log, idx } = await ensureTodayAndGet();
  if (idx === -1) return;
  log.days[idx].beard_done = done;
  await safeWriteJSON(FILE_PATHS.selfcareLog, log);
}

export async function setShaved(shaved: boolean): Promise<void> {
  const { log, idx } = await ensureTodayAndGet();
  if (idx === -1) return;
  log.days[idx].shaved = shaved;
  await safeWriteJSON(FILE_PATHS.selfcareLog, log);
}
