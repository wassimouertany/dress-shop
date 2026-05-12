import { Types } from 'mongoose';
import { Review } from '../models';
import { IReviewRepository } from '../interfaces/IReviewRepository';

export class ReviewRepository implements IReviewRepository {
  async aggregateAverageRating(productId: string): Promise<{ avgRating: number; count: number } | null> {
    const result = await Review.aggregate([
      { $match: { product: new Types.ObjectId(productId) } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (!result || result.length === 0) {
      return null;
    }

    return {
      avgRating: result[0].avgRating,
      count: result[0].count,
    };
  }
}
