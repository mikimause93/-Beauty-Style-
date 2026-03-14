import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/common/Header';
import { COLORS, SIZES, MOCK_POSTS } from '../../utils/constants';
import { CommunityStackParamList } from '../../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type HashtagRoute = RouteProp<CommunityStackParamList, 'Hashtag'>;
type HashtagNavProp = NativeStackNavigationProp<CommunityStackParamList, 'Hashtag'>;

export function HashtagScreen() {
  const route = useRoute<HashtagRoute>();
  const navigation = useNavigation<HashtagNavProp>();
  const { tag } = route.params;

  const taggedPosts = MOCK_POSTS.filter(p => p.tags.includes(tag.toLowerCase()));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={`#${tag}`} showBack />
      <FlatList
        data={taggedPosts.length > 0 ? taggedPosts : MOCK_POSTS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={() => (
          <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.hashtagHeader}>
            <Text style={styles.hashtagTitle}>#{tag}</Text>
            <Text style={styles.hashtagCount}>{(taggedPosts.length > 0 ? taggedPosts : MOCK_POSTS).length} posts</Text>
          </LinearGradient>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.postCard}
            onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
          >
            <View style={styles.postHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.userName[0]}</Text>
              </View>
              <View>
                <Text style={styles.userName}>{item.userName}</Text>
                <Text style={styles.postTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>
            <Text style={styles.postContent} numberOfLines={3}>{item.content}</Text>
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
  hashtagHeader: { padding: SIZES.xl, alignItems: 'center' },
  hashtagTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.white },
  hashtagCount: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  list: { paddingBottom: SIZES.xl },
  postCard: { backgroundColor: COLORS.white, marginHorizontal: SIZES.md, marginBottom: SIZES.sm, borderRadius: 12, padding: SIZES.md },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.sm },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: SIZES.sm },
  avatarText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
  userName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  postTime: { fontSize: 11, color: COLORS.gray },
  postContent: { fontSize: 14, color: COLORS.text, lineHeight: 20, marginBottom: SIZES.sm },
  postStats: { flexDirection: 'row', gap: SIZES.md },
  postStat: { fontSize: 13, color: COLORS.gray },
});