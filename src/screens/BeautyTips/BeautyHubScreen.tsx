import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { BeautyStackParamList } from '../../types/navigation';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { COLORS, SIZES, MOCK_TUTORIALS } from '../../utils/constants';

type BeautyNavProp = NativeStackNavigationProp<BeautyStackParamList, 'BeautyHub'>;

const FEATURES = [
  { id: '1', title: 'Makeup Guide', emoji: '💄', color: '#FF69B4', screen: 'MakeupGuide' as const },
  { id: '2', title: 'Skincare', emoji: '✨', color: '#9C27B0', screen: 'Skincare' as const },
  { id: '3', title: 'Hairstyle', emoji: '💇‍♀️', color: '#E91E8C', screen: 'Hairstyle' as const },
  { id: '4', title: 'Products', emoji: '🛍️', color: '#FF4081', screen: 'Products' as const },
  { id: '5', title: 'Style Quiz', emoji: '🎯', color: '#673AB7', screen: 'StyleQuiz' as const },
  { id: '6', title: 'Virtual Try-On', emoji: '🪞', color: '#F06292', screen: 'VirtualTryOn' as const },
  { id: '7', title: 'Beauty Diary', emoji: '📔', color: '#AB47BC', screen: 'BeautyDiary' as const },
];

export function BeautyHubScreen() {
  const navigation = useNavigation<BeautyNavProp>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[COLORS.secondary, COLORS.primary]} style={styles.header}>
          <Text style={styles.headerTitle}>Beauty Hub ✨</Text>
          <Text style={styles.headerSubtitle}>Explore all beauty features</Text>
        </LinearGradient>

        <View style={styles.grid}>
          {FEATURES.map(feature => (
            <TouchableOpacity
              key={feature.id}
              style={[styles.featureCard, { backgroundColor: feature.color + '15' }]}
              onPress={() => navigation.navigate(feature.screen as never)}
            >
              <Text style={styles.featureEmoji}>{feature.emoji}</Text>
              <Text style={[styles.featureName, { color: feature.color }]}>{feature.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Tutorials</Text>
          {MOCK_TUTORIALS.map(tutorial => (
            <Card key={tutorial.id} style={styles.tutorialCard} onPress={() => navigation.navigate('TutorialDetail', { tutorialId: tutorial.id })}>
              <View style={styles.tutorialRow}>
                <View style={styles.tutorialThumb}>
                  <Text style={{ fontSize: 36 }}>{tutorial.category === 'makeup' ? '💄' : tutorial.category === 'skincare' ? '✨' : '💇‍♀️'}</Text>
                </View>
                <View style={styles.tutorialInfo}>
                  <Text style={styles.tutorialTitle} numberOfLines={2}>{tutorial.title}</Text>
                  <Text style={styles.tutorialAuthor}>by {tutorial.author}</Text>
                  <View style={styles.tutorialTags}>
                    <Badge label={tutorial.difficulty} color={COLORS.primaryLight + '30'} textColor={COLORS.primary} />
                    <Text style={styles.tutorialDuration}>  ⏱ {tutorial.duration} min</Text>
                  </View>
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
  header: { padding: SIZES.xl, paddingTop: SIZES.md },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.white },
  headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: SIZES.md, gap: SIZES.sm },
  featureCard: { width: '47%', borderRadius: 16, padding: SIZES.md, alignItems: 'center', marginBottom: 8 },
  featureEmoji: { fontSize: 40, marginBottom: 8 },
  featureName: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  section: { padding: SIZES.md },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.md },
  tutorialCard: { marginBottom: SIZES.sm, padding: SIZES.sm },
  tutorialRow: { flexDirection: 'row', alignItems: 'center' },
  tutorialThumb: { width: 75, height: 75, backgroundColor: COLORS.lightGray, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: SIZES.md },
  tutorialInfo: { flex: 1 },
  tutorialTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  tutorialAuthor: { fontSize: 13, color: COLORS.gray, marginBottom: 6 },
  tutorialTags: { flexDirection: 'row', alignItems: 'center' },
  tutorialDuration: { fontSize: 12, color: COLORS.textSecondary },
});
