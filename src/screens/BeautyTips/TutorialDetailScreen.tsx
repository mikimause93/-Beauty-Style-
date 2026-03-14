import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { COLORS, SIZES, MOCK_TUTORIALS } from '../../utils/constants';
import { BeautyStackParamList } from '../../types/navigation';

type TutorialDetailRoute = RouteProp<BeautyStackParamList, 'TutorialDetail'>;

const SAMPLE_STEPS = [
  { id: '1', order: 1, title: 'Prep Your Skin', description: 'Start with a clean, moisturized face. Apply a primer to ensure your makeup lasts longer.' },
  { id: '2', order: 2, title: 'Apply Foundation', description: 'Use a beauty blender or brush to apply foundation evenly, blending well at the edges.' },
  { id: '3', order: 3, title: 'Conceal & Highlight', description: 'Apply concealer under your eyes and on any blemishes. Blend with gentle tapping motions.' },
  { id: '4', order: 4, title: 'Define Your Brows', description: 'Fill in your brows with light, hair-like strokes using a brow pencil or powder.' },
  { id: '5', order: 5, title: 'Add Eye Shadow', description: 'Apply a neutral base color across the lid, then add a deeper shade to the crease for depth.' },
  { id: '6', order: 6, title: 'Final Touches', description: 'Add mascara, lip color, and a setting spray to complete your look.' },
];

export function TutorialDetailScreen() {
  const route = useRoute<TutorialDetailRoute>();
  const tutorial = MOCK_TUTORIALS.find(t => t.id === route.params.tutorialId) ?? MOCK_TUTORIALS[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="" showBack rightIcon="heart-outline" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.hero}>
          <Text style={styles.heroEmoji}>{tutorial.category === 'makeup' ? '💄' : tutorial.category === 'skincare' ? '✨' : '💇‍♀️'}</Text>
          <Badge label={tutorial.category.toUpperCase()} color="rgba(255,255,255,0.3)" textColor={COLORS.white} />
          <Text style={styles.title}>{tutorial.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>⏱ {tutorial.duration} min</Text>
            <Text style={styles.metaText}>❤️ {tutorial.likes}</Text>
            <Text style={styles.metaText}>👤 {tutorial.author}</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>About This Tutorial</Text>
          <Text style={styles.description}>{tutorial.description}</Text>
          <Badge label={tutorial.difficulty.toUpperCase()} color={COLORS.primaryLight + '20'} textColor={COLORS.primary} />

          <Text style={[styles.sectionTitle, { marginTop: SIZES.lg }]}>Steps ({SAMPLE_STEPS.length})</Text>

          {SAMPLE_STEPS.map(step => (
            <View key={step.id} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.order}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}

          <Text style={[styles.sectionTitle, { marginTop: SIZES.lg }]}>Tags</Text>
          <View style={styles.tags}>
            {tutorial.tags.map(tag => (
              <Badge key={tag} label={`#${tag}`} color={COLORS.lightGray} textColor={COLORS.textSecondary} />
            ))}
          </View>

          <Button title="Start Tutorial" onPress={() => {}} style={{ marginTop: SIZES.xl }} />
          <View style={{ height: SIZES.xl }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  hero: { padding: SIZES.xl, alignItems: 'center' },
  heroEmoji: { fontSize: 70, marginBottom: SIZES.md },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.white, textAlign: 'center', marginTop: SIZES.sm, marginBottom: SIZES.sm },
  metaRow: { flexDirection: 'row', gap: SIZES.md, flexWrap: 'wrap', justifyContent: 'center' },
  metaText: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  content: { padding: SIZES.xl },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.md },
  description: { fontSize: 16, color: COLORS.textSecondary, lineHeight: 24, marginBottom: SIZES.md },
  step: { flexDirection: 'row', marginBottom: SIZES.md },
  stepNumber: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: SIZES.md, flexShrink: 0 },
  stepNumberText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  stepDescription: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm },
});
