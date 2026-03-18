import { Request, Response, NextFunction } from 'express';
import { InventarioService } from '../services/InventarioService';

const inventarioService = new InventarioService();

export class InventarioController {
  async prepareInventario(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await inventarioService.prepareInventario();
      return res.json(data);
    } catch (err) {
      return next(err);
    }
  }

  async getAllInventarios(req: Request, res: Response, next: NextFunction) {
    try {
      const inventarios = await inventarioService.getAllInventarios();
      return res.json(inventarios);
    } catch (err) {
      return next(err);
    }
  }

  async createInventario(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await inventarioService.createInventario(req.body);
      return res.status(201).json(created);
    } catch (err) {
      return next(err);
    }
  }
}
