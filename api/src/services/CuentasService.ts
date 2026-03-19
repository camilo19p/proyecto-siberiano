import prisma from '../lib/prisma';

interface CuentaPorPagarData {
  proveedor: string;
  monto: number;
  fecha_vencimiento: string;
  estado: string;
  descripcion?: string;
}

export class CuentasService {
  async create(data: CuentaPorPagarData) {
    if (!data.proveedor || data.monto <= 0 || !data.fecha_vencimiento) {
      throw new Error('Proveedor, monto y fecha de vencimiento son obligatorios');
    }

    // Validar que el monto sea razonable (max 10 millones)
    if (data.monto > 10000000) {
      throw new Error('Monto excede el límite permitido');
    }

    try {
      // Guardamos como configuración para mayor persistencia
      const cuenta = await prisma.configuracion.create({
        data: {
          clave: `cuenta_${Date.now()}`,
          valor: JSON.stringify({
            proveedor: data.proveedor,
            monto: data.monto,
            fecha_vencimiento: data.fecha_vencimiento,
            estado: data.estado,
            descripcion: data.descripcion
          }),
          descripcion: `Cuenta por pagar - ${data.proveedor}`
        },
      });
      return cuenta;
    } catch (error) {
      throw new Error('Error al crear cuenta por pagar');
    }
  }

  async getAll(filters?: { estado?: string; proveedor?: string }) {
    try {
      const cuentas = await prisma.configuracion.findMany({
        where: {
          descripcion: { contains: 'Cuenta por pagar' }
        }
      });
      return cuentas;
    } catch (error) {
      throw new Error('Error al obtener cuentas por pagar');
    }
  }

  async getById(id: string) {
    try {
      const cuenta = await prisma.configuracion.findUnique({
        where: { id: parseInt(id) },
      });
      if (!cuenta) {
        throw new Error('Cuenta no encontrada');
      }
      return cuenta;
    } catch (error) {
      throw new Error('Error al obtener cuenta');
    }
  }

  async update(id: string, data: Partial<CuentaPorPagarData>) {
    if (data.monto && data.monto <= 0) {
      throw new Error('Monto debe ser mayor a 0');
    }

    try {
      const cuenta = await prisma.configuracion.update({
        where: { id: parseInt(id) },
        data: {
          valor: JSON.stringify(data),
        },
      });
      return cuenta;
    } catch (error) {
      throw new Error('Error al actualizar cuenta');
    }
  }

  async registrarPago(id: string, monto: number) {
    if (monto <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    try {
      const cuenta = await this.getById(id);
      if (!cuenta) {
        throw new Error('Cuenta no encontrada');
      }

      // Registrar pago en nota
      const pago = await prisma.nota.create({
        data: {
          fecha: new Date().toISOString().split('T')[0],
          titulo: `Pago registrado`,
          contenido: `Pago de ${monto} para ${cuenta.descripcion}`,
        },
      });

      return { pago, saldo_restante: 0 };
    } catch (error) {
      throw new Error('Error al registrar pago');
    }
  }

  async obtenerHistorialPagos(id: string) {
    try {
      const cuenta = await this.getById(id);
      return cuenta;
    } catch (error) {
      throw new Error('Error al obtener historial de pagos');
    }
  }

  async delete(id: string) {
    try {
      await prisma.configuracion.delete({
        where: { id: parseInt(id) },
      });
      return true;
    } catch (error) {
      throw new Error('Error al eliminar cuenta');
    }
  }
}
