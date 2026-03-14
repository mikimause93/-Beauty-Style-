import { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SIZES } from '../../utils/constants';
import { ProfileStackParamList } from '../../types/navigation';

type ProfileNavProp = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

const MENU_ITEMS = [
  { icon: 'person-outline' as const, title: 'Edit Profile', screen: 'EditProfile' as const },
  { icon: 'heart-outline' as const, title: 'My Favorites', screen: 'Favorites' as const },
  { icon: 'calendar-outline' as const, title: 'My Appointments', screen: 'MyAppointments' as const },
  { icon: 'settings-outline' as const, title: 'Settings', screen: 'Settings' as const },
  { icon: 'shield-outline' as const, title: 'Privacy Policy', screen: 'PrivacyPolicy' as const },
  { icon: 'document-text-outline' as const, title: 'Terms of Service', screen: 'Terms' as const },
];

export function ProfileScreen() {
  const navigation = useNavigation<ProfileNavProp>();
  const { user, logout } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? 'U'}</Text>
            </View>
            <TouchableOpacity style={styles.editAvatarBtn} onPress={() => navigation.navigate('EditProfile')}>
              <Ionicons name="camera" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name ?? 'Beauty Lover'}</Text>
          <Text style={styles.userEmail}>{user?.email ?? ''}</Text>

          <View style={styles.statsRow}>
            {[{ value: '52', label: 'Posts' }, { value: '1.2K', label: 'Followers' }, { value: '340', label: 'Following' }].map(stat => (
              <View key={stat.label} style={styles.stat}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.menu}>
          {MENU_ITEMS.map(item => (
            <TouchableOpacity
              key={item.screen}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={() => logout()}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: SIZES.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SIZES.xl, alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: SIZES.sm },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: COLORS.white },
  avatarText: { color: COLORS.white, fontSize: 38, fontWeight: 'bold' },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.white },
  userName: { fontSize: 22, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
  userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: SIZES.md },
  statsRow: { flexDirection: 'row', gap: SIZES.xl },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  menu: { backgroundColor: COLORS.white, margin: SIZES.md, borderRadius: 20, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: SIZES.md, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  menuIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryLight + '20', alignItems: 'center', justifyContent: 'center', marginRight: SIZES.md },
  menuTitle: { flex: 1, fontSize: 15, fontWeight: '500', color: COLORS.text },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SIZES.sm, padding: SIZES.md, marginHorizontal: SIZES.md, backgroundColor: COLORS.white, borderRadius: 16, marginBottom: SIZES.md },
  logoutText: { fontSize: 16, fontWeight: '600', color: COLORS.error },
});
