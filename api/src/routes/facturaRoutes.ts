import { Router } from 'express';
import { FacturaController } from '../controllers/FacturaController';

const router = Router();
const controller = new FacturaController();

router.post('/facturas', (req, res) => controller.create(req, res));
router.get('/facturas', (req, res) => controller.getAll(req, res));
router.get('/facturas/:id', (req, res) => controller.getById(req, res));
router.put('/facturas/:id', (req, res) => controller.update(req, res));
router.delete('/facturas/:id', (req, res) => controller.delete(req, res));

export default router;
