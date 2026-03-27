import prisma from '../lib/prisma';

export class FacturaService {
  async create(data: {
    numero: string;
    cliente_id?: string | number;
    monto_total: number;
    estado: string;
    userId: number;
    iva?: number;
    items: Array<{ producto_id: string | number; cantidad: number; precio: number }>;
  }) {
    // Validar campos obligatorios
    if (!data.numero || data.monto_total <= 0 || !data.userId) {
      throw new Error('Datos incompletos para crear factura');
    }

    // Validar que no haya precios o cantidades iguales o menores a cero
    for (const item of data.items) {
      if (item.cantidad <= 0 || item.precio <= 0) {
        throw new Error('Cantidad y precio deben ser positivos (> 0)');
      }
    }

    try {
      // Usar transacción para crear factura y descontar stock
      const sale = await prisma.$transaction(async (tx) => {
        // Crear venta
        const clienteId = data.cliente_id ? parseInt(data.cliente_id.toString()) : null;
        const newSale = await tx.sale.create({
          data: {
            numero: data.numero,
            clienteId,
            userId: data.userId,
            subtotal: data.monto_total,
            iva: data.iva ?? 0,
            total: data.monto_total,
            estado: data.estado || 'COMPLETADA',
          },
        });

        // Crear items y descontar stock
        for (const item of data.items) {
          const productId = parseInt(item.producto_id.toString());
          
          // Obtener producto
          const product = await tx.product.findUnique({
            where: { id: productId }
          });

          if (!product) {
            throw new Error(`Producto ${item.producto_id} no encontrado`);
          }

          if (product.stock < item.cantidad) {
            throw new Error(`Stock insuficiente para ${product.name}`);
          }

          // Crear item de venta
          await tx.saleItem.create({
            data: {
              saleId: newSale.id,
              productId,
              cantidad: item.cantidad,
              precioUnit: item.precio,
              subtotal: item.cantidad * item.precio
            }
          });

          // Descontar stock en Product
          await tx.product.update({
            where: { id: productId },
            data: { stock: product.stock - item.cantidad }
          });
        }

        return newSale;
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
      const sale = await prisma.sale.findUnique({
        where: { id: parseInt(id) },
        include: { items: true }
      });

      if (!sale) {
        throw new Error('Factura no encontrada');
      }

      // Si se está cambiando a ANULADA, restaurar stock
      if (data.estado === 'ANULADA' && sale.estado !== 'ANULADA') {
        await prisma.$transaction(async (tx) => {
          // Restaurar stock de todos los items
          for (const item of sale.items) {
            const product = await tx.product.findUnique({
              where: { id: item.productId }
            });

            if (product) {
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: product.stock + item.cantidad }
              });
            }
          }

          // Actualizar factura
          await tx.sale.update({
            where: { id: parseInt(id) },
            data: {
              estado: data.estado,
              total: data.monto_total || sale.total,
            }
          });
        });
      } else {
        // Actualización sin cambiar estado o manteniendo el actual
        const factura = await prisma.sale.update({
          where: { id: parseInt(id) },
          data: {
            estado: data.estado,
            total: data.monto_total,
          },
        });
        return factura;
      }

      return await prisma.sale.findUnique({
        where: { id: parseInt(id) },
        include: { items: true }
      });
    } catch (error) {
      throw new Error('Error al actualizar factura: ' + (error as Error).message);
    }
  }

  async delete(id: string) {
    try {
      const sale = await prisma.sale.findUnique({
        where: { id: parseInt(id) },
        include: { items: true }
      });

      if (!sale) {
        throw new Error('Factura no encontrada');
      }

      // Usar transacción para restaurar stock antes de eliminar
      await prisma.$transaction(async (tx) => {
        // Restaurar stock de todos los items
        for (const item of sale.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          });

          if (product) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: product.stock + item.cantidad }
            });
          }
        }

        // Eliminar items de venta primero (por relación FK)
        await tx.saleItem.deleteMany({
          where: { saleId: parseInt(id) }
        });

        // Luego eliminar la factura
        await tx.sale.delete({
          where: { id: parseInt(id) }
        });
      });

      return true;
    } catch (error) {
      throw new Error('Error al eliminar factura: ' + (error as Error).message);
    }
  }
}
