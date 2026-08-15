import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import {
  RouteProp,
  useFocusEffect,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddLocalProductForm } from '../components/AddLocalProductForm';
import { Card } from '../components/Card';
import { MealPicker } from '../components/MealPicker';
import { Screen } from '../components/Screen';
import { useScreenLayout } from '../constants/layout';
import { colors, mealColors, radii, spacing, typography } from '../constants/theme';
import { RootTabParamList } from '../navigation/AppNavigator';
import { lookupProduct } from '../services/productLookup';
import { MEAL_LABELS, MealCategory, ScannedProduct } from '../types';
import { extractBarcode, isScannableCode, normalizeBarcode } from '../utils/barcode';
import {
  calculateMealCalorieTarget,
  calculateRecommendedPortionGrams,
  calculateTDEE,
  MEAL_CALORIE_SPLITS,
  scaleNutrientsForPortion,
} from '../utils/nutritionMath';
import { addFoodItem, loadProfile, saveCustomProduct } from '../utils/storage';

type ScannerRoute = RouteProp<RootTabParamList, 'Scanner'>;
type TabNav = BottomTabNavigationProp<RootTabParamList>;

export function ScannerScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const navigation = useNavigation<TabNav>();
  const route = useRoute<ScannerRoute>();
  const { scrollContent, width } = useScreenLayout();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [editingNutrition, setEditingNutrition] = useState(false);
  const [tdee, setTdee] = useState<number | null>(null);
  const [mealCategory, setMealCategory] = useState<MealCategory | null>(null);
  const [logging, setLogging] = useState(false);
  const scanGeneration = useRef(0);

  const scanFrameSize = Math.min(width * 0.84, 320);

  useFocusEffect(
    useCallback(() => {
      const paramMeal = route.params?.meal;
      if (paramMeal) {
        setMealCategory(paramMeal);
        setProduct(null);
        setEditingNutrition(false);
        setScanned(false);
        navigation.setParams({ meal: undefined });
      }
    }, [route.params?.meal, navigation]),
  );

  useEffect(() => {
    loadProfile().then((profile) => {
      if (profile) {
        setTdee(calculateTDEE(profile));
      }
    });
  }, []);

  const mealTarget = useMemo(() => {
    if (!tdee || !mealCategory) return null;
    return calculateMealCalorieTarget(tdee, mealCategory);
  }, [tdee, mealCategory]);

  const mealPercent = mealCategory ? Math.round(MEAL_CALORIE_SPLITS[mealCategory] * 100) : 0;

  const recommendedGrams = useMemo(() => {
    if (!product || !mealTarget) return null;
    return calculateRecommendedPortionGrams(product.caloriesPer100g, mealTarget);
  }, [product, mealTarget]);

  const portionNutrients = useMemo(() => {
    if (!product || !recommendedGrams) return null;
    return scaleNutrientsForPortion(
      {
        calories: product.caloriesPer100g,
        protein: product.proteinPer100g,
        carbs: product.carbsPer100g,
        fat: product.fatPer100g,
      },
      recommendedGrams,
    );
  }, [product, recommendedGrams]);

  const handleBarcodeScanned = useCallback(
    async ({ data, type }: { data: string; type?: string }) => {
      if (scanned || loading) return;

      const code = extractBarcode(data, type) || normalizeBarcode(data);
      if (!isScannableCode(code)) {
        return;
      }

      setScanned(true);
      setLoading(true);
      const generation = ++scanGeneration.current;

      try {
        const result = await lookupProduct(data, type);
        if (generation !== scanGeneration.current) return;
        setProduct(result);
      } catch {
        if (generation !== scanGeneration.current) return;
        const fallback = await lookupProduct(code, type);
        if (generation !== scanGeneration.current) return;
        setProduct(fallback);
      } finally {
        if (generation === scanGeneration.current) {
          setLoading(false);
        }
      }
    },
    [scanned, loading],
  );

  const handleSelectMeal = (meal: MealCategory) => {
    setMealCategory(meal);
    setProduct(null);
    setEditingNutrition(false);
    setScanned(false);
  };

  const handleChangeMeal = () => {
    setMealCategory(null);
    setProduct(null);
    setEditingNutrition(false);
    setScanned(false);
  };

  const resetScan = () => {
    scanGeneration.current += 1;
    setScanned(false);
    setLoading(false);
    setProduct(null);
    setEditingNutrition(false);
  };

  const handleSaveLocalProduct = async (saved: ScannedProduct) => {
    await saveCustomProduct(saved);
    setEditingNutrition(false);
    setProduct(saved);
  };

  const handleLogMeal = async () => {
    if (!product || !recommendedGrams || !portionNutrients || !mealCategory) {
      Alert.alert('Missing data', 'Scan a product and complete your profile first.');
      return;
    }

    setLogging(true);
    try {
      await addFoodItem({
        id: `${Date.now()}-${product.barcode}`,
        barcode: product.barcode,
        name: product.name,
        calories: portionNutrients.calories,
        protein: portionNutrients.protein,
        carbs: portionNutrients.carbs,
        fat: portionNutrients.fat,
        portionGrams: recommendedGrams,
        mealCategory,
        loggedAt: new Date().toISOString(),
      });

      await saveCustomProduct(product);

      Alert.alert('Logged', `${product.name} added to ${MEAL_LABELS[mealCategory]}.`);
      handleChangeMeal();
    } finally {
      setLogging(false);
    }
  };

  if (!permission) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.accent} size="large" />
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen style={styles.centered}>
        <Text style={styles.permissionText}>Camera access is required to scan barcodes.</Text>
        <Pressable style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>Grant permission</Text>
        </Pressable>
      </Screen>
    );
  }

  // Step 1: Pick a meal
  if (!mealCategory) {
    return (
      <Screen>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <MealPicker onSelect={handleSelectMeal} includeSnacks />
        </ScrollView>
      </Screen>
    );
  }

  const mealStyle = mealColors[mealCategory];

  if (editingNutrition && product) {
    return (
      <AddLocalProductForm
        pending={{
          barcode: product.barcode,
          suggestedName: product.name,
          caloriesPer100g: product.caloriesPer100g,
          proteinPer100g: product.proteinPer100g,
          carbsPer100g: product.carbsPer100g,
          fatPer100g: product.fatPer100g,
        }}
        onSave={handleSaveLocalProduct}
        onCancel={() => setEditingNutrition(false)}
      />
    );
  }

  // Step 3: Scan results
  if (product) {
    return (
      <Screen style={styles.containerLight}>
        <ScrollView
          style={styles.resultScroll}
          contentContainerStyle={scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.mealBadge, { backgroundColor: mealStyle.bg }]}>
            <Text style={[styles.mealBadgeText, { color: mealStyle.accent }]}>
              {MEAL_LABELS[mealCategory]}
            </Text>
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.barcode}>Barcode · {product.barcode}</Text>
          {product.source === 'trinidad' || product.source === 'saved' ? (
            <Text style={styles.localSource}>
              {product.source === 'saved' ? 'Saved on this phone' : 'Trinidad & Tobago catalog'}
            </Text>
          ) : (
            <View style={styles.sourceSpacer} />
          )}

          <Card variant="elevated" style={styles.card}>
            <Text style={styles.cardTitle}>Per 100g</Text>
            <Text style={styles.cardLine}>{product.caloriesPer100g} kcal</Text>
            <View style={styles.macroRow}>
              <MacroTag label="Protein" value={`${product.proteinPer100g}g`} color={colors.protein} />
              <MacroTag label="Carbs" value={`${product.carbsPer100g}g`} color={colors.carbs} />
              <MacroTag label="Fat" value={`${product.fatPer100g}g`} color={colors.fat} />
            </View>
          </Card>

          {tdee && mealTarget && recommendedGrams && portionNutrients ? (
            <Card variant="tinted" tint={mealStyle.bg} style={styles.card}>
              <Text style={styles.cardTitle}>How much to eat for {MEAL_LABELS[mealCategory]}</Text>
              <Text style={styles.cardSubtitle}>
                {mealPercent}% of your daily calories · {Math.round(mealTarget)} kcal
              </Text>
              <Text style={[styles.portion, { color: mealStyle.accent }]}>{recommendedGrams}g</Text>
              <Text style={styles.cardLine}>{portionNutrients.calories} kcal</Text>
              <View style={styles.macroRow}>
                <MacroTag label="P" value={`${portionNutrients.protein}g`} color={colors.protein} />
                <MacroTag label="C" value={`${portionNutrients.carbs}g`} color={colors.carbs} />
                <MacroTag label="F" value={`${portionNutrients.fat}g`} color={colors.fat} />
              </View>
            </Card>
          ) : (
            <Card variant="tinted" tint={colors.primaryLight} style={styles.hintCard}>
              <Text style={styles.profileHint}>
                Complete your profile to get a personalized portion for {MEAL_LABELS[mealCategory]}.
              </Text>
            </Card>
          )}

          <Pressable
            style={[styles.primaryButton, logging && styles.buttonDisabled]}
            onPress={handleLogMeal}
            disabled={logging || recommendedGrams == null}
          >
            <Text style={styles.primaryButtonText}>
              {logging ? 'Logging…' : `Log to ${MEAL_LABELS[mealCategory]}`}
            </Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => setEditingNutrition(true)}>
            <Text style={styles.secondaryButtonText}>Edit nutrition facts</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={resetScan}>
            <Text style={styles.secondaryButtonText}>Scan again</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={handleChangeMeal}>
            <Text style={styles.secondaryButtonText}>Choose a different meal</Text>
          </Pressable>
        </ScrollView>
      </Screen>
    );
  }

  // Step 2: Camera scanner
  return (
    <Screen fullBleed style={styles.container}>
      <View style={styles.cameraWrapper}>
        {isFocused ? (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: [
                'ean13',
                'ean8',
                'upc_a',
                'upc_e',
                'itf14',
                'code128',
                'code39',
                'code93',
                'codabar',
                'qr',
                'pdf417',
                'datamatrix',
                'aztec',
              ],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />
        ) : (
          <View style={StyleSheet.absoluteFillObject} />
        )}

        <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable style={styles.backButton} onPress={handleChangeMeal} hitSlop={12}>
            <Ionicons name="chevron-back" size={22} color={colors.white} />
          </Pressable>
          <View style={styles.topBarCenter}>
            <Text style={styles.screenTitle}>Scan for {MEAL_LABELS[mealCategory]}</Text>
            {tdee && mealTarget ? (
              <Text style={styles.screenSubtitle}>
                Target · {Math.round(mealTarget)} kcal ({mealPercent}% of daily)
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.scanOverlay}>
          <View
            style={[
              styles.scanFrame,
              { width: scanFrameSize, height: scanFrameSize * 0.62 },
            ]}
          >
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.scanHint}>Align any barcode or QR on the pack</Text>
          {loading ? <ActivityIndicator color={colors.scannerFrame} style={styles.loader} /> : null}
        </View>

        <View style={[styles.bottomHint, { paddingBottom: spacing.lg }]}>
          <Text style={styles.bottomHintText}>
            Nutrition is filled in automatically. Save to see how much to eat.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

function MacroTag({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.macroTag, { backgroundColor: `${color}18` }]}>
      <Text style={[styles.macroTagLabel, { color }]}>{label}</Text>
      <Text style={[styles.macroTagValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, width: '100%' },
  container: { backgroundColor: colors.black },
  containerLight: { backgroundColor: colors.background },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  cameraWrapper: { flex: 1, overflow: 'hidden' },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.overlay,
    gap: spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  topBarCenter: { flex: 1, minWidth: 0 },
  screenTitle: {
    color: colors.white,
    ...typography.heading,
  },
  screenSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    ...typography.caption,
    marginTop: 2,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlayLight,
  },
  scanFrame: { position: 'relative' },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: colors.scannerFrame,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  scanHint: {
    color: colors.white,
    ...typography.bodyMedium,
    marginTop: spacing.lg,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  loader: { marginTop: spacing.md },
  bottomHint: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: colors.overlay,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  bottomHintText: {
    color: 'rgba(255,255,255,0.9)',
    ...typography.caption,
    textAlign: 'center',
  },
  resultScroll: { flex: 1, width: '100%' },
  mealBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    marginBottom: spacing.sm,
  },
  mealBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  productName: {
    ...typography.title,
    color: colors.text,
    marginBottom: 4,
  },
  barcode: {
    ...typography.caption,
    color: colors.textMuted,
  },
  localSource: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  sourceSpacer: {
    marginBottom: spacing.lg,
  },
  card: { marginBottom: spacing.md },
  hintCard: { marginBottom: spacing.md },
  cardTitle: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  cardLine: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  macroRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  macroTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.sm,
  },
  macroTagLabel: { fontSize: 10, fontWeight: '700', marginBottom: 1 },
  macroTagValue: { fontSize: 13, fontWeight: '600' },
  portion: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1,
    marginBottom: 4,
  },
  profileHint: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    minHeight: 54,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: spacing.sm,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: { opacity: 0.6 },
  permissionText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
});
