
import fs from 'fs';
import path from 'path';
// --- BACKUP AUTOMÁTICO DE SQLITE (físico) ---
const SQLITE_DB_PATH = path.resolve(__dirname, '../../prisma/dev.db');
const SQLITE_BACKUP_DIR = path.resolve(__dirname, '../../backups');
const SQLITE_MAX_BACKUPS = 30; // últimos 30 días

export function crearBackup() {
  if (!fs.existsSync(SQLITE_BACKUP_DIR)) {
    fs.mkdirSync(SQLITE_BACKUP_DIR, { recursive: true });
  }
  const fecha = new Date().toISOString().replace(/[:.]/g, '-');
  const destino = path.join(SQLITE_BACKUP_DIR, `backup-${fecha}.db`);
  fs.copyFileSync(SQLITE_DB_PATH, destino);
  console.log(`[Backup] Copia creada: ${destino}`);
  // Eliminar backups viejos si hay más de SQLITE_MAX_BACKUPS
  const archivos = fs.readdirSync(SQLITE_BACKUP_DIR)
    .filter(f => f.endsWith('.db'))
    .map(f => ({ nombre: f, tiempo: fs.statSync(path.join(SQLITE_BACKUP_DIR, f)).mtimeMs }))
    .sort((a, b) => a.tiempo - b.tiempo);
  while (archivos.length > SQLITE_MAX_BACKUPS) {
    const viejo = archivos.shift();
    if (viejo) {
      fs.unlinkSync(path.join(SQLITE_BACKUP_DIR, viejo.nombre));
      console.log(`[Backup] Eliminado backup antiguo: ${viejo.nombre}`);
    }
  }
}
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Obtener todos los datos para backup
router.get('/full', async (req: Request, res: Response) => {
  try {
    const [products, clients, sales, users] = await Promise.all([
      prisma.product.findMany(),
      prisma.client.findMany(),
      prisma.sale.findMany(),
      prisma.user.findMany()
    ]);

    const backup = {
      fecha: new Date().toISOString(),
      version: '1.0.0',
      datos: {
        products,
        clients,
        sales,
        users
      },
      estadisticas: {
        totalProductos: products.length,
        totalClientes: clients.length,
        totalVentas: sales.length,
        totalUsuarios: users.length
      }
    };

    res.json(backup);
  } catch (error) {
    console.error('Error en backup:', error);
    res.status(500).json({ error: 'Error al generar backup' });
  }
});

// Restaurar desde backup
router.post('/restore', async (req: Request, res: Response) => {
  try {
    const { datos } = req.body;
    
    if (!datos) {
      return res.status(400).json({ error: 'Datos de backup requeridos' });
    }

    // Limpiar tablas existentes
    await prisma.$transaction([
      prisma.sale.deleteMany(),
      prisma.client.deleteMany(),
      prisma.product.deleteMany()
    ]);

    // Restaurar productos
    if (datos.products?.length > 0) {
      await prisma.product.createMany({ data: datos.products });
    }

    // Restaurar clientes
    if (datos.clients?.length > 0) {
      await prisma.client.createMany({ data: datos.clients });
    }

    // Restaurar ventas
    if (datos.sales?.length > 0) {
      await prisma.sale.createMany({ data: datos.sales });
    }

    // Notas eliminadas (modelo note no existe)

    res.json({ mensaje: 'Restauración completada exitosamente' });
  } catch (error) {
    console.error('Error en restore:', error);
    res.status(500).json({ error: 'Error al restaurar backup' });
  }
});

// Guardar backup en archivo
router.post('/save-file', async (req: Request, res: Response) => {
  try {
    const [products, clients, sales, users] = await Promise.all([
      prisma.product.findMany(),
      prisma.client.findMany(),
      prisma.sale.findMany(),
      prisma.user.findMany()
    ]);

    const backup = {
      fecha: new Date().toISOString(),
      version: '1.0.0',
      datos: { products, clients, sales, users }
    };

    const backupsDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    const filename = `backup_${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(backupsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));

    res.json({ mensaje: 'Backup guardado', filename });
  } catch (error) {
    console.error('Error guardando backup:', error);
    res.status(500).json({ error: 'Error al guardar backup' });
  }
});

// Listar backups disponibles
router.get('/list', async (req: Request, res: Response) => {
  try {
    const backupsDir = path.join(__dirname, '../../backups');
    
    if (!fs.existsSync(backupsDir)) {
      return res.json([]);
    }

    const files = fs.readdirSync(backupsDir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const stats = fs.statSync(path.join(backupsDir, f));
        return {
          filename: f,
          fecha: f.replace('backup_', '').replace('.json', ''),
          tamano: stats.size
        };
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));

    res.json(files);
  } catch (error) {
    console.error('Error listando backups:', error);
    res.status(500).json({ error: 'Error al listar backups' });
  }
});

export default router;
