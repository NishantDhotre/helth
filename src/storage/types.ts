export interface WeightEntry {
  date: string;
  weight_kg: number;
}

export interface PersonalInfo {
  age: number;
  height_cm: number;
  weight_kg: number;
  weight_history: WeightEntry[];
  target_weight_kg: number;
  living_situation: string;
  wake_time: string;
  sleep_time: string;
}

export interface FitnessInfo {
  goal: string;
  gym_days: string[];
  gym_time: string;
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'super_active';
}

export interface NotificationTimes {
  morning_brief: string;
  evening_checkin: string;
  scheduler_recompute: string;
}

export interface Profile {
  personal: PersonalInfo;
  fitness: FitnessInfo;
  notification_times: NotificationTimes;
}

export interface FoodSourceRoomItem {
  item: string;
  note: string;
}

export interface FoodSourceOrderingPreference {
  item: string;
  pattern: string;
}

export interface MealsContextNutritionTargets {
  method: string;
  last_calculated: string;
  calories: number;
  protein_g: number;
  calculation_note: string;
}

export interface MealsContextFoodSources {
  pg_meals: {
    weekday_lunch: string;
    weekday_dinner: string;
    notes: string;
  };
  room_items: FoodSourceRoomItem[];
  ordering_preferences: {
    platforms: string[];
    usual_orders: FoodSourceOrderingPreference[];
    avoid: string[];
  };
  canteen_options: string[];
}

export interface MealsContextMealPattern {
  observation: string;
  confidence?: string;
  since?: string;
}

export interface MealsContext {
  nutrition_targets: MealsContextNutritionTargets;
  food_sources: MealsContextFoodSources;
  meal_patterns: {
    learned: MealsContextMealPattern[];
  };
  food_item_macros: Record<
    string,
    {
      kcal: number;
      protein_g: number;
    }
  >;
  constraints: {
    egg_whites_rule: string;
    max_whole_eggs_breakfast: number;
    rice_max_g: number;
    alcohol_max_drinks: number;
  };
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealEntry {
  description: string | null;
  kcal: number;
  protein_g: number;
}

export interface NutritionLogDay {
  date: string;
  day_type: 'gym' | 'rest' | string;
  target_calories: number;
  target_protein_g: number;
  meals: Record<MealType, MealEntry | null>;
  totals: {
    kcal: number;
    protein_g: number;
  };
  notes: string | null;
}

export interface NutritionLog {
  days: NutritionLogDay[];
}

export type ChatType = 'meals' | 'selfcare' | 'overall';

export type PendingSuggestionStatus = 'pending' | 'acknowledged' | 'implemented';

export interface Suggestion {
  id: string;
  created_date: string;
  created_by: 'overall';
  target_chat: ChatType;
  suggestion: string;
  context: string;
  status: PendingSuggestionStatus;
}

export interface PendingSuggestions {
  suggestions: Suggestion[];
}

// ─── Self Care Types ───

export interface SelfCareRoutineStep {
  step: string;
  product_key: string;
  note?: string;
  critical?: boolean;
}

export interface SelfCareWeeklyActive {
  task: string;
  day?: string;
  days?: string[];
  time: string;
  product_key?: string;
  product_keys?: string[];
  gap_after_shaving_hrs?: number;
  gap_after_dermaroll_hrs?: number;
  gap_before_shaving_hrs?: number;
  no_actives_after_hrs?: number;
  cannot_combine_with?: string;
  advance_warning_hrs?: number;
  advance_warning_text?: string;
  note?: string;
}

export interface SelfCareConstraints {
  never_same_night: string[];
  post_shave_blackout_hrs: number;
  post_dermaroll_blackout_hrs: number;
  shaving_day: string;
  last_shave_date: string | null;
  last_dermaroll_date: string | null;
}

export interface SelfCarePattern {
  observation: string;
  confidence?: string;
}

export interface SelfCareContext {
  skin: {
    type: string;
    notes: string;
  };
  routine: {
    morning: SelfCareRoutineStep[];
    evening: SelfCareRoutineStep[];
  };
  weekly_actives: SelfCareWeeklyActive[];
  constraints: SelfCareConstraints;
  patterns: {
    learned: SelfCarePattern[];
  };
}

export interface SelfCareInventoryItem {
  display_name: string;
  in_stock: boolean;
}

export interface SelfCareInventory {
  last_updated: string;
  items: Record<string, SelfCareInventoryItem>;
}

export type SelfCareRoutineStatus = 'completed' | 'skipped' | 'partial';

export interface SelfCareLogDay {
  date: string;
  day_type: 'gym' | 'rest' | string;
  skincare_morning: SelfCareRoutineStatus | null;
  skincare_evening: SelfCareRoutineStatus | null;
  actives_used: string[];
  beard_done: boolean;
  shaved: boolean;
  notes: string | null;
}

export interface SelfCareLog {
  days: SelfCareLogDay[];
}

