import { Request, Response } from 'express';
import { UsuarioService } from '../services/UsuarioService';

export class UsuarioController {
  private service = new UsuarioService();

  async create(req: Request, res: Response) {
    try {
      const usuario = await this.service.create(req.body);
      res.status(201).json(usuario);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const usuarios = await this.service.getAll();
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async updateRol(req: Request, res: Response) {
    try {
      const { rol } = req.body;
      const usuario = await this.service.updateRol(req.params.id, rol);
      res.json(usuario);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async updateEstado(req: Request, res: Response) {
    try {
      const { activo } = req.body;
      const usuario = await this.service.updateEstado(req.params.id, activo);
      res.json(usuario);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.service.delete(req.params.id);
      res.json({ message: 'Usuario eliminado' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
