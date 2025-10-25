const rateLimit = require('express-rate-limit')

// General API limiter: generous, prevents bursts from a single IP
const generalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 300, // 300 requests per 5 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
})

// Auth limiter: stricter to defend against credential stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window per IP
  message: { message: 'Too many auth attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Admin mutation limiter: protect create/update/delete
const adminMutationsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  message: { message: 'Too many changes in a short time. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// CSV import limiter: very strict
const csvImportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 6, // 6 imports per hour per IP
  message: { message: 'Too many imports. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = { generalLimiter, authLimiter, adminMutationsLimiter, csvImportLimiter }
