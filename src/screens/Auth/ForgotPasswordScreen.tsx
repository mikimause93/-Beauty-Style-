import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
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
      Alert.alert('Errore', 'Inserisci il tuo indirizzo email');
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
        <Text style={styles.successTitle}>Controlla la tua email</Text>
        <Text style={styles.successText}>
          {'Abbiamo inviato un link per reimpostare la password a '}{email}{'. Controlla la tua casella di posta.'}
        </Text>
        <Button title="Torna al login" onPress={() => navigation.goBack()} style={{ marginTop: SIZES.xl }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <Header title="Reimposta password" showBack />
        <View style={styles.content}>
          <Text style={styles.emoji}>🔐</Text>
          <Text style={styles.title}>Password dimenticata?</Text>
          <Text style={styles.subtitle}>{'Inserisci la tua email e ti invieremo un link per reimpostare la password'}</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Indirizzo email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tua@email.com"
              placeholderTextColor={COLORS.gray}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleReset}
            />
          </View>
          <Button title="Invia link di reset" onPress={handleReset} loading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.white },
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