import { Request, Response } from 'express';
import { Livraison, Order, StatusEnum } from '../models';
import { User as UserType } from '../types';

const STATUS_VALUES = [
  StatusEnum.Shipped,
  StatusEnum.InTransit,
  StatusEnum.Delivered,
];

export const getByOrder = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserType;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const livraison = await Livraison.findOne({ order: orderId }).populate(
      'address'
    );

    if (!livraison) {
      return res.status(404).json({ message: 'Livraison not found' });
    }

    res.status(200).json({ data: livraison, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching livraison' });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserType;
    const { id } = req.params;
    const { status } = req.body as { status?: string };

    if (!status || !STATUS_VALUES.includes(status as StatusEnum)) {
      return res.status(400).json({
        message: 'Invalid status; use SHIPPED, IN_TRANSIT, or DELIVERED',
      });
    }

    const livraison = await Livraison.findById(id);
    if (!livraison) {
      return res.status(404).json({ message: 'Livraison not found' });
    }

    const order = await Order.findOne({
      _id: livraison.order,
      user: user._id,
    });
    if (!order) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const payload: Record<string, unknown> = { status };
    if (status === StatusEnum.Delivered) {
      payload.deliveredAt = new Date();
    }

    const updated = await Livraison.findByIdAndUpdate(id, payload, {
      new: true,
    }).populate('address');

    res.status(200).json({ data: updated, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error updating livraison' });
  }
};
