import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingsService from '@/services/bookings-service';

export async function getUserBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;

  try {
    const booking = await bookingsService.getUserBooking(userId);
    return res.status(httpStatus.OK).send(booking);
  } catch (err) {
    if (err.name !== 'NotFoundError') {
      return res.status(httpStatus.BAD_REQUEST).send(err.message);
    }
    next(err);
  }
}

export async function createBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  const { roomId } = req.body;

  try {
    const bookingId = await bookingsService.createBooking(userId, roomId);
    return res.status(httpStatus.OK).send(bookingId);
  } catch (err) {
    if (err.name !== 'NotFoundError' && err.name !== 'ForbiddenError') {
      return res.status(httpStatus.BAD_REQUEST).send(err.message);
    }
    next(err);
  }
}

export async function changeBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  const { bookingId } = req.params;
  const { roomId } = req.body;

  try {
    const booking = await bookingsService.changeBooking(userId, Number(bookingId), roomId);
    return res.status(httpStatus.OK).send({ bookingId: booking });
  } catch (err) {
    if (err.name !== 'NotFoundError' && err.name !== 'ForbiddenError') {
      return res.status(httpStatus.BAD_REQUEST).send(err.message);
    }
    next(err);
  }
}
