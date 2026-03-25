import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from './logger';

// Tipos para usuario autenticado
export interface AuthUser {
  id: number;
  username: string;
  role: string;
}

// Extender tipo de Request para incluir usuario
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'siberiano-secret-key-2024';

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET no configurado en variables de entorno');
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado o formato invalido' });
  }

  const token = authHeader.substring(7);

  // Dev shortcut: si en desarrollo se usa el token de fallback 'ok', permitir acceso y asignar rol ADMIN
  if (token === 'ok' && process.env.NODE_ENV !== 'production') {
    logger.info?.('Dev auth bypass: token "ok" usado, asignando usuario ADMIN local');
    req.user = { id: 0, username: 'local-admin', role: 'ADMIN' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado. Por favor inicia sesion nuevamente.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token invalido' });
    }
    return res.status(401).json({ error: 'Error de autenticacion' });
  }
};

/**
 * Middleware para proteger rutas por rol
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!roles || roles.length === 0) {
      return res.status(500).json({ error: 'Configuracion de middlewares incorrecta' });
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
  logger.info?.(`[${new Date().toISOString()}] ${req.method} ${req.path} - Usuario: ${req.user?.username || 'Anonimo'}`);
  next();
};
