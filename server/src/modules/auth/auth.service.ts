import argon2 from "argon2";
import { SignJWT, jwtVerify } from "jose";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { badRequest, unauthorized } from "../../utils/http.js";
import { createOpaqueToken, hashToken } from "../../utils/security.js";

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

export const REFRESH_COOKIE_NAME = "refresh_token";

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

const enumToTitle = (value: string): string =>
  value.slice(0, 1).toUpperCase() + value.slice(1).toLowerCase();

export const toUserResponse = (user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "CUSTOMER" | "ADMIN";
  rewardTier: string;
  rewardPoints: number;
  nextTierPoints: number;
  avatarUrl?: string | null;
}) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,
  starRewardsTier: enumToTitle(user.rewardTier),
  points: user.rewardPoints,
  nextTierPoints: user.nextTierPoints,
  avatarUrl: user.avatarUrl ?? undefined,
});

export const signAccessToken = async (user: { id: string; email: string; role: "CUSTOMER" | "ADMIN" }): Promise<string> => {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${env.ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(accessSecret);
};

const signRefreshTokenJwt = async (tokenId: string, userId: string): Promise<string> => {
  return new SignJWT({ jti: tokenId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${env.REFRESH_TOKEN_TTL_DAYS}d`)
    .sign(refreshSecret);
};

export const createRefreshTokenRecord = async (params: {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}) => {
  const opaque = createOpaqueToken();
  const tokenHash = hashToken(opaque);
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  const record = await prisma.refreshToken.create({
    data: {
      userId: params.userId,
      tokenHash,
      expiresAt,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });

  const signed = await signRefreshTokenJwt(record.id, params.userId);
  return { token: `${opaque}.${signed}`, recordId: record.id };
};

const verifyRefreshEnvelope = async (value: string): Promise<{ opaque: string; tokenId: string; userId: string }> => {
  const separatorIndex = value.indexOf(".");
  const opaque = separatorIndex > -1 ? value.slice(0, separatorIndex) : "";
  const signed = separatorIndex > -1 ? value.slice(separatorIndex + 1) : "";
  if (!opaque || !signed) {
    unauthorized("Invalid refresh token");
  }

  const verified = await jwtVerify(signed, refreshSecret).catch(() => unauthorized("Invalid refresh token"));
  const payload = verified.payload;
  if (typeof payload.jti !== "string" || typeof payload.sub !== "string") {
    unauthorized("Invalid refresh token");
  }

  const tokenId = payload.jti as string;
  const userId = payload.sub as string;
  return { opaque, tokenId, userId };
};

export const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: "lax" as const,
  domain: env.COOKIE_DOMAIN || undefined,
  path: "/",
  maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
});

export const registerUser = async (input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  ipAddress?: string;
  userAgent?: string;
}) => {
  const email = normalizeEmail(input.email);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    badRequest("Email is already registered");
  }

  const passwordHash = await argon2.hash(input.password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
    },
  });

  await prisma.cart.create({
    data: {
      userId: user.id,
      status: "ACTIVE",
    },
  });

  const accessToken = await signAccessToken(user);
  const refresh = await createRefreshTokenRecord({
    userId: user.id,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return {
    accessToken,
    refreshToken: refresh.token,
    user: toUserResponse(user),
  };
};

export const loginUser = async (input: {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}) => {
  const email = normalizeEmail(input.email);
  const userMaybe = await prisma.user.findUnique({ where: { email } });
  if (!userMaybe) {
    unauthorized("Invalid email or password");
  }
  const user = userMaybe!;

  if (!user.passwordHash) {
    unauthorized("This account uses OAuth. Please sign in with Google.");
  }

  const validPassword = await argon2.verify(user.passwordHash!, input.password);
  if (!validPassword) {
    unauthorized("Invalid email or password");
  }

  const accessToken = await signAccessToken(user);
  const refresh = await createRefreshTokenRecord({
    userId: user.id,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return {
    accessToken,
    refreshToken: refresh.token,
    user: toUserResponse(user),
  };
};

export const refreshSession = async (rawRefreshToken: string, ipAddress?: string, userAgent?: string) => {
  const parsed = await verifyRefreshEnvelope(rawRefreshToken);
  const tokenHash = hashToken(parsed.opaque);

  const existingMaybe = await prisma.refreshToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: true,
      },
    });
  if (!existingMaybe) {
    unauthorized("Invalid refresh token");
  }
  const existing = existingMaybe!;

  if (existing.id !== parsed.tokenId || existing.userId !== parsed.userId) {
    unauthorized("Invalid refresh token");
  }
  if (existing.revokedAt || existing.expiresAt < new Date()) {
    unauthorized("Refresh token expired");
  }

  const rotated = await prisma.$transaction(async (tx) => {
    await tx.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });

    const opaque = createOpaqueToken();
    const newHash = hashToken(opaque);
    const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    const nextToken = await tx.refreshToken.create({
      data: {
        userId: existing.userId,
        tokenHash: newHash,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });

    return {
      opaque,
      nextTokenId: nextToken.id,
      user: existing.user,
    };
  });

  const accessToken = await signAccessToken({
    id: rotated.user.id,
    email: rotated.user.email,
    role: rotated.user.role,
  });
  const signed = await signRefreshTokenJwt(rotated.nextTokenId, rotated.user.id);

  return {
    accessToken,
    refreshToken: `${rotated.opaque}.${signed}`,
    user: toUserResponse(rotated.user),
  };
};

export const logoutSession = async (rawRefreshToken: string): Promise<void> => {
  let parsed: { opaque: string; tokenId: string; userId: string } | null = null;
  try {
    parsed = await verifyRefreshEnvelope(rawRefreshToken);
  } catch {
    return;
  }
  if (!parsed) {
    return;
  }

  const tokenHash = hashToken(parsed.opaque);
  const tokenRecord = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!tokenRecord) {
    return;
  }

  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { revokedAt: new Date() },
  });
};

export const getMe = async (userId: string) => {
  const userMaybe = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!userMaybe) {
    unauthorized("User not found");
  }
  const user = userMaybe!;
  return toUserResponse(user);
};
