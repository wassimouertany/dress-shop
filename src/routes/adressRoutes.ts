import { Router } from 'express';
import { index, store, remove } from '../controllers/adressController';
import { protect } from '../middleware';

const router = Router();

router.use(protect);

router.route('/').get(index).post(store);
router.route('/:id').delete(remove);

export { router as adressRoutes };
