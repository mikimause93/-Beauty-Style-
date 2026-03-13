import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../theme';
import { useAiLookStore } from '../store/aiLookStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PRESETS = [
  { id: 'natural', label: 'Natural', emoji: '🌿', description: 'Fresh everyday look' },
  { id: 'glam', label: 'Glam', emoji: '✨', description: 'Dramatic & glamorous' },
  { id: 'editorial', label: 'Editorial', emoji: '📸', description: 'Avant-garde artistry' },
  { id: 'bridal', label: 'Bridal', emoji: '💍', description: 'Romantic bridal look' },
  { id: 'smoky', label: 'Smoky', emoji: '🖤', description: 'Sultry smoky eye' },
];

export default function AILookScreen({ navigation }) {
  const [photoUri, setPhotoUri] = useState(null);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const pollInterval = useRef(null);

  const {
    uploadId,
    jobId,
    jobStatus,
    resultUrls,
    selectedPreset,
    isUploading,
    isGenerating,
    error,
    setSelectedPreset,
    uploadPhoto,
    generateLook,
    pollStatus,
    saveLook,
    reset,
  } = useAiLookStore();

  // Poll for job status when generating
  useEffect(() => {
    if (isGenerating && jobId) {
      pollInterval.current = setInterval(async () => {
        const state = await pollStatus();
        if (state === 'completed' || state === 'failed') {
          clearInterval(pollInterval.current);
        }
      }, 3000);
    }
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [isGenerating, jobId]);

  const handlePickPhoto = async () => {
    if (!consentAccepted) {
      Alert.alert(
        'Consent Required',
        'To generate your AI look, we need your consent to process your photo. Your photo will only be used for AI style generation and will not be shared with third parties.',
        [
          { text: 'Decline', style: 'cancel' },
          {
            text: 'I Agree',
            onPress: async () => {
              setConsentAccepted(true);
              await pickImageFromLibrary();
            },
          },
        ]
      );
      return;
    }
    await pickImageFromLibrary();
  };

  const pickImageFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access to use AI Look.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      reset();
    }
  };

  const handleGenerate = async () => {
    if (!photoUri) {
      Alert.alert('No Photo', 'Please select a photo first.');
      return;
    }

    try {
      // Upload photo
      await uploadPhoto(photoUri);
      // Enqueue generation
      await generateLook('user-demo-id'); // In production, use actual userId from auth store
    } catch (err) {
      Alert.alert('Error', err.message || 'Generation failed');
    }
  };

  const handleBook = (resultUrl) => {
    navigation.navigate('BookingScreen', {
      generatedLookId: jobId,
      previewUrl: resultUrl,
    });
  };

  const renderPreset = ({ item }) => (
    <TouchableOpacity
      style={[styles.presetCard, selectedPreset === item.id && styles.presetCardSelected]}
      onPress={() => setSelectedPreset(item.id)}
      activeOpacity={0.8}
    >
      <Text style={styles.presetEmoji}>{item.emoji}</Text>
      <Text style={[styles.presetLabel, selectedPreset === item.id && styles.presetLabelSelected]}>
        {item.label}
      </Text>
      <Text style={styles.presetDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  const renderResult = ({ item, index }) => (
    <View style={styles.resultCard}>
      <Image source={{ uri: item }} style={styles.resultImage} resizeMode="cover" />
      <View style={styles.resultActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton]}
          onPress={() => saveLook(jobId, 'user-demo-id', item, selectedPreset)}
        >
          <Text style={styles.actionButtonText}>💾 Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.bookButton]}
          onPress={() => handleBook(item)}
        >
          <Text style={[styles.actionButtonText, { color: Colors.textOnPrimary }]}>
            📅 Book This Look
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✨ AI Look Studio</Text>
        <Text style={styles.headerSubtitle}>
          Upload your photo and let AI generate your perfect beauty look
        </Text>
      </View>

      {/* Photo Upload */}
      <TouchableOpacity style={styles.uploadArea} onPress={handlePickPhoto} activeOpacity={0.8}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.selectedPhoto} resizeMode="cover" />
        ) : (
          <View style={styles.uploadPlaceholder}>
            <Text style={styles.uploadIcon}>📷</Text>
            <Text style={styles.uploadText}>Tap to select your photo</Text>
            <Text style={styles.uploadSubtext}>Best results with a clear front-facing photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Consent notice */}
      {!consentAccepted && (
        <View style={styles.consentBanner}>
          <Text style={styles.consentText}>
            🔒 Your photo is processed securely. Tap the photo area to accept consent and upload.
          </Text>
        </View>
      )}

      {/* Style Presets */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Your Style</Text>
        <FlatList
          data={PRESETS}
          renderItem={renderPreset}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetList}
        />
      </View>

      {/* Generate Button */}
      <TouchableOpacity
        style={[
          styles.generateButton,
          (!photoUri || isUploading || isGenerating) && styles.generateButtonDisabled,
        ]}
        onPress={handleGenerate}
        disabled={!photoUri || isUploading || isGenerating}
        activeOpacity={0.85}
      >
        {isUploading || isGenerating ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={Colors.textOnPrimary} />
            <Text style={styles.generateButtonText}>
              {isUploading ? ' Uploading...' : ' Generating your look...'}
            </Text>
          </View>
        ) : (
          <Text style={styles.generateButtonText}>✨ Generate AI Look</Text>
        )}
      </TouchableOpacity>

      {/* Job Status */}
      {jobStatus && jobStatus !== 'completed' && jobStatus !== 'failed' && (
        <View style={styles.statusBanner}>
          <ActivityIndicator color={Colors.primary} size="small" />
          <Text style={styles.statusText}> Status: {jobStatus}...</Text>
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Results */}
      {resultUrls.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Generated Looks</Text>
          <FlatList
            data={resultUrls}
            renderItem={renderResult}
            keyExtractor={(item, idx) => `result-${idx}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.resultList}
          />
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  uploadArea: {
    margin: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    height: 280,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    ...Shadows.md,
  },
  selectedPhoto: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  uploadText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semiBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  uploadSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  consentBanner: {
    marginHorizontal: Spacing.lg,
    marginTop: -Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.infoLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.info,
  },
  consentText: {
    fontSize: FontSizes.sm,
    color: Colors.info,
    textAlign: 'center',
  },
  section: {
    paddingTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semiBold,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  presetList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  presetCard: {
    width: 100,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  presetCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceElevated,
  },
  presetEmoji: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  presetLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semiBold,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  presetLabelSelected: {
    color: Colors.primary,
  },
  presetDescription: {
    fontSize: 10,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  generateButton: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    ...Shadows.md,
  },
  generateButtonDisabled: {
    backgroundColor: Colors.textDisabled,
    ...Shadows.sm,
  },
  generateButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textOnPrimary,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
  },
  statusText: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: FontWeights.medium,
  },
  errorBanner: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: FontSizes.sm,
    color: Colors.error,
    textAlign: 'center',
  },
  resultList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  resultCard: {
    width: SCREEN_WIDTH * 0.7,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  resultImage: {
    width: '100%',
    height: 300,
  },
  resultActions: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.surface,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semiBold,
    color: Colors.textSecondary,
  },
});
