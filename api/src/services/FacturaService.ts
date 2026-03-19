import prisma from '../lib/prisma';

export class FacturaService {
  async create(data: {
    numero: string;
    cliente_id: string;
    monto_total: number;
    estado: string;
    items: Array<{ producto_id: string; cantidad: number; precio: number }>;
  }) {
    // Validar campos obligatorios
    if (!data.numero || !data.cliente_id || data.monto_total <= 0) {
      throw new Error('Datos incompletos para crear factura');
    }

    try {
      const sale = await prisma.sale.create({
        data: {
          numero: data.numero,
          clienteId: parseInt(data.cliente_id),
          userId: 1, // Usuario por defecto
          subtotal: data.monto_total,
          iva: 0,
          total: data.monto_total,
          estado: data.estado,
        },
      });
      return sale;
    } catch (error) {
      throw new Error('Error al crear factura: ' + (error as Error).message);
    }
  }

  async getAll(filters?: { estado?: string; cliente_id?: string }) {
    try {
      const facturas = await prisma.sale.findMany({
        where: filters ? {
          estado: filters.estado,
          clienteId: filters.cliente_id ? parseInt(filters.cliente_id) : undefined
        } : undefined,
        include: { items: true, client: true }
      });
      return facturas;
    } catch (error) {
      throw new Error('Error al obtener facturas');
    }
  }

  async getById(id: string) {
    try {
      const factura = await prisma.sale.findUnique({
        where: { id: parseInt(id) },
        include: { items: true, client: true }
      });
      return factura;
    } catch (error) {
      throw new Error('Factura no encontrada');
    }
  }

  async update(id: string, data: { estado?: string; monto_total?: number }) {
    try {
      const factura = await prisma.sale.update({
        where: { id: parseInt(id) },
        data: {
          estado: data.estado,
          total: data.monto_total,
        },
      });
      return factura;
    } catch (error) {
      throw new Error('Error al actualizar factura');
    }
  }

  async delete(id: string) {
    try {
      await prisma.sale.delete({
        where: { id: parseInt(id) },
      });
      return true;
    } catch (error) {
      throw new Error('Error al eliminar factura');
    }
  }
}
