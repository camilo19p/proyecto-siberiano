import { Request, Response } from 'express';
import { CuentasService } from '../services/CuentasService';

export class CuentasPorPagarController {
  private service = new CuentasService();

  async create(req: Request, res: Response) {
    try {
      const cuenta = await this.service.create(req.body);
      res.status(201).json(cuenta);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const cuentas = await this.service.getAll(req.query as any);
      res.json(cuentas);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const cuenta = await this.service.getById(req.params.id);
      res.json(cuenta);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const cuenta = await this.service.update(req.params.id, req.body);
      res.json(cuenta);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async registrarPago(req: Request, res: Response) {
    try {
      const { monto } = req.body;
      const resultado = await this.service.registrarPago(req.params.id, monto);
      res.json(resultado);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async obtenerHistorialPagos(req: Request, res: Response) {
    try {
      const historial = await this.service.obtenerHistorialPagos(req.params.id);
      res.json(historial);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.service.delete(req.params.id);
      res.json({ message: 'Cuenta por pagar eliminada' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
