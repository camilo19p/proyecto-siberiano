import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      { codigo: 'RON001', name: 'Ron Anejo Especial', type: 'ron', precioCompra: 35000, precioVenta: 45000, stock: 25, stockInicial: 25 },
      { codigo: 'CER001', name: 'Cerveza Artesanal IPA', type: 'cerveza', precioCompra: 8000, precioVenta: 12000, stock: 50, stockInicial: 50 },
      { codigo: 'RON002', name: 'Ron Blanco Premium', type: 'ron', precioCompra: 28000, precioVenta: 35000, stock: 15, stockInicial: 15 },
      { codigo: 'CER002', name: 'Cerveza Lager Clasica', type: 'cerveza', precioCompra: 7000, precioVenta: 10000, stock: 100, stockInicial: 100 }
    ]
  });
  console.log('Seed completado!');
}

main();
