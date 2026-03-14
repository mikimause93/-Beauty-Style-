import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { COLORS, SIZES } from '../../utils/constants';
import { BeautyStackParamList } from '../../types/navigation';

type MakeupLookRoute = RouteProp<BeautyStackParamList, 'MakeupLook'>;

const LOOKS: Record<string, { name: string; emoji: string; description: string; steps: string[] }> = {
  l1: {
    name: 'Everyday Natural',
    emoji: '🌸',
    description: 'A fresh, minimal makeup look perfect for daily wear that enhances your natural beauty.',
    steps: [
      'Apply SPF moisturizer and let it absorb for 2 minutes.',
      'Dab a light-coverage tinted moisturizer or BB cream.',
      'Conceal under-eye circles with a peach-toned corrector.',
      'Curl your lashes and apply one coat of brown mascara.',
      'Lightly fill brows with a taupe brow pencil.',
      'Apply a coral or nude lip balm for a healthy finish.',
    ],
  },
  l2: {
    name: 'Smoky Eye',
    emoji: '🖤',
    description: 'A dramatic, sultry look that draws attention to the eyes with deep, blended shadows.',
    steps: [
      'Apply eyeshadow primer across the entire lid.',
      'Pack a medium grey shadow across the lid.',
      'Deepen the outer corner with a dark charcoal/black shadow.',
      'Blend edges thoroughly for a seamless gradient.',
      'Line upper and lower lash lines with black pencil.',
      'Smudge the liner for a smoky effect and apply volumizing mascara.',
    ],
  },
};

export function MakeupLookScreen() {
  const route = useRoute<MakeupLookRoute>();
  const look = LOOKS[route.params.lookId] ?? LOOKS['l1'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={look.name} showBack rightIcon="heart-outline" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[COLORS.primaryLight, COLORS.primary]} style={styles.hero}>
          <Text style={styles.heroEmoji}>{look.emoji}</Text>
          <Text style={styles.heroTitle}>{look.name}</Text>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={styles.description}>{look.description}</Text>

          <Text style={styles.sectionTitle}>How to Achieve This Look</Text>
          {look.steps.map((step, index) => (
            <View key={index} style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNum}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}

          <Button title="Save This Look" onPress={() => {}} style={{ marginTop: SIZES.xl }} />
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
  stepBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: SIZES.md, flexShrink: 0 },
  stepNum: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
  stepText: { flex: 1, fontSize: 15, color: COLORS.text, lineHeight: 22 },
});
