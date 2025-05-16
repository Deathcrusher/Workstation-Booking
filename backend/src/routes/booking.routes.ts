import { Router } from 'express';
import {
  createBooking,
  getBookings,
  updateBooking,
  deleteBooking,
} from '../controllers/booking.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/', createBooking);
router.get('/', getBookings);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);

export default router; 