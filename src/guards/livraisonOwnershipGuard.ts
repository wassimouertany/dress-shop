import { Types } from 'mongoose';
import { IOrderRepository } from '../interfaces/IOrderRepository';

export class LivraisonOwnershipGuard {

  constructor(private readonly orderRepository: IOrderRepository) {}

  async verifyOrderOwnership(userId: string, orderId: string): Promise<void> {
    const order = await this.orderRepository.findByIdAndUser(orderId, userId);
    if (!order) {
      throw new Error('Order not found');
    }
  }

  async verifyLivraisonOwnership(
    userId: string,
    livraisonOrderId: Types.ObjectId
  ): Promise<void> {
    const order = await this.orderRepository.findByIdAndUser(
      String(livraisonOrderId),
      userId
    );
    if (!order) {
      throw new Error('Not allowed');
    }
  }
}