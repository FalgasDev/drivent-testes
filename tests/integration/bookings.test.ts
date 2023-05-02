import supertest from 'supertest';
import * as jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createEnrollmentWithAddress,
  createHotel,
  createRoom,
  createSingleRoom,
  createTicket,
  createTicketTypeWithHotel,
  createTicketTypeRemote,
  createUser,
  createBooking,
} from '../factories';
import app, { init } from '@/app';

const server = supertest(app);

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

describe('GET: /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is invalid', async () => {
    const token = faker.lorem.word();
    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no active session for the received token', async () => {
    const user = await createUser();
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('When token is valid', () => {
    it('should respond with status 404 if dont have booking for the user', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 200 and with booking object', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const booking = await createBooking(user.id, room.id);
      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          capacity: room.capacity,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
          hotelId: room.hotelId,
          id: room.id,
          name: room.name,
        },
      });
    });
  });
});

describe('POST: /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const body = { roomId: faker.datatype.number() };
    const response = await server.post('/booking').send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is invalid', async () => {
    const body = { roomId: faker.datatype.number() };
    const token = faker.lorem.word();
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no active session for the received token', async () => {
    const body = { roomId: faker.datatype.number() };
    const user = await createUser();
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('When token is valid', () => {
    it('should respond with status 403 if the user doesnt have a enrollment', async () => {
      const body = { roomId: faker.datatype.number() };
      const token = await generateValidToken();
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if the user doesnt have a valid ticket', async () => {
      const body = { roomId: faker.datatype.number() };
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if the ticket isnt paid', async () => {
      const body = { roomId: faker.datatype.number() };
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticket = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticket.id, 'RESERVED');
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if the ticket type is remote', async () => {
      const body = { roomId: faker.datatype.number() };
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticket = await createTicketTypeRemote();
      await createTicket(enrollment.id, ticket.id, 'PAID');
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 404 if roomId is invalid', async () => {
      const body = { roomId: faker.datatype.number() };
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticket = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticket.id, 'PAID');
      const hotel = await createHotel();
      const room = await createSingleRoom(hotel.id);
      await createBooking(user.id, room.id);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 if the hotel room has the maximum of his capacity', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticket = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticket.id, 'PAID');
      const hotel = await createHotel();
      const room = await createSingleRoom(hotel.id);
      const body = { roomId: room.id };
      await createBooking(user.id, room.id);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200 and with the bookingId', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticket = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticket.id, 'PAID');
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const body = { roomId: room.id };
      await createBooking(user.id, room.id);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        bookingId: expect.any(Number),
      });
    });
  });
});

describe('POST: /booking/:bookingId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const body = { roomId: faker.datatype.number() };
    const response = await server.put('/booking/1337').send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is invalid', async () => {
    const body = { roomId: faker.datatype.number() };
    const token = faker.lorem.word();
    const response = await server.put('/booking/1337').set('Authorization', `Bearer ${token}`).send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no active session for the received token', async () => {
    const body = { roomId: faker.datatype.number() };
    const user = await createUser();
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    const response = await server.put('/booking/1337').set('Authorization', `Bearer ${token}`).send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('When token is valid', () => {
    it('should respond with status 404 if roomId is invalid', async () => {
      const body = { roomId: faker.datatype.number() };
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      await createRoom(hotel.id);
      const response = await server.put('/booking/1337').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 if doesnt have a booking for the user', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const body = { roomId: room.id };
      const response = await server.put('/booking/1337').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if hotel room has the maximum of his capacity', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const lastRoom = await createRoom(hotel.id);
      const newRoom = await createSingleRoom(hotel.id);
      const body = { roomId: newRoom.id };
      const booking = await createBooking(user.id, lastRoom.id);
      await createBooking(user.id, newRoom.id);
      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if user isnt the owner of this booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const body = { roomId: room.id };
      await createBooking(user.id, room.id);
      const otherUser = await createUser();
      const otherBooking = await createBooking(otherUser.id, room.id);
      const response = await server
        .put(`/booking/${otherBooking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200 and with the bookingId', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const lastRoom = await createRoom(hotel.id);
      const newRoom = await createRoom(hotel.id);
      const body = { roomId: newRoom.id };
      const booking = await createBooking(user.id, lastRoom.id);
      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        bookingId: booking.id,
      });
    });
  });
});
