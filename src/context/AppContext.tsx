import { createContext, useState, useCallback, ReactNode } from 'react';
import { Product, DiaryEntry } from '../types/models';

interface AppContextType {
  favorites: Product[];
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  diaryEntries: DiaryEntry[];
  addDiaryEntry: (entry: DiaryEntry) => void;
  updateDiaryEntry: (entry: DiaryEntry) => void;
  deleteDiaryEntry: (entryId: string) => void;
}

export const AppContext = createContext<AppContextType>({
  favorites: [],
  addFavorite: () => {},
  removeFavorite: () => {},
  isFavorite: () => false,
  diaryEntries: [],
  addDiaryEntry: () => {},
  updateDiaryEntry: () => {},
  deleteDiaryEntry: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);

  const addFavorite = useCallback((product: Product) => {
    setFavorites(prev => [...prev, product]);
  }, []);

  const removeFavorite = useCallback((productId: string) => {
    setFavorites(prev => prev.filter(p => p.id !== productId));
  }, []);

  const isFavorite = useCallback((productId: string) => {
    return favorites.some(p => p.id === productId);
  }, [favorites]);

  const addDiaryEntry = useCallback((entry: DiaryEntry) => {
    setDiaryEntries(prev => [entry, ...prev]);
  }, []);

  const updateDiaryEntry = useCallback((entry: DiaryEntry) => {
    setDiaryEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
  }, []);

  const deleteDiaryEntry = useCallback((entryId: string) => {
    setDiaryEntries(prev => prev.filter(e => e.id !== entryId));
  }, []);

  return (
    <AppContext.Provider value={{
      favorites, addFavorite, removeFavorite, isFavorite,
      diaryEntries, addDiaryEntry, updateDiaryEntry, deleteDiaryEntry,
    }}>
      {children}
    </AppContext.Provider>
  );
}