import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/utils/ApiResponse';
import { handleRouteError } from '@/lib/utils/handleRouteError';
import env from '@/lib/env';

export async function GET(req: NextRequest) {
  try {
    return ApiResponse.success({ keyId: env.RAZORPAY_KEY_ID }, 'Razorpay Key retrieved successfully');
  } catch (error) {
    return handleRouteError(error);
  }
}
