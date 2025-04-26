import { z } from 'zod';

const UTMFields = z.object({
  source: z.string().optional(),
  medium: z.string().optional(),
  campaign: z.string().optional(),
  term: z.string().optional(),
  content: z.string().optional(),
  ref: z.string().optional(),
});

export const CreateUrlSchema = z.object({
  originalUrl: z.string().url(),
  expiredAt: z.coerce.date().optional(),
  utm: UTMFields.optional(),
});

export type CreateUrlDto = z.infer<typeof CreateUrlSchema>;

export const UpdateUrlSchema = z.object({
  expiredAt: z.coerce.date().optional(),
  utm: UTMFields.optional(),
});

export type UpdateUrlDto = z.infer<typeof UpdateUrlSchema>;
