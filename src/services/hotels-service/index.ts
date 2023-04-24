import { notFoundError, paymentRequired } from '@/errors';
import enrollmentRepository from '@/repositories/enrollment-repository';
import hotelsRepository from '@/repositories/hotels-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function checkBusinessRules(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();

  if (ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw paymentRequired();
  }
}

async function getAllHotels() {
  const hotels = await hotelsRepository.getAllHotels();

  if (hotels.length === 0) {
    throw notFoundError();
  }

  return hotels;
}

async function getAllRoomsByHotelId(hotelId: number) {
  const rooms = await hotelsRepository.getAllRoomsByHotelId(hotelId);

  if (!rooms) {
    throw notFoundError();
  }

  return rooms;
}

const hotelsService = {
  checkBusinessRules,
  getAllHotels,
  getAllRoomsByHotelId,
};

export default hotelsService;
