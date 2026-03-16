import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../../components/common/Header';
import { SearchBar } from '../../components/common/SearchBar';
import { StarRating } from '../../components/common/StarRating';
import { COLORS, SIZES, MOCK_SALONS } from '../../utils/constants';
import { AppointmentStackParamList } from '../../types/navigation';

type SalonNavProp = NativeStackNavigationProp<AppointmentStackParamList, 'SelectSalon'>;

export function SelectSalonScreen() {
  const navigation = useNavigation<SalonNavProp>();
  const [query, setQuery] = useState('');

  const filtered = MOCK_SALONS.filter(s =>
    query.length === 0 || s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Choose a Salon" showBack />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search salons..." />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.salonCard}
            onPress={() => navigation.navigate('SelectService', { salonId: item.id })}
          >
            <View style={styles.salonThumb}>
              <Text style={{ fontSize: 40 }}>🏪</Text>
            </View>
            <View style={styles.salonInfo}>
              <Text style={styles.salonName}>{item.name}</Text>
              <Text style={styles.salonAddress}>{item.address}</Text>
              <View style={styles.salonMeta}>
                <StarRating rating={item.rating} size={14} />
                <Text style={styles.reviewCount}>({item.reviewCount})</Text>
              </View>
              <Text style={styles.openHours}>🕐 {item.openHours}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SIZES.md },
  salonCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: SIZES.md, marginBottom: SIZES.sm, flexDirection: 'row', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  salonThumb: { width: 80, height: 80, backgroundColor: COLORS.lightGray, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: SIZES.md },
  salonInfo: { flex: 1 },
  salonName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  salonAddress: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  salonMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  reviewCount: { fontSize: 12, color: COLORS.gray, marginLeft: 4 },
  openHours: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
});