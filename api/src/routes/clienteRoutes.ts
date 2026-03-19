import { Router } from 'express';
import { ClienteController } from '../controllers/ClienteController';

const router = Router();
const controller = new ClienteController();

router.post('/clientes', (req, res) => controller.create(req, res));
router.get('/clientes', (req, res) => controller.getAll(req, res));
router.get('/clientes/:id', (req, res) => controller.getById(req, res));
router.put('/clientes/:id', (req, res) => controller.update(req, res));
router.patch('/clientes/:id/estado', (req, res) => controller.updateEstado(req, res));
router.delete('/clientes/:id', (req, res) => controller.delete(req, res));

export default router;
