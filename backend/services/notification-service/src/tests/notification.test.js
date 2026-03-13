const request = require('supertest');

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    notification: {
      create: jest.fn().mockResolvedValue({ id: 'notif-1', userId: 'u-1', type: 'AI_LOOK_READY' }),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: 'u-1', fullName: 'Test User', fcmToken: null }),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock('../utils/fcmClient', () => ({
  sendPush: jest.fn().mockResolvedValue({ success: true, messageId: 'msg-1' }),
}));

const app = require('../index');

describe('Notification Service', () => {
  describe('GET /health', () => {
    it('returns 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
    });
  });

  describe('POST /internal/notify', () => {
    it('returns 400 when userId missing', async () => {
      const res = await request(app)
        .post('/internal/notify')
        .send({ type: 'AI_LOOK_READY' });
      expect(res.status).toBe(400);
    });

    it('creates notification and returns success', async () => {
      const res = await request(app)
        .post('/internal/notify')
        .send({
          userId: 'u-1',
          type: 'AI_LOOK_READY',
          targetId: 'look-1',
          targetType: 'GeneratedLook',
          deepLink: 'beautyapp://ai-look/result/look-1',
          payload: { resultUrl: 'https://example.com/result.jpg' },
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('notificationId');
    });
  });

  describe('GET /api/notifications', () => {
    it('returns 401 without userId', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.status).toBe(401);
    });

    it('returns notifications for user', async () => {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      prisma.notification.findMany.mockResolvedValueOnce([
        { id: 'n-1', type: 'AI_LOOK_READY', read: false },
      ]);

      const res = await request(app)
        .get('/api/notifications')
        .set('x-user-id', 'u-1');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('notifications');
    });
  });
});
