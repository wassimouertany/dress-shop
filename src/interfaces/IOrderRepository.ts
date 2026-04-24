import { OrderDocument } from '../models';

export interface IOrderRepository {
  findByIdAndUser(orderId: string, userId: string): Promise<OrderDocument | null>;
}