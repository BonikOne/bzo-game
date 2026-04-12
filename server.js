const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const cluster = require('cluster');
const os = require('os');

const redisClient = require('./redis');
const { query } = require('./database');
const roomManager = require('./roomManager');
const { securityHeaders, apiLimiter, gameActionLimiter, socketLimiter, validateInput, errorHandler, healthCheck } = require('./middleware');
const logger = require('./logger');
const { setupGameHandlers } = require('./gameHandlers');

const app = express();
const server = http.createServer(app);

// Create Socket.IO server with Redis adapter for clustering
let io;
if (cluster.isMaster && process.env.NUM_WORKERS > 1) {
  // Master process doesn't need Socket.IO
  io = null;
  console.log('Master process - no Socket.IO needed');
} else {
  logger.info('Initializing Socket.IO server...');
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
    // Increase limits for high concurrency
    maxHttpBufferSize: 1e8, // 100MB
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000, // 25 seconds
    connectTimeout: 45000, // 45 seconds
    maxConnections: 10000 // Maximum connections per server instance
  });
  logger.info('Socket.IO server initialized');

  // Use Redis adapter for cross-process communication if Redis is available
  setupSocketAdapter();
}

async function setupSocketAdapter() {
  if (!process.env.REDIS_HOST) {
    console.log('No Redis host configured, using in-memory adapter');
    return;
  }

  try {
    const pubClient = redisClient.duplicate();
    const subClient = redisClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    console.log('Redis adapter enabled for Socket.IO');
  } catch (error) {
    console.log('Redis adapter not available, using in-memory adapter', error);
  }
}

const PORT = process.env.PORT || 3000;
const NUM_WORKERS = process.env.NUM_WORKERS || 1;

// Clustering for multi-core support
if (cluster.isMaster && NUM_WORKERS > 1) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < NUM_WORKERS; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
    console.log('Starting a new worker');
    cluster.fork();
  });

  // Cleanup old rooms every 30 minutes
  setInterval(() => {
    roomManager.cleanupOldRooms();
  }, 30 * 60 * 1000);

} else {
  // Worker process - start the server
  startServer();
}

async function startServer() {
  try {
    // Try to connect to Redis, but don't fail if it's not available in development
    if (process.env.REDIS_HOST) {
      await new Promise((resolve, reject) => {
        redisClient.on('ready', resolve);
        redisClient.on('error', reject);
        setTimeout(() => reject(new Error('Redis connection timeout')), 5000);
      });
      console.log(`Worker ${process.pid} connected to Redis`);
      await roomManager.clearAllRooms();
    } else {
      console.log(`Worker ${process.pid} started without Redis (development mode)`);
      roomManager.clearAllRooms();
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error('Failed to connect to Redis in production:', error);
      process.exit(1);
    } else {
      console.log(`Worker ${process.pid} started without Redis (development mode)`);
      roomManager.clearAllRooms();
    }
  }
}

const locations = [
  'Космодром', 'Больница', 'Школа', 'Музей', 'Отель', 'Ресторан', 'Станция',
  'Тюрьма', 'Театр', 'Парк', 'Пляж', 'Аэропорт', 'Вокзал', 'Торговый центр',
  'Суд', 'Библиотека', 'Зоопарк', 'Офис', 'Квартира', 'Казино', 'Церковь',
  'Подводная лодка', 'Самолет', 'Поезд', 'Корабль', 'Арена', 'Кабинет', 'Верфь',
  'Кинотеатр', 'Станция метро', 'Пайплайн', 'Фабрика', 'Скайпортик'
];

// Serve static files with caching for assets, but avoid stale CSS/JS when files change
app.use(express.static('public', {
  maxAge: '1y', // Long cache lifetime for fingerprinted assets
  setHeaders: (res, path) => {
    if (path.endsWith('.html') || path.endsWith('.css') || path.endsWith('.js') || path.endsWith('.json') || path.endsWith('.svg')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Middleware
app.use(securityHeaders);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(validateInput);

// Rate limiting
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/health', healthCheck);
app.get('/api/health', healthCheck);

// Auth routes
const { register, login, authenticateToken } = require('./auth');
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nickname, password } = req.body;
    const user = await register(nickname, password);
    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { nickname, password } = req.body;
    const result = await login(nickname, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Protected route example
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Error handling
app.use(errorHandler);

// Setup game event handlers
if (io) {
  console.log('Setting up game handlers...');
  setupGameHandlers(io);
  console.log('Game handlers setup complete');
} else {
  console.log('Socket.IO not initialized, skipping game handlers setup');
}

server.listen(PORT, () => {
  logger.info(`Server started on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});