import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { COLORS, SIZES } from '../../utils/constants';
import { BeautyStackParamList } from '../../types/navigation';

type QuizNavProp = NativeStackNavigationProp<BeautyStackParamList, 'StyleQuiz'>;

const QUESTIONS = [
  {
    id: 'q1',
    question: "What's your skin type?",
    emoji: '✨',
    options: [
      { id: 'dry', text: '💧 Dry', value: 'dry' },
      { id: 'oily', text: '🫧 Oily', value: 'oily' },
      { id: 'combo', text: '⚖️ Combination', value: 'combination' },
      { id: 'normal', text: '🌿 Normal', value: 'normal' },
    ],
  },
  {
    id: 'q2',
    question: "What's your hair type?",
    emoji: '💇‍♀️',
    options: [
      { id: 'straight', text: '➖ Straight', value: 'straight' },
      { id: 'wavy', text: '〰️ Wavy', value: 'wavy' },
      { id: 'curly', text: '🌀 Curly', value: 'curly' },
      { id: 'coily', text: '🌱 Coily', value: 'coily' },
    ],
  },
  {
    id: 'q3',
    question: 'What best describes your style?',
    emoji: '💅',
    options: [
      { id: 'natural', text: '🌸 Natural & Minimal', value: 'natural' },
      { id: 'bold', text: '💄 Bold & Glamorous', value: 'bold' },
      { id: 'classic', text: '👒 Classic & Elegant', value: 'classic' },
      { id: 'trendy', text: '⚡ Trendy & Edgy', value: 'trendy' },
    ],
  },
  {
    id: 'q4',
    question: 'What is your biggest beauty concern?',
    emoji: '🎯',
    options: [
      { id: 'aging', text: '⏰ Anti-aging', value: 'aging' },
      { id: 'acne', text: '🔴 Acne & Breakouts', value: 'acne' },
      { id: 'dull', text: '✨ Dull Skin', value: 'dullness' },
      { id: 'hydration', text: '💧 Hydration', value: 'hydration' },
    ],
  },
];

export function StyleQuizScreen() {
  const navigation = useNavigation<QuizNavProp>();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const question = QUESTIONS[currentQ];

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      navigation.navigate('QuizResult', { resultId: 'custom' });
    }
  };

  const progress = ((currentQ) / QUESTIONS.length) * 100;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Style Quiz" showBack />
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.questionCount}>{currentQ + 1} of {QUESTIONS.length}</Text>
        <Text style={styles.emoji}>{question.emoji}</Text>
        <Text style={styles.question}>{question.question}</Text>

        <View style={styles.options}>
          {question.options.map(option => (
            <TouchableOpacity
              key={option.id}
              style={styles.option}
              onPress={() => handleAnswer(option.value)}
            >
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  progressBar: { height: 6, backgroundColor: COLORS.lightGray, marginHorizontal: SIZES.md },
  progressFill: { height: 6, backgroundColor: COLORS.primary, borderRadius: 3 },
  content: { flex: 1, padding: SIZES.xl, alignItems: 'center', justifyContent: 'center' },
  questionCount: { fontSize: 14, color: COLORS.gray, marginBottom: SIZES.md },
  emoji: { fontSize: 70, marginBottom: SIZES.lg },
  question: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: SIZES.xl },
  options: { width: '100%', gap: SIZES.sm },
  option: {
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.md,
    alignItems: 'center',
  },
  optionText: { fontSize: 16, fontWeight: '500', color: COLORS.text },
});
