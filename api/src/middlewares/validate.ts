import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateBody = (schema: ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = await schema.parseAsync(req.body);
    return next();
  } catch (err) {
    return next(err);
  }
};

export const validateParams = (schema: ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.params = await schema.parseAsync(req.params);
    return next();
  } catch (err) {
    return next(err);
  }
};

export const validateQuery = (schema: ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    // parseAsync will coerce/validate query strings if schema expects numbers/booleans
    req.query = await schema.parseAsync(req.query as any);
    return next();
  } catch (err) {
    return next(err);
  }
};
