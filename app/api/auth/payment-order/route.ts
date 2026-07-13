import { NextRequest } from 'next/server';
import { paymentService } from '@/lib/services/payment.service';
import { ApiResponse } from '@/lib/utils/ApiResponse';
import { handleRouteError } from '@/lib/utils/handleRouteError';
import { ApiError } from '@/lib/utils/ApiError';

export async function POST(req: NextRequest) {
  try {
    const { email, name, phone } = await req.json();
    if (!email) {
      throw ApiError.badRequest('Email address is required');
    }
    const origin = process.env.NODE_ENV === 'production' 
      ? 'https://agri-stack-card.vercel.app' 
      : req.nextUrl.origin;

    const result = await paymentService.createRegistrationOrder(email, name, phone, origin);
    return ApiResponse.success(result, 'Cashfree order created successfully');
  } catch (error) {
    return handleRouteError(error);
  }
}
