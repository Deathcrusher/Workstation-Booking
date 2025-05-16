import { Router } from 'express';
import {
  createBooking,
  getBookings,
  updateBooking,
  deleteBooking,
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createBooking);
router.get('/', getBookings);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);

export default router; 