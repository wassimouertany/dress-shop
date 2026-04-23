import { Router } from 'express';
import { protect } from '../middleware';
import { livraisonController } from '../container';

const router = Router();
router.use(protect);

router.route('/order/:orderId').get(livraisonController.getByOrder);
router.route('/:id').patch(livraisonController.updateStatus);

export { router as livraisonRoutes };