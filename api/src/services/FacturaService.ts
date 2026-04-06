import prisma from '../lib/prisma';

export class FacturaService {
  async create(data: {
    numero?: string;
    cliente_id?: string | number;
    clienteId?: string | number;
    monto_total?: number;
    estado?: string;
    userId: number;
    iva?: number;
    items: Array<{
      producto_id?: string | number;
      productoId?: string | number;
      cantidad: number;
      precio?: number;
      precioUnitario?: number;
      precioCompra?: number;
      productoNombre?: string;
    }>;
    metodoPago?: string;
    descuento?: number;
    subtotal?: number;
    total?: number;
    utilidad?: number;
    credito?: boolean;
  }) {
    try {
      // Normalizar nombres de campos
      const rawClienteId = data.clienteId || data.cliente_id;
      const clienteId = rawClienteId ? parseInt(rawClienteId.toString()) : null;
      const total = data.total || data.monto_total || 0;
      const subtotal = data.subtotal || total;

      // Validar campos obligatorios
      if (!data.userId || data.items.length === 0) {
        throw new Error('UserId y items son obligatorios');
      }

      // Validar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { id: data.userId }
      });

      if (!user) {
        throw new Error(`Usuario con ID ${data.userId} no encontrado`);
      }

      // Validar cliente si se proporciona
      if (clienteId) {
        const client = await prisma.client.findUnique({
          where: { id: clienteId }
        });
        if (!client) {
          throw new Error(`Cliente con ID ${clienteId} no encontrado`);
        }
      }

      // Usar transacción para crear factura
      const factura = await prisma.$transaction(async (tx) => {
        // Generar número correlativo de factura
        const lastFactura = await tx.factura.findFirst({
          orderBy: { numero: 'desc' }
        });
        const nextNumero = (lastFactura?.numero || 0) + 1;

        // Crear factura
        const newFactura = await tx.factura.create({
          data: {
            numero: nextNumero,
            tipo: 'FACTURA',
            estado: data.estado || 'APROBADO',
            fecha: new Date(),
            metodoPago: data.metodoPago || 'EFECTIVO',
            subtotal: subtotal,
            total: total,
            utilidad: data.utilidad || 0,
            credito: data.credito || false,
            descuento: data.descuento || 0,
            clienteId: clienteId,
            userId: data.userId
          }
        });

        // Crear items y descontar stock
        for (const item of data.items) {
          const rawProductId = item.productoId || item.producto_id;
          const productId = rawProductId ? parseInt(rawProductId.toString()) : 0;
          const precioCompra = item.precioCompra || 0;
          const precioUnitario = item.precioUnitario || item.precio || 0;
          const productoNombre = item.productoNombre || '';

          // Obtener producto
          const product = await tx.product.findUnique({
            where: { id: productId }
          });

          if (!product) {
            throw new Error(`Producto ${productId} no encontrado`);
          }

          if (product.stock < item.cantidad) {
            throw new Error(`Stock insuficiente para ${product.name}`);
          }

          const itemSubtotal = item.cantidad * precioUnitario;

          // Crear item de factura
          await tx.facturaItem.create({
            data: {
              facturaId: newFactura.id,
              productoId: productId,
              productoNombre: productoNombre || product.name,
              cantidad: item.cantidad,
              precioUnitario: precioUnitario,
              precioCompra: precioCompra,
              subtotal: itemSubtotal
            }
          });

          // Descontar stock
          await tx.product.update({
            where: { id: productId },
            data: { stock: product.stock - item.cantidad }
          });
        }

        return newFactura;
      });

      // Retornar factura con items
      return await this.getById(factura.id.toString());
    } catch (error) {
      throw new Error('Error al crear factura: ' + (error as Error).message);
    }
  }

  async getAll(filters?: {
    estado?: string;
    clienteId?: string | number;
    fechaInicio?: string;
    fechaFin?: string;
    metodoPago?: string;
  }) {
    try {
      const where: any = {};

      if (filters?.estado && filters.estado !== 'TODOS') {
        where.estado = filters.estado;
      }

      if (filters?.clienteId) {
        where.clienteId = parseInt(filters.clienteId.toString());
      }

      if (filters?.metodoPago) {
        where.metodoPago = filters.metodoPago;
      }

      if (filters?.fechaInicio || filters?.fechaFin) {
        where.fecha = {};
        if (filters.fechaInicio) {
          where.fecha.gte = new Date(filters.fechaInicio);
        }
        if (filters.fechaFin) {
          const fechaFin = new Date(filters.fechaFin);
          fechaFin.setHours(23, 59, 59, 999);
          where.fecha.lte = fechaFin;
        }
      }

      const facturas = await prisma.factura.findMany({
        where,
        include: { items: true },
        orderBy: { fecha: 'desc' }
      });

      return facturas;
    } catch (error) {
      throw new Error('Error al obtener facturas: ' + (error as Error).message);
    }
  }

  async getById(id: string | number) {
    try {
      const factura = await prisma.factura.findUnique({
        where: { id: parseInt(id.toString()) },
        include: { items: true }
      });
      return factura;
    } catch (error) {
      throw new Error('Factura no encontrada');
    }
  }

  async update(id: string | number, data: { estado?: string; monto_total?: number }) {
    try {
      const factura = await prisma.factura.findUnique({
        where: { id: parseInt(id.toString()) },
        include: { items: true }
      });

      if (!factura) {
        throw new Error('Factura no encontrada');
      }

      // Si se cambia a ANULADO, restaurar stock
      if (data.estado === 'ANULADO' && factura.estado !== 'ANULADO') {
        await prisma.$transaction(async (tx) => {
          // Restaurar stock
          for (const item of factura.items) {
            const product = await tx.product.findUnique({
              where: { id: item.productoId }
            });

            if (product) {
              await tx.product.update({
                where: { id: item.productoId },
                data: { stock: product.stock + item.cantidad }
              });
            }
          }

          // Actualizar factura
          await tx.factura.update({
            where: { id: parseInt(id.toString()) },
            data: { estado: data.estado }
          });
        });
      } else {
        await prisma.factura.update({
          where: { id: parseInt(id.toString()) },
          data: {
            estado: data.estado,
            total: data.monto_total
          }
        });
      }

      return await this.getById(id);
    } catch (error) {
      throw new Error('Error al actualizar factura: ' + (error as Error).message);
    }
  }

  async delete(id: string | number) {
    try {
      const factura = await prisma.factura.findUnique({
        where: { id: parseInt(id.toString()) },
        include: { items: true }
      });

      if (!factura) {
        throw new Error('Factura no encontrada');
      }

      // Restaurar stock antes de eliminar
      await prisma.$transaction(async (tx) => {
        for (const item of factura.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productoId }
          });

          if (product) {
            await tx.product.update({
              where: { id: item.productoId },
              data: { stock: product.stock + item.cantidad }
            });
          }
        }

        // Eliminar items
        await tx.facturaItem.deleteMany({
          where: { facturaId: parseInt(id.toString()) }
        });

        // Eliminar factura
        await tx.factura.delete({
          where: { id: parseInt(id.toString()) }
        });
      });

      return true;
    } catch (error) {
      throw new Error('Error al eliminar factura: ' + (error as Error).message);
    }
  }
}
