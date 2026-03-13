const express = require('express');
const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const router = express.Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

/**
 * POST /api/bookings/webhook
 * Stripe webhook handler — verify signature and process events.
 */
router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata?.bookingId;

        if (bookingId) {
          const booking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'confirmed' },
          });

          // Notify user
          await axios.post(
            `${process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:4003'}/internal/notify`,
            {
              userId: booking.userId,
              type: 'PAYMENT_SUCCESS',
              targetId: bookingId,
              targetType: 'Booking',
              deepLink: `beautyapp://booking/${bookingId}`,
              payload: { amount: paymentIntent.amount, currency: paymentIntent.currency },
            }
          ).catch((e) => console.warn('Notification failed:', e.message));

          // Also send booking confirmed notification
          await axios.post(
            `${process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:4003'}/internal/notify`,
            {
              userId: booking.userId,
              type: 'BOOKING_CONFIRMED',
              targetId: bookingId,
              targetType: 'Booking',
              deepLink: `beautyapp://booking/${bookingId}`,
              payload: { bookingId },
            }
          ).catch((e) => console.warn('Notification failed:', e.message));

          console.log(`Booking ${bookingId} confirmed via Stripe webhook`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata?.bookingId;

        if (bookingId) {
          const booking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'pending' },
          });

          await axios.post(
            `${process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:4003'}/internal/notify`,
            {
              userId: booking.userId,
              type: 'PAYMENT_FAILED',
              targetId: bookingId,
              targetType: 'Booking',
              deepLink: `beautyapp://booking/${bookingId}/retry-payment`,
              payload: { bookingId },
            }
          ).catch((e) => console.warn('Notification failed:', e.message));
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
