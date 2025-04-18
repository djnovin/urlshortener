import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),

  // Optional profile info
  name: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().optional(),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
