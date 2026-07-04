import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { ApiResponse } from '@/lib/utils/ApiResponse';
import { handleRouteError } from '@/lib/utils/handleRouteError';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    await authService.resetPassword(token, password);

    return ApiResponse.success(null, 'Password reset successful');
  } catch (error) {
    return handleRouteError(error);
  }
}
