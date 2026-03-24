import { Inventario, CreateInventarioRequest, PrepareInventarioResponse } from '../models/Inventario';
import prisma from '../lib/prisma';
import { z } from 'zod';

// Esquema de validación para items de inventario
const inventarioItemSchema = z.object({
  productId: z.number().int().positive(),
  entraron: z.number().int().min(0),
  salieron: z.number().int().min(0),
  quedaron: z.number().int().min(0),
}).refine(
  (data) => data.quedaron <= data.entraron,
  { message: 'Stock final no puede ser mayor a stock entrada' }
);

export class InventarioService {
  // Preparar inventario - obtener productos con su stock actual como stockInicial
  async prepareInventario(): Promise<PrepareInventarioResponse[]> {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });

    return products.map(p => ({
      id: p.id.toString(),
      codigo: p.codigo,
      name: p.name,
      precioCompra: p.precioCompra,
      precioVenta: p.precioVenta,
      stockInicial: p.stock,
      stockMinimo: p.stockMinimo,
    }));
  }

  /**
   * Valida que el inventario cumpla reglas de negocio
   */
  async validarInventario(items: any[]): Promise<{ valido: boolean; errores: string[] }> {
    const errores: string[] = [];

    for (const item of items) {
      // Validar esquema Zod
      try {
        inventarioItemSchema.parse(item);
      } catch (error: any) {
        errores.push(`Producto ${item.productId}: ${error.errors?.[0]?.message || error.message}`);
        continue;
      }

      // Obtener producto para validar stock mínimo
      const producto = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!producto) {
        errores.push(`Producto ${item.productId} no encontrado`);
        continue;
      }

      // Alertar si stock final es crítico (< 5)
      if (item.quedaron < 5) {
        errores.push(`⚠️ Producto ${producto.name}: Stock Crítico (${item.quedaron} unidades)`);
      }
    }

    return { valido: errores.length === 0, errores };
  }

  // Obtener todos los inventarios
  async getAllInventarios(): Promise<Inventario[]> {
    const inventarios = await prisma.inventario.findMany({
      orderBy: { fecha: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return inventarios.map(inv => ({
      id: inv.id.toString(),
      fecha: inv.fecha.toISOString(),
      totalVendido: inv.totalVendido,
      ganancias: inv.ganancias,
      prestamo: inv.prestamo,
      deudaRestante: inv.deudaRestante,
      capital: inv.capital,
      observaciones: inv.observaciones || undefined,
      createdAt: inv.createdAt.toISOString(),
      items: inv.items.map((item: any) => ({
        id: item.id.toString(),
        inventarioId: item.inventarioId.toString(),
        productId: item.productId.toString(),
        productoNombre: item.product?.name || '',
        entraron: item.entraron ?? 0,
        quedaron: item.quedaron ?? 0,
        salieron: item.salieron ?? 0,
        totalVendido: item.totalVendido ?? 0,
        ganancia: item.ganancia ?? 0
      }))
    }));
  }

  // Crear un nuevo inventario
  async createInventario(data: CreateInventarioRequest): Promise<Inventario> {
    // Obtener productos para calcular
    const productIds = data.items.map(item => parseInt(item.productId));
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    // Calcular totales
    let totalVendido = 0;
    let ganancias = 0;
    const inventarioItems = data.items.map(item => {
      const product = productMap.get(parseInt(item.productId));
      if (!product) return null;

      const stockActual = product.stock;
      const quedaron = item.quedaron;
      const salidas = Math.max(0, stockActual - quedaron);
      const ventaTotal = product.precioVenta * salidas;
      const gananciaTotal = (product.precioVenta - product.precioCompra) * salidas;

      totalVendido += ventaTotal;
      ganancias += gananciaTotal;

      return {
        productId: parseInt(item.productId),
        entraron: stockActual,
        quedaron,
        salieron: salidas,
        totalVendido: ventaTotal,
        ganancia: gananciaTotal
      };
    }).filter(Boolean);

    const prestamo = data.prestamo || 0;
    const deudaRestante = prestamo > 0 ? Math.max(0, prestamo - totalVendido) : 0;
    const capital = prestamo > 0 ? (deudaRestante > 0 ? 0 : totalVendido - prestamo) : totalVendido;

    // Obtener primer producto para el campo requerido
    const firstProductId = productIds[0] || 0;
    
    // Calcular cantidad total
    let totalCantidad = 0;
    data.items.forEach(item => {
      const product = productMap.get(parseInt(item.productId));
      if (product) {
        totalCantidad += product.stock - item.quedaron;
      }
    });

    // Crear inventario
    const inventario = await prisma.inventario.create({
      data: {
        fecha: new Date(),
        tipo: 'AJUSTE',
        cantidad: totalCantidad,
        usuarioId: 1,
        productoId: firstProductId,
        totalVendido,
        ganancias,
        prestamo,
        deudaRestante,
        capital,
        observaciones: data.observaciones,
        items: {
          create: inventarioItems.map(item => ({
            productId: item!.productId,
            entraron: item!.entraron,
            quedaron: item!.quedaron,
            salieron: item!.salieron,
            totalVendido: item!.totalVendido,
            ganancia: item!.ganancia
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Actualizar stock de productos
    for (const item of data.items) {
      await prisma.product.update({
        where: { id: parseInt(item.productId) },
        data: { stock: item.quedaron }
      });
    }

    return {
      id: inventario.id.toString(),
      fecha: inventario.fecha.toISOString(),
      totalVendido: inventario.totalVendido,
      ganancias: inventario.ganancias,
      prestamo: inventario.prestamo,
      deudaRestante: inventario.deudaRestante,
      capital: inventario.capital,
      observaciones: inventario.observaciones || undefined,
      createdAt: inventario.createdAt.toISOString()
    };
  }

  // Eliminar inventario
  async deleteInventario(id: number): Promise<void> {
    await prisma.inventario.delete({
      where: { id }
    });
  }
}
