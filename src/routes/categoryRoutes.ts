import { Router } from 'express';
import { index, store } from '../controllers/categoryController';
import { protect, authorize } from '../middleware';


const router = Router();

router.route('/').get(index).post(protect, authorize('admin'), store);

export { router as categoryRoutes };
