require('dotenv').config({ path: '../../.env' });

const express = require('express');
const { Worker } = require('bullmq');
const { createClient } = require('redis');
const { sendNotification } = require('./sender');

const app = express();

const connection = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
};

const worker = new Worker(
  'shipment-notifications',
  async (job) => {
    console.log('=================================');
    console.log('Processing notification job');
    console.log('Job ID:', job.id);
    console.log('Job data:', job.data);
    console.log('=================================');

    const result = await sendNotification(job.data);

    console.log('Notification sent successfully');
    console.log('Provider:', result.provider);

    return {
      success: true,
      provider: result.provider,
      jobId: job.id,
    };
  },
  {
    connection,
  }
);

// Dedicated Redis client for health checks
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

redisClient.on('error', (err) => {
  console.error('Health Redis error:', err.message);
});

let workerReady = false;

worker.on('ready', () => {
  workerReady = true;
  console.log('Notification worker connected to Redis');
});

worker.on('failed', (job, err) => {
  console.error(
    `Notification job ${job?.id} failed:`,
    err.message
  );

  console.error(
    'Attempts made:',
    job?.attemptsMade
  );
});

worker.on('error', (err) => {
  console.error('Worker error:', err.message);
});

// Health endpoint
app.get('/health', async (req, res) => {
  let redis = 'ok';

  try {
    await redisClient.ping();
  } catch (err) {
    redis = 'failed';
    console.error('Redis health check failed:', err.message);
  }

  const healthy = workerReady && redis === 'ok';

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'unhealthy',
    worker: workerReady ? 'ok' : 'failed',
    redis,
    service: 'notify',
    version: process.env.APP_VERSION || '1.0.0',
  });
});

const PORT = process.env.PORT || 3002;

async function startServer() {
  try {
    // Connect dedicated Redis health client
    await redisClient.connect();

    console.log('Health Redis client connected');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Notify health server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(
      'Failed to start Notify service:',
      err.message
    );

    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(
    `${signal} received. Shutting down notification worker...`
  );

  await worker.close();

  if (redisClient.isOpen) {
    await redisClient.quit();
  }

  console.log('Notification worker shut down successfully');

  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();
