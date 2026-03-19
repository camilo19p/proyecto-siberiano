import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotaService {
  async getAllNotas(): Promise<any[]> {
    return await prisma.nota.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getNotasByFecha(fecha: string): Promise<any[]> {
    return await prisma.nota.findMany({
      where: { fecha },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createNota(data: { fecha: string; titulo: string; contenido: string; color?: string }): Promise<any> {
    return await prisma.nota.create({
      data: {
        fecha: data.fecha,
        titulo: data.titulo,
        contenido: data.contenido,
        color: data.color || '#fef3c7'
      }
    });
  }

  async deleteNota(id: number): Promise<any> {
    return await prisma.nota.delete({
      where: { id }
    });
  }
}
