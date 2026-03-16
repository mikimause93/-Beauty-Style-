import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/common/Header';
import { COLORS, SIZES } from '../../utils/constants';
import { CommunityStackParamList } from '../../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type UserProfileRoute = RouteProp<CommunityStackParamList, 'UserProfile'>;
type UserProfileNavProp = NativeStackNavigationProp<CommunityStackParamList, 'UserProfile'>;

const MOCK_USER_POSTS = [
  { id: 'p1', content: 'My morning skincare routine 🌸', likes: 142, comments: 23 },
  { id: 'p2', content: 'Summer makeup look ☀️', likes: 289, comments: 45 },
  { id: 'p3', content: 'Hair transformation! Before & after 💇‍♀️', likes: 523, comments: 87 },
];

export function UserProfileScreen() {
  const route = useRoute<UserProfileRoute>();
  const navigation = useNavigation<UserProfileNavProp>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Profile" showBack />
      <FlatList
        data={MOCK_USER_POSTS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={() => (
          <>
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>U</Text>
              </View>
              <Text style={styles.userName}>Beauty Enthusiast</Text>
              <Text style={styles.userBio}>Sharing beauty tips & daily routines ✨</Text>
              <View style={styles.statsRow}>
                {[{ value: '52', label: 'Posts' }, { value: '1.2K', label: 'Followers' }, { value: '340', label: 'Following' }].map(stat => (
                  <View key={stat.label} style={styles.stat}>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followButtonText}>Follow</Text>
              </TouchableOpacity>
            </LinearGradient>
            <Text style={styles.postsTitle}>Posts</Text>
          </>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.postCard}
            onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
          >
            <Text style={styles.postContent} numberOfLines={2}>{item.content}</Text>
            <View style={styles.postStats}>
              <Text style={styles.postStat}>❤️ {item.likes}</Text>
              <Text style={styles.postStat}>💬 {item.comments}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  profileHeader: { padding: SIZES.xl, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: SIZES.sm },
  avatarText: { color: COLORS.white, fontWeight: 'bold', fontSize: 36 },
  userName: { fontSize: 22, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
  userBio: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: SIZES.md, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: SIZES.xl, marginBottom: SIZES.md },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  followButton: { backgroundColor: COLORS.white, paddingVertical: 10, paddingHorizontal: 40, borderRadius: 25 },
  followButtonText: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
  list: { paddingBottom: SIZES.xl },
  postsTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, padding: SIZES.md, paddingBottom: SIZES.sm },
  postCard: { backgroundColor: COLORS.white, marginHorizontal: SIZES.md, marginBottom: SIZES.sm, borderRadius: 12, padding: SIZES.md },
  postContent: { fontSize: 15, color: COLORS.text, lineHeight: 22, marginBottom: SIZES.sm },
  postStats: { flexDirection: 'row', gap: SIZES.md },
  postStat: { fontSize: 13, color: COLORS.gray },
});