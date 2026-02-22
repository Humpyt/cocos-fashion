import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { checkoutSchema } from "./orders.schemas.js";
import {
  createOrderFromActiveCart,
  getOrderByOrderNumber,
  listOrdersByUser,
} from "./orders.service.js";

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

ordersRouter.post(
  "/checkout/orders",
  asyncHandler(async (req, res) => {
    const payload = checkoutSchema.parse(req.body);
    const order = await createOrderFromActiveCart(req.auth!.userId, payload);
    return res.status(201).json(order);
  }),
);

ordersRouter.get(
  "/orders",
  asyncHandler(async (req, res) => {
    const orders = await listOrdersByUser(req.auth!.userId);
    return res.status(200).json(orders);
  }),
);

ordersRouter.get(
  "/orders/:orderNumber",
  asyncHandler(async (req, res) => {
    const order = await getOrderByOrderNumber(req.auth!.userId, String(req.params.orderNumber));
    return res.status(200).json(order);
  }),
);
