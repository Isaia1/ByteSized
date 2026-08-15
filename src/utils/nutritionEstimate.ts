export interface NutritionEstimate {
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

const PACKAGED: NutritionEstimate = {
  caloriesPer100g: 250,
  proteinPer100g: 8,
  carbsPer100g: 30,
  fatPer100g: 10,
};

const PROFILES: { keys: string[]; nutrition: NutritionEstimate }[] = [
  { keys: ['purified drinking water', 'alkaline water', 'sparkling water', 'mineral water'], nutrition: { caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0 } },
  { keys: ['olive oil', 'canola', 'coconut oil', 'vegetable oil', 'cooking oil'], nutrition: { caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100 } },
  { keys: ['soy sauce', 'soya sauce', 'light soy', 'dark soy'], nutrition: { caloriesPer100g: 60, proteinPer100g: 6, carbsPer100g: 8, fatPer100g: 0 } },
  { keys: ['oyster sauce', 'hoisin', 'teriyaki'], nutrition: { caloriesPer100g: 120, proteinPer100g: 3, carbsPer100g: 24, fatPer100g: 1 } },
  { keys: ['chili garlic', 'sriracha', 'hot pepper sauce', 'pepper sauce', 'chili sauce'], nutrition: { caloriesPer100g: 90, proteinPer100g: 1, carbsPer100g: 18, fatPer100g: 1 } },
  { keys: ['chili oil', 'crispy chili'], nutrition: { caloriesPer100g: 590, proteinPer100g: 4, carbsPer100g: 10, fatPer100g: 60 } },
  { keys: ['mayonnaise', 'mayo'], nutrition: { caloriesPer100g: 680, proteinPer100g: 1, carbsPer100g: 2, fatPer100g: 75 } },
  { keys: ['peanut butter'], nutrition: { caloriesPer100g: 590, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50 } },
  { keys: ['ketchup'], nutrition: { caloriesPer100g: 110, proteinPer100g: 1, carbsPer100g: 26, fatPer100g: 0.1 } },
  { keys: ['mustard', 'vinegar', 'bitters'], nutrition: { caloriesPer100g: 20, proteinPer100g: 0, carbsPer100g: 4, fatPer100g: 0 } },
  { keys: ['bbq sauce', 'barbecue'], nutrition: { caloriesPer100g: 170, proteinPer100g: 0.5, carbsPer100g: 40, fatPer100g: 0.5 } },
  { keys: ['crix', 'cracker', 'dixee', 'biscuit'], nutrition: { caloriesPer100g: 430, proteinPer100g: 9, carbsPer100g: 70, fatPer100g: 12 } },
  { keys: ['cookie', 'nibbles', 'domino', 'jumbies'], nutrition: { caloriesPer100g: 480, proteinPer100g: 6, carbsPer100g: 68, fatPer100g: 20 } },
  { keys: ['chipster', 'zoomer', 'puff', 'tortilla', 'chips', 'crisp', 'cheeto', 'snack'], nutrition: { caloriesPer100g: 530, proteinPer100g: 6, carbsPer100g: 52, fatPer100g: 33 } },
  { keys: ['popcorn'], nutrition: { caloriesPer100g: 400, proteinPer100g: 8, carbsPer100g: 58, fatPer100g: 14 } },
  { keys: ['peanut', 'cashew', 'almond', 'pecan', 'walnut', 'mixed nuts', 'trail mix'], nutrition: { caloriesPer100g: 600, proteinPer100g: 18, carbsPer100g: 22, fatPer100g: 52 } },
  { keys: ['granola', 'cereal', 'oats', 'muesli'], nutrition: { caloriesPer100g: 430, proteinPer100g: 10, carbsPer100g: 68, fatPer100g: 12 } },
  { keys: ['bread', 'loaf', 'bun', 'muffin', 'cake'], nutrition: { caloriesPer100g: 280, proteinPer100g: 8, carbsPer100g: 50, fatPer100g: 5 } },
  { keys: ['indomie', 'maggi', 'nissin', 'koka', 'mama', 'noodle', 'ramen', 'instant'], nutrition: { caloriesPer100g: 450, proteinPer100g: 10, carbsPer100g: 64, fatPer100g: 17 } },
  { keys: ['pasta', 'penne', 'spaghetti', 'ravioli'], nutrition: { caloriesPer100g: 360, proteinPer100g: 12, carbsPer100g: 72, fatPer100g: 1.5 } },
  { keys: ['quinoa', 'rice'], nutrition: { caloriesPer100g: 360, proteinPer100g: 12, carbsPer100g: 64, fatPer100g: 5 } },
  { keys: ['tofu'], nutrition: { caloriesPer100g: 76, proteinPer100g: 8, carbsPer100g: 2, fatPer100g: 4.8 } },
  { keys: ['coconut milk'], nutrition: { caloriesPer100g: 180, proteinPer100g: 1.6, carbsPer100g: 3, fatPer100g: 18 } },
  { keys: ['milk', 'almond beverage', 'oat beverage', 'soy milk'], nutrition: { caloriesPer100g: 50, proteinPer100g: 3, carbsPer100g: 5, fatPer100g: 2 } },
  { keys: ['yogurt', 'yoghurt'], nutrition: { caloriesPer100g: 80, proteinPer100g: 8, carbsPer100g: 8, fatPer100g: 2 } },
  { keys: ['cheese', 'mozzarella', 'cheddar', 'havarti', 'muenster'], nutrition: { caloriesPer100g: 350, proteinPer100g: 22, carbsPer100g: 3, fatPer100g: 28 } },
  { keys: ['ice cream'], nutrition: { caloriesPer100g: 210, proteinPer100g: 4, carbsPer100g: 24, fatPer100g: 11 } },
  { keys: ['french fries', 'fries'], nutrition: { caloriesPer100g: 150, proteinPer100g: 2.4, carbsPer100g: 22, fatPer100g: 5 } },
  { keys: ['tuna', 'salmon', 'sardine'], nutrition: { caloriesPer100g: 130, proteinPer100g: 22, carbsPer100g: 0, fatPer100g: 4 } },
  { keys: ['soda', 'kola', 'soft drink', 'juice', 'orchard', 'fruta', 'chubby', 'solo'], nutrition: { caloriesPer100g: 42, proteinPer100g: 0, carbsPer100g: 11, fatPer100g: 0 } },
  { keys: ['curry', 'geera', 'seasoning', 'spice', 'pepper', 'thyme', 'saffron', 'chief'], nutrition: { caloriesPer100g: 300, proteinPer100g: 10, carbsPer100g: 50, fatPer100g: 8 } },
  { keys: ['baking soda', 'vinegar'], nutrition: { caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0 } },
  { keys: ['coffee'], nutrition: { caloriesPer100g: 2, proteinPer100g: 0.1, carbsPer100g: 0, fatPer100g: 0 } },
  { keys: ['nori', 'seaweed'], nutrition: { caloriesPer100g: 350, proteinPer100g: 30, carbsPer100g: 40, fatPer100g: 3 } },
  { keys: ["member's selection", 'pricesmart'], nutrition: PACKAGED },
  { keys: ['lee kum kee', 'pearl river', 'kikkoman', 'chinese grocery', 'hong kong grocery'], nutrition: { caloriesPer100g: 90, proteinPer100g: 4, carbsPer100g: 14, fatPer100g: 2 } },
  { keys: ['store-packed', 'xtra foods', 'price club', 'food basket'], nutrition: { caloriesPer100g: 180, proteinPer100g: 8, carbsPer100g: 20, fatPer100g: 7 } },
];

export function estimateNutrition(name?: string, brand?: string): NutritionEstimate {
  const text = `${brand ?? ''} ${name ?? ''}`.toLowerCase();

  for (const profile of PROFILES) {
    if (profile.keys.some((key) => text.includes(key))) {
      return profile.nutrition;
    }
  }

  return PACKAGED;
}

export function fillMissingNutrition(
  partial: Partial<NutritionEstimate>,
  name?: string,
  brand?: string,
): NutritionEstimate {
  const estimated = estimateNutrition(name, brand);
  return {
    caloriesPer100g: partial.caloriesPer100g ?? estimated.caloriesPer100g,
    proteinPer100g: partial.proteinPer100g ?? estimated.proteinPer100g,
    carbsPer100g: partial.carbsPer100g ?? estimated.carbsPer100g,
    fatPer100g: partial.fatPer100g ?? estimated.fatPer100g,
  };
}

export function roundNutrition(value: number): number {
  return Math.round(value * 10) / 10;
}
