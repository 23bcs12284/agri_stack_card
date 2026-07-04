import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import env from '@/lib/env';

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
  deviceId: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as any,
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function generateRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload & TokenPayload;
  return {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
    deviceId: decoded.deviceId,
  };
}

export function verifyRefreshToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload & TokenPayload;
  return {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
    deviceId: decoded.deviceId,
  };
}
