require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { Queue } = require('bullmq');
const { PrismaClient } = require('@prisma/client');
const S3 = require('../lib/s3');

const prisma = new PrismaClient();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const redisOpts = {
  connection: {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379', 10)
  }
};

const queue = new Queue('ai-style', redisOpts);

const router = express.Router();

// Lightweight auth middleware — expects x-user-id header (plug real JWT in production)
function authMiddleware(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  req.user = { userId };
  next();
}

router.use(authMiddleware);

// POST /api/ai-look/upload
router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'no_file' });
    const { v4: uuidv4 } = require('uuid');
    const ext = (req.file.originalname || 'photo').replace(/[^a-z0-9.]/gi, '').split('.').pop() || 'jpg';
    const key = `originals/${Date.now()}-${uuidv4()}.${ext}`;
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
    console.error('upload error', err);
    res.status(500).json({ error: 'upload_failed' });
  }
});

// POST /api/ai-look/generate
router.post('/generate', async (req, res) => {
  try {
    const { id, preset, params, provider } = req.body;
    if (!id) return res.status(400).json({ error: 'id_required' });
    const look = await prisma.generatedLook.findUnique({ where: { id } });
    if (!look) return res.status(404).json({ error: 'look_not_found' });
    const selectedProvider = provider || 'replicate';
    await queue.add('generate', {
      lookId: id,
      originalUrl: look.originalUrl,
      preset,
      params,
      provider: selectedProvider
    });
    await prisma.generatedLook.update({
      where: { id },
      data: { preset, provider: selectedProvider }
    });
    res.json({ status: 'queued', id });
  } catch (err) {
    console.error('generate error', err);
    res.status(500).json({ error: 'generate_failed' });
  }
});

// GET /api/ai-look/status/:id
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
    console.error('status error', err);
    res.status(500).json({ error: 'status_failed' });
  }
});

// GET /api/ai-look/result/:id
router.get('/result/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const look = await prisma.generatedLook.findUnique({ where: { id } });
    if (!look) return res.status(404).json({ error: 'not_found' });
    res.json({ id, resultUrls: look.resultUrls || [], provider: look.provider });
  } catch (err) {
    console.error('result error', err);
    res.status(500).json({ error: 'result_failed' });
  }
});

// POST /api/ai-look/save
router.post('/save', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id_required' });
    await prisma.generatedLook.update({ where: { id }, data: { saved: true } });
    res.json({ status: 'saved', id });
  } catch (err) {
    console.error('save error', err);
    res.status(500).json({ error: 'save_failed' });
  }
});

// POST /api/ai-look/book
router.post('/book', async (req, res) => {
  try {
    const { lookId, professionalId, serviceId, date, startTime, totalPrice } =
      req.body;
    if (!lookId || !professionalId || !date || !startTime) {
      return res.status(400).json({ error: 'missing_required_fields' });
    }
    const clientId = req.user.userId;
    const booking = await prisma.booking.create({
      data: {
        clientId,
        professionalId,
        serviceId: serviceId || null,
        date: new Date(date),
        startTime,
        totalPrice: totalPrice || 0,
        status: 'PENDING',
        generatedLookId: lookId
      }
    });
    res.status(201).json(booking);
  } catch (err) {
    console.error('book error', err);
    res.status(500).json({ error: 'booking_failed' });
  }
});

module.exports = router;
