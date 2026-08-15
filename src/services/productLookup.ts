import {
  findLocalProduct,
  inferLocalBrand,
  toScannedProduct,
} from '../data/localProducts';
import { ScannedProduct } from '../types';
import { extractBarcode, isScannableCode, normalizeBarcode } from '../utils/barcode';
import { fillMissingNutrition, roundNutrition } from '../utils/nutritionEstimate';
import { findCustomProduct } from '../utils/storage';
import { fetchProductByBarcode, fetchProductNameByBarcode } from './openFoodFacts';

export interface PendingLocalProduct {
  barcode: string;
  suggestedName?: string;
  brandHint?: string;
  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
}

export function isPlaceholderProductName(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return (
    normalized === 'packaged food' ||
    normalized === 'unknown product' ||
    normalized.startsWith('pantry item') ||
    normalized.endsWith(' product')
  );
}

function withFilledNutrition(
  product: Pick<ScannedProduct, 'barcode' | 'name'> & Partial<ScannedProduct>,
  brandHint?: string,
): ScannedProduct {
  const filled = fillMissingNutrition(
    {
      caloriesPer100g: product.caloriesPer100g,
      proteinPer100g: product.proteinPer100g,
      carbsPer100g: product.carbsPer100g,
      fatPer100g: product.fatPer100g,
    },
    product.name,
    brandHint,
  );

  return {
    barcode: product.barcode,
    name: product.name,
    caloriesPer100g: roundNutrition(filled.caloriesPer100g),
    proteinPer100g: roundNutrition(filled.proteinPer100g),
    carbsPer100g: roundNutrition(filled.carbsPer100g),
    fatPer100g: roundNutrition(filled.fatPer100g),
    source: product.source ?? 'trinidad',
    nutritionComplete: true,
  };
}

/** Always returns a product with nutrition so the user can save a portion. */
export async function lookupProduct(rawScan: string, type?: string): Promise<ScannedProduct> {
  const barcode = extractBarcode(rawScan, type) || normalizeBarcode(rawScan) || rawScan.trim();
  const brandHint = inferLocalBrand(barcode);

  if (!isScannableCode(barcode) && !barcode) {
    return withFilledNutrition({
      barcode: 'unknown',
      name: 'Packaged food',
    });
  }

  const local = findLocalProduct(barcode);
  if (local) {
    return toScannedProduct(local, barcode);
  }

  const [remote, remoteName, saved] = await Promise.all([
    fetchProductByBarcode(barcode).catch(() => null),
    fetchProductNameByBarcode(barcode).catch(() => null),
    findCustomProduct(barcode).catch(() => null),
  ]);

  if (remote && !isPlaceholderProductName(remote.name)) {
    return withFilledNutrition({ ...remote, barcode }, brandHint);
  }

  if (remoteName && !isPlaceholderProductName(remoteName)) {
    return withFilledNutrition(
      {
        barcode,
        name: remoteName,
        source: brandHint ? 'trinidad' : 'openfoodfacts',
        caloriesPer100g: remote?.caloriesPer100g,
        proteinPer100g: remote?.proteinPer100g,
        carbsPer100g: remote?.carbsPer100g,
        fatPer100g: remote?.fatPer100g,
      },
      brandHint,
    );
  }

  if (saved && !isPlaceholderProductName(saved.name)) {
    return { ...saved, barcode };
  }

  const name = brandHint ? `${brandHint} item` : `Item ${barcode}`;

  return withFilledNutrition(
    {
      barcode,
      name,
      source: brandHint ? 'trinidad' : 'openfoodfacts',
      caloriesPer100g: remote?.caloriesPer100g,
      proteinPer100g: remote?.proteinPer100g,
      carbsPer100g: remote?.carbsPer100g,
      fatPer100g: remote?.fatPer100g,
    },
    brandHint,
  );
}
