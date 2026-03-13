const { Queue, Worker, QueueEvents } = require('bullmq');
const { getRedisConnection } = require('./redisClient');

const QUEUE_NAME = 'ai-look-generation';

let queue = null;

function getQueue() {
  if (!queue) {
    queue = new Queue(QUEUE_NAME, { connection: getRedisConnection() });
  }
  return queue;
}

/**
 * Enqueue a generation job and return job id.
 */
async function enqueueGeneration(data) {
  const q = getQueue();
  const job = await q.add('generate', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: false,
    removeOnFail: false,
  });
  return job.id;
}

/**
 * Get current job status by id.
 */
async function getJobStatus(jobId) {
  const q = getQueue();
  const job = await q.getJob(jobId);
  if (!job) return null;

  const state = await job.getState();
  return {
    jobId: job.id,
    state,
    progress: job.progress,
    data: job.data,
    result: job.returnvalue,
    failedReason: job.failedReason,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
  };
}

module.exports = { enqueueGeneration, getJobStatus };
