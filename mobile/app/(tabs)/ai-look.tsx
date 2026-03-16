import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3011';

const PRESETS = [
  { key: 'bob-short', label: 'Bob Corto' },
  { key: 'long-waves', label: 'Onde Lunghe' },
  { key: 'pixie', label: 'Pixie Cut' },
  { key: 'fade-beard', label: 'Fade & Barba' },
  { key: 'blonde-balayage', label: 'Balayage Biondo' }
];

type StatusType = 'idle' | 'uploading' | 'queued' | 'processing' | 'done' | 'error';

export default function AILookScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [lookId, setLookId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusType>('idle');
  const [results, setResults] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setErrorMsg('Permesso libreria foto negato');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1]
    });
    if (res.canceled) return;
    const uri = res.assets[0].uri;
    setPhotoUri(uri);
    setLookId(null);
    setResults([]);
    setStatus('uploading');
    setErrorMsg(null);
    try {
      const form = new FormData();
      form.append('photo', { uri, name: 'photo.jpg', type: 'image/jpeg' } as unknown as Blob);
      const r = await axios.post(`${API_URL}/api/ai-look/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setLookId(r.data.id);
      setStatus('idle');
    } catch {
      setStatus('error');
      setErrorMsg('Upload fallito. Riprova.');
    }
  };

  const generate = async (preset: string) => {
    if (!lookId) {
      setErrorMsg('Carica prima una foto');
      return;
    }
    setStatus('queued');
    setResults([]);
    setErrorMsg(null);
    try {
      await axios.post(`${API_URL}/api/ai-look/generate`, {
        id: lookId,
        preset,
        provider: 'replicate'
      });
      poll(lookId);
    } catch {
      setStatus('error');
      setErrorMsg('Generazione fallita. Riprova.');
    }
  };

  const poll = (id: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    setStatus('processing');
    pollRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`${API_URL}/api/ai-look/status/${id}`);
        if (res.data.resultUrls && res.data.resultUrls.length > 0) {
          if (pollRef.current) clearInterval(pollRef.current);
          setResults(res.data.resultUrls);
          setStatus('done');
        }
      } catch {
        if (pollRef.current) clearInterval(pollRef.current);
        setStatus('error');
        setErrorMsg('Errore nel recupero del risultato.');
      }
    }, 3000);
  };

  const saveLook = async () => {
    if (!lookId) return;
    try {
      await axios.post(`${API_URL}/api/ai-look/save`, { id: lookId });
      Alert.alert('AI Look', 'Look salvato con successo!');
    } catch {
      setErrorMsg('Salvataggio fallito.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>✨ AI Look</Text>
      <Text style={styles.subtitle}>Prova uno stile virtuale prima di prenotare</Text>

      <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
        <Text style={styles.uploadBtnText}>
          {photoUri ? '📷 Cambia foto' : '📷 Scegli foto'}
        </Text>
      </TouchableOpacity>

      {photoUri && (
        <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="cover" />
      )}

      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

      {lookId && (
        <View style={styles.presetsSection}>
          <Text style={styles.sectionTitle}>Scegli un preset:</Text>
          <View style={styles.presetsRow}>
            {PRESETS.map(p => (
              <TouchableOpacity
                key={p.key}
                style={styles.presetBtn}
                onPress={() => generate(p.key)}
                disabled={status === 'processing' || status === 'uploading'}
              >
                <Text style={styles.presetText}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {(status === 'uploading' || status === 'processing' || status === 'queued') && (
        <View style={styles.loaderRow}>
          <ActivityIndicator size="large" color="#9b59b6" />
          <Text style={styles.loaderText}>
            {status === 'uploading' ? 'Caricamento…' : 'Generazione in corso…'}
          </Text>
        </View>
      )}

      {status === 'done' && results.length > 0 && (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Risultati:</Text>
          {results.map((url, i) => (
            <View key={i} style={styles.resultCard}>
              <Image source={{ uri: url }} style={styles.resultImage} resizeMode="cover" />
              <View style={styles.resultActions}>
                <Button title="💾 Salva Look" onPress={saveLook} color="#9b59b6" />
                <Button
                  title="📅 Prenota"
                  onPress={() => {
                    /* TODO: navigate to booking screen with prefilled lookId */
                  }}
                  color="#27ae60"
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#7f8c8d', marginBottom: 20 },
  uploadBtn: {
    backgroundColor: '#9b59b6',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16
  },
  uploadBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  preview: { width: '100%', height: 260, borderRadius: 12, marginBottom: 16 },
  error: { color: '#e74c3c', marginBottom: 10 },
  presetsSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#2c3e50', marginBottom: 10 },
  presetsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#ecf0f1',
    borderRadius: 20,
    margin: 4
  },
  presetText: { fontSize: 13, color: '#2c3e50' },
  loaderRow: { alignItems: 'center', marginVertical: 20 },
  loaderText: { marginTop: 10, color: '#7f8c8d' },
  resultsSection: { marginTop: 10 },
  resultCard: { marginBottom: 20, borderRadius: 12, overflow: 'hidden' },
  resultImage: { width: '100%', height: 320 },
  resultActions: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 }
});
