import { z } from "zod";

export const mergeWishlistSchema = z.object({
  productIds: z.array(z.string().uuid()).max(200),
});
