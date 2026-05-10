const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 3600000,
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const analysisLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { error: 'Analysis limit reached. Please wait before starting more analyses.' },
    keyGenerator: (req) => req.user?.id || req.ip,
});

module.exports = { apiLimiter, analysisLimiter };
