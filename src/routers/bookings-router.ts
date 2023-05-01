import { Router } from 'express';
import { createBooking, getUserBooking } from '@/controllers/bookings-controller';

const bookingsRouter = Router();

bookingsRouter.get('/', getUserBooking).post('/', createBooking);

export { bookingsRouter };
