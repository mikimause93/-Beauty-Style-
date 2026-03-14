import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { COLORS, SIZES, MOCK_SALONS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import { AppointmentStackParamList } from '../../types/navigation';

type ConfirmRoute = RouteProp<AppointmentStackParamList, 'ConfirmBooking'>;

export function ConfirmBookingScreen() {
  const navigation = useNavigation();
  const route = useRoute<ConfirmRoute>();
  const { salonId, serviceId, date, time } = route.params;

  const salon = MOCK_SALONS.find(s => s.id === salonId) ?? MOCK_SALONS[0];
  const service = salon.services.find(sv => sv.id === serviceId) ?? salon.services[0];

  const handleConfirm = () => {
    Alert.alert(
      'Booking Confirmed! 🎉',
      `Your appointment at ${salon.name} for ${service.name} on ${formatDate(date)} at ${time} has been booked.`,
      [{ text: 'Great!', onPress: () => navigation.navigate('Appointments' as never) }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Confirm Booking" showBack />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>

          {[
            { icon: 'storefront-outline' as const, label: 'Salon', value: salon.name },
            { icon: 'cut-outline' as const, label: 'Service', value: service.name },
            { icon: 'calendar-outline' as const, label: 'Date', value: formatDate(date) },
            { icon: 'time-outline' as const, label: 'Time', value: time },
            { icon: 'timer-outline' as const, label: 'Duration', value: `${service.duration} min` },
            { icon: 'cash-outline' as const, label: 'Total Price', value: `€${service.price}` },
          ].map(item => (
            <View key={item.label} style={styles.detailRow}>
              <Ionicons name={item.icon} size={22} color={COLORS.primary} />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={[styles.detailValue, item.label === 'Total Price' && { color: COLORS.primary, fontSize: 18 }]}>
                  {item.value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.noticeText}>You can cancel or reschedule up to 24 hours before the appointment</Text>
        </View>

        <View style={styles.actions}>
          <Button title="Confirm Booking" onPress={handleConfirm} style={styles.confirmButton} />
          <Button title="Go Back" variant="outline" onPress={() => navigation.goBack()} />
        </View>

        <View style={{ height: SIZES.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  summaryCard: { backgroundColor: COLORS.white, margin: SIZES.md, borderRadius: 20, padding: SIZES.lg, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
  summaryTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.md },
  detailRow: { flexDirection: 'row', alignItems: 'center', padding: SIZES.sm, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  detailInfo: { marginLeft: SIZES.md, flex: 1 },
  detailLabel: { fontSize: 12, color: COLORS.gray },
  detailValue: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  notice: { flexDirection: 'row', alignItems: 'flex-start', margin: SIZES.md, padding: SIZES.md, backgroundColor: COLORS.primaryLight + '15', borderRadius: 12, gap: SIZES.sm },
  noticeText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  actions: { padding: SIZES.md, gap: SIZES.sm },
  confirmButton: { marginBottom: SIZES.sm },
});
