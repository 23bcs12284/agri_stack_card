import { Router } from 'express';
import { body } from 'express-validator';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /profile
router.get(
  '/profile',
  (req: any, res: any, next: any) => userController.getProfile(req, res, next)
);

// PUT /profile
router.put(
  '/profile',
  [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('phone')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isMobilePhone('any')
      .withMessage('Please provide a valid phone number'),
  ],
  validate,
  (req: any, res: any, next: any) => userController.updateProfile(req, res, next)
);

// PUT /change-password
router.put(
  '/change-password',
  [
    body('oldPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),
  ],
  validate,
  (req: any, res: any, next: any) => userController.changePassword(req, res, next)
);

export default router;
