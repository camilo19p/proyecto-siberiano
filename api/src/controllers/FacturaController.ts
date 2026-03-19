import { Request, Response } from 'express';
import { FacturaService } from '../services/FacturaService';

export class FacturaController {
  private service = new FacturaService();

  async create(req: Request, res: Response) {
    try {
      const factura = await this.service.create(req.body);
      res.status(201).json(factura);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const facturas = await this.service.getAll();
      res.json(facturas);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const factura = await this.service.getById(req.params.id);
      if (!factura) {
        return res.status(404).json({ error: 'Factura no encontrada' });
      }
      res.json(factura);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const factura = await this.service.update(req.params.id, req.body);
      res.json(factura);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.service.delete(req.params.id);
      res.json({ message: 'Factura eliminada' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
