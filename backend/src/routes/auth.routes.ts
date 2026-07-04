import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .custom((value, { req }) => {
        if (!req.body.googleId && (!value || value.length < 6)) {
          throw new Error('Password must be at least 6 characters long');
        }
        return true;
      }),
    body('phone')
      .optional()
      .trim()
      .isMobilePhone('any')
      .withMessage('Please provide a valid phone number'),
  ],
  validate,
  (req: any, res: any, next: any) => authController.register(req, res, next)
);

router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  validate,
  (req: any, res: any, next: any) => authController.login(req, res, next)
);

router.post(
  '/logout',
  authenticate,
  (req: any, res: any, next: any) => authController.logout(req, res, next)
);

router.post(
  '/refresh',
  (req: any, res: any, next: any) => authController.refresh(req, res, next)
);

router.post(
  '/forgot-password',
  [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
  ],
  validate,
  (req: any, res: any, next: any) => authController.forgotPassword(req, res, next)
);

router.post(
  '/reset-password',
  [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  validate,
  (req: any, res: any, next: any) => authController.resetPassword(req, res, next)
);

router.get(
  '/verify-email/:token',
  (req: any, res: any, next: any) => authController.verifyEmail(req, res, next)
);

router.get(
  '/google',
  (req: any, res: any, next: any) => authController.googleAuth(req, res, next)
);

router.get(
  '/google/callback',
  (req: any, res: any, next: any) => authController.googleCallback(req, res, next)
);

router.post(
  '/payment-order',
  (req: any, res: any, next: any) => authController.paymentOrder(req, res, next)
);

router.post(
  '/webhook/razorpay',
  (req: any, res: any, next: any) => authController.razorpayWebhook(req, res, next)
);

router.get(
  '/razorpay-key',
  (req: any, res: any, next: any) => authController.getRazorpayKey(req, res, next)
);

export default router;
