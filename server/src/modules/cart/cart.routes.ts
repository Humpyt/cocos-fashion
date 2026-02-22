import { Router, type Request } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  addCartItem,
  deleteCartItem,
  getCart,
  mergeGuestCartIntoUser,
  updateCartItemQuantity,
} from "./cart.service.js";
import {
  mergeCartSchema,
  updateCartItemSchema,
  upsertCartItemSchema,
} from "./cart.schemas.js";
import { requireAuth } from "../../middleware/require-auth.js";

const guestIdSchema = z.string().uuid();

const readGuestId = (req: Request): string | undefined => {
  const value = req.headers["x-guest-id"] ?? req.headers["guest_id"];
  if (typeof value !== "string") {
    return undefined;
  }
  const parsed = guestIdSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
};

export const cartRouter = Router();

cartRouter.get(
  "/cart",
  asyncHandler(async (req, res) => {
    const owner = {
      userId: req.auth?.userId,
      guestId: readGuestId(req),
    };

    if (!owner.userId && !owner.guestId) {
      return res.status(200).json({
        id: null,
        status: "ACTIVE",
        items: [],
        subtotalMinor: 0,
        totalItems: 0,
      });
    }

    const cart = await getCart(owner);
    return res.status(200).json(cart);
  }),
);

cartRouter.post(
  "/cart/items",
  asyncHandler(async (req, res) => {
    const payload = upsertCartItemSchema.parse(req.body);
    const cart = await addCartItem(
      {
        userId: req.auth?.userId,
        guestId: readGuestId(req),
      },
      payload,
    );
    return res.status(200).json(cart);
  }),
);

cartRouter.patch(
  "/cart/items/:itemId",
  asyncHandler(async (req, res) => {
    const payload = updateCartItemSchema.parse(req.body);
    const itemId = String(req.params.itemId);
    const cart = await updateCartItemQuantity(
      {
        userId: req.auth?.userId,
        guestId: readGuestId(req),
      },
      itemId,
      payload.quantity,
    );
    return res.status(200).json(cart);
  }),
);

cartRouter.delete(
  "/cart/items/:itemId",
  asyncHandler(async (req, res) => {
    const itemId = String(req.params.itemId);
    const cart = await deleteCartItem(
      {
        userId: req.auth?.userId,
        guestId: readGuestId(req),
      },
      itemId,
    );
    return res.status(200).json(cart);
  }),
);

cartRouter.post(
  "/cart/merge",
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = mergeCartSchema.parse(req.body ?? {});
    const guestId = payload.guestId ?? readGuestId(req);
    if (!guestId) {
      return res.status(400).json({ message: "guestId is required for cart merge" });
    }

    const cart = await mergeGuestCartIntoUser(req.auth!.userId, guestId);
    return res.status(200).json(cart);
  }),
);
