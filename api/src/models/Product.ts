export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  type: 'ron' | 'cerveza';
  brand: string;
  alcoholContent?: number;
  imageUrl?: string;
  minStock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  type: 'ron' | 'cerveza';
  brand: string;
  alcoholContent?: number;
  imageUrl?: string;
  minStock: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  type?: 'ron' | 'cerveza';
  brand?: string;
  alcoholContent?: number;
  imageUrl?: string;
  minStock?: number;
  isActive?: boolean;
}