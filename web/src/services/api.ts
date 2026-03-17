import axios from 'axios';
const API_BASE_URL = 'http://localhost:3001/api';

export interface Product {
  id: string;
  codigo: string;
  name: string;
  type: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockInicial: number;
  gananciaUnitaria?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Inventario {
  id: string;
  fecha: string;
  totalVendido: number;
  ganancias: number;
  prestamo: number;
  deudaRestante: number;
  capital: number;
  items?: InventarioItem[];
}

export interface InventarioItem {
  id: string;
  productoNombre: string;
  entraron: number;
  quedaron: number;
  salieron: number;
  totalVendido: number;
  ganancia: number;
}

export const productService = {
  async getProducts(): Promise<Product[]> {
    const res = await axios.get(API_BASE_URL + '/products');
    return res.data;
  },
  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await axios.post(API_BASE_URL + '/products', data);
    return res.data;
  },
  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await axios.put(API_BASE_URL + '/products/' + id, data);
    return res.data;
  },
  async deleteProduct(id: string): Promise<void> {
    await axios.delete(API_BASE_URL + '/products/' + id);
  },
  async getGanancias(): Promise<any[]> {
    const res = await axios.get(API_BASE_URL + '/ganancias');
    return res.data;
  }
};

export const inventarioService = {
  async prepareInventario(): Promise<any[]> {
    const res = await axios.get(API_BASE_URL + '/inventario/prepare');
    return res.data;
  },
  async createInventario(data: { prestamo?: number; items: { productId: string; quedaron: number }[] }): Promise<Inventario> {
    const res = await axios.post(API_BASE_URL + '/inventario', data);
    return res.data;
  },
  async getAllInventarios(): Promise<Inventario[]> {
    const res = await axios.get(API_BASE_URL + '/inventario');
    return res.data;
  }
};
