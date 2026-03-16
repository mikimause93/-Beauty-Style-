import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { COLORS, SIZES } from '../../utils/constants';
import { BeautyStackParamList } from '../../types/navigation';

type RoutineRoute = RouteProp<BeautyStackParamList, 'SkincareRoutine'>;

const ROUTINES: Record<string, { name: string; emoji: string; color: [string, string]; steps: { name: string; product: string; tip: string }[] }> = {
  r1: {
    name: 'Morning Routine',
    emoji: '🌅',
    color: ['#FF9800', '#F44336'],
    steps: [
      { name: 'Gentle Cleanser', product: 'CeraVe Hydrating Cleanser', tip: 'Use lukewarm water, massage for 60 seconds' },
      { name: 'Toner', product: 'Paula\'s Choice BHA Toner', tip: 'Pat gently, don\'t rub' },
      { name: 'Vitamin C Serum', product: 'SkinCeuticals C E Ferulic', tip: 'Apply to slightly damp skin for better absorption' },
      { name: 'Eye Cream', product: 'Kiehl\'s Creamy Eye Treatment', tip: 'Use ring finger for gentle application' },
      { name: 'Moisturizer', product: 'Neutrogena Hydro Boost', tip: 'Wait 30 seconds after serum' },
      { name: 'SPF 50', product: 'EltaMD UV Clear SPF 46', tip: 'Apply 15 min before sun exposure' },
    ],
  },
  r2: {
    name: 'Evening Routine',
    emoji: '🌙',
    color: ['#3F51B5', '#9C27B0'],
    steps: [
      { name: 'Micellar Water / Oil Cleanser', product: 'Garnier Micellar Water', tip: 'First cleanse to remove makeup' },
      { name: 'Foaming Cleanser', product: 'La Roche-Posay Effaclar', tip: 'Second cleanse for deep clean' },
      { name: 'Exfoliant (2-3x/week)', product: 'The Ordinary Glycolic Acid', tip: 'Skip on nights you use retinol' },
      { name: 'Retinol/Treatment', product: 'Differin Adapalene Gel', tip: 'Start 2x/week, build up slowly' },
      { name: 'Niacinamide Serum', product: 'The Ordinary Niacinamide 10%', tip: 'Helps with pores and brightness' },
      { name: 'Night Moisturizer', product: 'Laneige Water Sleeping Mask', tip: 'Last step to lock in all actives' },
    ],
  },
  r3: {
    name: 'Weekly Mask',
    emoji: '🧖‍♀️',
    color: ['#4CAF50', '#009688'],
    steps: [
      { name: 'Steam', product: 'Hot towel or facial steamer', tip: 'Open pores with steam for 3-5 min' },
      { name: 'Clay Mask', product: 'Aztec Secret Indian Healing Clay', tip: 'Apply thin layer, leave 10-15 min' },
      { name: 'Hydrating Sheet Mask', product: 'COSRX Snail Mucin Mask', tip: 'Follow immediately after clay mask' },
    ],
  },
};

export function SkincareRoutineScreen() {
  const route = useRoute<RoutineRoute>();
  const routine = ROUTINES[route.params.routineId ?? 'r1'] ?? ROUTINES['r1'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={routine.name} showBack />
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={routine.color} style={styles.hero}>
          <Text style={styles.heroEmoji}>{routine.emoji}</Text>
          <Text style={styles.heroTitle}>{routine.name}</Text>
          <Text style={styles.heroSubtitle}>{routine.steps.length} steps</Text>
        </LinearGradient>

        <View style={styles.content}>
          {routine.steps.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNum}>{index + 1}</Text>
                </View>
                <Text style={styles.stepName}>{step.name}</Text>
              </View>
              <Text style={styles.stepProduct}>💊 {step.product}</Text>
              <Text style={styles.stepTip}>💡 {step.tip}</Text>
            </View>
          ))}

          <Button title="Add to My Routine" onPress={() => {}} style={{ marginTop: SIZES.lg }} />
          <View style={{ height: SIZES.xl }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  hero: { padding: SIZES.xl, alignItems: 'center' },
  heroEmoji: { fontSize: 60, marginBottom: 8 },
  heroTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.white },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  content: { padding: SIZES.md },
  stepCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: SIZES.md, marginBottom: SIZES.sm, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.sm },
  stepBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: SIZES.sm },
  stepNum: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
  stepName: { fontSize: 16, fontWeight: '700', color: COLORS.text, flex: 1 },
  stepProduct: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 6 },
  stepTip: { fontSize: 13, color: COLORS.primary, fontStyle: 'italic' },
});