import { Router } from 'express';
import {
  createBooking,
  getBookings,
  updateBooking,
  deleteBooking,
} from '../controllers/bookingController';

const router = Router();

router.post('/', createBooking);
router.get('/', getBookings);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);

export default router; 