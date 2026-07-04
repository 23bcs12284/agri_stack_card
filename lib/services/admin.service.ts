import fs from 'fs';
import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/utils/ApiError';

interface DashboardStats {
  totalUsers: number;
  totalCards: number;
  totalLandRecords: number;
  recentCards: number;
  recentCardsList: any[];
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

export class AdminService {
  async getDashboardStats(): Promise<any> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalUsers,
      totalCards,
      totalLandRecords,
      recentCards,
      paidUsers,
      failedPayments,
      pendingPayments,
      revenueAggregate,
      recentPayments,
      activeSessionsList,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.farmerCard.count(),
      prisma.landRecord.count(),
      prisma.farmerCard.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.user.count({
        where: { paymentStatus: 'PAID' },
      }),
      prisma.payment.count({
        where: { status: 'FAILED' },
      }),
      prisma.payment.count({
        where: { status: 'PENDING' },
      }),
      prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.session.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
    ]);

    const revenue = revenueAggregate._sum.amount || 0;

    return {
      totalUsers,
      totalCards,
      totalLandRecords,
      recentCards,
      paidUsers,
      failedPayments,
      pendingPayments,
      revenue,
      recentPayments,
      activeSessions: activeSessionsList,
    };
  }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          avatar: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { cards: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteUser(userId: number): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        cards: {
          select: { pdfPath: true },
        },
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (user.role === 'ADMIN') {
      throw ApiError.badRequest('Cannot delete an admin user');
    }

    // Clean up uploaded files
    for (const card of user.cards) {
      if (card.pdfPath && fs.existsSync(card.pdfPath)) {
        try {
          fs.unlinkSync(card.pdfPath);
        } catch {
          console.warn(`Failed to delete file: ${card.pdfPath}`);
        }
      }
    }

    // Cascade delete handles cards and land records
    await prisma.user.delete({
      where: { id: userId },
    });
  }

  async getAllCards(page: number = 1, limit: number = 10): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;

    const [cards, total] = await Promise.all([
      prisma.farmerCard.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          landRecords: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.farmerCard.count(),
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

  async deleteCardAdmin(cardId: number): Promise<void> {
    const card = await prisma.farmerCard.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      throw ApiError.notFound('Card not found');
    }

    // Remove uploaded file
    if (card.pdfPath && fs.existsSync(card.pdfPath)) {
      try {
        fs.unlinkSync(card.pdfPath);
      } catch {
        console.warn(`Failed to delete file: ${card.pdfPath}`);
      }
    }

    await prisma.farmerCard.delete({
      where: { id: cardId },
    });
  }
}

export const adminService = new AdminService();
