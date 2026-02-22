import { z } from "zod";

const paymentMethodSchema = z.enum(["MOBILE_MONEY_CARD", "COD", "card", "cod"]);

export const checkoutSchema = z.object({
  shippingAddress: z.object({
    firstName: z.string().min(1).max(64),
    lastName: z.string().min(1).max(64),
    line1: z.string().min(3).max(255),
    city: z.string().min(2).max(120),
    phone: z.string().min(6).max(32),
  }),
  paymentMethod: paymentMethodSchema,
});
