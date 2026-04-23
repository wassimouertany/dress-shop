import { Request, Response } from 'express';
import { IdentifiableUser } from '../types';
import {
  getCartByUser,
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
} from '../services/cartService';

const respondServiceError = (res: Response, error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  if (error.message === 'Cart does not belong to this user') {
    res.status(405).json({ message: 'You cannot perform this operation' });
    return true;
  }

  if (
    error.message === 'Cart not found' ||
    error.message === 'Cart Item not found'
  ) {
    res.status(404).json({ message: 'Cart Item not found' });
    return true;
  }

  return false;
};

export const index = async (req: Request, res: Response) => {
  try {
    const user = req.user as IdentifiableUser;
    const cart = await getCartByUser(String(user._id));
    res.status(200).json({ data: cart });
  } catch (error) {
    if (respondServiceError(res, error)) {
      return;
    }
    res.status(500).json({ message: 'Error in getting cart' });
  }
};

export const store = async (req: Request, res: Response) => {
  try {
    const user = req.user as IdentifiableUser;
    const { productId, quantity } = req.body;
    const cartItem = await addItemToCart(
      String(user._id),
      productId,
      quantity
    );
    res.status(200).json({ data: cartItem });
  } catch (error) {
    if (respondServiceError(res, error)) {
      return;
    }
    res.status(500).json({ message: 'Error in creating cart' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const user = req.user as IdentifiableUser;
    const { productId } = req.body;
    const items = await removeItemFromCart(String(user._id), productId);
    res.status(200).json({ data: items });
  } catch (error) {
    if (respondServiceError(res, error)) {
      return;
    }
    res.status(500).json({ message: 'Error in removing cart' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const user = req.user as IdentifiableUser;
    const { productId, quantity } = req.body;
    const cartItem = await updateItemQuantity(
      String(user._id),
      productId,
      quantity
    );
    res.status(200).json({ data: cartItem });
  } catch (error) {
    if (respondServiceError(res, error)) {
      return;
    }
    res.status(500).json({ message: 'Error in getting product' });
  }
};
