import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schemas.js";
import {
  getMe,
  getRefreshCookieOptions,
  loginUser,
  logoutSession,
  REFRESH_COOKIE_NAME,
  refreshSession,
  registerUser,
} from "./auth.service.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const payload = registerSchema.parse(req.body);
    const result = await registerUser({
      ...payload,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());
    return res.status(201).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  }),
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const payload = loginSchema.parse(req.body);
    const result = await loginUser({
      ...payload,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());
    return res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  }),
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const payload = refreshSchema.parse(req.body ?? {});
    const tokenFromCookie = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    const refreshToken = payload.refreshToken ?? tokenFromCookie;
    if (!refreshToken) {
      return res.status(401).json({ message: "Missing refresh token" });
    }

    const result = await refreshSession(refreshToken, req.ip, req.headers["user-agent"]);
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());
    return res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  }),
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const payload = refreshSchema.parse(req.body ?? {});
    const tokenFromCookie = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    const refreshToken = payload.refreshToken ?? tokenFromCookie;

    if (refreshToken) {
      await logoutSession(refreshToken);
    }

    res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
    return res.status(204).send();
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getMe(req.auth!.userId);
    return res.status(200).json(user);
  }),
);
