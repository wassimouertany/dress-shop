import { Request, Response } from 'express';
import { AuthenticatedUser } from '../types';
import { Role } from '../types/Role';
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

  // PRE-1 / INV-4 - deja present
  if (msg.includes('already in')) {
    res.status(409).json({ message: error.message });
    return true;
  }
  if (msg.includes('not in')) {
    res.status(409).json({ message: error.message });
    return true;
  }

  // PRE-2 - rupture de stock
  if (msg.includes('pre-2') || msg.includes('out of stock')) {
    res.status(409).json({ message: error.message });
    return true;
  }
  // INV-5 - produit non disponible
  if (msg.includes('inv-5') || msg.includes('not available')) {
    res.status(409).json({ message: error.message });
    return true;
  }
  // Integrite - produit inexistant
  if (msg.includes('product not found')) {
    res.status(404).json({ message: error.message });
    return true;
  }

  return false;
};

export const index = async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser;
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
    const user = req.user as AuthenticatedUser;

    // INV-3 (cote controleur) - seul un Client peut detenir une wishlist.
    // Le validateur Mongoose dans Wishlist.ts est le filet, ce 403 est la
    // premiere ligne de defense (et evite un round-trip inutile en DB).
    if (user.role !== Role.Client) {
      res.status(403).json({ message: 'Only clients can have a wishlist' });
      return;
    }

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
    const user = req.user as AuthenticatedUser;
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
