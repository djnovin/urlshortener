import { z } from 'zod';

export const CreateCheckoutSession = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().min(50).max(10_000_000),
  currency: z
    .string()
    .length(3)
    .regex(/^[A-Za-z]+$/),
  productId: z.string().uuid(),
  quantity: z.number().min(1).max(100),
});

export type CreateCheckoutSessionDto = z.infer<typeof CreateCheckoutSession>;

export const CreateSubscriptionSessionSchema = z.object({
  priceId: z.string().min(1),
  quantity: z.number().min(1).max(100).default(1),
});

export type CreateSubscriptionSessionDto = z.infer<
  typeof CreateSubscriptionSessionSchema
>;
