import '@expo/metro-runtime';
import 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { registerRootComponent } from 'expo';
import App from './App';

if (Platform.OS === 'web') {
  enableScreens(false);
}

registerRootComponent(App);
