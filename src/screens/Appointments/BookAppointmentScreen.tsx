import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { COLORS, SIZES } from '../../utils/constants';
import { AppointmentStackParamList } from '../../types/navigation';

type BookNavProp = NativeStackNavigationProp<AppointmentStackParamList, 'BookAppointment'>;

const STEPS = [
  { num: 1, title: 'Choose Salon', emoji: '🏪', screen: 'SelectSalon' as const },
  { num: 2, title: 'Select Service', emoji: '✂️', screen: null },
  { num: 3, title: 'Pick Date & Time', emoji: '📅', screen: null },
  { num: 4, title: 'Confirm', emoji: '✅', screen: null },
];

export function BookAppointmentScreen() {
  const navigation = useNavigation<BookNavProp>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <Text style={styles.headerSubtitle}>Find and book beauty services near you</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.stepsTitle}>How It Works</Text>

        {STEPS.map(step => (
          <Card key={step.num} style={styles.stepCard}>
            <View style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{step.num}</Text>
              </View>
              <Text style={styles.stepEmoji}>{step.emoji}</Text>
              <Text style={styles.stepTitle}>{step.title}</Text>
            </View>
          </Card>
        ))}

        <Button
          title="Start Booking"
          onPress={() => navigation.navigate('SelectSalon')}
          style={{ marginTop: SIZES.xl }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SIZES.xl },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.white },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  content: { padding: SIZES.md },
  stepsTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.md },
  stepCard: { marginBottom: SIZES.sm },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: SIZES.md },
  stepNumText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
  stepEmoji: { fontSize: 28, marginRight: SIZES.md },
  stepTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});
