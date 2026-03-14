import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { COLORS, SIZES, MOCK_APPOINTMENTS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import { ProfileStackParamList } from '../../types/navigation';

type MyApptNavProp = NativeStackNavigationProp<ProfileStackParamList, 'MyAppointments'>;

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  confirmed: { bg: '#E8F5E9', text: '#2E7D32' },
  pending: { bg: '#FFF3E0', text: '#E65100' },
  cancelled: { bg: '#FFEBEE', text: '#C62828' },
  completed: { bg: '#E3F2FD', text: '#1565C0' },
};

export function MyAppointmentsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="My Appointments" showBack />
      <FlatList
        data={MOCK_APPOINTMENTS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const statusColors = STATUS_COLORS[item.status];
          return (
            <View style={styles.appointmentCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.salonName}>{item.salonName}</Text>
                <Badge label={item.status} color={statusColors.bg} textColor={statusColors.text} />
              </View>
              <Text style={styles.serviceName}>{item.serviceName}</Text>
              <View style={styles.cardMeta}>
                <Text style={styles.metaText}>📅 {formatDate(item.date)}</Text>
                <Text style={styles.metaText}>🕐 {item.time}</Text>
                <Text style={styles.metaText}>💶 €{item.price}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyTitle}>No Appointments</Text>
            <Text style={styles.emptyText}>Your appointment history will appear here</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SIZES.md },
  appointmentCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: SIZES.md, marginBottom: SIZES.sm, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.xs },
  salonName: { fontSize: 16, fontWeight: '700', color: COLORS.text, flex: 1 },
  serviceName: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SIZES.sm },
  cardMeta: { flexDirection: 'row', gap: SIZES.md, flexWrap: 'wrap' },
  metaText: { fontSize: 13, color: COLORS.gray },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 60, marginBottom: SIZES.lg },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },
});
