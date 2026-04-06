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
      const { estado, clienteId, fechaInicio, fechaFin, metodoPago } = req.query;
      const filtros = {
        estado: estado as string,
        clienteId: clienteId as string,
        fechaInicio: fechaInicio as string,
        fechaFin: fechaFin as string,
        metodoPago: metodoPago as string
      };
      const facturas = await this.service.getAll(filtros);
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

  async updateEstado(req: Request, res: Response) {
    try {
      const { estado } = req.body;
      if (!estado) {
        return res.status(400).json({ error: 'Estado es requerido' });
      }
      const factura = await this.service.update(req.params.id, { estado });
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
