import { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SIZES } from '../../utils/constants';
import { ProfileStackParamList } from '../../types/navigation';

type SettingsNavProp = NativeStackNavigationProp<ProfileStackParamList, 'Settings'>;

export function SettingsScreen() {
  const navigation = useNavigation<SettingsNavProp>();
  const { logout } = useContext(AuthContext);

  const SETTING_SECTIONS = [
    {
      title: 'Notifications',
      items: [
        { id: 'push', label: 'Push Notifications', type: 'toggle' as const, value: true },
        { id: 'email', label: 'Email Notifications', type: 'toggle' as const, value: true },
        { id: 'promos', label: 'Promotional Offers', type: 'toggle' as const, value: false },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { id: 'language', label: 'Language', type: 'value' as const, value: 'English' },
        { id: 'currency', label: 'Currency', type: 'value' as const, value: 'EUR (€)' },
        { id: 'theme', label: 'Theme', type: 'value' as const, value: 'Light' },
      ],
    },
    {
      title: 'Privacy',
      items: [
        { id: 'private', label: 'Private Account', type: 'toggle' as const, value: false },
        { id: 'privacy', label: 'Privacy Policy', type: 'link' as const, screen: 'PrivacyPolicy' as const },
        { id: 'terms', label: 'Terms of Service', type: 'link' as const, screen: 'Terms' as const },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Settings" showBack />
      <ScrollView showsVerticalScrollIndicator={false}>
        {SETTING_SECTIONS.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <View
                  key={item.id}
                  style={[styles.settingRow, index < section.items.length - 1 && styles.settingBorder]}
                >
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  {item.type === 'toggle' && (
                    <Switch
                      value={item.value as boolean}
                      onValueChange={() => {}}
                      trackColor={{ false: COLORS.lightGray, true: COLORS.primaryLight }}
                      thumbColor={item.value ? COLORS.primary : COLORS.gray}
                    />
                  )}
                  {item.type === 'value' && (
                    <View style={styles.valueRow}>
                      <Text style={styles.settingValue}>{item.value as string}</Text>
                      <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
                    </View>
                  )}
                  {item.type === 'link' && (
                    <TouchableOpacity onPress={() => navigation.navigate(item.screen!)}>
                      <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel' },
            { text: 'Sign Out', onPress: () => logout(), style: 'destructive' },
          ])}
        >
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
        <View style={{ height: SIZES.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  section: { padding: SIZES.md, paddingBottom: 0 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: COLORS.gray, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SIZES.sm },
  sectionCard: { backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: SIZES.md },
  settingBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  settingLabel: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '500' },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.xs },
  settingValue: { fontSize: 14, color: COLORS.gray },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SIZES.sm, padding: SIZES.md, margin: SIZES.md, backgroundColor: COLORS.white, borderRadius: 16 },
  logoutText: { fontSize: 16, fontWeight: '600', color: COLORS.error },
  version: { textAlign: 'center', fontSize: 13, color: COLORS.gray, marginBottom: SIZES.md },
});
