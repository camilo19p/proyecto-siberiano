import { Router } from 'express';
import { AuthService } from '../services/AuthService';
import { loginSchema, registerSchema } from '../validators/authValidators';
import { ZodError } from 'zod';

const router = Router();

router.post('/auth/login', async (req, res, next) => {
  try {
    // Validar con Zod
    const { username, password } = loginSchema.parse(req.body);
    
    const result = await AuthService.login(username, password);
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.issues 
      });
    }
    next(error);
  }
});

router.post('/auth/register', async (req, res, next) => {
  try {
    // Validar con Zod
    const data = registerSchema.parse(req.body);
    
    const user = await AuthService.register(data);
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.issues 
      });
    }
    next(error);
  }
});

export default router;
