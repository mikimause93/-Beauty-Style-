import { useState, useContext, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthContext } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { COLORS, SIZES } from '../../utils/constants';
import { AuthStackParamList } from '../../types/navigation';

type RegisterNavProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export function RegisterScreen() {
  const navigation = useNavigation<RegisterNavProp>();
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Errore', 'Compila tutti i campi');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Errore', 'Le password non coincidono');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Errore', 'La password deve essere di almeno 6 caratteri');
      return;
    }
    setLoading(true);
    const result = await register(name.trim(), email.trim(), password);
    setLoading(false);
    if (!result.success) {
      Alert.alert('Registrazione fallita', result.error ?? 'Riprova');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={[COLORS.secondary, COLORS.primary]} style={styles.header}>
          <Text style={styles.logo}>✨</Text>
          <Text style={styles.title}>Crea Account</Text>
          <Text style={styles.subtitle}>Unisciti alla community beauty</Text>
        </LinearGradient>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Il tuo nome"
              placeholderTextColor={COLORS.gray}
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Indirizzo email</Text>
            <TextInput
              ref={emailRef}
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tua@email.com"
              placeholderTextColor={COLORS.gray}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                ref={passwordRef}
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 6 caratteri"
                placeholderTextColor={COLORS.gray}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                blurOnSubmit={false}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Conferma password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                ref={confirmPasswordRef}
                style={[styles.input, styles.passwordInput]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Ripeti la password"
                placeholderTextColor={COLORS.gray}
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                <Text style={{ fontSize: 18 }}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Button title="Crea Account" onPress={handleRegister} loading={loading} style={styles.button} />

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginButton}>
            <Text style={styles.loginText}>
              {'Hai già un account? '}<Text style={styles.loginLink}>Accedi</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.white },
  header: { paddingTop: 80, paddingBottom: 40, alignItems: 'center' },
  logo: { fontSize: 50, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.white },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  form: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    padding: SIZES.xl,
  },
  inputContainer: { marginBottom: SIZES.md },
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.md,
  },
  passwordInput: { flex: 1, borderWidth: 0 },
  eyeButton: { padding: 8 },
  button: { marginTop: SIZES.sm, marginBottom: SIZES.lg },
  loginButton: { alignItems: 'center' },
  loginText: { fontSize: 16, color: COLORS.textSecondary },
  loginLink: { color: COLORS.primary, fontWeight: '700' },
});