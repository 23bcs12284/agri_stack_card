import { NextRequest } from 'next/server';
import { adminService } from '@/lib/services/admin.service';
import { ApiResponse } from '@/lib/utils/ApiResponse';
import { handleRouteError } from '@/lib/utils/handleRouteError';
import { authenticateRequest, authorizeAdmin } from '@/lib/auth/authHelper';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    authorizeAdmin(user);

    const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10);
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10', 10);

    const result = await adminService.getAllCards(page, limit);
    return ApiResponse.success(result, 'Cards retrieved successfully');
  } catch (error) {
    return handleRouteError(error);
  }
}
