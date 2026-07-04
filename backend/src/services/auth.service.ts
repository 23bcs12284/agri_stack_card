import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, TokenPayload } from '../utils/jwt.js';
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/email.js';
import { paymentService } from './payment.service.js';
import { sessionService } from './session.service.js';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    emailVerified: boolean;
  };
  tokens: AuthTokens;
}

export class AuthService {
  async register(
    name: string,
    email: string,
    password?: string,
    phone?: string,
    googleId?: string,
    razorpayOrderId?: string,
    razorpayPaymentId?: string,
    razorpaySignature?: string,
    deviceId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResult> {
    // 1. Verify Google Sign-in or Password exists
    if (!password && !googleId) {
      throw ApiError.badRequest('Password or Google account ID is required');
    }

    // 2. Validate Payment parameters
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw ApiError.badRequest('One-time registration fee payment details are required');
    }

    if (!deviceId) {
      throw ApiError.badRequest('Device identification fingerprint is required');
    }

    // 3. Verify Razorpay Payment Signature
    const isValid = paymentService.verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );
    if (!isValid) {
      throw ApiError.badRequest('Invalid payment signature verification failed');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.paymentStatus === 'PAID') {
      throw ApiError.conflict('Email is already registered and paid');
    }

    const hashedPassword = password ? await bcrypt.hash(password, 12) : null;

    // 4. Run database transaction to ensure atomicity & idempotency
    return await prisma.$transaction(async (tx) => {
      // Fetch payment record
      const payment = await tx.payment.findUnique({
        where: { razorpayOrderId },
      });

      if (!payment) {
        throw ApiError.badRequest('Razorpay order ID record not found');
      }

      if (payment.status === 'PAID' && payment.userId !== null) {
        throw ApiError.conflict('This payment order has already been processed for another user');
      }

      // Create or update user
      let user;
      if (existingUser) {
        user = await tx.user.update({
          where: { id: existingUser.id },
          data: {
            password: hashedPassword || existingUser.password,
            googleId: googleId || existingUser.googleId,
            paymentStatus: 'PAID',
            subscriptionType: 'ONE_TIME',
            isActive: true,
            emailVerified: true,
          },
        });
      } else {
        user = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            googleId: googleId || null,
            phone: phone || null,
            paymentStatus: 'PAID',
            subscriptionType: 'ONE_TIME',
            isActive: true,
            emailVerified: true,
          },
        });
      }

      // Update payment record to link with User
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId,
          razorpaySignature,
          status: 'PAID',
          userId: user.id,
          paidAt: new Date(),
        },
      });

      // 5. Create Session & Tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        deviceId,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);
      const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

      // Mark all existing active sessions of this user as inactive (single-device login)
      await tx.session.updateMany({
        where: { userId: user.id, isActive: true },
        data: { isActive: false },
      });

      // Create the new session
      const { browser, os } = sessionService.parseUserAgent(userAgent || '');
      await tx.session.create({
        data: {
          userId: user.id,
          deviceId,
          refreshTokenHash,
          ipAddress: ipAddress || null,
          browser,
          os,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days matching refresh token
          isActive: true,
        },
      });

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          emailVerified: user.emailVerified,
        },
        tokens: { accessToken, refreshToken },
      };
    });
  }

  async login(
    email: string,
    password: string,
    deviceId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResult> {
    if (!deviceId) {
      throw ApiError.badRequest('Device identification fingerprint is required');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.unauthorized('Your account has been deactivated');
    }

    // Ensure user has completed payment
    if (user.paymentStatus !== 'PAID') {
      throw ApiError.paymentRequired('Account registration fee must be paid before logging in');
    }

    // Google OAuth users won't have password. If they attempt password login, reject
    if (!user.password) {
      throw ApiError.unauthorized('Please sign in using Google');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      deviceId,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Single-device login constraint within a transaction
    await prisma.$transaction(async (tx) => {
      await tx.session.updateMany({
        where: { userId: user.id, isActive: true },
        data: { isActive: false },
      });

      const { browser, os } = sessionService.parseUserAgent(userAgent || '');
      await tx.session.create({
        data: {
          userId: user.id,
          deviceId,
          refreshTokenHash,
          ipAddress: ipAddress || null,
          browser,
          os,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      });
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        emailVerified: user.emailVerified,
      },
      tokens: { accessToken, refreshToken },
    };
  }

  async refreshToken(
    token: string,
    deviceId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (!deviceId) {
      throw ApiError.badRequest('Device ID is required for token refresh');
    }

    const payload = verifyRefreshToken(token);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Look up session in database matching token hash and device ID
    const session = await prisma.session.findFirst({
      where: {
        refreshTokenHash: tokenHash,
        deviceId,
        isActive: true,
      },
      include: { user: true },
    });

    if (!session || !session.user || !session.user.isActive) {
      throw ApiError.unauthorized('Invalid or expired session');
    }

    if (session.user.paymentStatus !== 'PAID') {
      throw ApiError.paymentRequired('Account registration fee must be paid');
    }

    // Generate new token rotation
    const tokenPayload: TokenPayload = {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
      deviceId,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);
    const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

    // Update/rotate session token
    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: newRefreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: ipAddress || session.ipAddress,
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: number, deviceId: string): Promise<void> {
    await sessionService.revokeSession(userId, deviceId);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists — silently return
      return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    await sendResetPasswordEmail(email, rawToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw ApiError.badRequest('Invalid verification token');
    }

    if (user.emailVerified) {
      throw ApiError.badRequest('Email is already verified');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    });
  }
}

export const authService = new AuthService();
