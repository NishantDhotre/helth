import * as FileSystem from 'expo-file-system';
import { FILE_PATHS, ensureContextDir, readJSON, safeWriteJSON } from './fileSystem';
import type { MealsContext } from './types';

const MEALS_CONTEXT_SEED: MealsContext = {
  nutrition_targets: {
    method: 'tdee_calculated',
    last_calculated: '2026-03-13',
    calories: 1847,
    protein_g: 132,
    calculation_note: 'TDEE: 71kg, 162cm, age 26, moderately active, fat loss -300 deficit',
  },
  food_sources: {
    pg_meals: {
      weekday_lunch: 'rice + dal + chicken or veg curry',
      weekday_dinner: 'rice + dal + chicken or veg',
      notes: 'chicken not always available, quality varies',
    },
    room_items: [
      { item: 'eggs', note: 'keep 6-8 at a time' },
      { item: 'cucumber', note: 'usually available' },
      { item: 'whey_protein', note: '1 scoop per day' },
    ],
    ordering_preferences: {
      platforms: ['Swiggy', 'Zomato'],
      usual_orders: [
        { item: 'chicken biryani', pattern: 'Saturday evenings' },
        { item: 'grilled chicken wrap', pattern: 'when craving something different' },
      ],
      avoid: ['heavy fried food on gym days'],
    },
    canteen_options: [],
  },
  meal_patterns: {
    learned: [],
  },
  food_item_macros: {
    '1_whole_egg': { kcal: 70, protein_g: 6 },
    '1_egg_white': { kcal: 17, protein_g: 3.6 },
    '1_scoop_whey': { kcal: 136, protein_g: 27 },
    '100g_chicken_breast': { kcal: 165, protein_g: 31 },
    '100g_cooked_rice': { kcal: 130, protein_g: 2.5 },
    '1_cup_dal': { kcal: 150, protein_g: 9 },
    '1_banana': { kcal: 90, protein_g: 1 },
    '1_cucumber': { kcal: 15, protein_g: 0.5 },
    '100g_paneer': { kcal: 265, protein_g: 18 },
    '200ml_whole_milk': { kcal: 124, protein_g: 6.4 },
  },
  constraints: {
    egg_whites_rule: 'always paired with min 1 whole egg',
    max_whole_eggs_breakfast: 4,
    rice_max_g: 100,
    alcohol_max_drinks: 2,
  },
};

async function ensureFileExists(): Promise<void> {
  await ensureContextDir();
  const info = await FileSystem.getInfoAsync(FILE_PATHS.mealsContext);
  if (!info.exists) {
    await safeWriteJSON(FILE_PATHS.mealsContext, MEALS_CONTEXT_SEED);
  }
}

export async function readMealsContext(): Promise<MealsContext> {
  await ensureFileExists();
  return readJSON<MealsContext>(FILE_PATHS.mealsContext);
}

export async function writeMealsContext(data: MealsContext): Promise<void> {
  await ensureContextDir();
  await safeWriteJSON(FILE_PATHS.mealsContext, data);
}

export async function updateMealsContext(dotPath: string, value: any): Promise<void> {
  const ctx = await readMealsContext();
  const segments = dotPath.split('.');
  let current: any = ctx;

  for (let i = 0; i < segments.length - 1; i += 1) {
    const key = segments[i];
    if (current[key] === undefined) {
      current[key] = {};
    }
    current = current[key];
  }

  current[segments[segments.length - 1]] = value;
  await safeWriteJSON(FILE_PATHS.mealsContext, ctx);
}

export async function addRoomItem(item: string, note: string): Promise<void> {
  const ctx = await readMealsContext();
  ctx.food_sources.room_items.push({ item, note });
  await safeWriteJSON(FILE_PATHS.mealsContext, ctx);
}

export async function addOrderingPattern(observation: string): Promise<void> {
  const ctx = await readMealsContext();
  ctx.food_sources.ordering_preferences.usual_orders.push({
    item: observation,
    pattern: observation,
  });
  await safeWriteJSON(FILE_PATHS.mealsContext, ctx);
}

export async function addMealPattern(observation: string): Promise<void> {
  const ctx = await readMealsContext();
  ctx.meal_patterns.learned.push({ observation });
  await safeWriteJSON(FILE_PATHS.mealsContext, ctx);
}

