require('dotenv').config();
const { Worker } = require('bullmq');
const aiClient = require('./lib/aiClient');
const S3 = require('./lib/s3');
const db = require('./lib/db');

const redisConn = {
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379', 10)
};

const worker = new Worker(
  'ai-style',
  async (job) => {
    const { lookId, originalUrl, preset, params, provider } = job.data;
    console.log(`[worker] Processing job ${job.id} | lookId=${lookId} | provider=${provider}`);

    try {
      const images = await aiClient.generateImage({ imageUrl: originalUrl, preset, params, provider });

      const uploaded = [];
      for (let i = 0; i < images.length; i++) {
        const key = `ai-looks/${lookId}-${Date.now()}-${i}.jpg`;
        const url = await S3.uploadBuffer(images[i], key, 'image/jpeg');
        uploaded.push(url);
      }

      db.updateLook(lookId, { resultUrls: uploaded, status: 'done', provider });

      console.log(`[worker] Job ${job.id} completed. Uploaded ${uploaded.length} image(s).`);
      return { uploaded };
    } catch (err) {
      console.error(`[worker] Job ${job.id} failed:`, err.message);
      db.updateLook(lookId, { status: 'failed' });
      throw err;
    }
  },
  { connection: redisConn }
);

worker.on('completed', (job) => {
  console.log(`[worker] Job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.error(`[worker] Job failed: ${job ? job.id : 'unknown'} -`, err.message);
});

console.log('[worker] AI Style worker started, waiting for jobs...');

module.exports = worker;
