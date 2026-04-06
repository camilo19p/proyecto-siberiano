import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Limpiar toda la base de datos
  console.info('Limpiando base de datos...');
  
  // Eliminar usuarios también para poder crear con IDs específicos
  try { await prisma.user.deleteMany({}); } catch (e) {}
  
  // Eliminar en orden para respetar las relaciones
  try { await prisma.paymentHistory.deleteMany({}); } catch (e) {}
  try { await prisma.payable.deleteMany({}); } catch (e) {}
  try { await prisma.cashMovement.deleteMany({}); } catch (e) {}
  try { await prisma.caja.deleteMany({}); } catch (e) {}
  try { await prisma.cajaAudit.deleteMany({}); } catch (e) {}
  
  await prisma.inventarioItem.deleteMany({});
  await prisma.inventario.deleteMany({});
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.nota.deleteMany({});
  
  console.info('Base de datos limpiada.');

  // Crear usuarios de prueba con IDs específicos (1 y 2)
  const users = [
    {
      id: 1,
      username: 'admin',
      password: 'admin123',
      name: 'Administrador',
      role: 'ADMIN'
    },
    {
      id: 2,
      username: 'vendedor',
      password: 'vendedor123',
      name: 'Vendedor Principal',
      role: 'VENDEDOR'
    }
  ];

  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    await prisma.user.create({
      data: {
        id: u.id,
        username: u.username,
        password: hashedPassword,
        name: u.name,
        role: u.role,
        estado: 'ACTIVO'
      }
    });
  }

  console.info(`Seed completado: ${users.length} usuarios creados/actualizados.`);

  // Productos con datos reales proporcionados
  const productos = [
    { name: 'Aguardiente Azul 750', stock: 2, precioCompra: 47575, precioVenta: 57000 },
    { name: 'Aguardiente Azul 370', stock: 0, precioCompra: 24995, precioVenta: 33000 },
    { name: 'Aguardiente Costeño', stock: 2, precioCompra: 18800, precioVenta: 27000 },
    { name: 'Aguardiente Verde 750', stock: 17, precioCompra: 43220, precioVenta: 55000 },
    { name: 'Aguardiente Verde 370', stock: 26, precioCompra: 22660, precioVenta: 31000 },
    { name: 'Aguardiente Amarillo 750', stock: 2, precioCompra: 43925, precioVenta: 53000 },
    { name: 'Aguardiente L Rojo (cajeta)', stock: 3, precioCompra: 47645, precioVenta: 55000 },
    { name: 'Aguardiente Verde L (cajeta)', stock: 16, precioCompra: 53610, precioVenta: 65000 },
    { name: 'Aguardiente Amarillo L', stock: 4, precioCompra: 56300, precioVenta: 68000 },
    { name: 'Aguardiente Verde Garrafón', stock: 3, precioCompra: 99237, precioVenta: 114000 },
    { name: 'Aguardiente Amarillo 1.500 ML', stock: 2, precioCompra: 77000, precioVenta: 87000 },
    { name: 'Aguardiente Amarillo Real 750', stock: 0, precioCompra: 43925, precioVenta: 53000 },
    { name: 'Aguardiente Amarillo 370', stock: 1, precioCompra: 22697, precioVenta: 33000 },
    { name: 'Black L', stock: 0, precioCompra: 63500, precioVenta: 74000 },
    { name: 'Black 750', stock: 0, precioCompra: 46900, precioVenta: 57000 },
    { name: 'Licor de Ron Medellín', stock: 3, precioCompra: 35701, precioVenta: 50000 },
    { name: 'Medellín 750 (3 años)', stock: 3, precioCompra: 52035, precioVenta: 62000 },
    { name: 'Medellín L (3 años)', stock: 1, precioCompra: 76265, precioVenta: 86000 },
    { name: 'Medellín 375 (3 años)', stock: 25, precioCompra: 26895, precioVenta: 35000 },
    { name: 'Medellín 375 (5 años)', stock: 7, precioCompra: 30674, precioVenta: 40000 },
    { name: 'Medellín 375 (8 años)', stock: 2, precioCompra: 40532, precioVenta: 49000 },
    { name: 'Medellín 750 (8 años)', stock: 6, precioCompra: 76265, precioVenta: 86000 },
    { name: 'Medellín 750 (5 años)', stock: 1, precioCompra: 59786, precioVenta: 70000 },
    { name: 'Medellín Garrafón', stock: 2, precioCompra: 130198, precioVenta: 145000 },
  ];

  const normalize = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const inferType = (name: string) => {
    const n = name.toLowerCase();
    // Ojo: algunos nombres vienen con tilde (Medellín). Revisamos ambas variantes.
    if (n.includes('ron') || n.includes('medellín') || n.includes('medellin') || n.includes('black')) return 'ron';
    if (n.includes('aguardiente')) return 'aguardiente';
    return 'general';
  };

  const defaults = {
    stockMinimo: 5,
    categoria: 'GENERAL',
    estado: 'ACTIVO',
  } as const;

  for (const p of productos) {
    const codigo = normalize(p.name).toUpperCase();
    await prisma.product.upsert({
      where: { codigo },
      create: {
        codigo,
        name: p.name,
        type: inferType(p.name),
        categoria: defaults.categoria,
        precioCompra: p.precioCompra,
        precioVenta: p.precioVenta,
        stock: p.stock,
        stockInicial: p.stock,
        stockMinimo: defaults.stockMinimo,
        estado: defaults.estado,
        imagen: 'https://via.placeholder.com/300x300?text=' + encodeURIComponent(p.name),
        descripcion: p.name,
      },
      update: {
        name: p.name,
        type: inferType(p.name),
        stock: p.stock,
        stockInicial: p.stock,
        precioCompra: p.precioCompra,
        precioVenta: p.precioVenta,
        estado: defaults.estado,
      },
    });
  }

  console.info(`Seed completado: ${productos.length} productos (upsert).`);

  // Crear clientes de prueba
  const clientes = [
    {
      nombres: 'Juan',
      apellidos: 'García López',
      documento: '1234567890',
      tipoDocumento: 'CC',
      telefono: '3001234567',
      email: 'juan.garcia@email.com',
      ciudad: 'Medellín',
      direccion: 'Cra 50 #80-20',
      barrio: 'Laureles',
      cupo: 500000
    }
  ];

  for (const c of clientes) {
    await prisma.client.create({
      data: {
        ...c,
        estado: 'ACTIVO',
        saldo: 0
      }
    });
  }

  console.info(`Seed completado: ${clientes.length} cliente creado.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
