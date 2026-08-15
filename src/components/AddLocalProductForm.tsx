import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Card } from './Card';
import { Screen } from './Screen';
import { useScreenLayout } from '../constants/layout';
import { colors, radii, spacing, typography } from '../constants/theme';
import { PendingLocalProduct } from '../services/productLookup';
import { ScannedProduct } from '../types';

interface AddLocalProductFormProps {
  pending: PendingLocalProduct;
  onSave: (product: ScannedProduct) => void;
  onCancel: () => void;
}

export function AddLocalProductForm({ pending, onSave, onCancel }: AddLocalProductFormProps) {
  const { scrollContent } = useScreenLayout();
  const [name, setName] = useState(pending.suggestedName ?? '');
  const [calories, setCalories] = useState(stringify(pending.caloriesPer100g));
  const [protein, setProtein] = useState(stringify(pending.proteinPer100g));
  const [carbs, setCarbs] = useState(stringify(pending.carbsPer100g));
  const [fat, setFat] = useState(stringify(pending.fatPer100g));
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmedName = name.trim();
    const parsedCalories = parseFloat(calories);
    const parsedProtein = parseFloat(protein);
    const parsedCarbs = parseFloat(carbs);
    const parsedFat = parseFloat(fat);

    if (!trimmedName) {
      setError('Enter the product name from the label.');
      return;
    }

    if (
      !Number.isFinite(parsedCalories) ||
      parsedCalories < 0 ||
      !Number.isFinite(parsedProtein) ||
      parsedProtein < 0 ||
      !Number.isFinite(parsedCarbs) ||
      parsedCarbs < 0 ||
      !Number.isFinite(parsedFat) ||
      parsedFat < 0
    ) {
      setError('Enter calories, protein, carbs, and fat per 100g from the label.');
      return;
    }

    onSave({
      barcode: pending.barcode,
      name: trimmedName,
      caloriesPer100g: parsedCalories,
      proteinPer100g: parsedProtein,
      carbsPer100g: parsedCarbs,
      fatPer100g: parsedFat,
      source: 'saved',
      nutritionComplete: true,
    });
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heading}>Nutrition facts</Text>
          <Text style={styles.subtitle}>
            These values are filled in automatically. Adjust them from the label
            if you want, then save — ByteSized will remember this barcode.
          </Text>

          {pending.brandHint ? (
            <View style={styles.brandChip}>
              <Text style={styles.brandChipText}>Looks like {pending.brandHint}</Text>
            </View>
          ) : null}

          <Card variant="elevated" style={styles.formCard}>
            <Text style={styles.barcode}>Barcode · {pending.barcode}</Text>

            <Field label="Product name">
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Bermudez Crix Original"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
              />
            </Field>

            <Text style={styles.per100}>Per 100g (from the label)</Text>

            <View style={styles.macroGrid}>
              <Field label="Calories" unit="kcal" compact>
                <TextInput
                  style={styles.input}
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />
              </Field>
              <Field label="Protein" unit="g" compact>
                <TextInput
                  style={styles.input}
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />
              </Field>
              <Field label="Carbs" unit="g" compact>
                <TextInput
                  style={styles.input}
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />
              </Field>
              <Field label="Fat" unit="g" compact>
                <TextInput
                  style={styles.input}
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />
              </Field>
            </View>
          </Card>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={styles.primaryButton} onPress={handleSave}>
            <Text style={styles.primaryButtonText}>Save and use</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={onCancel}>
            <Text style={styles.secondaryButtonText}>Scan a different barcode</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function stringify(value?: number): string {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
}

function Field({
  label,
  unit,
  compact,
  children,
}: {
  label: string;
  unit?: string;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.field, compact && styles.fieldCompact]}>
      <Text style={styles.fieldLabel}>
        {label}
        {unit ? <Text style={styles.fieldUnit}> ({unit})</Text> : null}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, width: '100%' },
  heading: {
    ...typography.title,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: spacing.md,
  },
  brandChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    marginBottom: spacing.md,
  },
  brandChipText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  formCard: { gap: spacing.md },
  barcode: {
    ...typography.caption,
    color: colors.textMuted,
  },
  per100: {
    ...typography.label,
    color: colors.textMuted,
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  field: { gap: 6 },
  fieldCompact: { width: '48%', flexGrow: 1 },
  fieldLabel: {
    ...typography.bodyMedium,
    color: colors.text,
    fontSize: 14,
  },
  fieldUnit: {
    color: colors.textMuted,
    fontWeight: '400',
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 16,
    color: colors.text,
    minHeight: 48,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.sm,
  },
  primaryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 54,
    justifyContent: 'center',
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
});
