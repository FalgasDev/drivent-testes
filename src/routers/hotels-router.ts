import { Router } from 'express';
import { getAllHotels, getAllRoomsByHotelId } from '@/controllers/hotels-controller';
import { authenticateToken } from '@/middlewares';

const hotelsRouter = Router();

hotelsRouter.all('/*', authenticateToken).get('/', getAllHotels).get('/:hotelId', getAllRoomsByHotelId);

export { hotelsRouter };
