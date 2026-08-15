/**
 * Color palette tuned for nutrition/wellness UX:
 * - Warm green-grays reduce glare vs pure white (lower eye strain)
 * - Sage greens signal health & calm without neon saturation
 * - Macro colors are distinguishable yet muted (no harsh primaries)
 */
export const colors = {
  background: '#F4F7F5',
  backgroundAlt: '#EBF0EC',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFCFB',

  text: '#1A2E26',
  textSecondary: '#5A6F65',
  textMuted: '#8A9B92',

  primary: '#2F5244',
  primaryLight: '#E3EDE8',
  primaryDark: '#243D33',

  accent: '#4A9B73',
  accentLight: '#DFF0E8',
  accentSoft: '#6BB892',

  protein: '#4A7FB5',
  proteinLight: '#E3EEF8',
  carbs: '#C4923A',
  carbsLight: '#F8F0E0',
  fat: '#C96B5A',
  fatLight: '#F8EAE7',

  calories: '#4A9B73',
  ringTrack: '#DDE5E0',

  border: '#D8E2DC',
  borderLight: '#E8EFEB',

  success: '#4A9B73',
  warning: '#C4923A',
  error: '#C96B5A',

  overlay: 'rgba(26, 46, 38, 0.45)',
  overlayLight: 'rgba(26, 46, 38, 0.12)',

  white: '#FFFFFF',
  black: '#000000',
  scannerFrame: '#6BB892',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const radii = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const typography = {
  display: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  heading: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 15, fontWeight: '500' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.4, textTransform: 'uppercase' as const },
};

export const shadows = {
  sm: {
    shadowColor: '#1A2E26',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A2E26',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1A2E26',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const mealColors: Record<string, { bg: string; accent: string }> = {
  breakfast: { bg: '#F8F0E0', accent: '#C4923A' },
  lunch: { bg: '#E3EDE8', accent: '#4A9B73' },
  dinner: { bg: '#E3EEF8', accent: '#4A7FB5' },
  snacks: { bg: '#F8EAE7', accent: '#C96B5A' },
};
