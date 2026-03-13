import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

// Replace with your real auth store import
// import { useAuthStore } from '../../store/authStore';

const PRESETS: { key: string; label: string }[] = [
  { key: 'bob-short', label: 'Bob corto' },
  { key: 'long-waves', label: 'Onde lunghe' },
  { key: 'pixie', label: 'Pixie cut' },
  { key: 'fade-beard', label: 'Fade & barba' },
  { key: 'blonde-balayage', label: 'Balayage biondo' }
];

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

export default function AILookScreen() {
  // const { token } = useAuthStore();
  const token: string | null = null; // swap with real token

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [lookId, setLookId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'queued' | 'processing' | 'done' | 'error'>('idle');
  const [results, setResults] = useState<string[]>([]);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permesso necessario', 'Abilita l\'accesso alla galleria nelle impostazioni.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 5]
    });
    if (res.canceled) return;

    const asset = res.assets[0];
    setPhotoUri(asset.uri);
    setStatus('uploading');
    setLookId(null);
    setResults([]);

    try {
      const form = new FormData();
      form.append('photo', {
        uri: asset.uri,
        name: 'photo.jpg',
        type: 'image/jpeg'
      } as unknown as Blob);

      const headers: Record<string, string> = {
        'Content-Type': 'multipart/form-data'
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const r = await axios.post(`${API_BASE}/api/ai-look/upload`, form, { headers });
      setLookId(r.data.id);
      setStatus('idle');
    } catch (err) {      console.error('Upload error', err);
      setStatus('error');
      Alert.alert('Errore', 'Caricamento foto fallito. Riprova.');
    }
  };

  const generate = async (preset: string) => {
    if (!lookId) {
      Alert.alert('Seleziona prima una foto');
      return;
    }
    setStatus('queued');
    setResults([]);
    try {
      await axios.post(`${API_BASE}/api/ai-look/generate`, {
        id: lookId,
        preset,
        provider: 'replicate'
      });
      poll(lookId);
    } catch (err) {
      console.error('Generate error', err);
      setStatus('error');
      Alert.alert('Errore', 'Generazione fallita. Riprova.');
    }
  };

  const poll = (id: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setStatus('processing');
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/ai-look/status/${id}`);
        if (res.data.resultUrls && res.data.resultUrls.length > 0) {
          clearInterval(pollIntervalRef.current!);
          pollIntervalRef.current = null;
          setResults(res.data.resultUrls);
          setStatus('done');
        }
      } catch (err) {
        clearInterval(pollIntervalRef.current!);
        pollIntervalRef.current = null;
        setStatus('error');
      }
    }, 3000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>✨ AI Look</Text>
      <Text style={styles.subtitle}>
        Carica la tua foto e prova un nuovo look virtuale
      </Text>

      <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
        <Text style={styles.uploadBtnText}>
          {photoUri ? '📷 Cambia foto' : '📷 Scegli foto'}
        </Text>
      </TouchableOpacity>

      {photoUri && (
        <Image source={{ uri: photoUri }} style={styles.preview} />
      )}

      {lookId && status === 'idle' && (
        <>
          <Text style={styles.sectionTitle}>Scegli il tuo preset</Text>
          <View style={styles.presetsRow}>
            {PRESETS.map((p) => (
              <TouchableOpacity
                key={p.key}
                style={styles.presetChip}
                onPress={() => generate(p.key)}
              >
                <Text style={styles.presetText}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {(status === 'uploading' || status === 'queued' || status === 'processing') && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>
            {status === 'uploading' ? 'Caricamento foto…' : 'Generazione look in corso…'}
          </Text>
        </View>
      )}

      {status === 'error' && (
        <Text style={styles.errorText}>Si è verificato un errore. Riprova.</Text>
      )}

      {results.map((url, i) => (
        <View key={i} style={styles.resultCard}>
          <Image source={{ uri: url }} style={styles.resultImage} />
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => {
              /* Navigate to booking screen passing lookId */
              Alert.alert('Prenota', `Avvia prenotazione per il look ${lookId}`);
            }}
          >
            <Text style={styles.bookBtnText}>💅 Prenota questo look</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', color: '#667eea', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 20 },
  uploadBtn: {
    backgroundColor: '#667eea',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16
  },
  uploadBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  preview: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    marginBottom: 20,
    resizeMode: 'cover'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10
  },
  presetsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  presetChip: {
    backgroundColor: '#f0eeff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20
  },
  presetText: { color: '#667eea', fontWeight: '500' },
  loadingBox: { alignItems: 'center', marginVertical: 24 },
  loadingText: { marginTop: 10, color: '#667eea', fontSize: 14 },
  errorText: { color: '#e53e3e', textAlign: 'center', marginVertical: 12 },
  resultCard: { marginBottom: 20 },
  resultImage: {
    width: '100%',
    height: 320,
    borderRadius: 12,
    resizeMode: 'cover',
    marginBottom: 10
  },
  bookBtn: {
    backgroundColor: '#667eea',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  bookBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 }
});
