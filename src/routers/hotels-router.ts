import { Router } from 'express';
import { getAllHotels } from '@/controllers/hotels-controller';

const hotelsRouter = Router();

hotelsRouter.get('/', getAllHotels);

export { hotelsRouter };
