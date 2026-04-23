import { Livraison, LivraisonDocument } from '../models/Livraison';
import { ILivraisonRepository } from '../interfaces/ILivraisonRepository';

export class LivraisonRepository implements ILivraisonRepository {

  async findByOrder(orderId: string): Promise<LivraisonDocument | null> {
    return Livraison.findOne({ order: orderId })
      .populate('address')
      .exec();
  }

  async findById(livraisonId: string): Promise<LivraisonDocument | null> {
    return Livraison.findById(livraisonId).exec();
  }

  async updateStatus(
    livraisonId: string,
    status: string,
    deliveredAt?: Date
  ): Promise<LivraisonDocument | null> {
    const payload: Record<string, unknown> = { status };
    if (deliveredAt) {
      payload.deliveredAt = deliveredAt;
    }
    return Livraison.findByIdAndUpdate(livraisonId, payload, { new: true })
      .populate('address')
      .exec();
  }
}