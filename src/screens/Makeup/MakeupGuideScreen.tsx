import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { COLORS, SIZES } from '../../utils/constants';
import { BeautyStackParamList } from '../../types/navigation';

type MakeupNavProp = NativeStackNavigationProp<BeautyStackParamList, 'MakeupGuide'>;

const MAKEUP_CATEGORIES = [
  { id: '1', name: 'Eyes', emoji: '👁️', color: '#9C27B0', description: 'Eyeshadow, liner, mascara' },
  { id: '2', name: 'Lips', emoji: '💋', color: '#E91E8C', description: 'Lipstick, gloss, liner' },
  { id: '3', name: 'Face', emoji: '✨', color: '#FF69B4', description: 'Foundation, blush, highlighter' },
  { id: '4', name: 'Brows', emoji: '🤨', color: '#673AB7', description: 'Pencils, gels, pomades' },
  { id: '5', name: 'Contouring', emoji: '🎨', color: '#FF4081', description: 'Bronzer, contour, highlight' },
  { id: '6', name: 'Nails', emoji: '💅', color: '#F06292', description: 'Polish, nail art, care' },
];

const MAKEUP_LOOKS = [
  { id: 'l1', name: 'Everyday Natural', emoji: '🌸', difficulty: 'Easy', time: '10 min' },
  { id: 'l2', name: 'Smoky Eye', emoji: '🖤', difficulty: 'Medium', time: '20 min' },
  { id: 'l3', name: 'Bold Red Lip', emoji: '💄', difficulty: 'Easy', time: '15 min' },
  { id: 'l4', name: 'Glam Evening', emoji: '⭐', difficulty: 'Hard', time: '35 min' },
  { id: 'l5', name: 'Dewy Glow', emoji: '💧', difficulty: 'Easy', time: '12 min' },
];

export function MakeupGuideScreen() {
  const navigation = useNavigation<MakeupNavProp>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Makeup Guide" showBack />
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#FF69B4', '#E91E8C']} style={styles.banner}>
          <Text style={styles.bannerEmoji}>💄</Text>
          <Text style={styles.bannerTitle}>Master Your Makeup</Text>
          <Text style={styles.bannerSubtitle}>Step-by-step guides for every look</Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.grid}>
            {MAKEUP_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryCard, { backgroundColor: cat.color + '15' }]}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={[styles.categoryName, { color: cat.color }]}>{cat.name}</Text>
                <Text style={styles.categoryDesc}>{cat.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Looks</Text>
          {MAKEUP_LOOKS.map(look => (
            <Card key={look.id} style={styles.lookCard} onPress={() => navigation.navigate('MakeupLook', { lookId: look.id })}>
              <View style={styles.lookRow}>
                <Text style={styles.lookEmoji}>{look.emoji}</Text>
                <View style={styles.lookInfo}>
                  <Text style={styles.lookName}>{look.name}</Text>
                  <Text style={styles.lookMeta}>Difficulty: {look.difficulty} · ⏱ {look.time}</Text>
                </View>
                <Text style={styles.lookArrow}>›</Text>
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
  banner: { padding: SIZES.xl, alignItems: 'center' },
  bannerEmoji: { fontSize: 60, marginBottom: 8 },
  bannerTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.white },
  bannerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  section: { padding: SIZES.md },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm },
  categoryCard: { width: '47%', borderRadius: 16, padding: SIZES.md, marginBottom: 4 },
  categoryEmoji: { fontSize: 32, marginBottom: 6 },
  categoryName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  categoryDesc: { fontSize: 12, color: COLORS.textSecondary },
  lookCard: { marginBottom: SIZES.sm, padding: SIZES.md },
  lookRow: { flexDirection: 'row', alignItems: 'center' },
  lookEmoji: { fontSize: 36, marginRight: SIZES.md },
  lookInfo: { flex: 1 },
  lookName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  lookMeta: { fontSize: 13, color: COLORS.gray, marginTop: 4 },
  lookArrow: { fontSize: 24, color: COLORS.gray },
});