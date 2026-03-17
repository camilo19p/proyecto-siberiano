import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  description: z.string().optional().nullable(),
  price: z.number().positive('Precio debe ser > 0'),
  stock: z.number().int().nonnegative('Stock debe ser entero >= 0'),
  category: z.string().optional(),
  type: z.union([z.literal('ron'), z.literal('cerveza')]),
  brand: z.string().optional(),
  alcoholContent: z.number().optional(),
  imageUrl: z.string().optional(),
  minStock: z.number().int().nonnegative().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const idParamSchema = z.object({
  id: z.string().min(1)
});

export const typeParamSchema = z.object({
  type: z.union([z.literal('ron'), z.literal('cerveza')])
});
