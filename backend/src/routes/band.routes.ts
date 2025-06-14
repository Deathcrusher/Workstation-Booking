import { Router } from 'express';
import {
  createBand,
  getBands,
  getBand,
  updateBand,
  deleteBand,
} from '../controllers/band.controller';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin only routes
router.post('/', requireAdmin, createBand);
router.put('/:id', requireAdmin, updateBand);
router.delete('/:id', requireAdmin, deleteBand);

// Routes accessible by both admin and band users
router.get('/', getBands);
router.get('/:id', getBand);

export default router; 