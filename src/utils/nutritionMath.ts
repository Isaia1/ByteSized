import {
  ActivityLevel,
  BiologicalSex,
  MacroTotals,
  MealCategory,
  UserProfile,
} from '../types';

/** Share of daily calories allocated to each meal. */
export const MEAL_CALORIE_SPLITS: Record<MealCategory, number> = {
  breakfast: 0.25,
  lunch: 0.35,
  dinner: 0.25,
  snacks: 0.15,
};

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/** Mifflin-St Jeor basal metabolic rate (kcal/day). */
export function calculateBMR(profile: UserProfile): number {
  const { weightKg, heightCm, age, sex } = profile;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;

  return sex === 'male' ? base + 5 : base - 161;
}

/** Total daily energy expenditure (kcal/day). */
export function calculateTDEE(profile: UserProfile): number {
  return calculateBMR(profile) * ACTIVITY_MULTIPLIERS[profile.activityLevel];
}

/** Daily macro targets using a 30/40/30 protein/carbs/fat calorie split. */
export function calculateMacroTargets(tdee: number): MacroTotals {
  return {
    calories: Math.round(tdee),
    protein: Math.round((tdee * 0.3) / 4),
    carbs: Math.round((tdee * 0.4) / 4),
    fat: Math.round((tdee * 0.3) / 9),
  };
}

/** Calorie target for a specific meal based on TDEE split. */
export function calculateMealCalorieTarget(tdee: number, meal: MealCategory): number {
  return tdee * MEAL_CALORIE_SPLITS[meal];
}

/** @deprecated Use calculateMealCalorieTarget with meal 'snacks'. */
export function calculateSnackCalorieTarget(tdee: number): number {
  return calculateMealCalorieTarget(tdee, 'snacks');
}

/** Recommended portion (grams) to hit a meal calorie target. */
export function calculateRecommendedPortionGrams(
  caloriesPer100g: number,
  mealCalorieTarget: number,
): number {
  if (caloriesPer100g <= 0) {
    return 250;
  }

  return Math.round((mealCalorieTarget / caloriesPer100g) * 100);
}

/** Scale per-100g macros to an actual portion size. */
export function scaleNutrientsForPortion(
  per100g: MacroTotals,
  portionGrams: number,
): MacroTotals {
  const factor = portionGrams / 100;

  return {
    calories: Math.round(per100g.calories * factor),
    protein: Math.round(per100g.protein * factor * 10) / 10,
    carbs: Math.round(per100g.carbs * factor * 10) / 10,
    fat: Math.round(per100g.fat * factor * 10) / 10,
  };
}

export function sumMacroTotals(items: { calories: number; protein: number; carbs: number; fat: number }[]): MacroTotals {
  return items.reduce(
    (totals, item) => ({
      calories: totals.calories + item.calories,
      protein: totals.protein + item.protein,
      carbs: totals.carbs + item.carbs,
      fat: totals.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}
