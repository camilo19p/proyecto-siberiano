// Small logger wrapper with optional pino fallback to console
import { Request, Response, NextFunction } from 'express';

let logger: any = console;
try {
  // require to avoid type errors if pino isn't installed yet
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pino = require('pino');
  logger = pino({ level: process.env.LOG_LEVEL || 'info' });
} catch (e) {
  // fallback to console
  logger = console;
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  logger.info?.(`${req.method} ${req.originalUrl}`);
  next();
}

export default logger;
