import { readProfile } from '../storage/profile';
import { readMealsContext } from '../storage/mealsContext';
import { readNutritionLog } from '../storage/nutritionLog';
import { readSelfCareContext } from '../storage/selfcareContext';
import { readSelfCareInventory } from '../storage/selfcareInventory';
import { readSelfCareLog } from '../storage/selfcareLog';
import { readOverallContext } from '../storage/overallContext';
import { getPendingForChat } from '../storage/pendingSuggestions';
import type { ChatType } from '../storage/types';
import { calculateTDEE } from './tdeeCalculator';

function getTodayInfo() {
  const now = new Date();
  const weekday = now.toLocaleDateString('en-GB', { weekday: 'long' });
  const isoDate = now.toISOString().split('T')[0];
  return { isoDate, weekday };
}

function isGymDay(profileGymDays: string[], weekday: string): boolean {
  const dayKey = weekday.toLowerCase();
  return profileGymDays.map((d) => d.toLowerCase()).includes(dayKey);
}

function buildMealsContextString(params: {
  profileJson: string;
  mealsContextJson: string;
  nutritionLogJson: string;
  pendingSuggestionsJson: string;
  todayLine: string;
}): string {
  const { todayLine, profileJson, mealsContextJson, nutritionLogJson, pendingSuggestionsJson } = params;

  return [
    '=== TODAY ===',
    todayLine,
    '',
    '=== PROFILE ===',
    profileJson,
    '',
    '=== MEALS CONTEXT ===',
    mealsContextJson,
    '',
    '=== NUTRITION LOG (LAST 7 DAYS) ===',
    nutritionLogJson,
    '',
    '=== PENDING SUGGESTIONS (MEALS) ===',
    pendingSuggestionsJson,
  ].join('\n');
}

export async function assembleMealsContext(): Promise<string> {
  const profile = await readProfile();
  const mealsCtx = await readMealsContext();
  const nutritionLog = await readNutritionLog();
  const pending = await getPendingForChat('meals');

  const { isoDate, weekday } = getTodayInfo();
  const { gym_days } = profile.fitness;
  const gymDay = isGymDay(gym_days, weekday);

  const tdee = calculateTDEE(profile);
  const targetCalories = gymDay ? tdee.gymDayCalories : tdee.restDayCalories;
  const targetProtein = tdee.proteinTargetG;

  const todayLine = `${weekday} · ${gymDay ? 'Gym Day' : 'Rest Day'} · ${isoDate} · Target: ${targetCalories} kcal / ${targetProtein}g protein`;

  const profileJson = JSON.stringify(profile, null, 2);
  const mealsContextJson = JSON.stringify(mealsCtx, null, 2);
  const nutritionLogJson = JSON.stringify(nutritionLog, null, 2);
  const pendingSuggestionsJson = JSON.stringify(pending, null, 2);

  return buildMealsContextString({
    profileJson,
    mealsContextJson,
    nutritionLogJson,
    pendingSuggestionsJson,
    todayLine,
  });
}

export async function assembleSelfCareContext(): Promise<string> {
  const profile = await readProfile();
  const selfcareCtx = await readSelfCareContext();
  const inventory = await readSelfCareInventory();
  const selfcareLog = await readSelfCareLog();
  const pending = await getPendingForChat('selfcare');

  const { isoDate, weekday } = getTodayInfo();
  const { gym_days } = profile.fitness;
  const gymDay = isGymDay(gym_days, weekday);

  const todayLine = `${weekday} · ${gymDay ? 'Gym Day' : 'Rest Day'} · ${isoDate}`;

  return [
    '=== TODAY ===',
    todayLine,
    '',
    '=== PROFILE ===',
    JSON.stringify(profile, null, 2),
    '',
    '=== SELF CARE CONTEXT ===',
    JSON.stringify(selfcareCtx, null, 2),
    '',
    '=== SELF CARE INVENTORY ===',
    JSON.stringify(inventory, null, 2),
    '',
    '=== SELF CARE LOG (LAST 7 DAYS) ===',
    JSON.stringify(selfcareLog, null, 2),
    '',
    '=== PENDING SUGGESTIONS (SELFCARE) ===',
    JSON.stringify(pending, null, 2),
  ].join('\n');
}

// assembled Overall
export async function assembleOverallContext(): Promise<string> {
  const profile = await readProfile();
  const overallCtx = await readOverallContext();
  const mealsCtx = await readMealsContext();
  const nutritionLog = await readNutritionLog();
  const selfcareCtx = await readSelfCareContext();
  const selfcareLog = await readSelfCareLog();
  const inventory = await readSelfCareInventory();
  const pending = await getPendingForChat('overall');

  const { isoDate, weekday } = getTodayInfo();
  const gymDay = isGymDay(profile.fitness.gym_days, weekday);
  const todayLine = `${weekday} · ${gymDay ? 'Gym Day' : 'Rest Day'} · ${isoDate}`;

  return [
    '=== TODAY ===',
    todayLine,
    '',
    '=== PROFILE / WEIGHT HISTORY ===',
    JSON.stringify(profile, null, 2),
    '',
    '=== OVERALL CONTEXT (Journey/Milestones/Observations) ===',
    JSON.stringify(overallCtx, null, 2),
    '',
    '=== MEALS ===',
    JSON.stringify(mealsCtx, null, 2),
    JSON.stringify(nutritionLog, null, 2),
    '',
    '=== SELF CARE ===',
    JSON.stringify(selfcareCtx, null, 2),
    JSON.stringify(inventory, null, 2),
    JSON.stringify(selfcareLog, null, 2),
    '',
    '=== PENDING SUGGESTIONS (OVERALL ALERTS) ===',
    JSON.stringify(pending, null, 2),
  ].join('\n');
}

