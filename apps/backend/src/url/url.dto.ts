import { z } from 'zod';

export const CreateUrlSchema = z.object({
  originalUrl: z.string().url(),
  expiredAt: z.coerce.date().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  ref: z.string().optional(),
});

export type CreateUrlDto = z.infer<typeof CreateUrlSchema>;

export const UpdateUrlSchema = z.object({
  expiredAt: z.coerce.date().optional(),
  ref: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
});

export type UpdateUrlDto = z.infer<typeof UpdateUrlSchema>;
