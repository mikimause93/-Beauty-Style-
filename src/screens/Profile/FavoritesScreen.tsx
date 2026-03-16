import { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { StarRating } from '../../components/common/StarRating';
import { AppContext } from '../../context/AppContext';
import { COLORS, SIZES } from '../../utils/constants';
import { ProfileStackParamList } from '../../types/navigation';

type FavoritesNavProp = NativeStackNavigationProp<ProfileStackParamList, 'Favorites'>;

export function FavoritesScreen() {
  const { favorites, removeFavorite } = useContext(AppContext);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="My Favorites" showBack />
      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>💝</Text>
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptyText}>Save products you love by tapping the heart icon on product pages</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <View style={styles.productThumb}>
                <Text style={{ fontSize: 36 }}>🛍️</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.brand}>{item.brand}</Text>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <StarRating rating={item.rating} size={14} />
                <Text style={styles.price}>€{item.price.toFixed(2)}</Text>
              </View>
              <TouchableOpacity onPress={() => removeFavorite(item.id)} style={styles.removeBtn}>
                <Ionicons name="heart" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SIZES.xl },
  emptyEmoji: { fontSize: 70, marginBottom: SIZES.lg },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  list: { padding: SIZES.md },
  productCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: SIZES.md, marginBottom: SIZES.sm, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  productThumb: { width: 70, height: 70, backgroundColor: COLORS.lightGray, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: SIZES.md },
  productInfo: { flex: 1 },
  brand: { fontSize: 11, color: COLORS.gray, textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginVertical: 2 },
  price: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary, marginTop: 2 },
  removeBtn: { padding: SIZES.sm },
});