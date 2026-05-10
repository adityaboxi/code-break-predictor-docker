const redisClient = require('../config/redis.js');

/**
 * Rate limiter using Redis
 */
class RateLimiter {
    constructor(options = {}) {
        this.windowMs = options.windowMs || 60 * 60 * 1000; // 1 hour default
        this.maxRequests = options.maxRequests || 100;
        this.keyPrefix = options.keyPrefix || 'ratelimit:';
    }

    /**
     * Get rate limit key for identifier
     */
    getKey(identifier) {
        const hour = Math.floor(Date.now() / this.windowMs);
        return `${this.keyPrefix}${identifier}:${hour}`;
    }

    /**
     * Check if request is allowed
     */
    async check(identifier) {
        const key = this.getKey(identifier);
        const current = await redisClient.get(key);
        const count = current ? parseInt(current) : 0;
        
        if (count >= this.maxRequests) {
            const resetTime = new Date((Math.floor(Date.now() / this.windowMs) + 1) * this.windowMs);
            return {
                allowed: false,
                remaining: 0,
                resetTime
            };
        }
        
        await redisClient.incr(key);
        await redisClient.expire(key, Math.ceil(this.windowMs / 1000));
        
        return {
            allowed: true,
            remaining: this.maxRequests - count - 1,
            resetTime: new Date((Math.floor(Date.now() / this.windowMs) + 1) * this.windowMs)
        };
    }

    /**
     * Get rate limit status
     */
    async getStatus(identifier) {
        const key = this.getKey(identifier);
        const current = await redisClient.get(key);
        const count = current ? parseInt(current) : 0;
        
        return {
            remaining: Math.max(0, this.maxRequests - count),
            limit: this.maxRequests,
            resetTime: new Date((Math.floor(Date.now() / this.windowMs) + 1) * this.windowMs)
        };
    }

    /**
     * Reset rate limit for identifier
     */
    async reset(identifier) {
        const key = this.getKey(identifier);
        await redisClient.del(key);
    }
}

module.exports = RateLimiter;