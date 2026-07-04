import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleGuard.js';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN'));

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', (req, res, next) => adminController.getStats(req, res, next));

// GET /api/admin/users - List all users (paginated)
router.get('/users', (req, res, next) => adminController.getUsers(req, res, next));

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', (req, res, next) => adminController.deleteUser(req, res, next));

// GET /api/admin/cards - List all cards (paginated)
router.get('/cards', (req, res, next) => adminController.getCards(req, res, next));

// DELETE /api/admin/cards/:id - Delete any card
router.delete('/cards/:id', (req, res, next) => adminController.deleteCard(req, res, next));

export default router;
