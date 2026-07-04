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
    const cardId = parseInt(id, 10);

    if (isNaN(cardId)) {
      throw ApiError.badRequest('Invalid card ID');
    }

    await adminService.deleteCardAdmin(cardId);
    return ApiResponse.noContent('Card deleted successfully');
  } catch (error) {
    return handleRouteError(error);
  }
}
