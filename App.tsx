import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider, AuthInitialState } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { User } from './src/types/models';
import { COLORS } from './src/utils/constants';

// Prevent native splash from auto-hiding; ignore on web where it's a no-op.
SplashScreen.preventAutoHideAsync().catch(() => {});

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
        SplashScreen.hideAsync().catch(() => {});
      }
    }
    prepare();
  }, []);

  // Show a branded splash while the app initialises — never a black screen.
  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider initialState={initialAuthState}>
            <AppProvider>
              <NavigationContainer>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
