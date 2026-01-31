import express from 'express';
import { getBookings, createBooking, updateStatus } from '../controllers/bookingController';

const router = express.Router();

router.get('/', getBookings);
router.post('/', createBooking);
router.patch('/:id/status', updateStatus);

export default router;
