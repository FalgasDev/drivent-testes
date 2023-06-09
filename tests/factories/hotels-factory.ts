import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotel() {
  return prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.internet.url(),
    },
  });
}

export async function createRoom(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity: 3,
      hotelId,
    },
  });
}

export async function createSingleRoom(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity: 1,
      hotelId,
    },
  });
}
