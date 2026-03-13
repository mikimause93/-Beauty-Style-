import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Look {
  id: string;
  originalUrl: string;
}

interface Preset {
  key: string;
  label: string;
  emoji: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const API_URL = process.env.EXPO_PUBLIC_API_URL || '';
const POLL_INTERVAL_MS = 3000;

const PRESETS: Preset[] = [
  { key: 'bob-short', label: 'Bob Corto', emoji: '✂️' },
  { key: 'long-waves', label: 'Onde Lunghe', emoji: '🌊' },
  { key: 'pixie', label: 'Pixie Cut', emoji: '⚡' },
  { key: 'fade-beard', label: 'Fade & Barba', emoji: '🪒' },
  { key: 'blonde-balayage', label: 'Balayage', emoji: '✨' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AILookScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [look, setLook] = useState<Look | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'queued' | 'processing' | 'done' | 'failed'>('idle');
  const [resultUrls, setResultUrls] = useState<string[]>([]);
  const [consentGiven, setConsentGiven] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // -------------------------------------------------------------------------
  // Consent gate
  // -------------------------------------------------------------------------
  if (!consentGiven) {
    return (
      <View style={styles.consentContainer}>
        <Text style={styles.consentTitle}>AI Look – Consenso</Text>
        <Text style={styles.consentText}>
          Caricando una foto accetti che essa venga trasmessa ai nostri provider AI
          (Replicate / Stability AI) per generare preview stilistici. Le immagini non
          vengono condivise con terze parti a scopo commerciale e possono essere
          eliminate in qualsiasi momento dalle impostazioni. Consulta la nostra
          Informativa Privacy per i dettagli.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => setConsentGiven(true)}>
          <Text style={styles.primaryButtonText}>Accetto & Continua</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const pickImage = async () => {
    const { status: perm } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm !== 'granted') {
      Alert.alert('Permesso negato', 'Consenti accesso alla galleria nelle impostazioni.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    setPhotoUri(asset.uri);
    setResultUrls([]);
    setSelectedPreset(null);
    setStatus('uploading');

    try {
      const form = new FormData();
      form.append('photo', {
        uri: asset.uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const res = await axios.post(`${API_URL}/api/ai-look/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setLook({ id: res.data.id, originalUrl: res.data.originalUrl });
      setStatus('idle');
    } catch (err) {
      console.error('Upload error', err);
      setStatus('failed');
      Alert.alert('Errore', 'Caricamento foto fallito. Riprova.');
    }
  };

  const generate = async (preset: string) => {
    if (!look) return;

    setSelectedPreset(preset);
    setStatus('queued');
    setResultUrls([]);

    try {
      await axios.post(`${API_URL}/api/ai-look/generate`, {
        id: look.id,
        preset,
        provider: 'replicate',
      });

      setStatus('processing');
      startPolling(look.id);
    } catch (err) {
      console.error('Generate error', err);
      setStatus('failed');
      Alert.alert('Errore', 'Generazione fallita. Riprova.');
    }
  };

  const startPolling = (lookId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`${API_URL}/api/ai-look/status/${lookId}`);
        if (res.data.status === 'done' && res.data.resultUrls?.length > 0) {
          clearInterval(pollRef.current!);
          setResultUrls(res.data.resultUrls);
          setStatus('done');
        } else if (res.data.status === 'failed') {
          clearInterval(pollRef.current!);
          setStatus('failed');
        }
      } catch (err) {
        console.error('Poll error', err);
      }
    }, POLL_INTERVAL_MS);
  };

  const saveLook = async () => {
    if (!look) return;
    try {
      await axios.post(`${API_URL}/api/ai-look/save`, { id: look.id });
      Alert.alert('Salvato!', 'Il look è stato salvato nel tuo profilo.');
    } catch {
      Alert.alert('Errore', 'Salvataggio fallito.');
    }
  };

  const bookLook = async () => {
    if (!look) return;
    // Navigate to booking screen with pre-filled lookId.
    // Replace with proper navigation (e.g. router.push) when integrated.
    Alert.alert(
      'Prenota',
      `Vuoi prenotare questo look? (lookId: ${look.id})`,
      [{ text: 'OK' }]
    );
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>AI Look</Text>
      <Text style={styles.subtitle}>Scopri il tuo nuovo stile con l'intelligenza artificiale</Text>

      {/* Pick photo */}
      <TouchableOpacity style={styles.primaryButton} onPress={pickImage} disabled={status === 'uploading'}>
        {status === 'uploading' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>📷 Scegli Foto</Text>
        )}
      </TouchableOpacity>

      {/* Preview original */}
      {photoUri && (
        <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="cover" />
      )}

      {/* Presets */}
      {look && (
        <View style={styles.presetsSection}>
          <Text style={styles.sectionTitle}>Scegli il tuo stile</Text>
          <View style={styles.presetsGrid}>
            {PRESETS.map((p) => (
              <TouchableOpacity
                key={p.key}
                style={[
                  styles.presetChip,
                  selectedPreset === p.key && styles.presetChipActive,
                ]}
                onPress={() => generate(p.key)}
                disabled={status === 'processing' || status === 'queued'}
              >
                <Text style={styles.presetEmoji}>{p.emoji}</Text>
                <Text style={[styles.presetLabel, selectedPreset === p.key && styles.presetLabelActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Status indicator */}
      {(status === 'queued' || status === 'processing') && (
        <View style={styles.statusRow}>
          <ActivityIndicator color="#667eea" size="large" />
          <Text style={styles.statusText}>
            {status === 'queued' ? 'In coda...' : 'Generazione in corso...'}
          </Text>
        </View>
      )}

      {status === 'failed' && (
        <Text style={styles.errorText}>❌ Generazione fallita. Seleziona un preset per riprovare.</Text>
      )}

      {/* Results */}
      {resultUrls.length > 0 && (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Risultati</Text>
          {resultUrls.map((url, i) => (
            <View key={i} style={styles.resultCard}>
              <Image source={{ uri: url }} style={styles.resultImage} resizeMode="cover" />
            </View>
          ))}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={saveLook}>
              <Text style={styles.secondaryButtonText}>💾 Salva Look</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={bookLook}>
              <Text style={styles.primaryButtonText}>📅 Prenota</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const PRIMARY = '#667eea';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  consentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  consentTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 16,
  },
  consentText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    marginVertical: 16,
  },
  presetsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 12,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginBottom: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  presetChipActive: {
    borderColor: PRIMARY,
    backgroundColor: '#eef0ff',
  },
  presetEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  presetLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
  },
  presetLabelActive: {
    color: PRIMARY,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  statusText: {
    fontSize: 15,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    color: '#e53935',
    fontSize: 14,
  },
  resultsSection: {
    marginTop: 24,
  },
  resultCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  resultImage: {
    width: '100%',
    height: 340,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: PRIMARY,
  },
  secondaryButtonText: {
    color: PRIMARY,
    fontWeight: '700',
    fontSize: 15,
  },
});
