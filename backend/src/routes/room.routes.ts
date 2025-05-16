import { Router } from 'express';
import {
  createRoom,
  getRooms,
  getRoom,
  updateRoom,
  deleteRoom,
  assignBandsToRoom,
} from '../controllers/room.controller';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Admin only routes
router.post('/', isAdmin, createRoom);
router.put('/:id', isAdmin, updateRoom);
router.delete('/:id', isAdmin, deleteRoom);
router.post('/:roomId/assign-bands', isAdmin, assignBandsToRoom);

// Routes accessible by both admin and band users
router.get('/', getRooms);
router.get('/:id', getRoom);

export default router; 