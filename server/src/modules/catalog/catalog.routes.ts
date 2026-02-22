import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { listProductsQuerySchema } from "./catalog.schemas.js";
import { getProductBySlug, listCategories, listProducts } from "./catalog.service.js";

export const catalogRouter = Router();

catalogRouter.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const categories = await listCategories();
    return res.status(200).json(categories);
  }),
);

catalogRouter.get(
  "/products",
  asyncHandler(async (req, res) => {
    const query = listProductsQuerySchema.parse(req.query);
    const result = await listProducts(query);
    return res.status(200).json(result);
  }),
);

catalogRouter.get(
  "/products/:slug",
  asyncHandler(async (req, res) => {
    const product = await getProductBySlug(String(req.params.slug));
    return res.status(200).json(product);
  }),
);
