import prisma from '../lib/prisma';

interface ClienteData {
  documento: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad?: string;
}

export class ClienteService {
  // Validar formato de documento (RUT/Cédula)
  private validateDocumento(documento: string): boolean {
    // Validación básica de documento (puede mejorar según normativas)
    return !!documento && documento.length >= 5 && /^[0-9\-]+$/.test(documento);
  }

  // Validar email
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async create(data: ClienteData) {
    // Validaciones
    if (!data.documento || !data.nombre || !data.email) {
      throw new Error('Documento, nombre y email son obligatorios');
    }

    if (!this.validateDocumento(data.documento)) {
      throw new Error('Formato de documento inválido');
    }

    if (!this.validateEmail(data.email)) {
      throw new Error('Email inválido');
    }

    // Validar que no exista cliente con el mismo documento
    const existente = await prisma.client.findUnique({
      where: {
        documento: data.documento,
      },
    });

    if (existente) {
      throw new Error('Ya existe un cliente con este documento');
    }

    try {
      const nombres = data.nombre.split(' ');
      const cliente = await prisma.client.create({
        data: {
          nombres: nombres[0],
          apellidos: nombres.slice(1).join(' ') || '',
          documento: data.documento,
          email: data.email,
          telefono: data.telefono,
          direccion: data.direccion,
          ciudad: data.ciudad,
        },
      });
      return cliente;
    } catch (error) {
      throw new Error('Error al crear cliente: ' + (error as Error).message);
    }
  }

  async getAll() {
    try {
      const clientes = await prisma.client.findMany();
      return clientes;
    } catch (error) {
      throw new Error('Error al obtener clientes');
    }
  }

  async getById(id: string) {
    try {
      const cliente = await prisma.client.findUnique({
        where: { id: parseInt(id) },
      });
      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }
      return cliente;
    } catch (error) {
      throw new Error('Error al obtener cliente');
    }
  }

  async update(id: string, data: Partial<ClienteData>) {
    // Validaciones si aplica
    if (data.email && !this.validateEmail(data.email)) {
      throw new Error('Email inválido');
    }

    if (data.documento && !this.validateDocumento(data.documento)) {
      throw new Error('Formato de documento inválido');
    }

    try {
      const nombres = data.nombre?.split(' ') || [];
      const cliente = await prisma.client.update({
        where: { id: parseInt(id) },
        data: {
          nombres: nombres[0],
          apellidos: nombres.slice(1).join(' '),
          documento: data.documento,
          email: data.email,
          telefono: data.telefono,
          direccion: data.direccion,
          ciudad: data.ciudad,
        },
      });
      return cliente;
    } catch (error) {
      throw new Error('Error al actualizar cliente');
    }
  }

  async delete(id: string) {
    try {
      await prisma.client.delete({
        where: { id: parseInt(id) },
      });
      return true;
    } catch (error) {
      throw new Error('Error al eliminar cliente');
    }
  }

  async updateEstado(id: string, estado: boolean) {
    try {
      const cliente = await prisma.client.update({
        where: { id: parseInt(id) },
        data: {
          estado: estado ? 'ACTIVO' : 'INACTIVO',
        },
      });
      return cliente;
    } catch (error) {
      throw new Error('Error al actualizar estado del cliente');
    }
  }
}
