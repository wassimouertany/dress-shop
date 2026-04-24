import { LivraisonRepository }     from './repositories/livraisonRepository';
import { OrderRepository }         from './repositories/orderRepository';
import { LivraisonOwnershipGuard } from './guards/livraisonOwnershipGuard';
import { LivraisonService }        from './services/livraisonService';
import { LivraisonController }     from './controllers/livraisonController';

// ── Repositories ──────────────────────────────────────────────────────────────
const livraisonRepository = new LivraisonRepository();
const orderRepository     = new OrderRepository();

// ── Guards ────────────────────────────────────────────────────────────────────
const ownershipGuard = new LivraisonOwnershipGuard(orderRepository);

// ── Services ──────────────────────────────────────────────────────────────────
const livraisonService = new LivraisonService(livraisonRepository, ownershipGuard);

// ── Controllers ───────────────────────────────────────────────────────────────
export const livraisonController = new LivraisonController(livraisonService);