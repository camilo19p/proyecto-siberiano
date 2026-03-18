import { z } from 'zod';

export const createProductSchema = z.object({
  codigo: z.string().min(1, 'Código es requerido'),
  name: z.string().min(1, 'Nombre es requerido'),
  type: z.union([z.literal('ron'), z.literal('cerveza')], {
    errorMap: () => ({ message: 'Tipo debe ser "ron" o "cerveza"' })
  }),
  precioCompra: z.number().min(0, 'Precio de compra debe ser >= 0'),
  precioVenta: z.number().min(0, 'Precio de venta debe ser >= 0'),
  stock: z.number().int().min(0, 'Stock debe ser entero >= 0'),
  stockInicial: z.number().int().min(0).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID es requerido')
});

export const typeParamSchema = z.object({
  type: z.union([z.literal('ron'), z.literal('cerveza')], {
    errorMap: () => ({ message: 'Tipo debe ser "ron" o "cerveza"' })
  })
});
