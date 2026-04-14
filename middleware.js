const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const Joi = require('joi');

// Security headers
const helmetMiddleware = helmet();

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for game actions
const gameActionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 game actions per minute
  message: {
    error: 'Too many game actions, please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for Socket.IO connections
const socketLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 socket connections per minute
  message: {
    error: 'Too many connection attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation schemas
const nicknameSchema = Joi.string().min(2).max(20).pattern(/^[a-zA-Z0-9_]+$/).required();
const roomIdSchema = Joi.string().pattern(/^room-\d+-\w+$/).required();
const gameTypeSchema = Joi.string().valid('spy', 'codenames', 'imaginarium', 'chess').required();

// Input validation middleware
const validateInput = (req, res, next) => {
  // Basic input sanitization
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove potentially dangerous characters
        obj[key] = obj[key].replace(/[<>\"'&]/g, '');
        // Limit length
        if (obj[key].length > 100) {
          obj[key] = obj[key].substring(0, 100);
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);

  next();
};

// Validation functions
const validateNickname = (nickname) => {
  const { error } = nicknameSchema.validate(nickname);
  return error ? error.details[0].message : null;
};

const validateRoomId = (roomId) => {
  const { error } = roomIdSchema.validate(roomId);
  return error ? error.details[0].message : null;
};

const validateGameType = (gameType) => {
  const { error } = gameTypeSchema.validate(gameType);
  return error ? error.details[0].message : null;
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.type === 'rate_limit') {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: err.resetTime - Date.now()
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

// Health check middleware
const healthCheck = async (req, res) => {
  const redisClient = require('./redis');

  try {
    // Check Redis connection
    await redisClient.ping();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  securityHeaders: helmetMiddleware,
  apiLimiter,
  gameActionLimiter,
  socketLimiter,
  validateInput,
  validateNickname,
  validateRoomId,
  validateGameType,
  errorHandler,
  healthCheck
};