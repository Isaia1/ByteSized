import AsyncStorage from '@react-native-async-storage/async-storage';
import { isPlaceholderProductName } from '../services/productLookup';
import { FoodItem, ScannedProduct, UserProfile } from '../types';
import { barcodeVariants } from './barcode';

const PROFILE_KEY = '@bytesized/profile';
const LOG_PREFIX = '@bytesized/log/';
const CUSTOM_PRODUCTS_KEY = '@bytesized/local-products';

export function getTodayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function loadProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as UserProfile;
}

function logKey(date: string): string {
  return `${LOG_PREFIX}${date}`;
}

export async function loadDailyLog(date: string = getTodayDateKey()): Promise<FoodItem[]> {
  const raw = await AsyncStorage.getItem(logKey(date));
  if (!raw) {
    return [];
  }

  return JSON.parse(raw) as FoodItem[];
}

export async function addFoodItem(
  item: FoodItem,
  date: string = getTodayDateKey(),
): Promise<FoodItem[]> {
  const existing = await loadDailyLog(date);
  const updated = [...existing, item];
  await AsyncStorage.setItem(logKey(date), JSON.stringify(updated));
  return updated;
}

export async function loadCustomProducts(): Promise<ScannedProduct[]> {
  const raw = await AsyncStorage.getItem(CUSTOM_PRODUCTS_KEY);
  if (!raw) {
    return [];
  }

  return JSON.parse(raw) as ScannedProduct[];
}

export async function findCustomProduct(barcode: string): Promise<ScannedProduct | null> {
  const products = await loadCustomProducts();
  const variants = new Set(barcodeVariants(barcode));

  const match =
    products.find(
      (product) =>
        !isPlaceholderProductName(product.name) &&
        barcodeVariants(product.barcode).some((code) => variants.has(code)),
    ) ?? null;

  return match;
}

export async function saveCustomProduct(product: ScannedProduct): Promise<void> {
  const products = await loadCustomProducts();
  const variants = new Set(barcodeVariants(product.barcode));
  const next = products.filter(
    (existing) => !barcodeVariants(existing.barcode).some((code) => variants.has(code)),
  );
  next.unshift({ ...product, source: 'saved', nutritionComplete: true });
  await AsyncStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(next));
}
