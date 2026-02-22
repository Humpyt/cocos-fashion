import type { NextFunction, Request, Response } from "express";
import { forbidden, unauthorized } from "../utils/http.js";

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  const auth = req.auth;
  if (!auth?.userId) {
    unauthorized("Authentication required");
  }
  const role = auth?.role;
  if (role !== "ADMIN") {
    forbidden("Admin access required");
  }
  return next();
};
