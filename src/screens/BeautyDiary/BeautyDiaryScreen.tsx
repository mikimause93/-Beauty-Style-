import { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppContext } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { COLORS, SIZES } from '../../utils/constants';
import { getMoodEmoji, formatDate } from '../../utils/helpers';
import { BeautyStackParamList } from '../../types/navigation';

type DiaryNavProp = NativeStackNavigationProp<BeautyStackParamList, 'BeautyDiary'>;

export function BeautyDiaryScreen() {
  const navigation = useNavigation<DiaryNavProp>();
  const { diaryEntries } = useContext(AppContext);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={[COLORS.secondary, COLORS.primary]} style={styles.header}>
        <Text style={styles.headerTitle}>Beauty Diary 📔</Text>
        <Text style={styles.headerSubtitle}>{diaryEntries.length} entries</Text>
      </LinearGradient>

      <View style={styles.addButtonContainer}>
        <Button
          title="+ New Entry"
          onPress={() => navigation.navigate('DiaryEntry', {})}
          style={styles.addButton}
        />
      </View>

      {diaryEntries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📓</Text>
          <Text style={styles.emptyTitle}>Start Your Journey</Text>
          <Text style={styles.emptyText}>Track your beauty routines, products, and how your skin feels each day</Text>
        </View>
      ) : (
        <FlatList
          data={diaryEntries}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.entryCard}
              onPress={() => navigation.navigate('DiaryEntry', { entryId: item.id })}
            >
              <View style={styles.entryHeader}>
                <View>
                  <Text style={styles.entryDate}>{formatDate(item.date)}</Text>
                  <Text style={styles.entryTitle}>{item.title}</Text>
                </View>
                <Text style={styles.moodEmoji}>{getMoodEmoji(item.mood)}</Text>
              </View>
              {item.notes.length > 0 && (
                <Text style={styles.entryNotes} numberOfLines={2}>{item.notes}</Text>
              )}
              <View style={styles.entryMeta}>
                <Text style={styles.metaTag}>{item.skinCondition}</Text>
                {item.routineCompleted && (
                  <View style={styles.completedTag}>
                    <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                    <Text style={styles.completedText}>Routine done</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SIZES.xl },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.white },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  addButtonContainer: { padding: SIZES.md, paddingBottom: 0 },
  addButton: { width: '100%' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SIZES.xl },
  emptyEmoji: { fontSize: 70, marginBottom: SIZES.lg },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  list: { padding: SIZES.md },
  entryCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: SIZES.md, marginBottom: SIZES.sm, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SIZES.xs },
  entryDate: { fontSize: 12, color: COLORS.gray },
  entryTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  moodEmoji: { fontSize: 28 },
  entryNotes: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SIZES.sm },
  entryMeta: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  metaTag: { backgroundColor: COLORS.primaryLight + '25', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  completedTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  completedText: { fontSize: 12, color: COLORS.success, fontWeight: '600' },
});