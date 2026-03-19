import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

export const validateBody = (schema: ZodTypeAny) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = (await schema.parseAsync(req.body)) as any;
    return next();
  } catch (err) {
    return next(err);
  }
};

export const validateParams = (schema: ZodTypeAny) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.params = (await schema.parseAsync(req.params)) as any;
    return next();
  } catch (err) {
    return next(err);
  }
};

export const validateQuery = (schema: ZodTypeAny) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    // parseAsync will coerce/validate query strings if schema expects numbers/booleans
    req.query = (await schema.parseAsync(req.query)) as any;
    return next();
  } catch (err) {
    return next(err);
  }
};
