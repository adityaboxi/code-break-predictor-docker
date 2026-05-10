const Bull = require('bull');
require('dotenv').config();

const redisOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
};

const analysisQueue = new Bull('analysis-queue', {
    redis: redisOptions,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        timeout: 300000,
        removeOnComplete: 50,
        removeOnFail: 100
    }
});

const emailQueue = new Bull('email-queue', {
    redis: redisOptions,
    defaultJobOptions: {
        attempts: 2,
        backoff: 10000,
        removeOnComplete: 100
    }
});

analysisQueue.on('completed', (job, result) => {
    console.log(`✅ Job ${job.id} completed - Risk: ${result?.overallRisk}%`);
});

analysisQueue.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} failed: ${err.message}`);
});

analysisQueue.on('error', (err) => {
    console.error('Queue error:', err.message);
});

console.log('📊 Bull queues initialized');

module.exports = { analysisQueue, emailQueue };
