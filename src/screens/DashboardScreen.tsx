import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { MealSection } from '../components/MealSection';
import { ProgressRing } from '../components/ProgressRing';
import { Screen } from '../components/Screen';
import { useScreenLayout } from '../constants/layout';
import { colors, mealColors, radii, spacing, typography } from '../constants/theme';
import { RootTabParamList } from '../navigation/AppNavigator';
import { MAIN_MEALS, MEAL_LABELS, MEAL_CATEGORIES, MealCategory } from '../types';
import {
  calculateMacroTargets,
  calculateTDEE,
  sumMacroTotals,
} from '../utils/nutritionMath';
import { loadDailyLog, loadProfile } from '../utils/storage';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

const MEAL_ICONS: Record<MealCategory, keyof typeof Ionicons.glyphMap> = {
  breakfast: 'sunny-outline',
  lunch: 'restaurant-outline',
  dinner: 'moon-outline',
  snacks: 'cafe-outline',
};

type TabNav = BottomTabNavigationProp<RootTabParamList>;

export function DashboardScreen() {
  const navigation = useNavigation<TabNav>();
  const {
    scrollContent,
    calorieRingSize,
    macroRingSize,
    macroRingStroke,
    isSmallPhone,
  } = useScreenLayout();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [targets, setTargets] = useState({ calories: 2000, protein: 150, carbs: 200, fat: 67 });
  const [items, setItems] = useState<Awaited<ReturnType<typeof loadDailyLog>>>([]);
  const [hasProfile, setHasProfile] = useState(false);

  const refresh = useCallback(async (isPullRefresh = false) => {
    if (isPullRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [profile, logItems] = await Promise.all([loadProfile(), loadDailyLog()]);
      setItems(logItems);
      setTotals(sumMacroTotals(logItems));

      if (profile) {
        const tdee = calculateTDEE(profile);
        setTargets(calculateMacroTargets(tdee));
        setHasProfile(true);
      } else {
        setHasProfile(false);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const caloriePercent =
    targets.calories > 0 ? Math.round((totals.calories / targets.calories) * 100) : 0;

  if (loading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.accent} size="large" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => refresh(true)}
            tintColor={colors.accent}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.date}>{formatDate()}</Text>
        </View>

        {!hasProfile ? (
          <Card variant="tinted" tint={colors.accentLight} style={styles.hintCard}>
            <Text style={styles.hintTitle}>Set up your profile</Text>
            <Text style={styles.hint}>
              Add your stats in Profile to unlock personalized calorie and macro targets.
            </Text>
          </Card>
        ) : null}

        <Text style={styles.sectionLabel}>Log food</Text>
        <View style={styles.logFoodRow}>
          {MAIN_MEALS.map((meal) => {
            const style = mealColors[meal];
            return (
              <Pressable
                key={meal}
                style={[styles.logFoodButton, { backgroundColor: style.bg, borderColor: style.accent + '40' }]}
                onPress={() => navigation.navigate('Scanner', { meal })}
              >
                <Ionicons name={MEAL_ICONS[meal]} size={20} color={style.accent} />
                <Text style={[styles.logFoodLabel, { color: style.accent }]}>{MEAL_LABELS[meal]}</Text>
              </Pressable>
            );
          })}
        </View>

        <Card variant="elevated" style={styles.heroCard}>
          <Text style={styles.heroLabel}>Daily calories</Text>
          <View style={[styles.heroRow, isSmallPhone && styles.heroRowStacked]}>
            <ProgressRing
              label=""
              value={totals.calories}
              goal={targets.calories}
              unit="kcal"
              color={colors.accent}
              size={calorieRingSize}
              strokeWidth={macroRingStroke + 2}
            />
            <View style={styles.heroStats}>
              <Text style={styles.heroValue}>{totals.calories}</Text>
              <Text style={styles.heroGoal}>of {targets.calories} kcal</Text>
              <View style={styles.percentBar}>
                <View
                  style={[
                    styles.percentFill,
                    { width: `${Math.min(caloriePercent, 100)}%` as `${number}%` },
                  ]}
                />
              </View>
              <Text style={styles.percentText}>{caloriePercent}% of daily goal</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionLabel}>Macros</Text>
        <View style={styles.macroGrid}>
          <Card style={[styles.macroCard, { borderColor: colors.proteinLight }]}>
            <ProgressRing
              label="Protein"
              value={totals.protein}
              goal={targets.protein}
              unit="g"
              color={colors.protein}
              trackColor={colors.proteinLight}
              size={macroRingSize}
              strokeWidth={macroRingStroke}
              compact
            />
          </Card>
          <Card style={[styles.macroCard, { borderColor: colors.carbsLight }]}>
            <ProgressRing
              label="Carbs"
              value={totals.carbs}
              goal={targets.carbs}
              unit="g"
              color={colors.carbs}
              trackColor={colors.carbsLight}
              size={macroRingSize}
              strokeWidth={macroRingStroke}
              compact
            />
          </Card>
          <Card style={[styles.macroCard, { borderColor: colors.fatLight }]}>
            <ProgressRing
              label="Fat"
              value={totals.fat}
              goal={targets.fat}
              unit="g"
              color={colors.fat}
              trackColor={colors.fatLight}
              size={macroRingSize}
              strokeWidth={macroRingStroke}
              compact
            />
          </Card>
        </View>

        <Text style={styles.sectionLabel}>Today's meals</Text>
        {items.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nothing logged yet</Text>
            <Text style={styles.empty}>
              Scan a barcode on the Scanner tab to add your first meal.
            </Text>
          </Card>
        ) : (
          MEAL_CATEGORIES.map((category) => (
            <MealSection
              key={category}
              category={category}
              items={items.filter((item) => item.mealCategory === category)}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.display,
    color: colors.text,
    fontSize: 28,
  },
  date: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  hintCard: {
    marginBottom: spacing.lg,
    borderColor: colors.accentSoft + '40',
  },
  hintTitle: {
    ...typography.heading,
    color: colors.primary,
    marginBottom: 4,
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  heroCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  heroLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
  },
  heroRowStacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  heroStats: {
    flex: 1,
    minWidth: 0,
    width: '100%',
  },
  heroValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -1,
  },
  heroGoal: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  percentBar: {
    height: 8,
    backgroundColor: colors.ringTrack,
    borderRadius: radii.full,
    overflow: 'hidden',
    marginBottom: 6,
  },
  percentFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: radii.full,
  },
  percentText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  logFoodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    width: '100%',
  },
  logFoodButton: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 6,
  },
  logFoodLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  macroGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    width: '100%',
  },
  macroCard: {
    flex: 1,
    minWidth: 0,
    padding: spacing.xs,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    ...typography.heading,
    color: colors.text,
    marginBottom: 6,
  },
  empty: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
