import { Order, OrderDocument } from '../models';

export const getOrdersByUser = (userId: string): Promise<OrderDocument[]> =>
  Order.find({ user: userId })
    .populate({ path: 'items', populate: { path: 'product' } })
    .sort('-createdAt')
    .exec();  