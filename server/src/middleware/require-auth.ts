import type { NextFunction, Request, Response } from "express";
import { unauthorized } from "../utils/http.js";

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.auth?.userId) {
    unauthorized("Authentication required");
  }
  return next();
};
