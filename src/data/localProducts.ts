import { ScannedProduct } from '../types';
import { barcodeVariants, normalizeBarcode } from '../utils/barcode';
import { fillMissingNutrition, roundNutrition } from '../utils/nutritionEstimate';
import { RETAIL_BRAND_PREFIXES, RETAIL_PRODUCTS } from './retailProducts';

export interface LocalCatalogEntry {
  barcode: string;
  name: string;
  brand?: string;
  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
}

/** GS1 company prefixes used by Trinidad & Tobago manufacturers and retailers. */
const LOCAL_BRAND_PREFIXES: { prefix: string; brand: string }[] = [
  { prefix: '054315', brand: 'Bermudez' },
  { prefix: '0054315', brand: 'Bermudez' },
  { prefix: '098493', brand: 'Holiday Snacks' },
  { prefix: '0098493', brand: 'Holiday Snacks' },
  { prefix: '098483', brand: 'Kiss Baking Company' },
  { prefix: '0098483', brand: 'Kiss Baking Company' },
  { prefix: '040032', brand: 'Sunshine Snacks' },
  { prefix: '0040032', brand: 'Sunshine Snacks' },
  { prefix: '036494', brand: "Matouk's" },
  { prefix: '0036494', brand: "Matouk's" },
  { prefix: '048817', brand: 'Chief' },
  { prefix: '0048817', brand: 'Chief' },
  { prefix: '075496', brand: 'Angostura' },
  { prefix: '0075496', brand: 'Angostura' },
  { prefix: '689784', brand: 'Blue Waters' },
  { prefix: '0689784', brand: 'Blue Waters' },
  { prefix: '018871', brand: 'Nestlé Trinidad' },
  { prefix: '0018871', brand: 'Nestlé Trinidad' },
  { prefix: '033613', brand: 'Fernandes' },
  { prefix: '0033613', brand: 'Fernandes' },
  { prefix: '210093', brand: 'Massy Stores' },
  { prefix: '0210093', brand: 'Massy Stores' },
  ...RETAIL_BRAND_PREFIXES,
].sort((a, b) => b.prefix.length - a.prefix.length);

/**
 * Trinidad-made and locally packed foods. Nutrition is per 100g from labels /
 * Open Food Facts where available. Missing macros are filled from typical values
 * for that food type so a scan can still recommend a portion.
 */
const LOCAL_PRODUCTS: LocalCatalogEntry[] = [
  // Bermudez
  { barcode: '0054315012173', name: 'Crix Multi Grain Crackers', brand: 'Bermudez', caloriesPer100g: 428.6, proteinPer100g: 10.7, carbsPer100g: 67.9, fatPer100g: 14.3 },
  { barcode: '0054315012166', name: 'Crix Wheat Crackers', brand: 'Bermudez' },
  { barcode: '0054315172198', name: 'Crix Jalapeño', brand: 'Bermudez', caloriesPer100g: 480, proteinPer100g: 8, carbsPer100g: 60, fatPer100g: 24 },
  { barcode: '0054315031044', name: 'Dixee Cheese Sandwiches', brand: 'Bermudez', caloriesPer100g: 510.2 },
  { barcode: '0054315230997', name: 'Dixee Sandwiches Peanut Butter', brand: 'Bermudez', caloriesPer100g: 270, proteinPer100g: 8, carbsPer100g: 31, fatPer100g: 14 },
  { barcode: '0054315431233', name: 'Dixee Sandwiches Guava', brand: 'Bermudez', caloriesPer100g: 490.9, proteinPer100g: 5.5, carbsPer100g: 65.5, fatPer100g: 21.8 },
  { barcode: '54312913', name: 'Dixee Crackers Cheese & Herb', brand: 'Bermudez', caloriesPer100g: 451.6 },
  { barcode: '0054315112842', name: 'Domino Dulce De Leche Cream Cookies', brand: 'Bermudez', caloriesPer100g: 490.9, proteinPer100g: 5.5, carbsPer100g: 69.1, fatPer100g: 21.8 },
  { barcode: '0054315829290', name: 'Nibbles Oatmeal & Raisin', brand: 'Bermudez', caloriesPer100g: 466.7 },
  { barcode: '0054315012708', name: 'Wheat Crisps with Wheat Germ', brand: 'Bermudez' },
  { barcode: '0054315031372', name: 'Dixee', brand: 'Bermudez' },
  { barcode: '0054315208132', name: 'Jumbies Animal Crackers', brand: 'Bermudez' },

  // Holiday Snacks
  { barcode: '0098493452000', name: 'Tortillaz Spicy Cheese', brand: 'Holiday Snacks', caloriesPer100g: 526.3, proteinPer100g: 7.9, carbsPer100g: 60.5, fatPer100g: 28.9 },
  { barcode: '0098493644382', name: 'Spicy Cheese Puffs', brand: 'Holiday Snacks', caloriesPer100g: 600, proteinPer100g: 5, carbsPer100g: 40, fatPer100g: 45 },
  { barcode: '0098493041235', name: 'Grainz', brand: 'Holiday Snacks', caloriesPer100g: 150, proteinPer100g: 2, carbsPer100g: 18, fatPer100g: 9 },

  // Kiss Baking Company
  { barcode: '0098483020912', name: 'Whole Grain Loaf with Rolled Oats', brand: 'Kiss Baking Company', caloriesPer100g: 241, proteinPer100g: 12.8, carbsPer100g: 46.5, fatPer100g: 3.2 },
  { barcode: '0098483020158', name: 'Bread Buns', brand: 'Kiss Baking Company', caloriesPer100g: 285.7, proteinPer100g: 11.9, carbsPer100g: 52.4, fatPer100g: 4.8 },
  { barcode: '0098483050216', name: 'Pumpkin Spice Cake', brand: 'Kiss Baking Company', caloriesPer100g: 416.7, proteinPer100g: 5.6, carbsPer100g: 45.8, fatPer100g: 25 },
  { barcode: '0098483011545', name: 'Banana Chocolate Chip Muffin', brand: 'Kiss Baking Company', caloriesPer100g: 400, proteinPer100g: 5, carbsPer100g: 50, fatPer100g: 20 },

  // Sunshine Snacks (Trinidad prefix 040032)
  { barcode: '0040032123513', name: 'Crunchy Cheese Flavoured Snack', brand: 'Sunshine Snacks', caloriesPer100g: 523.8, proteinPer100g: 4.8, carbsPer100g: 52.4, fatPer100g: 31 },
  { barcode: '0040032100064', name: 'Honey Roasted Peanuts', brand: 'Sunshine Snacks', caloriesPer100g: 600, proteinPer100g: 23.3, carbsPer100g: 26.7, fatPer100g: 43.3 },
  { barcode: '0040032140015', name: 'Caramel Crunch Popcorn', brand: 'Sunshine Snacks', caloriesPer100g: 413.8, proteinPer100g: 6.9, carbsPer100g: 75.9, fatPer100g: 6.9 },
  { barcode: '0040032123834', name: 'Zoomers', brand: 'Sunshine Snacks', caloriesPer100g: 593.8, proteinPer100g: 6.3, carbsPer100g: 46.9, fatPer100g: 40.6 },
  { barcode: '0040032310258', name: 'Granola Whole Grain Oats', brand: 'Sunshine Snacks', caloriesPer100g: 450, proteinPer100g: 10, carbsPer100g: 72.5, fatPer100g: 15 },
  { barcode: '0040032100088', name: 'Fruit and Nut', brand: 'Sunshine Snacks', caloriesPer100g: 566.7, proteinPer100g: 16.7, carbsPer100g: 36.7, fatPer100g: 36.7 },
  { barcode: '0040032121434', name: 'Coconut Crunch Popcorn', brand: 'Sunshine Snacks', caloriesPer100g: 413.8, proteinPer100g: 6.9, carbsPer100g: 72.4, fatPer100g: 9.5 },
  { barcode: '0040032125791', name: 'Olé Extreme Nacho Craze', brand: 'Sunshine Snacks', caloriesPer100g: 511.6, proteinPer100g: 7, carbsPer100g: 58.1, fatPer100g: 25.6 },
  { barcode: '0040032131228', name: 'Chipsters', brand: 'Sunshine Snacks', caloriesPer100g: 533.3, proteinPer100g: 6.7, carbsPer100g: 50, fatPer100g: 33.3 },
  { barcode: '0040032210060', name: 'Ripples Solar', brand: 'Sunshine Snacks', caloriesPer100g: 514.3, proteinPer100g: 5.7, carbsPer100g: 51.4, fatPer100g: 34.3 },
  { barcode: '0040032155255', name: 'Sun Mix Deluxe Medley', brand: 'Sunshine Snacks', caloriesPer100g: 312.5, proteinPer100g: 10.4, carbsPer100g: 12.5, fatPer100g: 25 },
  { barcode: '0040032100187', name: 'Sun Mix Fruit Fest', brand: 'Sunshine Snacks' },
  { barcode: '0040032126576', name: 'Cornados Crunchy Corn Cones Cheddar Cheese', brand: 'Sunshine Snacks' },
  { barcode: '0040032302017', name: 'Feel Good Multigrain Flakes', brand: 'Sunshine Snacks' },
  { barcode: '0040032306084', name: 'Froot Ooos', brand: 'Sunshine Snacks' },

  // Matouk's / Mabel's
  { barcode: '0036494020323', name: 'Hot Pepper Sauce', brand: "Matouk's", caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0 },
  { barcode: '0036494128531', name: 'Eggless Mayo', brand: "Matouk's", caloriesPer100g: 461.5, proteinPer100g: 0, carbsPer100g: 23.1, fatPer100g: 38.5 },
  { barcode: '0036494022433', name: 'Spaghetti Sauce Zesty', brand: "Matouk's", caloriesPer100g: 88, proteinPer100g: 2.4, carbsPer100g: 9.6, fatPer100g: 4.8 },
  { barcode: '0036494023041', name: 'Pure White Vinegar', brand: "Matouk's", caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0 },
  { barcode: '0036494028589', name: 'Real Mayonnaise', brand: "Matouk's" },
  { barcode: '0036494029241', name: 'Peanut Butter', brand: "Matouk's" },
  { barcode: '0036494069247', name: 'Peanut Butter', brand: "Mabel's" },
  { barcode: '0036494189723', name: 'Prepared Mustard', brand: "Mabel's" },
  { barcode: '0036494062057', name: 'Ketchup', brand: "Mabel's" },

  // Chief Brand Products
  { barcode: '0048817000042', name: 'Curry Powder', brand: 'Chief' },
  { barcode: '0048817001827', name: 'Whole Geera', brand: 'Chief' },
  { barcode: '0048817000318', name: 'Baking Soda', brand: 'Chief' },
  { barcode: '0048817008260', name: 'Seafood Seasoning', brand: 'Chief' },
  { barcode: '0048817001476', name: 'Fish Seasoning', brand: 'Chief' },
  { barcode: '0048817000226', name: 'Saffron Powder', brand: 'Chief' },
  { barcode: '0048817000370', name: 'Pure Ground Black Pepper', brand: 'Chief' },
  { barcode: '0048817012946', name: 'Pumpkin Spice', brand: 'Chief' },
  { barcode: '0048817011888', name: 'Whole Thyme', brand: 'Chief' },
  { barcode: '0048817012625', name: 'Garlic and Parsley', brand: 'Chief' },
  { barcode: '0048817000394', name: 'Freshly Ground Premium Coffee', brand: 'Chief' },
  { barcode: '7460123439706', name: 'Flavour D Pot', brand: 'Chief' },

  // Angostura
  { barcode: '0075496002005', name: 'Aromatic Bitters', brand: 'Angostura' },
  { barcode: '0075496001008', name: 'Aromatic Bitters', brand: 'Angostura' },
  { barcode: '0075496331143', name: 'Orange Bitters', brand: 'Angostura' },
  { barcode: '0075496332560', name: 'Orange Bitters', brand: 'Angostura' },
  { barcode: '0075496002753', name: 'Chill Lemon and Lime', brand: 'Angostura', caloriesPer100g: 47.3, proteinPer100g: 0, carbsPer100g: 10.9, fatPer100g: 0.2 },
  { barcode: '0075496333048', name: 'Chill Sorrel and Bitters', brand: 'Angostura', caloriesPer100g: 43.6, proteinPer100g: 0, carbsPer100g: 10.9, fatPer100g: 0 },

  // Blue Waters / Fernandes / Nestlé Trinidad
  { barcode: '0689784904102', name: 'Alkaline Water', brand: 'Blue Waters', caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0 },
  { barcode: '0033613029267', name: 'Kola Champion', brand: 'Fernandes', caloriesPer100g: 70, proteinPer100g: 0, carbsPer100g: 18, fatPer100g: 0 },
  { barcode: '0033613340782', name: 'Orange Carrot Juice Drink', brand: 'Fruta', caloriesPer100g: 32, proteinPer100g: 0.4, carbsPer100g: 7.6, fatPer100g: 0 },
  { barcode: '0018871572007', name: 'Full Cream Milk', brand: 'Nestlé Trinidad', caloriesPer100g: 60, proteinPer100g: 3, carbsPer100g: 5.7, fatPer100g: 3.2 },
  { barcode: '0018871577002', name: 'Svelty Skimmed Milk', brand: 'Nestlé Trinidad', caloriesPer100g: 42, proteinPer100g: 3.3, carbsPer100g: 5.8, fatPer100g: 0.5 },
  { barcode: '0018871571000', name: 'Low Fat Milk', brand: 'Nestlé Trinidad', caloriesPer100g: 46, proteinPer100g: 2.6, carbsPer100g: 4.8, fatPer100g: 1.5 },
  { barcode: '0018871574001', name: 'Omega 3:6 Low Fat Milk', brand: 'Nestlé Trinidad' },
  { barcode: '0018871042005', name: 'Orange Drink', brand: 'Orchard', caloriesPer100g: 19, proteinPer100g: 0.2, carbsPer100g: 4.7, fatPer100g: 0 },
  { barcode: '0018871137008', name: 'Orchard Apple Cherry', brand: 'Orchard' },

  // Massy in-store
  { barcode: '0210093015007', name: 'Chicken Paste', brand: 'Massy Stores' },

  ...RETAIL_PRODUCTS,
];

const LOCAL_INDEX = new Map<string, LocalCatalogEntry>();

for (const product of LOCAL_PRODUCTS) {
  for (const variant of barcodeVariants(product.barcode)) {
    if (!LOCAL_INDEX.has(variant)) {
      LOCAL_INDEX.set(variant, product);
    }
  }
}

export function findLocalProduct(barcode: string): LocalCatalogEntry | null {
  for (const variant of barcodeVariants(barcode)) {
    const match = LOCAL_INDEX.get(variant);
    if (match) return match;
  }
  return null;
}

export function inferLocalBrand(barcode: string): string | undefined {
  const digits = normalizeBarcode(barcode);
  const padded = digits.padStart(13, '0');

  for (const { prefix, brand } of LOCAL_BRAND_PREFIXES) {
    if (prefix.length < 4) continue;
    if (
      digits.startsWith(prefix) ||
      padded.startsWith(prefix) ||
      padded.startsWith(`0${prefix}`)
    ) {
      return brand;
    }
  }

  return undefined;
}

export function hasCompleteNutrition(entry: {
  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
}): boolean {
  return (
    typeof entry.caloriesPer100g === 'number' &&
    typeof entry.proteinPer100g === 'number' &&
    typeof entry.carbsPer100g === 'number' &&
    typeof entry.fatPer100g === 'number'
  );
}

export function toScannedProduct(
  entry: LocalCatalogEntry,
  barcode: string,
  source: ScannedProduct['source'] = 'trinidad',
): ScannedProduct {
  const name = entry.brand ? `${entry.brand} ${entry.name}` : entry.name;
  const filled = fillMissingNutrition(
    {
      caloriesPer100g: entry.caloriesPer100g,
      proteinPer100g: entry.proteinPer100g,
      carbsPer100g: entry.carbsPer100g,
      fatPer100g: entry.fatPer100g,
    },
    entry.name,
    entry.brand,
  );

  return {
    barcode: normalizeBarcode(barcode) || entry.barcode,
    name,
    caloriesPer100g: roundNutrition(filled.caloriesPer100g),
    proteinPer100g: roundNutrition(filled.proteinPer100g),
    carbsPer100g: roundNutrition(filled.carbsPer100g),
    fatPer100g: roundNutrition(filled.fatPer100g),
    source,
    nutritionComplete: true,
  };
}
