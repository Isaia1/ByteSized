const LBS_PER_KG = 2.2046226218;

/** Convert kilograms to pounds (rounded to one decimal). */
export function kgToLbs(kg: number): number {
  return Math.round(kg * LBS_PER_KG * 10) / 10;
}

/** Convert pounds to kilograms. */
export function lbsToKg(lbs: number): number {
  return lbs / LBS_PER_KG;
}

/** Validate a weight entry in pounds. */
export function isValidWeightLbs(lbs: number): boolean {
  if (!Number.isFinite(lbs) || lbs <= 0) return false;
  const kg = lbsToKg(lbs);
  return kg >= 23 && kg <= 250;
}

/** Convert centimeters to feet and inches (rounded to nearest inch). */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return { feet, inches };
}

/** Convert feet and inches to centimeters. */
export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

/** Validate a feet/inches height entry. */
export function isValidFeetInches(feet: number, inches: number): boolean {
  if (!Number.isFinite(feet) || !Number.isFinite(inches)) return false;
  if (feet < 3 || feet > 8) return false;
  if (inches < 0 || inches > 11) return false;
  const cm = feetInchesToCm(feet, inches);
  return cm >= 120 && cm <= 250;
}
