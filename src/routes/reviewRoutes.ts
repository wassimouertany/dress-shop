import { Router } from 'express';
import { create, listByProduct } from '../controllers/reviewController';
import { protect } from '../middleware';

const router = Router();

router.route('/product/:productId').get(listByProduct);
router.route('/').post(protect, create);

export { router as reviewRoutes };
