const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// ─── DATABASE ─────────────────────────────────────────────────────────────────
// TODO: Kofi said move these to env vars but never got round to it
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'brightship',
  user:     process.env.DB_USER     || 'admin',
  password: process.env.DB_PASSWORD || 'brightship2024',
});

// ─── HEALTH ───────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:  'ok',
    version: process.env.APP_VERSION || '1.0.0',
  });
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
      `INSERT INTO shipments (sender, recipient, origin, destination, weight_kg, status)
       VALUES ($1, $2, $3, $4, $5, 'PENDING')
       RETURNING *`,
      [sender, recipient, origin, destination, weight_kg || null]
    );
    res.status(201).json({ shipment: result.rows[0] });
  } catch (err) {
    console.error('DB error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── UPDATE SHIPMENT STATUS ───────────────────────────────────────────────────
app.patch('/shipments/:id/status', async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED'];

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
    res.json({ shipment: result.rows[0] });
  } catch (err) {
    console.error('DB error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = app;
