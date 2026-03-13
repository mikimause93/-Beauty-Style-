const express = require('express');
const { param, body, validationResult } = require('express-validator');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const { uploadToS3, getPresignedUrl } = require('../utils/s3Uploader');
const { enqueueGeneration, getJobStatus } = require('../utils/queue');
const { moderateImage } = require('../utils/moderation');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

/**
 * POST /api/ai-look/upload
 * Upload user photo for AI look generation.
 * Requires multipart/form-data with field "photo" and optional consent flag.
 */
router.post('/upload', upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No photo uploaded' });

    // Consent check
    if (!req.body.consentAccepted || req.body.consentAccepted !== 'true') {
      return res.status(400).json({ error: 'User consent required for photo upload' });
    }

    // NSFW moderation
    const isSafe = await moderateImage(req.file.buffer);
    if (!isSafe) {
      return res.status(422).json({ error: 'Image failed safety moderation' });
    }

    const uploadId = uuidv4();
    const key = `uploads/${uploadId}/${req.file.originalname}`;
    const url = await uploadToS3(req.file.buffer, key, req.file.mimetype);

    res.status(201).json({ uploadId, url, message: 'Photo uploaded successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/ai-look/generate
 * Enqueue AI look generation for a previously uploaded image.
 */
router.post(
  '/generate',
  [
    body('uploadId').notEmpty().withMessage('uploadId is required'),
    body('preset').optional().isString(),
    body('userId').notEmpty().withMessage('userId is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { uploadId, preset, userId, styleOptions } = req.body;

      const jobId = await enqueueGeneration({ uploadId, preset, userId, styleOptions });

      res.status(202).json({
        jobId,
        status: 'queued',
        message: 'Generation job enqueued. Poll /status/:id for updates.',
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/ai-look/status/:id
 * Poll generation job status.
 */
router.get(
  '/status/:id',
  [param('id').notEmpty()],
  validate,
  async (req, res, next) => {
    try {
      const status = await getJobStatus(req.params.id);
      if (!status) return res.status(404).json({ error: 'Job not found' });
      res.json(status);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/ai-look/result/:id
 * Fetch generated look result by GeneratedLook DB id.
 */
router.get(
  '/result/:id',
  [param('id').notEmpty()],
  validate,
  async (req, res, next) => {
    try {
      const look = await prisma.generatedLook.findUnique({ where: { id: req.params.id } });
      if (!look) return res.status(404).json({ error: 'Result not found' });
      res.json(look);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/ai-look/save
 * Save a generated look to user's collection.
 */
router.post(
  '/save',
  [
    body('jobId').notEmpty(),
    body('userId').notEmpty(),
    body('resultUrl').notEmpty().isURL(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { jobId, userId, resultUrl, preset, metadata } = req.body;

      const look = await prisma.generatedLook.create({
        data: {
          userId,
          jobId,
          resultUrl,
          preset: preset || 'custom',
          metadata: JSON.stringify(metadata || {}),
          status: 'saved',
        },
      });

      res.status(201).json(look);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/ai-look/book
 * Create a booking referencing a generated look.
 */
router.post(
  '/book',
  [
    body('generatedLookId').notEmpty(),
    body('userId').notEmpty(),
    body('professionalId').notEmpty(),
    body('scheduledAt').notEmpty().isISO8601(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { generatedLookId, userId, professionalId, scheduledAt, notes } = req.body;

      const booking = await prisma.booking.create({
        data: {
          userId,
          professionalId,
          generatedLookId,
          scheduledAt: new Date(scheduledAt),
          notes: notes || '',
          status: 'pending',
        },
      });

      res.status(201).json({ booking, message: 'Booking created. Proceed to payment.' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
