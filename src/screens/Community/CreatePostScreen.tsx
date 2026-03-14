import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { COLORS, SIZES } from '../../utils/constants';

const SUGGESTED_TAGS = ['skincare', 'makeup', 'haircare', 'nails', 'wellness', 'beauty', 'tutorial', 'glam'];

export function CreatePostScreen() {
  const navigation = useNavigation();
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handlePost = () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please write something to share!');
      return;
    }
    Alert.alert('Posted!', 'Your post has been shared with the community', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Create Post" showBack />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.inputArea}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>Y</Text>
            </View>
            <Text style={styles.youLabel}>You</Text>
          </View>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="Share your beauty tips, looks, or experiences..."
            placeholderTextColor={COLORS.gray}
            multiline
            numberOfLines={5}
            maxLength={500}
          />
          <Text style={styles.charCount}>{content.length}/500</Text>
        </View>

        <View style={styles.addPhotos}>
          <TouchableOpacity style={styles.photoButton}>
            <Ionicons name="image-outline" size={24} color={COLORS.primary} />
            <Text style={styles.photoButtonText}>Add Photos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tagsSection}>
          <Text style={styles.tagsTitle}>Add Tags</Text>
          <View style={styles.tagsGrid}>
            {SUGGESTED_TAGS.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[styles.tagChip, selectedTags.includes(tag) && styles.tagChipActive]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button title="Share Post" onPress={handlePost} style={{ marginTop: SIZES.lg }} />
        <View style={{ height: SIZES.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: SIZES.md },
  inputArea: { borderWidth: 1.5, borderColor: COLORS.lightGray, borderRadius: 16, padding: SIZES.md, marginBottom: SIZES.md },
  avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.sm },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: SIZES.sm },
  avatarText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
  youLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  contentInput: { fontSize: 15, color: COLORS.text, lineHeight: 22, minHeight: 100, textAlignVertical: 'top' },
  charCount: { fontSize: 12, color: COLORS.gray, alignSelf: 'flex-end', marginTop: SIZES.xs },
  addPhotos: { borderWidth: 1.5, borderColor: COLORS.lightGray, borderRadius: 12, borderStyle: 'dashed', padding: SIZES.lg, alignItems: 'center', marginBottom: SIZES.md },
  photoButton: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  photoButtonText: { fontSize: 15, color: COLORS.primary, fontWeight: '600' },
  tagsSection: { marginBottom: SIZES.md },
  tagsTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.sm },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.xs },
  tagChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.lightGray },
  tagChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tagText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  tagTextActive: { color: COLORS.white, fontWeight: '700' },
});