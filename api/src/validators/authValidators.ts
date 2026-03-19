import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Usuario es requerido'),
  password: z.string().min(1, 'Contraseña es requerida'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Usuario debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(1, 'Nombre es requerido'),
  role: z.string().optional(),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
