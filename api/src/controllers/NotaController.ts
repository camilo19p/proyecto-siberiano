import { Request, Response, NextFunction } from 'express';
import { NotaService } from '../services/NotaService';

const notaService = new NotaService();

export class NotaController {
  async getNotas(req: Request, res: Response, next: NextFunction) {
    try {
      const notas = await notaService.getAllNotas();
      return res.json(notas);
    } catch (err) {
      return next(err);
    }
  }

  async getNotasByFecha(req: Request, res: Response, next: NextFunction) {
    try {
      const { fecha } = req.params;
      const notas = await notaService.getNotasByFecha(fecha);
      return res.json(notas);
    } catch (err) {
      return next(err);
    }
  }

  async createNota(req: Request, res: Response, next: NextFunction) {
    try {
      const { fecha, titulo, contenido, color } = req.body;
      const nota = await notaService.createNota({ fecha, titulo, contenido, color });
      return res.status(201).json(nota);
    } catch (err) {
      return next(err);
    }
  }

  async deleteNota(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await notaService.deleteNota(parseInt(id));
      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  }
}
