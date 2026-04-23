import { LivraisonRepository } from './repositories/livraisonRepository';
import { LivraisonService }    from './services/livraisonService';
import { LivraisonController } from './controllers/livraisonController';

const livraisonRepository = new LivraisonRepository();
const livraisonService    = new LivraisonService(livraisonRepository);

export const livraisonController = new LivraisonController(livraisonService);