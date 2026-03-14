import { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SIZES } from '../../utils/constants';

const SLIDES = [
  {
    id: '1',
    title: 'Discover Your Beauty',
    description: 'Explore hundreds of makeup tutorials, skincare routines, and hairstyle guides curated just for you.',
    emoji: '✨',
    colors: ['#FF69B4', '#E91E8C'] as [string, string],
  },
  {
    id: '2',
    title: 'Book Beauty Services',
    description: 'Find and book appointments at top salons and beauty studios near you with just a few taps.',
    emoji: '💅',
    colors: ['#9C27B0', '#673AB7'] as [string, string],
  },
  {
    id: '3',
    title: 'Try Before You Buy',
    description: 'Use our virtual try-on feature to test makeup looks, hair colors, and accessories before purchasing.',
    emoji: '💄',
    colors: ['#E91E8C', '#FF4081'] as [string, string],
  },
  {
    id: '4',
    title: 'Join the Community',
    description: 'Share your looks, get inspired, and connect with beauty enthusiasts from around the world.',
    emoji: '💖',
    colors: ['#FF4081', '#F06292'] as [string, string],
  },
];

export function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { completeOnboarding } = useContext(AuthContext);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const slide = SLIDES[currentIndex];

  return (
    <LinearGradient colors={slide.colors} style={styles.container}>
      <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.emoji}>{slide.emoji}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  skipButton: { position: 'absolute', top: 60, right: SIZES.lg, zIndex: 1 },
  skipText: { color: COLORS.white, fontSize: 16, opacity: 0.8 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SIZES.xl },
  emoji: { fontSize: 80, marginBottom: SIZES.xl },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.white, textAlign: 'center', marginBottom: SIZES.md },
  description: { fontSize: 17, color: COLORS.white, textAlign: 'center', opacity: 0.9, lineHeight: 26 },
  footer: { paddingHorizontal: SIZES.xl, paddingBottom: 60, alignItems: 'center' },
  dots: { flexDirection: 'row', marginBottom: SIZES.xl },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 4 },
  dotActive: { backgroundColor: COLORS.white, width: 24 },
  nextButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  nextText: { color: COLORS.primary, fontSize: 18, fontWeight: '700' },
});