import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { COLORS, SIZES, MOCK_APPOINTMENTS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import { AppointmentStackParamList } from '../../types/navigation';

type AppointmentNavProp = NativeStackNavigationProp<AppointmentStackParamList, 'Appointments'>;

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  confirmed: { bg: '#E8F5E9', text: '#2E7D32' },
  pending: { bg: '#FFF3E0', text: '#E65100' },
  cancelled: { bg: '#FFEBEE', text: '#C62828' },
  completed: { bg: '#E3F2FD', text: '#1565C0' },
};

export function AppointmentsScreen() {
  const navigation = useNavigation<AppointmentNavProp>();

  const upcoming = MOCK_APPOINTMENTS.filter(a => (['confirmed', 'pending'] as string[]).includes(a.status));
  const past = MOCK_APPOINTMENTS.filter(a => (['completed', 'cancelled'] as string[]).includes(a.status));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <Text style={styles.headerTitle}>Appointments 📅</Text>
        <Text style={styles.headerSubtitle}>Manage your beauty bookings</Text>
      </LinearGradient>

      <View style={styles.bookingBar}>
        <Button
          title="Book New Appointment"
          onPress={() => navigation.navigate('BookAppointment')}
          style={styles.bookButton}
        />
      </View>

      <FlatList
        data={[
          { key: 'upcomingHeader', type: 'header' as const, title: 'Upcoming' },
          ...upcoming.map(a => ({ key: a.id, type: 'appointment' as const, data: a })),
          { key: 'pastHeader', type: 'header' as const, title: 'Past' },
          ...past.map(a => ({ key: a.id, type: 'appointment' as const, data: a })),
        ]}
        keyExtractor={item => item.key}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return <Text style={styles.sectionTitle}>{item.title}</Text>;
          }
          const appt = item.data;
          const statusColors = STATUS_COLORS[appt.status];
          return (
            <TouchableOpacity
              style={styles.appointmentCard}
              onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: appt.id })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.salonName}>{appt.salonName}</Text>
                <Badge label={appt.status} color={statusColors.bg} textColor={statusColors.text} />
              </View>
              <Text style={styles.serviceName}>{appt.serviceName}</Text>
              <View style={styles.cardMeta}>
                <Text style={styles.metaText}>📅 {formatDate(appt.date)}</Text>
                <Text style={styles.metaText}>🕐 {appt.time}</Text>
                <Text style={styles.metaText}>💶 €{appt.price}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SIZES.xl },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.white },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  bookingBar: { padding: SIZES.md, paddingBottom: 0 },
  bookButton: { width: '100%' },
  list: { padding: SIZES.md },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: SIZES.md, marginBottom: SIZES.sm },
  appointmentCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: SIZES.md, marginBottom: SIZES.sm, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.xs },
  salonName: { fontSize: 16, fontWeight: '700', color: COLORS.text, flex: 1 },
  serviceName: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SIZES.sm },
  cardMeta: { flexDirection: 'row', gap: SIZES.md, flexWrap: 'wrap' },
  metaText: { fontSize: 13, color: COLORS.gray },
});
