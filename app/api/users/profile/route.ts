import { NextRequest } from 'next/server';
import { userService } from '@/lib/services/user.service';
import { ApiResponse } from '@/lib/utils/ApiResponse';
import { handleRouteError } from '@/lib/utils/handleRouteError';
import { authenticateRequest } from '@/lib/auth/authHelper';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const profile = await userService.getProfile(user.userId);
    return ApiResponse.success(profile, 'Profile retrieved successfully');
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const { name, phone, avatar } = await req.json();

    const profile = await userService.updateProfile(user.userId, { name, phone, avatar });
    return ApiResponse.success(profile, 'Profile updated successfully');
  } catch (error) {
    return handleRouteError(error);
  }
}
