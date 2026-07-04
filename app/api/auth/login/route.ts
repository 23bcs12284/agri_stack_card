import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { ApiResponse } from '@/lib/utils/ApiResponse';
import { handleRouteError } from '@/lib/utils/handleRouteError';
import env from '@/lib/env';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const deviceId = req.headers.get('x-device-id') || 'unknown-device';
    const ipAddress = (req as any).ip || req.headers.get('x-forwarded-for')?.split(',')[0] || '';
    const userAgent = req.headers.get('user-agent') || '';

    const result = await authService.login(email, password, deviceId, ipAddress, userAgent);

    const response = ApiResponse.success(
      {
        user: result.user,
        accessToken: result.tokens.accessToken,
      },
      'Login successful'
    );

    response.cookies.set('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
