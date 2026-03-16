import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../../components/common/Header';
import { COLORS, SIZES, MOCK_SALONS } from '../../utils/constants';
import { AppointmentStackParamList } from '../../types/navigation';

type ServiceNavProp = NativeStackNavigationProp<AppointmentStackParamList, 'SelectService'>;
type ServiceRoute = RouteProp<AppointmentStackParamList, 'SelectService'>;

const CATEGORY_EMOJIS: Record<string, string> = {
  hair: '💇‍♀️',
  skin: '✨',
  nails: '💅',
  brow: '🤨',
  lash: '👁️',
};

export function SelectServiceScreen() {
  const navigation = useNavigation<ServiceNavProp>();
  const route = useRoute<ServiceRoute>();

  const salon = MOCK_SALONS.find(s => s.id === route.params.salonId) ?? MOCK_SALONS[0];

  const handleSelectService = (serviceId: string) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    navigation.navigate('ConfirmBooking', {
      salonId: salon.id,
      serviceId,
      date: tomorrow.toISOString().split('T')[0],
      time: '14:00',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={salon.name} showBack />

      <FlatList
        data={salon.services}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={() => (
          <Text style={styles.listHeader}>Select a Service</Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.serviceCard} onPress={() => handleSelectService(item.id)}>
            <Text style={styles.serviceEmoji}>{CATEGORY_EMOJIS[item.category] ?? '💆‍♀️'}</Text>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{item.name}</Text>
              <Text style={styles.serviceMeta}>⏱ {item.duration} min</Text>
            </View>
            <Text style={styles.servicePrice}>€{item.price}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SIZES.md },
  listHeader: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.md },
  serviceCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: SIZES.md, marginBottom: SIZES.sm, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  serviceEmoji: { fontSize: 36, marginRight: SIZES.md },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  serviceMeta: { fontSize: 13, color: COLORS.gray, marginTop: 4 },
  servicePrice: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
});