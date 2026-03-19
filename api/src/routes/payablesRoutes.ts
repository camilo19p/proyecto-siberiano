import { Router } from 'express';
import { CuentasPorPagarController } from '../controllers/CuentasPorPagarController';

const router = Router();
const controller = new CuentasPorPagarController();

router.post('/payables', (req, res) => controller.create(req, res));
router.get('/payables', (req, res) => controller.getAll(req, res));
router.get('/payables/:id', (req, res) => controller.getById(req, res));
router.put('/payables/:id', (req, res) => controller.update(req, res));
router.post('/payables/:id/payment', (req, res) => controller.registrarPago(req, res));
router.get('/payables/:id/history', (req, res) => controller.obtenerHistorialPagos(req, res));
router.delete('/payables/:id', (req, res) => controller.delete(req, res));

export default router;
