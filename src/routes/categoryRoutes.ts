import { Router } from 'express';
import { index, store } from '../controllers/categoryController';
import { protect, authorize, uploadImage } from '../middleware';

const router = Router();

router
  .route('/')
  .get(index)
  .post(uploadImage, protect, authorize('ADMIN'), store);

export { router as categoryRoutes };
