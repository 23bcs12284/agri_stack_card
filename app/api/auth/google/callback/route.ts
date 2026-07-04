import { NextRequest, NextResponse } from 'next/server';
import { TokenPayload, generateAccessToken, generateRefreshToken } from '@/lib/utils/jwt';
import { sessionService } from '@/lib/services/session.service';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import env from '@/lib/env';

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  try {
    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');
    
    if (!code) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Google authentication failed')}`);
    }

    const deviceId = state || 'unknown-device';
    const callbackUrl = `${origin}/api/auth/google/callback`;

    // 1. Exchange auth code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json() as any;
    if (!tokenResponse.ok || !tokenData.id_token) {
      console.error('Google token exchange failed:', tokenData);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Failed to exchange Google code')}`);
    }

    // 2. Verify id_token using Google's tokeninfo API
    const tokenInfoResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${tokenData.id_token}`
    );
    const tokenInfo = await tokenInfoResponse.json() as any;

    if (!tokenInfoResponse.ok || tokenInfo.aud !== env.GOOGLE_CLIENT_ID) {
      console.error('Google token verification failed:', tokenInfo);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Invalid Google token')}`);
    }

    const { email, name, picture, sub: googleId } = tokenInfo;
    if (!email) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Email not provided by Google')}`);
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
      const userAgent = req.headers.get('user-agent') || '';
      const ipAddress = (req as any).ip || req.headers.get('x-forwarded-for')?.split(',')[0] || '';
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

      const response = NextResponse.redirect(`${origin}/login?token=${accessToken}`);
      
      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        path: '/',
      });

      return response;
    } else {
      // Redirect new/unpaid users to the registration page with URL parameters
      const redirectUrl = `${origin}/register?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&googleId=${googleId}&avatar=${encodeURIComponent(picture || '')}`;
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error: any) {
    console.error('Google Callback Error:', error);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message || 'Google Callback Error')}`);
  }
}
