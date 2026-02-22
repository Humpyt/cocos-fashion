import { RewardTier, UserRole, OrderStatus } from "@prisma/client";
import { z } from "zod";

export const adminListProductsQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  categoryId: z.string().uuid().optional(),
  active: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
});

export const adminCreateCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(100).optional(),
});

export const adminUpdateCategorySchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  slug: z.string().trim().min(2).max(100).optional(),
});

const productBaseSchema = z.object({
  slug: z.string().trim().min(2).max(200).optional(),
  brand: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(250),
  description: z.string().trim().max(2000).optional().nullable(),
  details: z.array(z.string().trim().min(1).max(250)).max(30).optional().nullable(),
  priceMinor: z.coerce.number().int().min(0),
  originalPriceMinor: z.coerce.number().int().min(0).optional().nullable(),
  rating: z.coerce.number().min(0).max(5).optional(),
  reviewsCount: z.coerce.number().int().min(0).optional(),
  badge: z.string().trim().max(80).optional().nullable(),
  isNew: z.boolean().optional(),
  active: z.boolean().optional(),
  imageUrl: z.string().url(),
  categoryIds: z.array(z.string().uuid()).min(1),
  variant: z.object({
    sku: z.string().trim().min(2).max(120).optional(),
    size: z.string().trim().max(30).optional().nullable(),
    colorName: z.string().trim().max(60).optional().nullable(),
    colorHex: z.string().trim().max(20).optional().nullable(),
    stockQty: z.coerce.number().int().min(0).default(0),
  }),
});

export const adminCreateProductSchema = productBaseSchema;

export const adminUpdateProductSchema = productBaseSchema.partial().extend({
  imageUrl: z.string().url().optional(),
  categoryIds: z.array(z.string().uuid()).min(1).optional(),
  variant: productBaseSchema.shape.variant.partial().optional(),
});

export const adminUpdateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
});

export const adminUpdateUserRewardsSchema = z.object({
  rewardTier: z.nativeEnum(RewardTier).optional(),
  rewardPoints: z.coerce.number().int().min(0).optional(),
  nextTierPoints: z.coerce.number().int().min(0).optional(),
});

export const adminUpdateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});
