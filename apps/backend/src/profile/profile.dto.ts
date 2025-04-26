import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  avatarUrl: z.string().url().optional(),
  bio: z.string().optional(),
  name: z.string().optional(),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
