import { createContext, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/models';

interface AuthContextType {
  isLoggedIn: boolean;
  hasCompletedOnboarding: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  hasCompletedOnboarding: false,
  user: null,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  completeOnboarding: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    try {
      const mockUser: User = {
        id: '1',
        name: email.split('@')[0],
        email,
        createdAt: new Date().toISOString(),
      };
      setUser(mockUser);
      setIsLoggedIn(true);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      return true;
    } catch {
      return false;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, _password: string): Promise<boolean> => {
    try {
      const mockUser: User = {
        id: Date.now().toString(),
        name,
        email,
        createdAt: new Date().toISOString(),
      };
      setUser(mockUser);
      setIsLoggedIn(true);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      return true;
    } catch {
      return false;
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