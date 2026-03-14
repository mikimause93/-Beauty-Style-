import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { COLORS, SIZES } from '../../utils/constants';

export function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Privacy Policy" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated: January 2024</Text>

        {[
          {
            title: '1. Information We Collect',
            body: 'We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes name, email address, profile information, and beauty preferences.',
          },
          {
            title: '2. How We Use Your Information',
            body: 'We use the information we collect to provide, maintain, and improve our services, process transactions, send you notifications, and personalize your experience on the Beauty & Style platform.',
          },
          {
            title: '3. Information Sharing',
            body: 'We do not sell, trade, or rent your personal information to third parties. We may share your information only with your consent, to comply with laws, to protect rights, or with service providers who assist in our operations.',
          },
          {
            title: '4. Data Security',
            body: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
          },
          {
            title: '5. Camera & Photo Access',
            body: 'Our Virtual Try-On feature requires camera access. Photos captured for try-on are processed locally on your device and are not stored on our servers without your explicit consent.',
          },
          {
            title: '6. Your Rights',
            body: 'You have the right to access, correct, or delete your personal information. You may also opt out of certain data processing activities. Contact us at privacy@beautystyle.app to exercise these rights.',
          },
          {
            title: '7. Contact Us',
            body: 'If you have questions about this Privacy Policy, please contact us at:\n\nEmail: privacy@beautystyle.app\nWebsite: https://beautystyle.app/privacy',
          },
        ].map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <View style={{ height: SIZES.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: SIZES.xl },
  lastUpdated: { fontSize: 13, color: COLORS.gray, marginBottom: SIZES.xl, fontStyle: 'italic' },
  section: { marginBottom: SIZES.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.sm },
  sectionBody: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
});
