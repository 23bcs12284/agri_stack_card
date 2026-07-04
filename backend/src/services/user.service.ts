import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';

interface ProfileUpdateInput {
  name?: string;
  phone?: string;
  avatar?: string;
}

export class UserService {
  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  async updateProfile(userId: number, data: ProfileUpdateInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name ?? user.name,
        phone: data.phone !== undefined ? data.phone : user.phone,
        avatar: data.avatar !== undefined ? data.avatar : user.avatar,
      },
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
      },
    });

    return updated;
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password || '');
    if (!isOldPasswordValid) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
        },
      });
      // Invalidate all active sessions for this user on password change
      await tx.session.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      });
    });
  }
}

export const userService = new UserService();
