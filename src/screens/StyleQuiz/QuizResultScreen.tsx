import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { COLORS, SIZES, MOCK_PRODUCTS } from '../../utils/constants';

export function QuizResultScreen() {
  const navigation = useNavigation();

  const recommendations = [
    'Focus on lightweight, hydrating formulas',
    'Use SPF 30+ daily for skin protection',
    'Try a vitamin C serum for radiance',
    'Incorporate retinol 2-3x per week',
    'Use a gentle, sulfate-free cleanser',
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[COLORS.secondary, COLORS.primary]} style={styles.header}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Your Beauty Profile</Text>
          <Text style={styles.subtitle}>Personalized just for you</Text>
        </LinearGradient>

        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            {[
              { label: 'Skin Type', value: 'Combination', emoji: '⚖️' },
              { label: 'Hair Type', value: 'Wavy', emoji: '〰️' },
              { label: 'Style', value: 'Natural', emoji: '🌸' },
            ].map(item => (
              <View key={item.label} style={styles.profileItem}>
                <Text style={styles.profileEmoji}>{item.emoji}</Text>
                <Text style={styles.profileLabel}>{item.label}</Text>
                <Text style={styles.profileValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Recommendations</Text>
          {recommendations.map((rec, i) => (
            <View key={i} style={styles.recRow}>
              <Text style={styles.recBullet}>✓</Text>
              <Text style={styles.recText}>{rec}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Products For You</Text>
          {MOCK_PRODUCTS.slice(0, 3).map(product => (
            <Card key={product.id} style={styles.productCard}>
              <View style={styles.productRow}>
                <Text style={{ fontSize: 36, marginRight: SIZES.md }}>🛍️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productBrand}>{product.brand}</Text>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPrice}>€{product.price.toFixed(2)}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.actions}>
          <Button title="Save Profile" onPress={() => {}} style={styles.saveButton} />
          <Button title="Retake Quiz" variant="outline" onPress={() => navigation.goBack()} />
        </View>

        <View style={{ height: SIZES.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SIZES.xl, alignItems: 'center' },
  emoji: { fontSize: 70, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.white },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  profileCard: { backgroundColor: COLORS.white, margin: SIZES.md, borderRadius: 20, padding: SIZES.lg, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  profileRow: { flexDirection: 'row', justifyContent: 'space-around' },
  profileItem: { alignItems: 'center' },
  profileEmoji: { fontSize: 32, marginBottom: 4 },
  profileLabel: { fontSize: 12, color: COLORS.gray },
  profileValue: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  section: { padding: SIZES.md },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.md },
  recRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SIZES.sm },
  recBullet: { fontSize: 16, color: COLORS.success, marginRight: SIZES.sm, fontWeight: 'bold' },
  recText: { flex: 1, fontSize: 15, color: COLORS.text, lineHeight: 22 },
  productCard: { marginBottom: SIZES.sm, padding: SIZES.sm },
  productRow: { flexDirection: 'row', alignItems: 'center' },
  productBrand: { fontSize: 11, color: COLORS.gray, textTransform: 'uppercase' },
  productName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary, marginTop: 2 },
  actions: { padding: SIZES.md, gap: SIZES.sm },
  saveButton: { marginBottom: SIZES.sm },
});
