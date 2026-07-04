import { NextRequest } from 'next/server';
import { adminService } from '@/lib/services/admin.service';
import { ApiResponse } from '@/lib/utils/ApiResponse';
import { handleRouteError } from '@/lib/utils/handleRouteError';
import { authenticateRequest, authorizeAdmin } from '@/lib/auth/authHelper';
import { ApiError } from '@/lib/utils/ApiError';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(req);
    authorizeAdmin(user);

    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      throw ApiError.badRequest('Invalid user ID');
    }

    await adminService.deleteUser(userId);
    return ApiResponse.noContent('User deleted successfully');
  } catch (error) {
    return handleRouteError(error);
  }
}
