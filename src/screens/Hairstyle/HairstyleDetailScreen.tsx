import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { COLORS, SIZES } from '../../utils/constants';
import { BeautyStackParamList } from '../../types/navigation';

type HairstyleDetailRoute = RouteProp<BeautyStackParamList, 'HairstyleDetail'>;

const HAIRSTYLE_DATA: Record<string, { name: string; emoji: string; description: string; careTips: string[]; stylingSteps: string[] }> = {
  hs1: {
    name: 'Beach Waves',
    emoji: '🌊',
    description: 'Effortless, tousled waves that look like you just came from the beach. Perfect for medium to long hair.',
    careTips: [
      'Use a hydrating shampoo and conditioner to keep hair moisturized',
      'Apply heat protectant before styling',
      'Sleep on a silk pillowcase to maintain waves overnight',
    ],
    stylingSteps: [
      'Start with damp hair, apply a sea salt spray for texture',
      'Divide hair into 4 sections',
      'Use a 1-inch curling iron to curl each section away from face',
      'Let curls cool for 5 minutes, then shake out with fingers',
      'Apply a light holding spray to lock in the waves',
    ],
  },
  hs2: {
    name: 'Classic Bun',
    emoji: '🎀',
    description: 'A timeless, elegant updo that works for casual and formal occasions alike.',
    careTips: [
      'Avoid pulling too tight to prevent breakage',
      'Use a soft hair tie, not elastic bands',
      'Massage scalp regularly if wearing bun frequently',
    ],
    stylingSteps: [
      'Brush hair into a smooth ponytail at your desired height',
      'Secure with a hair tie',
      'Twist the ponytail into a rope',
      'Coil it around the base and pin with bobby pins',
      'Spray with hairspray for hold',
    ],
  },
};

export function HairstyleDetailScreen() {
  const route = useRoute<HairstyleDetailRoute>();
  const style = HAIRSTYLE_DATA[route.params.hairstyleId] ?? HAIRSTYLE_DATA['hs1'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={style.name} showBack rightIcon="heart-outline" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.hero}>
          <Text style={styles.heroEmoji}>{style.emoji}</Text>
          <Text style={styles.heroTitle}>{style.name}</Text>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={styles.description}>{style.description}</Text>

          <Text style={styles.sectionTitle}>Styling Steps</Text>
          {style.stylingSteps.map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepDot} />
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}

          <Text style={[styles.sectionTitle, { marginTop: SIZES.lg }]}>Hair Care Tips</Text>
          {style.careTips.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipBullet}>💡</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}

          <Button title="Save to Favorites" onPress={() => {}} style={{ marginTop: SIZES.xl }} />
          <View style={{ height: SIZES.xl }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  hero: { padding: SIZES.xl, alignItems: 'center' },
  heroEmoji: { fontSize: 70, marginBottom: 12 },
  heroTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.white },
  content: { padding: SIZES.xl },
  description: { fontSize: 16, color: COLORS.textSecondary, lineHeight: 24, marginBottom: SIZES.lg },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.md },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SIZES.md },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginTop: 8, marginRight: SIZES.md, flexShrink: 0 },
  stepText: { flex: 1, fontSize: 15, color: COLORS.text, lineHeight: 22 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SIZES.sm },
  tipBullet: { fontSize: 18, marginRight: SIZES.sm },
  tipText: { flex: 1, fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
});
