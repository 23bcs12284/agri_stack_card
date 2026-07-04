import { NextRequest } from 'next/server';
import { verifyAccessToken, TokenPayload } from '@/lib/utils/jwt';
import { ApiError } from '@/lib/utils/ApiError';
import prisma from '@/lib/prisma';

export interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
  deviceId: string;
}

export async function authenticateRequest(req: NextRequest): Promise<AuthenticatedUser> {
  let token: string | undefined;

  // Check Authorization header first
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Fallback to cookie
  if (!token) {
    const cookieToken = req.cookies.get('accessToken');
    if (cookieToken) {
      token = cookieToken.value;
    }
  }

  if (!token) {
    console.warn('[AuthHelper] Authentication failed: Access token is missing');
    throw ApiError.unauthorized('Access token is required');
  }

  let payload: TokenPayload;
  try {
    payload = verifyAccessToken(token);
  } catch (err: any) {
    console.warn(`[AuthHelper] Token verification failed: ${err.message}`);
    throw ApiError.unauthorized('Invalid access token');
  }

  console.log(`[AuthHelper] Token verified for User ID: ${payload.userId}, Device: ${payload.deviceId}`);

  // Verify user still exists and is active
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true, isActive: true },
  });

  if (!user) {
    console.warn(`[AuthHelper] Auth failed: User ${payload.userId} not found in DB`);
    throw ApiError.unauthorized('User no longer exists');
  }

  if (!user.isActive) {
    console.warn(`[AuthHelper] Auth failed: User ${payload.userId} is deactivated`);
    throw ApiError.unauthorized('Your account has been deactivated');
  }

  // Verify session is active in the database
  const activeSession = await prisma.session.findFirst({
    where: { userId: payload.userId, isActive: true },
  });

  if (!activeSession) {
    console.warn(`[AuthHelper] Auth failed: No active DB session found for User ID: ${payload.userId}`);
    throw ApiError.unauthorized('Session has expired or is invalid');
  }

  // Single device login constraint
  if (activeSession.deviceId !== payload.deviceId) {
    console.warn(`[AuthHelper] Auth failed: Device ID mismatch. Active: ${activeSession.deviceId}, Request: ${payload.deviceId}`);
    throw ApiError.unauthorized('Your account has been logged in from another device.');
  }

  console.log(`[AuthHelper] Request successfully authenticated for User: ${user.email}`);
  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    deviceId: payload.deviceId,
  };
}

export function authorizeAdmin(user: AuthenticatedUser): void {
  if (user.role !== 'ADMIN') {
    throw ApiError.forbidden('You do not have permission to perform this action');
  }
}
