import { Router, Request, Response } from 'express';
import { CierreCajaController } from '../controllers/CierreCajaController';
import prisma from '../lib/prisma';

const router = Router();
const controller = new CierreCajaController();

// Endpoint para obtener depósitos del día por método de pago
router.get('/depositos-dia', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Obtener todas las ventas del día
    const sales = await prisma.sale.findMany({
      where: {
        fecha: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Agrupar por método de pago
    const depositos = {
      efectivo: 0,
      nequi: 0,
      transferencia: 0,
      fiado: 0
    };

    sales.forEach(sale => {
      if (sale.metodoPago === 'cash' || sale.metodoPago === 'EFECTIVO') {
        depositos.efectivo += sale.total;
      } else if (sale.metodoPago === 'nequi' || sale.metodoPago === 'NEQUI') {
        depositos.nequi += sale.total;
      } else if (sale.metodoPago === 'transfer' || sale.metodoPago === 'TRANSFERENCIA') {
        depositos.transferencia += sale.total;
      } else if (sale.metodoPago === 'credit' || sale.metodoPago === 'FIADO') {
        depositos.fiado += sale.total;
      }
    });

    res.json(depositos);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/cajas', (req, res) => controller.create(req, res));
router.get('/cajas', (req, res) => controller.getAll(req, res));
router.get('/cajas/:id', (req, res) => controller.getById(req, res));
router.post('/cajas/:id/movimientos', (req, res) => controller.registrarMovimiento(req, res));
router.patch('/cajas/:id/close', (req, res) => controller.cerrarCaja(req, res));

export default router;
