import { NextRequest } from 'next/server';
import { userService } from '@/lib/services/user.service';
import { ApiResponse } from '@/lib/utils/ApiResponse';
import { handleRouteError } from '@/lib/utils/handleRouteError';
import { authenticateRequest } from '@/lib/auth/authHelper';

export async function PUT(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const { oldPassword, newPassword } = await req.json();

    await userService.changePassword(user.userId, oldPassword, newPassword);
    return ApiResponse.success(null, 'Password changed successfully');
  } catch (error) {
    return handleRouteError(error);
  }
}
