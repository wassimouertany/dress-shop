// src/container.ts — aucune modification nécessaire
import { LivraisonRepository }     from './repositories/livraisonRepository';
import { OrderRepository }         from './repositories/orderRepository';
import { LivraisonOwnershipGuard } from './guards/livraisonOwnershipGuard';
import { LivraisonService }        from './services/livraisonService';
import { LivraisonController }     from './controllers/livraisonController';


const livraisonRepository = new LivraisonRepository();
const orderRepository     = new OrderRepository();

const ownershipGuard = new LivraisonOwnershipGuard(orderRepository);

const livraisonService = new LivraisonService(livraisonRepository, ownershipGuard);

export const livraisonController = new LivraisonController(livraisonService);