import { Product, CreateProductRequest, UpdateProductRequest } from '../models/Product';
import prisma from '../lib/prisma';

export class ProductService {
  // Obtener todos los productos
  async getAllProducts(): Promise<Product[]> {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return products.map(p => ({
      id: p.id.toString(),
      name: p.name,
      type: p.type as 'ron' | 'cerveza',
      price: p.price,
      stock: p.stock,
      description: `${p.name} - ${p.type}`,
      category: 'Licores',
      brand: p.name,
      alcoholContent: 0,
      imageUrl: '',
      minStock: 5,
      isActive: true,
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
      name: product.name,
      type: product.type as 'ron' | 'cerveza',
      price: product.price,
      stock: product.stock,
      description: `${product.name} - ${product.type}`,
      category: 'Licores',
      brand: product.name,
      alcoholContent: 0,
      imageUrl: '',
      minStock: 5,
      isActive: true,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }

  // Crear nuevo producto
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    const newProduct = await prisma.product.create({
      data: {
        name: productData.name,
        type: productData.type,
        price: productData.price,
        stock: productData.stock
      }
    });

    return {
      id: newProduct.id.toString(),
      name: newProduct.name,
      type: newProduct.type as 'ron' | 'cerveza',
      price: newProduct.price,
      stock: newProduct.stock,
      description: `${newProduct.name} - ${newProduct.type}`,
      category: 'Licores',
      brand: newProduct.name,
      alcoholContent: 0,
      imageUrl: '',
      minStock: 5,
      isActive: true,
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
          name: productData.name,
          type: productData.type,
          price: productData.price,
          stock: productData.stock
        }
      });

      return {
        id: product.id.toString(),
        name: product.name,
        type: product.type as 'ron' | 'cerveza',
        price: product.price,
        stock: product.stock,
        description: `${product.name} - ${product.type}`,
        category: 'Licores',
        brand: product.name,
        alcoholContent: 0,
        imageUrl: '',
        minStock: 5,
        isActive: true,
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

    return products.map(p => ({
      id: p.id.toString(),
      name: p.name,
      type: p.type as 'ron' | 'cerveza',
      price: p.price,
      stock: p.stock,
      description: `${p.name} - ${p.type}`,
      category: 'Licores',
      brand: p.name,
      alcoholContent: 0,
      imageUrl: '',
      minStock: 5,
      isActive: true,
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

    return products.map(p => ({
      id: p.id.toString(),
      name: p.name,
      type: p.type as 'ron' | 'cerveza',
      price: p.price,
      stock: p.stock,
      description: `${p.name} - ${p.type}`,
      category: 'Licores',
      brand: p.name,
      alcoholContent: 0,
      imageUrl: '',
      minStock: 5,
      isActive: true,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));
  }
}