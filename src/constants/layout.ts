import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from './theme';

/** Base tab bar content height before safe-area padding. */
export const TAB_BAR_BASE_HEIGHT = 49;

export function useMobileLayout() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktopWeb = isWeb && width >= 768;
  const isSmallPhone = !isDesktopWeb && width < 375;
  const isNarrowPhone = !isDesktopWeb && width < 340;

  const screenPadding = isDesktopWeb
    ? Math.min(Math.max(Math.round(width * 0.06), 24), 96)
    : isSmallPhone
      ? 16
      : 20;

  return {
    width,
    height,
    isWeb,
    isDesktopWeb,
    isSmallPhone,
    isNarrowPhone,
    screenPadding,
    calorieRingSize: isDesktopWeb
      ? Math.min(width * 0.12, 140)
      : Math.min(width * 0.3, isSmallPhone ? 96 : 108),
    macroRingSize: isDesktopWeb
      ? Math.min(width * 0.08, 100)
      : Math.min((width - 32 - 16) / 3 - 8, isSmallPhone ? 72 : 80),
    macroRingStroke: isSmallPhone ? 5 : 7,
  };
}

/** Safe-area aware layout values shared across screens. */
export function useScreenLayout() {
  const insets = useSafeAreaInsets();
  const mobile = useMobileLayout();

  return {
    ...mobile,
    insets,
    tabBarHeight: TAB_BAR_BASE_HEIGHT + insets.bottom,
    scrollContent: {
      flexGrow: 1,
      width: '100%' as const,
      paddingHorizontal: mobile.screenPadding,
      paddingTop: spacing.sm,
      paddingBottom: spacing.lg,
    },
  };
}
