import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'siberiano-secret-key-2024';

export class AuthService {
  static async login(username: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (user.estado === 'INACTIVO') {
      throw new Error('Usuario inactivo');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Contraseña incorrecta');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        estado: user.estado
      }
    };
  }

  static async register(data: {
    name: string;
    username: string;
    password: string;
    role?: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        password: hashedPassword,
        role: data.role || 'VENDEDOR',
        estado: 'ACTIVO'
      }
    });

    return { id: user.id, username: user.username, role: user.role };
  }

  static verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET);
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
