import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/utils/ApiError';
import { Prisma } from '@prisma/client';

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        path: string;
        filename?: string;
        destination?: string;
        mimetype?: string;
        size?: number;
      }
    }
  }
}

interface LandRecordInput {
  state?: string;
  district?: string;
  subDistrict?: string;
  village?: string;
  surveyNumber?: string;
  surveySubNumber?: string;
  ownerName?: string;
  identifierName?: string;
  ownerType?: string;
  shareType?: string;
  totalArea?: string;
  assignedArea?: string;
}

interface CardInput {
  farmerName: string;
  hindiName?: string;
  dob?: string;
  gender?: string;
  age?: string;
  category?: string;
  mobile?: string;
  aadhaar?: string;
  farmerId?: string;
  enrollmentId?: string;
  address?: string;
  photo?: string;
  qr?: string;
  pdfPath?: string;
  landRecords?: LandRecordInput[];
  jsonData?: Prisma.InputJsonValue;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class CardService {
  async createCard(
    userId: number,
    data: CardInput,
    pdfFile?: { path: string }
  ) {
    const { landRecords, ...cardData } = data;

    const card = await prisma.$transaction(async (tx) => {
      const createdCard = await tx.farmerCard.create({
        data: {
          userId,
          farmerName: cardData.farmerName,
          hindiName: cardData.hindiName || '',
          dob: cardData.dob || '',
          gender: cardData.gender || '',
          age: cardData.age || '',
          category: cardData.category || 'General',
          mobile: cardData.mobile || '',
          aadhaar: cardData.aadhaar || '',
          farmerId: cardData.farmerId || '',
          enrollmentId: cardData.enrollmentId || '',
          address: cardData.address || '',
          photo: cardData.photo || '',
          qr: cardData.qr || '',
          pdfPath: pdfFile ? pdfFile.path : (cardData.pdfPath || ''),
          jsonData: cardData.jsonData || Prisma.JsonNull,
        },
      });

      if (landRecords && landRecords.length > 0) {
        await tx.landRecord.createMany({
          data: landRecords.map((lr) => ({
            farmerCardId: createdCard.id,
            state: lr.state || '',
            district: lr.district || '',
            subDistrict: lr.subDistrict || '',
            village: lr.village || '',
            surveyNumber: lr.surveyNumber || '',
            surveySubNumber: lr.surveySubNumber || '',
            ownerName: lr.ownerName || '',
            identifierName: lr.identifierName || '',
            ownerType: lr.ownerType || '',
            shareType: lr.shareType || '',
            totalArea: lr.totalArea || '',
            assignedArea: lr.assignedArea || '',
          })),
        });
      }

      return createdCard;
    });

    // Return the card with land records
    return prisma.farmerCard.findUnique({
      where: { id: card.id },
      include: { landRecords: true },
    });
  }

  async getCardsByUser(userId: number, page: number = 1, limit: number = 10): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;

    const [cards, total] = await Promise.all([
      prisma.farmerCard.findMany({
        where: { userId },
        include: { landRecords: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.farmerCard.count({ where: { userId } }),
    ]);

    return {
      data: cards,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCardById(id: number, userId: number) {
    const card = await prisma.farmerCard.findUnique({
      where: { id },
      include: {
        landRecords: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!card) {
      throw ApiError.notFound('Card not found');
    }

    // Check ownership (admin bypass handled at controller/route level)
    if (card.userId !== userId) {
      throw ApiError.forbidden('You do not have access to this card');
    }

    return card;
  }

  async updateCard(id: number, userId: number, data: CardInput) {
    // Verify ownership
    const existingCard = await prisma.farmerCard.findUnique({
      where: { id },
    });

    if (!existingCard) {
      throw ApiError.notFound('Card not found');
    }

    if (existingCard.userId !== userId) {
      throw ApiError.forbidden('You do not have access to this card');
    }

    const { landRecords, ...cardData } = data;

    const updatedCard = await prisma.$transaction(async (tx) => {
      // Update card fields
      const updated = await tx.farmerCard.update({
        where: { id },
        data: {
          farmerName: cardData.farmerName ?? existingCard.farmerName,
          hindiName: cardData.hindiName ?? existingCard.hindiName,
          dob: cardData.dob ?? existingCard.dob,
          gender: cardData.gender ?? existingCard.gender,
          age: cardData.age ?? existingCard.age,
          category: cardData.category ?? existingCard.category,
          mobile: cardData.mobile ?? existingCard.mobile,
          aadhaar: cardData.aadhaar ?? existingCard.aadhaar,
          farmerId: cardData.farmerId ?? existingCard.farmerId,
          enrollmentId: cardData.enrollmentId ?? existingCard.enrollmentId,
          address: cardData.address ?? existingCard.address,
          photo: cardData.photo ?? existingCard.photo,
          qr: cardData.qr ?? existingCard.qr,
          pdfPath: cardData.pdfPath ?? existingCard.pdfPath,
          jsonData: cardData.jsonData !== undefined ? (cardData.jsonData as any) : (existingCard.jsonData as any),
        },
      });

      // If land records are provided, delete old and create new
      if (landRecords !== undefined) {
        await tx.landRecord.deleteMany({
          where: { farmerCardId: id },
        });

        if (landRecords.length > 0) {
          await tx.landRecord.createMany({
            data: landRecords.map((lr) => ({
              farmerCardId: id,
              state: lr.state || '',
              district: lr.district || '',
              subDistrict: lr.subDistrict || '',
              village: lr.village || '',
              surveyNumber: lr.surveyNumber || '',
              surveySubNumber: lr.surveySubNumber || '',
              ownerName: lr.ownerName || '',
              identifierName: lr.identifierName || '',
              ownerType: lr.ownerType || '',
              shareType: lr.shareType || '',
              totalArea: lr.totalArea || '',
              assignedArea: lr.assignedArea || '',
            })),
          });
        }
      }

      return updated;
    });

    return prisma.farmerCard.findUnique({
      where: { id: updatedCard.id },
      include: { landRecords: true },
    });
  }

  async deleteCard(id: number, userId: number): Promise<void> {
    const card = await prisma.farmerCard.findUnique({
      where: { id },
    });

    if (!card) {
      throw ApiError.notFound('Card not found');
    }

    if (card.userId !== userId) {
      throw ApiError.forbidden('You do not have access to this card');
    }

    // Remove uploaded PDF file if it exists
    if (card.pdfPath && fs.existsSync(card.pdfPath)) {
      try {
        fs.unlinkSync(card.pdfPath);
      } catch {
        console.warn(`Failed to delete file: ${card.pdfPath}`);
      }
    }

    // Cascade delete handles land records
    await prisma.farmerCard.delete({
      where: { id },
    });
  }

  async searchCards(userId: number, query: string): Promise<any[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchTerm = query.trim();

    const cards = await prisma.farmerCard.findMany({
      where: {
        userId,
        OR: [
          { farmerName: { contains: searchTerm } },
          { farmerId: { contains: searchTerm } },
          { enrollmentId: { contains: searchTerm } },
          { mobile: { contains: searchTerm } },
          {
            landRecords: {
              some: {
                village: { contains: searchTerm },
              },
            },
          },
        ],
      },
      include: { landRecords: true },
      orderBy: { createdAt: 'desc' },
    });

    return cards;
  }
}

export const cardService = new CardService();
