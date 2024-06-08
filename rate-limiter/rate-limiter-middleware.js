// ratelimiter.js

const rateLimit = require("express-rate-limit");

/**
 * Creates a rate limiter middleware with configurable options.
 *
 * @param {object} options - Configuration options for the rate limiter.
 * @param {number} [options.windowMs=15 * 60 * 1000] - Time window in milliseconds. Default: 15 minutes.
 * @param {number} [options.max=100] - Maximum number of requests per windowMs. Default: 100.
 * @param {string} [options.message="Too many requests from this IP, please try again later."] - Response message when limit is exceeded.
 * @param {string} [options.keyPrefix="default"] - Prefix for the Redis key (if using Redis store).
 * @param {string} [options.keyGenerator] - Custom function to generate unique identifiers for rate limiting.
 * @param {boolean} [options.skipFailedRequests=false] - When true, failed requests won't count towards the limit.
 * @param {boolean} [options.skipSuccessfulRequests=false] - When true, successful requests won't count towards the limit.
 *
 * @returns {Function} Express middleware function.
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = "Too many requests from this IP, please try again later.",
    keyPrefix = "default",
    keyGenerator,
    skipFailedRequests = false,
    skipSuccessfulRequests = false,
  } = options;

  return rateLimit({
    windowMs,
    max,
    message,
    keyPrefix,
    keyGenerator,
    skipFailedRequests,
    skipSuccessfulRequests,
    handler: (req, res, next) => {
      res.status(429).json({ error: message });
    },
  });
};

module.exports = {
  defaultLimiter: createRateLimiter(),
  strictLimiter: createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5,
    message: "Rate limit exceeded. Please wait before trying again.",
  }),
  authLimiter: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: "Too many authentication attempts. Please try again later.",
  }),
};
