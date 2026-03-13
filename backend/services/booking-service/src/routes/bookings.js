const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');
const axios = require('axios');

const router = express.Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

/**
 * GET /api/bookings
 * List bookings for authenticated user.
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { scheduledAt: 'asc' },
      include: { generatedLook: true },
    });

    res.json({ bookings });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/bookings
 * Create a new booking.
 */
router.post(
  '/',
  [
    body('professionalId').notEmpty(),
    body('scheduledAt').notEmpty().isISO8601(),
    body('amount').notEmpty().isFloat({ min: 0.5 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { professionalId, scheduledAt, generatedLookId, notes, amount, currency } = req.body;

      const booking = await prisma.booking.create({
        data: {
          userId,
          professionalId,
          generatedLookId,
          scheduledAt: new Date(scheduledAt),
          notes,
          amount,
          currency: currency || 'EUR',
          status: 'pending',
        },
      });

      res.status(201).json({ booking });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/bookings/confirm
 * Create a Stripe PaymentIntent for a booking.
 */
router.post(
  '/confirm',
  [
    body('bookingId').notEmpty(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { bookingId } = req.body;

      const booking = await prisma.booking.findFirst({
        where: { id: bookingId, userId },
      });

      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      if (booking.status !== 'pending') {
        return res.status(409).json({ error: `Booking is already ${booking.status}` });
      }

      // Create Stripe PaymentIntent
      const amountInCents = Math.round((booking.amount || 50) * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: (booking.currency || 'EUR').toLowerCase(),
        metadata: {
          bookingId: booking.id,
          userId,
          professionalId: booking.professionalId,
        },
        description: `Beauty & Style booking ${booking.id}`,
      });

      // Update booking with PaymentIntent
      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'payment_pending',
          stripePaymentIntentId: paymentIntent.id,
          stripeClientSecret: paymentIntent.client_secret,
        },
      });

      res.json({
        bookingId: booking.id,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amountInCents,
        currency: booking.currency,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /api/bookings/:id/cancel
 */
router.patch('/:id/cancel', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const booking = await prisma.booking.findFirst({ where: { id: req.params.id, userId } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'cancelled' },
    });

    // Notify user
    await notifyUser(userId, 'BOOKING_CANCELLED', booking.id, updated);

    res.json({ booking: updated });
  } catch (err) {
    next(err);
  }
});

async function notifyUser(userId, type, targetId, booking) {
  try {
    await axios.post(
      `${process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:4003'}/internal/notify`,
      {
        userId,
        type,
        targetId,
        targetType: 'Booking',
        deepLink: `beautyapp://booking/${targetId}`,
        payload: { bookingId: targetId },
      }
    );
  } catch (err) {
    console.warn('Notification failed:', err.message);
  }
}

module.exports = router;
