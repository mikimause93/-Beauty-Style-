import { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/common/Header';
import { StarRating } from '../../components/common/StarRating';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { AppContext } from '../../context/AppContext';
import { COLORS, SIZES, MOCK_PRODUCTS } from '../../utils/constants';
import { BeautyStackParamList } from '../../types/navigation';

type ProductDetailRoute = RouteProp<BeautyStackParamList, 'ProductDetail'>;

const REVIEWS = [
  { id: 'rv1', author: 'Sophie', rating: 5, text: 'Absolutely love this product! My skin has never looked better.', date: '2 days ago' },
  { id: 'rv2', author: 'Maria', rating: 4, text: 'Great formula, long-lasting. A bit pricey but worth it.', date: '1 week ago' },
  { id: 'rv3', author: 'Emma', rating: 5, text: 'Holy grail product! Repurchased 3 times already.', date: '2 weeks ago' },
];

export function ProductDetailScreen() {
  const route = useRoute<ProductDetailRoute>();
  const { isFavorite, addFavorite, removeFavorite } = useContext(AppContext);
  const product = MOCK_PRODUCTS.find(p => p.id === route.params.productId) ?? MOCK_PRODUCTS[0];
  const favorite = isFavorite(product.id);

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
      Alert.alert('Saved!', `${product.name} added to favorites`);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title=""
        showBack
        rightIcon={favorite ? 'heart' : 'heart-outline'}
        onRightPress={toggleFavorite}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Text style={{ fontSize: 80 }}>🛍️</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.ratingRow}>
            <StarRating rating={product.rating} size={18} />
            <Text style={styles.ratingText}>{product.rating} ({product.reviewCount} reviews)</Text>
          </View>

          <Text style={styles.price}>€{product.price.toFixed(2)}</Text>

          <View style={styles.tagsRow}>
            {product.tags.map(tag => (
              <Badge key={tag} label={tag} color={COLORS.primaryLight + '25'} textColor={COLORS.primary} />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          {product.suitableFor && (
            <>
              <Text style={styles.sectionTitle}>Suitable For</Text>
              <View style={styles.tagsRow}>
                {product.suitableFor.map(type => (
                  <Badge key={type} label={type} color={COLORS.success + '25'} textColor={COLORS.success} />
                ))}
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>Reviews</Text>
          {REVIEWS.map(review => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>{review.author}</Text>
                <StarRating rating={review.rating} size={14} />
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))}

          <Button title="Add to Cart" onPress={() => Alert.alert('Added!', 'Product added to cart')} style={{ marginTop: SIZES.xl }} />
          <View style={{ height: SIZES.xl }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  imageContainer: { height: 280, backgroundColor: COLORS.lightGray, alignItems: 'center', justifyContent: 'center' },
  content: { padding: SIZES.xl },
  brand: { fontSize: 13, color: COLORS.gray, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  name: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.sm },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, marginBottom: SIZES.sm },
  ratingText: { fontSize: 14, color: COLORS.textSecondary },
  price: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary, marginBottom: SIZES.md },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.xs, marginBottom: SIZES.md },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.sm, marginTop: SIZES.md },
  description: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 24 },
  reviewCard: { backgroundColor: COLORS.background, borderRadius: 12, padding: SIZES.md, marginBottom: SIZES.sm },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, marginBottom: SIZES.xs },
  reviewAuthor: { fontSize: 14, fontWeight: '600', color: COLORS.text, flex: 1 },
  reviewDate: { fontSize: 12, color: COLORS.gray },
  reviewText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
});
