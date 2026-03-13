const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { sendPush } = require('../utils/fcmClient');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Internal endpoint called by other microservices to trigger notifications.
 * POST /internal/notify
 */
router.post('/notify', async (req, res, next) => {
  try {
    const { userId, type, targetId, targetType, actorId, deepLink, payload } = req.body;

    if (!userId || !type) {
      return res.status(400).json({ error: 'userId and type are required' });
    }

    // Save notification to DB
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        targetId,
        targetType,
        actorId,
        deepLink,
        payload: JSON.stringify(payload || {}),
      },
    });

    // Get user FCM token
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.fcmToken) {
      const pushResult = await sendPush(
        user.fcmToken,
        {
          notificationId: notification.id,
          type,
          targetId: targetId || '',
          targetType: targetType || '',
          deepLink: deepLink || '',
          ...payload,
        },
        getNotificationTitle(type),
        getNotificationBody(type, payload)
      );

      // Mark as sent if push succeeded
      if (pushResult.success) {
        await prisma.notification.update({
          where: { id: notification.id },
          data: { sentAt: new Date() },
        });
      }
    }

    res.json({ success: true, notificationId: notification.id });
  } catch (err) {
    next(err);
  }
});

function getNotificationTitle(type) {
  const titles = {
    AI_LOOK_READY: '✨ Your AI Look is ready!',
    BOOKING_CONFIRMED: '📅 Booking confirmed',
    BOOKING_CANCELLED: '❌ Booking cancelled',
    PAYMENT_SUCCESS: '💳 Payment successful',
    PAYMENT_FAILED: '⚠️ Payment failed',
    NEW_MESSAGE: '💬 New message',
    NEW_COMMENT: '💬 New comment',
    NEW_LIKE: '❤️ New like',
    NEW_APPLAUSE: '👏 New applause',
    SYSTEM: '📢 Beauty & Style',
  };
  return titles[type] || 'Beauty & Style';
}

function getNotificationBody(type, payload = {}) {
  const bodies = {
    AI_LOOK_READY: 'Tap to see your generated look and book an appointment!',
    BOOKING_CONFIRMED: `Your booking has been confirmed.`,
    BOOKING_CANCELLED: 'Your booking has been cancelled.',
    PAYMENT_SUCCESS: 'Your payment was processed successfully.',
    PAYMENT_FAILED: 'There was an issue with your payment. Please try again.',
    NEW_MESSAGE: payload.senderName ? `${payload.senderName} sent you a message` : 'You have a new message',
    NEW_COMMENT: 'Someone commented on your post',
    NEW_LIKE: 'Someone liked your post',
    NEW_APPLAUSE: 'Someone applauded your post',
    SYSTEM: payload.message || 'Check out what\'s new!',
  };
  return bodies[type] || 'Tap to open';
}

module.exports = router;
