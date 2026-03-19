export interface Inventario {
  id: string;
  fecha: string;
  totalVendido: number;
  ganancias: number;
  prestamo: number;
  deudaRestante: number;
  capital: number;
  observaciones?: string;
  createdAt: string;
  items?: InventarioItem[];
}

export interface InventarioItem {
  id: string;
  inventarioId: string;
  productId: string;
  productoNombre?: string;
  entraron: number;
  quedaron: number;
  salieron: number;
  totalVendido: number;
  ganancia: number;
}

export interface CreateInventarioRequest {
  prestamo?: number;
  observaciones?: string;
  items: {
    productId: string;
    quedaron: number;
  }[];
}

export interface PrepareInventarioResponse {
  id: string;
  codigo: string;
  name: string;
  precioCompra: number;
  precioVenta: number;
  stockInicial: number;
}
