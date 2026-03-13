const request = require('supertest');

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    booking: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    wallet: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    bankAccount: {
      create: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock('stripe', () =>
  jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_abc',
        amount: 5000,
        currency: 'eur',
      }),
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_test_123', metadata: { bookingId: 'booking-1', userId: 'user-1' }, amount: 5000, currency: 'eur' } },
      }),
    },
  }))
);

jest.mock('axios', () => ({ post: jest.fn().mockResolvedValue({ data: {} }) }));

const { PrismaClient } = require('@prisma/client');
const mockPrisma = new PrismaClient();
const app = require('../index');

describe('Booking Service', () => {
  describe('GET /health', () => {
    it('returns 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.service).toBe('booking-service');
    });
  });

  describe('GET /api/bookings', () => {
    it('returns 401 without userId header', async () => {
      const res = await request(app).get('/api/bookings');
      expect(res.status).toBe(401);
    });

    it('returns bookings list', async () => {
      mockPrisma.booking.findMany.mockResolvedValueOnce([
        { id: 'b-1', userId: 'u-1', status: 'confirmed' },
      ]);
      const res = await request(app).get('/api/bookings').set('x-user-id', 'u-1');
      expect(res.status).toBe(200);
      expect(res.body.bookings).toHaveLength(1);
    });
  });

  describe('POST /api/bookings', () => {
    it('returns 400 when required fields missing', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-user-id', 'u-1')
        .send({});
      expect(res.status).toBe(400);
    });

    it('creates a booking', async () => {
      const mockBooking = { id: 'b-new', userId: 'u-1', professionalId: 'pro-1', status: 'pending' };
      mockPrisma.booking.create.mockResolvedValueOnce(mockBooking);
      const res = await request(app)
        .post('/api/bookings')
        .set('x-user-id', 'u-1')
        .send({ professionalId: 'pro-1', scheduledAt: '2024-12-01T10:00:00Z', amount: 50 });
      expect(res.status).toBe(201);
      expect(res.body.booking.id).toBe('b-new');
    });
  });

  describe('POST /api/bookings/confirm', () => {
    it('returns 401 without userId', async () => {
      const res = await request(app).post('/api/bookings/confirm').send({ bookingId: 'b-1' });
      expect(res.status).toBe(401);
    });

    it('creates Stripe PaymentIntent', async () => {
      mockPrisma.booking.findFirst.mockResolvedValueOnce({
        id: 'b-1', userId: 'u-1', professionalId: 'pro-1', status: 'pending', amount: 50, currency: 'EUR',
      });
      mockPrisma.booking.update.mockResolvedValueOnce({ id: 'b-1', status: 'payment_pending' });

      const res = await request(app)
        .post('/api/bookings/confirm')
        .set('x-user-id', 'u-1')
        .send({ bookingId: 'b-1' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('clientSecret');
      expect(res.body).toHaveProperty('paymentIntentId');
    });
  });

  describe('POST /api/wallet/bank-account', () => {
    it('returns 400 for invalid IBAN', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValueOnce({ id: 'w-1', userId: 'u-1' });
      const res = await request(app)
        .post('/api/wallet/bank-account')
        .set('x-user-id', 'u-1')
        .send({ iban: 'INVALID_IBAN', accountName: 'Test Account' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/IBAN/i);
    });

    it('creates bank account with valid IBAN', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValueOnce({ id: 'w-1', userId: 'u-1' });
      mockPrisma.bankAccount.create.mockResolvedValueOnce({
        id: 'ba-1', iban: 'IT60X0542811101000000123456', accountName: 'Test',
      });
      mockPrisma.bankAccount.updateMany.mockResolvedValueOnce({});
      const res = await request(app)
        .post('/api/wallet/bank-account')
        .set('x-user-id', 'u-1')
        .send({ iban: 'IT60X0542811101000000123456', accountName: 'Test Account', isDefault: true });
      expect(res.status).toBe(201);
      expect(res.body.bankAccount.id).toBe('ba-1');
    });
  });
});
