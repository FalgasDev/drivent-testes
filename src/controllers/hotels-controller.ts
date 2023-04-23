import { Hotel } from '@prisma/client';
import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import hotelsService from '@/services/hotels-service';
import { AuthenticatedRequest } from '@/middlewares';

export async function getAllHotels(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;

  try {
    await hotelsService.checkBusinessRules(userId);
    const hotels: Hotel[] = await hotelsService.getAllHotels();
    return res.status(httpStatus.OK).send(hotels);
  } catch (err) {
    if (err.name !== 'NotFoundError' && err.name !== 'PaymentRequired') {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }
    next(err);
  }
}
