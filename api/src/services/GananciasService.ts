import prisma from '../lib/prisma';

export interface GananciaItem {
  id: string;
  codigo: string;
  nombre: string;
  gananciaUnitaria: number;
  stock: number;
  potencialGanancia: number;
}

export class GananciasService {
  async getGanancias(): Promise<GananciaItem[]> {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });

    return products.map(p => {
      const gananciaUnitaria = p.precioVenta - p.precioCompra;
      const potencialGanancia = gananciaUnitaria * p.stock;
      
      return {
        id: p.id.toString(),
        codigo: p.codigo,
        nombre: p.name,
        gananciaUnitaria,
        stock: p.stock,
        potencialGanancia
      };
    });
  }
}
