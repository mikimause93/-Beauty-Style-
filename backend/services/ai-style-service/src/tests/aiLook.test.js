const request = require('supertest');

// Mock all external dependencies before requiring app
jest.mock('../utils/s3Uploader', () => ({
  uploadToS3: jest.fn().mockResolvedValue('https://mock-bucket.s3.amazonaws.com/uploads/test-id/photo.jpg'),
  getPresignedUrl: jest.fn().mockResolvedValue('https://presigned-url.example.com'),
}));

jest.mock('../utils/queue', () => ({
  enqueueGeneration: jest.fn().mockResolvedValue('mock-job-id-123'),
  getJobStatus: jest.fn().mockImplementation((id) => {
    if (id === 'existing-job') {
      return Promise.resolve({ jobId: 'existing-job', state: 'completed', progress: 100, result: { lookId: 'look-1', resultUrls: ['https://example.com/result.jpg'] } });
    }
    return Promise.resolve(null);
  }),
}));

jest.mock('../utils/moderation', () => ({
  moderateImage: jest.fn().mockResolvedValue(true),
}));

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    generatedLook: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    booking: {
      create: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const { PrismaClient } = require('@prisma/client');
const mockPrisma = new PrismaClient();

const app = require('../index');

describe('AI Look API', () => {
  describe('GET /health', () => {
    it('returns 200 with service name', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('ai-style-service');
    });
  });

  describe('POST /api/ai-look/upload', () => {
    it('returns 400 when no file is provided', async () => {
      const res = await request(app).post('/api/ai-look/upload');
      expect(res.status).toBe(400);
    });

    it('returns 400 when consent is not accepted', async () => {
      const res = await request(app)
        .post('/api/ai-look/upload')
        .attach('photo', Buffer.from('fake-image'), 'test.jpg')
        .field('consentAccepted', 'false');
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/consent/i);
    });

    it('returns 201 with uploadId when file and consent are valid', async () => {
      const res = await request(app)
        .post('/api/ai-look/upload')
        .attach('photo', Buffer.from('fake-image-data'), 'photo.jpg')
        .field('consentAccepted', 'true');
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('uploadId');
      expect(res.body).toHaveProperty('url');
    });
  });

  describe('POST /api/ai-look/generate', () => {
    it('returns 400 when required fields are missing', async () => {
      const res = await request(app).post('/api/ai-look/generate').send({});
      expect(res.status).toBe(400);
    });

    it('returns 202 with jobId when fields are valid', async () => {
      const res = await request(app)
        .post('/api/ai-look/generate')
        .send({ uploadId: 'upload-123', userId: 'user-456', preset: 'glam' });
      expect(res.status).toBe(202);
      expect(res.body).toHaveProperty('jobId', 'mock-job-id-123');
      expect(res.body.status).toBe('queued');
    });
  });

  describe('GET /api/ai-look/status/:id', () => {
    it('returns 404 for unknown job id', async () => {
      const res = await request(app).get('/api/ai-look/status/unknown-job-id');
      expect(res.status).toBe(404);
    });

    it('returns status for existing job', async () => {
      const res = await request(app).get('/api/ai-look/status/existing-job');
      expect(res.status).toBe(200);
      expect(res.body.state).toBe('completed');
    });
  });

  describe('GET /api/ai-look/result/:id', () => {
    it('returns 404 when look not found', async () => {
      mockPrisma.generatedLook.findUnique.mockResolvedValueOnce(null);
      const res = await request(app).get('/api/ai-look/result/nonexistent-id');
      expect(res.status).toBe(404);
    });

    it('returns look data when found', async () => {
      const mockLook = { id: 'look-1', userId: 'user-1', resultUrl: 'https://example.com/result.jpg', preset: 'glam', status: 'completed' };
      mockPrisma.generatedLook.findUnique.mockResolvedValueOnce(mockLook);
      const res = await request(app).get('/api/ai-look/result/look-1');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('look-1');
    });
  });

  describe('POST /api/ai-look/save', () => {
    it('returns 400 when required fields are missing', async () => {
      const res = await request(app).post('/api/ai-look/save').send({});
      expect(res.status).toBe(400);
    });

    it('returns 201 with saved look', async () => {
      const mockLook = { id: 'look-saved-1', userId: 'user-1', jobId: 'job-1', resultUrl: 'https://example.com/r.jpg', preset: 'natural', status: 'saved' };
      mockPrisma.generatedLook.create.mockResolvedValueOnce(mockLook);
      const res = await request(app)
        .post('/api/ai-look/save')
        .send({ jobId: 'job-1', userId: 'user-1', resultUrl: 'https://example.com/r.jpg', preset: 'natural' });
      expect(res.status).toBe(201);
      expect(res.body.id).toBe('look-saved-1');
    });
  });

  describe('POST /api/ai-look/book', () => {
    it('returns 400 when required fields are missing', async () => {
      const res = await request(app).post('/api/ai-look/book').send({});
      expect(res.status).toBe(400);
    });

    it('returns 201 with booking when fields are valid', async () => {
      const mockBooking = { id: 'booking-1', userId: 'user-1', professionalId: 'pro-1', generatedLookId: 'look-1', status: 'pending' };
      mockPrisma.booking.create.mockResolvedValueOnce(mockBooking);
      const res = await request(app)
        .post('/api/ai-look/book')
        .send({ generatedLookId: 'look-1', userId: 'user-1', professionalId: 'pro-1', scheduledAt: '2024-12-01T10:00:00Z' });
      expect(res.status).toBe(201);
      expect(res.body.booking.id).toBe('booking-1');
    });
  });
});
