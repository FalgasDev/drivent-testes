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
