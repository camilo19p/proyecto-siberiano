import { Inventario, InventarioItem, CreateInventarioRequest, PrepareInventarioResponse } from '../models/Inventario';
import prisma from '../lib/prisma';

export class InventarioService {
  // Preparar inventario - obtener productos con su stock inicial
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
      stockInicial: p.stockInicial
    }));
  }

  // Obtener todos los inventarios
  async getAllInventarios(): Promise<Inventario[]> {
    const inventarios = await prisma.inventario.findMany({
      orderBy: { fecha: 'desc' },
      include: {
        items: {
          include: {
            producto: true
          }
        }
      }
    });

    return inventarios.map(inv => ({
      id: inv.id.toString(),
      fecha: inv.fecha,
      totalVendido: inv.totalVendido,
      ganancias: inv.ganancias,
      prestamo: inv.prestamo,
      deudaRestante: inv.deudaRestante,
      capital: inv.capital,
      observaciones: inv.observaciones || undefined,
      createdAt: inv.createdAt,
      items: inv.items.map(item => ({
        id: item.id.toString(),
        inventarioId: item.inventarioId.toString(),
        productId: item.productId.toString(),
        productoNombre: item.producto?.name,
        entraron: item.entraron,
        quedaron: item.quedaron,
        salieron: item.salieron,
        totalVendido: item.totalVendido,
        ganancia: item.ganancia
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

      const stockInicial = product.stockInicial;
      const quedaron = item.quedaron;
      const salieron = stockInicial - quedaron;
      const ventaTotal = product.precioVenta * salieron;
      const gananciaTotal = (product.precioVenta - product.precioCompra) * salieron;

      totalVendido += ventaTotal;
      ganancias += gananciaTotal;

      return {
        productId: parseInt(item.productId),
        entraron: stockInicial,
        quedaron,
        salieron,
        totalVendido: ventaTotal,
        ganancia: gananciaTotal
      };
    }).filter(Boolean);

    const prestamo = data.prestamo || 0;
    const deudaRestante = prestamo > 0 ? Math.max(0, prestamo - totalVendido) : 0;
    const capital = prestamo > 0 ? (deudaRestante > 0 ? 0 : totalVendido - prestamo) : totalVendido;

    // Crear inventario en transacción
    const inventario = await prisma.inventario.create({
      data: {
        fecha: new Date(),
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
            producto: true
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
      fecha: inventario.fecha,
      totalVendido: inventario.totalVendido,
      ganancias: inventario.ganancias,
      prestamo: inventario.prestamo,
      deudaRestante: inventario.deudaRestante,
      capital: inventario.capital,
      observaciones: inventario.observaciones || undefined,
      createdAt: inventario.createdAt,
      items: inventario.items.map(item => ({
        id: item.id.toString(),
        inventarioId: item.inventarioId.toString(),
        productId: item.productId.toString(),
        productoNombre: item.producto?.name,
        entraron: item.entraron,
        quedaron: item.quedaron,
        salieron: item.salieron,
        totalVendido: item.totalVendido,
        ganancia: item.ganancia
      }))
    };
  }
}
