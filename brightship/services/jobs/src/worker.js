require('dotenv').config();

const express = require('express');
const { Worker } = require('bullmq');
const { createClient } = require('redis');

const app = express();

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
};

const worker = new Worker(
  'shipment-processing',
  async (job) => {
    console.log('=================================');
    console.log('Processing shipment job');
    console.log('Job ID:', job.id);
    console.log('Job data:', job.data);
    console.log('=================================');

    // Business logic will go here later.
    // For now, we are only testing the queue/worker connection.

    return {
      success: true,
      jobId: job.id,
    };
  },
  { connection }
);

// ─── REDIS HEALTH CLIENT ─────────────────────────────────────────────────────

const redisClient = createClient({
  socket: {
    host: connection.host,
    port: connection.port,
  },
});

redisClient.on('error', (err) => {
  console.error('Health Redis error:', err.message);
});

// ─── WORKER HEALTH ───────────────────────────────────────────────────────────

let workerReady = false;

worker.on('ready', () => {
  workerReady = true;
  console.log('Shipment processing worker connected to Redis');
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

worker.on('error', (err) => {
  console.error('Worker error:', err.message);
});

// ─── HEALTH ENDPOINT ──────────────────────────────────────────────────────────

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
    service: 'jobs',
    version: process.env.APP_VERSION || '1.0.0',
  });
});

// ─── SERVER ───────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await redisClient.connect();

    console.log('Health Redis client connected');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Jobs health server running on port ${PORT}`);
      console.log(`Redis: ${connection.host}:${connection.port}`);
    });
  } catch (err) {
    console.error(
      'Failed to start Jobs health server:',
      err.message
    );

    process.exit(1);
  }
}

// ─── SHUTDOWN ─────────────────────────────────────────────────────────────────

async function shutdown(signal) {
  console.log(
    `${signal} received. Shutting down shipment processing worker...`
  );

  await worker.close();

  if (redisClient.isOpen) {
    await redisClient.quit();
  }

  console.log('Shipment processing worker shut down successfully');

  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

console.log('Shipment processing worker started');
console.log(`Redis: ${connection.host}:${connection.port}`);

startServer();

