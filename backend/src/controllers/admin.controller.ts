import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export class AdminController {
  async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await adminService.getDashboardStats();

      ApiResponse.success(res, stats, 'Dashboard stats retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await adminService.getAllUsers(page, limit);

      ApiResponse.success(res, result, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string, 10);

      if (isNaN(userId)) {
        res.status(400).json({ success: false, message: 'Invalid user ID' });
        return;
      }

      await adminService.deleteUser(userId);

      ApiResponse.noContent(res, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getCards(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await adminService.getAllCards(page, limit);

      ApiResponse.success(res, result, 'Cards retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cardId = parseInt(req.params.id as string, 10);

      if (isNaN(cardId)) {
        res.status(400).json({ success: false, message: 'Invalid card ID' });
        return;
      }

      await adminService.deleteCardAdmin(cardId);

      ApiResponse.noContent(res, 'Card deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
