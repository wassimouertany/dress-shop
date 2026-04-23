import { Order } from '../models';
import { Livraison, StatusEnum, LivraisonDocument } from '../models/Livraison';
import { ILivraisonRepository } from '../interfaces/ILivraisonRepository';
import { ILivraisonService } from '../interfaces/ILivraisonService';

export class LivraisonService implements ILivraisonService {

  private readonly livraisonRepository: ILivraisonRepository;

  constructor(livraisonRepository: ILivraisonRepository) {
    this.livraisonRepository = livraisonRepository;
  }

  async getLivraisonByOrder(
    userId: string,
    orderId: string
  ): Promise<LivraisonDocument> {
    const order = await Order.findOne({ _id: orderId, user: userId }).exec();
    if (!order) {
      throw new Error('Order not found');
    }

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
    if (!Livraison.isValidStatus(status)) throw new Error('Invalid status');

    const livraison = await this.livraisonRepository.findById(livraisonId);
    if (!livraison) {
      throw new Error('Livraison not found');
    }

    const order = await Order.findOne({
      _id: livraison.order,
      user: userId,
    }).exec();
    if (!order) {
      throw new Error('Not allowed');
    }

    livraison.applyStatusTransition(status as StatusEnum);
    const updated = await livraison.save();

    return updated;
  }
}