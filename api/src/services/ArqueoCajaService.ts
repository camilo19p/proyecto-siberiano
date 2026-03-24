import prisma from '../lib/prisma';
import { z } from 'zod';

const arqueoCajaSchema = z.object({
  ventasEfectivo: z.number().min(0),
  base: z.number().min(0),
  gastos: z.number().min(0),
  saldoReal: z.number().min(0),
  usuarioId: z.number().int().positive(),
  observaciones: z.string().optional(),
});

export class ArqueoCajaService {
  /**
   * Cierra caja calculando diferencia entre saldo esperado y real
   */
  static async cierreCaja(data: z.infer<typeof arqueoCajaSchema>) {
    const validated = arqueoCajaSchema.parse(data);

    const saldoEsperado = validated.ventasEfectivo + validated.base - validated.gastos;
    const diferencia = validated.saldoReal - saldoEsperado;

    if (validated.saldoReal < 0) {
      throw new Error('El saldo real no puede ser negativo');
    }

    try {
      const auditoria = await prisma.cajaAudit.create({
        data: {
          usuarioId: validated.usuarioId,
          ventasEfectivo: validated.ventasEfectivo,
          base: validated.base,
          gastos: validated.gastos,
          saldoEsperado,
          saldoReal: validated.saldoReal,
          diferencia,
          observaciones: validated.observaciones || null,
        },
      });

      return {
        success: true,
        auditoria,
        resultado: {
          ventasEfectivo: validated.ventasEfectivo,
          base: validated.base,
          gastos: validated.gastos,
          saldoEsperado,
          saldoReal: validated.saldoReal,
          diferencia,
          estado: diferencia === 0 ? 'CUADRE' : 'DIFERENCIA',
        },
      };
    } catch (error) {
      throw new Error(`Error al cerrar caja: ${(error as Error).message}`);
    }
  }

  /**
   * Obtiene historial de auditoría de caja
   */
  static async obtenerHistorial(limit: number = 10) {
    const finalLimit = Number.isNaN(limit) || limit <= 0 ? 10 : limit;
    return await prisma.cajaAudit.findMany({
      orderBy: { fecha: 'desc' },
      take: finalLimit,
    });
  }

  /**
   * Obtiene resumen de caja para un período
   */
  static async obtenerResumen(fechaInicio: Date, fechaFin: Date) {
    if (!(fechaInicio instanceof Date) || !(fechaFin instanceof Date) ||
        isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      throw new Error('Fechas inválidas para el resumen de caja');
    }

    if (fechaInicio > fechaFin) {
      throw new Error('fechaInicio debe ser anterior o igual a fechaFin');
    }

    const auditorias = await prisma.cajaAudit.findMany({
      where: {
        fecha: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
    });

    const resumen = {
      totalVentas: auditorias.reduce((s: number, a: any) => s + Number(a.ventasEfectivo || 0), 0),
      totalGastos: auditorias.reduce((s: number, a: any) => s + Number(a.gastos || 0), 0),
      totalDiferencias: auditorias.reduce((s: number, a: any) => s + Math.abs(Number(a.diferencia || 0)), 0),
      cierres: auditorias.length,
      diferenciasDetectadas: auditorias.filter((a: any) => Number(a.diferencia || 0) !== 0).length,
    };

    return resumen;
  }
}