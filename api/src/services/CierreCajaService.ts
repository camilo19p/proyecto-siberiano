import prisma from '../lib/prisma';

interface CierreCajaData {
  vendedor_id: string;
  fecha: string;
  moneda_fisica: number;
  transferencias: number;
  cheques: number;
  total_esperado: number;
}

export class CierreCajaService {
  async create(data: CierreCajaData) {
    if (!data.vendedor_id || !data.fecha || data.total_esperado < 0) {
      throw new Error('Datos incompletos para crear cierre de caja');
    }

    try {
      const totalRecibido = data.moneda_fisica + data.transferencias + data.cheques;
      const diferencia = totalRecibido - data.total_esperado;

      // Crear una nota para guardar el cierre
      const cierre = await prisma.nota.create({
        data: {
          fecha: data.fecha,
          titulo: `Cierre de Caja - Vendedor ${data.vendedor_id}`,
          contenido: JSON.stringify({
            moneda_fisica: data.moneda_fisica,
            transferencias: data.transferencias,
            cheques: data.cheques,
            totalRecibido,
            diferencia
          }),
          userId: parseInt(data.vendedor_id),
        },
      });
      return cierre;
    } catch (error) {
      throw new Error('Error al crear cierre de caja');
    }
  }

  async getAll(vendedor_id?: string) {
    try {
      const cierres = await prisma.nota.findMany({
        where: vendedor_id ? { userId: parseInt(vendedor_id) } : undefined
      });
      return cierres;
    } catch (error) {
      throw new Error('Error al obtener cierres de caja');
    }
  }

  async getById(id: string) {
    try {
      const cierre = await prisma.nota.findUnique({
        where: { id: parseInt(id) },
      });
      if (!cierre) {
        throw new Error('Cierre no encontrado');
      }
      return cierre;
    } catch (error) {
      throw new Error('Error al obtener cierre');
    }
  }

  async registrarMovimiento(
    cierre_id: string,
    data: { tipo: string; monto: number; descripcion: string }
  ) {
    if (!data.tipo || data.monto < 0) {
      throw new Error('Tipo y monto son obligatorios');
    }

    try {
      // Guardamos como una nota secundaria
      const movimiento = await prisma.nota.create({
        data: {
          fecha: new Date().toISOString().split('T')[0],
          titulo: `Movimiento - ${data.tipo}`,
          contenido: data.descripcion,
        },
      });
      return movimiento;
    } catch (error) {
      throw new Error('Error al registrar movimiento');
    }
  }

  async cerrarCaja(id: string, monto_final: number) {
    try {
      const cierre = await prisma.nota.update({
        where: { id: parseInt(id) },
        data: {
          contenido: JSON.stringify({ monto_final })
        },
      });
      return cierre;
    } catch (error) {
      throw new Error('Error al cerrar caja');
    }
  }
}
