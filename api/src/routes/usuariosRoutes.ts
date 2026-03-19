import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';

const router = Router();
const controller = new UsuarioController();

router.post('/usuarios', (req, res) => controller.create(req, res));
router.get('/usuarios', (req, res) => controller.getAll(req, res));
router.put('/usuarios/:id/rol', (req, res) => controller.updateRol(req, res));
router.patch('/usuarios/:id/estado', (req, res) => controller.updateEstado(req, res));
router.delete('/usuarios/:id', (req, res) => controller.delete(req, res));

export default router;
