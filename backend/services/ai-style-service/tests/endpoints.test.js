'use strict';

/**
 * Integration tests for the AI Look HTTP endpoints.
 * Uses supertest with mocked S3 and BullMQ queue.
 */
const request = require('supertest');
const app = require('../src/index');
const db = require('../src/lib/db');

// Mock S3 uploader
jest.mock('../src/lib/s3', () => ({
  uploadBuffer: jest.fn().mockResolvedValue('https://s3.example.com/originals/test.jpg')
}));

// Mock BullMQ Queue
jest.mock('bullmq', () => {
  const addMock = jest.fn().mockResolvedValue({ id: 'job-1' });
  return {
    Queue: jest.fn().mockImplementation(() => ({ add: addMock }))
  };
});

// Use demo-user auth (no JWT_SECRET set in tests)
const authHeaders = { 'x-user-id': 'test-user-1' };

describe('GET /health', () => {
  it('returns 200 with service info', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('ai-style-service');
  });
});

describe('POST /api/ai-look/upload', () => {
  afterEach(() => {
    db.clear();
  });

  it('returns 400 when no file is provided', async () => {
    const res = await request(app)
      .post('/api/ai-look/upload')
      .set(authHeaders);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('no_file');
  });

  it('returns 401 when no auth is provided and JWT_SECRET is set', async () => {
    process.env.JWT_SECRET = 'test-secret';
    const res = await request(app)
      .post('/api/ai-look/upload');
    expect(res.status).toBe(401);
    delete process.env.JWT_SECRET;
  });

  it('successfully uploads a photo and creates a look record', async () => {
    const fakeImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

    const res = await request(app)
      .post('/api/ai-look/upload')
      .set(authHeaders)
      .attach('photo', fakeImage, { filename: 'test.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('originalUrl');
  });
});

describe('POST /api/ai-look/generate', () => {
  let lookId;

  beforeEach(() => {
    const look = db.createLook({
      userId: 'test-user-1',
      originalUrl: 'https://s3.example.com/originals/test.jpg',
      preset: null,
      provider: 'pending',
      resultUrls: [],
      status: 'pending',
      saved: false
    });
    lookId = look.id;
  });

  afterEach(() => {
    db.clear();
  });

  it('returns 400 when id or preset is missing', async () => {
    const res = await request(app)
      .post('/api/ai-look/generate')
      .set(authHeaders)
      .send({ id: lookId });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('missing_fields');
  });

  it('returns 404 for unknown look id', async () => {
    const res = await request(app)
      .post('/api/ai-look/generate')
      .set(authHeaders)
      .send({ id: 'nonexistent-id', preset: 'bob-short' });
    expect(res.status).toBe(404);
  });

  it('queues a generation job', async () => {
    const res = await request(app)
      .post('/api/ai-look/generate')
      .set(authHeaders)
      .send({ id: lookId, preset: 'bob-short', provider: 'replicate' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('queued');
    expect(res.body.id).toBe(lookId);
  });
});

describe('GET /api/ai-look/status/:id', () => {
  let lookId;

  beforeEach(() => {
    const look = db.createLook({
      userId: 'test-user-1',
      originalUrl: 'https://s3.example.com/originals/test.jpg',
      preset: 'bob-short',
      provider: 'replicate',
      resultUrls: [],
      status: 'processing',
      saved: false
    });
    lookId = look.id;
  });

  afterEach(() => {
    db.clear();
  });

  it('returns processing status when no results yet', async () => {
    const res = await request(app)
      .get(`/api/ai-look/status/${lookId}`)
      .set(authHeaders);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('processing');
    expect(res.body.resultUrls).toEqual([]);
  });

  it('returns done status when results are present', async () => {
    db.updateLook(lookId, { resultUrls: ['https://s3.example.com/ai-looks/result.jpg'], status: 'done' });

    const res = await request(app)
      .get(`/api/ai-look/status/${lookId}`)
      .set(authHeaders);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('done');
    expect(res.body.resultUrls).toHaveLength(1);
  });

  it('returns 404 for unknown look', async () => {
    const res = await request(app)
      .get('/api/ai-look/status/unknown-id')
      .set(authHeaders);
    expect(res.status).toBe(404);
  });
});

describe('POST /api/ai-look/save', () => {
  let lookId;

  beforeEach(() => {
    const look = db.createLook({
      userId: 'test-user-1',
      originalUrl: 'https://s3.example.com/originals/test.jpg',
      preset: 'bob-short',
      provider: 'replicate',
      resultUrls: ['https://s3.example.com/ai-looks/result.jpg'],
      status: 'done',
      saved: false
    });
    lookId = look.id;
  });

  afterEach(() => {
    db.clear();
  });

  it('marks look as saved', async () => {
    const res = await request(app)
      .post('/api/ai-look/save')
      .set(authHeaders)
      .send({ id: lookId });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('saved');

    const look = db.getLook(lookId);
    expect(look.saved).toBe(true);
  });
});

describe('POST /api/ai-look/book', () => {
  let lookId;

  beforeEach(() => {
    const look = db.createLook({
      userId: 'test-user-1',
      originalUrl: 'https://s3.example.com/originals/test.jpg',
      preset: 'bob-short',
      provider: 'replicate',
      resultUrls: ['https://s3.example.com/ai-looks/result.jpg'],
      status: 'done',
      saved: true
    });
    lookId = look.id;
  });

  afterEach(() => {
    db.clear();
  });

  it('creates a booking linked to the look', async () => {
    const res = await request(app)
      .post('/api/ai-look/book')
      .set(authHeaders)
      .send({
        lookId,
        professionalId: 'pro-1',
        serviceId: 'svc-1',
        date: '2026-05-01',
        startTime: '10:00',
        totalPrice: 50
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.generatedLookId).toBe(lookId);
    expect(res.body.status).toBe('PENDING');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/ai-look/book')
      .set(authHeaders)
      .send({ lookId });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('missing_fields');
  });
});
