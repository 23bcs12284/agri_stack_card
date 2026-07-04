import { NextRequest } from 'next/server';
import { cardService } from '@/lib/services/card.service';
import { ApiResponse } from '@/lib/utils/ApiResponse';
import { handleRouteError } from '@/lib/utils/handleRouteError';
import { authenticateRequest } from '@/lib/auth/authHelper';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    
    // Parse form data
    const formData = await req.formData();
    
    // Extract fields
    const pdfFile = formData.get('pdf') as File | null;
    const farmerDataStr = formData.get('farmerData') as string || '';
    
    let cardData: any = {};
    if (farmerDataStr) {
      cardData = JSON.parse(farmerDataStr);
    } else {
      // Fallback: extract fields from form data directly
      for (const [key, value] of formData.entries()) {
        if (key !== 'pdf') {
          cardData[key] = value;
        }
      }
    }

    // Parse landRecords and jsonData if they are strings
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

    // Save the PDF file to a temporary location (/tmp)
    let pdfPathObj: { path: string } | undefined;
    if (pdfFile && pdfFile.size > 0) {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const uploadDir = path.join('/tmp', 'agristack-pdfs');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const fileName = `${uuidv4()}.pdf`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, buffer);
      pdfPathObj = { path: filePath };
    }

    const card = await cardService.createCard(user.userId, cardData, pdfPathObj);
    return ApiResponse.created(card, 'Card created successfully');
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10);
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10', 10);

    const result = await cardService.getCardsByUser(user.userId, page, limit);
    return ApiResponse.success(result, 'Cards retrieved successfully');
  } catch (error) {
    return handleRouteError(error);
  }
}
