require('dotenv').config({ path: '../../.env' });

const { app, redisClient } = require('./app');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await redisClient.connect();

    console.log('Connected to Redis');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`BrightShip Tracker running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
