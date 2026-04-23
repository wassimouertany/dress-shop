import { Types } from 'mongoose';
import { Order } from '../models';

export class LivraisonOwnershipGuard {

  static async verifyOrderOwnership(
    userId:  string,
    orderId: string
  ): Promise<void> {
    const order = await Order.findOne({ _id: orderId, user: userId }).exec();
    if (!order) {
      throw new Error('Order not found');
    }
  }

  static async verifyLivraisonOwnership(
    userId:           string,
    livraisonOrderId: Types.ObjectId
  ): Promise<void> {
    const order = await Order.findOne({
      _id:  livraisonOrderId,
      user: userId,
    }).exec();
    if (!order) {
      throw new Error('Not allowed');
    }
  }
}