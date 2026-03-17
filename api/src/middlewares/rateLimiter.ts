import { Request, Response, NextFunction } from 'express';

// Optional express-rate-limit wrapper. If the package isn't installed, this middleware is a no-op.
export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rateLimit = require('express-rate-limit');
    const limiter = rateLimit.default
      ? rateLimit.default({ windowMs: 60 * 1000, max: 100 })
      : rateLimit({ windowMs: 60 * 1000, max: 100 });
    return limiter(req, res, next);
  } catch (e) {
    return next();
  }
}
