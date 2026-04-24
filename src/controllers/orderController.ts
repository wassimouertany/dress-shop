import { Request, Response } from 'express';
import { IdentifiableUser } from '../types';
import { getOrdersByUser } from '../services/orderService';

export const index = async (req: Request, res: Response) => {
  try {
    const user = req.user as IdentifiableUser;
    const orders = await getOrdersByUser(String(user._id));
    res.status(200).json({ data: orders });
  } catch (error) {
    return res.status(500).json({ message: 'Error in getting orders' });
  }
};