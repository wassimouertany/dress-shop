import { Router } from 'express';
import { index, store } from '../controllers/categoryController';
import { protect, authorize, uploadImage } from '../middleware';
import { Role } from '../types';


const router = Router();

router
  .route('/')
  .get(index)
  .post(uploadImage, protect, authorize(Role.Admin), store);

export { router as categoryRoutes };
