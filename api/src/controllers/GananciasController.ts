import { Request, Response, NextFunction } from 'express';
import { GananciasService } from '../services/GananciasService';

const gananciasService = new GananciasService();

export class GananciasController {
  async getGanancias(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await gananciasService.getGanancias();
      return res.json(data);
    } catch (err) {
      return next(err);
    }
  }
}
