import { z } from 'zod';

// Esquema base (ZodObject) — .partial() se puede llamar sobre este
const productBaseSchema = z.object({
  codigo: z.string().min(1, 'Código es requerido'),
  name: z.string().min(1, 'Nombre es requerido'),
  type: z.string().min(1, 'Tipo es requerido'),
  precioCompra: z.number().min(0.01, 'Precio mínimo 0.01'),
  precioVenta: z.number().min(0.01, 'Precio mínimo 0.01'),
  stock: z.number().int().min(0, 'Stock no puede ser negativo'),
  stockInicial: z.number().int().min(0, 'Stock inicial no puede ser negativo').optional(),
  stockMinimo: z.number().int().min(0, 'Stock mínimo no puede ser negativo').optional(),
});

// Esquema para creación (aplica la validación de relación entre precios)
export const createProductSchema = productBaseSchema.refine(
  (data) => data.precioVenta >= data.precioCompra,
  { message: 'Precio de venta debe ser >= precio de compra', path: ['precioVenta'] }
);

// Esquema para actualización: todos los campos opcionales. Validación de precios solo si ambos están presentes
export const updateProductSchema = productBaseSchema.partial().refine(
  (data) => {
    if (data.precioVenta === undefined || data.precioCompra === undefined) return true;
    return data.precioVenta >= data.precioCompra;
  },
  { message: 'Precio de venta debe ser >= precio de compra', path: ['precioVenta'] }
);

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
