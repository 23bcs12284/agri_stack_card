import { NextRequest } from 'next/server';
import { cardService } from '@/lib/services/card.service';
import { ApiResponse } from '@/lib/utils/ApiResponse';
import { handleRouteError } from '@/lib/utils/handleRouteError';
import { authenticateRequest } from '@/lib/auth/authHelper';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const query = req.nextUrl.searchParams.get('q') || '';

    const cards = await cardService.searchCards(user.userId, query);
    return ApiResponse.success(cards, 'Search results');
  } catch (error) {
    return handleRouteError(error);
  }
}
