import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extender tipo de Request para incluir usuario
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'siberiano-secret-key-2024';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

/**
 * Middleware para proteger rutas por rol
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}. Tu rol: ${req.user.role}` 
      });
    }

    next();
  };
};

/**
 * Middleware para logging de acceso
 */
export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Usuario: ${req.user?.username || 'Anónimo'}`);
  next();
};
