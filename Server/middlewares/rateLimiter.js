import rateLimit from 'express-rate-limit';

let authRateLimiter;

if (process.env.NODE_ENV === 'test') {
  authRateLimiter = (req, res, next) => next();
} else {
  authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        message: 'Too many requests. Please try again after 15 minutes.',
        code: 'RATE_LIMIT_EXCEEDED',
      },
    },
  });
}

export default authRateLimiter;
