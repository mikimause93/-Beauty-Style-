import { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider, AuthInitialState } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { User } from './src/types/models';
import { COLORS } from './src/utils/constants';

// Prevent native splash from auto-hiding; ignore on web where it's a no-op.
SplashScreen.preventAutoHideAsync().catch(() => {});

// Explicit navigation theme — prevents dark-theme Android devices from showing
// a black background behind the navigation stack.
const NAV_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
  },
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [initialAuthState, setInitialAuthState] = useState<AuthInitialState>({
    isLoggedIn: false,
    hasCompletedOnboarding: false,
    user: null,
  });

  useEffect(() => {
    async function prepare() {
      try {
        const [userJson, onboarding] = await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('onboardingComplete'),
        ]);
        setInitialAuthState({
          isLoggedIn: !!userJson,
          hasCompletedOnboarding: onboarding === 'true',
          user: userJson ? (JSON.parse(userJson) as User) : null,
        });
      } catch (e) {
        console.warn('Failed to restore session:', e);
      } finally {
        setAppIsReady(true);
        // NOTE: splash is now hidden via onLayout (see below) to guarantee
        // the native layer has already painted before we reveal it.
      }
    }
    prepare();
  }, []);

  // Hide the splash screen only AFTER the root view has been laid out and
  // painted. This eliminates the black-frame flash on Android that occurs
  // when hideAsync() is called before React commits the first frame.
  const onRootLayout = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // Show a branded splash while the app initialises — never a black screen.
  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer} onLayout={onRootLayout}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.root} onLayout={onRootLayout}>
        <SafeAreaProvider>
          <AuthProvider initialState={initialAuthState}>
            <AppProvider>
              <NavigationContainer theme={NAV_THEME}>
                <StatusBar style="dark" />
                <AppNavigator />
              </NavigationContainer>
            </AppProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
