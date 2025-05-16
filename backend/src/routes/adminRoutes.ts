import { Router } from 'express';
import { createUser } from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Admin-only: create user
router.post('/users', authenticate, requireAdmin, createUser);

export default router; 