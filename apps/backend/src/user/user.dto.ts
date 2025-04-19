import { z } from 'zod';

export const CreateUserSchema = z.object({
  avatarUrl: z.string().url().optional(),
  bio: z.string().optional(),
  email: z.string().email(),
  name: z.string().optional(),
  password: z.string().min(6),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export const UpdateProfileSchema = z.object({
  avatarUrl: z.string().url().optional(),
  bio: z.string().optional(),
  name: z.string().optional(),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
