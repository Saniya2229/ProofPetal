const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for certificate verification endpoint
 * Limits: 10 requests per minute per IP
 * Purpose: Prevent brute-force attempts to guess certificate IDs
 */
const verificationLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 10, // Max 10 requests per window per IP
    message: {
        success: false,
        message: 'Too many verification attempts. Please wait a moment before trying again.',
        retryAfter: 60
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    // Skip rate limiting for authenticated admin users (optional)
    skip: (req) => {
        // If we want to allow admins unlimited access, uncomment below:
        // return req.user && req.user.role === 'admin';
        return false;
    },
    handler: (req, res, next, options) => {
        res.status(429).json(options.message);
    }
});

/**
 * General API rate limiter (more lenient)
 * Can be used for other public endpoints
 */
const generalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    verificationLimiter,
    generalApiLimiter
};
