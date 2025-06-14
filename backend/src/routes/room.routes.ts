import { Router } from 'express';
import {
  createRoom,
  getRooms,
  getRoom,
  updateRoom,
  deleteRoom,
  assignBandsToRoom,
} from '../controllers/room.controller';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin only routes
router.post('/', requireAdmin, createRoom);
router.put('/:id', requireAdmin, updateRoom);
router.delete('/:id', requireAdmin, deleteRoom);
router.post('/:roomId/assign-bands', requireAdmin, assignBandsToRoom);

// Routes accessible by both admin and band users
router.get('/', getRooms);
router.get('/:id', getRoom);

export default router; 