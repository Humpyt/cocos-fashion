import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { badRequest, unauthorized } from '../utils/http.js';
import {
  signAccessToken,
  createRefreshTokenRecord,
  toUserResponse,
} from '../modules/auth/auth.service.js';

const oauth2Client = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_CALLBACK_URL,
);

interface GoogleUserInfo {
  id: string;
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

const ensureString = (
  value: string | null | undefined,
  errorMessage: string,
): string => {
  if (typeof value !== 'string' || value.length === 0) {
    unauthorized(errorMessage);
  }
  return value as string;
};

const verifyGoogleToken = async (idToken: string): Promise<GoogleUserInfo> => {
  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const subject = ensureString(payload?.sub, 'Invalid Google token');
    const email = ensureString(payload?.email, 'Invalid Google token');
    return {
      id: subject,
      email,
      email_verified: payload?.email_verified === true,
      name: payload?.name || '',
      given_name: payload?.given_name || '',
      family_name: payload?.family_name || '',
      picture: payload?.picture || '',
      locale: payload?.locale || '',
    };
  } catch (error) {
    console.error('Google token verification error:', error);
    throw unauthorized('Failed to verify Google token');
  }
};

const getAuthorizationUrl = (state: string): string => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    state,
    prompt: 'consent',
  });
};

const exchangeCodeForTokens = async (code: string): Promise<{ idToken: string }> => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    const idToken = ensureString(tokens.id_token, 'Failed to obtain ID token from Google');
    return { idToken };
  } catch (error) {
    console.error('Google token exchange error:', error);
    throw unauthorized('Failed to exchange authorization code for tokens');
  }
};

export const googleAuthCallback = async (
  code: string,
  ipAddress?: string,
  userAgent?: string,
) => {
  try {
    const { idToken } = await exchangeCodeForTokens(code);
    const googleUser = await verifyGoogleToken(idToken);

    if (!googleUser.email_verified) {
      badRequest('Email not verified by Google');
    }

    const normalizedEmail = googleUser.email.toLowerCase().trim();

    // Check for existing user by Google provider ID
    let user = await prisma.user.findFirst({
      where: {
        provider: 'google',
        providerId: googleUser.id,
      },
    });

    // If not found, check by email for linking
    if (!user) {
      const existingByEmail = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingByEmail) {
        // Email exists - link Google account
        user = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            provider: 'google',
            providerId: googleUser.id,
            avatarUrl: googleUser.picture,
            providerData: {
              google: {
                picture: googleUser.picture,
                locale: googleUser.locale,
                emailVerified: googleUser.email_verified,
              },
            },
          },
        });
      } else {
        // Create new user with Google
        user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            firstName: googleUser.given_name,
            lastName: googleUser.family_name,
            avatarUrl: googleUser.picture,
            provider: 'google',
            providerId: googleUser.id,
            providerData: {
              google: {
                picture: googleUser.picture,
                locale: googleUser.locale,
                emailVerified: googleUser.email_verified,
              },
            },
          },
        });

        // Create cart for new user
        await prisma.cart.create({
          data: {
            userId: user.id,
            status: 'ACTIVE',
          },
        });
      }
    }

    // Generate our JWT tokens
    const accessToken = await signAccessToken(user);
    const refresh = await createRefreshTokenRecord({
      userId: user.id,
      ipAddress,
      userAgent,
    });

    return {
      accessToken,
      refreshToken: refresh.token,
      user: toUserResponse(user),
      isNew: !user.passwordHash, // True if OAuth-only user
    };
  } catch (error) {
    console.error('Google auth callback error:', error);
    throw error;
  }
};

export const getGoogleAuthUrl = (state: string): string => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    console.error('Google OAuth not configured: missing CLIENT_ID or CLIENT_SECRET');
    console.error('GOOGLE_CLIENT_ID:', env.GOOGLE_CLIENT_ID);
    console.error('GOOGLE_CLIENT_SECRET:', env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET');
    badRequest('Google OAuth not configured. Please contact support.');
  }
  return getAuthorizationUrl(state);
};
