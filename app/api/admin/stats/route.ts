import { NextRequest } from 'next/server';
import { adminService } from '@/lib/services/admin.service';
import { ApiResponse } from '@/lib/utils/ApiResponse';
import { handleRouteError } from '@/lib/utils/handleRouteError';
import { authenticateRequest, authorizeAdmin } from '@/lib/auth/authHelper';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    authorizeAdmin(user);

    const stats = await adminService.getDashboardStats();
    return ApiResponse.success(stats, 'Dashboard stats retrieved');
  } catch (error) {
    return handleRouteError(error);
  }
}
