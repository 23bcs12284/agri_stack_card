import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import prisma from '../config/database.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        role: string;
        deviceId: string;
      };
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Fallback to cookie
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken as string;
    }

    if (!token) {
      throw ApiError.unauthorized('Access token is required');
    }

    const payload: TokenPayload = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }

    if (!user.isActive) {
      throw ApiError.unauthorized('Your account has been deactivated');
    }

    // Verify session is active in the database
    const activeSession = await prisma.session.findFirst({
      where: { userId: payload.userId, isActive: true },
    });

    if (!activeSession) {
      throw ApiError.unauthorized('Session has expired or is invalid');
    }

    // Single device login constraint
    if (activeSession.deviceId !== payload.deviceId) {
      throw ApiError.unauthorized('Your account has been logged in from another device.');
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      deviceId: payload.deviceId,
    };

    next();
  } catch (error) {
    next(error);
  }
}
