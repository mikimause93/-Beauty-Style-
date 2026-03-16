import { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';
import { RootStackParamList } from '../types/navigation';
import { COLORS } from '../utils/constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isLoggedIn, hasCompletedOnboarding } = useContext(AuthContext);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // Ensure brand pink is always visible — prevents black/blank gaps
        // during screen transitions and on devices with dark system themes.
        contentStyle: { backgroundColor: COLORS.primary },
      }}
    >
      {!hasCompletedOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : !isLoggedIn ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
}