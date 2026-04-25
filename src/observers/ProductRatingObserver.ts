import { Review, Product } from '../models';
import { IReviewObserver, ReviewCreatedEvent } from './IReviewObserver';
import { Types } from 'mongoose'; 
/*================================================
 GoF Observer Pattern — Concrete Observer
 ===============================================*/
export class ProductRatingObserver implements IReviewObserver {
  async onReviewCreated(event: ReviewCreatedEvent): Promise<void> {
    const { productId } = event;

    // Aggregate all ratings for this product from the DB
    const result = await Review.aggregate([
      { $match: { product: new Types.ObjectId(productId) } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (!result.length) return;

    const { avgRating, count } = result[0];

    // Persist the computed average back on the Product document
    await Product.findByIdAndUpdate(productId, {
      avgRating: Math.round(avgRating * 10) / 10, 
      reviewCount: count,
    }).exec();
  }
}