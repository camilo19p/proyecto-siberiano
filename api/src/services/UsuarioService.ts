import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

interface UsuarioData {
  username: string;
  email: string;
  password: string;
  nombre: string;
  rol: string;
}

export class UsuarioService {
  async create(data: UsuarioData) {
    if (!data.username || !data.password) {
      throw new Error('Username y password son obligatorios');
    }

    // Validar que no exista usuario con el mismo username
    const existe = await prisma.user.findUnique({
      where: {
        username: data.username,
      },
    });

    if (existe) {
      throw new Error('Username ya existe');
    }

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const usuario = await prisma.user.create({
        data: {
          username: data.username,
          password: hashedPassword,
          name: data.nombre,
          role: data.rol || 'VENDEDOR',
          estado: 'ACTIVO',
        },
      });
      return usuario;
    } catch (error) {
      throw new Error('Error al crear usuario: ' + (error as Error).message);
    }
  }

  async getAll() {
    try {
      const usuarios = await prisma.user.findMany();
      return usuarios;
    } catch (error) {
      throw new Error('Error al obtener usuarios');
    }
  }

  async getByUsername(username: string) {
    try {
      const usuario = await prisma.user.findUnique({
        where: { username },
      });
      return usuario;
    } catch (error) {
      throw new Error('Usuario no encontrado');
    }
  }

  async updateRol(id: string, rol: string) {
    const rolesValidos = ['admin', 'vendedor', 'contador', 'gerente'];
    if (!rolesValidos.includes(rol)) {
      throw new Error('Rol no válido');
    }

    try {
      const usuario = await prisma.user.update({
        where: { id: parseInt(id) },
        data: {
          role: rol,
        },
      });
      return usuario;
    } catch (error) {
      throw new Error('Error al actualizar rol');
    }
  }

  async updateEstado(id: string, activo: boolean) {
    try {
      const usuario = await prisma.user.update({
        where: { id: parseInt(id) },
        data: {
          estado: activo ? 'ACTIVO' : 'INACTIVO',
        },
      });
      return usuario;
    } catch (error) {
      throw new Error('Error al actualizar estado del usuario');
    }
  }

  async delete(id: string) {
    try {
      await prisma.user.delete({
        where: { id: parseInt(id) },
      });
      return true;
    } catch (error) {
      throw new Error('Error al eliminar usuario');
    }
  }
}
