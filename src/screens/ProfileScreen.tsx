import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { useScreenLayout } from '../constants/layout';
import { colors, radii, spacing, typography } from '../constants/theme';
import { ActivityLevel, BiologicalSex, UserProfile } from '../types';
import { loadProfile, saveProfile } from '../utils/storage';
import {
  cmToFeetInches,
  feetInchesToCm,
  isValidFeetInches,
  isValidWeightLbs,
  kgToLbs,
  lbsToKg,
} from '../utils/units';

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Desk job, little exercise' },
  { value: 'light', label: 'Lightly active', desc: '1–3 days per week' },
  { value: 'moderate', label: 'Moderately active', desc: '3–5 days per week' },
  { value: 'active', label: 'Very active', desc: '6–7 days per week' },
  { value: 'very_active', label: 'Extra active', desc: 'Physical job + exercise' },
];

export function ProfileScreen() {
  const { scrollContent } = useScreenLayout();
  const [weightLbs, setWeightLbs] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<BiologicalSex>('male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile().then((profile) => {
      if (!profile) return;
      setWeightLbs(String(kgToLbs(profile.weightKg)));
      const { feet, inches } = cmToFeetInches(profile.heightCm);
      setHeightFeet(String(feet));
      setHeightInches(String(inches));
      setAge(String(profile.age));
      setSex(profile.sex);
      setActivityLevel(profile.activityLevel);
    });
  }, []);

  const handleSave = async () => {
    const parsedWeightLbs = parseFloat(weightLbs);
    const parsedFeet = parseInt(heightFeet, 10);
    const parsedInches = parseInt(heightInches, 10);
    const parsedAge = parseInt(age, 10);

    if (
      !parsedAge ||
      parsedAge <= 0 ||
      !isValidWeightLbs(parsedWeightLbs) ||
      !isValidFeetInches(parsedFeet, parsedInches)
    ) {
      Alert.alert(
        'Invalid input',
        'Please enter a valid weight (lbs), height (feet and inches), and age.',
      );
      return;
    }

    const parsed: UserProfile = {
      weightKg: lbsToKg(parsedWeightLbs),
      heightCm: feetInchesToCm(parsedFeet, parsedInches),
      age: parsedAge,
      sex,
      activityLevel,
    };

    setSaving(true);
    try {
      await saveProfile(parsed);
      Alert.alert('Saved', 'Your profile has been saved locally.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heading}>Your profile</Text>
          <Text style={styles.subtitle}>
            We use these to calculate your daily calorie and macro targets.
          </Text>

          <Text style={styles.sectionLabel}>Body metrics</Text>
          <Card variant="elevated" style={styles.formCard}>
            <Field label="Weight" unit="lbs">
              <TextInput
                style={styles.input}
                value={weightLbs}
                onChangeText={setWeightLbs}
                keyboardType="decimal-pad"
                placeholder="154"
                placeholderTextColor={colors.textMuted}
              />
            </Field>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>
                Height <Text style={styles.fieldUnit}>(ft / in)</Text>
              </Text>
              <View style={styles.heightRow}>
                <View style={styles.heightInputGroup}>
                  <TextInput
                    style={styles.heightInput}
                    value={heightFeet}
                    onChangeText={setHeightFeet}
                    keyboardType="number-pad"
                    placeholder="5"
                    placeholderTextColor={colors.textMuted}
                    maxLength={1}
                  />
                  <Text style={styles.heightUnitLabel}>ft</Text>
                </View>
                <View style={styles.heightInputGroup}>
                  <TextInput
                    style={styles.heightInput}
                    value={heightInches}
                    onChangeText={setHeightInches}
                    keyboardType="number-pad"
                    placeholder="10"
                    placeholderTextColor={colors.textMuted}
                    maxLength={2}
                  />
                  <Text style={styles.heightUnitLabel}>in</Text>
                </View>
              </View>
            </View>

            <Field label="Age" unit="years">
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                placeholder="30"
                placeholderTextColor={colors.textMuted}
              />
            </Field>
          </Card>

          <Text style={styles.sectionLabel}>Biological sex</Text>
          <View style={styles.row}>
            {(['male', 'female'] as BiologicalSex[]).map((option) => (
              <Pressable
                key={option}
                style={[styles.chip, sex === option && styles.chipActive]}
                onPress={() => setSex(option)}
              >
                <Text style={[styles.chipText, sex === option && styles.chipTextActive]}>
                  {option === 'male' ? 'Male' : 'Female'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Activity level</Text>
          <View style={styles.activityList}>
            {ACTIVITY_OPTIONS.map((option) => {
              const selected = activityLevel === option.value;
              return (
                <Pressable
                  key={option.value}
                  style={[styles.activityOption, selected && styles.activityOptionActive]}
                  onPress={() => setActivityLevel(option.value)}
                >
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityText, selected && styles.activityTextActive]}>
                      {option.label}
                    </Text>
                    <Text style={styles.activityDesc}>{option.desc}</Text>
                  </View>
                  <View style={[styles.radio, selected && styles.radioActive]}>
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save profile'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Field({
  label,
  unit,
  children,
}: {
  label: string;
  unit: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label} <Text style={styles.fieldUnit}>({unit})</Text>
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, width: '100%' },
  heading: {
    ...typography.title,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  formCard: {
    gap: spacing.md,
  },
  field: {
    gap: 6,
  },
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
  heightRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heightInputGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  heightInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
  },
  heightUnitLabel: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  chipTextActive: {
    color: colors.white,
  },
  activityList: {
    gap: spacing.sm,
  },
  activityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    minHeight: 56,
  },
  activityOptionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  activityTextActive: {
    fontWeight: '700',
    color: colors.primary,
  },
  activityDesc: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  radioActive: {
    borderColor: colors.accent,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  saveButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 54,
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
