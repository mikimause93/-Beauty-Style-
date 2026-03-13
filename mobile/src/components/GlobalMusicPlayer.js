import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  PanResponder,
} from 'react-native';
import { Audio } from 'expo-av';
import { useMusicStore } from '../store/aiLookStore';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../theme';

/**
 * Global Music Player — Singleton component that persists across screens.
 * Mount once in the root App component.
 */
export default function GlobalMusicPlayer() {
  const { currentTrack, isPlaying, playTrack, pauseTrack, resumeTrack, nextTrack, prevTrack } =
    useMusicStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const soundRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentTrack) {
      loadAndPlay(currentTrack.url);
    }
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [currentTrack]);

  useEffect(() => {
    if (soundRef.current) {
      if (isPlaying) {
        soundRef.current.playAsync();
      } else {
        soundRef.current.pauseAsync();
      }
    }
  }, [isPlaying]);

  const loadAndPlay = async (url) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, progressUpdateIntervalMillis: 500 },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
    } catch (err) {
      console.warn('Audio load error:', err.message);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setProgress(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
      if (status.didJustFinish) {
        nextTrack();
      }
    }
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const toggleExpand = () => {
    Animated.spring(slideAnim, {
      toValue: isExpanded ? 0 : 1,
      useNativeDriver: true,
    }).start();
    setIsExpanded(!isExpanded);
  };

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Collapsed Mini Player */}
      <TouchableOpacity style={styles.miniPlayer} onPress={toggleExpand} activeOpacity={0.95}>
        <Image
          source={{ uri: currentTrack.coverUrl }}
          style={styles.coverThumbnail}
        />
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity onPress={prevTrack} style={styles.controlButton}>
            <Text style={styles.controlIcon}>⏮</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={isPlaying ? pauseTrack : resumeTrack}
            style={[styles.controlButton, styles.playButton]}
          >
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶️'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={nextTrack} style={styles.controlButton}>
            <Text style={styles.controlIcon}>⏭</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60, // above tab bar
    left: Spacing.md,
    right: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  miniPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  coverThumbnail: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semiBold,
    color: Colors.textPrimary,
  },
  trackArtist: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  controlButton: {
    padding: Spacing.xs,
  },
  controlIcon: {
    fontSize: 20,
  },
  playButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 16,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: Colors.border,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
});
