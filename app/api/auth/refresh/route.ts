import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { ApiResponse } from '@/lib/utils/ApiResponse';
import { handleRouteError } from '@/lib/utils/handleRouteError';
import env from '@/lib/env';

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get('refreshToken')?.value;
    let bodyToken: string | undefined;
    try {
      const body = await req.json();
      bodyToken = body.refreshToken;
    } catch (e) {
      // Body may be empty
    }

    const token = cookieToken || bodyToken;
    const deviceId = req.headers.get('x-device-id') || 'unknown-device';
    const ipAddress = (req as any).ip || req.headers.get('x-forwarded-for')?.split(',')[0] || '';
    const userAgent = req.headers.get('user-agent') || '';

    if (!token) {
      return ApiResponse.error('Refresh token is required', 401);
    }

    const result = await authService.refreshToken(token, deviceId, ipAddress, userAgent);

    const response = ApiResponse.success(
      {
        accessToken: result.accessToken,
      },
      'Token refreshed successfully'
    );

    response.cookies.set('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    return response;
  } catch (error) {
    const response = handleRouteError(error);
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    return response;
  }
}
