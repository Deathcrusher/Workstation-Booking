import { Router } from 'express';
import {
  createBand,
  getBands,
  getBand,
  updateBand,
  deleteBand,
} from '../controllers/band.controller';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Admin only routes
router.post('/', isAdmin, createBand);
router.put('/:id', isAdmin, updateBand);
router.delete('/:id', isAdmin, deleteBand);

// Routes accessible by both admin and band users
router.get('/', getBands);
router.get('/:id', getBand);

export default router; 