import { Request, Response } from 'express';
import { ClienteService } from '../services/ClienteService';

export class ClienteController {
  private service = new ClienteService();

  async create(req: Request, res: Response) {
    try {
      const cliente = await this.service.create(req.body);
      res.status(201).json(cliente);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const clientes = await this.service.getAll();
      res.json(clientes);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const cliente = await this.service.getById(req.params.id);
      res.json(cliente);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const cliente = await this.service.update(req.params.id, req.body);
      res.json(cliente);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async updateEstado(req: Request, res: Response) {
    try {
      const { estado } = req.body;
      const cliente = await this.service.updateEstado(req.params.id, estado);
      res.json(cliente);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.service.delete(req.params.id);
      res.json({ message: 'Cliente eliminado' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
