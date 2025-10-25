const router = require('express').Router();
const { authLimiter } = require('../middleware/rateLimiters');
const authMiddleware = require('../middleware/authMiddleware');
const { register, login, logout, status } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', authLimiter, register);

// POST /api/auth/login
router.post('/login', authLimiter, login);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/status (protected)
router.get('/status', authMiddleware, status);

module.exports = router;
