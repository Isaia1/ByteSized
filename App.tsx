import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/constants/theme';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.borderLight,
    primary: colors.accent,
  },
};

function WebShell({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const frameWidth = Math.min(480, width);

  return (
    <View style={styles.webRoot}>
      <View style={[styles.webFrame, { width: frameWidth }]}>{children}</View>
    </View>
  );
}

export default function App() {
  const content = (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <AppNavigator />
        <StatusBar style="dark" />
      </NavigationContainer>
    </SafeAreaProvider>
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      {Platform.OS === 'web' ? <WebShell>{content}</WebShell> : content}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webRoot: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#E8EDEA',
  },
  webFrame: {
    flex: 1,
    maxWidth: 480,
    width: '100%',
    backgroundColor: colors.background,
    ...(Platform.OS === 'web'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.08,
          shadowRadius: 24,
        }
      : {}),
  },
});
