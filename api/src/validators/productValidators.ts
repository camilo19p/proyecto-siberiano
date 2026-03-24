import { z } from 'zod';

export const createProductSchema = z.object({
  codigo: z.string().min(1, 'Código es requerido'),
  name: z.string().min(1, 'Nombre es requerido'),
  type: z.string().min(1, 'Tipo es requerido'),
  precioCompra: z.number().positive('Precio de compra debe ser positivo').min(0.01, 'Precio mínimo 0.01'),
  precioVenta: z.number().positive('Precio de venta debe ser positivo').min(0.01, 'Precio mínimo 0.01'),
  stock: z.number().int('Stock debe ser entero').min(0, 'Stock no puede ser negativo'),
  stockInicial: z.number().int('Stock inicial debe ser entero').min(0).optional(),
  stockMinimo: z.number().int('Stock mínimo debe ser entero').min(0).optional(),
}).refine(
  (data) => data.precioVenta >= data.precioCompra,
  { message: 'Precio de venta debe ser >= precio de compra', path: ['precioVenta'] }
);

export const updateProductSchema = createProductSchema.partial();

export const inventarioUpdateSchema = z.object({
  entraron: z.number().int().min(0, 'Cantidad entrada debe ser >= 0'),
  salieron: z.number().int().min(0, 'Cantidad salida debe ser >= 0'),
  quedaron: z.number().int().min(0, 'Stock final debe ser >= 0'),
}).refine(
  (data) => data.quedaron <= data.entraron,
  { message: 'Stock final no puede ser mayor a stock entrada', path: ['quedaron'] }
);

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID es requerido')
});

export const typeParamSchema = z.object({
  type: z.string().min(1, 'Tipo es requerido')
});
