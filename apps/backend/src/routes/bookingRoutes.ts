import express from 'express';
import { getBookings, createBooking, updateStatus, updateBooking } from '../controllers/bookingController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { createBookingSchema, updateBookingStatusSchema, updateBookingSchema, getBookingsSchema } from '../validations/booking';

const router = express.Router();

router.use(authMiddleware);

router.get('/', validate(getBookingsSchema), getBookings);
router.post('/', validate(createBookingSchema), createBooking);
router.put('/:id', validate(updateBookingSchema), updateBooking);
router.patch('/:id/status', validate(updateBookingStatusSchema), updateStatus);

export default router;
