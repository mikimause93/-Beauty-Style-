import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { io } from 'socket.io-client';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../theme';

const CHAT_SERVICE_URL = process.env.EXPO_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:4004';

export default function ChatScreen({ route, navigation }) {
  const { conversationId, recipientName, recipientAvatar } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const socketRef = useRef(null);
  const flatListRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Demo userId — in production use auth store
  const myUserId = 'user-demo-id';
  const myName = 'Demo User';

  useEffect(() => {
    if (!conversationId) return;

    // Load message history
    loadMessages();

    // Connect Socket.IO
    socketRef.current = io(CHAT_SERVICE_URL, {
      query: { userId: myUserId },
      auth: { userId: myUserId },
      transports: ['websocket'],
    });

    socketRef.current.emit('join', { conversationId });

    socketRef.current.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    socketRef.current.on('typing', ({ userId, isTyping: typing }) => {
      if (userId !== myUserId) setOtherUserTyping(typing);
    });

    socketRef.current.on('error', (err) => {
      console.warn('Socket error:', err.message);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`${CHAT_SERVICE_URL}/api/chat/${conversationId}/messages`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.warn('Load messages failed:', err.message);
    }
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    socketRef.current?.emit('message', {
      conversationId,
      content: inputText.trim(),
      messageType: 'TEXT',
      senderName: myName,
    });
    setInputText('');
    emitTyping(false);
  };

  const emitTyping = (typing) => {
    socketRef.current?.emit('typing', { conversationId, isTyping: typing });
  };

  const handleInputChange = (text) => {
    setInputText(text);
    emitTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => emitTyping(false), 1500);
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === myUserId;
    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}>
        {!isMe && (
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarText}>{(item.senderName || '?')[0].toUpperCase()}</Text>
          </View>
        )}
        <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          {item.content ? (
            <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextOther]}>
              {item.content}
            </Text>
          ) : null}
          {item.mediaUrl ? (
            <Image source={{ uri: item.mediaUrl }} style={styles.messageImage} />
          ) : null}
          <Text style={styles.messageTime}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id || item._id || String(Math.random())}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Typing Indicator */}
      {otherUserTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>{recipientName || 'Someone'} is typing...</Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={Colors.textTertiary}
          value={inputText}
          onChangeText={handleInputChange}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  messageList: { padding: Spacing.md, gap: Spacing.sm },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  messageRowMe: { justifyContent: 'flex-end' },
  messageRowOther: { justifyContent: 'flex-start' },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: FontSizes.sm, color: Colors.textOnPrimary, fontWeight: FontWeights.bold },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
  },
  bubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: { fontSize: FontSizes.md, lineHeight: 22 },
  messageTextMe: { color: Colors.textOnPrimary },
  messageTextOther: { color: Colors.textPrimary },
  messageImage: { width: 200, height: 200, borderRadius: BorderRadius.lg },
  messageTime: { fontSize: 10, color: 'rgba(255,255,255,0.7)', alignSelf: 'flex-end', marginTop: 4 },
  typingIndicator: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs },
  typingText: { fontSize: FontSizes.sm, color: Colors.textTertiary, fontStyle: 'italic' },
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
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { backgroundColor: Colors.textDisabled },
  sendIcon: { fontSize: 18, color: Colors.textOnPrimary },
});
