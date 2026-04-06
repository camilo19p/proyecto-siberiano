import axios from 'axios';

// Usar VITE_API_URL si está disponible, sino usar /api como fallback
// Si VITE_API_URL es una URL completa (ej: http://localhost:3001), agregar /api
let API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
if (API_BASE_URL && !API_BASE_URL.includes('/api', API_BASE_URL.lastIndexOf('/'))) {
  // Si no termina con /api, agregarlo
  API_BASE_URL = API_BASE_URL.endsWith('/') ? API_BASE_URL + 'api' : API_BASE_URL + '/api';
}

// Create a shared axios instance with a reasonable timeout.
// If the backend is not running, requests will fail fast instead of hanging indefinitely.
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000  // Aumentado a 10 segundos
});

// Interceptor de request - Añadir token de auth desde localStorage
api.interceptors.request.use((config) => {
  try {
    // Intentar obtener token de diferentes keys
    let token = localStorage.getItem('authToken') || 
                localStorage.getItem('token') ||
                localStorage.getItem('auth_token');
    
    if (token && token.trim()) {
      if (!config.headers) (config as any).headers = {};
      // No sobrescribir si ya está presente
      if (!(config.headers as any).Authorization && !(config.headers as any).authorization) {
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }
  } catch (e) {
    // ignorar (por ejemplo si localStorage no está disponible)
    console.warn('Error obteniendo token:', e);
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor de response - Manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si recibimos 401 o 403, limpiar tokens
    if (error.response?.status === 401 || error.response?.status === 403) {
      try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
      } catch (e) {
        console.warn('Error limpiando tokens:', e);
      }
    }
    return Promise.reject(error);
  }
);

function toErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as any;
    return (
      data?.error ||
      data?.message ||
      err.message ||
      'Error de red al comunicar con el servidor'
    );
  }
  if (err instanceof Error) return err.message;
  return 'Ocurrio un error inesperado';
}

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
    const res = await api.get('/products');
    return res.data;
  },
  async createProduct(data: Partial<Product>): Promise<Product> {
    try {
      const res = await api.post('/products', data);
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    try {
      const res = await api.put('/products/' + id, data);
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async deleteProduct(id: string): Promise<void> {
    try {
      await api.delete('/products/' + id);
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async getGanancias(): Promise<any[]> {
    try {
      const res = await api.get('/ganancias');
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  }
};

export const inventarioService = {
  async prepareInventario(): Promise<any[]> {
    try {
      const res = await api.get('/inventario/prepare');
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async createInventario(data: { prestamo?: number; items: { productId: string; quedaron: number }[] }): Promise<Inventario> {
    try {
      const res = await api.post('/inventario', data);
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async getAllInventarios(): Promise<Inventario[]> {
    try {
      const res = await api.get('/inventario');
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  }
};

export interface Cliente {
  id: string;
  nombres: string;
  apellidos: string;
  documento: string;
  tipoDocumento: 'CC' | 'NIT' | 'CE' | 'PASAPORTE';
  telefono?: string;
  email?: string;
  ciudad?: string;
  direccion?: string;
  barrio?: string;
  cupo: number;
  saldo: number;
  estado: 'ACTIVO' | 'INACTIVO';
  cupoUtilizado?: number;
}

const CLIENTES_KEY = 'clientes';

export const clienteService = {
  async getClientes(): Promise<Cliente[]> {
    try {
      const res = await api.get('/clientes');
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async createCliente(cliente: Omit<Cliente, 'id' | 'estado'> & { estado?: Cliente['estado'] }): Promise<Cliente> {
    try {
      const res = await api.post('/clientes', {
        documento: cliente.documento,
        nombre: `${cliente.nombres} ${cliente.apellidos}`,
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || '',
        ciudad: cliente.ciudad || ''
      });
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async updateCliente(id: string, data: Partial<Omit<Cliente, 'id'>>): Promise<Cliente | null> {
    try {
      const res = await api.put(`/clientes/${id}`, {
        documento: data.documento,
        nombre: data.nombres,
        email: data.email,
        telefono: data.telefono,
        direccion: data.direccion
      });
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async updateEstado(id: string, estado: boolean): Promise<Cliente> {
    try {
      const res = await api.patch(`/clientes/${id}/estado`, { estado });
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async deleteCliente(id: string): Promise<void> {
    try {
      await api.delete(`/clientes/${id}`);
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  }
};

export interface Factura {
  id: number;
  numero: number;
  tipo: string;
  estado: string;
  fecha: string;
  metodoPago: string;
  subtotal: number;
  total: number;
  utilidad: number;
  credito: boolean;
  descuento: number;
  clienteId?: number;
  userId?: number;
  items?: Array<{
    id: number;
    productoId: number;
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
    precioCompra: number;
    subtotal: number;
  }>;
}

export const facturaService = {
  async getFacturas(): Promise<Factura[]> {
    try {
      const res = await api.get('/facturas');
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async createFactura(data: any): Promise<Factura> {
    try {
      const res = await api.post('/facturas', data);
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async updateFactura(id: string, data: Partial<Factura>): Promise<Factura> {
    try {
      const res = await api.put(`/facturas/${id}`, data);
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async deleteFactura(id: string): Promise<void> {
    try {
      await api.delete(`/facturas/${id}`);
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  }
};

export interface CuentaPorPagar {
  id: string;
  proveedor: string;
  monto: number;
  monto_pagado?: number;
  fecha_vencimiento: string;
  estado: string;
  descripcion?: string;
}

export const cuentasService = {
  async getCuentas(): Promise<CuentaPorPagar[]> {
    try {
      const res = await api.get('/payables');
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async createCuenta(data: Omit<CuentaPorPagar, 'id'>): Promise<CuentaPorPagar> {
    try {
      const res = await api.post('/payables', data);
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async updateCuenta(id: string, data: Partial<CuentaPorPagar>): Promise<CuentaPorPagar> {
    try {
      const res = await api.put(`/payables/${id}`, data);
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async registrarPago(id: string, monto: number): Promise<any> {
    try {
      const res = await api.post(`/payables/${id}/payment`, { monto });
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async deleteCuenta(id: string): Promise<void> {
    try {
      await api.delete(`/payables/${id}`);
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  }
};

export interface Usuario {
  id: string;
  username: string;
  email: string;
  nombre: string;
  rol: string;
  activo: boolean;
}

export const usuarioService = {
  async getUsuarios(): Promise<Usuario[]> {
    try {
      const res = await api.get('/usuarios');
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async createUsuario(data: Omit<Usuario, 'id'> & { password: string }): Promise<Usuario> {
    try {
      const res = await api.post('/usuarios', data);
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async updateRol(id: string, rol: string): Promise<Usuario> {
    try {
      const res = await api.put(`/usuarios/${id}/rol`, { rol });
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async updateEstado(id: string, activo: boolean): Promise<Usuario> {
    try {
      const res = await api.patch(`/usuarios/${id}/estado`, { activo });
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  }
};

export interface CierreCaja {
  id: string;
  vendedor_id: string;
  fecha: string;
  moneda_fisica: number;
  transferencias: number;
  cheques: number;
  total_esperado: number;
  diferencia?: number;
}

export interface Proveedor {
  id: string;
  nombre: string;
  nit: string;
  telefono: string;
  email?: string;
  ciudad?: string;
  direccion: string;
  deudaActual: number;
  diasEnMora: number;
  estado: 'ACTIVO' | 'INACTIVO';
  createdAt?: string;
  updatedAt?: string;
}

export const cajaService = {
  async getCierres(vendedor_id?: string): Promise<CierreCaja[]> {
    try {
      const res = await api.get('/cajas', {
        params: vendedor_id ? { vendedor_id } : {}
      });
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async createCierre(data: Omit<CierreCaja, 'id'>): Promise<CierreCaja> {
    try {
      const res = await api.post('/cajas', data);
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async registrarMovimiento(id: string, data: { tipo: string; monto: number; descripcion: string }): Promise<any> {
    try {
      const res = await api.post(`/cajas/${id}/movimientos`, data);
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async cerrarCaja(id: string, monto_final: number): Promise<CierreCaja> {
    try {
      const res = await api.patch(`/cajas/${id}/close`, { monto_final });
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  }
};

export const proveedorService = {
  async getProveedores(): Promise<Proveedor[]> {
    try {
      const res = await api.get('/proveedores');
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async createProveedor(proveedor: Omit<Proveedor, 'id' | 'estado' | 'createdAt' | 'updatedAt'> & { estado?: Proveedor['estado'] }): Promise<Proveedor> {
    try {
      const res = await api.post('/proveedores', {
        nombre: proveedor.nombre,
        nit: proveedor.nit,
        telefono: proveedor.telefono,
        email: proveedor.email || '',
        ciudad: proveedor.ciudad || '',
        direccion: proveedor.direccion,
        deudaActual: proveedor.deudaActual || 0,
        diasEnMora: proveedor.diasEnMora || 0
      });
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async updateProveedor(id: string, data: Partial<Omit<Proveedor, 'id'>>): Promise<Proveedor> {
    try {
      const res = await api.put(`/proveedores/${id}`, {
        nombre: data.nombre,
        nit: data.nit,
        telefono: data.telefono,
        email: data.email,
        ciudad: data.ciudad,
        direccion: data.direccion,
        deudaActual: data.deudaActual,
        diasEnMora: data.diasEnMora
      });
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async updateEstado(id: string, estado: string): Promise<Proveedor> {
    try {
      const res = await api.patch(`/proveedores/${id}/estado`, { estado });
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async registrarPago(id: string, monto: number): Promise<Proveedor> {
    try {
      const res = await api.post(`/proveedores/${id}/pago`, { monto });
      return res.data;
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },
  async deleteProveedor(id: string): Promise<void> {
    try {
      await api.delete(`/proveedores/${id}`);
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  }
};

export const apiErrors = { toErrorMessage };
