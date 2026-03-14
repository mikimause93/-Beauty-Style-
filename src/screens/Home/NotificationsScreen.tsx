import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { COLORS, SIZES } from '../../utils/constants';

const NOTIFICATIONS = [
  { id: '1', message: 'Your appointment at Bella Vista Salon is confirmed for tomorrow at 14:00', time: '2h ago', emoji: '📅' },
  { id: '2', message: 'New tutorial: "Summer Glow Makeup" is available', time: '5h ago', emoji: '✨' },
  { id: '3', message: 'Sofia liked your post about skincare routine', time: '1d ago', emoji: '❤️' },
  { id: '4', message: '🎉 25% off on all foundation products this weekend!', time: '2d ago', emoji: '🎉' },
  { id: '5', message: "Don't forget your evening skincare routine!", time: '2d ago', emoji: '🌙' },
];

export function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Notifications" showBack />
      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <View style={styles.content}>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  list: { padding: SIZES.sm },
  item: { flexDirection: 'row', padding: SIZES.md, alignItems: 'flex-start' },
  emoji: { fontSize: 28, marginRight: SIZES.md, marginTop: 2 },
  content: { flex: 1 },
  message: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
  time: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
  separator: { height: 1, backgroundColor: COLORS.lightGray, marginLeft: SIZES.lg * 2 },
});
