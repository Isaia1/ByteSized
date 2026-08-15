import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_BASE_HEIGHT } from '../constants/layout';
import { colors, radii, shadows } from '../constants/theme';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ScannerScreen } from '../screens/ScannerScreen';

import { MealCategory } from '../types';

export type RootTabParamList = {
  Dashboard: undefined;
  Scanner: { meal?: MealCategory } | undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function AppNavigator() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_BAR_BASE_HEIGHT + insets.bottom;
  const isWeb = Platform.OS === 'web';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneContainerStyle: styles.scene,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: tabBarHeight,
          paddingTop: 6,
          paddingBottom: isWeb ? Math.max(insets.bottom, 8) : insets.bottom,
          ...(isWeb ? { position: 'relative' as const } : {}),
          ...shadows.sm,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ color, focused, size }) => {
          const iconName =
            route.name === 'Dashboard'
              ? focused
                ? 'pie-chart'
                : 'pie-chart-outline'
              : route.name === 'Scanner'
                ? focused
                  ? 'barcode'
                  : 'barcode-outline'
                : focused
                  ? 'person'
                  : 'person-outline';

          return (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Ionicons name={iconName} size={size - 2} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Today' }} />
      <Tab.Screen name="Scanner" component={ScannerScreen} options={{ title: 'Scan' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  iconWrap: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  iconWrapActive: {
    backgroundColor: colors.accentLight,
  },
});
