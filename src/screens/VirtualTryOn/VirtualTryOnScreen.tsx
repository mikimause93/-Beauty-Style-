import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { COLORS, SIZES } from '../../utils/constants';

const LIPSTICK_COLORS = [
  { id: 'c1', name: 'Classic Red', color: '#FF0000' },
  { id: 'c2', name: 'Rose Pink', color: '#FF69B4' },
  { id: 'c3', name: 'Berry', color: '#8B0057' },
  { id: 'c4', name: 'Nude', color: '#C4956A' },
  { id: 'c5', name: 'Coral', color: '#FF6B6B' },
  { id: 'c6', name: 'Plum', color: '#722F37' },
];

const BLUSH_COLORS = [
  { id: 'b1', name: 'Peach', color: '#FFCBA4' },
  { id: 'b2', name: 'Pink', color: '#FFB6C1' },
  { id: 'b3', name: 'Rose', color: '#FF007F' },
];

export function VirtualTryOnScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedLipColor, setSelectedLipColor] = useState<string | null>(null);
  const [selectedBlush, setSelectedBlush] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'lips' | 'blush'>('lips');

  if (!permission) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Virtual Try-On" showBack />
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Virtual Try-On" showBack />
        <View style={styles.center}>
          <Text style={styles.permEmoji}>📸</Text>
          <Text style={styles.permTitle}>Camera Access Required</Text>
          <Text style={styles.permText}>
            Allow camera access to use virtual try-on features
          </Text>
          <Button title="Grant Camera Access" onPress={requestPermission} style={{ marginTop: SIZES.xl }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Virtual Try-On" showBack />

      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing="front">
          {selectedLipColor && (
            <View style={[styles.lipOverlay, { backgroundColor: selectedLipColor + '50' }]}>
              <Text style={styles.overlayLabel}>Lip color applied</Text>
            </View>
          )}
        </CameraView>
      </View>

      <View style={styles.controls}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'lips' && styles.tabActive]}
            onPress={() => setActiveTab('lips')}
          >
            <Text style={[styles.tabText, activeTab === 'lips' && styles.tabTextActive]}>💄 Lips</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'blush' && styles.tabActive]}
            onPress={() => setActiveTab('blush')}
          >
            <Text style={[styles.tabText, activeTab === 'blush' && styles.tabTextActive]}>🌸 Blush</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorsRow}>
          {(activeTab === 'lips' ? LIPSTICK_COLORS : BLUSH_COLORS).map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.colorCircle,
                { backgroundColor: item.color },
                (activeTab === 'lips' ? selectedLipColor : selectedBlush) === item.color && styles.colorCircleSelected,
              ]}
              onPress={() => activeTab === 'lips' ? setSelectedLipColor(item.color) : setSelectedBlush(item.color)}
            >
              {(activeTab === 'lips' ? selectedLipColor : selectedBlush) === item.color && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            setSelectedLipColor(null);
            setSelectedBlush(null);
          }}
        >
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SIZES.xl, backgroundColor: COLORS.white },
  loadingText: { color: COLORS.white, fontSize: 16 },
  permEmoji: { fontSize: 70, marginBottom: SIZES.lg },
  permTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  permText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  lipOverlay: { position: 'absolute', bottom: 80, left: '30%', right: '30%', height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  overlayLabel: { color: COLORS.white, fontSize: 10, fontWeight: '600' },
  controls: { backgroundColor: COLORS.white, padding: SIZES.md, paddingBottom: SIZES.lg },
  tabs: { flexDirection: 'row', marginBottom: SIZES.md },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 20, marginHorizontal: SIZES.xs },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 15, fontWeight: '600', color: COLORS.gray },
  tabTextActive: { color: COLORS.white },
  colorsRow: { paddingVertical: SIZES.sm, gap: SIZES.sm },
  colorCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  colorCircleSelected: { borderColor: COLORS.text, transform: [{ scale: 1.1 }] },
  checkmark: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  clearButton: { alignItems: 'center', marginTop: SIZES.sm },
  clearText: { color: COLORS.gray, fontSize: 14 },
});
