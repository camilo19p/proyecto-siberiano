export interface Product {
  id: string;
  codigo: string;
  name: string;
  type: 'ron' | 'cerveza';
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockInicial: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductRequest {
  codigo: string;
  name: string;
  type: 'ron' | 'cerveza';
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockInicial?: number;
}

export interface UpdateProductRequest {
  codigo?: string;
  name?: string;
  type?: 'ron' | 'cerveza';
  precioCompra?: number;
  precioVenta?: number;
  stock?: number;
  stockInicial?: number;
}
