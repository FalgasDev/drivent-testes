import { Router } from 'express';
import { changeBooking, createBooking, getUserBooking } from '@/controllers/bookings-controller';

const bookingsRouter = Router();

bookingsRouter.get('/', getUserBooking).post('/', createBooking).put('/:bookingId', changeBooking);

export { bookingsRouter };
