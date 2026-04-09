const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('./database');
const { validateNickname } = require('./middleware');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register user
async function register(nickname, password) {
  const validationError = validateNickname(nickname);
  if (validationError) throw new Error(validationError);

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const result = await query(
      'INSERT INTO users (nickname, hashed_password) VALUES ($1, $2) RETURNING id, nickname',
      [nickname, hashedPassword]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      throw new Error('Nickname already exists');
    }
    throw error;
  }
}

// Login user
async function login(nickname, password) {
  const result = await query('SELECT * FROM users WHERE nickname = $1', [nickname]);
  if (result.rows.length === 0) {
    throw new Error('Invalid credentials');
  }

  const user = result.rows[0];
  const isValidPassword = await bcrypt.compare(password, user.hashed_password);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign({ id: user.id, nickname: user.nickname }, JWT_SECRET, { expiresIn: '24h' });
  return { user: { id: user.id, nickname: user.nickname }, token };
}

// Verify token middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

module.exports = {
  register,
  login,
  authenticateToken
};