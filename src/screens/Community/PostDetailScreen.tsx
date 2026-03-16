import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { COLORS, SIZES, MOCK_POSTS } from '../../utils/constants';
import { CommunityStackParamList } from '../../types/navigation';

type PostDetailRoute = RouteProp<CommunityStackParamList, 'PostDetail'>;

const MOCK_COMMENTS = [
  { id: 'c1', author: 'Giulia', text: 'Love this! Going to try it tomorrow 💕', time: '1h ago' },
  { id: 'c2', author: 'Francesca', text: 'What products did you use for this look?', time: '2h ago' },
  { id: 'c3', author: 'Anna', text: 'So beautiful! Your skin is glowing ✨', time: '3h ago' },
];

export function PostDetailScreen() {
  const route = useRoute<PostDetailRoute>();
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(false);

  const post = MOCK_POSTS.find(p => p.id === route.params.postId) ?? MOCK_POSTS[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Post" showBack />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{post.userName[0]}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{post.userName}</Text>
              <Text style={styles.postTime}>{new Date(post.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>

          <Text style={styles.postContent}>{post.content}</Text>

          <View style={styles.postTags}>
            {post.tags.map(tag => (
              <Text key={tag} style={styles.postTag}>#{tag}</Text>
            ))}
          </View>

          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setLiked(!liked)}>
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? COLORS.error : COLORS.gray} />
              <Text style={styles.actionCount}>{liked ? post.likes + 1 : post.likes}</Text>
            </TouchableOpacity>
            <View style={styles.actionBtn}>
              <Ionicons name="chatbubble-outline" size={22} color={COLORS.gray} />
              <Text style={styles.actionCount}>{post.comments}</Text>
            </View>
          </View>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments ({MOCK_COMMENTS.length})</Text>
          {MOCK_COMMENTS.map(c => (
            <View key={c.id} style={styles.commentRow}>
              <View style={styles.commentAvatar}>
                <Text style={styles.commentAvatarText}>{c.author[0]}</Text>
              </View>
              <View style={styles.commentContent}>
                <Text style={styles.commentAuthor}>{c.author}</Text>
                <Text style={styles.commentText}>{c.text}</Text>
                <Text style={styles.commentTime}>{c.time}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.commentInput}>
        <TextInput
          style={styles.input}
          value={comment}
          onChangeText={setComment}
          placeholder="Add a comment..."
          placeholderTextColor={COLORS.gray}
        />
        <TouchableOpacity style={styles.sendButton}>
          <Ionicons name="send" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  postCard: { backgroundColor: COLORS.white, padding: SIZES.md, marginBottom: SIZES.sm },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: SIZES.md },
  avatarText: { color: COLORS.white, fontWeight: 'bold', fontSize: 18 },
  userName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  postTime: { fontSize: 12, color: COLORS.gray },
  postContent: { fontSize: 15, color: COLORS.text, lineHeight: 22, marginBottom: SIZES.sm },
  postTags: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.xs, marginBottom: SIZES.sm },
  postTag: { fontSize: 14, color: COLORS.primary, fontWeight: '500' },
  postActions: { flexDirection: 'row', gap: SIZES.lg, paddingTop: SIZES.sm, borderTopWidth: 1, borderTopColor: COLORS.lightGray },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionCount: { fontSize: 14, color: COLORS.gray },
  commentsSection: { backgroundColor: COLORS.white, padding: SIZES.md },
  commentsTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.md },
  commentRow: { flexDirection: 'row', marginBottom: SIZES.md },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center', marginRight: SIZES.sm },
  commentAvatarText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
  commentContent: { flex: 1, backgroundColor: COLORS.background, borderRadius: 12, padding: SIZES.sm },
  commentAuthor: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  commentText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  commentTime: { fontSize: 11, color: COLORS.gray, marginTop: 2 },
  commentInput: { flexDirection: 'row', alignItems: 'center', padding: SIZES.md, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.lightGray },
  input: { flex: 1, backgroundColor: COLORS.background, borderRadius: 20, paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm, fontSize: 15, color: COLORS.text, marginRight: SIZES.sm },
  sendButton: { padding: SIZES.sm },
});