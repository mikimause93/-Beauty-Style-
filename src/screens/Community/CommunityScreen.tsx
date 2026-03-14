import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, MOCK_POSTS } from '../../utils/constants';
import { CommunityStackParamList } from '../../types/navigation';

type CommunityNavProp = NativeStackNavigationProp<CommunityStackParamList, 'Community'>;

const TRENDING_TAGS = ['#skincare', '#makeup', '#haircare', '#nails', '#wellness', '#beauty'];

export function CommunityScreen() {
  const navigation = useNavigation<CommunityNavProp>();
  const [posts, setPosts] = useState(MOCK_POSTS);

  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId
      ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
      : p
    ));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <Text style={styles.headerTitle}>Community 💖</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Ionicons name="add-circle" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.feed}
        ListHeaderComponent={() => (
          <View style={styles.tagsRow}>
            {TRENDING_TAGS.map(tag => (
              <TouchableOpacity
                key={tag}
                style={styles.tagChip}
                onPress={() => navigation.navigate('Hashtag', { tag: tag.replace('#', '') })}
              >
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.userName[0]}</Text>
              </View>
              <View style={styles.postMeta}>
                <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: item.userId })}>
                  <Text style={styles.userName}>{item.userName}</Text>
                </TouchableOpacity>
                <Text style={styles.postTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('PostDetail', { postId: item.id })}>
              <Text style={styles.postContent}>{item.content}</Text>
            </TouchableOpacity>

            <View style={styles.postTags}>
              {item.tags.map(tag => (
                <TouchableOpacity key={tag} onPress={() => navigation.navigate('Hashtag', { tag })}>
                  <Text style={styles.postTag}>#{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.postActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(item.id)}>
                <Ionicons name={item.isLiked ? 'heart' : 'heart-outline'} size={22} color={item.isLiked ? COLORS.error : COLORS.gray} />
                <Text style={styles.actionCount}>{item.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
              >
                <Ionicons name="chatbubble-outline" size={22} color={COLORS.gray} />
                <Text style={styles.actionCount}>{item.comments}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="share-outline" size={22} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SIZES.md, paddingTop: SIZES.sm },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.white },
  createButton: { padding: SIZES.xs },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.xs, padding: SIZES.md, paddingBottom: SIZES.sm },
  tagChip: { backgroundColor: COLORS.primaryLight + '25', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  feed: { paddingBottom: SIZES.xl },
  postCard: { backgroundColor: COLORS.white, marginBottom: SIZES.sm, padding: SIZES.md },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: SIZES.sm },
  avatarText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  postMeta: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  postTime: { fontSize: 12, color: COLORS.gray },
  postContent: { fontSize: 15, color: COLORS.text, lineHeight: 22, marginBottom: SIZES.sm },
  postTags: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.xs, marginBottom: SIZES.sm },
  postTag: { fontSize: 14, color: COLORS.primary, fontWeight: '500' },
  postActions: { flexDirection: 'row', gap: SIZES.lg, paddingTop: SIZES.sm, borderTopWidth: 1, borderTopColor: COLORS.lightGray },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionCount: { fontSize: 14, color: COLORS.gray },
});