import mongoose from 'mongoose';
import { Request, Response } from 'express';
import {
  Address,
  Cart,
  CartItem,
  Livraison,
  Order,
  OrderItem,
  Payment,
  PaymentMethodEnum,
  PaymentStatusEnum,
  StatusEnum,
} from '../models';
import { User as UserType } from '../types';

const METHOD_VALUES: PaymentMethodEnum[] = [
  PaymentMethodEnum.Paypal,
  PaymentMethodEnum.Stripe,
];

export const payment = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserType;
    const { method, addressId } = req.body as {
      method?: string;
      addressId?: string;
    };

    if (!method || !METHOD_VALUES.includes(method as PaymentMethodEnum)) {
      return res.status(400).json({
        message: 'Invalid or missing method; use PAYPAL or STRIPE',
      });
    }

    if (!addressId) {
      return res.status(400).json({ message: 'addressId is required' });
    }

    const address = await Address.findOne({
      _id: addressId,
      user: user._id,
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const cart = await Cart.findOne({ user: user._id }).populate({
      path: 'items',
      populate: { path: 'product' },
    });

    if (!cart?.items?.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const total = cart.items.reduce(
      (acc: number, el: any) =>
        acc + el.product.price * el.quantity,
      0
    );

    const order = await Order.create({
      user: user._id,
      total,
      address: address._id,
    });

    await OrderItem.insertMany(
      cart.items.map((item: any) => ({
        order: order._id,
        quantity: item.quantity,
        product: item.product._id ?? item.product,
      }))
    );

    let paymentRecord = await Payment.create({
      order: order._id,
      amount: total,
      method,
      status: PaymentStatusEnum.Pending,
      transactionId: new mongoose.Types.ObjectId().toString(),
    });

    paymentRecord = (await Payment.findByIdAndUpdate(
      paymentRecord._id,
      { status: PaymentStatusEnum.Completed },
      { new: true }
    ))!;

    const livraison = await Livraison.create({
      order: order._id,
      address: address._id,
      status: StatusEnum.Shipped,
      trackingNumber: `TRK-${new mongoose.Types.ObjectId().toString()}`,
    });

    await Order.findByIdAndUpdate(order._id, {
      payment: paymentRecord._id,
      livraison: livraison._id,
    });

    await CartItem.deleteMany({ cart: cart._id });

    const completedOrder = await Order.findById(order._id)
      .populate({
        path: 'items',
        populate: { path: 'product' },
      })
      .populate('payment')
      .populate('address')
      .populate('livraison');

    res.status(200).json({
      data: {
        order: completedOrder,
        payment: paymentRecord,
        livraison,
      },
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: 'Payment failed' });
  }
};
