require('dotenv').config();
const { Worker } = require('bullmq');
const { PrismaClient } = require('@prisma/client');
const { getRedisConnection } = require('../utils/redisClient');
const { generateLook } = require('../utils/aiClient');
const { uploadToS3 } = require('../utils/s3Uploader');
const axios = require('axios');

const prisma = new PrismaClient();
const QUEUE_NAME = 'ai-look-generation';

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const { uploadId, preset, userId, styleOptions } = job.data;

    console.log(`[Worker] Processing job ${job.id} for user ${userId}`);

    await job.updateProgress(10);

    // Construct source image URL from uploadId
    const sourceUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/uploads/${uploadId}`;

    await job.updateProgress(20);

    // Generate look with AI
    const resultUrls = await generateLook(sourceUrl, preset, styleOptions || {});

    await job.updateProgress(80);

    // Save results to DB
    const look = await prisma.generatedLook.create({
      data: {
        userId,
        jobId: job.id,
        resultUrl: resultUrls[0] || '',
        resultUrls: JSON.stringify(resultUrls),
        preset: preset || 'natural',
        metadata: JSON.stringify({ styleOptions, provider: 'replicate' }),
        status: 'completed',
      },
    });

    await job.updateProgress(100);

    // Send notification to user
    try {
      await axios.post(
        `${process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:4003'}/internal/notify`,
        {
          userId,
          type: 'AI_LOOK_READY',
          targetId: look.id,
          targetType: 'GeneratedLook',
          deepLink: `beautyapp://ai-look/result/${look.id}`,
          payload: { resultUrl: resultUrls[0], preset },
        }
      );
    } catch (notifErr) {
      console.warn('Failed to send notification:', notifErr.message);
    }

    console.log(`[Worker] Job ${job.id} completed. Look id: ${look.id}`);
    return { lookId: look.id, resultUrls };
  },
  {
    connection: getRedisConnection(),
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '3', 10),
  }
);

worker.on('completed', (job, result) => {
  console.log(`[Worker] Job ${job.id} succeeded:`, result);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job.id} failed:`, err.message);
});

worker.on('error', (err) => {
  console.error('[Worker] Worker error:', err);
});

console.log(`[Worker] ai-look worker started. Listening on queue: ${QUEUE_NAME}`);

module.exports = worker;
