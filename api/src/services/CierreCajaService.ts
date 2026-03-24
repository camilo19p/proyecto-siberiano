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
    const vendedorId = Number(data.vendedor_id);

    if (
      !data.vendedor_id ||
      Number.isNaN(vendedorId) ||
      !data.fecha ||
      data.moneda_fisica < 0 ||
      data.transferencias < 0 ||
      data.cheques < 0 ||
      data.total_esperado < 0
    ) {
      throw new Error('Datos incompletos o inválidos para crear cierre de caja');
    }

    try {
      const totalRecibido = data.moneda_fisica + data.transferencias + data.cheques;
      const diferencia = totalRecibido - data.total_esperado;

      const cierre = await prisma.nota.create({
        data: {
          fecha: data.fecha,
          titulo: `Cierre de Caja - Vendedor ${vendedorId}`,
          contenido: JSON.stringify({
            moneda_fisica: data.moneda_fisica,
            transferencias: data.transferencias,
            cheques: data.cheques,
            totalRecibido,
            diferencia,
          }),
          userId: vendedorId,
        },
      });
      return cierre;
    } catch (error) {
      throw new Error(`Error al crear cierre de caja: ${(error as Error).message}`);
    }
  }

  async getAll(vendedor_id?: string) {
    try {
      const where = vendedor_id && !Number.isNaN(Number(vendedor_id))
        ? { userId: Number(vendedor_id) }
        : undefined;
      const cierres = await prisma.nota.findMany({ where });
      return cierres;
    } catch (error) {
      throw new Error('Error al obtener cierres de caja');
    }
  }

  async getById(id: string) {
    try {
      const idNum = Number(id);
      if (Number.isNaN(idNum)) throw new Error('ID inválido');

      const cierre = await prisma.nota.findUnique({ where: { id: idNum } });
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
    const idNum = Number(id);
    if (Number.isNaN(idNum) || monto_final < 0) {
      throw new Error('Datos inválidos para cerrar caja');
    }

    try {
      const cierre = await prisma.nota.update({
        where: { id: idNum },
        data: { contenido: JSON.stringify({ monto_final }) },
      });
      return cierre;
    } catch (error) {
      throw new Error('Error al cerrar caja');
    }
  }
}