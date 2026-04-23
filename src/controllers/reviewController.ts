import { Request, Response } from 'express';
import { IdentifiableUser } from '../types';
import { createReview, getReviewsByProduct } from '../services/reviewService';

const mapReviewError = (res: Response, error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  if (error.message === 'product and rating are required') {
    res.status(400).json({ message: error.message });
    return true;
  }

  if (error.message.toLowerCase().includes('not found')) {
    res.status(404).json({ message: error.message });
    return true;
  }

  return false;
};

export const create = async (req: Request, res: Response) => {
  try {
    const user = req.user as IdentifiableUser;
    const { product: productId, rating, comment } = req.body;
    const populated = await createReview(
      String(user._id),
      productId,
      rating,
      comment
    );
    res.status(201).json({ data: populated, success: true });
  } catch (error) {
    if (mapReviewError(res, error)) {
      return;
    }
    res.status(500).json({ message: 'Error creating review' });
  }
};

export const listByProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const reviews = await getReviewsByProduct(productId);
    res.status(200).json({ data: reviews, success: true });
  } catch (error) {
    if (mapReviewError(res, error)) {
      return;
    }
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};
