import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Header } from '../../components/common/Header';
import { SearchBar } from '../../components/common/SearchBar';
import { Card } from '../../components/common/Card';
import { StarRating } from '../../components/common/StarRating';
import { COLORS, SIZES, MOCK_PRODUCTS } from '../../utils/constants';
import { BeautyStackParamList } from '../../types/navigation';

type ProductsNavProp = NativeStackNavigationProp<BeautyStackParamList, 'Products'>;
type ProductsRoute = RouteProp<BeautyStackParamList, 'Products'>;

const CATEGORIES = ['All', 'Foundation', 'Serum', 'Highlighter', 'Hair'];

export function ProductsScreen() {
  const navigation = useNavigation<ProductsNavProp>();
  const route = useRoute<ProductsRoute>();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category ?? 'All');

  const filtered = MOCK_PRODUCTS.filter(p => {
    const matchesQuery = query.length === 0 || p.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesQuery && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Products" showBack />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search products..." />

      <View style={styles.filterRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.filterText, selectedCategory === cat && styles.filterTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <Card style={styles.productCard} onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
            <View style={styles.productThumb}>
              <Text style={{ fontSize: 40 }}>🛍️</Text>
            </View>
            <Text style={styles.brand}>{item.brand}</Text>
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            <StarRating rating={item.rating} size={12} />
            <Text style={styles.price}>€{item.price.toFixed(2)}</Text>
          </Card>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  filterRow: { flexDirection: 'row', paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm, gap: SIZES.sm },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.lightGray },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  filterTextActive: { color: COLORS.white, fontWeight: '700' },
  grid: { padding: SIZES.sm },
  productCard: { flex: 1, margin: SIZES.xs, padding: SIZES.sm },
  productThumb: { height: 120, backgroundColor: COLORS.lightGray, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: SIZES.sm },
  brand: { fontSize: 11, color: COLORS.gray, textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginVertical: 4 },
  price: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary, marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 50, marginBottom: SIZES.md },
  emptyText: { fontSize: 16, color: COLORS.gray },
});