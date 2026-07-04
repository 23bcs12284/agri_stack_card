import { Request, Response, NextFunction } from 'express';
import { cardService } from '../services/card.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export class CardController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;

      // Parse landRecords from string if sent via multipart form
      let data = { ...req.body };
      if (typeof data.landRecords === 'string') {
        try {
          data.landRecords = JSON.parse(data.landRecords);
        } catch {
          data.landRecords = [];
        }
      }
      if (typeof data.jsonData === 'string') {
        try {
          data.jsonData = JSON.parse(data.jsonData);
        } catch {
          data.jsonData = null;
        }
      }

      const card = await cardService.createCard(userId, data, req.file);

      ApiResponse.created(res, card, 'Card created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await cardService.getCardsByUser(userId, page, limit);

      ApiResponse.success(res, result, 'Cards retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const cardId = parseInt(req.params.id as string, 10);

      if (isNaN(cardId)) {
        res.status(400).json({ success: false, message: 'Invalid card ID' });
        return;
      }

      const card = await cardService.getCardById(cardId, userId);

      ApiResponse.success(res, card, 'Card retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const cardId = parseInt(req.params.id as string, 10);

      if (isNaN(cardId)) {
        res.status(400).json({ success: false, message: 'Invalid card ID' });
        return;
      }

      let data = { ...req.body };
      if (typeof data.landRecords === 'string') {
        try {
          data.landRecords = JSON.parse(data.landRecords);
        } catch {
          data.landRecords = [];
        }
      }
      if (typeof data.jsonData === 'string') {
        try {
          data.jsonData = JSON.parse(data.jsonData);
        } catch {
          data.jsonData = null;
        }
      }

      const card = await cardService.updateCard(cardId, userId, data);

      ApiResponse.success(res, card, 'Card updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const cardId = parseInt(req.params.id as string, 10);

      if (isNaN(cardId)) {
        res.status(400).json({ success: false, message: 'Invalid card ID' });
        return;
      }

      await cardService.deleteCard(cardId, userId);

      ApiResponse.noContent(res, 'Card deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const query = req.query.q as string || '';

      const cards = await cardService.searchCards(userId, query);

      ApiResponse.success(res, cards, 'Search results');
    } catch (error) {
      next(error);
    }
  }
}

export const cardController = new CardController();
