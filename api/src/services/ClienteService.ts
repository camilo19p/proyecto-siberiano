import prisma from '../lib/prisma';

interface ClienteData {
  documento: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad?: string;
}

export class ClienteService {
  // Validar formato de documento (RUT/Cédula)
  private validateDocumento(documento: string): boolean {
    // Validación básica de documento (acepta números, letras y guiones)
    return !!documento && documento.length >= 3 && /^[a-zA-Z0-9\-]+$/.test(documento);
  }

  // Validar email
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async create(data: ClienteData) {
    // Validaciones
    if (!data.documento || !data.nombre || !data.email) {
      throw new Error('Documento, nombre y email son obligatorios');
    }

    if (!this.validateDocumento(data.documento)) {
      throw new Error('Formato de documento inválido');
    }

    if (!this.validateEmail(data.email)) {
      throw new Error('Email inválido');
    }

    // Validar que no exista cliente con el mismo documento
    const existente = await prisma.client.findUnique({
      where: {
        documento: data.documento,
      },
    });

    if (existente) {
      throw new Error('Ya existe un cliente con este documento');
    }

    try {
      const nombres = data.nombre.split(' ');
      const cliente = await prisma.client.create({
        data: {
          nombres: nombres[0],
          apellidos: nombres.slice(1).join(' ') || '',
          documento: data.documento,
          email: data.email,
          telefono: data.telefono,
          direccion: data.direccion,
          ciudad: data.ciudad,
        },
      });
      return cliente;
    } catch (error) {
      throw new Error('Error al crear cliente: ' + (error as Error).message);
    }
  }

  async getAll() {
    try {
      const clientes = await prisma.client.findMany({
        include: {
          facturas: { where: { credito: true, estado: { in: ['APROBADO', 'COMPLETADA'] } } },
          pagos: true
        },
        orderBy: { createdAt: 'desc' }
      });

      // Enriquecer con datos calculados
      const clientesEnriquecidos = clientes.map((cliente) => {
        const deudaTotal = cliente.facturas.reduce((sum, f) => sum + f.total, 0);
        const totalPagado = cliente.pagos.reduce((sum, p) => sum + p.monto, 0);
        const deudaActual = deudaTotal - totalPagado;

        let diasMora = 0;
        if (deudaActual > 0 && cliente.facturas.length > 0) {
          const facturasMasAntigua = cliente.facturas.sort(
            (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
          )[0];
          const ahora = new Date();
          diasMora = Math.floor(
            (ahora.getTime() - new Date(facturasMasAntigua.fecha).getTime()) / (1000 * 60 * 60 * 24)
          );
        }

        return {
          id: cliente.id,
          nombres: cliente.nombres,
          apellidos: cliente.apellidos,
          documento: cliente.documento,
          tipoDocumento: cliente.tipoDocumento,
          telefono: cliente.telefono,
          email: cliente.email,
          ciudad: cliente.ciudad,
          direccion: cliente.direccion,
          barrio: cliente.barrio,
          cupo: cliente.cupo,
          estado: cliente.estado,
          createdAt: cliente.createdAt,
          deudaTotal,
          totalPagado,
          deudaActual,
          diasMora
        };
      });

      return clientesEnriquecidos;
    } catch (error) {
      throw new Error('Error al obtener clientes: ' + (error as Error).message);
    }
  }

  async getAllConDeuda() {
    try {
      const clientes = await prisma.client.findMany({
        include: {
          facturas: { where: { credito: true, estado: { in: ['APROBADO', 'COMPLETADA'] } } },
          pagos: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Enriquecer con datos calculados
      const clientesEnriquecidos = clientes.map((cliente) => {
        const deudaTotal = cliente.facturas.reduce((sum, f) => sum + f.total, 0);
        const totalPagado = cliente.pagos.reduce((sum, p) => sum + p.monto, 0);
        const deudaActual = deudaTotal - totalPagado;

        let diasMora = 0;
        if (deudaActual > 0 && cliente.facturas.length > 0) {
          const facturasMasAntigua = cliente.facturas.sort(
            (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
          )[0];
          const ahora = new Date();
          diasMora = Math.floor(
            (ahora.getTime() - new Date(facturasMasAntigua.fecha).getTime()) / (1000 * 60 * 60 * 24)
          );
        }

        return {
          id: cliente.id,
          nombres: cliente.nombres,
          apellidos: cliente.apellidos,
          documento: cliente.documento,
          tipoDocumento: cliente.tipoDocumento,
          telefono: cliente.telefono,
          email: cliente.email,
          ciudad: cliente.ciudad,
          direccion: cliente.direccion,
          barrio: cliente.barrio,
          cupo: cliente.cupo,
          estado: cliente.estado,
          createdAt: cliente.createdAt,
          deudaTotal,
          totalPagado,
          deudaActual,
          diasMora,
          facturas: undefined,
          pagos: undefined,
        };
      }).filter(c => c.deudaActual > 0);

      return clientesEnriquecidos;
    } catch (error) {
      throw new Error('Error al obtener clientes con deuda: ' + (error as Error).message);
    }
  }

  async getById(id: string) {
    try {
      const cliente = await prisma.client.findUnique({
        where: { id: parseInt(id) },
      });
      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }
      return cliente;
    } catch (error) {
      throw new Error('Error al obtener cliente');
    }
  }

  async getByIdConDeuda(id: string) {
    try {
      const cliente = await prisma.client.findUnique({
        where: { id: parseInt(id) },
        include: {
          facturas: { where: { credito: true }, orderBy: { fecha: 'desc' } },
          pagos: { orderBy: { fecha: 'desc' } }
        }
      });

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      const deudaTotal = cliente.facturas.reduce((sum, f) => sum + f.total, 0);
      const totalPagado = cliente.pagos.reduce((sum, p) => sum + p.monto, 0);
      const deudaActual = deudaTotal - totalPagado;

      return {
        ...cliente,
        deudaTotal,
        totalPagado,
        deudaActual
      };
    } catch (error) {
      throw new Error('Error al obtener cliente: ' + (error as Error).message);
    }
  }

  async update(id: string, data: Partial<ClienteData>) {
    // Validaciones si aplica
    if (data.email && !this.validateEmail(data.email)) {
      throw new Error('Email inválido');
    }

    if (data.documento && !this.validateDocumento(data.documento)) {
      throw new Error('Formato de documento inválido');
    }

    try {
      const nombres = data.nombre?.split(' ') || [];
      const cliente = await prisma.client.update({
        where: { id: parseInt(id) },
        data: {
          nombres: nombres[0],
          apellidos: nombres.slice(1).join(' '),
          documento: data.documento,
          email: data.email,
          telefono: data.telefono,
          direccion: data.direccion,
          ciudad: data.ciudad,
        },
      });
      return cliente;
    } catch (error) {
      throw new Error('Error al actualizar cliente');
    }
  }

  async delete(id: string) {
    try {
      await prisma.client.delete({
        where: { id: parseInt(id) },
      });
      return true;
    } catch (error) {
      throw new Error('Error al eliminar cliente');
    }
  }

  async updateEstado(id: string, estado: boolean) {
    try {
      const cliente = await prisma.client.update({
        where: { id: parseInt(id) },
        data: {
          estado: estado ? 'ACTIVO' : 'INACTIVO',
        },
      });
      return cliente;
    } catch (error) {
      throw new Error('Error al actualizar estado del cliente');
    }
  }

  async registrarPago(clienteId: number, monto: number, nota?: string) {
    try {
      if (monto <= 0) {
        throw new Error('El monto debe ser mayor a 0');
      }

      // Validar que el cliente existe y obtener deuda
      const cliente = await prisma.client.findUnique({
        where: { id: clienteId },
        include: {
          facturas: { where: { credito: true, estado: { in: ['APROBADO', 'COMPLETADA'] } } },
          pagos: true
        }
      });

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      const deudaTotal = cliente.facturas.reduce((sum, f) => sum + f.total, 0);
      const totalPagado = cliente.pagos.reduce((sum, p) => sum + p.monto, 0);
      const deudaActual = deudaTotal - totalPagado;

      if (monto > deudaActual) {
        throw new Error(`Monto excede deuda actual ($${deudaActual})`);
      }

      const pago = await prisma.pagoCliente.create({
        data: {
          clienteId,
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
      const clientes = await prisma.client.findMany({
        include: {
          facturas: { where: { credito: true, estado: { in: ['APROBADO', 'COMPLETADA'] } } },
          pagos: true
        }
      });

      const stats = {
        totalClientes: clientes.length,
        clientesActivos: clientes.filter(c => c.estado === 'ACTIVO').length,
        clientesConDeuda: 0,
        totalDeuda: 0
      };

      clientes.forEach(cliente => {
        const deudaTotal = cliente.facturas.reduce((sum, f) => sum + f.total, 0);
        const totalPagado = cliente.pagos.reduce((sum, p) => sum + p.monto, 0);
        const deudaActual = deudaTotal - totalPagado;

        if (deudaActual > 0) {
          stats.clientesConDeuda++;
          stats.totalDeuda += deudaActual;
        }
      });

      return stats;
    } catch (error) {
      throw new Error('Error al obtener estadísticas: ' + (error as Error).message);
    }
  }
}
