import { useState, useContext } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SIZES } from '../../utils/constants';

const SKIN_TYPES: Array<'dry' | 'oily' | 'combination' | 'normal' | 'sensitive'> = ['dry', 'oily', 'combination', 'normal', 'sensitive'];
const HAIR_TYPES: Array<'straight' | 'wavy' | 'curly' | 'coily'> = ['straight', 'wavy', 'curly', 'coily'];

export function EditProfileScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState('Beauty enthusiast & skincare lover ✨');
  const [skinType, setSkinType] = useState<'dry' | 'oily' | 'combination' | 'normal' | 'sensitive'>(user?.skinType ?? 'combination');
  const [hairType, setHairType] = useState<'straight' | 'wavy' | 'curly' | 'coily'>(user?.hairType ?? 'wavy');

  const handleSave = () => {
    Alert.alert('Saved!', 'Your profile has been updated', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Edit Profile" showBack />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name[0]?.toUpperCase() ?? 'U'}</Text>
          </View>
          <TouchableOpacity style={styles.changePhotoBtn}>
            <Ionicons name="camera-outline" size={18} color={COLORS.primary} />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            placeholderTextColor={COLORS.gray}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself..."
            placeholderTextColor={COLORS.gray}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Skin Type</Text>
          <View style={styles.optionsRow}>
            {SKIN_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.optionChip, skinType === type && styles.optionChipActive]}
                onPress={() => setSkinType(type)}
              >
                <Text style={[styles.optionText, skinType === type && styles.optionTextActive]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Hair Type</Text>
          <View style={styles.optionsRow}>
            {HAIR_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.optionChip, hairType === type && styles.optionChipActive]}
                onPress={() => setHairType(type)}
              >
                <Text style={[styles.optionText, hairType === type && styles.optionTextActive]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button title="Save Changes" onPress={handleSave} style={{ marginTop: SIZES.lg }} />
        <View style={{ height: SIZES.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: SIZES.xl },
  avatarSection: { alignItems: 'center', marginBottom: SIZES.xl },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: SIZES.sm },
  avatarText: { color: COLORS.white, fontSize: 38, fontWeight: 'bold' },
  changePhotoBtn: { flexDirection: 'row', alignItems: 'center', gap: SIZES.xs },
  changePhotoText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  field: { marginBottom: SIZES.lg },
  label: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.sm },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.md,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.xs },
  optionChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.lightGray },
  optionChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  optionText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  optionTextActive: { color: COLORS.white, fontWeight: '700' },
});
