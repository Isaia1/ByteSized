import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, mealColors, radii, spacing, typography } from '../constants/theme';
import { FoodItem, MEAL_LABELS, MealCategory } from '../types';

const MEAL_ICONS: Record<MealCategory, keyof typeof Ionicons.glyphMap> = {
  breakfast: 'sunny-outline',
  lunch: 'restaurant-outline',
  dinner: 'moon-outline',
  snacks: 'cafe-outline',
};

interface MealSectionProps {
  category: MealCategory;
  items: FoodItem[];
}

export function MealSection({ category, items }: MealSectionProps) {
  if (items.length === 0) {
    return null;
  }

  const mealStyle = mealColors[category];

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: mealStyle.bg }]}>
          <Ionicons name={MEAL_ICONS[category]} size={16} color={mealStyle.accent} />
        </View>
        <Text style={styles.title}>{MEAL_LABELS[category]}</Text>
        <Text style={styles.count}>{items.length}</Text>
      </View>

      {items.map((item) => (
        <View key={item.id} style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.macroRow}>
              <MacroPill label="P" value={item.protein} color={colors.protein} />
              <MacroPill label="C" value={item.carbs} color={colors.carbs} />
              <MacroPill label="F" value={item.fat} color={colors.fat} />
              <Text style={styles.portion}>{item.portionGrams}g</Text>
            </View>
          </View>
          <View style={[styles.calorieBadge, { backgroundColor: mealStyle.bg }]}>
            <Text style={[styles.calories, { color: mealStyle.accent }]}>{item.calories}</Text>
            <Text style={[styles.calorieUnit, { color: mealStyle.accent }]}>kcal</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function MacroPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.macroPill, { backgroundColor: `${color}18` }]}>
      <Text style={[styles.macroLabel, { color }]}>{label}</Text>
      <Text style={[styles.macroValue, { color }]}>{value}g</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.heading,
    color: colors.text,
    flex: 1,
  },
  count: {
    ...typography.caption,
    color: colors.textMuted,
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    width: '100%',
  },
  info: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: 8,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  macroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  macroLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  macroValue: {
    fontSize: 11,
    fontWeight: '500',
  },
  portion: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 2,
  },
  calorieBadge: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.sm,
    minWidth: 56,
  },
  calories: {
    fontSize: 18,
    fontWeight: '700',
  },
  calorieUnit: {
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.8,
  },
});
