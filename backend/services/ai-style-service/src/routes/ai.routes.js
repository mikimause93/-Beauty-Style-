const express = require('express');
const multer = require('multer');
const { Queue } = require('bullmq');
const { PrismaClient } = require('@prisma/client');
const S3 = require('../lib/s3');

const redisConnection = {
  connection: {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
};

const prisma = new PrismaClient();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});
const queue = new Queue('ai-style', redisConnection);

const router = express.Router();

// Middleware: mock auth — in production replace with real JWT verification
async function mockAuth(req, res, next) {
  req.user = req.user || { userId: req.headers['x-user-id'] || 'demo-user' };
  next();
}

router.use(mockAuth);

/**
 * POST /api/ai-look/upload
 * Accepts a multipart/form-data 'photo' field, uploads to S3, creates DB record.
 */
router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const key = `originals/${Date.now()}-${req.file.originalname}`;
    const originalUrl = await S3.uploadBuffer(req.file.buffer, key);
    const record = await prisma.generatedLook.create({
      data: {
        userId: req.user.userId,
        originalUrl,
        preset: 'none',
        provider: 'queued',
        resultUrls: []
      }
    });
    res.json({ id: record.id, originalUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'upload_failed' });
  }
});

/**
 * POST /api/ai-look/generate
 * Enqueues an AI generation job for the given look ID and preset.
 */
router.post('/generate', async (req, res) => {
  try {
    const { id, preset, params, provider } = req.body;
    const look = await prisma.generatedLook.findUnique({ where: { id } });
    if (!look) return res.status(404).json({ error: 'look_not_found' });
    await queue.add('generate', {
      lookId: id,
      originalUrl: look.originalUrl,
      preset,
      params,
      provider: provider || 'replicate'
    });
    await prisma.generatedLook.update({
      where: { id },
      data: { preset, provider: provider || 'replicate' }
    });
    res.json({ status: 'queued', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'generate_failed' });
  }
});

/**
 * GET /api/ai-look/status/:id
 * Returns processing status for a look.
 */
router.get('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const look = await prisma.generatedLook.findUnique({ where: { id } });
    if (!look) return res.status(404).json({ error: 'not_found' });
    const isDone = Array.isArray(look.resultUrls) && look.resultUrls.length > 0;
    res.json({
      id,
      status: isDone ? 'done' : 'processing',
      resultUrls: look.resultUrls || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'status_failed' });
  }
});

/**
 * GET /api/ai-look/result/:id
 * Returns the generated result URLs for a look.
 */
router.get('/result/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const look = await prisma.generatedLook.findUnique({ where: { id } });
    if (!look) return res.status(404).json({ error: 'not_found' });
    res.json({ id, resultUrls: look.resultUrls || [], provider: look.provider });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'result_failed' });
  }
});

/**
 * POST /api/ai-look/save
 * Marks a generated look as saved by the user.
 */
router.post('/save', async (req, res) => {
  try {
    const { id } = req.body;
    await prisma.generatedLook.update({ where: { id }, data: { saved: true } });
    res.json({ status: 'saved', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'save_failed' });
  }
});

/**
 * POST /api/ai-look/book
 * Creates a booking linked to a generated look.
 */
router.post('/book', async (req, res) => {
  try {
    const { lookId, professionalId, serviceId, date, startTime, totalPrice } = req.body;
    const clientId = req.user.userId;
    const booking = await prisma.booking.create({
      data: {
        clientId,
        professionalId,
        date: new Date(date),
        startTime,
        totalPrice: totalPrice || 0,
        status: 'PENDING',
        generatedLookId: lookId
      }
    });
    await prisma.generatedLook.update({
      where: { id: lookId },
      data: { bookingId: booking.id }
    });
    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'booking_failed' });
  }
});

module.exports = router;

// Multer error handler — must be registered in Express after the router
function multerErrorHandler(err, req, res, next) {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File size exceeds the 5 MB limit' });
  }
  next(err);
}

module.exports.multerErrorHandler = multerErrorHandler;
