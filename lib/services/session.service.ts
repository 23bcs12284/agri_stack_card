import prisma from '@/lib/prisma';
import crypto from 'crypto';

export class SessionService {
  /**
   * Helper to hash refresh token
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Parse user agent to get browser and OS
   */
  parseUserAgent(userAgent: string): { browser: string; os: string } {
    const ua = userAgent || '';
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';

    if (/chrome|crios/i.test(ua) && !/edge|opr/i.test(ua)) browser = 'Chrome';
    else if (/firefox|iceweasel/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua) && !/chrome|crios|opr|edge/i.test(ua)) browser = 'Safari';
    else if (/opr/i.test(ua)) browser = 'Opera';
    else if (/edge|edg/i.test(ua)) browser = 'Edge';

    if (/windows/i.test(ua)) os = 'Windows';
    else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
    else if (/linux/i.test(ua)) os = 'Linux';

    return { browser, os };
  }

  /**
   * Create a new session, revoking all existing sessions (single-device login constraint)
   */
  async createSession(
    userId: number,
    deviceId: string,
    refreshToken: string,
    ipAddress: string,
    userAgent: string,
    expiresAt: Date
  ): Promise<void> {
    const { browser, os } = this.parseUserAgent(userAgent);
    const refreshTokenHash = this.hashToken(refreshToken);

    // Run inside database transaction to ensure Atomicity & Consistency
    await prisma.$transaction(async (tx) => {
      // 1. Mark all existing sessions for this user as inactive
      await tx.session.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      });

      // 2. Create the new session
      await tx.session.create({
        data: {
          userId,
          deviceId,
          refreshTokenHash,
          ipAddress,
          browser,
          os,
          expiresAt,
          isActive: true,
        },
      });
    });
  }

  /**
   * Revoke session on logout
   */
  async revokeSession(userId: number, deviceId: string): Promise<void> {
    await prisma.session.updateMany({
      where: { userId, deviceId, isActive: true },
      data: { isActive: false },
    });
  }
}

export const sessionService = new SessionService();
