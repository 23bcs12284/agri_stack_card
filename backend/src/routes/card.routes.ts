import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { cardController } from '../controllers/card.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadPdf } from '../middleware/upload.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

const parseFarmerDataBody = (req: any, _res: any, next: any) => {
  if (req.body && req.body.farmerData) {
    try {
      const parsed = JSON.parse(req.body.farmerData);
      req.body = { ...req.body, ...parsed };
    } catch (e) {
      // ignore
    }
  }
  next();
};

// POST / — Create a new card
router.post(
  '/',
  uploadPdf,
  parseFarmerDataBody,
  [
    body('farmerName')
      .trim()
      .notEmpty()
      .withMessage('Farmer name is required'),
  ],
  validate,
  (req: any, res: any, next: any) => cardController.create(req, res, next)
);

// GET / — List cards (paginated)
router.get(
  '/',
  (req: any, res: any, next: any) => cardController.getAll(req, res, next)
);

// GET /search — Search cards (MUST be before /:id to avoid conflict)
router.get(
  '/search',
  [
    query('q')
      .trim()
      .notEmpty()
      .withMessage('Search query is required'),
  ],
  validate,
  (req: any, res: any, next: any) => cardController.search(req, res, next)
);

// GET /:id — Get single card
router.get(
  '/:id',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Card ID must be a positive integer'),
  ],
  validate,
  (req: any, res: any, next: any) => cardController.getById(req, res, next)
);

// PUT /:id — Update card
router.put(
  '/:id',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Card ID must be a positive integer'),
    body('farmerName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Farmer name cannot be empty'),
  ],
  validate,
  (req: any, res: any, next: any) => cardController.update(req, res, next)
);

// DELETE /:id — Delete card
router.delete(
  '/:id',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Card ID must be a positive integer'),
  ],
  validate,
  (req: any, res: any, next: any) => cardController.remove(req, res, next)
);

export default router;
