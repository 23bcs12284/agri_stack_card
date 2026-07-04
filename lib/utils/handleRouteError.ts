import { ApiError } from '@/lib/utils/ApiError';
import { ApiResponse } from '@/lib/utils/ApiResponse';

export function handleRouteError(error: any) {
  console.error('API Route Error:', error);
  
  if (error instanceof ApiError) {
    return ApiResponse.error(error.message, error.statusCode, error.errors);
  }
  
  if (error.name === 'ValidationError') {
    return ApiResponse.error(error.message || 'Validation error', 400);
  }

  // Handle Prisma DB constraint codes
  if (error.code && typeof error.code === 'string' && error.code.startsWith('P')) {
    // Unique key constraint violation
    if (error.code === 'P2002') {
      const targets = error.meta?.target;
      const targetStr = Array.isArray(targets) ? targets.join(', ') : '';
      return ApiResponse.error(`A record with this ${targetStr || 'value'} already exists.`, 409);
    }
    // Record not found
    if (error.code === 'P2025') {
      return ApiResponse.error('The requested record was not found.', 404);
    }
  }

  const message = error.message || 'Internal server error';
  return ApiResponse.error(message, 500);
}
