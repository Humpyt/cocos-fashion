import { Router } from "express";
import { requireAdmin } from "../../middleware/require-admin.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  adminCreateCategorySchema,
  adminCreateProductSchema,
  adminListProductsQuerySchema,
  adminUpdateCategorySchema,
  adminUpdateOrderStatusSchema,
  adminUpdateProductSchema,
  adminUpdateUserRewardsSchema,
  adminUpdateUserRoleSchema,
} from "./admin.schemas.js";
import {
  createAdminCategory,
  createAdminProduct,
  deleteAdminCategory,
  deleteAdminProduct,
  getAdminOverview,
  listAdminCategories,
  listAdminOrders,
  listAdminProducts,
  listAdminUsers,
  updateAdminCategory,
  updateAdminOrderStatus,
  updateAdminProduct,
  updateAdminUserRewards,
  updateAdminUserRole,
} from "./admin.service.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const overview = await getAdminOverview();
    return res.status(200).json(overview);
  }),
);

adminRouter.get(
  "/users",
  asyncHandler(async (_req, res) => {
    const users = await listAdminUsers();
    return res.status(200).json(users);
  }),
);

adminRouter.patch(
  "/users/:userId/role",
  asyncHandler(async (req, res) => {
    const payload = adminUpdateUserRoleSchema.parse(req.body);
    const user = await updateAdminUserRole(String(req.params.userId), payload.role);
    return res.status(200).json(user);
  }),
);

adminRouter.patch(
  "/users/:userId/rewards",
  asyncHandler(async (req, res) => {
    const payload = adminUpdateUserRewardsSchema.parse(req.body);
    const user = await updateAdminUserRewards(String(req.params.userId), payload);
    return res.status(200).json(user);
  }),
);

adminRouter.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const categories = await listAdminCategories();
    return res.status(200).json(categories);
  }),
);

adminRouter.post(
  "/categories",
  asyncHandler(async (req, res) => {
    const payload = adminCreateCategorySchema.parse(req.body);
    const category = await createAdminCategory(payload);
    return res.status(201).json(category);
  }),
);

adminRouter.patch(
  "/categories/:categoryId",
  asyncHandler(async (req, res) => {
    const payload = adminUpdateCategorySchema.parse(req.body);
    const category = await updateAdminCategory(String(req.params.categoryId), payload);
    return res.status(200).json(category);
  }),
);

adminRouter.delete(
  "/categories/:categoryId",
  asyncHandler(async (req, res) => {
    await deleteAdminCategory(String(req.params.categoryId));
    return res.status(204).send();
  }),
);

adminRouter.get(
  "/products",
  asyncHandler(async (req, res) => {
    const query = adminListProductsQuerySchema.parse(req.query);
    const products = await listAdminProducts(query);
    return res.status(200).json(products);
  }),
);

adminRouter.post(
  "/products",
  asyncHandler(async (req, res) => {
    const payload = adminCreateProductSchema.parse(req.body);
    const product = await createAdminProduct(payload);
    return res.status(201).json(product);
  }),
);

adminRouter.patch(
  "/products/:productId",
  asyncHandler(async (req, res) => {
    const payload = adminUpdateProductSchema.parse(req.body);
    const product = await updateAdminProduct(String(req.params.productId), payload);
    return res.status(200).json(product);
  }),
);

adminRouter.delete(
  "/products/:productId",
  asyncHandler(async (req, res) => {
    await deleteAdminProduct(String(req.params.productId));
    return res.status(204).send();
  }),
);

adminRouter.get(
  "/orders",
  asyncHandler(async (_req, res) => {
    const orders = await listAdminOrders();
    return res.status(200).json(orders);
  }),
);

adminRouter.patch(
  "/orders/:orderId/status",
  asyncHandler(async (req, res) => {
    const payload = adminUpdateOrderStatusSchema.parse(req.body);
    const order = await updateAdminOrderStatus(String(req.params.orderId), payload.status);
    return res.status(200).json(order);
  }),
);
