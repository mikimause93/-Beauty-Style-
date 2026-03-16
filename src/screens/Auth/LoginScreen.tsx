import { useState, useContext, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { COLORS, SIZES } from '../../utils/constants';
import { AuthStackParamList } from '../../types/navigation';

type LoginNavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<LoginNavProp>();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Errore', 'Compila tutti i campi');
      return;
    }
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (!result.success) {
      Alert.alert('Accesso fallito', result.error ?? 'Controlla le credenziali e riprova');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
          <Text style={styles.logo}>💄</Text>
          <Text style={styles.appName}>Beauty &amp; Style</Text>
          <Text style={styles.tagline}>Your personal beauty companion</Text>
        </LinearGradient>

        <View style={styles.form}>
          <Text style={styles.title}>Bentornata</Text>
          <Text style={styles.subtitle}>Accedi per continuare</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
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
                style={[styles.input, { flex: 1, borderWidth: 0 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Inserisci la password"
                placeholderTextColor={COLORS.gray}
                secureTextEntry={!showPassword}
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotButton}>
            <Text style={styles.forgotText}>Password dimenticata?</Text>
          </TouchableOpacity>

          <Button title="Accedi" onPress={handleLogin} loading={loading} style={styles.loginButton} />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>oppure</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>
              {'Non hai un account? '}<Text style={styles.registerLink}>Registrati</Text>
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
  logo: { fontSize: 60, marginBottom: 8 },
  appName: { fontSize: 32, fontWeight: 'bold', color: COLORS.white },
  tagline: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  form: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    padding: SIZES.xl,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginBottom: SIZES.xl },
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
  eyeButton: { padding: 8 },
  forgotButton: { alignSelf: 'flex-end', marginBottom: SIZES.lg },
  forgotText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  loginButton: { marginBottom: SIZES.lg },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.lightGray },
  dividerText: { marginHorizontal: SIZES.sm, color: COLORS.gray, fontSize: 14 },
  registerButton: { alignItems: 'center' },
  registerText: { fontSize: 16, color: COLORS.textSecondary },
  registerLink: { color: COLORS.primary, fontWeight: '700' },
});