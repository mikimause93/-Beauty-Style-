const Message = require('./messageModel');
const axios = require('axios');

/**
 * Attach Socket.IO event handlers for real-time chat.
 */
function socketHandler(io) {
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
    console.log(`[Socket] User connected: ${userId || 'anonymous'} (${socket.id})`);

    // Join conversation rooms
    socket.on('join', ({ conversationId }) => {
      socket.join(conversationId);
      console.log(`[Socket] ${userId} joined room ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave', ({ conversationId }) => {
      socket.leave(conversationId);
    });

    // Send message
    socket.on('message', async (data) => {
      try {
        const { conversationId, content, mediaUrl, messageType, senderName } = data;

        if (!conversationId || (!content && !mediaUrl)) {
          socket.emit('error', { message: 'conversationId and content or mediaUrl are required' });
          return;
        }

        // Persist to MongoDB
        const message = await Message.create({
          conversationId,
          senderId: userId,
          senderName,
          content,
          mediaUrl,
          messageType: messageType || 'TEXT',
        });

        // Broadcast to all participants in room
        io.to(conversationId).emit('message', {
          id: message._id.toString(),
          conversationId,
          senderId: userId,
          senderName,
          content,
          mediaUrl,
          messageType: message.messageType,
          createdAt: message.createdAt,
        });

        // Send push notification to other participants
        try {
          await axios.post(
            `${process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:4003'}/internal/notify`,
            {
              userId: null, // In production, look up conversation participants and notify each
              type: 'NEW_MESSAGE',
              targetId: conversationId,
              targetType: 'Conversation',
              actorId: userId,
              deepLink: `beautyapp://chat/${conversationId}`,
              payload: {
                senderName,
                messageId: message._id.toString(),
              },
            }
          );
        } catch (notifErr) {
          // Non-critical
        }
      } catch (err) {
        console.error('[Socket] Message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(conversationId).emit('typing', { userId, isTyping });
    });

    // Mark messages as read
    socket.on('read', async ({ conversationId, messageIds }) => {
      await Message.updateMany(
        { _id: { $in: messageIds }, conversationId },
        { readAt: new Date() }
      );
      socket.to(conversationId).emit('read', { userId, messageIds });
    });

    // Video/audio call signaling
    socket.on('call:offer', ({ conversationId, sdp, callType }) => {
      socket.to(conversationId).emit('call:offer', { from: userId, sdp, callType });
    });

    socket.on('call:answer', ({ conversationId, sdp }) => {
      socket.to(conversationId).emit('call:answer', { from: userId, sdp });
    });

    socket.on('call:ice-candidate', ({ conversationId, candidate }) => {
      socket.to(conversationId).emit('call:ice-candidate', { from: userId, candidate });
    });

    socket.on('call:end', ({ conversationId }) => {
      socket.to(conversationId).emit('call:end', { from: userId });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${userId} (${socket.id})`);
    });
  });
}

module.exports = socketHandler;
