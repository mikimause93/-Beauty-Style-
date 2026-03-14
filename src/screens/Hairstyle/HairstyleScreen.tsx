import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/common/Header';
import { COLORS, SIZES } from '../../utils/constants';
import { BeautyStackParamList } from '../../types/navigation';

type HairstyleNavProp = NativeStackNavigationProp<BeautyStackParamList, 'Hairstyle'>;

const HAIRSTYLE_CATEGORIES = [
  { id: 'h1', name: 'Short', emoji: '✂️', color: '#E91E8C' },
  { id: 'h2', name: 'Medium', emoji: '💁‍♀️', color: '#9C27B0' },
  { id: 'h3', name: 'Long', emoji: '👸', color: '#673AB7' },
  { id: 'h4', name: 'Curly', emoji: '🌀', color: '#FF4081' },
  { id: 'h5', name: 'Braids', emoji: '🤿', color: '#FF9800' },
  { id: 'h6', name: 'Updo', emoji: '👑', color: '#4CAF50' },
];

const HAIRSTYLES = [
  { id: 'hs1', name: 'Beach Waves', category: 'Medium', emoji: '🌊', difficulty: 'Easy', time: '15 min' },
  { id: 'hs2', name: 'Classic Bun', category: 'Long', emoji: '🎀', difficulty: 'Easy', time: '5 min' },
  { id: 'hs3', name: 'Pixie Cut', category: 'Short', emoji: '✨', difficulty: 'Hard', time: '0 min' },
  { id: 'hs4', name: 'French Braid', category: 'Braids', emoji: '🌿', difficulty: 'Medium', time: '20 min' },
  { id: 'hs5', name: 'Blowout', category: 'Medium', emoji: '💨', difficulty: 'Medium', time: '30 min' },
  { id: 'hs6', name: 'Curly Wash-n-Go', category: 'Curly', emoji: '💧', difficulty: 'Easy', time: '10 min' },
];

export function HairstyleScreen() {
  const navigation = useNavigation<HairstyleNavProp>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Hairstyles" showBack />
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#E91E8C', '#9C27B0']} style={styles.banner}>
          <Text style={styles.bannerEmoji}>💇‍♀️</Text>
          <Text style={styles.bannerTitle}>Find Your Perfect Style</Text>
          <Text style={styles.bannerSubtitle}>From everyday to glamorous</Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Length</Text>
          <View style={styles.grid}>
            {HAIRSTYLE_CATEGORIES.map(cat => (
              <TouchableOpacity key={cat.id} style={[styles.catCard, { backgroundColor: cat.color + '15' }]}>
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text style={[styles.catName, { color: cat.color }]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Styles</Text>
          <View style={styles.stylesGrid}>
            {HAIRSTYLES.map(style => (
              <TouchableOpacity
                key={style.id}
                style={styles.styleCard}
                onPress={() => navigation.navigate('HairstyleDetail', { hairstyleId: style.id })}
              >
                <View style={styles.styleThumb}>
                  <Text style={{ fontSize: 40 }}>{style.emoji}</Text>
                </View>
                <Text style={styles.styleName} numberOfLines={1}>{style.name}</Text>
                <Text style={styles.styleMeta}>{style.category} · {style.difficulty}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: SIZES.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  banner: { padding: SIZES.xl, alignItems: 'center' },
  bannerEmoji: { fontSize: 60, marginBottom: 8 },
  bannerTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.white },
  bannerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  section: { padding: SIZES.md },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm },
  catCard: { width: '30%', borderRadius: 14, padding: SIZES.sm, alignItems: 'center', marginBottom: 4 },
  catEmoji: { fontSize: 28, marginBottom: 6 },
  catName: { fontSize: 13, fontWeight: '700' },
  stylesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm },
  styleCard: { width: '47%', backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, marginBottom: 4 },
  styleThumb: { height: 100, backgroundColor: COLORS.lightGray, alignItems: 'center', justifyContent: 'center' },
  styleName: { fontSize: 14, fontWeight: '600', color: COLORS.text, padding: SIZES.sm, paddingBottom: 2 },
  styleMeta: { fontSize: 12, color: COLORS.gray, paddingHorizontal: SIZES.sm, paddingBottom: SIZES.sm },
});
