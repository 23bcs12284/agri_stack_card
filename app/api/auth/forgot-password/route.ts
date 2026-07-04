import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { ApiResponse } from '@/lib/utils/ApiResponse';
import { handleRouteError } from '@/lib/utils/handleRouteError';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    await authService.forgotPassword(email);

    // Always return success to prevent email enumeration
    return ApiResponse.success(null, 'If that email is registered, a password reset link has been sent');
  } catch (error) {
    return handleRouteError(error);
  }
}
