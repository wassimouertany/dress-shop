import { LivraisonDocument } from '../models/Livraison';

export interface ILivraisonRepository {
  findByOrder(orderId: string): Promise<LivraisonDocument | null>;
  findById(livraisonId: string): Promise<LivraisonDocument | null>;
  updateStatus(
    livraisonId: string,
    status: string,
    deliveredAt?: Date
  ): Promise<LivraisonDocument | null>;
}