import { z } from 'zod';

export const RegisterDtoSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(
      /[^a-zA-Z0-9]/,
      'Password must contain at least one special character',
    ),
});

export const RefreshTokenDtoSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const LoginDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenDtoSchema>;
export type RegisterDto = z.infer<typeof RegisterDtoSchema>;
