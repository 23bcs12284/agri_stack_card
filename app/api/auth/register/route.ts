import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { ApiResponse } from '@/lib/utils/ApiResponse';
import { handleRouteError } from '@/lib/utils/handleRouteError';
import env from '@/lib/env';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      phone,
      googleId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

    const deviceId = req.headers.get('x-device-id') || 'unknown-device';
    const ipAddress = (req as any).ip || req.headers.get('x-forwarded-for')?.split(',')[0] || '';
    const userAgent = req.headers.get('user-agent') || '';

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

    const response = ApiResponse.created(
      {
        user: result.user,
        accessToken: result.tokens.accessToken,
      },
      'Registration successful'
    );

    response.cookies.set('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days (NextJS cookies.set maxAge is in seconds, so 7 * 24 * 60 * 60 = 604800)
      path: '/',
    });

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
