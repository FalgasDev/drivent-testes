import { forbiddenError, notFoundError } from '@/errors';
import bookingsRepository from '@/repositories/bookings-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function getUserBooking(userId: number) {
  const booking = await bookingsRepository.getUserBooking(userId);

  if (!booking) {
    throw notFoundError();
  }

  return booking;
}

async function createBooking(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) {
    throw forbiddenError();
  }

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket) {
    throw forbiddenError();
  } else if (ticket.status !== 'PAID') {
    throw forbiddenError();
  } else if (ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw forbiddenError();
  }

  const bookingsRoom = await bookingsRepository.getAllBookingsRoom(roomId);

  if (!roomId || !bookingsRoom) {
    throw notFoundError();
  }

  if (bookingsRoom.Booking.length >= bookingsRoom.capacity) {
    throw forbiddenError();
  }

  const booking = await bookingsRepository.createBooking(userId, roomId);

  return booking.id;
}

const bookingsService = {
  getUserBooking,
  createBooking,
};

export default bookingsService;
