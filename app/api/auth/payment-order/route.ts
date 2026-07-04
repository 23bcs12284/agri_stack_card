import { NextRequest } from 'next/server';
import { paymentService } from '@/lib/services/payment.service';
import { ApiResponse } from '@/lib/utils/ApiResponse';
import { handleRouteError } from '@/lib/utils/handleRouteError';
import { ApiError } from '@/lib/utils/ApiError';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      throw ApiError.badRequest('Email address is required');
    }
    const result = await paymentService.createRegistrationOrder(email);
    return ApiResponse.success(result, 'Razorpay order created successfully');
  } catch (error) {
    return handleRouteError(error);
  }
}
