import type { Profile } from '../storage/types';

export interface TdeeResult {
  tdee: number;
  gymDayCalories: number;
  restDayCalories: number;
  proteinTargetG: number;
}

export function calculateTDEE(profile: Profile): TdeeResult {
  const { weight_kg, height_cm, age } = profile.personal;

  const bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;

  const activityMultiplier = 1.55;
  const tdee = bmr * activityMultiplier;

  const gymDayCalories = tdee - 300;
  const restDayCalories = tdee - 400;
  const proteinTargetG = 1.8 * weight_kg;

  return {
    tdee: Math.round(tdee),
    gymDayCalories: Math.round(gymDayCalories),
    restDayCalories: Math.round(restDayCalories),
    proteinTargetG: Math.round(proteinTargetG),
  };
}

