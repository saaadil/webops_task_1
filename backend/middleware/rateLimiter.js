const rateLimit = require('express-rate-limit');

const WINDOW_MS = 60000; // 60 seconds
const MAX_REQUESTS = 20;  // max requests per IP per window

const rateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,
  statusCode: 429,
  message: {
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = rateLimiter;
