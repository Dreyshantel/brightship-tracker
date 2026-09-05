require('dotenv').config();

const { Queue } = require('bullmq');

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
};

const queue = new Queue('shipment-processing', {
  connection,
});

async function addTestJob() {
  const job = await queue.add('process-shipment', {
    shipmentId: 'test-shipment-001',
    status: 'PENDING',
  });

  console.log(`Test job added successfully`);
  console.log(`Job ID: ${job.id}`);

  await queue.close();
}

addTestJob().catch(async (err) => {
  console.error('Failed to add test job:', err);
  await queue.close();
  process.exit(1);
});
