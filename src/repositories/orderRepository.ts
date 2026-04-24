import { Order, OrderDocument } from '../models';
import { IOrderRepository } from '../interfaces/IOrderRepository';

export class OrderRepository implements IOrderRepository {
  findByIdAndUser(orderId: string, userId: string): Promise<OrderDocument | null> {
    return Order.findOne({ _id: orderId, user: userId }).exec();
  }
}