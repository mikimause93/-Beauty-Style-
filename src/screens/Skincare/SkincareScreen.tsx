import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { COLORS, SIZES } from '../../utils/constants';
import { BeautyStackParamList } from '../../types/navigation';

type SkincareNavProp = NativeStackNavigationProp<BeautyStackParamList, 'Skincare'>;

const ROUTINES = [
  { id: 'r1', name: 'Morning Routine', emoji: '🌅', steps: 5, duration: '10 min', description: 'Cleanse, tone, serum, moisturize, SPF' },
  { id: 'r2', name: 'Evening Routine', emoji: '🌙', steps: 6, duration: '15 min', description: 'Double cleanse, exfoliate, treatments, moisturize' },
  { id: 'r3', name: 'Weekly Mask', emoji: '🧖‍♀️', steps: 3, duration: '20 min', description: 'Deep cleanse, mask, hydrate' },
];

const SKIN_TYPES = [
  { type: 'Dry', emoji: '💧', color: '#2196F3', tip: 'Focus on hydration and barrier repair' },
  { type: 'Oily', emoji: '✨', color: '#4CAF50', tip: 'Use lightweight, oil-free products' },
  { type: 'Combination', emoji: '⚖️', color: '#FF9800', tip: 'Zone-specific care works best' },
  { type: 'Sensitive', emoji: '🌸', color: '#E91E63', tip: 'Choose fragrance-free formulas' },
];

export function SkincareScreen() {
  const navigation = useNavigation<SkincareNavProp>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Skincare" showBack />
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#9C27B0', '#673AB7']} style={styles.banner}>
          <Text style={styles.bannerEmoji}>✨</Text>
          <Text style={styles.bannerTitle}>Your Skincare Journey</Text>
          <Text style={styles.bannerSubtitle}>Routines tailored for your skin</Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Routines</Text>
          {ROUTINES.map(routine => (
            <Card
              key={routine.id}
              style={styles.routineCard}
              onPress={() => navigation.navigate('SkincareRoutine', { routineId: routine.id })}
            >
              <View style={styles.routineRow}>
                <Text style={styles.routineEmoji}>{routine.emoji}</Text>
                <View style={styles.routineInfo}>
                  <Text style={styles.routineName}>{routine.name}</Text>
                  <Text style={styles.routineDesc}>{routine.description}</Text>
                  <Text style={styles.routineMeta}>{routine.steps} steps · {routine.duration}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skin Types</Text>
          <View style={styles.skinGrid}>
            {SKIN_TYPES.map(st => (
              <View key={st.type} style={[styles.skinCard, { borderLeftColor: st.color, borderLeftWidth: 4 }]}>
                <Text style={styles.skinEmoji}>{st.emoji}</Text>
                <Text style={[styles.skinType, { color: st.color }]}>{st.type}</Text>
                <Text style={styles.skinTip}>{st.tip}</Text>
              </View>
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
  routineCard: { marginBottom: SIZES.sm },
  routineRow: { flexDirection: 'row', alignItems: 'center' },
  routineEmoji: { fontSize: 40, marginRight: SIZES.md },
  routineInfo: { flex: 1 },
  routineName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  routineDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  routineMeta: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
  skinGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm },
  skinCard: { width: '47%', backgroundColor: COLORS.white, borderRadius: 12, padding: SIZES.md, marginBottom: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  skinEmoji: { fontSize: 28, marginBottom: 6 },
  skinType: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  skinTip: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
});