import { Router } from 'express';
import { payment } from '../controllers/paymentController';
import { protect } from '../middleware';

const router = Router();

router.route('/').post(protect, payment);

export { router as paymentRoutes };
