import { Router } from 'express';
import { getByOrder, updateStatus } from '../controllers/livraisonController';
import { protect } from '../middleware';

const router = Router();

router.use(protect);

router.route('/order/:orderId').get(getByOrder);
router.route('/:id').patch(updateStatus);

export { router as livraisonRoutes };
