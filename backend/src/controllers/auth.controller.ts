import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { paymentService } from '../services/payment.service.js';
import { sessionService } from '../services/session.service.js';
import { TokenPayload, generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import prisma from '../config/database.js';
import crypto from 'crypto';
import env from '../config/env.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        name,
        email,
        password,
        phone,
        googleId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      } = req.body;

      const deviceId = req.headers['x-device-id'] as string || 'unknown-device';
      const ipAddress = req.ip || '';
      const userAgent = req.headers['user-agent'] || '';

      const result = await authService.register(
        name,
        email,
        password,
        phone,
        googleId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        deviceId,
        ipAddress,
        userAgent
      );

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      ApiResponse.created(res, {
        user: result.user,
        accessToken: result.tokens.accessToken,
      }, 'Registration successful');
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const deviceId = req.headers['x-device-id'] as string || 'unknown-device';
      const ipAddress = req.ip || '';
      const userAgent = req.headers['user-agent'] || '';

      const result = await authService.login(email, password, deviceId, ipAddress, userAgent);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      ApiResponse.success(res, {
        user: result.user,
        accessToken: result.tokens.accessToken,
      }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const deviceId = req.user?.deviceId || 'unknown-device';

      if (userId) {
        await authService.logout(userId, deviceId);
      }

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      ApiResponse.success(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.refreshToken || req.body.refreshToken;
      const deviceId = req.headers['x-device-id'] as string || 'unknown-device';
      const ipAddress = req.ip || '';
      const userAgent = req.headers['user-agent'] || '';

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Refresh token is required',
        });
        return;
      }

      const result = await authService.refreshToken(token, deviceId, ipAddress, userAgent);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.success(res, {
        accessToken: result.accessToken,
      }, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);

      // Always return success to prevent email enumeration
      ApiResponse.success(res, null, 'If that email is registered, a password reset link has been sent');
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);

      ApiResponse.success(res, null, 'Password reset successful');
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.params.token as string;
      await authService.verifyEmail(token);

      ApiResponse.success(res, null, 'Email verified successfully');
    } catch (error) {
      next(error);
    }
  }

  async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deviceId = (req.query.deviceId as string) || 'unknown-device';
      const backendOrigin = `${req.protocol}://${req.get('host')}`;
      const callbackUrl = `${backendOrigin}/api/auth/google/callback`;
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=openid%20profile%20email&state=${encodeURIComponent(deviceId)}`;
      res.redirect(googleAuthUrl);
    } catch (error) {
      next(error);
    }
  }

  async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, state } = req.query;
      if (!code) {
        res.redirect(`${env.CORS_ORIGIN}/login?error=Google authentication failed`);
        return;
      }

      const deviceId = (state as string) || 'unknown-device';
      const backendOrigin = `${req.protocol}://${req.get('host')}`;
      const callbackUrl = `${backendOrigin}/api/auth/google/callback`;

      // 1. Exchange auth code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: code as string,
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uri: callbackUrl,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = (await tokenResponse.json()) as any;
      if (!tokenResponse.ok || !tokenData.id_token) {
        console.error('Google token exchange failed:', tokenData);
        res.redirect(`${env.CORS_ORIGIN}/login?error=Failed to exchange Google code`);
        return;
      }

      // 2. Verify id_token using Google's tokeninfo API
      const tokenInfoResponse = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${tokenData.id_token}`
      );
      const tokenInfo = (await tokenInfoResponse.json()) as any;

      if (!tokenInfoResponse.ok || tokenInfo.aud !== env.GOOGLE_CLIENT_ID) {
        console.error('Google token verification failed:', tokenInfo);
        res.redirect(`${env.CORS_ORIGIN}/login?error=Invalid Google token`);
        return;
      }

      const { email, name, picture, sub: googleId } = tokenInfo;
      if (!email) {
        res.redirect(`${env.CORS_ORIGIN}/login?error=Email not provided by Google`);
        return;
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser && existingUser.paymentStatus === 'PAID') {
        // User exists and is paid: Log them in immediately

        // 1. Generate JWT tokens
        const tokenPayload: TokenPayload = {
          userId: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
          deviceId,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);
        const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        // 2. Invalidate old sessions (single-device login constraint)
        await prisma.session.updateMany({
          where: { userId: existingUser.id, isActive: true },
          data: { isActive: false },
        });

        // 3. Create the new session record
        const userAgent = req.headers['user-agent'] || '';
        const ipAddress = req.ip || '';
        const { browser, os } = sessionService.parseUserAgent(userAgent);

        await prisma.session.create({
          data: {
            userId: existingUser.id,
            deviceId,
            refreshTokenHash,
            ipAddress,
            browser,
            os,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            isActive: true,
          },
        });

        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.redirect(`${env.CORS_ORIGIN}/login?token=${accessToken}`);
      } else {
        // Redirect new/unpaid users to the registration page with URL parameters
        // The registration page will lock inputs and ask them to complete the ₹300 payment.
        const redirectUrl = `${env.CORS_ORIGIN}/register?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&googleId=${googleId}&avatar=${encodeURIComponent(picture || '')}`;
        res.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      res.redirect(`${env.CORS_ORIGIN}/login?error=Internal server error during Google login`);
    }
  }

  async paymentOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        throw ApiError.badRequest('Email address is required');
      }
      const result = await paymentService.createRegistrationOrder(email);
      ApiResponse.success(res, result, 'Razorpay order created successfully');
    } catch (error) {
      next(error);
    }
  }

  async razorpayWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      if (!signature) {
        res.status(400).json({ success: false, message: 'Missing razorpay webhook signature' });
        return;
      }
      const rawBody = (req as any).rawBody
        ? (req as any).rawBody.toString('utf-8')
        : JSON.stringify(req.body);

      const isValid = paymentService.verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        res.status(400).json({ success: false, message: 'Invalid webhook signature' });
        return;
      }

      const { event, payload } = req.body;
      await paymentService.handleWebhook(event, payload);

      res.status(200).json({ success: true, message: 'Webhook processed' });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
  }

  async getRazorpayKey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      ApiResponse.success(res, { keyId: env.RAZORPAY_KEY_ID }, 'Razorpay Key retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
