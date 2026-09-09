require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const { createClient } = require('redis');
const { Queue } = require('bullmq');

const app = express();
app.use(express.json());

// ─── DATABASE ─────────────────────────────────────────────────────────────────

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  ssl: process.env.DB_SSL === 'true'
  ? { rejectUnauthorized: false }
  : false,
});

// ─── REDIS ────────────────────────────────────────────────────────────────────

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err.message);
});

const queue = new Queue('shipment-processing', {
  connection: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

const notificationQueue = new Queue('shipment-notifications', {
  connection: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

// ─── HEALTH ───────────────────────────────────────────────────────────────────

app.get('/health', async (req, res) => {
  let database = 'ok';
  let redis = 'ok';

  try {
    await pool.query('SELECT 1');
  } catch (err) {
    database = 'failed';
    console.error('Database health check failed:', err.message);
  }

  try {
    await redisClient.ping();
  } catch (err) {
    redis = 'failed';
    console.error('Redis health check failed:', err.message);
  }

  const healthy = database === 'ok' && redis === 'ok';

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'unhealthy',
    database,
    redis,
    version: process.env.APP_VERSION || '1.0.0',
  });
});


// ─── AGGREGATE HEALTH ─────────────────────────────────────────────────────────

const HEALTH_CHECK_TIMEOUT_MS = Number(process.env.HEALTH_CHECK_TIMEOUT_MS) || 3000;
const HEALTH_CACHE_TTL_MS = Number(process.env.HEALTH_CACHE_TTL_MS) || 3000;

let healthCache = null; // { expiresAt, payload, statusCode }

// Maps internal error details to a safe, generic reason for the response body.
// Full error is logged server-side; only the category is exposed externally.
function classifyError(err) {
  if (err.name === 'AbortError') return 'timeout';
  if (err.code === 'ECONNREFUSED') return 'unreachable';
  if (err.code === 'ENOTFOUND') return 'unreachable';
  return 'unreachable';
}

async function checkServiceHealth(name, url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const body = await response.json().catch(() => ({}));

    if (response.ok && body.status === 'ok') {
      return { name, status: 'ok' };
    }

    console.error(`Health check failed for "${name}": responded with status "${body.status || response.status}"`);

    return {
      name,
      status: 'failed',
      error: 'unhealthy',
    };
  } catch (err) {
    console.error(`Health check failed for "${name}":`, err.message);

    return {
      name,
      status: 'failed',
      error: classifyError(err),
    };
  } finally {
    clearTimeout(timeout);
  }
}

app.get('/health/all', async (req, res) => {
  const now = Date.now();

  if (healthCache && healthCache.expiresAt > now) {
    return res.status(healthCache.statusCode).json(healthCache.payload);
  }

  const targets = [
    { name: 'api', url: 'http://api:3000/health' },
    { name: 'jobs', url: 'http://jobs:3001/health' },
    { name: 'notify', url: 'http://notify:3002/health' },
  ];

  const results = await Promise.all(
    targets.map((t) => checkServiceHealth(t.name, t.url))
  );

  const services = {};
  let allHealthy = true;

  for (const result of results) {
    if (result.status !== 'ok') {
      allHealthy = false;
      services[result.name] = { status: result.status, error: result.error };
    } else {
      services[result.name] = { status: result.status };
    }
  }

  const statusCode = allHealthy ? 200 : 503;
  const payload = {
    status: allHealthy ? 'ok' : 'unhealthy',
    services,
  };

  healthCache = {
    expiresAt: now + HEALTH_CACHE_TTL_MS,
    payload,
    statusCode,
  };

  res.status(statusCode).json(payload);
});


// ─── LIST SHIPMENTS ───────────────────────────────────────────────────────────

app.get('/shipments', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM shipments ORDER BY created_at DESC LIMIT 100'
    );

    res.json({ shipments: result.rows });
  } catch (err) {
    console.error('DB error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET ONE SHIPMENT ─────────────────────────────────────────────────────────

app.get('/shipments/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM shipments WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    res.json({ shipment: result.rows[0] });
  } catch (err) {
    console.error('DB error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── CREATE SHIPMENT ──────────────────────────────────────────────────────────

app.post('/shipments', async (req, res) => {
  const { sender, recipient, origin, destination, weight_kg } = req.body;

  if (!sender || !recipient || !origin || !destination) {
    return res.status(400).json({
      error: 'sender, recipient, origin, and destination are required',
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO shipments (
        sender,
        recipient,
        origin,
        destination,
        weight_kg,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 'PENDING')
      RETURNING *`,
      [sender, recipient, origin, destination, weight_kg || null]
    );

    const shipment = result.rows[0];

    await queue.add('process-shipment', {
      shipmentId: shipment.id,
      status: shipment.status,
    });

    res.status(201).json({ shipment });
  } catch (err) {
    console.error('DB error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── UPDATE SHIPMENT STATUS ───────────────────────────────────────────────────

app.patch('/shipments/:id/status', async (req, res) => {
  const { status } = req.body;

  const validStatuses = [
    'PENDING',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
    'FAILED',
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    });
  }

  try {
    const result = await pool.query(
      `UPDATE shipments
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const shipment = result.rows[0];

    await notificationQueue.add(
      'shipment-status-notification',
      {
        shipmentId: shipment.id,
        recipient: 'test@example.com',
        channel: 'email',
        message: `Your shipment is now ${shipment.status}.`,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      }
    );

    res.json({ shipment });
  } catch (err) {
    console.error('DB error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = { app, redisClient };


