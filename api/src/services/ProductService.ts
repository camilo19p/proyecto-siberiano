import { Product, CreateProductRequest, UpdateProductRequest } from '../models/Product';
import prisma from '../lib/prisma';

export class ProductService {
  // Obtener todos los productos
  async getAllProducts(): Promise<Product[]> {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return products.map((p: any) => ({
      id: p.id.toString(),
      codigo: p.codigo,
      name: p.name,
      type: p.type as 'ron' | 'cerveza',
      precioCompra: p.precioCompra,
      precioVenta: p.precioVenta,
      stock: p.stock,
      stockInicial: p.stockInicial,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));
  }

  // Obtener producto por ID
  async getProductById(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) return null;

    return {
      id: product.id.toString(),
      codigo: product.codigo,
      name: product.name,
      type: product.type as 'ron' | 'cerveza',
      precioCompra: product.precioCompra,
      precioVenta: product.precioVenta,
      stock: product.stock,
      stockInicial: product.stockInicial,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }

  // Crear nuevo producto
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    // Validar que precios no sean negativos
    if (productData.precioCompra < 0 || productData.precioVenta < 0) {
      throw new Error('Los precios no pueden ser negativos');
    }

    if (productData.precioVenta < productData.precioCompra) {
      throw new Error('Precio de venta debe ser >= precio de compra');
    }

    // Usar transacción para crear producto
    const newProduct = await prisma.$transaction(async (tx) => {
      return await tx.product.create({
        data: {
          codigo: productData.codigo,
          name: productData.name,
          type: productData.type,
          categoria: productData.type || 'GENERAL',
          precioCompra: productData.precioCompra,
          precioVenta: productData.precioVenta,
          stock: productData.stock,
          stockInicial: productData.stock ?? 0,
          imagen: '',
          descripcion: ''
        }
      });
    });

    return {
      id: newProduct.id.toString(),
      codigo: newProduct.codigo,
      name: newProduct.name,
      type: newProduct.type as 'ron' | 'cerveza',
      precioCompra: newProduct.precioCompra,
      precioVenta: newProduct.precioVenta,
      stock: newProduct.stock,
      stockInicial: newProduct.stockInicial,
      createdAt: newProduct.createdAt,
      updatedAt: newProduct.updatedAt
    };
  }

  // Actualizar producto
  async updateProduct(id: string, productData: UpdateProductRequest): Promise<Product | null> {
    try {
      const product = await prisma.product.update({
        where: { id: parseInt(id) },
        data: {
          codigo: productData.codigo,
          name: productData.name,
          type: productData.type,
          precioCompra: productData.precioCompra,
          precioVenta: productData.precioVenta,
          stock: productData.stock,
          stockInicial: productData.stockInicial
        }
      });

      return {
        id: product.id.toString(),
        codigo: product.codigo,
        name: product.name,
        type: product.type as 'ron' | 'cerveza',
        precioCompra: product.precioCompra,
        precioVenta: product.precioVenta,
        stock: product.stock,
        stockInicial: product.stockInicial,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    } catch (error) {
      return null;
    }
  }

  // Eliminar producto
  async deleteProduct(id: string): Promise<boolean> {
    try {
      await prisma.product.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Obtener productos por tipo
  async getProductsByType(type: string): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: { type },
      orderBy: { createdAt: 'desc' }
    });

    return products.map((p: any) => ({
      id: p.id.toString(),
      codigo: p.codigo,
      name: p.name,
      type: p.type as 'ron' | 'cerveza',
      precioCompra: p.precioCompra,
      precioVenta: p.precioVenta,
      stock: p.stock,
      stockInicial: p.stockInicial,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));
  }

  // Verificar stock bajo
  async getLowStockProducts(): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: {
        stock: { lte: 5 }
      },
      orderBy: { stock: 'asc' }
    });

    return products.map((p: any) => ({
      id: p.id.toString(),
      codigo: p.codigo,
      name: p.name,
      type: p.type as 'ron' | 'cerveza',
      precioCompra: p.precioCompra,
      precioVenta: p.precioVenta,
      stock: p.stock,
      stockInicial: p.stockInicial,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));
  }

  // Ajustar stock (sumar o restar cantidad)
  async adjustStock(id: string, adjustment: number, reason?: string): Promise<Product | null> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) }
      });

      if (!product) {
        throw new Error('Producto no encontrado');
      }

      const newStock = Math.max(0, product.stock + adjustment);

      const updated = await prisma.product.update({
        where: { id: parseInt(id) },
        data: { stock: newStock }
      });

      return {
        id: updated.id.toString(),
        codigo: updated.codigo,
        name: updated.name,
        type: updated.type as 'ron' | 'cerveza',
        precioCompra: updated.precioCompra,
        precioVenta: updated.precioVenta,
        stock: updated.stock,
        stockInicial: updated.stockInicial,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt
      };
    } catch (error) {
      throw new Error('Error al ajustar stock: ' + (error as Error).message);
    }
  }
}