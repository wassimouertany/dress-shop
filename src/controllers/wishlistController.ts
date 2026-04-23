import { Request, Response } from 'express';
import { IdentifiableUser } from '../types';
import {
  getWishlistByUser,
  addToWishlist,
  removeFromWishlist,
} from '../services/wishlistService';

const mapWishlistError = (res: Response, error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  const msg = error.message.toLowerCase();
  if (msg.includes('already in')) {
    res.status(409).json({ message: error.message });
    return true;
  }
  if (msg.includes('not in')) {
    res.status(409).json({ message: error.message });
    return true;
  }

  return false;
};

export const index = async (req: Request, res: Response) => {
  try {
    const user = req.user as IdentifiableUser;
    const wishlist = await getWishlistByUser(String(user._id));
    res.status(200).json({ data: wishlist });
  } catch (error) {
    if (mapWishlistError(res, error)) {
      return;
    }
    res.status(500).json({ message: 'Error in getting wishlist' });
  }
};

export const store = async (req: Request, res: Response) => {
  try {
    const user = req.user as IdentifiableUser;
    const { productId } = req.body;
    const wishlist = await addToWishlist(String(user._id), productId);
    res.status(200).json({ data: wishlist });
  } catch (error) {
    if (mapWishlistError(res, error)) {
      return;
    }
    res.status(500).json({ message: 'Error in adding wishlist' });
  }
};

export const destroy = async (req: Request, res: Response) => {
  try {
    const user = req.user as IdentifiableUser;
    const { productId } = req.body;
    await removeFromWishlist(String(user._id), productId);
    res.status(200).json({ data: null });
  } catch (error) {
    if (mapWishlistError(res, error)) {
      return;
    }
    res.status(500).json({ message: 'Error in adding wishlist' });
  }
};
