import { useState, useContext } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { AppContext } from '../../context/AppContext';
import { generateId } from '../../utils/helpers';
import { COLORS, SIZES } from '../../utils/constants';
import { BeautyStackParamList } from '../../types/navigation';
import { DiaryEntry } from '../../types/models';

type DiaryEntryRoute = RouteProp<BeautyStackParamList, 'DiaryEntry'>;

const MOODS: Array<{ value: DiaryEntry['mood']; label: string; emoji: string }> = [
  { value: 'great', label: 'Great', emoji: '😊' },
  { value: 'good', label: 'Good', emoji: '🙂' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'bad', label: 'Bad', emoji: '😞' },
];

const SKIN_CONDITIONS = ['Clear', 'Oily', 'Dry', 'Breakout', 'Sensitive', 'Glowing'];

export function DiaryEntryScreen() {
  const navigation = useNavigation();
  const route = useRoute<DiaryEntryRoute>();
  const { addDiaryEntry, updateDiaryEntry, diaryEntries } = useContext(AppContext);

  const existingEntry = route.params?.entryId
    ? diaryEntries.find(e => e.id === route.params.entryId)
    : undefined;

  const [title, setTitle] = useState(existingEntry?.title ?? '');
  const [mood, setMood] = useState<DiaryEntry['mood']>(existingEntry?.mood ?? 'good');
  const [skinCondition, setSkinCondition] = useState(existingEntry?.skinCondition ?? 'Clear');
  const [notes, setNotes] = useState(existingEntry?.notes ?? '');
  const [routineCompleted, setRoutineCompleted] = useState(existingEntry?.routineCompleted ?? false);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please add a title for your entry');
      return;
    }

    const entry: DiaryEntry = {
      id: existingEntry?.id ?? generateId(),
      date: existingEntry?.date ?? new Date().toISOString(),
      title: title.trim(),
      mood,
      skinCondition,
      routineCompleted,
      notes: notes.trim(),
      products: existingEntry?.products ?? [],
      photos: existingEntry?.photos ?? [],
    };

    if (existingEntry) {
      updateDiaryEntry(entry);
    } else {
      addDiaryEntry(entry);
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={existingEntry ? 'Edit Entry' : 'New Entry'} showBack />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Give this entry a title..."
            placeholderTextColor={COLORS.gray}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>How are you feeling?</Text>
          <View style={styles.moodsRow}>
            {MOODS.map(m => (
              <TouchableOpacity
                key={m.value}
                style={[styles.moodButton, mood === m.value && styles.moodButtonActive]}
                onPress={() => setMood(m.value)}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, mood === m.value && styles.moodLabelActive]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Skin Condition</Text>
          <View style={styles.conditionsRow}>
            {SKIN_CONDITIONS.map(cond => (
              <TouchableOpacity
                key={cond}
                style={[styles.conditionChip, skinCondition === cond && styles.conditionChipActive]}
                onPress={() => setSkinCondition(cond)}
              >
                <Text style={[styles.conditionText, skinCondition === cond && styles.conditionTextActive]}>{cond}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="How was your skin today? Products you used, reactions..."
            placeholderTextColor={COLORS.gray}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Routine Completed</Text>
          <Switch
            value={routineCompleted}
            onValueChange={setRoutineCompleted}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primaryLight }}
            thumbColor={routineCompleted ? COLORS.primary : COLORS.gray}
          />
        </View>

        <Button title="Save Entry" onPress={handleSave} style={{ marginTop: SIZES.lg }} />
        <View style={{ height: SIZES.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: SIZES.xl },
  field: { marginBottom: SIZES.lg },
  label: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.sm },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.md,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  moodsRow: { flexDirection: 'row', gap: SIZES.sm },
  moodButton: { flex: 1, alignItems: 'center', padding: SIZES.sm, borderRadius: 12, borderWidth: 2, borderColor: COLORS.lightGray },
  moodButtonActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight + '20' },
  moodEmoji: { fontSize: 28, marginBottom: 4 },
  moodLabel: { fontSize: 12, color: COLORS.gray, fontWeight: '500' },
  moodLabelActive: { color: COLORS.primary, fontWeight: '700' },
  conditionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.xs },
  conditionChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.lightGray },
  conditionChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  conditionText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  conditionTextActive: { color: COLORS.white, fontWeight: '700' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SIZES.md, backgroundColor: COLORS.background, borderRadius: SIZES.borderRadius },
  switchLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text },
});