import { Router } from 'express';
import { ProveedorController } from '../controllers/ProveedorController';

const router = Router();
const controller = new ProveedorController();

router.get('/proveedores/stats', (req, res) => controller.getStats(req, res));
router.get('/proveedores/deuda', (req, res) => controller.getAllConDeuda(req, res));
router.post('/proveedores', (req, res) => controller.create(req, res));
router.get('/proveedores', (req, res) => controller.getAll(req, res));
router.get('/proveedores/:id', (req, res) => controller.getById(req, res));
router.put('/proveedores/:id', (req, res) => controller.update(req, res));
router.patch('/proveedores/:id/estado', (req, res) => controller.updateEstado(req, res));
router.delete('/proveedores/:id', (req, res) => controller.delete(req, res));
router.post('/proveedores/:id/compras', (req, res) => controller.registrarCompra(req, res));
router.post('/proveedores/:id/pagos', (req, res) => controller.registrarPago(req, res));

export default router;