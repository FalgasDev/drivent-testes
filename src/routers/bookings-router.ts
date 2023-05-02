import { Router } from 'express';
import { changeBooking, createBooking, getUserBooking } from '@/controllers/booking-controller';
import { authenticateToken } from '@/middlewares';

const bookingsRouter = Router();

bookingsRouter
  .all('/*', authenticateToken)
  .get('/', getUserBooking)
  .post('/', createBooking)
  .put('/:bookingId', changeBooking);

export { bookingsRouter };
