import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Crear usuarios de prueba
  const users = [
    {
      username: 'admin',
      password: 'admin123',
      name: 'Administrador',
      role: 'ADMIN'
    },
    {
      username: 'vendedor',
      password: 'vendedor123',
      name: 'Vendedor Principal',
      role: 'VENDEDOR'
    }
  ];

  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { username: u.username },
      create: {
        username: u.username,
        password: hashedPassword,
        name: u.name,
        role: u.role,
        estado: 'ACTIVO'
      },
      update: {
        password: hashedPassword,
        name: u.name,
        role: u.role,
      }
    });
  }

  console.log(`Seed completado: ${users.length} usuarios creados/actualizados.`);

  // Productos con precios actualizados
  const productos = [
    { name: 'Aguardiente Azul 750', stock: 2, precioCompra: 47575, precioVenta: 57000 },
    { name: 'Aguardiente Azul 375', stock: 0, precioCompra: 24995, precioVenta: 33000 },
    { name: 'Aguardiente Costeño', stock: 2, precioCompra: 18800, precioVenta: 27000 },
    { name: 'Aguardiente Verde 750', stock: 17, precioCompra: 43220, precioVenta: 55000 },
    { name: 'Aguardiente Verde 375', stock: 26, precioCompra: 22660, precioVenta: 31000 },
    { name: 'Aguardiente Amarillo 750', stock: 2, precioCompra: 43925, precioVenta: 53000 },
    { name: 'Aguardiente L Rojo (caja)', stock: 3, precioCompra: 47645, precioVenta: 55000 },
    { name: 'Aguardiente Verde L (caja)', stock: 16, precioCompra: 53610, precioVenta: 65000 },
    { name: 'Aguardiente Amarillo L', stock: 4, precioCompra: 56300, precioVenta: 68000 },
    { name: 'Aguardiente Verde Garrafón', stock: 3, precioCompra: 99237, precioVenta: 114000 },
    { name: 'Aguardiente Amarillo 1.500 ML', stock: 2, precioCompra: 77000, precioVenta: 87000 },
    { name: 'Aguardiente Amarillo Real 750', stock: 0, precioCompra: 43925, precioVenta: 53000 },
    { name: 'Aguardiente Amarillo 375', stock: 1, precioCompra: 22697, precioVenta: 33000 },
    { name: 'Black L', stock: 0, precioCompra: 63500, precioVenta: 74000 },
    { name: 'Black 750', stock: 0, precioCompra: 46900, precioVenta: 57000 },
    { name: 'Licor de Ron Medellín 750', stock: 3, precioCompra: 35701, precioVenta: 50000 },
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

  console.log(`Seed completado: ${productos.length} productos (upsert).`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
