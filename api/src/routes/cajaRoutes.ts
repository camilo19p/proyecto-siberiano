import { Router } from 'express';
import { CierreCajaController } from '../controllers/CierreCajaController';

const router = Router();
const controller = new CierreCajaController();

router.post('/cajas', (req, res) => controller.create(req, res));
router.get('/cajas', (req, res) => controller.getAll(req, res));
router.get('/cajas/:id', (req, res) => controller.getById(req, res));
router.post('/cajas/:id/movimientos', (req, res) => controller.registrarMovimiento(req, res));
router.patch('/cajas/:id/close', (req, res) => controller.cerrarCaja(req, res));

export default router;
