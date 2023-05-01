import { Router } from 'express';
import { getUserBooking } from '@/controllers/bookings-controller';

const bookingsRouter = Router();

bookingsRouter.get('/', getUserBooking);

export { bookingsRouter };
