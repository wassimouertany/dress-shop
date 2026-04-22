import { Request, Response } from 'express';
import { Cart, CartItem } from '../models';
import { User as UserTypes } from '../types';

const itemsPopulate = {
  path: 'items',
  populate: { path: 'product' },
} as const;

export const index = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserTypes;
    const cart = await Cart.findOne({ user: user._id }).populate(itemsPopulate);

    res.status(200).json({ data: cart });
  } catch (error) {
    res.status(500).json({ message: 'Error in getting cart' });
  }
};

export const store = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserTypes;
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ user: user._id });

    if (cart) {
      if (user._id.toString() !== cart.user.toString()) {
        return res.status(405).json({
          message: 'You cannot perform this operation',
        });
      }
    } else {
      cart = await Cart.create({ user: user._id });
    }

    const cartItem = await CartItem.findOneAndUpdate(
      { cart: cart._id, product: productId },
      { $inc: { quantity } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('product');

    res.status(200).json({ data: cartItem });
  } catch (error) {
    res.status(500).json({ message: 'Error in creating cart' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserTypes;

    const { productId } = req.body;

    const cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart Item not found' });
    }

    await CartItem.deleteOne({ cart: cart._id, product: productId });

    const items = await CartItem.find({ cart: cart._id }).populate('product');

    res.status(200).json({ data: items });
  } catch (error) {
    res.status(500).json({ message: 'Error in removing cart' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserTypes;

    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart Item not found' });
    }

    if (user._id.toString() !== cart.user.toString()) {
      return res.status(405).json({
        message: 'You cannot perform this operation',
      });
    }

    const cartItem = await CartItem.findOneAndUpdate(
      { cart: cart._id, product: productId },
      { $set: { quantity } },
      { new: true }
    ).populate('product');

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart Item not found' });
    }

    return res.status(200).json({ data: cartItem });
  } catch (error) {
    res.status(500).json({ message: 'Error in getting product' });
  }
};
