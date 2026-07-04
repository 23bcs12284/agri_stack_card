import { NextRequest } from 'next/server';
import { cardService } from '@/lib/services/card.service';
import { ApiResponse } from '@/lib/utils/ApiResponse';
import { handleRouteError } from '@/lib/utils/handleRouteError';
import { authenticateRequest } from '@/lib/auth/authHelper';
import { ApiError } from '@/lib/utils/ApiError';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(req);
    const { id } = await params;
    const cardId = parseInt(id, 10);

    if (isNaN(cardId)) {
      throw ApiError.badRequest('Invalid card ID');
    }

    const card = await cardService.getCardById(cardId, user.userId);
    return ApiResponse.success(card, 'Card retrieved successfully');
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(req);
    const { id } = await params;
    const cardId = parseInt(id, 10);

    if (isNaN(cardId)) {
      throw ApiError.badRequest('Invalid card ID');
    }

    const body = await req.json();
    let cardData = { ...body };
    
    // Parse landRecords if sent as string
    if (typeof cardData.landRecords === 'string') {
      try {
        cardData.landRecords = JSON.parse(cardData.landRecords);
      } catch {
        cardData.landRecords = [];
      }
    }
    if (typeof cardData.jsonData === 'string') {
      try {
        cardData.jsonData = JSON.parse(cardData.jsonData);
      } catch {
        cardData.jsonData = null;
      }
    }

    const card = await cardService.updateCard(cardId, user.userId, cardData);
    return ApiResponse.success(card, 'Card updated successfully');
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(req);
    const { id } = await params;
    const cardId = parseInt(id, 10);

    if (isNaN(cardId)) {
      throw ApiError.badRequest('Invalid card ID');
    }

    await cardService.deleteCard(cardId, user.userId);
    return ApiResponse.noContent('Card deleted successfully');
  } catch (error) {
    return handleRouteError(error);
  }
}
