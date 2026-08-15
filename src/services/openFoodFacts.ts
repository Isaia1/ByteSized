import { ScannedProduct } from '../types';
import { barcodeVariants, extractBarcode, normalizeBarcode } from '../utils/barcode';
import { fillMissingNutrition, roundNutrition } from '../utils/nutritionEstimate';

const OFF_USER_AGENT = 'ByteSized/1.0 (nutrition tracker; Trinidad & Tobago)';
const OFF_FIELDS = [
  'product_name',
  'product_name_en',
  'generic_name',
  'brands',
  'nutriments',
].join(',');

interface OpenFoodFactsResponse {
  status: number;
  product?: {
    product_name?: string;
    product_name_en?: string;
    generic_name?: string;
    brands?: string;
    nutriments?: {
      'energy-kcal_100g'?: number;
      energy_100g?: number;
      proteins_100g?: number;
      carbohydrates_100g?: number;
      fat_100g?: number;
    };
  };
}

function extractCaloriesPer100g(
  nutriments: NonNullable<OpenFoodFactsResponse['product']>['nutriments'],
): number {
  if (!nutriments) {
    return 0;
  }

  if (nutriments['energy-kcal_100g']) {
    return nutriments['energy-kcal_100g'];
  }

  if (nutriments.energy_100g) {
    return Math.round(nutriments.energy_100g / 4.184);
  }

  return 0;
}

function productName(product: NonNullable<OpenFoodFactsResponse['product']>): string {
  const base =
    product.product_name?.trim() ||
    product.product_name_en?.trim() ||
    product.generic_name?.trim();
  const brand = product.brands?.split(',')[0]?.trim();

  if (base && brand && !base.toLowerCase().includes(brand.toLowerCase())) {
    return `${brand} ${base}`;
  }

  return base || brand || 'Unknown product';
}

async function fetchOpenFoodFacts(barcode: string): Promise<ScannedProduct | null> {
  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=${OFF_FIELDS}`,
    {
      headers: {
        Accept: 'application/json',
        'User-Agent': OFF_USER_AGENT,
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as OpenFoodFactsResponse;

  if (data.status !== 1 || !data.product) {
    return null;
  }

  const nutriments = data.product.nutriments ?? {};
  const hasNutrimentKeys = Object.keys(nutriments).length > 0;
  const name = productName(data.product);

  if (!hasNutrimentKeys && name === 'Unknown product') {
    return null;
  }

  const filled = fillMissingNutrition(
    {
      caloriesPer100g: hasNutrimentKeys ? extractCaloriesPer100g(nutriments) : undefined,
      proteinPer100g: nutriments.proteins_100g,
      carbsPer100g: nutriments.carbohydrates_100g,
      fatPer100g: nutriments.fat_100g,
    },
    name,
  );

  return {
    barcode: normalizeBarcode(barcode),
    name,
    caloriesPer100g: roundNutrition(filled.caloriesPer100g),
    proteinPer100g: roundNutrition(filled.proteinPer100g),
    carbsPer100g: roundNutrition(filled.carbsPer100g),
    fatPer100g: roundNutrition(filled.fatPer100g),
    source: 'openfoodfacts',
    nutritionComplete: true,
  };
}

interface UpcItemDbResponse {
  items?: { title?: string; brand?: string }[];
}

async function fetchUpcItemName(barcode: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(barcode)}`,
      { headers: { Accept: 'application/json' } },
    );
    if (!response.ok) return null;
    const data = (await response.json()) as UpcItemDbResponse;
    const item = data.items?.[0];
    if (!item?.title) return null;
    const brand = item.brand?.trim();
    const title = item.title.trim();
    if (brand && !title.toLowerCase().includes(brand.toLowerCase())) {
      return `${brand} ${title}`;
    }
    return title;
  } catch {
    return null;
  }
}

export async function fetchProductByBarcode(barcode: string): Promise<ScannedProduct | null> {
  const variants = [...new Set(barcodeVariants(barcode))];
  const results = await Promise.all(
    variants.map((variant) => fetchOpenFoodFacts(variant).catch(() => null)),
  );
  const match = results.find((product) => product !== null);
  if (match) {
    return { ...match, barcode: extractBarcode(barcode) || normalizeBarcode(barcode) };
  }
  return null;
}

export async function fetchProductNameByBarcode(barcode: string): Promise<string | null> {
  const variants = [...new Set(barcodeVariants(barcode))];
  const names = await Promise.all(variants.map((variant) => fetchUpcItemName(variant).catch(() => null)));
  return names.find((name) => name && !isPlaceholderProductName(name)) ?? null;
}

function isPlaceholderProductName(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return normalized === 'unknown product' || normalized.startsWith('pantry item');
}
