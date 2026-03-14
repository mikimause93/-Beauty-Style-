import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { COLORS, SIZES } from '../../utils/constants';

export function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successEmoji}>📧</Text>
        <Text style={styles.successTitle}>Check Your Email</Text>
        <Text style={styles.successText}>
          {"We've sent a password reset link to "}{email}{". Please check your inbox."}
        </Text>
        <Button title="Back to Login" onPress={() => navigation.goBack()} style={{ marginTop: SIZES.xl }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Reset Password" showBack />
      <View style={styles.content}>
        <Text style={styles.emoji}>🔐</Text>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>{"Enter your email and we'll send you a reset link"}</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={COLORS.gray}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <Button title="Send Reset Link" onPress={handleReset} loading={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: SIZES.xl },
  emoji: { fontSize: 60, marginBottom: SIZES.lg, textAlign: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SIZES.xl },
  inputContainer: { marginBottom: SIZES.lg },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.md,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SIZES.xl, backgroundColor: COLORS.white },
  successEmoji: { fontSize: 70, marginBottom: SIZES.lg },
  successTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  successText: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24 },
});
