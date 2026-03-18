import { Router } from 'express';
import { GananciasController } from '../controllers/GananciasController';

const router = Router();
const gananciasController = new GananciasController();

// Rutas de ganancias
router.get('/ganancias', (req, res, next) => gananciasController.getGanancias(req, res, next));

export default router;
