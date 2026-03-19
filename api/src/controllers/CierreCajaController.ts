import { Request, Response } from 'express';
import { CierreCajaService } from '../services/CierreCajaService';

export class CierreCajaController {
  private service = new CierreCajaService();

  async create(req: Request, res: Response) {
    try {
      const cierre = await this.service.create(req.body);
      res.status(201).json(cierre);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const cierres = await this.service.getAll(req.query.vendedor_id as string);
      res.json(cierres);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const cierre = await this.service.getById(req.params.id);
      res.json(cierre);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  }

  async registrarMovimiento(req: Request, res: Response) {
    try {
      const movimiento = await this.service.registrarMovimiento(req.params.id, req.body);
      res.status(201).json(movimiento);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async cerrarCaja(req: Request, res: Response) {
    try {
      const { monto_final } = req.body;
      const cierre = await this.service.cerrarCaja(req.params.id, monto_final);
      res.json(cierre);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}
