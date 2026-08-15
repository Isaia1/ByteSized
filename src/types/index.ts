export type BiologicalSex = 'male' | 'female';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export interface UserProfile {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: BiologicalSex;
  activityLevel: ActivityLevel;
}

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface FoodItem {
  id: string;
  barcode: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portionGrams: number;
  mealCategory: MealCategory;
  loggedAt: string;
}

export interface ScannedProduct {
  barcode: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  source?: 'openfoodfacts' | 'trinidad' | 'saved';
  nutritionComplete?: boolean;
}

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const MEAL_CATEGORIES: MealCategory[] = [
  'breakfast',
  'lunch',
  'dinner',
  'snacks',
];

export const MEAL_LABELS: Record<MealCategory, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
};

/** Main meals shown in the log-food picker. */
export const MAIN_MEALS: MealCategory[] = ['breakfast', 'lunch', 'dinner'];

export const MEAL_DESCRIPTIONS: Record<MealCategory, string> = {
  breakfast: 'Start your day — about 25% of daily calories',
  lunch: 'Midday fuel — about 35% of daily calories',
  dinner: 'Evening meal — about 25% of daily calories',
  snacks: 'Light bite — about 15% of daily calories',
};
