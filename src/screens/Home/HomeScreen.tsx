import { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { StarRating } from '../../components/common/StarRating';
import { COLORS, SIZES, MOCK_TUTORIALS, MOCK_PRODUCTS } from '../../utils/constants';
import { HomeStackParamList } from '../../types/navigation';

type HomeNavProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

const CATEGORIES = [
  { id: '1', name: 'Makeup', emoji: '💄', color: '#FF69B4' },
  { id: '2', name: 'Skincare', emoji: '✨', color: '#9C27B0' },
  { id: '3', name: 'Hairstyle', emoji: '💇‍♀️', color: '#E91E8C' },
  { id: '4', name: 'Nails', emoji: '💅', color: '#FF4081' },
  { id: '5', name: 'Wellness', emoji: '🧘‍♀️', color: '#673AB7' },
  { id: '6', name: 'Fragrance', emoji: '🌸', color: '#F48FB1' },
];

export function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const { user } = useContext(AuthContext);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.headerGradient}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{greeting()}, {user?.name ?? 'Beauty Lover'} 👋</Text>
              <Text style={styles.subtitle}>Ready to discover your best look?</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.notifButton}>
              <Ionicons name="notifications-outline" size={26} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search')}>
            <Ionicons name="search" size={20} color={COLORS.gray} />
            <Text style={styles.searchPlaceholder}>Search tutorials, products...</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity key={cat.id} style={[styles.categoryChip, { backgroundColor: cat.color + '20' }]}>
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={[styles.categoryName, { color: cat.color }]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <LinearGradient colors={['#FF69B4', '#9C27B0']} style={styles.featuredBanner}>
            <Text style={styles.featuredTitle}>🌟 Spring Beauty</Text>
            <Text style={styles.featuredSubtitle}>Discover your perfect spring look</Text>
            <TouchableOpacity style={styles.featuredButton}>
              <Text style={styles.featuredButtonText}>Explore Now</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Tutorials</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={MOCK_TUTORIALS}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.tutorialsRow}
            renderItem={({ item }) => (
              <Card style={styles.tutorialCard} onPress={() => navigation.navigate('TutorialDetail', { tutorialId: item.id })}>
                <View style={styles.tutorialThumbnail}>
                  <Text style={{ fontSize: 40 }}>{item.category === 'makeup' ? '💄' : item.category === 'skincare' ? '✨' : '💇‍♀️'}</Text>
                </View>
                <Badge
                  label={item.difficulty}
                  color={item.difficulty === 'beginner' ? '#E8F5E9' : item.difficulty === 'intermediate' ? '#FFF3E0' : '#FFEBEE'}
                  textColor={item.difficulty === 'beginner' ? '#2E7D32' : item.difficulty === 'intermediate' ? '#E65100' : '#C62828'}
                />
                <Text style={styles.tutorialTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.tutorialMeta}>
                  <Ionicons name="time-outline" size={14} color={COLORS.gray} />
                  <Text style={styles.tutorialDuration}>{item.duration} min</Text>
                  <Ionicons name="heart-outline" size={14} color={COLORS.gray} />
                  <Text style={styles.tutorialLikes}>{item.likes}</Text>
                </View>
              </Card>
            )}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Products</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {MOCK_PRODUCTS.slice(0, 3).map(product => (
            <Card key={product.id} style={styles.productCard} onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}>
              <View style={styles.productContent}>
                <View style={styles.productImagePlaceholder}>
                  <Text style={{ fontSize: 30 }}>🛍️</Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productBrand}>{product.brand}</Text>
                  <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                  <View style={styles.productRating}>
                    <StarRating rating={product.rating} size={14} />
                    <Text style={styles.reviewCount}>({product.reviewCount})</Text>
                  </View>
                  <Text style={styles.productPrice}>€{product.price.toFixed(2)}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        <View style={{ height: SIZES.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerGradient: { paddingBottom: SIZES.xl, paddingTop: SIZES.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: SIZES.md, marginBottom: SIZES.md },
  greeting: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  notifButton: { padding: SIZES.xs },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: SIZES.md,
    paddingHorizontal: SIZES.md,
    paddingVertical: 12,
  },
  searchPlaceholder: { marginLeft: SIZES.sm, color: COLORS.gray, fontSize: 15 },
  section: { marginTop: SIZES.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.md, marginBottom: SIZES.sm },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, paddingHorizontal: SIZES.md, marginBottom: SIZES.sm },
  seeAll: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  categoriesRow: { paddingHorizontal: SIZES.md, gap: SIZES.sm },
  categoryChip: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, marginRight: 8 },
  categoryEmoji: { fontSize: 24, marginBottom: 4 },
  categoryName: { fontSize: 12, fontWeight: '600' },
  featuredBanner: { marginHorizontal: SIZES.md, borderRadius: 20, padding: SIZES.xl },
  featuredTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.white, marginBottom: 8 },
  featuredSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.9)', marginBottom: SIZES.md },
  featuredButton: { backgroundColor: COLORS.white, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20, alignSelf: 'flex-start' },
  featuredButtonText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
  tutorialsRow: { paddingHorizontal: SIZES.md, gap: SIZES.sm },
  tutorialCard: { width: 180, marginRight: 12 },
  tutorialThumbnail: { height: 110, backgroundColor: COLORS.lightGray, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: SIZES.sm },
  tutorialTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginTop: SIZES.xs, marginBottom: 6 },
  tutorialMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tutorialDuration: { fontSize: 12, color: COLORS.gray, marginRight: 8 },
  tutorialLikes: { fontSize: 12, color: COLORS.gray },
  productCard: { marginHorizontal: SIZES.md, marginBottom: SIZES.sm, padding: SIZES.sm },
  productContent: { flexDirection: 'row', alignItems: 'center' },
  productImagePlaceholder: { width: 80, height: 80, backgroundColor: COLORS.lightGray, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: SIZES.md },
  productInfo: { flex: 1 },
  productBrand: { fontSize: 12, color: COLORS.gray, textTransform: 'uppercase', letterSpacing: 1 },
  productName: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginVertical: 4 },
  productRating: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  reviewCount: { fontSize: 12, color: COLORS.gray, marginLeft: 4 },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
});