import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4001';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [mapRegion, setMapRegion] = useState(null);
  const [nearbyPros, setNearbyPros] = useState([]);
  const [radius, setRadius] = useState(5000); // meters
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'map'
  const debounceTimer = useRef(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    const location = await Location.getCurrentPositionAsync({});
    const region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
    setMapRegion(region);
    fetchNearbyPros(location.coords.latitude, location.coords.longitude);
  };

  const fetchNearbyPros = async (lat, lng) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_URL}/api/professionals/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
      );
      const data = await response.json();
      setNearbyPros(data.professionals || []);
    } catch (err) {
      console.warn('Nearby pros fetch failed:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQueryChange = (text) => {
    setQuery(text);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/search/autocomplete?q=${encodeURIComponent(text)}`
        );
        const data = await response.json();
        setSuggestions(data.results || []);
      } catch (err) {
        console.warn('Autocomplete failed:', err.message);
      }
    }, 300);
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => {
        setQuery(item.name || item.fullName);
        setSuggestions([]);
        if (item.type === 'user' || item.type === 'professional') {
          navigation.navigate('Profile', { userId: item.id });
        }
      }}
    >
      {item.avatarUrl ? (
        <Image source={{ uri: item.avatarUrl }} style={styles.suggestionAvatar} />
      ) : (
        <View style={[styles.suggestionAvatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarInitial}>
            {(item.name || item.fullName || '?')[0].toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.suggestionInfo}>
        <Text style={styles.suggestionName}>{item.name || item.fullName}</Text>
        <Text style={styles.suggestionType}>{item.type === 'professional' ? '💼 Professional' : '👤 User'}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderProCard = ({ item }) => (
    <TouchableOpacity
      style={styles.proCard}
      onPress={() => navigation.navigate('Profile', { userId: item.userId })}
      activeOpacity={0.85}
    >
      <View style={styles.proCardHeader}>
        <Image
          source={{ uri: item.avatarUrl || 'https://via.placeholder.com/60' }}
          style={styles.proAvatar}
        />
        <View style={styles.proInfo}>
          <Text style={styles.proName}>{item.fullName}</Text>
          <Text style={styles.proSpecialties}>
            {(item.specialties || []).slice(0, 2).join(' · ')}
          </Text>
          <View style={styles.proRating}>
            <Text style={styles.ratingText}>⭐ {item.rating?.toFixed(1) || '5.0'}</Text>
            {item.distance && (
              <Text style={styles.distanceText}>
                📍 {(item.distance / 1000).toFixed(1)} km away
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search professionals, styles..."
          placeholderTextColor={Colors.textTertiary}
          value={query}
          onChangeText={handleQueryChange}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setSuggestions([]); }}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Autocomplete Dropdown */}
      {suggestions.length > 0 && (
        <View style={styles.suggestionsDropdown}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {/* Tab Switch */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'list' && styles.tabActive]}
          onPress={() => setActiveTab('list')}
        >
          <Text style={[styles.tabText, activeTab === 'list' && styles.tabTextActive]}>
            📋 List
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'map' && styles.tabActive]}
          onPress={() => setActiveTab('map')}
        >
          <Text style={[styles.tabText, activeTab === 'map' && styles.tabTextActive]}>
            🗺️ Near Me
          </Text>
        </TouchableOpacity>
      </View>

      {/* Radius Selector */}
      <View style={styles.radiusRow}>
        <Text style={styles.radiusLabel}>Radius:</Text>
        {[1000, 5000, 10000, 25000].map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.radiusChip, radius === r && styles.radiusChipActive]}
            onPress={() => {
              setRadius(r);
              if (mapRegion) {
                fetchNearbyPros(mapRegion.latitude, mapRegion.longitude);
              }
            }}
          >
            <Text style={[styles.radiusChipText, radius === r && styles.radiusChipTextActive]}>
              {r >= 1000 ? `${r / 1000}km` : `${r}m`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List View */}
      {activeTab === 'list' && (
        <>
          {isLoading ? (
            <ActivityIndicator style={styles.loader} color={Colors.primary} />
          ) : (
            <FlatList
              data={nearbyPros}
              renderItem={renderProCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No professionals found nearby</Text>
              }
            />
          )}
        </>
      )}

      {/* Map View */}
      {activeTab === 'map' && mapRegion && (
        <MapView style={styles.map} region={mapRegion} showsUserLocation>
          {/* Radius circle */}
          <Circle
            center={{ latitude: mapRegion.latitude, longitude: mapRegion.longitude }}
            radius={radius}
            fillColor="rgba(102, 126, 234, 0.1)"
            strokeColor="rgba(102, 126, 234, 0.5)"
            strokeWidth={2}
          />
          {/* Professional markers */}
          {nearbyPros.map((pro) =>
            pro.location ? (
              <Marker
                key={pro.id}
                coordinate={{
                  latitude: pro.location.lat,
                  longitude: pro.location.lng,
                }}
                title={pro.fullName}
                description={`⭐ ${pro.rating?.toFixed(1)}`}
                onPress={() => navigation.navigate('Profile', { userId: pro.userId })}
              />
            ) : null
          )}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.lg,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  searchIcon: { fontSize: 18, marginRight: Spacing.sm },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  clearIcon: { fontSize: 16, color: Colors.textTertiary, padding: Spacing.xs },
  suggestionsDropdown: {
    marginHorizontal: Spacing.lg,
    marginTop: -Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 100,
    maxHeight: 240,
    ...Shadows.md,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap: Spacing.md,
  },
  suggestionAvatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  avatarInitial: { fontSize: FontSizes.lg, color: Colors.textOnPrimary, fontWeight: FontWeights.bold },
  suggestionInfo: { flex: 1 },
  suggestionName: { fontSize: FontSizes.md, fontWeight: FontWeights.medium, color: Colors.textPrimary },
  suggestionType: { fontSize: FontSizes.sm, color: Colors.textTertiary, marginTop: 2 },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.full,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: FontWeights.medium },
  tabTextActive: { color: Colors.textOnPrimary },
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  radiusLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  radiusChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  radiusChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  radiusChipText: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  radiusChipTextActive: { color: Colors.textOnPrimary },
  listContent: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
  proCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  proCardHeader: { flexDirection: 'row', gap: Spacing.md },
  proAvatar: { width: 60, height: 60, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceElevated },
  proInfo: { flex: 1 },
  proName: { fontSize: FontSizes.md, fontWeight: FontWeights.semiBold, color: Colors.textPrimary },
  proSpecialties: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  proRating: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xs },
  ratingText: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  distanceText: { fontSize: FontSizes.sm, color: Colors.primary },
  loader: { marginTop: Spacing.xl },
  emptyText: { textAlign: 'center', color: Colors.textTertiary, marginTop: Spacing.xl, fontSize: FontSizes.md },
  map: { flex: 1, margin: Spacing.md, borderRadius: BorderRadius.xl, overflow: 'hidden' },
});
