import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { COLORS, SIZES, MOCK_APPOINTMENTS, MOCK_SALONS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import { AppointmentStackParamList } from '../../types/navigation';

type AppointmentDetailRoute = RouteProp<AppointmentStackParamList, 'AppointmentDetail'>;

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  confirmed: { bg: '#E8F5E9', text: '#2E7D32' },
  pending: { bg: '#FFF3E0', text: '#E65100' },
  cancelled: { bg: '#FFEBEE', text: '#C62828' },
  completed: { bg: '#E3F2FD', text: '#1565C0' },
};

export function AppointmentDetailScreen() {
  const route = useRoute<AppointmentDetailRoute>();
  const navigation = useNavigation();

  const appointment = MOCK_APPOINTMENTS.find(a => a.id === route.params.appointmentId) ?? MOCK_APPOINTMENTS[0];
  const salon = MOCK_SALONS.find(s => s.id === appointment.salonId);
  const statusColors = STATUS_COLORS[appointment.status];

  const handleCancel = () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => { navigation.goBack(); } },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Appointment Details" showBack />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statusBanner}>
          <Badge label={appointment.status.toUpperCase()} color={statusColors.bg} textColor={statusColors.text} />
        </View>

        <View style={styles.section}>
          <Text style={styles.salonName}>{appointment.salonName}</Text>
          {salon && <Text style={styles.salonAddress}>{salon.address}</Text>}
        </View>

        <View style={styles.detailsCard}>
          {[
            { icon: 'cut-outline' as const, label: 'Service', value: appointment.serviceName },
            { icon: 'calendar-outline' as const, label: 'Date', value: formatDate(appointment.date) },
            { icon: 'time-outline' as const, label: 'Time', value: appointment.time },
            { icon: 'cash-outline' as const, label: 'Price', value: `€${appointment.price}` },
          ].map(detail => (
            <View key={detail.label} style={styles.detailRow}>
              <Ionicons name={detail.icon} size={22} color={COLORS.primary} />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>{detail.label}</Text>
                <Text style={styles.detailValue}>{detail.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {(['confirmed', 'pending'] as string[]).includes(appointment.status) && (
          <View style={styles.actions}>
            <Button
              title="Cancel Appointment"
              variant="outline"
              onPress={handleCancel}
            />
          </View>
        )}

        <View style={{ height: SIZES.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  statusBanner: { padding: SIZES.lg, alignItems: 'center' },
  section: { paddingHorizontal: SIZES.xl, paddingBottom: SIZES.md },
  salonName: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  salonAddress: { fontSize: 14, color: COLORS.textSecondary },
  detailsCard: { backgroundColor: COLORS.white, margin: SIZES.md, borderRadius: 16, padding: SIZES.md, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'center', padding: SIZES.sm, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  detailInfo: { marginLeft: SIZES.md, flex: 1 },
  detailLabel: { fontSize: 12, color: COLORS.gray },
  detailValue: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  actions: { padding: SIZES.md },
});