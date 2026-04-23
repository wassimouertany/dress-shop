import { Request, Response } from 'express';
import { IdentifiableUser } from '../types';
import { Order } from '../models';

export const index = async (req: Request, res: Response) => {
  try {
    const user = req.user as IdentifiableUser;
    const orders = await Order.find({ user: user._id })
      .populate({
        path: 'items',
        populate: { path: 'product' },
      })
      .sort('-createdAt');
    res.status(200).json({ data: orders });
  } catch (error) {
    return res.status(500).json({ message: 'Error in getting orders' });
  }
};
