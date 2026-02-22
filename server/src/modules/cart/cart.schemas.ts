import { z } from "zod";

export const upsertCartItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(50).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(50),
});

export const mergeCartSchema = z.object({
  guestId: z.string().uuid().optional(),
});
