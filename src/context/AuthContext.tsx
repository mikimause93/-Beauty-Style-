import { createContext, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/models';
import { validateEmail } from '../utils/helpers';

export interface AuthInitialState {
  isLoggedIn: boolean;
  hasCompletedOnboarding: boolean;
  user: User | null;
}

interface AuthContextType {
  isLoggedIn: boolean;
  hasCompletedOnboarding: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  hasCompletedOnboarding: false,
  user: null,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  completeOnboarding: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
  initialState?: AuthInitialState;
}

export function AuthProvider({ children, initialState }: AuthProviderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(initialState?.isLoggedIn ?? false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(initialState?.hasCompletedOnboarding ?? false);
  const [user, setUser] = useState<User | null>(initialState?.user ?? null);

  const login = useCallback(async (
    email: string,
    _password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim();
    if (!validateEmail(trimmedEmail)) {
      return { success: false, error: 'Inserisci un indirizzo email valido' };
    }
    try {
      const mockUser: User = {
        id: '1',
        name: trimmedEmail.split('@')[0],
        email: trimmedEmail,
        createdAt: new Date().toISOString(),
      };
      // Persist first — if storage fails we don't partially update UI state.
      await AsyncStorage.multiSet([
        ['user', JSON.stringify(mockUser)],
        ['onboardingComplete', 'true'],
      ]);
      setUser(mockUser);
      setIsLoggedIn(true);
      setHasCompletedOnboarding(true);
      return { success: true };
    } catch {
      return { success: false, error: 'Accesso fallito. Riprova.' };
    }
  }, []);

  const register = useCallback(async (
    name: string,
    email: string,
    _password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim();
    if (!validateEmail(trimmedEmail)) {
      return { success: false, error: 'Inserisci un indirizzo email valido' };
    }
    try {
      const mockUser: User = {
        id: Date.now().toString(),
        name: name.trim(),
        email: trimmedEmail,
        createdAt: new Date().toISOString(),
      };
      // Persist first — if storage fails we don't partially update UI state.
      await AsyncStorage.multiSet([
        ['user', JSON.stringify(mockUser)],
        ['onboardingComplete', 'true'],
      ]);
      setUser(mockUser);
      setIsLoggedIn(true);
      setHasCompletedOnboarding(true);
      return { success: true };
    } catch {
      return { success: false, error: 'Registrazione fallita. Riprova.' };
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setIsLoggedIn(false);
    await AsyncStorage.removeItem('user');
  }, []);

  const completeOnboarding = useCallback(async () => {
    setHasCompletedOnboarding(true);
    await AsyncStorage.setItem('onboardingComplete', 'true');
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, hasCompletedOnboarding, user, login, register, logout, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}