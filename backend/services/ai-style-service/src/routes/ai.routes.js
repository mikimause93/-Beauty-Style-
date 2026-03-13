const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { Queue } = require('bullmq');
const rateLimit = require('express-rate-limit');
const S3 = require('../lib/s3');
const db = require('../lib/db');
const { requireAuth } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});

const redisConnection = {
  connection: {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379', 10)
  }
};

const queue = new Queue('ai-style', redisConnection);

// Rate limiters
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too_many_requests', message: 'Too many upload requests, please try again later.' }
});

const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too_many_requests', message: 'Generation limit reached, please try again later.' }
});

const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too_many_requests', message: 'Too many requests, please try again later.' }
});

const router = express.Router();

/**
 * POST /api/ai-look/upload
 * Upload original photo and create a GeneratedLook record.
 * Requires: multipart/form-data with field 'photo'
 * Returns: { id, originalUrl }
 */
router.post('/upload', uploadLimiter, requireAuth, upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'no_file', message: 'No photo file provided' });
    }

    // NSFW moderation placeholder – integrate Vision API here
    const isNsfw = await moderateImage(req.file.buffer);
    if (isNsfw) {
      return res.status(422).json({ error: 'nsfw_rejected', message: 'Image rejected by content moderation' });
    }

    const safeFilename = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `originals/${uuidv4()}-${safeFilename}`;
    const originalUrl = await S3.uploadBuffer(req.file.buffer, key, req.file.mimetype);

    const record = db.createLook({
      userId: req.user.userId,
      originalUrl,
      preset: null,
      provider: 'pending',
      resultUrls: [],
      saved: false
    });

    res.status(201).json({ id: record.id, originalUrl });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/ai-look/generate
 * Queue an AI generation job for a previously uploaded look.
 * Body: { id, preset, params?, provider? }
 * Returns: { status: 'queued', id }
 */
router.post('/generate', generateLimiter, requireAuth, async (req, res, next) => {
  try {
    const { id, preset, params = {}, provider = 'replicate' } = req.body;
    if (!id || !preset) {
      return res.status(400).json({ error: 'missing_fields', message: 'id and preset are required' });
    }

    const look = db.getLook(id);
    if (!look) {
      return res.status(404).json({ error: 'look_not_found' });
    }
    if (look.userId !== req.user.userId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    db.updateLook(id, { preset, provider, status: 'queued' });

    await queue.add('generate', {
      lookId: id,
      originalUrl: look.originalUrl,
      preset,
      params,
      provider
    });

    res.json({ status: 'queued', id });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/ai-look/status/:id
 * Poll the processing status of a GeneratedLook job.
 * Returns: { id, status, resultUrls }
 */
router.get('/status/:id', readLimiter, requireAuth, async (req, res, next) => {
  try {
    const look = db.getLook(req.params.id);
    if (!look) {
      return res.status(404).json({ error: 'not_found' });
    }
    if (look.userId !== req.user.userId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    const status = look.resultUrls && look.resultUrls.length > 0 ? 'done' : (look.status || 'processing');
    res.json({ id: look.id, status, resultUrls: look.resultUrls || [] });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/ai-look/result/:id
 * Retrieve the final result URLs for a look.
 * Returns: { id, resultUrls, provider }
 */
router.get('/result/:id', readLimiter, requireAuth, async (req, res, next) => {
  try {
    const look = db.getLook(req.params.id);
    if (!look) {
      return res.status(404).json({ error: 'not_found' });
    }
    if (look.userId !== req.user.userId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    res.json({ id: look.id, resultUrls: look.resultUrls || [], provider: look.provider });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/ai-look/save
 * Mark a generated look as saved (added to user portfolio).
 * Body: { id }
 * Returns: { status: 'saved', id }
 */
router.post('/save', readLimiter, requireAuth, async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'missing_id' });
    }

    const look = db.getLook(id);
    if (!look) {
      return res.status(404).json({ error: 'not_found' });
    }
    if (look.userId !== req.user.userId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    db.updateLook(id, { saved: true });
    res.json({ status: 'saved', id });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/ai-look/book
 * Create a booking linked to a generated look.
 * Body: { lookId, professionalId, serviceId, date, startTime, totalPrice }
 * Returns: booking object
 */
router.post('/book', readLimiter, requireAuth, async (req, res, next) => {
  try {
    const { lookId, professionalId, serviceId, date, startTime, totalPrice } = req.body;
    if (!lookId || !professionalId || !date || !startTime) {
      return res.status(400).json({ error: 'missing_fields', message: 'lookId, professionalId, date and startTime are required' });
    }

    const look = db.getLook(lookId);
    if (!look) {
      return res.status(404).json({ error: 'look_not_found' });
    }
    if (look.userId !== req.user.userId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    const booking = db.createBooking({
      clientId: req.user.userId,
      professionalId,
      serviceId: serviceId || null,
      date: new Date(date),
      startTime,
      totalPrice: totalPrice || 0,
      status: 'PENDING',
      generatedLookId: lookId
    });

    db.updateLook(lookId, { bookingId: booking.id });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});

// Placeholder NSFW moderation – returns false (allow) by default
// Replace with actual Vision API call in production
async function moderateImage(_buffer) {
  // TODO: integrate Google Vision SafeSearch or AWS Rekognition
  return false;
}

module.exports = router;
