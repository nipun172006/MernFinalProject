require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const loanRoutes = require('./routes/loanRoutes');
const onboardingRoutes = require('./routes/onboardingRoutes');
const University = require('./models/University');

const app = express();

const { generalLimiter, authLimiter } = require('./middleware/rateLimiters');

// CORS configuration (allow common local origins plus env override)
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const allowedOrigins = [CLIENT_ORIGIN, 'http://localhost:3000', 'http://localhost:3001'];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
// Apply a general limiter across API
app.use('/api', generalLimiter);

// Track DB status for health reporting
let lastDbError = null;

// Health check (includes DB status)
app.get('/api/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting', 'unauthorized'];
  const dbState = states[mongoose.connection.readyState] || 'unknown';
  res.json({ status: 'ok', db: dbState, error: lastDbError ? String(lastDbError?.message || lastDbError) : null });
});

// Routes
// Auth has stricter limiter
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/onboarding', onboardingRoutes);

// Public list of universities (name, domain)
app.get('/api/universities', async (req, res) => {
  try {
    const list = await University.find({}, 'name domain createdAt').sort({ createdAt: -1 }).lean();
    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Current user's university settings
app.get('/api/university/settings', require('./middleware/authMiddleware'), async (req, res) => {
  try {
    const uni = await University.findById(req.user.universityRef, 'loanDaysDefault finePerDay name domain').lean();
    if (!uni) return res.status(404).json({ message: 'University not found' });
    return res.json(uni);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5002;

// Improve diagnostics & resilience: keep server up and retry DB connection
let serverStarted = false;

function startHttpServer() {
  if (serverStarted) return;
  app.listen(PORT, () => {
    serverStarted = true;
    console.log(`Server running on port ${PORT}`);
  });
}

async function connectWithRetry(delayMs = 5000) {
  if (!process.env.MONGO_URI) {
    console.warn('MONGO_URI not set. Set it in .env to connect to MongoDB.');
    startHttpServer();
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB || undefined,
      serverSelectionTimeoutMS: 10000,
    });
    lastDbError = null;
    console.log('Connected to MongoDB');
  } catch (err) {
    lastDbError = err;
    console.error('\nMongoDB connection failed:', err?.message || err);
    console.error('Tip: Ensure your current IP is allowed in MongoDB Atlas Network Access.');
    console.error('Open: https://www.mongodb.com/docs/atlas/security-whitelist/');
    console.error('You can temporarily allow 0.0.0.0/0 or click "Add Current IP". Retrying in', delayMs/1000, 'seconds...');
    setTimeout(() => connectWithRetry(delayMs), delayMs);
  } finally {
    startHttpServer();
  }
}

// Clean shutdown
process.on('SIGINT', async () => {
  try { await mongoose.disconnect(); } catch {}
  process.exit(0);
});
process.on('SIGTERM', async () => {
  try { await mongoose.disconnect(); } catch {}
  process.exit(0);
});

connectWithRetry();
