import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, mealColors, radii, spacing, typography } from '../constants/theme';
import { MEAL_DESCRIPTIONS, MEAL_LABELS, MAIN_MEALS, MealCategory } from '../types';

const MEAL_ICONS: Record<MealCategory, keyof typeof Ionicons.glyphMap> = {
  breakfast: 'sunny-outline',
  lunch: 'restaurant-outline',
  dinner: 'moon-outline',
  snacks: 'cafe-outline',
};

interface MealPickerProps {
  onSelect: (meal: MealCategory) => void;
  title?: string;
  subtitle?: string;
  includeSnacks?: boolean;
}

export function MealPicker({
  onSelect,
  title = 'What are you eating?',
  subtitle = 'Choose a meal to scan a barcode and get a personalized portion size.',
  includeSnacks = false,
}: MealPickerProps) {
  const meals = includeSnacks ? [...MAIN_MEALS, 'snacks' as MealCategory] : MAIN_MEALS;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.list}>
        {meals.map((meal) => {
          const style = mealColors[meal];
          return (
            <Pressable
              key={meal}
              style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
              onPress={() => onSelect(meal)}
            >
              <View style={[styles.iconBadge, { backgroundColor: style.bg }]}>
                <Ionicons name={MEAL_ICONS[meal]} size={22} color={style.accent} />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{MEAL_LABELS[meal]}</Text>
                <Text style={styles.optionDesc}>{MEAL_DESCRIPTIONS[meal]}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  list: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.md,
  },
  optionPressed: {
    backgroundColor: colors.backgroundAlt,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    minWidth: 0,
  },
  optionTitle: {
    ...typography.heading,
    color: colors.text,
    marginBottom: 2,
  },
  optionDesc: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
