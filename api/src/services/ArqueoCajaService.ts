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

    // Calcular saldo esperado: (Ventas Efectivo + Base) - Gastos
    const saldoEsperado = (validated.ventasEfectivo + validated.base) - validated.gastos;
    const diferencia = validated.saldoReal - saldoEsperado;

    // Guardar auditoría
    const auditoria = await prisma.cajaAudit.create({
      data: {
        usuarioId: validated.usuarioId,
        ventasEfectivo: validated.ventasEfectivo,
        base: validated.base,
        gastos: validated.gastos,
        saldoEsperado,
        saldoReal: validated.saldoReal,
        diferencia,
        observaciones: validated.observaciones,
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
  }

  /**
   * Obtiene historial de auditoría de caja
   */
  static async obtenerHistorial(limit: number = 10) {
    return await prisma.cajaAudit.findMany({
      orderBy: { fecha: 'desc' },
      take: limit,
    });
  }

  /**
   * Obtiene resumen de caja para un período
   */
  static async obtenerResumen(fechaInicio: Date, fechaFin: Date) {
    const auditorias = await prisma.cajaAudit.findMany({
      where: {
        fecha: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
    });

    const resumen = {
      totalVentas: auditorias.reduce((s: number, a: any) => s + a.ventasEfectivo, 0),
      totalGastos: auditorias.reduce((s: number, a: any) => s + a.gastos, 0),
      totalDiferencias: auditorias.reduce((s: number, a: any) => s + Math.abs(a.diferencia), 0),
      cierres: auditorias.length,
      diferenciasDetectadas: auditorias.filter((a: any) => a.diferencia !== 0).length,
    };

    return resumen;
  }
}
