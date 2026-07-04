import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { ApiResponse } from '@/lib/utils/ApiResponse';
import { handleRouteError } from '@/lib/utils/handleRouteError';
import { authenticateRequest } from '@/lib/auth/authHelper';
import env from '@/lib/env';

export async function POST(req: NextRequest) {
  try {
    let authenticatedUser: any = null;
    try {
      authenticatedUser = await authenticateRequest(req);
    } catch (e) {
      console.warn('Logout: user authentication failed, continuing to clear cookie', e);
    }
    
    if (authenticatedUser && authenticatedUser.userId) {
      await authService.logout(authenticatedUser.userId, authenticatedUser.deviceId || 'unknown-device');
    }

    const response = ApiResponse.success(null, 'Logout successful');

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
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
