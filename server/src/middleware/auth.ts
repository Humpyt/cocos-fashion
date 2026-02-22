import type { NextFunction, Request, Response } from "express";
import { jwtVerify } from "jose";
import { env } from "../config/env.js";

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return next();
  }

  try {
    const { payload } = await jwtVerify(token, accessSecret);
    if (
      typeof payload.sub === "string" &&
      typeof payload.email === "string" &&
      (payload.role === "CUSTOMER" || payload.role === "ADMIN")
    ) {
      req.auth = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    }
  } catch {
    // Invalid or expired token should not throw globally for optional auth.
  }

  return next();
};
