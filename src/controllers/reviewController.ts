import { Request, Response } from 'express';
import { Review, Product } from '../models';
import { User as UserType } from '../types';

export const create = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserType;
    const { product: productId, rating, comment } = req.body;

    if (!productId || rating === undefined || rating === null) {
      return res
        .status(400)
        .json({ message: 'product and rating are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = await Review.create({
      user: user._id,
      product: productId,
      rating: Number(rating),
      comment: comment ?? '',
    });

    const populated = await Review.findById(review._id).populate('user');

    res.status(201).json({ data: populated, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error creating review' });
  }
};

export const listByProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate('user', 'username email')
      .sort('-createdAt');

    res.status(200).json({ data: reviews, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};
