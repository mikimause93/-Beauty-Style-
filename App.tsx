import { useCallback, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
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

// Navigation theme using brand colours so the background behind every screen
// is always the Beauty & Style pink — never white, cream, or black.
const NAV_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.primary,
    card: COLORS.white,
    text: COLORS.text,
    border: COLORS.lightGray,
    notification: COLORS.accent,
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
        // NOTE: splash is hidden via onLayout below to guarantee
        // the native layer has already painted before we reveal it.
      }
    }
    prepare();
  }, []);

  // Hide the splash screen only AFTER the root view has been laid out and
  // painted — eliminates the black-frame flash on Android.
  const onRootLayout = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // Branded loading screen — always shows Beauty & Style colours, never black/blank.
  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer} onLayout={onRootLayout}>
        <Text style={styles.loadingEmoji}>💄</Text>
        <Text style={styles.loadingTitle}>Beauty &amp; Style</Text>
        <Text style={styles.loadingTagline}>Your personal beauty companion</Text>
        <ActivityIndicator size="large" color={COLORS.white} style={styles.spinner} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      {/* Root view is always brand-pink so no surface is ever black or blank */}
      <GestureHandlerRootView style={styles.root} onLayout={onRootLayout}>
        <SafeAreaProvider>
          <AuthProvider initialState={initialAuthState}>
            <AppProvider>
              <NavigationContainer theme={NAV_THEME}>
                <StatusBar style="light" backgroundColor={COLORS.primary} />
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
  // Brand-pink root — ensures the underlying surface is always the brand colour.
  root: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  // Full-brand loading/splash shown while AsyncStorage is hydrating.
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingTagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 40,
  },
  spinner: {
    marginTop: 8,
  },
});
