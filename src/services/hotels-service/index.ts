import { notFoundError, paymentRequired } from '@/errors';
import enrollmentRepository from '@/repositories/enrollment-repository';
import hotelsRepository from '@/repositories/hotels-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function checkBusinessRules(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if (!enrollment || !ticket) {
    throw notFoundError();
  } else if (ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw paymentRequired();
  }
}

async function getAllHotels() {
  return await hotelsRepository.getAllHotels();
}

const hotelsService = {
  checkBusinessRules,
  getAllHotels,
};

export default hotelsService;
