import { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from '../../components/common/SearchBar';
import { Header } from '../../components/common/Header';
import { COLORS, SIZES, MOCK_TUTORIALS, MOCK_PRODUCTS } from '../../utils/constants';

const TRENDING_SEARCHES = ['Natural makeup', 'Skincare routine', 'Curly hair', 'Vitamin C serum', 'Nail art', 'Summer looks'];

export function SearchScreen() {
  const [query, setQuery] = useState('');

  const filteredTutorials = query.length > 1
    ? MOCK_TUTORIALS.filter(t => t.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  const filteredProducts = query.length > 1
    ? MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const results = [
    ...filteredTutorials.map(t => ({ ...t, _type: 'tutorial' as const })),
    ...filteredProducts.map(p => ({ ...p, _type: 'product' as const })),
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Search" showBack />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search tutorials, products, tips..." />

      {query.length === 0 ? (
        <View style={styles.trending}>
          <Text style={styles.sectionTitle}>Trending Searches</Text>
          <View style={styles.chips}>
            {TRENDING_SEARCHES.map(s => (
              <TouchableOpacity key={s} style={styles.chip} onPress={() => setQuery(s)}>
                <Text style={styles.chipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => `${item._type}-${item.id}`}
          renderItem={({ item }) => (
            <View style={styles.resultItem}>
              <Text style={styles.resultEmoji}>{item._type === 'tutorial' ? '📚' : '🛍️'}</Text>
              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle}>{'title' in item ? item.title : item.name}</Text>
                <Text style={styles.resultType}>{item._type === 'tutorial' ? 'Tutorial' : 'Product'}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>No results for "{query}"</Text>
            </View>
          )}
          contentContainerStyle={{ padding: SIZES.md }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  trending: { padding: SIZES.md },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm },
  chip: { backgroundColor: COLORS.lightGray, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 14, color: COLORS.text },
  resultItem: { flexDirection: 'row', alignItems: 'center', padding: SIZES.md, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  resultEmoji: { fontSize: 28, marginRight: SIZES.md },
  resultInfo: { flex: 1 },
  resultTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  resultType: { fontSize: 13, color: COLORS.gray, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 50, marginBottom: SIZES.md },
  emptyText: { fontSize: 16, color: COLORS.gray },
});