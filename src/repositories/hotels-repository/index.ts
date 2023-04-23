import { prisma } from '@/config';

async function getAllHotels() {
  return prisma.hotel.findMany();
}

const hotelsRepository = {
  getAllHotels,
};

export default hotelsRepository;
