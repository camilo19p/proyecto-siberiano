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
    const newProduct = await prisma.product.create({
      data: {
        codigo: productData.codigo,
        name: productData.name,
        type: productData.type,
        precioCompra: productData.precioCompra,
        precioVenta: productData.precioVenta,
        stock: productData.stock,
        stockInicial: productData.stockInicial ?? productData.stock
      }
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
}