
import { StatusEnum, LivraisonDocument } from '../models/Livraison';
import { ILivraisonRepository }           from '../interfaces/ILivraisonRepository';
import { ILivraisonService }              from '../interfaces/ILivraisonService';
import { LivraisonStatusValidator }       from '../validators/livraisonStatusValidator';
import { LivraisonOwnershipGuard }        from '../guards/livraisonOwnershipGuard';

export class LivraisonService implements ILivraisonService {

  private readonly livraisonRepository: ILivraisonRepository;

  constructor(livraisonRepository: ILivraisonRepository) {
    this.livraisonRepository = livraisonRepository;
  }

  async getLivraisonByOrder(
    userId:  string,
    orderId: string
  ): Promise<LivraisonDocument> {
    await LivraisonOwnershipGuard.verifyOrderOwnership(userId, orderId);

    const livraison = await this.livraisonRepository.findByOrder(orderId);
    if (!livraison) {
      throw new Error('Livraison not found');
    }

    return livraison;
  }

  async updateLivraisonStatus(
    userId:      string,
    livraisonId: string,
    status:      string
  ): Promise<LivraisonDocument> {
    LivraisonStatusValidator.validate(status);

    const livraison = await this.livraisonRepository.findById(livraisonId);
    if (!livraison) {
      throw new Error('Livraison not found');
    }

    await LivraisonOwnershipGuard.verifyLivraisonOwnership(userId, livraison.order);

    LivraisonStatusValidator.applyTransition(livraison, status as StatusEnum);

    return livraison.save();
  }
}