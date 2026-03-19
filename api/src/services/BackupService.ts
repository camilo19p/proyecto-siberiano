import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import prisma from '../lib/prisma';

const router = Router();

// Obtener todos los datos para backup
router.get('/full', async (req: Request, res: Response) => {
  try {
    const [products, clients, sales, users, notes] = await Promise.all([
      prisma.product.findMany(),
      prisma.client.findMany(),
      prisma.sale.findMany(),
      prisma.user.findMany(),
      prisma.note.findMany()
    ]);

    const backup = {
      fecha: new Date().toISOString(),
      version: '1.0.0',
      datos: {
        products,
        clients,
        sales,
        users,
        notes
      },
      estadisticas: {
        totalProductos: products.length,
        totalClientes: clients.length,
        totalVentas: sales.length,
        totalUsuarios: users.length,
        totalNotas: notes.length
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
      prisma.note.deleteMany(),
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

    // Restaurar notas
    if (datos.notes?.length > 0) {
      await prisma.note.createMany({ data: datos.notes });
    }

    res.json({ mensaje: 'Restauración completada exitosamente' });
  } catch (error) {
    console.error('Error en restore:', error);
    res.status(500).json({ error: 'Error al restaurar backup' });
  }
});

// Guardar backup en archivo
router.post('/save-file', async (req: Request, res: Response) => {
  try {
    const [products, clients, sales, users, notes] = await Promise.all([
      prisma.product.findMany(),
      prisma.client.findMany(),
      prisma.sale.findMany(),
      prisma.user.findMany(),
      prisma.note.findMany()
    ]);

    const backup = {
      fecha: new Date().toISOString(),
      version: '1.0.0',
      datos: { products, clients, sales, users, notes }
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
