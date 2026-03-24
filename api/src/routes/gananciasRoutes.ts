import { Router } from 'express';
import { GananciasController } from '../controllers/GananciasController';
import { authMiddleware, requireRole } from '../middlewares/roleMiddleware';

const router = Router();
const gananciasController = new GananciasController();

// Solo admins pueden ver ganancias
router.get('/ganancias', authMiddleware, requireRole('ADMIN'), (req, res, next) => gananciasController.getGanancias(req, res, next));

export default router;
