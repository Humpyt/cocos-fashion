import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireAuth } from "../../middleware/require-auth.js";
import {
  addWishlistItem,
  getWishlist,
  mergeWishlistItems,
  removeWishlistItem,
} from "./wishlist.service.js";
import { mergeWishlistSchema } from "./wishlist.schemas.js";

export const wishlistRouter = Router();

wishlistRouter.use(requireAuth);

wishlistRouter.get(
  "/wishlist",
  asyncHandler(async (req, res) => {
    const items = await getWishlist(req.auth!.userId);
    return res.status(200).json(items);
  }),
);

wishlistRouter.post(
  "/wishlist/:productId",
  asyncHandler(async (req, res) => {
    const items = await addWishlistItem(req.auth!.userId, String(req.params.productId));
    return res.status(200).json(items);
  }),
);

wishlistRouter.delete(
  "/wishlist/:productId",
  asyncHandler(async (req, res) => {
    const items = await removeWishlistItem(req.auth!.userId, String(req.params.productId));
    return res.status(200).json(items);
  }),
);

wishlistRouter.post(
  "/wishlist/merge",
  asyncHandler(async (req, res) => {
    const payload = mergeWishlistSchema.parse(req.body);
    const items = await mergeWishlistItems(req.auth!.userId, payload.productIds);
    return res.status(200).json(items);
  }),
);
