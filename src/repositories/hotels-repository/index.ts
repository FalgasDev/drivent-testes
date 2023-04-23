import { prisma } from '@/config';

async function getAllHotels() {
  return prisma.hotel.findMany();
}

async function getAllRoomsByHotelId(hotelId: number) {
  return prisma.room.findMany({
    where: {
      hotelId,
    },
    include: {
      Hotel: true,
    },
  });
}

const hotelsRepository = {
  getAllHotels,
  getAllRoomsByHotelId,
};

export default hotelsRepository;
