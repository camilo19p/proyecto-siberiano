import { Request, Response } from 'express';
import { ProveedorService } from '../services/ProveedorService';

export class ProveedorController {
  private service = new ProveedorService();

  async create(req: Request, res: Response) {
    try {
      const proveedor = await this.service.create(req.body);
      res.status(201).json(proveedor);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const proveedores = await this.service.getAll();
      res.json(proveedores);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getAllConDeuda(req: Request, res: Response) {
    try {
      const proveedores = await this.service.getAllConDeuda();
      res.json(proveedores);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const stats = await this.service.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const proveedor = await this.service.getById(req.params.id);
      res.json(proveedor);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const proveedor = await this.service.update(req.params.id, req.body);
      res.json(proveedor);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async updateEstado(req: Request, res: Response) {
    try {
      const { activo } = req.body;
      const proveedor = await this.service.updateEstado(req.params.id, activo);
      res.json(proveedor);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.service.delete(req.params.id);
      res.json({ message: 'Proveedor eliminado' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async registrarCompra(req: Request, res: Response) {
    try {
      const proveedorId = parseInt(req.params.id);
      const { monto, descripcion, fecha } = req.body;
      const compra = await this.service.registrarCompra(proveedorId, monto, descripcion, fecha ? new Date(fecha) : undefined);
      res.status(201).json(compra);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async registrarPago(req: Request, res: Response) {
    try {
      const proveedorId = parseInt(req.params.id);
      const { monto, nota } = req.body;
      const pago = await this.service.registrarPago(proveedorId, monto, nota);
      res.status(201).json(pago);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}