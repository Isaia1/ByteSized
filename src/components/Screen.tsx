import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

interface ScreenProps {
  children: React.ReactNode;
  /** Safe-area edges to respect. Defaults to top + horizontal. */
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  /** When true, content fills edge-to-edge (Scanner camera). */
  fullBleed?: boolean;
}

export function Screen({
  children,
  edges,
  style,
  fullBleed = false,
}: ScreenProps) {
  const safeEdges: Edge[] = edges ?? (fullBleed ? [] : ['top', 'left', 'right']);

  return (
    <SafeAreaView style={[styles.screen, style]} edges={safeEdges}>
      <View style={styles.inner}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    width: '100%',
  },
});
