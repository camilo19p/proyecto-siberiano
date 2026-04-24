import prisma from '../lib/prisma';

interface ProveedorData {
  nombre: string;
  nit?: string;
  telefono?: string;
  telefono2?: string;
  email?: string;
  direccion: string;
  ciudad?: string;
  contacto?: string;
}

export class ProveedorService {
  // Validar NIT único
  private async validateNit(nit: string): Promise<boolean> {
    if (!nit) return true;
    const existente = await prisma.proveedor.findUnique({
      where: { nit }
    });
    return !existente;
  }

  async create(data: ProveedorData) {
    // Validaciones
    if (!data.nombre || !data.direccion) {
      throw new Error('Nombre y dirección son obligatorios');
    }

    if (data.nit && !(await this.validateNit(data.nit))) {
      throw new Error('Ya existe un proveedor con este NIT');
    }

    try {
      const proveedor = await prisma.proveedor.create({
        data: {
          nombre: data.nombre,
          nit: data.nit,
          telefono: data.telefono,
          telefono2: data.telefono2,
          email: data.email,
          direccion: data.direccion,
          ciudad: data.ciudad,
          contacto: data.contacto,
          activo: true
        }
      });
      return proveedor;
    } catch (error) {
      throw new Error('Error al crear proveedor: ' + (error as Error).message);
    }
  }

  async getAll() {
    try {
      const proveedores = await prisma.proveedor.findMany({
        include: {
          compras: { where: { estado: 'PENDIENTE' } },
          pagos: true
        },
        orderBy: { createdAt: 'desc' }
      });

      // Enriquecer con datos calculados
      const proveedoresEnriquecidos = proveedores.map((proveedor) => {
        const deudaTotal = proveedor.compras.reduce((sum, c) => sum + c.monto, 0);
        const totalPagado = proveedor.pagos.reduce((sum, p) => sum + p.monto, 0);
        const deudaActual = deudaTotal - totalPagado;

        let diasMora = 0;
        if (deudaActual > 0 && proveedor.compras.length > 0) {
          const compraMasAntigua = proveedor.compras.sort(
            (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
          )[0];
          const ahora = new Date();
          diasMora = Math.floor(
            (ahora.getTime() - new Date(compraMasAntigua.fecha).getTime()) / (1000 * 60 * 60 * 24)
          );
        }

        return {
          id: proveedor.id,
          nombre: proveedor.nombre,
          nit: proveedor.nit,
          telefono: proveedor.telefono,
          telefono2: proveedor.telefono2,
          email: proveedor.email,
          direccion: proveedor.direccion,
          ciudad: proveedor.ciudad,
          contacto: proveedor.contacto,
          activo: proveedor.activo,
          createdAt: proveedor.createdAt,
          updatedAt: proveedor.updatedAt,
          deudaTotal,
          totalPagado,
          deudaActual,
          diasMora
        };
      });

      return proveedoresEnriquecidos;
    } catch (error) {
      throw new Error('Error al obtener proveedores: ' + (error as Error).message);
    }
  }

  async getAllConDeuda() {
    try {
      const proveedores = await prisma.proveedor.findMany({
        include: {
          compras: { where: { estado: 'PENDIENTE' } },
          pagos: true
        },
        orderBy: { createdAt: 'desc' }
      });

      // Enriquecer con datos calculados
      const proveedoresEnriquecidos = proveedores.map((proveedor) => {
        const deudaTotal = proveedor.compras.reduce((sum, c) => sum + c.monto, 0);
        const totalPagado = proveedor.pagos.reduce((sum, p) => sum + p.monto, 0);
        const deudaActual = deudaTotal - totalPagado;

        let diasMora = 0;
        if (deudaActual > 0 && proveedor.compras.length > 0) {
          const compraMasAntigua = proveedor.compras.sort(
            (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
          )[0];
          const ahora = new Date();
          diasMora = Math.floor(
            (ahora.getTime() - new Date(compraMasAntigua.fecha).getTime()) / (1000 * 60 * 60 * 24)
          );
        }

        return {
          id: proveedor.id,
          nombre: proveedor.nombre,
          nit: proveedor.nit,
          telefono: proveedor.telefono,
          telefono2: proveedor.telefono2,
          email: proveedor.email,
          direccion: proveedor.direccion,
          ciudad: proveedor.ciudad,
          contacto: proveedor.contacto,
          activo: proveedor.activo,
          createdAt: proveedor.createdAt,
          updatedAt: proveedor.updatedAt,
          deudaTotal,
          totalPagado,
          deudaActual,
          diasMora
        };
      }).filter(p => p.deudaActual > 0);

      return proveedoresEnriquecidos;
    } catch (error) {
      throw new Error('Error al obtener proveedores con deuda: ' + (error as Error).message);
    }
  }

  async getById(id: string) {
    try {
      const proveedor = await prisma.proveedor.findUnique({
        where: { id: parseInt(id) },
        include: {
          compras: { orderBy: { fecha: 'desc' } },
          pagos: { orderBy: { fecha: 'desc' } }
        }
      });
      if (!proveedor) {
        throw new Error('Proveedor no encontrado');
      }

      const deudaTotal = proveedor.compras.reduce((sum, c) => sum + c.monto, 0);
      const totalPagado = proveedor.pagos.reduce((sum, p) => sum + p.monto, 0);
      const deudaActual = deudaTotal - totalPagado;

      let diasMora = 0;
      if (deudaActual > 0 && proveedor.compras.length > 0) {
        const compraMasAntigua = proveedor.compras.sort(
          (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        )[0];
        const ahora = new Date();
        diasMora = Math.floor(
          (ahora.getTime() - new Date(compraMasAntigua.fecha).getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      return {
        ...proveedor,
        deudaTotal,
        totalPagado,
        deudaActual,
        diasMora
      };
    } catch (error) {
      throw new Error('Error al obtener proveedor: ' + (error as Error).message);
    }
  }

  async update(id: string, data: Partial<ProveedorData>) {
    try {
      const proveedor = await prisma.proveedor.update({
        where: { id: parseInt(id) },
        data: {
          nombre: data.nombre,
          nit: data.nit,
          telefono: data.telefono,
          telefono2: data.telefono2,
          email: data.email,
          direccion: data.direccion,
          ciudad: data.ciudad,
          contacto: data.contacto
        }
      });
      return proveedor;
    } catch (error) {
      throw new Error('Error al actualizar proveedor: ' + (error as Error).message);
    }
  }

  async updateEstado(id: string, activo: boolean) {
    try {
      const proveedor = await prisma.proveedor.update({
        where: { id: parseInt(id) },
        data: { activo }
      });
      return proveedor;
    } catch (error) {
      throw new Error('Error al actualizar estado del proveedor: ' + (error as Error).message);
    }
  }

  async delete(id: string) {
    try {
      await prisma.proveedor.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      throw new Error('Error al eliminar proveedor: ' + (error as Error).message);
    }
  }

  async registrarCompra(proveedorId: number, monto: number, descripcion: string, fecha?: Date) {
    try {
      if (monto <= 0) {
        throw new Error('El monto debe ser mayor a 0');
      }

      // Validar que el proveedor existe
      const proveedor = await prisma.proveedor.findUnique({
        where: { id: proveedorId }
      });

      if (!proveedor) {
        throw new Error('Proveedor no encontrado');
      }

      const compra = await prisma.compraProveedor.create({
        data: {
          proveedorId,
          descripcion,
          monto,
          fecha: fecha || new Date()
        }
      });

      return compra;
    } catch (error) {
      throw new Error('Error al registrar compra: ' + (error as Error).message);
    }
  }

  async registrarPago(proveedorId: number, monto: number, nota?: string) {
    try {
      if (monto <= 0) {
        throw new Error('El monto debe ser mayor a 0');
      }

      // Validar que el proveedor existe y obtener deuda
      const proveedor = await prisma.proveedor.findUnique({
        where: { id: proveedorId },
        include: {
          compras: { where: { estado: 'PENDIENTE' } },
          pagos: true
        }
      });

      if (!proveedor) {
        throw new Error('Proveedor no encontrado');
      }

      const deudaTotal = proveedor.compras.reduce((sum, c) => sum + c.monto, 0);
      const totalPagado = proveedor.pagos.reduce((sum, p) => sum + p.monto, 0);
      const deudaActual = deudaTotal - totalPagado;

      if (monto > deudaActual) {
        throw new Error(`Monto excede deuda actual ($${deudaActual})`);
      }

      const pago = await prisma.pagoProveedor.create({
        data: {
          proveedorId,
          monto,
          nota,
          fecha: new Date()
        }
      });

      return pago;
    } catch (error) {
      throw new Error('Error al registrar pago: ' + (error as Error).message);
    }
  }

  async getStats() {
    try {
      const proveedores = await prisma.proveedor.findMany({
        include: {
          compras: { where: { estado: 'PENDIENTE' } },
          pagos: true
        }
      });

      const stats = {
        totalProveedores: proveedores.length,
        proveedoresActivos: proveedores.filter(p => p.activo).length,
        proveedoresConDeuda: 0,
        totalDeuda: 0
      };

      proveedores.forEach(proveedor => {
        const deudaTotal = proveedor.compras.reduce((sum, c) => sum + c.monto, 0);
        const totalPagado = proveedor.pagos.reduce((sum, p) => sum + p.monto, 0);
        const deudaActual = deudaTotal - totalPagado;

        if (deudaActual > 0) {
          stats.proveedoresConDeuda++;
          stats.totalDeuda += deudaActual;
        }
      });

      return stats;
    } catch (error) {
      throw new Error('Error al obtener estadísticas: ' + (error as Error).message);
    }
  }
}