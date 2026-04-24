// src/services/livraisonService.ts
import { LivraisonDocument }           from '../models/Livraison';
import { ILivraisonRepository }        from '../interfaces/ILivraisonRepository';
import { ILivraisonService }           from '../interfaces/ILivraisonService';
import { LivraisonOwnershipGuard }     from '../guards/livraisonOwnershipGuard';
import { LivraisonContext }            from '../states/LivraisonContext';
import { LivraisonStatusValidator } from '../validators/livraisonStatusValidator';

export class LivraisonService implements ILivraisonService {

  constructor(
    private readonly livraisonRepository: ILivraisonRepository,
    private readonly ownershipGuard: LivraisonOwnershipGuard
  ) {}

  async getLivraisonByOrder(
    userId: string,
    orderId: string
  ): Promise<LivraisonDocument> {
    await this.ownershipGuard.verifyOrderOwnership(userId, orderId);

    const livraison = await this.livraisonRepository.findByOrder(orderId);
    if (!livraison) {
      throw new Error('Livraison not found');
    }
    return livraison;
  }

  async updateLivraisonStatus(
    userId: string,
    livraisonId: string,
    status: string
  ): Promise<LivraisonDocument> {
    const livraison = await this.livraisonRepository.findById(livraisonId);
    if (!livraison) {
      throw new Error('Livraison not found');
    }

    await this.ownershipGuard.verifyLivraisonOwnership(userId, livraison.order);


    LivraisonStatusValidator.validate(status);
    // State Pattern : on crée le contexte à partir du statut courant du document
    // puis on délègue la transition — plus de LivraisonStatusValidator ici
    const context = new LivraisonContext(livraison);
    context.transition(status);  // lève une Error si transition illégale

    await livraison.save();
    await livraison.populate('address').execPopulate();
    return livraison; }
}