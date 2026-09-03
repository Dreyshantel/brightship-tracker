require('dotenv').config({ path: '../../.env' });

const { Queue } = require('bullmq');

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
};

const queue = new Queue('shipment-notifications', {
  connection,
});

async function addTestNotification() {
  const job = await queue.add(
    'send-notification',
    {
      shipmentId: 'test-shipment-001',
      recipient: 'test@example.com',
      channel: 'email',
      message: 'Your shipment is now IN_TRANSIT.',
    },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    }
  );

  console.log('Test notification job added successfully');
  console.log('Job ID:', job.id);

  await queue.close();
}

addTestNotification().catch(async (err) => {
  console.error('Failed to add test notification:', err);

  await queue.close();

  process.exit(1);
});
