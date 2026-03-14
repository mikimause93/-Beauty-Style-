import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { COLORS, SIZES } from '../../utils/constants';

export function TermsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Terms of Service" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated: January 2024</Text>

        {[
          {
            title: '1. Acceptance of Terms',
            body: 'By downloading, installing, or using the Beauty & Style application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our application.',
          },
          {
            title: '2. Use of the Service',
            body: 'You may use our service only for lawful purposes and in accordance with these Terms. You agree not to use the service in any way that violates applicable laws, infringes intellectual property rights, or transmits harmful content.',
          },
          {
            title: '3. User Accounts',
            body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.',
          },
          {
            title: '4. Content',
            body: 'You retain ownership of content you post on Beauty & Style. By posting content, you grant us a non-exclusive license to use, display, and distribute that content on our platform.',
          },
          {
            title: '5. Appointment Bookings',
            body: 'Appointment bookings made through the app are subject to the salon\'s individual cancellation and refund policies. Beauty & Style acts as a platform connecting users with service providers and is not responsible for the services provided.',
          },
          {
            title: '6. Disclaimer',
            body: 'Beauty & Style provides beauty tips and recommendations for informational purposes only. Always consult a professional for advice specific to your individual needs and health conditions.',
          },
          {
            title: '7. Contact',
            body: 'For questions about these Terms, contact us at:\n\nEmail: legal@beautystyle.app\nWebsite: https://beautystyle.app/terms',
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