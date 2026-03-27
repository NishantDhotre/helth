import { FILE_PATHS, ensureContextDir, readJSON, safeWriteJSON } from './fileSystem';
import type { MealType, NutritionLog, NutritionLogDay } from './types';
import { readProfile } from './profile';

const DEFAULT_TARGET_CALORIES = 1847;
const DEFAULT_TARGET_PROTEIN_G = 132;

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function getTodayInfo() {
  const now = new Date();
  const weekday = now.toLocaleDateString('en-GB', { weekday: 'long' }).toLowerCase();
  const date = formatDate(now);
  return { date, weekday };
}

async function createSeedLog(): Promise<NutritionLog> {
  const { date, weekday } = getTodayInfo();
  const profile = await readProfile().catch(() => null);

  const gymDays = profile?.fitness.gym_days ?? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayType: NutritionLogDay['day_type'] = gymDays.includes(weekday) ? 'gym' : 'rest';

  const day: NutritionLogDay = {
    date,
    day_type: dayType,
    target_calories: DEFAULT_TARGET_CALORIES,
    target_protein_g: DEFAULT_TARGET_PROTEIN_G,
    meals: {
      breakfast: null,
      lunch: null,
      dinner: null,
      snack: null,
    },
    totals: {
      kcal: 0,
      protein_g: 0,
    },
    notes: null,
  };

  return { days: [day] };
}

async function ensureFileExists(): Promise<void> {
  await ensureContextDir();
  try {
    await readJSON<NutritionLog>(FILE_PATHS.nutritionLog);
  } catch {
    const seed = await createSeedLog();
    await safeWriteJSON(FILE_PATHS.nutritionLog, seed);
  }
}

export async function readNutritionLog(): Promise<NutritionLog> {
  await ensureFileExists();
  return readJSON<NutritionLog>(FILE_PATHS.nutritionLog);
}

export async function writeNutritionLog(data: NutritionLog): Promise<void> {
  await ensureContextDir();
  await safeWriteJSON(FILE_PATHS.nutritionLog, data);
}

function findTodayIndex(log: NutritionLog, today: string): number {
  return log.days.findIndex((d) => d.date === today);
}

export async function rollLog(): Promise<void> {
  await ensureFileExists();
  const log = await readNutritionLog();
  const { date, weekday } = getTodayInfo();

  const existingIndex = findTodayIndex(log, date);
  if (existingIndex !== -1) {
    return;
  }

  const last = log.days[log.days.length - 1];
  const profile = await readProfile().catch(() => null);
  const gymDays = profile?.fitness.gym_days ?? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayType: NutritionLogDay['day_type'] = gymDays.includes(weekday) ? 'gym' : 'rest';

  const newDay: NutritionLogDay = {
    date,
    day_type: dayType,
    target_calories: last?.target_calories ?? DEFAULT_TARGET_CALORIES,
    target_protein_g: last?.target_protein_g ?? DEFAULT_TARGET_PROTEIN_G,
    meals: {
      breakfast: null,
      lunch: null,
      dinner: null,
      snack: null,
    },
    totals: {
      kcal: 0,
      protein_g: 0,
    },
    notes: null,
  };

  const updatedDays = [...log.days, newDay];
  if (updatedDays.length > 7) {
    updatedDays.shift();
  }

  await safeWriteJSON(FILE_PATHS.nutritionLog, { days: updatedDays });
}

export async function addTodayMeal(
  mealType: MealType,
  description: string,
  kcal: number,
  proteinG: number,
): Promise<void> {
  await rollLog();
  const log = await readNutritionLog();
  const { date } = getTodayInfo();
  const idx = findTodayIndex(log, date);
  if (idx === -1) {
    return;
  }

  const day = log.days[idx];
  const existing = day.meals[mealType];

  const newDescription =
    existing && existing.description
      ? `${existing.description}; ${description}`
      : description;

  day.meals[mealType] = {
    description: newDescription,
    kcal: (existing?.kcal ?? 0) + kcal,
    protein_g: (existing?.protein_g ?? 0) + proteinG,
  };

  day.totals = {
    kcal: day.totals.kcal + kcal,
    protein_g: day.totals.protein_g + proteinG,
  };

  log.days[idx] = day;
  await safeWriteJSON(FILE_PATHS.nutritionLog, log);
}

export async function updateTodayNotes(notes: string): Promise<void> {
  await rollLog();
  const log = await readNutritionLog();
  const { date } = getTodayInfo();
  const idx = findTodayIndex(log, date);
  if (idx === -1) {
    return;
  }

  log.days[idx].notes = notes;
  await safeWriteJSON(FILE_PATHS.nutritionLog, log);
}

