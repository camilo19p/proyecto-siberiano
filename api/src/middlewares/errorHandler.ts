import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error caught:', err);

  if (err instanceof ZodError) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: err.issues 
    });
  }

  // Si el error es una instancia de Error, devolver su mensaje
  if (err instanceof Error) {
    return res.status(400).json({ 
      error: err.message || 'Bad request',
      message: err.message 
    });
  }

  // Error desconocido
  console.error('Unhandled error:', err);
  return res.status(500).json({ 
    error: 'Internal server error',
    message: err?.message || 'An unexpected error occurred'
  });
}
