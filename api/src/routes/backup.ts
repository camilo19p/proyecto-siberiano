import { Router, Request, Response } from 'express';
import { crearBackup } from '../services/BackupService';
import fs from 'fs';
import path from 'path';

const router = Router();
const BACKUP_DIR = path.resolve(__dirname, '../../backups');

// POST /api/backup → crea backup manual
router.post('/', (req: Request, res: Response) => {
  try {
    crearBackup();
    res.json({ ok: true, mensaje: 'Backup creado exitosamente' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al crear backup', error });
  }
});

// GET /api/backup → lista los backups disponibles
router.get('/', (req: Request, res: Response) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return res.json({ backups: [] });
    }
    const archivos = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.db'))
      .map(f => {
        const stats = fs.statSync(path.join(BACKUP_DIR, f));
        return { nombre: f, fecha: stats.mtime, tamaño: stats.size };
      })
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    res.json({ backups: archivos });
  } catch (error) {
    res.status(500).json({ ok: false, error });
  }
});

export default router;
