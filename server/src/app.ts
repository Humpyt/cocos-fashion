import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { authMiddleware } from "./middleware/auth.js";
import { errorHandler } from "./middleware/error-handler.js";
import { adminRouter } from "./modules/admin/admin.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { cartRouter } from "./modules/cart/cart.routes.js";
import { catalogRouter } from "./modules/catalog/catalog.routes.js";
import { ordersRouter } from "./modules/orders/orders.routes.js";
import { wishlistRouter } from "./modules/wishlist/wishlist.routes.js";

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

export const app = express();
if (env.TRUST_PROXY) {
  app.set("trust proxy", 1);
}
const allowedOrigins = new Set(env.CORS_ORIGINS);
const devLocalOriginPattern = /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/;
const currentDir = dirname(fileURLToPath(import.meta.url));
const blousesDir = resolve(currentDir, "../../public/blouses");
const dressesDir = resolve(currentDir, "../../public/dresses");
const waistcoatsDir = resolve(currentDir, "../../public/waist-coats");
const ladiesShoesDir = resolve(currentDir, "../../public/Ladies Shoes");
const menDir = resolve(currentDir, "../../public/Men");

app.use(
  pinoHttp({
    logger,
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      if (env.NODE_ENV === "development" && devLocalOriginPattern.test(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
    optionsSuccessStatus: 204,
  }),
);
app.use(
  helmet({
    // Frontend runs on a different origin in dev, so product images served by API
    // must be embeddable cross-origin.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(authMiddleware);
app.use("/blouses", express.static(blousesDir));
app.use("/dresses", express.static(dressesDir));
app.use("/waist-coats", express.static(waistcoatsDir));
app.use("/ladies-shoes", express.static(ladiesShoesDir));
app.use("/Men", express.static(menDir));

app.get("/health", (_req, res) => {
  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    now: new Date().toISOString(),
  });
});

app.use("/v1/auth", authRateLimit, authRouter);
app.use("/v1/admin", adminRouter);
app.use("/v1", catalogRouter);
app.use("/v1", cartRouter);
app.use("/v1", wishlistRouter);
app.use("/v1", ordersRouter);

app.use((_req, res) => {
  return res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);
