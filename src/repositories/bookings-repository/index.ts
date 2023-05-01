import { prisma } from '@/config';

async function getUserBooking(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
    select: {
      id: true,
      Room: true,
    },
  });
}

const bookingsRepository = {
  getUserBooking,
};

export default bookingsRepository;
