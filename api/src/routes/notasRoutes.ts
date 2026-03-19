import { Router } from 'express';
import { NotaController } from '../controllers/NotaController';

const router = Router();
const notaController = new NotaController();

router.get('/', notaController.getNotas.bind(notaController));
router.get('/fecha/:fecha', notaController.getNotasByFecha.bind(notaController));
router.post('/', notaController.createNota.bind(notaController));
router.delete('/:id', notaController.deleteNota.bind(notaController));

export default router;
