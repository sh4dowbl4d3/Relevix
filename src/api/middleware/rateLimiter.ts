import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

export class RateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const key = req.ip || req.socket.remoteAddress || 'unknown';
      const now = Date.now();

      if (!this.store[key] || now > this.store[key].resetTime) {
        this.store[key] = {
          count: 1,
          resetTime: now + this.windowMs,
        };
        next();
        return;
      }

      this.store[key].count++;

      if (this.store[key].count > this.maxRequests) {
        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests',
            retryAfter: Math.ceil((this.store[key].resetTime - now) / 1000),
          },
        });
        return;
      }

      next();
    };
  }
}
