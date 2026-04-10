const redis = require('redis');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

const redisUrl = REDIS_PASSWORD
  ? `redis://:${encodeURIComponent(REDIS_PASSWORD)}@${REDIS_HOST}:${REDIS_PORT}`
  : `redis://${REDIS_HOST}:${REDIS_PORT}`;

// Redis client configuration
const redisClient = redis.createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis max attempts reached');
        return new Error('Redis max attempts reached');
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

async function initRedis() {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Redis connect failed:', err);
  }
}

initRedis().catch((err) => {
  console.error('Redis initialization failed:', err);
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('ready', () => {
  console.log('Redis client ready');
});

redisClient.on('end', () => {
  console.log('Redis connection ended');
});

// Graceful shutdown
process.on('SIGINT', () => {
  redisClient.quit();
});

process.on('SIGTERM', () => {
  redisClient.quit();
});

module.exports = redisClient;