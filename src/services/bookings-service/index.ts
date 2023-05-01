import { notFoundError } from '@/errors';
import bookingsRepository from '@/repositories/bookings-repository';

async function getUserBooking(userId: number) {
  const booking = await bookingsRepository.getUserBooking(userId);

  if (!booking) {
    throw notFoundError();
  }

  return booking;
}

const bookingsService = {
  getUserBooking,
};

export default bookingsService;
