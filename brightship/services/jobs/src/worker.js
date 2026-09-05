require('dotenv').config();

const { Worker } = require('bullmq');

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
  {
    connection,
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

worker.on('error', (err) => {
  console.error('Worker error:', err.message);
});

console.log('Shipment processing worker started');
console.log(
  `Redis: ${connection.host}:${connection.port}`
);

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down worker...`);

  await worker.close();

  console.log('Worker shut down successfully');
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
