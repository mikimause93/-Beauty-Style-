import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4001';

export default function CommentThreadScreen({ route, navigation }) {
  const { postId } = route.params || {};
  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [inputText, setInputText] = useState('');
  const [expandedThreads, setExpandedThreads] = useState({});
  const [likesList, setLikesList] = useState([]);
  const [showLikes, setShowLikes] = useState(false);

  // Demo user — in production from auth store
  const myUserId = 'user-demo-id';
  const myName = 'Demo User';

  useEffect(() => {
    if (postId) {
      loadComments();
      loadLikes();
    }
  }, [postId]);

  const loadComments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/comments`);
      const data = await response.json();
      setComments(data.comments || []);
    } catch (err) {
      console.warn('Load comments failed:', err.message);
    }
  };

  const loadLikes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/likes`);
      const data = await response.json();
      setLikesList(data.likes || []);
    } catch (err) {
      console.warn('Load likes failed:', err.message);
    }
  };

  const submitComment = async () => {
    if (!inputText.trim()) return;
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': myUserId },
        body: JSON.stringify({
          content: inputText.trim(),
          parentId: replyTo?.id,
        }),
      });
      const data = await response.json();
      setComments((prev) =>
        replyTo
          ? prev.map((c) =>
              c.id === replyTo.id ? { ...c, replies: [...(c.replies || []), data.comment] } : c
            )
          : [...prev, data.comment]
      );
      setInputText('');
      setReplyTo(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to post comment');
    }
  };

  const handleApplause = async (commentId) => {
    try {
      await fetch(`${API_URL}/api/comments/${commentId}/applause`, {
        method: 'POST',
        headers: { 'x-user-id': myUserId },
      });
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, applauseCount: (c.applauseCount || 0) + 1 } : c
        )
      );
    } catch (err) {
      console.warn('Applause failed:', err.message);
    }
  };

  const toggleThread = (commentId) => {
    setExpandedThreads((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const renderLikeItem = ({ item }) => (
    <View style={styles.likeItem}>
      <Image
        source={{ uri: item.user?.avatarUrl || 'https://via.placeholder.com/36' }}
        style={styles.likeAvatar}
      />
      <Text style={styles.likeName}>{item.user?.fullName || 'User'}</Text>
    </View>
  );

  const renderComment = ({ item, depth = 0 }) => (
    <View style={[styles.commentItem, depth > 0 && styles.replyItem]}>
      <View style={styles.commentHeader}>
        <Image
          source={{ uri: item.user?.avatarUrl || 'https://via.placeholder.com/36' }}
          style={styles.commentAvatar}
        />
        <View style={styles.commentBody}>
          <Text style={styles.commentAuthor}>{item.user?.fullName || 'User'}</Text>
          <Text style={styles.commentContent}>{item.content}</Text>
          <View style={styles.commentActions}>
            <TouchableOpacity onPress={() => setReplyTo(item)} style={styles.commentAction}>
              <Text style={styles.commentActionText}>↩ Reply</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleApplause(item.id)} style={styles.commentAction}>
              <Text style={styles.commentActionText}>👏 {item.applauseCount || 0}</Text>
            </TouchableOpacity>
            <Text style={styles.commentTime}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Replies */}
      {item.replies && item.replies.length > 0 && (
        <>
          <TouchableOpacity
            onPress={() => toggleThread(item.id)}
            style={styles.toggleReplies}
          >
            <Text style={styles.toggleRepliesText}>
              {expandedThreads[item.id] ? '▲ Hide' : `▼ ${item.replies.length} replies`}
            </Text>
          </TouchableOpacity>
          {expandedThreads[item.id] &&
            item.replies.map((reply) => (
              <View key={reply.id}>
                {renderComment({ item: reply, depth: depth + 1 })}
              </View>
            ))}
        </>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Likes Section */}
      <TouchableOpacity style={styles.likesHeader} onPress={() => setShowLikes(!showLikes)}>
        <Text style={styles.likesCount}>❤️ {likesList.length} likes</Text>
        <Text style={styles.likesToggle}>{showLikes ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {showLikes && (
        <FlatList
          data={likesList}
          renderItem={renderLikeItem}
          keyExtractor={(item) => item.id}
          horizontal
          contentContainerStyle={styles.likesList}
          style={styles.likesListContainer}
        />
      )}

      {/* Comments */}
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.commentsList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
        }
      />

      {/* Reply Banner */}
      {replyTo && (
        <View style={styles.replyBanner}>
          <Text style={styles.replyBannerText}>
            Replying to <Text style={styles.replyName}>{replyTo.user?.fullName}</Text>
          </Text>
          <TouchableOpacity onPress={() => setReplyTo(null)}>
            <Text style={styles.cancelReply}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={replyTo ? `Reply to ${replyTo.user?.fullName}...` : 'Add a comment...'}
          placeholderTextColor={Colors.textTertiary}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.submitButton, !inputText.trim() && styles.submitButtonDisabled]}
          onPress={submitComment}
          disabled={!inputText.trim()}
        >
          <Text style={styles.submitText}>Post</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  likesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  likesCount: { fontSize: FontSizes.md, fontWeight: FontWeights.semiBold, color: Colors.textPrimary },
  likesToggle: { fontSize: FontSizes.sm, color: Colors.textTertiary },
  likesListContainer: { backgroundColor: Colors.surface, maxHeight: 80 },
  likesList: { padding: Spacing.md, gap: Spacing.md },
  likeItem: { alignItems: 'center', gap: 4 },
  likeAvatar: { width: 36, height: 36, borderRadius: BorderRadius.full },
  likeName: { fontSize: FontSizes.xs, color: Colors.textSecondary, maxWidth: 60, textAlign: 'center' },
  commentsList: { padding: Spacing.md, gap: Spacing.md },
  commentItem: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  replyItem: {
    marginLeft: Spacing.xl,
    marginTop: Spacing.sm,
    backgroundColor: Colors.surfaceElevated,
  },
  commentHeader: { flexDirection: 'row', gap: Spacing.md },
  commentAvatar: { width: 36, height: 36, borderRadius: BorderRadius.full },
  commentBody: { flex: 1 },
  commentAuthor: { fontSize: FontSizes.sm, fontWeight: FontWeights.semiBold, color: Colors.textPrimary },
  commentContent: { fontSize: FontSizes.md, color: Colors.textPrimary, marginTop: 4, lineHeight: 20 },
  commentActions: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: Spacing.md },
  commentAction: { paddingVertical: 2 },
  commentActionText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: FontWeights.medium },
  commentTime: { fontSize: FontSizes.xs, color: Colors.textTertiary, marginLeft: 'auto' },
  toggleReplies: { marginTop: Spacing.sm, paddingLeft: 52 },
  toggleRepliesText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: FontWeights.medium },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  replyBannerText: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  replyName: { fontWeight: FontWeights.semiBold, color: Colors.primary },
  cancelReply: { fontSize: FontSizes.md, color: Colors.textTertiary, padding: Spacing.xs },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    maxHeight: 100,
    backgroundColor: Colors.background,
  },
  submitButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  submitButtonDisabled: { backgroundColor: Colors.textDisabled },
  submitText: { fontSize: FontSizes.md, fontWeight: FontWeights.semiBold, color: Colors.textOnPrimary },
  emptyText: { textAlign: 'center', color: Colors.textTertiary, marginTop: Spacing.xl, fontSize: FontSizes.md },
});
