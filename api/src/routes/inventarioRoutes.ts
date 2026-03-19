import { Router } from 'express';
import { InventarioController } from '../controllers/InventarioController';

const router = Router();
const inventarioController = new InventarioController();

// Rutas de inventario
router.get('/inventario/prepare', (req, res, next) => inventarioController.prepareInventario(req, res, next));
router.get('/inventario', (req, res, next) => inventarioController.getAllInventarios(req, res, next));
router.post('/inventario', (req, res, next) => inventarioController.createInventario(req, res, next));
router.delete('/inventario/:id', (req, res, next) => inventarioController.deleteInventario(req, res, next));

export default router;
