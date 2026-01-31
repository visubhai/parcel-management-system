import express from 'express';
import { getBookings, createBooking, updateStatus, updateBooking } from '../controllers/bookingController';

const router = express.Router();

router.get('/', getBookings);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.patch('/:id/status', updateStatus);

export default router;
