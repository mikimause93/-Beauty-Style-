require('dotenv').config();
const { Worker } = require('bullmq');
const { PrismaClient } = require('@prisma/client');
const aiClient = require('./lib/aiClient');
const S3 = require('./lib/s3');

const prisma = new PrismaClient();
const redisConn = {
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379')
};

const worker = new Worker(
  'ai-style',
  async job => {
    const { lookId, originalUrl, preset, params, provider } = job.data;
    console.log('Worker processing job', job.id, '| lookId:', lookId, '| provider:', provider);
    const images = await aiClient.generateImage({ imageUrl: originalUrl, preset, params, provider });
    const uploaded = [];
    for (let i = 0; i < images.length; i++) {
      const key = `ai-looks/${lookId}-${Date.now()}-${i}.jpg`;
      const url = await S3.uploadBuffer(images[i], key);
      uploaded.push(url);
    }
    await prisma.generatedLook.update({
      where: { id: lookId },
      data: { resultUrls: uploaded, provider }
    });
    return { uploaded };
  },
  { connection: redisConn }
);

worker.on('completed', job => console.log('Job completed:', job.id));
worker.on('failed', (job, err) => console.error('Job failed:', job.id, err.message));
