import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography } from '../constants/theme';

interface ProgressRingProps {
  label: string;
  value: number;
  goal: number;
  unit?: string;
  color?: string;
  trackColor?: string;
  size?: number;
  strokeWidth?: number;
  compact?: boolean;
}

export function ProgressRing({
  label,
  value,
  goal,
  unit = '',
  color = colors.accent,
  trackColor = colors.ringTrack,
  size = 96,
  strokeWidth = 8,
  compact = false,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = goal > 0 ? Math.min(value / goal, 1) : 0;
  const strokeDashoffset = circumference * (1 - progress);
  const percent = goal > 0 ? Math.round((value / goal) * 100) : 0;

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation={-90}
            originX={size / 2}
            originY={size / 2}
          />
        </Svg>
        <View style={styles.centerLabel}>
          <Text style={[styles.value, { fontSize: size * 0.17, color }]}>
            {Math.round(value)}
          </Text>
          {unit && !compact ? (
            <Text style={styles.unit}>{unit}</Text>
          ) : compact ? (
            <Text style={styles.percent}>{percent}%</Text>
          ) : null}
        </View>
      </View>
      {!compact && label ? (
        <>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.goal}>
            of {Math.round(goal)}
            {unit ? ` ${unit}` : ''}
          </Text>
        </>
      ) : compact ? (
        <Text style={styles.compactLabel}>{label}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    minWidth: 80,
  },
  compact: {
    minWidth: 72,
  },
  centerLabel: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontWeight: '700',
  },
  unit: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
    fontSize: 11,
  },
  percent: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 1,
  },
  label: {
    marginTop: 10,
    ...typography.bodyMedium,
    fontSize: 14,
    color: colors.text,
  },
  compactLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  goal: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
