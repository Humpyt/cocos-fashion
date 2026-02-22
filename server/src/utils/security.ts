import { createHash, randomBytes } from "node:crypto";

export const createOpaqueToken = (bytes = 48): string => randomBytes(bytes).toString("base64url");

export const hashToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");
